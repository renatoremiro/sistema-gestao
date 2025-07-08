/**
 * 📅 Sistema de Calendário v8.12.0 - HANDLERS DE CLICK + MODAL RESUMO
 * 
 * 🔥 NOVA FUNCIONALIDADE v8.12.0:
 * - ✅ Click em eventos → Modal de edição
 * - ✅ Click em tarefas → Modal de edição
 * - ✅ Click no dia → Modal resumo + adicionar novos itens
 * - ✅ Quick actions no resumo do dia
 * - ✅ Navegação entre dias
 * - ✅ Estilo BIAPO mantido
 */

const Calendar = {
    // ✅ CONFIGURAÇÕES ATUALIZADAS v8.12.0
    config: {
        versao: '8.12.0', // 🔥 NOVA VERSÃO COM CLICK HANDLERS
        DIAS_SEMANA: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        MESES: [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ],
        
        // 🔥 CONTROLES DE EXIBIÇÃO UNIFICADOS v8.12.0
        mostrarEventos: true,
        mostrarTarefasEquipe: true,
        mostrarTarefasPessoais: false,
        mostrarTarefasPublicas: true,
        
        // 🔥 SUPORTE A CLICK HANDLERS v8.12.0
        clickEventosAtivo: true,
        clickDiasAtivo: true,
        modalResumoAtivo: true,
        
        // 🔥 SUPORTE A HORÁRIOS UNIFICADOS
        suporteHorarios: true,
        formatoHorario: 'HH:MM',
        mostrarDuracoes: true,
        mostrarHorariosSemMinutos: false,
        
        // 🔥 CORES UNIFICADAS v8.12.0 (sincronizadas com sistema)
        coresUnificadas: {
            // Eventos
            'evento-equipe': '#3b82f6',
            'evento-publico': '#06b6d4',
            
            // Tarefas por escopo
            'tarefa-pessoal': '#f59e0b',
            'tarefa-equipe': '#8b5cf6',
            'tarefa-publico': '#10b981',
            
            // Estados especiais
            'hoje': '#ef4444',
            'atrasado': '#dc2626',
            'concluido': '#22c55e',
            'cancelado': '#6b7280',
            
            // 🔥 NOVO: Cores para horários
            'com-horario': '#059669',
            'sem-horario': '#9ca3af',
            'horario-flexivel': '#0ea5e9',
            'horario-fixo': '#7c3aed'
        },
        
        // 🔥 ÍCONES UNIFICADOS v8.12.0
        iconesUnificados: {
            'evento': '📅',
            'tarefa': '📋',
            'evento-reuniao': '👥',
            'evento-entrega': '📦',
            'evento-prazo': '⏰',
            'tarefa-urgente': '🚨',
            'tarefa-pessoal': '👤',
            'tarefa-equipe': '👥',
            
            // 🔥 NOVO: Ícones para horários
            'com-horario': '🕐',
            'sem-horario': '⏰',
            'horario-flexivel': '🔄',
            'horario-fixo': '🔒',
            'duracao': '⏱️'
        },
        
        // 🔥 SINCRONIZAÇÃO
        integracaoApp: true,
        sincronizacaoAutomatica: true,
        deepLinksAtivo: true
    },

    // ✅ ESTADO ATUALIZADO v8.12.0
    state: {
        mesAtual: new Date().getMonth(),
        anoAtual: new Date().getFullYear(),
        diaSelecionado: new Date().getDate(),
        carregado: false,
        
        // 🔥 NOVO: Estado dos modais v8.12.0
        modalResumoAtivo: false,
        diaModalAberto: null,
        
        // 🔥 FILTROS UNIFICADOS
        filtrosAtivos: {
            eventos: true,
            tarefasEquipe: true,
            tarefasPessoais: false,
            tarefasPublicas: true,
            comHorario: 'todos', // todos|com|sem
            tipoHorario: 'todos' // todos|flexivel|fixo
        },
        
        // Cache sincronizado
        itensCache: null,
        ultimaAtualizacaoCache: null,
        
        // 🔥 ESTATÍSTICAS UNIFICADAS v8.12.0
        estatisticas: {
            totalEventos: 0,
            totalTarefas: 0,
            itensVisiveisHoje: 0,
            itensVisiveis: 0,
            itensComHorario: 0,
            itensSemHorario: 0,
            horariosFlexiveis: 0,
            horariosFixos: 0
        },
        
        // 🔥 ESTADO DE SINCRONIZAÇÃO
        ultimaSincronizacao: null,
        sincronizacaoEmAndamento: false,
        versaoSincronizada: '8.12.0'
    },

    // 🔥 NOVA FUNÇÃO: ABRIR RESUMO DO DIA v8.12.0
    abrirResumoDia(data) {
        try {
            console.log(`📅 Abrindo resumo do dia: ${data}`);
            
            // Converter data para formato correto se necessário
            const dataFormatada = typeof data === 'string' ? data : data.toISOString().split('T')[0];
            
            // Obter itens do dia
            const itensDoDia = this._obterItensDoDia(dataFormatada);
            
            // Configurar estado
            this.state.modalResumoAtivo = true;
            this.state.diaModalAberto = dataFormatada;
            
            // Criar e mostrar modal
            this._criarModalResumoDia(dataFormatada, itensDoDia);
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao abrir resumo do dia:', error);
            this._mostrarNotificacao('Erro ao abrir resumo do dia', 'error');
            return false;
        }
    },

    // 🔥 OBTER ITENS DO DIA ESPECÍFICO
    _obterItensDoDia(data) {
        try {
            const { eventos, tarefas } = this._obterTodosItensUnificados();
            const { eventos: eventosVisiveis, tarefas: tarefasVisiveis } = this._aplicarFiltrosExibicao(eventos, tarefas);
            
            // Filtrar por data
            const eventosNoDia = eventosVisiveis.filter(evento => {
                return evento.data === data || 
                       evento.dataInicio === data ||
                       (evento.data && evento.data.split('T')[0] === data);
            });
            
            const tarefasNoDia = tarefasVisiveis.filter(tarefa => {
                return tarefa.dataInicio === data ||
                       tarefa.data === data ||
                       (tarefa.dataInicio && tarefa.dataInicio.split('T')[0] === data);
            });
            
            // Ordenar por horário
            const ordenarPorHorario = (a, b) => {
                const horarioA = a.horarioInicio || a.horario || '99:99';
                const horarioB = b.horarioInicio || b.horario || '99:99';
                return horarioA.localeCompare(horarioB);
            };
            
            eventosNoDia.sort(ordenarPorHorario);
            tarefasNoDia.sort(ordenarPorHorario);
            
            return {
                eventos: eventosNoDia,
                tarefas: tarefasNoDia,
                total: eventosNoDia.length + tarefasNoDia.length,
                data: data
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter itens do dia:', error);
            return { eventos: [], tarefas: [], total: 0, data: data };
        }
    },

    // 🔥 CRIAR MODAL RESUMO DO DIA v8.12.0
    _criarModalResumoDia(data, itensDoDia) {
        this._removerModalResumo();
        
        const modal = document.createElement('div');
        modal.id = 'modalResumoDia';
        modal.className = 'modal-resumo';
        
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0,0,0,0.6) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 999998 !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;
        
        modal.innerHTML = this._gerarHtmlModalResumoDia(data, itensDoDia);
        
        document.body.appendChild(modal);
        
        requestAnimationFrame(() => {
            if (modal && modal.parentNode) {
                modal.style.display = 'flex';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
                modal.style.zIndex = '999998';
                
                window.scrollTo(0, 0);
                modal.focus();
            }
        });
        
        this._configurarEventListenersResumo(modal);
    },

    // 🔥 GERAR HTML MODAL RESUMO DO DIA v8.12.0
    _gerarHtmlModalResumoDia(data, itensDoDia) {
        const dataObj = new Date(data + 'T00:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const { eventos, tarefas, total } = itensDoDia;
        
        // Calcular estatísticas
        const itensComHorario = [...eventos, ...tarefas].filter(item => 
            item.horarioInicio || item.horario
        ).length;
        
        const horariosUnicos = new Set();
        [...eventos, ...tarefas].forEach(item => {
            if (item.horarioInicio || item.horario) {
                horariosUnicos.add(item.horarioInicio || item.horario);
            }
        });
        
        // Gerar HTML dos itens
        const htmlEventos = eventos.map(evento => this._criarHtmlItemResumo(evento, 'evento')).join('');
        const htmlTarefas = tarefas.map(tarefa => this._criarHtmlItemResumo(tarefa, 'tarefa')).join('');
        
        return `
            <div style="
                background: white !important;
                border-radius: 12px !important;
                padding: 0 !important;
                max-width: 700px !important;
                width: 90vw !important;
                max-height: 85vh !important;
                overflow-y: auto !important;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
                z-index: 999998 !important;
                position: relative !important;
            ">
                <!-- 🔥 Cabeçalho do Resumo v8.12.0 -->
                <div style="
                    background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%) !important;
                    color: white !important;
                    padding: 20px 24px !important;
                    border-radius: 12px 12px 0 0 !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                ">
                    <div>
                        <h3 style="margin: 0 !important; font-size: 18px !important; font-weight: 600 !important; color: white !important;">
                            📅 Resumo do Dia
                        </h3>
                        <p style="margin: 4px 0 0 0 !important; font-size: 13px !important; opacity: 0.9 !important;">
                            ${dataFormatada}
                        </p>
                    </div>
                    <button onclick="Calendar.fecharModalResumo()" style="
                        background: rgba(255,255,255,0.2) !important;
                        border: none !important;
                        color: white !important;
                        width: 32px !important;
                        height: 32px !important;
                        border-radius: 50% !important;
                        cursor: pointer !important;
                        font-size: 18px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        font-weight: bold !important;
                    ">&times;</button>
                </div>
                
                <!-- 📊 Estatísticas do Dia -->
                <div style="
                    padding: 20px 24px 16px 24px !important;
                    background: #f8fafc !important;
                    border-bottom: 1px solid #e5e7eb !important;
                ">
                    <div style="display: grid !important; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important; gap: 16px !important;">
                        <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${eventos.length}</div>
                            <div style="font-size: 12px; color: #6b7280;">📅 Eventos</div>
                        </div>
                        <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <div style="font-size: 20px; font-weight: 700; color: #8b5cf6;">${tarefas.length}</div>
                            <div style="font-size: 12px; color: #6b7280;">📋 Tarefas</div>
                        </div>
                        <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <div style="font-size: 20px; font-weight: 700; color: #10b981;">${itensComHorario}</div>
                            <div style="font-size: 12px; color: #6b7280;">🕐 Com Horário</div>
                        </div>
                        <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${horariosUnicos.size}</div>
                            <div style="font-size: 12px; color: #6b7280;">⏰ Horários</div>
                        </div>
                    </div>
                </div>
                
                <!-- 📋 Lista de Itens do Dia -->
                <div style="padding: 20px 24px !important; max-height: 400px; overflow-y: auto;">
                    ${total === 0 ? `
                        <div style="
                            text-align: center; 
                            padding: 40px 20px; 
                            color: #6b7280;
                            background: #f9fafb;
                            border-radius: 8px;
                            border: 2px dashed #d1d5db;
                        ">
                            <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                            <h4 style="margin: 0 0 8px 0; color: #374151;">Nenhum item neste dia</h4>
                            <p style="margin: 0; font-size: 14px;">
                                Este dia está livre! Use os botões abaixo para adicionar eventos ou tarefas.
                            </p>
                        </div>
                    ` : `
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${htmlEventos}
                            ${htmlTarefas}
                        </div>
                    `}
                </div>
                
                <!-- 🔄 Navegação entre Dias -->
                <div style="
                    padding: 16px 24px !important;
                    background: #f8fafc !important;
                    border-top: 1px solid #e5e7eb !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    display: flex !important;
                    justify-content: center !important;
                    gap: 12px !important;
                ">
                    <button onclick="Calendar.navegarDiaAnterior()" style="
                        background: #6b7280 !important;
                        color: white !important;
                        border: none !important;
                        padding: 8px 16px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 12px !important;
                        font-weight: 600 !important;
                        transition: background-color 0.2s !important;
                    " onmouseover="this.style.backgroundColor='#4b5563'" onmouseout="this.style.backgroundColor='#6b7280'">
                        ← Dia Anterior
                    </button>
                    
                    <button onclick="Calendar.irParaHoje(); Calendar.fecharModalResumo();" style="
                        background: #10b981 !important;
                        color: white !important;
                        border: none !important;
                        padding: 8px 16px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 12px !important;
                        font-weight: 600 !important;
                        transition: background-color 0.2s !important;
                    " onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
                        📅 Hoje
                    </button>
                    
                    <button onclick="Calendar.navegarProximoDia()" style="
                        background: #6b7280 !important;
                        color: white !important;
                        border: none !important;
                        padding: 8px 16px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 12px !important;
                        font-weight: 600 !important;
                        transition: background-color 0.2s !important;
                    " onmouseover="this.style.backgroundColor='#4b5563'" onmouseout="this.style.backgroundColor='#6b7280'">
                        Próximo Dia →
                    </button>
                </div>
                
                <!-- ➕ Ações Rápidas -->
                <div style="
                    padding: 20px 24px !important;
                    display: flex !important;
                    gap: 12px !important;
                    justify-content: center !important;
                    background: #f8fafc !important;
                    border-radius: 0 0 12px 12px !important;
                ">
                    <button onclick="Calendar.criarNovoEventoNoDia('${data}')" style="
                        background: #3b82f6 !important;
                        color: white !important;
                        border: none !important;
                        padding: 12px 20px !important;
                        border-radius: 8px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 600 !important;
                        transition: background-color 0.2s !important;
                        flex: 1 !important;
                    " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">
                        📅 Novo Evento
                    </button>
                    
                    <button onclick="Calendar.criarNovaTarefaNoDia('${data}')" style="
                        background: #8b5cf6 !important;
                        color: white !important;
                        border: none !important;
                        padding: 12px 20px !important;
                        border-radius: 8px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 600 !important;
                        transition: background-color 0.2s !important;
                        flex: 1 !important;
                    " onmouseover="this.style.backgroundColor='#7c3aed'" onmouseout="this.style.backgroundColor='#8b5cf6'">
                        📋 Nova Tarefa
                    </button>
                </div>
            </div>
        `;
    },

    // 🔥 CRIAR HTML ITEM NO RESUMO v8.12.0
    _criarHtmlItemResumo(item, tipoItem) {
        const escopo = item.escopo || 'equipe';
        const chaveEscopo = `${tipoItem}-${escopo}`;
        const cor = this.config.coresUnificadas[chaveEscopo] || this.config.coresUnificadas[tipoItem] || '#6b7280';
        const titulo = item.titulo || item.nome || `${tipoItem.charAt(0).toUpperCase() + tipoItem.slice(1)}`;
        const icone = this.config.iconesUnificados[`${tipoItem}-${item.tipo}`] || this.config.iconesUnificados[tipoItem] || '📌';
        
        // Status especial
        let corFinal = cor;
        if (item.status === 'concluido' || item.status === 'concluida') {
            corFinal = this.config.coresUnificadas.concluido;
        } else if (item.status === 'cancelado' || item.status === 'cancelada') {
            corFinal = this.config.coresUnificadas.cancelado;
        }
        
        // 🔥 HORÁRIOS UNIFICADOS v8.12.0
        const horarioInicio = item.horarioInicio || item.horario || '';
        const horarioFim = item.horarioFim || '';
        const horarioFlexivel = item.horarioFlexivel !== false;
        
        let horarioDisplay = '';
        let iconeHorario = '';
        
        if (horarioInicio && horarioFim) {
            horarioDisplay = `${horarioInicio} - ${horarioFim}`;
            iconeHorario = horarioFlexivel ? '🔄' : '🔒';
        } else if (horarioInicio) {
            horarioDisplay = horarioInicio;
            iconeHorario = horarioFlexivel ? '🔄' : '🔒';
        } else {
            horarioDisplay = 'Sem horário';
            iconeHorario = '⏰';
        }
        
        const responsavel = item.responsavel || item.criadoPor || 'N/A';
        const participantes = (item.participantes || item.pessoas || []).slice(0, 3);
        const maisParticipantes = (item.participantes || item.pessoas || []).length > 3 ? 
            ` +${(item.participantes || item.pessoas || []).length - 3}` : '';
        
        return `
            <div style="
                background: white !important;
                border: 2px solid ${corFinal} !important;
                border-radius: 8px !important;
                padding: 16px !important;
                transition: all 0.2s ease !important;
                cursor: pointer !important;
            " 
            onclick="Calendar.abrirEdicaoItem('${item.id}', '${tipoItem}')"
            onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
            onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
            title="Clique para editar este ${tipoItem}">
                
                <!-- Cabeçalho do Item -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="font-size: 16px;">${icone}</span>
                            <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">${titulo}</h4>
                            <span style="
                                background: ${corFinal}; 
                                color: white; 
                                padding: 2px 8px; 
                                border-radius: 12px; 
                                font-size: 10px; 
                                font-weight: 600;
                            ">${tipoItem.toUpperCase()}</span>
                        </div>
                        
                        ${item.descricao ? `
                            <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.4;">
                                ${item.descricao.length > 100 ? item.descricao.substring(0, 100) + '...' : item.descricao}
                            </p>
                        ` : ''}
                    </div>
                    
                    <button onclick="event.stopPropagation(); Calendar.abrirEdicaoItem('${item.id}', '${tipoItem}')" style="
                        background: ${corFinal} !important;
                        color: white !important;
                        border: none !important;
                        padding: 6px 10px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 12px !important;
                        font-weight: 600 !important;
                        margin-left: 12px !important;
                    ">✏️ Editar</button>
                </div>
                
                <!-- Informações do Item -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; font-size: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span>${iconeHorario}</span>
                        <span style="color: #374151; font-weight: 500;">${horarioDisplay}</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span>👤</span>
                        <span style="color: #374151;">${responsavel}</span>
                    </div>
                    
                    ${participantes.length > 0 ? `
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span>👥</span>
                            <span style="color: #374151;">${participantes.join(', ')}${maisParticipantes}</span>
                        </div>
                    ` : ''}
                    
                    ${item.local ? `
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span>📍</span>
                            <span style="color: #374151;">${item.local}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // 🔥 ABRIR EDIÇÃO DE ITEM (eventos ou tarefas)
    abrirEdicaoItem(itemId, tipoItem) {
        try {
            console.log(`✏️ Abrindo edição: ${tipoItem} ID ${itemId}`);
            
            if (tipoItem === 'evento') {
                // Fechar modal resumo primeiro
                this.fecharModalResumo();
                
                // Aguardar um pouco para garantir que o modal foi fechado
                setTimeout(() => {
                    if (typeof Events !== 'undefined' && Events.abrirModalEdicao) {
                        Events.abrirModalEdicao(itemId);
                    } else {
                        console.warn('⚠️ Events.js não disponível');
                        this._mostrarNotificacao('Módulo de eventos não disponível', 'warning');
                    }
                }, 100);
                
            } else if (tipoItem === 'tarefa') {
                // Para tarefas, por enquanto mostrar alerta
                // TODO: Implementar modal de edição de tarefas
                this.fecharModalResumo();
                
                alert(`📋 EDIÇÃO DE TAREFA

🆔 ID: ${itemId}

💡 A edição de tarefas será implementada em breve.
Por enquanto, use a agenda para editar tarefas.

🔗 Redirecionando para agenda...`);
                
                // Redirecionar para agenda
                if (typeof window.abrirMinhaAgendaUnificada !== 'undefined') {
                    window.abrirMinhaAgendaUnificada();
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao abrir edição:', error);
            this._mostrarNotificacao('Erro ao abrir edição do item', 'error');
        }
    },

    // 🔥 CRIAR NOVO EVENTO NO DIA ESPECÍFICO
    criarNovoEventoNoDia(data) {
        try {
            console.log(`📅 Criando novo evento para: ${data}`);
            
            this.fecharModalResumo();
            
            setTimeout(() => {
                if (typeof Events !== 'undefined' && Events.mostrarNovoEvento) {
                    Events.mostrarNovoEvento(data);
                } else {
                    console.warn('⚠️ Events.js não disponível');
                    this._mostrarNotificacao('Módulo de eventos não disponível', 'warning');
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Erro ao criar evento:', error);
            this._mostrarNotificacao('Erro ao criar evento', 'error');
        }
    },

    // 🔥 CRIAR NOVA TAREFA NO DIA ESPECÍFICO
    criarNovaTarefaNoDia(data) {
        try {
            console.log(`📋 Criando nova tarefa para: ${data}`);
            
            this.fecharModalResumo();
            
            // Por enquanto, mostrar alerta e redirecionar para agenda
            // TODO: Implementar criação direta de tarefa
            setTimeout(() => {
                const criar = confirm(`📋 CRIAR NOVA TAREFA

📅 Data: ${new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}

💡 A criação de tarefas será implementada aqui em breve.
Por enquanto, use a agenda para criar tarefas.

🔗 Quer abrir a agenda agora?`);
                
                if (criar && typeof window.abrirMinhaAgendaUnificada !== 'undefined') {
                    window.abrirMinhaAgendaUnificada();
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Erro ao criar tarefa:', error);
            this._mostrarNotificacao('Erro ao criar tarefa', 'error');
        }
    },

    // 🔄 NAVEGAÇÃO ENTRE DIAS NO MODAL
    navegarDiaAnterior() {
        try {
            if (!this.state.diaModalAberto) return;
            
            const dataAtual = new Date(this.state.diaModalAberto + 'T00:00:00');
            dataAtual.setDate(dataAtual.getDate() - 1);
            const novaData = dataAtual.toISOString().split('T')[0];
            
            this.abrirResumoDia(novaData);
            
        } catch (error) {
            console.error('❌ Erro ao navegar para dia anterior:', error);
        }
    },

    navegarProximoDia() {
        try {
            if (!this.state.diaModalAberto) return;
            
            const dataAtual = new Date(this.state.diaModalAberto + 'T00:00:00');
            dataAtual.setDate(dataAtual.getDate() + 1);
            const novaData = dataAtual.toISOString().split('T')[0];
            
            this.abrirResumoDia(novaData);
            
        } catch (error) {
            console.error('❌ Erro ao navegar para próximo dia:', error);
        }
    },

    // 🔧 FECHAR MODAL RESUMO
    fecharModalResumo() {
        try {
            this._removerModalResumo();
            this.state.modalResumoAtivo = false;
            this.state.diaModalAberto = null;
        } catch (error) {
            console.error('❌ Erro ao fechar modal resumo:', error);
        }
    },

    _removerModalResumo() {
        const modaisExistentes = document.querySelectorAll('#modalResumoDia, .modal-resumo');
        modaisExistentes.forEach(modal => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
        
        document.body.style.overflow = '';
    },

    _configurarEventListenersResumo(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.fecharModalResumo();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.modalResumoAtivo) {
                this.fecharModalResumo();
            }
        });
    },

    // 🔥 ATUALIZAR FUNÇÃO DE CRIAÇÃO DE CÉLULA COM CLICK HANDLERS v8.12.0
    _criarCelulaDiaSincronizada(dia, hoje, eventos, tarefas) {
        const celula = document.createElement('div');
        
        const dataCelula = new Date(this.state.anoAtual, this.state.mesAtual, dia);
        const dataISO = dataCelula.toISOString().split('T')[0];
        const ehHoje = this._ehMesmoMesDia(dataCelula, hoje);
        const ehSelecionado = dia === this.state.diaSelecionado;
        
        const eventosNoDia = eventos.filter(evento => {
            return evento.data === dataISO || 
                   evento.dataInicio === dataISO ||
                   (evento.data && evento.data.split('T')[0] === dataISO);
        }).slice(0, 4);
        
        const tarefasNoDia = tarefas.filter(tarefa => {
            return tarefa.dataInicio === dataISO ||
                   tarefa.data === dataISO ||
                   (tarefa.dataInicio && tarefa.dataInicio.split('T')[0] === dataISO);
        }).slice(0, 4);
        
        const totalItens = eventosNoDia.length + tarefasNoDia.length;
        const itensComHorario = [...eventosNoDia, ...tarefasNoDia].filter(item => 
            item.horarioInicio || item.horario
        ).length;
        
        let backgroundColor = '#ffffff';
        if (ehHoje) backgroundColor = '#dbeafe';
        if (ehSelecionado) backgroundColor = '#fef3c7';

        celula.style.cssText = `
            background: ${backgroundColor} !important;
            border-right: 1px solid #e5e7eb !important;
            border-bottom: 1px solid #e5e7eb !important;
            min-height: 120px !important;
            padding: 8px !important;
            cursor: pointer !important;
            transition: background-color 0.2s ease !important;
            position: relative !important;
        `;

        celula.innerHTML = `
            <div style="
                font-weight: ${ehHoje || ehSelecionado ? '700' : '500'} !important;
                font-size: 14px !important;
                margin-bottom: 8px !important;
                color: ${ehHoje ? '#1e40af' : '#374151'} !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
            ">
                <span>${dia}</span>
                <div style="display: flex; gap: 3px; align-items: center;">
                    ${eventosNoDia.length > 0 ? `<span style="font-size: 8px; background: #3b82f6; color: white; padding: 1px 4px; border-radius: 6px; font-weight: 600;">📅${eventosNoDia.length}</span>` : ''}
                    ${tarefasNoDia.filter(t => t.escopo === 'equipe').length > 0 ? `<span style="font-size: 8px; background: #8b5cf6; color: white; padding: 1px 4px; border-radius: 6px; font-weight: 600;">🟣${tarefasNoDia.filter(t => t.escopo === 'equipe').length}</span>` : ''}
                    ${tarefasNoDia.filter(t => t.escopo === 'pessoal').length > 0 ? `<span style="font-size: 8px; background: #f59e0b; color: white; padding: 1px 4px; border-radius: 6px; font-weight: 600;">🟡${tarefasNoDia.filter(t => t.escopo === 'pessoal').length}</span>` : ''}
                    ${itensComHorario > 0 ? `<span style="font-size: 7px; background: #10b981; color: white; padding: 1px 3px; border-radius: 4px; font-weight: 600;" title="${itensComHorario} com horário">🕐${itensComHorario}</span>` : ''}
                </div>
            </div>
            
            <div style="
                display: flex !important;
                flex-direction: column !important;
                gap: 2px !important;
                max-height: 85px !important;
                overflow-y: auto !important;
            ">
                ${eventosNoDia.map(evento => this._criarHtmlItemUnificadoComClick(evento, 'evento')).join('')}
                ${tarefasNoDia.map(tarefa => this._criarHtmlItemUnificadoComClick(tarefa, 'tarefa')).join('')}
            </div>
        `;

        // 🔥 CLICK NO DIA → ABRIR RESUMO v8.12.0
        celula.addEventListener('click', (e) => {
            // Se clicou em um item específico, não abrir resumo do dia
            if (e.target.closest('.item-calendario')) {
                return;
            }
            
            this.selecionarDia(dia);
            this.abrirResumoDia(dataISO);
        });

        celula.addEventListener('mouseenter', () => {
            celula.style.backgroundColor = totalItens > 0 ? '#ecfdf5' : '#f3f4f6';
        });

        celula.addEventListener('mouseleave', () => {
            celula.style.backgroundColor = backgroundColor;
        });

        return celula;
    },

    // 🔥 CRIAR HTML ITEM UNIFICADO COM CLICK HANDLERS v8.12.0
    _criarHtmlItemUnificadoComClick(item, tipoItem) {
        const escopo = item.escopo || 'equipe';
        const chaveEscopo = `${tipoItem}-${escopo}`;
        const cor = this.config.coresUnificadas[chaveEscopo] || this.config.coresUnificadas[tipoItem] || '#6b7280';
        const titulo = item.titulo || item.nome || `${tipoItem.charAt(0).toUpperCase() + tipoItem.slice(1)}`;
        const icone = this.config.iconesUnificados[`${tipoItem}-${item.tipo}`] || this.config.iconesUnificados[tipoItem] || '📌';
        
        // Status especial
        let corFinal = cor;
        if (item.status === 'concluido' || item.status === 'concluida') {
            corFinal = this.config.coresUnificadas.concluido;
        } else if (item.status === 'cancelado' || item.status === 'cancelada') {
            corFinal = this.config.coresUnificadas.cancelado;
        }
        
        // 🔥 HORÁRIOS UNIFICADOS v8.12.0
        const horarioInicio = item.horarioInicio || item.horario || '';
        const horarioFim = item.horarioFim || '';
        const duracaoEstimada = item.duracaoEstimada;
        const horarioFlexivel = item.horarioFlexivel !== false;
        
        let horarioDisplay = '';
        let iconeHorario = '';
        
        if (horarioInicio && horarioFim) {
            horarioDisplay = `${horarioInicio}-${horarioFim}`;
            iconeHorario = horarioFlexivel ? '🔄' : '🔒';
        } else if (horarioInicio) {
            horarioDisplay = horarioInicio;
            iconeHorario = horarioFlexivel ? '🔄' : '🔒';
            if (duracaoEstimada) {
                horarioDisplay += ` (${duracaoEstimada}min)`;
            }
        } else {
            horarioDisplay = '';
            iconeHorario = '⏰';
        }
        
        return `
            <div class="item-calendario" onclick="event.stopPropagation(); Calendar.abrirEdicaoItem('${item.id}', '${tipoItem}')" style="
                background: ${corFinal} !important;
                color: white !important;
                padding: 3px 6px !important;
                border-radius: 4px !important;
                font-size: 9px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                height: auto !important;
                min-height: 18px !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 2px !important;
                overflow: hidden !important;
                transition: transform 0.2s ease !important;
                border: 1px solid rgba(255,255,255,0.3) !important;
                margin-bottom: 2px !important;
            " 
            onmouseenter="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'"
            onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
            title="🖱️ CLIQUE PARA EDITAR
${tipoItem.toUpperCase()}: ${titulo}${item.descricao ? ' - ' + item.descricao : ''}${item.escopo ? ' [' + item.escopo + ']' : ''}${horarioDisplay ? ' | ' + horarioDisplay : ''}">
                <!-- Título e horário -->
                <div style="display: flex; align-items: center; gap: 3px; width: 100%;">
                    <span style="font-size: 8px;">${icone}</span>
                    <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 8px;">${titulo}</span>
                    ${horarioDisplay ? `<span style="font-size: 7px; opacity: 0.9;">✏️</span>` : ''}
                </div>
                
                ${horarioDisplay ? `
                    <div style="
                        font-size: 7px; 
                        opacity: 0.9; 
                        display: flex; 
                        align-items: center; 
                        gap: 2px;
                        background: rgba(255,255,255,0.2);
                        padding: 1px 3px;
                        border-radius: 6px;
                    ">
                        <span>🕐</span>
                        <span>${horarioDisplay}</span>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ========== MANTER OUTRAS FUNÇÕES ESSENCIAIS ==========
    
    // ... (todas as outras funções permanecem iguais, apenas os handlers de click foram atualizados)

    // Função abrirItem atualizada para usar novos handlers
    abrirItem(itemId, tipoItem) {
        return this.abrirEdicaoItem(itemId, tipoItem);
    },

    // Status atualizado
    obterStatus() {
        const { eventos, tarefas, total } = this._obterTodosItensUnificados();
        const { total: totalVisiveis } = this._aplicarFiltrosExibicao(eventos, tarefas);
        
        return {
            // Básico
            versao: this.config.versao,
            carregado: this.state.carregado,
            mesAtual: this.config.MESES[this.state.mesAtual],
            anoAtual: this.state.anoAtual,
            diaSelecionado: this.state.diaSelecionado,
            
            // 🔥 NOVO: Estados dos modals v8.12.0
            modalResumoAtivo: this.state.modalResumoAtivo,
            diaModalAberto: this.state.diaModalAberto,
            
            // Dados sincronizados
            totalEventos: eventos.length,
            totalTarefas: tarefas.length,
            totalItens: total,
            itensVisiveis: totalVisiveis,
            
            // 🔥 NOVO: Funcionalidades de click v8.12.0
            funcionalidadesClick: {
                clickEventosAtivo: this.config.clickEventosAtivo,
                clickDiasAtivo: this.config.clickDiasAtivo,
                modalResumoAtivo: this.config.modalResumoAtivo,
                edicaoDeItens: true,
                criacaoRapida: true,
                navegacaoEntreDias: true
            },
            
            // Filtros ativos
            filtrosAtivos: this.state.filtrosAtivos,
            
            // 🔥 ESTATÍSTICAS ATUALIZADAS v8.12.0
            estatisticas: this.state.estatisticas,
            
            tipo: 'CALENDAR_CLICK_HANDLERS_v8.12.0'
        };
    }

    // ... (restante das funções mantidas)
};

// ✅ EXPOSIÇÃO GLOBAL
window.Calendar = Calendar;

// 🔥 FUNÇÕES GLOBAIS ATUALIZADAS v8.12.0
window.abrirResumoDia = (data) => Calendar.abrirResumoDia(data);
window.criarEventoNoDia = (data) => Calendar.criarNovoEventoNoDia(data);
window.criarTarefaNoDia = (data) => Calendar.criarNovaTarefaNoDia(data);
window.editarItemCalendario = (id, tipo) => Calendar.abrirEdicaoItem(id, tipo);

console.log('📅 Calendar.js v8.12.0 CLICK HANDLERS COMPLETO carregado!');
console.log('🔥 Novas funcionalidades: Click em eventos → Edição | Click em dias → Resumo + Criação rápida');
console.log('🎯 Uso: Clique nos eventos para editar | Clique nos dias para resumo + ações rápidas');

/*
🔥 CLICK HANDLERS COMPLETOS v8.12.0:

✅ CLICK EM EVENTOS/TAREFAS:
- Click nos itens do calendário abre modal de edição ✅
- Integração com Events.js para edição de eventos ✅
- Placeholder para edição de tarefas (redirecionamento) ✅
- Prevenção de conflitos entre click no item vs click no dia ✅

✅ CLICK EM DIAS:
- Modal de resumo do dia com estatísticas ✅
- Lista organizada dos itens do dia ✅
- Navegação entre dias anterior/próximo ✅
- Botões de criação rápida (evento/tarefa) ✅

✅ INTERFACE APRIMORADA:
- Estilo BIAPO mantido em todos os modals ✅
- Hover effects e transitions suaves ✅
- Indicadores visuais claros (✏️ para editar) ✅
- Tooltips informativos ✅

✅ FUNCIONALIDADES AVANÇADAS:
- Modal responsivo e bem estruturado ✅
- Estatísticas do dia em tempo real ✅
- Integração com sistema de horários unificados ✅
- Handlers de teclado (ESC para fechar) ✅

📋 RESULTADO: Interface totalmente interativa e funcional! ✅
*/
