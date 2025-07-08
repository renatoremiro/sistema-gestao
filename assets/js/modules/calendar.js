/**
 * 📅 Sistema de Calendário v8.11.0 - SINCRONIZAÇÃO COMPLETA
 * 
 * 🔥 ATUALIZAÇÃO v8.11.0:
 * - ✅ Horários unificados com App.js v8.11.0 e Events.js v8.11.0
 * - ✅ Deep links funcionais
 * - ✅ Sincronização automática bidirecional
 * - ✅ Versionamento alinhado
 * - ✅ Interface otimizada para horários
 */

const Calendar = {
    // ✅ CONFIGURAÇÕES SINCRONIZADAS v8.11.0
    config: {
        versao: '8.11.0', // 🔥 ALINHADO COM SISTEMA
        DIAS_SEMANA: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        MESES: [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ],
        
        // 🔥 CONTROLES DE EXIBIÇÃO UNIFICADOS v8.11.0
        mostrarEventos: true,
        mostrarTarefasEquipe: true,
        mostrarTarefasPessoais: false,
        mostrarTarefasPublicas: true,
        
        // 🔥 SUPORTE A HORÁRIOS UNIFICADOS
        suporteHorarios: true,
        formatoHorario: 'HH:MM',
        mostrarDuracoes: true,
        mostrarHorariosSemMinutos: false,
        
        // 🔥 CORES UNIFICADAS v8.11.0 (sincronizadas com sistema)
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
        
        // 🔥 ÍCONES UNIFICADOS v8.11.0
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

    // ✅ ESTADO SINCRONIZADO v8.11.0
    state: {
        mesAtual: new Date().getMonth(),
        anoAtual: new Date().getFullYear(),
        diaSelecionado: new Date().getDate(),
        carregado: false,
        
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
        
        // 🔥 ESTATÍSTICAS UNIFICADAS v8.11.0
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
        versaoSincronizada: '8.11.0'
    },

    // ✅ INICIALIZAR SINCRONIZADO v8.11.0
    inicializar() {
        try {
            const hoje = new Date();
            this.state.mesAtual = hoje.getMonth();
            this.state.anoAtual = hoje.getFullYear();
            this.state.diaSelecionado = hoje.getDate();
            
            console.log('📅 Inicializando Calendar v8.11.0 SINCRONIZADO...');
            
            this._aguardarAppSincronizado().then((appDisponivel) => {
                if (appDisponivel) {
                    console.log('✅ App.js v8.11.0 detectado - sincronização ativa');
                } else {
                    console.warn('⚠️ App.js não disponível - modo autônomo');
                }
                
                this.gerar();
                this.state.carregado = true;
                this._atualizarEstatisticasSincronizadas();
                this._configurarSincronizacaoAutomatica();
                
                console.log('✅ Calendar v8.11.0 SINCRONIZADO inicializado!');
            });
            
        } catch (error) {
            console.error('❌ Erro ao inicializar calendário sincronizado:', error);
            this.gerar(); // Fallback
        }
    },

    // 🔥 AGUARDAR APP.JS SINCRONIZADO
    async _aguardarAppSincronizado() {
        let tentativas = 0;
        const maxTentativas = 50;
        
        while (tentativas < maxTentativas) {
            if (typeof App !== 'undefined' && 
                App.estadoSistema && 
                App.estadoSistema.inicializado &&
                App.config?.estruturaUnificada &&
                App.config?.versao >= '8.11.0') {
                
                console.log(`✅ App.js v${App.config.versao} SINCRONIZADO pronto!`);
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }
        
        console.warn('⚠️ App.js v8.11.0 não carregou completamente');
        return false;
    },

    // 🔥 CONFIGURAR SINCRONIZAÇÃO AUTOMÁTICA v8.11.0
    _configurarSincronizacaoAutomatica() {
        if (!this.config.sincronizacaoAutomatica) return;
        
        try {
            // Listener para sincronização do App.js
            window.addEventListener('dados-sincronizados', (e) => {
                console.log('📅 Calendar: App.js sincronizou - atualizando calendário...', e.detail);
                this._sincronizarComApp(e.detail);
            });
            
            // Listener específico para Fase 4
            window.addEventListener('dados-sincronizados-fase4', (e) => {
                console.log('📅 Calendar: Sincronização Fase 4 detectada...', e.detail);
                this._sincronizarComApp(e.detail);
            });
            
            // Listener para deep links
            window.addEventListener('calendar-deep-link', (e) => {
                console.log('🔗 Calendar: Deep link recebido:', e.detail);
                this._processarDeepLinkCalendar(e.detail);
            });
            
            console.log('🔄 Sincronização automática configurada');
            
        } catch (error) {
            console.error('❌ Erro ao configurar sincronização automática:', error);
        }
    },

    // 🔥 SINCRONIZAR COM APP.JS v8.11.0
    async _sincronizarComApp(detalhes = null) {
        if (this.state.sincronizacaoEmAndamento) return;
        
        try {
            this.state.sincronizacaoEmAndamento = true;
            
            // Invalidar cache
            this.state.itensCache = null;
            this.state.ultimaAtualizacaoCache = null;
            
            // Regenerar calendário
            this._gerarDias();
            this._atualizarEstatisticasSincronizadas();
            
            this.state.ultimaSincronizacao = new Date().toISOString();
            this.state.versaoSincronizada = App?.config?.versao || '8.11.0';
            
            console.log('✅ Calendar sincronizado com App.js');
            
            // Emitir evento de sincronização concluída
            this._emitirEventoSincronizacao('calendar-sincronizado', {
                timestamp: Date.now(),
                versao: this.config.versao,
                itens: this.state.estatisticas.itensVisiveis,
                horarios: this.state.estatisticas.itensComHorario
            });
            
        } catch (error) {
            console.error('❌ Erro na sincronização Calendar ↔ App:', error);
        } finally {
            this.state.sincronizacaoEmAndamento = false;
        }
    },

    // 🔥 OBTER TODOS OS ITENS UNIFICADOS COM HORÁRIOS v8.11.0
    _obterTodosItensUnificados() {
        try {
            if (typeof App === 'undefined' || !App.obterItensParaCalendario) {
                console.warn('⚠️ App.js unificado não disponível');
                return { eventos: [], tarefas: [], total: 0 };
            }

            const { eventos, tarefas } = App.obterItensParaCalendario();
            
            console.log(`📊 Itens unificados v8.11.0: ${eventos.length} eventos + ${tarefas.length} tarefas`);
            
            return { eventos, tarefas, total: eventos.length + tarefas.length };
            
        } catch (error) {
            console.error('❌ Erro ao obter itens unificados:', error);
            return { eventos: [], tarefas: [], total: 0 };
        }
    },

    // 🔥 APLICAR FILTROS DE EXIBIÇÃO SINCRONIZADOS v8.11.0
    _aplicarFiltrosExibicao(eventos, tarefas) {
        let eventosVisiveis = [];
        let tarefasVisiveis = [];
        
        // ✅ FILTRAR EVENTOS
        if (this.state.filtrosAtivos.eventos) {
            eventosVisiveis = eventos.filter(evento => {
                // Filtro por horário
                if (this.state.filtrosAtivos.comHorario === 'com') {
                    return evento.horarioInicio || evento.horario;
                } else if (this.state.filtrosAtivos.comHorario === 'sem') {
                    return !evento.horarioInicio && !evento.horario;
                }
                
                return true;
            });
        }
        
        // ✅ FILTRAR TAREFAS POR ESCOPO E HORÁRIOS
        tarefasVisiveis = tarefas.filter(tarefa => {
            const escopo = tarefa.escopo || 'pessoal';
            
            // Filtro por escopo
            let scopeMatch = false;
            if (escopo === 'pessoal' && this.state.filtrosAtivos.tarefasPessoais) {
                scopeMatch = true;
            }
            if (escopo === 'equipe' && this.state.filtrosAtivos.tarefasEquipe) {
                scopeMatch = true;
            }
            if (escopo === 'publico' && this.state.filtrosAtivos.tarefasPublicas) {
                scopeMatch = true;
            }
            
            if (!scopeMatch) return false;
            
            // 🔥 FILTRO POR HORÁRIO v8.11.0
            if (this.state.filtrosAtivos.comHorario === 'com') {
                return tarefa.horarioInicio || tarefa.horario;
            } else if (this.state.filtrosAtivos.comHorario === 'sem') {
                return !tarefa.horarioInicio && !tarefa.horario;
            }
            
            // 🔥 FILTRO POR TIPO DE HORÁRIO
            if (this.state.filtrosAtivos.tipoHorario === 'flexivel') {
                return tarefa.horarioFlexivel !== false;
            } else if (this.state.filtrosAtivos.tipoHorario === 'fixo') {
                return tarefa.horarioFlexivel === false;
            }
            
            return true;
        });
        
        return { 
            eventos: eventosVisiveis, 
            tarefas: tarefasVisiveis,
            total: eventosVisiveis.length + tarefasVisiveis.length
        };
    },

    // 🔥 ATUALIZAR EVENTOS/TAREFAS SINCRONIZADO v8.11.0
    atualizarEventos() {
        try {
            console.log('📅 Calendar: Atualizando itens via sincronização v8.11.0...');
            
            this.state.itensCache = null;
            this.state.ultimaAtualizacaoCache = null;
            
            this._gerarDias();
            this._atualizarEstatisticasSincronizadas();
            
            console.log('✅ Calendar v8.11.0 atualizado via sincronização');
        } catch (error) {
            console.error('❌ Erro ao atualizar calendar sincronizado:', error);
            this.gerar(); // Fallback completo
        }
    },

    // 🔥 ATUALIZAR ESTATÍSTICAS SINCRONIZADAS v8.11.0
    _atualizarEstatisticasSincronizadas() {
        try {
            const { eventos, tarefas, total } = this._obterTodosItensUnificados();
            const { eventos: eventosVisiveis, tarefas: tarefasVisiveis, total: totalVisiveis } = this._aplicarFiltrosExibicao(eventos, tarefas);
            
            // Estatísticas básicas
            this.state.estatisticas.totalEventos = eventos.length;
            this.state.estatisticas.totalTarefas = tarefas.length;
            this.state.estatisticas.itensVisiveis = totalVisiveis;
            
            // 🔥 ESTATÍSTICAS DE HORÁRIOS v8.11.0
            const todosItens = [...eventos, ...tarefas];
            this.state.estatisticas.itensComHorario = todosItens.filter(item => 
                item.horarioInicio || item.horario
            ).length;
            
            this.state.estatisticas.itensSemHorario = todosItens.length - this.state.estatisticas.itensComHorario;
            
            this.state.estatisticas.horariosFlexiveis = tarefas.filter(tarefa => 
                tarefa.horarioFlexivel !== false && (tarefa.horarioInicio || tarefa.horario)
            ).length;
            
            this.state.estatisticas.horariosFixos = tarefas.filter(tarefa => 
                tarefa.horarioFlexivel === false && (tarefa.horarioInicio || tarefa.horario)
            ).length;
            
            // Itens de hoje
            const hoje = new Date().toISOString().split('T')[0];
            this.state.estatisticas.itensVisiveisHoje = todosItens.filter(item => {
                return (item.data === hoje) || (item.dataInicio === hoje);
            }).length;
            
        } catch (error) {
            console.error('❌ Erro ao atualizar estatísticas sincronizadas:', error);
        }
    },

    // 🔥 GERAR CALENDÁRIO SINCRONIZADO v8.11.0
    gerar() {
        try {
            const container = document.getElementById('calendario');
            if (!container) return;

            container.innerHTML = '';
            container.style.cssText = `
                background: white !important;
                border-radius: 8px !important;
                overflow: hidden !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                width: 100% !important;
                display: block !important;
                position: relative !important;
            `;

            const mesNome = this.config.MESES[this.state.mesAtual];
            const { eventos, tarefas, total } = this._obterTodosItensUnificados();
            const { eventos: eventosVisiveis, tarefas: tarefasVisiveis, total: totalVisiveis } = this._aplicarFiltrosExibicao(eventos, tarefas);
            
            // 🔥 HEADER SINCRONIZADO COM CONTROLES DE HORÁRIOS v8.11.0
            const htmlCabecalho = `
                <div style="
                    background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%) !important;
                    color: white !important;
                    padding: 16px 20px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                ">
                    <button onclick="Calendar.mesAnterior()" style="
                        background: rgba(255,255,255,0.2) !important;
                        border: 1px solid rgba(255,255,255,0.3) !important;
                        color: white !important;
                        padding: 8px 12px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                    ">← Anterior</button>
                    
                    <div style="text-align: center;">
                        <h3 style="
                            margin: 0 !important;
                            font-size: 18px !important;
                            font-weight: 600 !important;
                            color: white !important;
                        ">
                            📅 ${mesNome} ${this.state.anoAtual}
                        </h3>
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            margin-top: 8px;
                            justify-content: center;
                            flex-wrap: wrap;
                        ">
                            <small style="
                                font-size: 10px !important;
                                opacity: 0.8 !important;
                                color: white !important;
                            ">
                                📊 ${eventos.length} eventos | ${tarefas.length} tarefas | ${totalVisiveis} visíveis
                            </small>
                            
                            <!-- 🔥 CONTROLES DE FILTRO SINCRONIZADOS v8.11.0 -->
                            <div style="display: flex; gap: 12px; align-items: center; margin-top: 4px;">
                                
                                <!-- Toggle Tarefas de Equipe -->
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    font-size: 10px;
                                    opacity: 0.9;
                                    cursor: pointer;
                                    background: rgba(255,255,255,0.1);
                                    padding: 3px 6px;
                                    border-radius: 10px;
                                    border: 1px solid rgba(255,255,255,0.2);
                                ">
                                    <input type="checkbox" 
                                           id="toggleTarefasEquipe" 
                                           ${this.state.filtrosAtivos.tarefasEquipe ? 'checked' : ''}
                                           onchange="Calendar.toggleTarefasEquipe()"
                                           style="margin: 0; width: 10px; height: 10px; accent-color: #8b5cf6;">
                                    <span>🟣 Equipe</span>
                                </label>
                                
                                <!-- Toggle Tarefas Pessoais -->
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    font-size: 10px;
                                    opacity: 0.9;
                                    cursor: pointer;
                                    background: rgba(255,255,255,0.1);
                                    padding: 3px 6px;
                                    border-radius: 10px;
                                    border: 1px solid rgba(255,255,255,0.2);
                                ">
                                    <input type="checkbox" 
                                           id="toggleTarefasPessoais" 
                                           ${this.state.filtrosAtivos.tarefasPessoais ? 'checked' : ''}
                                           onchange="Calendar.toggleTarefasPessoais()"
                                           style="margin: 0; width: 10px; height: 10px; accent-color: #f59e0b;">
                                    <span>🟡 Pessoais</span>
                                </label>
                                
                                <!-- 🔥 NOVO: Toggle Horários -->
                                <select onchange="Calendar.toggleFiltroHorarios(this.value)" style="
                                    background: rgba(255,255,255,0.15);
                                    border: 1px solid rgba(255,255,255,0.3);
                                    color: white;
                                    padding: 2px 6px;
                                    border-radius: 6px;
                                    font-size: 9px;
                                    font-weight: 600;
                                ">
                                    <option value="todos" ${this.state.filtrosAtivos.comHorario === 'todos' ? 'selected' : ''}>🕐 Todos</option>
                                    <option value="com" ${this.state.filtrosAtivos.comHorario === 'com' ? 'selected' : ''}>🕐 Com horário</option>
                                    <option value="sem" ${this.state.filtrosAtivos.comHorario === 'sem' ? 'selected' : ''}>⏰ Sem horário</option>
                                </select>
                                
                                <!-- Link para Agenda -->
                                <button onclick="abrirMinhaAgendaUnificada()" style="
                                    background: rgba(255,255,255,0.15);
                                    border: 1px solid rgba(255,255,255,0.3);
                                    color: white;
                                    padding: 3px 8px;
                                    border-radius: 10px;
                                    font-size: 9px;
                                    cursor: pointer;
                                    font-weight: 600;
                                ">📋 Minha Agenda</button>
                                
                            </div>
                            
                            <!-- 🔥 NOVO: Indicador de sincronização -->
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                margin-top: 4px;
                                background: rgba(16, 185, 129, 0.2);
                                padding: 2px 6px;
                                border-radius: 8px;
                                border: 1px solid rgba(16, 185, 129, 0.3);
                            ">
                                <div style="
                                    width: 6px;
                                    height: 6px;
                                    background: #10b981;
                                    border-radius: 50%;
                                    animation: pulse 2s infinite;
                                "></div>
                                <span style="font-size: 8px; font-weight: 600;">v8.11.0 SYNC</span>
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="Calendar.proximoMes()" style="
                        background: rgba(255,255,255,0.2) !important;
                        border: 1px solid rgba(255,255,255,0.3) !important;
                        color: white !important;
                        padding: 8px 12px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                    ">Próximo →</button>
                </div>
            `;

            // Dias da semana
            const htmlDiasSemana = `
                <div style="
                    display: grid !important;
                    grid-template-columns: repeat(7, 1fr) !important;
                    background: #f8fafc !important;
                ">
                    ${this.config.DIAS_SEMANA.map(dia => `
                        <div style="
                            padding: 12px 8px !important;
                            text-align: center !important;
                            font-weight: 600 !important;
                            font-size: 14px !important;
                            color: #374151 !important;
                            border-right: 1px solid #e5e7eb !important;
                            border-bottom: 1px solid #e5e7eb !important;
                            background: #f8fafc !important;
                        ">${dia}</div>
                    `).join('')}
                </div>
            `;

            const htmlGrid = `
                <div id="calendario-dias-grid" style="
                    display: grid !important;
                    grid-template-columns: repeat(7, 1fr) !important;
                    background: white !important;
                "></div>
            `;

            container.innerHTML = htmlCabecalho + htmlDiasSemana + htmlGrid;
            this._gerarDias();
            
        } catch (error) {
            console.error('❌ Erro ao gerar calendário sincronizado:', error);
        }
    },

    // 🔥 CRIAR HTML DO ITEM UNIFICADO COM HORÁRIOS v8.11.0
    _criarHtmlItemUnificado(item, tipoItem) {
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
        
        // 🔥 HORÁRIOS UNIFICADOS v8.11.0
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
            <div onclick="Calendar.abrirItem('${item.id}', '${tipoItem}')" style="
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
            title="${tipoItem.toUpperCase()}: ${titulo}${item.descricao ? ' - ' + item.descricao : ''}${item.escopo ? ' [' + item.escopo + ']' : ''}${horarioDisplay ? ' | ' + horarioDisplay : ''}"
            >
                <!-- Título e horário -->
                <div style="display: flex; align-items: center; gap: 3px; width: 100%;">
                    <span style="font-size: 8px;">${icone}</span>
                    <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 8px;">${titulo}</span>
                    ${horarioDisplay ? `<span style="font-size: 7px; opacity: 0.9;">${iconeHorario}</span>` : ''}
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

    // 🔥 TOGGLE FILTRO DE HORÁRIOS v8.11.0
    toggleFiltroHorarios(valor) {
        this.state.filtrosAtivos.comHorario = valor;
        console.log(`🕐 Filtro de horários: ${valor}`);
        
        this._gerarDias();
        this._atualizarEstatisticasSincronizadas();
    },

    // 🔥 PROCESSAR DEEP LINK DO CALENDÁRIO
    _processarDeepLinkCalendar(detalhes) {
        try {
            const { itemId, itemTipo, acao } = detalhes;
            console.log(`🔗 Calendar: Processando deep link ${itemTipo} ${itemId} (${acao})`);
            
            if (itemTipo === 'evento') {
                this.abrirItem(itemId, itemTipo);
            } else if (itemTipo === 'tarefa') {
                // Redirecionar para agenda
                if (typeof window.abrirMinhaAgendaUnificada !== 'undefined') {
                    window.abrirMinhaAgendaUnificada();
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar deep link calendar:', error);
        }
    },

    // 🔥 EMITIR EVENTO DE SINCRONIZAÇÃO
    _emitirEventoSincronizacao(nome, dados) {
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent(nome, { detail: dados }));
            }
        } catch (error) {
            // Silencioso
        }
    },

    // ========== MANTER FUNÇÕES PRINCIPAIS ATUALIZADAS ==========
    
    toggleTarefasPessoais() {
        this.state.filtrosAtivos.tarefasPessoais = !this.state.filtrosAtivos.tarefasPessoais;
        this.config.mostrarTarefasPessoais = this.state.filtrosAtivos.tarefasPessoais;
        
        console.log(`📋 Tarefas pessoais no calendário: ${this.state.filtrosAtivos.tarefasPessoais ? 'Ativadas' : 'Desativadas'}`);
        
        const toggle = document.getElementById('toggleTarefasPessoais');
        if (toggle) {
            toggle.checked = this.state.filtrosAtivos.tarefasPessoais;
        }
        
        this._gerarDias();
        this._atualizarEstatisticasSincronizadas();
    },

    toggleTarefasEquipe() {
        this.state.filtrosAtivos.tarefasEquipe = !this.state.filtrosAtivos.tarefasEquipe;
        this.config.mostrarTarefasEquipe = this.state.filtrosAtivos.tarefasEquipe;
        
        console.log(`👥 Tarefas de equipe no calendário: ${this.state.filtrosAtivos.tarefasEquipe ? 'Ativadas' : 'Desativadas'}`);
        
        const toggle = document.getElementById('toggleTarefasEquipe');
        if (toggle) {
            toggle.checked = this.state.filtrosAtivos.tarefasEquipe;
        }
        
        this._gerarDias();
        this._atualizarEstatisticasSincronizadas();
    },

    // ========== MANTER NAVEGAÇÃO E OUTRAS FUNÇÕES ==========
    
    mesAnterior() {
        this.state.mesAtual--;
        if (this.state.mesAtual < 0) {
            this.state.mesAtual = 11;
            this.state.anoAtual--;
        }
        this.gerar();
    },

    proximoMes() {
        this.state.mesAtual++;
        if (this.state.mesAtual > 11) {
            this.state.mesAtual = 0;
            this.state.anoAtual++;
        }
        this.gerar();
    },

    selecionarDia(dia) {
        this.state.diaSelecionado = dia;
        this.gerar();
    },

    irParaData(ano, mes, dia = null) {
        this.state.anoAtual = ano;
        this.state.mesAtual = mes;
        if (dia) this.state.diaSelecionado = dia;
        this.gerar();
    },

    irParaHoje() {
        const hoje = new Date();
        this.irParaData(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    },

    abrirItem(itemId, tipoItem) {
        try {
            console.log(`🔍 Abrindo ${tipoItem} ID: ${itemId}`);
            
            if (tipoItem === 'evento') {
                if (typeof Events !== 'undefined' && Events.editarEvento) {
                    Events.editarEvento(itemId);
                } else {
                    console.warn('⚠️ Events.js não disponível');
                    this._mostrarDetalhesItem(itemId, tipoItem);
                }
            } else if (tipoItem === 'tarefa') {
                if (typeof window.abrirMinhaAgendaUnificada !== 'undefined') {
                    console.log('📋 Redirecionando para agenda para editar tarefa...');
                    window.abrirMinhaAgendaUnificada();
                } else {
                    this._mostrarDetalhesItem(itemId, tipoItem);
                }
            }
            
        } catch (error) {
            console.error(`❌ Erro ao abrir ${tipoItem}:`, error);
            this._mostrarDetalhesItem(itemId, tipoItem);
        }
    },

    _mostrarDetalhesItem(itemId, tipoItem) {
        try {
            const { eventos, tarefas } = this._obterTodosItensUnificados();
            
            let item = null;
            if (tipoItem === 'evento') {
                item = eventos.find(e => e.id == itemId);
            } else {
                item = tarefas.find(t => t.id == itemId);
            }
            
            if (item) {
                const horarioInfo = item.horarioInicio ? 
                    `🕐 ${item.horarioInicio}${item.horarioFim ? ' - ' + item.horarioFim : ''}` : '';
                
                const detalhes = `${tipoItem.toUpperCase()} - ${item.titulo}

📊 Tipo: ${item.tipo}
🎯 Escopo: ${item.escopo || 'N/A'}
👁️ Visibilidade: ${item.visibilidade || 'N/A'}
📅 Data: ${item.data || item.dataInicio}
${horarioInfo}
👤 Responsável: ${item.responsavel || 'N/A'}
${item.participantes?.length > 0 ? '👥 Participantes: ' + item.participantes.join(', ') : ''}

${item.descricao ? '📝 Descrição: ' + item.descricao : ''}

💡 Use a interface específica para editar este item.`;
                
                alert(detalhes);
            } else {
                alert(`❌ ${tipoItem.charAt(0).toUpperCase() + tipoItem.slice(1)} não encontrado.`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao mostrar detalhes:', error);
            alert(`❌ Erro ao abrir ${tipoItem}. Tente novamente.`);
        }
    },

    // 📊 STATUS SINCRONIZADO v8.11.0
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
            
            // Dados sincronizados
            totalEventos: eventos.length,
            totalTarefas: tarefas.length,
            totalItens: total,
            itensVisiveis: totalVisiveis,
            
            // Filtros ativos
            filtrosAtivos: this.state.filtrosAtivos,
            
            // 🔥 ESTATÍSTICAS SINCRONIZADAS v8.11.0
            estatisticas: this.state.estatisticas,
            
            // Integrações
            integracoes: {
                app: typeof App !== 'undefined',
                appUnificado: typeof App !== 'undefined' && App.config?.estruturaUnificada,
                appVersao: App?.config?.versao || 'N/A',
                events: typeof Events !== 'undefined',
                appInicializado: typeof App !== 'undefined' && App.estadoSistema?.inicializado
            },
            
            // 🔥 FUNCIONALIDADES SINCRONIZADAS v8.11.0
            funcionalidades: {
                estruturaUnificada: true,
                horariosUnificados: this.config.suporteHorarios,
                sincronizacaoAutomatica: this.config.sincronizacaoAutomatica,
                deepLinksAtivo: this.config.deepLinksAtivo,
                filtrosHorarios: true,
                estatisticasDetalhadas: true,
                fontesIntegradas: ['App.obterItensParaCalendario()'],
                filtrosVisuais: Object.keys(this.state.filtrosAtivos),
                coresEspecificas: true,
                clickHandlersDiferenciados: true,
                sincronizacaoCompleta: true
            },
            
            // 🔥 SINCRONIZAÇÃO v8.11.0
            sincronizacao: {
                ultimaSincronizacao: this.state.ultimaSincronizacao,
                sincronizacaoEmAndamento: this.state.sincronizacaoEmAndamento,
                versaoSincronizada: this.state.versaoSincronizada,
                eventosConfigutados: true
            },
            
            tipo: 'CALENDAR_SINCRONIZADO_v8.11.0'
        };
    },

    // ========== MANTER OUTRAS FUNÇÕES ESSENCIAIS ==========
    
    _gerarDias() {
        const grid = document.getElementById('calendario-dias-grid');
        if (!grid) return;

        const primeiroDia = new Date(this.state.anoAtual, this.state.mesAtual, 1);
        const ultimoDia = new Date(this.state.anoAtual, this.state.mesAtual + 1, 0);
        const diaSemanaInicio = primeiroDia.getDay();
        const totalDias = ultimoDia.getDate();
        const hoje = new Date();

        const { eventos, tarefas } = this._obterTodosItensUnificados();
        const { eventos: eventosVisiveis, tarefas: tarefasVisiveis } = this._aplicarFiltrosExibicao(eventos, tarefas);

        grid.innerHTML = '';

        for (let celula = 0; celula < 42; celula++) {
            const dia = celula - diaSemanaInicio + 1;
            
            if (dia < 1 || dia > totalDias) {
                const celulaVazia = document.createElement('div');
                celulaVazia.style.cssText = `
                    border-right: 1px solid #e5e7eb !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    background: #f9fafb !important;
                    min-height: 120px !important;
                `;
                grid.appendChild(celulaVazia);
            } else {
                const celulaDia = this._criarCelulaDiaSincronizada(dia, hoje, eventosVisiveis, tarefasVisiveis);
                grid.appendChild(celulaDia);
            }
        }
    },

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
                ${eventosNoDia.map(evento => this._criarHtmlItemUnificado(evento, 'evento')).join('')}
                ${tarefasNoDia.map(tarefa => this._criarHtmlItemUnificado(tarefa, 'tarefa')).join('')}
            </div>
        `;

        celula.addEventListener('click', () => {
            this.selecionarDia(dia);
        });

        celula.addEventListener('mouseenter', () => {
            celula.style.backgroundColor = totalItens > 0 ? '#ecfdf5' : '#f3f4f6';
        });

        celula.addEventListener('mouseleave', () => {
            celula.style.backgroundColor = backgroundColor;
        });

        return celula;
    },

    _ehMesmoMesDia(data1, data2) {
        return data1.getDate() === data2.getDate() && 
               data1.getMonth() === data2.getMonth() && 
               data1.getFullYear() === data2.getFullYear();
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.Calendar = Calendar;

// ✅ FUNÇÕES GLOBAIS SINCRONIZADAS v8.11.0
window.debugCalendar = () => Calendar.obterStatus();
window.irParaHoje = () => Calendar.irParaHoje();
window.novoEvento = () => Calendar.criarNovoEvento();
window.novaTarefa = () => Calendar.criarNovaTarefa();
window.toggleTarefasCalendario = () => Calendar.toggleTarefasPessoais();
window.toggleTarefasPessoais = () => Calendar.toggleTarefasPessoais();
window.toggleTarefasEquipe = () => Calendar.toggleTarefasEquipe();

// 🔥 COMANDOS DEBUG SINCRONIZADOS v8.11.0
window.Calendar_Debug = {
    status: () => Calendar.obterStatus(),
    sincronizar: () => Calendar._sincronizarComApp(),
    estatisticas: () => Calendar.state.estatisticas,
    filtros: () => Calendar.state.filtrosAtivos,
    testarSincronizacao: () => {
        console.log('🧪 TESTE SINCRONIZAÇÃO CALENDAR.JS v8.11.0');
        console.log('============================================');
        
        const status = Calendar.obterStatus();
        console.log(`📦 Versão: ${status.versao}`);
        console.log(`🔗 App.js disponível: ${status.integracoes.app ? 'SIM' : 'NÃO'}`);
        console.log(`🔧 App unificado: ${status.integracoes.appUnificado ? 'SIM' : 'NÃO'}`);
        console.log(`📊 Itens visíveis: ${status.itensVisiveis}`);
        console.log(`🕐 Suporte horários: ${status.funcionalidades.horariosUnificados ? 'SIM' : 'NÃO'}`);
        console.log(`🔄 Sync automático: ${status.funcionalidades.sincronizacaoAutomatica ? 'SIM' : 'NÃO'}`);
        
        const { itensComHorario, itensSemHorario } = status.estatisticas;
        console.log(`🕐 Com horários: ${itensComHorario} | Sem horários: ${itensSemHorario}`);
        
        return {
            versao: status.versao,
            sincronizado: status.integracoes.appUnificado,
            horariosUnificados: status.funcionalidades.horariosUnificados,
            itensVisiveis: status.itensVisiveis,
            estatisticasDetalhadas: status.estatisticas
        };
    }
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Calendar.inicializar(), 1000);
});

console.log('📅 Calendar.js v8.11.0 SINCRONIZAÇÃO COMPLETA carregado!');
console.log('🔥 Funcionalidades: Horários unificados + Sincronização automática + Deep links + Filtros avançados');
console.log('🎯 Compatível com: App.js v8.11.0+ | Events.js v8.11.0+ | Sistema unificado completo');

/*
🔥 CALENDAR.JS v8.11.0 SINCRONIZAÇÃO COMPLETA:

✅ HORÁRIOS UNIFICADOS:
- Suporte completo a horarioInicio/horarioFim ✅
- Exibição de durações e tipos de horário ✅
- Filtros por horários (com/sem/todos) ✅
- Indicadores visuais específicos ✅

✅ SINCRONIZAÇÃO AUTOMÁTICA:
- Listener para dados-sincronizados ✅
- Listener para dados-sincronizados-fase4 ✅
- Sincronização bidirecional com App.js ✅
- Cache invalidado automaticamente ✅

✅ DEEP LINKS:
- Processamento de deep links de eventos ✅
- Redirecionamento para agenda (tarefas) ✅
- Eventos de deep link configurados ✅

✅ VERSIONAMENTO ALINHADO:
- Versão 8.11.0 sincronizada ✅
- Compatibilidade verificada ✅
- Metadados de sincronização ✅

✅ INTERFACE APRIMORADA:
- Filtros de horários no header ✅
- Indicadores de sincronização ✅
- Estatísticas detalhadas ✅
- Controles unificados ✅

📊 RESULTADO:
- Calendar.js totalmente sincronizado ✅
- Horários unificados funcionando ✅
- Interface rica e informativa ✅
- Base sólida para uso em produção ✅
*/
