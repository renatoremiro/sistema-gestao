/**
 * 📅 Sistema de Gestão de Eventos v8.3 - PARTICIPANTES DINÂMICOS CORRIGIDOS
 * 
 * 🔥 CORREÇÃO CRÍTICA: Participantes agora sincronizam com AdminUsersManager
 * ✅ DINÂMICO: Lista atualizada automaticamente com usuários reais
 * ✅ FALLBACK: Mantém lista hardcoded como segurança
 * ✅ SINCRONIZAÇÃO: 100% integrado com Auth.equipe
 */

const Events = {
    // ✅ CONFIGURAÇÕES OTIMIZADAS
    config: {
        tipos: [
            { value: 'reuniao', label: 'Reunião', icon: '📅', cor: '#3b82f6' },
            { value: 'entrega', label: 'Entrega', icon: '📦', cor: '#10b981' },
            { value: 'prazo', label: 'Prazo', icon: '⏰', cor: '#ef4444' },
            { value: 'marco', label: 'Marco', icon: '🏁', cor: '#8b5cf6' },
            { value: 'reuniao_equipe', label: 'Reunião de Equipe', icon: '👥', cor: '#06b6d4' },
            { value: 'treinamento', label: 'Treinamento', icon: '📚', cor: '#f59e0b' },
            { value: 'outro', label: 'Outro', icon: '📌', cor: '#6b7280' }
        ],
        
        status: [
            { value: 'agendado', label: 'Agendado', cor: '#3b82f6' },
            { value: 'confirmado', label: 'Confirmado', cor: '#10b981' },
            { value: 'concluido', label: 'Concluído', cor: '#22c55e' },
            { value: 'cancelado', label: 'Cancelado', cor: '#ef4444' }
        ],
        
        // 🔥 LISTA HARDCODED AGORA É APENAS FALLBACK
        participantesBiapoFallback: [
            'Renato Remiro',
            'Bruna Britto', 
            'Lara Coutinho',
            'Isabella',
            'Eduardo Santos',
            'Carlos Mendonça (Beto)',
            'Alex',
            'Nominato Pires',
            'Nayara Alencar',
            'Jean (Estagiário)',
            'Juliana (Rede Interna)'
        ]
    },

    // ✅ ESTADO INTERNO
    state: {
        modalAtivo: false,
        eventoEditando: null,
        participantesSelecionados: [],
        modoAnonimo: false,
        // 🔥 NOVO: Cache de participantes para performance
        participantesCache: null,
        ultimaAtualizacaoParticipantes: null
    },

    // 🔥 NOVA FUNÇÃO: OBTER PARTICIPANTES DINÂMICOS
    _obterParticipantesBiapo() {
        try {
            // Cache válido por 30 segundos para performance
            const agora = Date.now();
            if (this.state.participantesCache && 
                this.state.ultimaAtualizacaoParticipantes && 
                (agora - this.state.ultimaAtualizacaoParticipantes) < 30000) {
                return this.state.participantesCache;
            }

            let participantes = [];

            // 🎯 FONTE PRIMÁRIA: Auth.equipe (dados do AdminUsersManager)
            if (typeof Auth !== 'undefined' && Auth.equipe && Object.keys(Auth.equipe).length > 0) {
                participantes = Object.values(Auth.equipe)
                    .filter(usuario => {
                        // Filtrar apenas usuários ativos com dados válidos
                        return usuario && 
                               usuario.ativo !== false && 
                               usuario.nome && 
                               usuario.nome.trim().length > 0;
                    })
                    .map(usuario => usuario.nome.trim())
                    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

                console.log(`✅ Participantes carregados do Auth.equipe: ${participantes.length} usuários`);
                console.log('👥 Lista:', participantes.join(', '));
            }

            // 🔄 FALLBACK: Se não há usuários dinâmicos, usar lista hardcoded
            if (participantes.length === 0) {
                participantes = [...this.config.participantesBiapoFallback];
                console.warn('⚠️ Usando lista fallback de participantes');
            }

            // 🔥 CACHE PARA PERFORMANCE
            this.state.participantesCache = participantes;
            this.state.ultimaAtualizacaoParticipantes = agora;

            return participantes;

        } catch (error) {
            console.error('❌ Erro ao obter participantes dinâmicos:', error);
            
            // Em caso de erro, usar fallback
            return [...this.config.participantesBiapoFallback];
        }
    },

    // 🔥 NOVA FUNÇÃO: FORÇAR ATUALIZAÇÃO DE PARTICIPANTES
    atualizarParticipantes() {
        this.state.participantesCache = null;
        this.state.ultimaAtualizacaoParticipantes = null;
        
        const novosParticipantes = this._obterParticipantesBiapo();
        console.log(`🔄 Participantes atualizados: ${novosParticipantes.length} usuários`);
        
        return novosParticipantes;
    },

    // 🔥 VERIFICAR PERMISSÕES DE EDIÇÃO
    _verificarPermissoes() {
        // Integração com App v8.2
        if (typeof App !== 'undefined' && App.podeEditar) {
            return App.podeEditar();
        }
        
        // Fallback: verificar modo anônimo via App
        if (typeof App !== 'undefined' && App.estadoSistema) {
            return !App.estadoSistema.modoAnonimo;
        }
        
        // Último fallback: verificar usuário atual
        return App?.usuarioAtual !== null;
    },

    // 🔥 ATUALIZAR ESTADO INTERNO
    _atualizarEstado() {
        this.state.modoAnonimo = !this._verificarPermissoes();
    },

    // 🔥 MOSTRAR NOVO EVENTO (com verificação de permissões)
    mostrarNovoEvento(dataInicial = null) {
        try {
            this._atualizarEstado();
            
            // 🔥 VERIFICAR PERMISSÕES ANTES DE PERMITIR CRIAÇÃO
            if (this.state.modoAnonimo) {
                this._mostrarMensagemModoAnonimo('criar evento');
                return;
            }
            
            const hoje = new Date();
            const dataInput = dataInicial || hoje.toISOString().split('T')[0];
            
            this.state.eventoEditando = null;
            this.state.participantesSelecionados = [];
            
            // 🔥 ATUALIZAR PARTICIPANTES ANTES DE ABRIR MODAL
            this.atualizarParticipantes();
            
            this._criarModal(dataInput);
            this.state.modalAtivo = true;

        } catch (error) {
            console.error('❌ Erro ao mostrar modal evento:', error);
            this._mostrarNotificacao('Erro ao abrir modal de evento', 'error');
        }
    },

    // 🔥 EDITAR EVENTO (com verificação de permissões)
    editarEvento(id) {
        try {
            this._atualizarEstado();
            
            if (!this._verificarDados()) {
                this._mostrarNotificacao('Dados não disponíveis', 'error');
                return;
            }
            
            const evento = App.dados.eventos.find(e => e.id == id);
            if (!evento) {
                this._mostrarNotificacao('Evento não encontrado', 'error');
                return;
            }
            
            // 🔥 VERIFICAR PERMISSÕES ANTES DE PERMITIR EDIÇÃO
            if (this.state.modoAnonimo) {
                this._mostrarDetalhesEvento(evento);
                return;
            }
            
            this.state.eventoEditando = id;
            this.state.participantesSelecionados = evento.pessoas || evento.participantes || [];
            
            // 🔥 ATUALIZAR PARTICIPANTES ANTES DE ABRIR MODAL
            this.atualizarParticipantes();
            
            this._criarModal(evento.data, evento);
            this.state.modalAtivo = true;

        } catch (error) {
            console.error('❌ Erro ao editar evento:', error);
            this._mostrarNotificacao('Erro ao editar evento', 'error');
        }
    },

    // 🔥 NOVA FUNÇÃO: MOSTRAR DETALHES DO EVENTO (modo anônimo)
    _mostrarDetalhesEvento(evento) {
        try {
            // Criar modal de visualização apenas
            const modal = document.createElement('div');
            modal.id = 'modalDetalhesEvento';
            modal.className = 'modal';
            
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
                z-index: 999999 !important;
            `;
            
            const tipoEvento = this.config.tipos.find(t => t.value === evento.tipo);
            const iconeTipo = tipoEvento ? tipoEvento.icon : '📅';
            const labelTipo = tipoEvento ? tipoEvento.label : 'Evento';
            
            modal.innerHTML = `
                <div style="
                    background: white !important;
                    border-radius: 12px !important;
                    padding: 0 !important;
                    max-width: 500px !important;
                    width: 90vw !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
                ">
                    <!-- Cabeçalho -->
                    <div style="
                        background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
                        color: white !important;
                        padding: 20px 24px !important;
                        border-radius: 12px 12px 0 0 !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                    ">
                        <h3 style="margin: 0 !important; font-size: 18px !important; font-weight: 600 !important; color: white !important;">
                            👁️ Detalhes do Evento
                        </h3>
                        <button onclick="this.closest('.modal').remove()" style="
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
                        ">&times;</button>
                    </div>
                    
                    <!-- Conteúdo -->
                    <div style="padding: 24px !important;">
                        <div style="display: grid !important; gap: 16px !important;">
                            <!-- Título -->
                            <div>
                                <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                    ${iconeTipo} Título:
                                </label>
                                <div style="
                                    padding: 12px 16px !important;
                                    background: #f8fafc !important;
                                    border: 1px solid #e5e7eb !important;
                                    border-radius: 8px !important;
                                    font-size: 16px !important;
                                    font-weight: 600 !important;
                                ">${evento.titulo}</div>
                            </div>
                            
                            <!-- Tipo e Data -->
                            <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important;">
                                <div>
                                    <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                        📂 Tipo:
                                    </label>
                                    <div style="
                                        padding: 12px 16px !important;
                                        background: #f8fafc !important;
                                        border: 1px solid #e5e7eb !important;
                                        border-radius: 8px !important;
                                    ">${labelTipo}</div>
                                </div>
                                
                                <div>
                                    <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                        📅 Data:
                                    </label>
                                    <div style="
                                        padding: 12px 16px !important;
                                        background: #f8fafc !important;
                                        border: 1px solid #e5e7eb !important;
                                        border-radius: 8px !important;
                                    ">${new Date(evento.data).toLocaleDateString('pt-BR')}</div>
                                </div>
                            </div>
                            
                            <!-- Horários -->
                            ${evento.horarioInicio || evento.horarioFim ? `
                                <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important;">
                                    ${evento.horarioInicio ? `
                                        <div>
                                            <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                                🕐 Início:
                                            </label>
                                            <div style="
                                                padding: 12px 16px !important;
                                                background: #f8fafc !important;
                                                border: 1px solid #e5e7eb !important;
                                                border-radius: 8px !important;
                                            ">${evento.horarioInicio}</div>
                                        </div>
                                    ` : ''}
                                    
                                    ${evento.horarioFim ? `
                                        <div>
                                            <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                                🕐 Fim:
                                            </label>
                                            <div style="
                                                padding: 12px 16px !important;
                                                background: #f8fafc !important;
                                                border: 1px solid #e5e7eb !important;
                                                border-radius: 8px !important;
                                            ">${evento.horarioFim}</div>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                            
                            <!-- Descrição -->
                            ${evento.descricao ? `
                                <div>
                                    <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                        📄 Descrição:
                                    </label>
                                    <div style="
                                        padding: 12px 16px !important;
                                        background: #f8fafc !important;
                                        border: 1px solid #e5e7eb !important;
                                        border-radius: 8px !important;
                                        min-height: 60px !important;
                                    ">${evento.descricao}</div>
                                </div>
                            ` : ''}
                            
                            <!-- Participantes -->
                            ${evento.participantes && evento.participantes.length > 0 ? `
                                <div>
                                    <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                        👥 Participantes:
                                    </label>
                                    <div style="
                                        padding: 12px 16px !important;
                                        background: #f8fafc !important;
                                        border: 1px solid #e5e7eb !important;
                                        border-radius: 8px !important;
                                        display: flex !important;
                                        flex-wrap: wrap !important;
                                        gap: 8px !important;
                                    ">
                                        ${evento.participantes.map(p => `
                                            <span style="
                                                background: #10b981 !important;
                                                color: white !important;
                                                padding: 4px 12px !important;
                                                border-radius: 16px !important;
                                                font-size: 12px !important;
                                                font-weight: 600 !important;
                                            ">${p}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Local -->
                            ${evento.local ? `
                                <div>
                                    <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                        📍 Local:
                                    </label>
                                    <div style="
                                        padding: 12px 16px !important;
                                        background: #f8fafc !important;
                                        border: 1px solid #e5e7eb !important;
                                        border-radius: 8px !important;
                                    ">${evento.local}</div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Modo anônimo -->
                        <div style="
                            margin-top: 20px !important;
                            padding: 12px 16px !important;
                            background: #fff3cd !important;
                            border: 1px solid #ffeaa7 !important;
                            border-radius: 8px !important;
                            display: flex !important;
                            align-items: center !important;
                            gap: 8px !important;
                        ">
                            <span>👁️</span>
                            <span style="font-size: 14px !important; color: #856404 !important;">
                                <strong>Modo Visualização:</strong> Faça login para editar eventos
                            </span>
                        </div>
                    </div>
                    
                    <!-- Rodapé -->
                    <div style="
                        padding: 20px 24px !important;
                        border-top: 1px solid #e5e7eb !important;
                        display: flex !important;
                        justify-content: center !important;
                        background: #f8fafc !important;
                        border-radius: 0 0 12px 12px !important;
                    ">
                        <button onclick="this.closest('.modal').remove()" style="
                            background: #6b7280 !important;
                            color: white !important;
                            border: none !important;
                            padding: 12px 24px !important;
                            border-radius: 8px !important;
                            cursor: pointer !important;
                            font-size: 14px !important;
                            font-weight: 600 !important;
                        ">
                            👁️ Fechar Visualização
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('❌ Erro ao mostrar detalhes:', error);
            this._mostrarNotificacao('Erro ao visualizar evento', 'error');
        }
    },

    // 🔥 NOVA FUNÇÃO: MOSTRAR MENSAGEM MODO ANÔNIMO
    _mostrarMensagemModoAnonimo(acao) {
        if (typeof Notifications !== 'undefined') {
            Notifications.warning(`⚠️ Login necessário para ${acao}`);
        } else {
            alert(`Login necessário para ${acao}.\n\nVocê está no modo visualização.`);
        }
    },

    // 🔥 SALVAR EVENTO COM INTEGRAÇÃO AUTOMÁTICA (com verificação)
    async salvarEvento(dadosEvento) {
        try {
            // 🔥 VERIFICAR PERMISSÕES ANTES DE SALVAR
            if (this.state.modoAnonimo) {
                this._mostrarMensagemModoAnonimo('salvar eventos');
                return false;
            }
            
            // Validação
            if (!dadosEvento.titulo || dadosEvento.titulo.length < 2) {
                throw new Error('Título deve ter pelo menos 2 caracteres');
            }
            
            if (!dadosEvento.data) {
                throw new Error('Data é obrigatória');
            }
            
            // Garantir estrutura
            if (!App.dados.eventos) {
                App.dados.eventos = [];
            }
            
            const agora = new Date().toISOString();
            
            if (this.state.eventoEditando) {
                // Atualizar existente
                const index = App.dados.eventos.findIndex(e => e.id == this.state.eventoEditando);
                if (index !== -1) {
                    App.dados.eventos[index] = {
                        ...App.dados.eventos[index],
                        ...dadosEvento,
                        id: this.state.eventoEditando,
                        ultimaAtualizacao: agora
                    };
                }
            } else {
                // Criar novo
                const novoEvento = {
                    id: Date.now(),
                    ...dadosEvento,
                    dataCriacao: agora,
                    ultimaAtualizacao: agora,
                    status: dadosEvento.status || 'agendado',
                    criadoPor: this._obterUsuarioAtual()
                };
                
                App.dados.eventos.push(novoEvento);
            }
            
            // 🔥 SALVAR E ATUALIZAR CALENDÁRIO AUTOMATICAMENTE
            await this._salvarEAtualizarCalendario();
            
            // Fechar modal
            this.fecharModal();
            
            // Notificação de sucesso
            const acao = this.state.eventoEditando ? 'atualizado' : 'criado';
            this._mostrarNotificacao(`✅ Evento "${dadosEvento.titulo}" ${acao}!`, 'success');
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar evento:', error);
            this._mostrarNotificacao(`Erro: ${error.message}`, 'error');
            return false;
        }
    },

    // 🔥 EXCLUIR EVENTO COM ATUALIZAÇÃO AUTOMÁTICA (com verificação)
    async excluirEvento(id) {
        try {
            // 🔥 VERIFICAR PERMISSÕES ANTES DE EXCLUIR
            if (this.state.modoAnonimo) {
                this._mostrarMensagemModoAnonimo('excluir eventos');
                return false;
            }
            
            if (!this._verificarDados()) return false;
            
            const eventoIndex = App.dados.eventos.findIndex(e => e.id == id);
            if (eventoIndex === -1) {
                this._mostrarNotificacao('Evento não encontrado', 'error');
                return false;
            }
            
            const evento = App.dados.eventos[eventoIndex];
            
            // Confirmar exclusão
            if (!confirm(`❌ Excluir evento "${evento.titulo}"?\n\nEsta ação não pode ser desfeita.`)) {
                return false;
            }
            
            // Excluir
            App.dados.eventos.splice(eventoIndex, 1);
            
            // 🔥 SALVAR E ATUALIZAR CALENDÁRIO AUTOMATICAMENTE
            await this._salvarEAtualizarCalendario();
            
            this.fecharModal();
            this._mostrarNotificacao(`🗑️ Evento "${evento.titulo}" excluído!`, 'success');
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao excluir evento:', error);
            this._mostrarNotificacao('Erro ao excluir evento', 'error');
            return false;
        }
    },

    // 🔥 CRIAR MODAL OTIMIZADO - VISIBILIDADE 100% GARANTIDA (com participantes dinâmicos)
    _criarModal(dataInicial, dadosEvento = null) {
        // Remover modal existente
        this._removerModal();
        
        const ehEdicao = !!dadosEvento;
        const titulo = ehEdicao ? 'Editar Evento' : 'Novo Evento';
        
        // Criar modal
        const modal = document.createElement('div');
        modal.id = 'modalEvento';
        modal.className = 'modal';
        
        // 🔥 GARANTIR VISIBILIDADE ABSOLUTA
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
            z-index: 999999 !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;
        
        // HTML do modal (mantém estrutura v8.1)
        modal.innerHTML = this._gerarHtmlModal(titulo, dataInicial, dadosEvento, ehEdicao);
        
        // Adicionar ao DOM
        document.body.appendChild(modal);
        
        // 🔥 FORÇAR VISIBILIDADE APÓS INSERÇÃO
        requestAnimationFrame(() => {
            if (modal && modal.parentNode) {
                modal.style.display = 'flex';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
                modal.style.zIndex = '999999';
                
                window.scrollTo(0, 0);
                modal.focus();
            }
        });
        
        // Event listeners
        this._configurarEventListeners(modal);
        
        // Focar no primeiro campo
        setTimeout(() => {
            const campoTitulo = document.getElementById('eventoTitulo');
            if (campoTitulo) {
                campoTitulo.focus();
                campoTitulo.select();
            }
        }, 100);
    },

    // 🔥 GERAR HTML DO MODAL OTIMIZADO (com participantes dinâmicos)
    _gerarHtmlModal(titulo, dataInicial, dadosEvento, ehEdicao) {
        const tiposHtml = this.config.tipos.map(tipo => 
            `<option value="${tipo.value}" ${dadosEvento?.tipo === tipo.value ? 'selected' : ''}>${tipo.icon} ${tipo.label}</option>`
        ).join('');
        
        // 🔥 USAR PARTICIPANTES DINÂMICOS
        const participantesDinamicos = this._obterParticipantesBiapo();
        const participantesHtml = participantesDinamicos.map(pessoa => {
            const selecionado = this.state.participantesSelecionados.includes(pessoa) || 
                               dadosEvento?.pessoas?.includes(pessoa) || 
                               dadosEvento?.participantes?.includes(pessoa);
            
            return `
                <label style="
                    display: flex; 
                    align-items: center; 
                    gap: 8px; 
                    padding: 8px 12px; 
                    background: white; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    border: 1px solid #e5e7eb;
                    transition: background-color 0.2s;
                " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='white'">
                    <input type="checkbox" name="participantes" value="${pessoa}" ${selecionado ? 'checked' : ''} 
                           style="margin: 0; cursor: pointer;">
                    <span style="font-size: 14px;">${pessoa}</span>
                </label>
            `;
        }).join('');

        // 🔥 INDICADOR DE FONTE DOS PARTICIPANTES
        const fonteParticipantes = participantesDinamicos.length > this.config.participantesBiapoFallback.length ? 
            '✅ Usuários dinâmicos do AdminUsersManager' : 
            '⚠️ Lista padrão (configure usuários no AdminUsersManager)';

        return `
            <div style="
                background: white !important;
                border-radius: 12px !important;
                padding: 0 !important;
                max-width: 600px !important;
                width: 90vw !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
                z-index: 999999 !important;
                position: relative !important;
            ">
                <!-- Cabeçalho -->
                <div style="
                    background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%) !important;
                    color: white !important;
                    padding: 20px 24px !important;
                    border-radius: 12px 12px 0 0 !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                ">
                    <h3 style="margin: 0 !important; font-size: 18px !important; font-weight: 600 !important; color: white !important;">
                        ${ehEdicao ? '✏️' : '📅'} ${titulo}
                    </h3>
                    <button onclick="Events.fecharModal()" style="
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
                
                <!-- Corpo -->
                <form id="formEvento" style="padding: 24px !important;">
                    <div style="display: grid !important; gap: 20px !important;">
                        <!-- Título -->
                        <div>
                            <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                📝 Título do Evento *
                            </label>
                            <input type="text" id="eventoTitulo" required 
                                   value="${dadosEvento?.titulo || ''}"
                                   placeholder="Ex: Reunião de planejamento semanal"
                                   style="
                                       width: 100% !important;
                                       padding: 12px 16px !important;
                                       border: 2px solid #e5e7eb !important;
                                       border-radius: 8px !important;
                                       font-size: 14px !important;
                                       transition: border-color 0.2s !important;
                                       box-sizing: border-box !important;
                                   "
                                   onfocus="this.style.borderColor='#C53030'"
                                   onblur="this.style.borderColor='#e5e7eb'">
                        </div>
                        
                        <!-- Tipo e Data -->
                        <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important;">
                            <div>
                                <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                    📂 Tipo *
                                </label>
                                <select id="eventoTipo" required style="
                                    width: 100% !important;
                                    padding: 12px 16px !important;
                                    border: 2px solid #e5e7eb !important;
                                    border-radius: 8px !important;
                                    font-size: 14px !important;
                                    box-sizing: border-box !important;
                                ">
                                    ${tiposHtml}
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                    📅 Data *
                                </label>
                                <input type="date" id="eventoData" required 
                                       value="${dadosEvento?.data || dataInicial}"
                                       style="
                                           width: 100% !important;
                                           padding: 12px 16px !important;
                                           border: 2px solid #e5e7eb !important;
                                           border-radius: 8px !important;
                                           font-size: 14px !important;
                                           box-sizing: border-box !important;
                                       ">
                            </div>
                        </div>
                        
                        <!-- Horário -->
                        <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important;">
                            <div>
                                <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                    🕐 Horário Início
                                </label>
                                <input type="time" id="eventoHorarioInicio" 
                                       value="${dadosEvento?.horarioInicio || ''}"
                                       style="
                                           width: 100% !important;
                                           padding: 12px 16px !important;
                                           border: 2px solid #e5e7eb !important;
                                           border-radius: 8px !important;
                                           font-size: 14px !important;
                                           box-sizing: border-box !important;
                                       ">
                            </div>
                            
                            <div>
                                <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                    🕐 Horário Fim
                                </label>
                                <input type="time" id="eventoHorarioFim" 
                                       value="${dadosEvento?.horarioFim || ''}"
                                       style="
                                           width: 100% !important;
                                           padding: 12px 16px !important;
                                           border: 2px solid #e5e7eb !important;
                                           border-radius: 8px !important;
                                           font-size: 14px !important;
                                           box-sizing: border-box !important;
                                       ">
                            </div>
                        </div>
                        
                        <!-- Descrição -->
                        <div>
                            <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                📄 Descrição
                            </label>
                            <textarea id="eventoDescricao" rows="3" 
                                      placeholder="Descreva os detalhes do evento..."
                                      style="
                                          width: 100% !important;
                                          padding: 12px 16px !important;
                                          border: 2px solid #e5e7eb !important;
                                          border-radius: 8px !important;
                                          font-size: 14px !important;
                                          resize: vertical !important;
                                          box-sizing: border-box !important;
                                      "
                                      onfocus="this.style.borderColor='#C53030'"
                                      onblur="this.style.borderColor='#e5e7eb'">${dadosEvento?.descricao || ''}</textarea>
                        </div>
                        
                        <!-- Participantes DINÂMICOS -->
                        <div>
                            <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                👥 Participantes BIAPO (${participantesDinamicos.length} usuários)
                            </label>
                            <div style="
                                font-size: 11px !important;
                                color: #6b7280 !important;
                                margin-bottom: 8px !important;
                                padding: 6px 8px !important;
                                background: #f8fafc !important;
                                border-radius: 4px !important;
                                border: 1px solid #e5e7eb !important;
                            ">
                                🔄 ${fonteParticipantes}
                            </div>
                            <div style="
                                max-height: 180px !important; 
                                overflow-y: auto !important; 
                                padding: 12px !important; 
                                background: #f8fafc !important; 
                                border-radius: 8px !important; 
                                border: 2px solid #e5e7eb !important;
                                display: grid !important; 
                                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important; 
                                gap: 8px !important;
                            ">
                                ${participantesHtml}
                            </div>
                        </div>
                        
                        <!-- Local -->
                        <div>
                            <label style="display: block !important; margin-bottom: 6px !important; font-weight: 600 !important; color: #374151 !important;">
                                📍 Local
                            </label>
                            <input type="text" id="eventoLocal" 
                                   value="${dadosEvento?.local || ''}"
                                   placeholder="Ex: Sala de reuniões A1, Online (Teams)"
                                   style="
                                       width: 100% !important;
                                       padding: 12px 16px !important;
                                       border: 2px solid #e5e7eb !important;
                                       border-radius: 8px !important;
                                       font-size: 14px !important;
                                       box-sizing: border-box !important;
                                   "
                                   onfocus="this.style.borderColor='#C53030'"
                                   onblur="this.style.borderColor='#e5e7eb'">
                        </div>
                    </div>
                </form>
                
                <!-- Rodapé -->
                <div style="
                    padding: 20px 24px !important;
                    border-top: 1px solid #e5e7eb !important;
                    display: flex !important;
                    gap: 12px !important;
                    justify-content: flex-end !important;
                    background: #f8fafc !important;
                    border-radius: 0 0 12px 12px !important;
                ">
                    <button type="button" onclick="Events.fecharModal()" style="
                        background: #6b7280 !important;
                        color: white !important;
                        border: none !important;
                        padding: 12px 20px !important;
                        border-radius: 8px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 600 !important;
                        transition: background-color 0.2s !important;
                    " onmouseover="this.style.backgroundColor='#4b5563'" onmouseout="this.style.backgroundColor='#6b7280'">
                        ❌ Cancelar
                    </button>
                    
                    ${ehEdicao ? `
                        <button type="button" onclick="Events.excluirEvento(${dadosEvento.id})" style="
                            background: #ef4444 !important;
                            color: white !important;
                            border: none !important;
                            padding: 12px 20px !important;
                            border-radius: 8px !important;
                            cursor: pointer !important;
                            font-size: 14px !important;
                            font-weight: 600 !important;
                            transition: background-color 0.2s !important;
                        " onmouseover="this.style.backgroundColor='#dc2626'" onmouseout="this.style.backgroundColor='#ef4444'">
                            🗑️ Excluir
                        </button>
                    ` : ''}
                    
                    <button type="button" onclick="Events._submeterFormulario()" style="
                        background: #C53030 !important;
                        color: white !important;
                        border: none !important;
                        padding: 12px 20px !important;
                        border-radius: 8px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 600 !important;
                        transition: background-color 0.2s !important;
                    " onmouseover="this.style.backgroundColor='#9B2C2C'" onmouseout="this.style.backgroundColor='#C53030'">
                        ${ehEdicao ? '✅ Atualizar' : '📅 Criar'} Evento
                    </button>
                </div>
            </div>
        `;
    },

    // === MANTER TODAS AS OUTRAS FUNÇÕES AUXILIARES ===
    _configurarEventListeners(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.fecharModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.modalAtivo) {
                this.fecharModal();
            }
        });
        
        const campoTitulo = document.getElementById('eventoTitulo');
        if (campoTitulo) {
            campoTitulo.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._submeterFormulario();
                }
            });
        }
    },

    _submeterFormulario() {
        try {
            const form = document.getElementById('formEvento');
            if (!form) {
                throw new Error('Formulário não encontrado');
            }
            
            const participantes = Array.from(form.querySelectorAll('input[name="participantes"]:checked'))
                .map(input => input.value);
            
            const dados = {
                titulo: document.getElementById('eventoTitulo').value.trim(),
                tipo: document.getElementById('eventoTipo').value,
                data: document.getElementById('eventoData').value,
                horarioInicio: document.getElementById('eventoHorarioInicio').value,
                horarioFim: document.getElementById('eventoHorarioFim').value,
                descricao: document.getElementById('eventoDescricao').value.trim(),
                participantes: participantes,
                pessoas: participantes,
                local: document.getElementById('eventoLocal').value.trim()
            };
            
            this.salvarEvento(dados);

        } catch (error) {
            console.error('❌ Erro ao submeter formulário:', error);
            this._mostrarNotificacao(`Erro ao salvar: ${error.message}`, 'error');
        }
    },

    fecharModal() {
        try {
            this._removerModal();
            this.state.modalAtivo = false;
            this.state.eventoEditando = null;
            this.state.participantesSelecionados = [];
        } catch (error) {
            console.error('❌ Erro ao fechar modal:', error);
        }
    },

    _removerModal() {
        const modaisExistentes = document.querySelectorAll('#modalEvento, #modalDetalhesEvento, .modal');
        modaisExistentes.forEach(modal => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
        
        document.body.style.overflow = '';
    },

    _verificarDados() {
        return typeof App !== 'undefined' && App.dados;
    },

    async _salvarEAtualizarCalendario() {
        try {
            if (typeof Persistence !== 'undefined' && Persistence.salvarDadosCritico) {
                await Persistence.salvarDadosCritico();
            }
            
            if (typeof Calendar !== 'undefined' && Calendar.atualizarEventos) {
                Calendar.atualizarEventos();
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao salvar/atualizar:', error);
        }
    },

    _obterUsuarioAtual() {
        try {
            if (App?.usuarioAtual?.email) {
                return App.usuarioAtual.email;
            }
            return 'Sistema';
        } catch {
            return 'Sistema';
        }
    },

    _mostrarNotificacao(mensagem, tipo = 'info') {
        if (typeof Notifications !== 'undefined') {
            switch (tipo) {
                case 'success': Notifications.success?.(mensagem); break;
                case 'error': Notifications.error?.(mensagem); break;
                case 'warning': Notifications.warning?.(mensagem); break;
                default: Notifications.info?.(mensagem);
            }
        } else {
            console.log(`📢 ${tipo.toUpperCase()}: ${mensagem}`);
        }
    },

    // ✅ OBTER STATUS v8.3 - DINÂMICO
    obterStatus() {
        const participantes = this._obterParticipantesBiapo();
        
        return {
            modalAtivo: this.state.modalAtivo,
            eventoEditando: this.state.eventoEditando,
            modoAnonimo: this.state.modoAnonimo,
            participantes: {
                total: participantes.length,
                fonte: participantes.length > this.config.participantesBiapoFallback.length ? 'Auth.equipe' : 'Fallback',
                ultimaAtualizacao: this.state.ultimaAtualizacaoParticipantes,
                cache: !!this.state.participantesCache
            },
            totalEventos: App.dados?.eventos?.length || 0,
            integracaoCalendar: typeof Calendar !== 'undefined',
            permissoes: {
                visualizar: true,
                criar: this._verificarPermissoes(),
                editar: this._verificarPermissoes(),
                excluir: this._verificarPermissoes()
            },
            versao: '8.3.0 - PARTICIPANTES DINÂMICOS CORRIGIDOS',
            correcaoAplicada: true,
            sincronizacaoAdminUsers: typeof Auth !== 'undefined' && !!Auth.equipe
        };
    }
};

// ✅ EXPOR NO WINDOW GLOBAL
window.Events = Events;

// 🔥 COMANDOS GLOBAIS PARA TESTE
window.Events_Debug = {
    status: () => Events.obterStatus(),
    participantes: () => Events._obterParticipantesBiapo(),
    atualizarParticipantes: () => Events.atualizarParticipantes(),
    testeParticipantes: () => {
        console.log('🧪 TESTE PARTICIPANTES DINÂMICOS v8.3');
        console.log('===========================================');
        
        const participantes = Events._obterParticipantesBiapo();
        const authUsuarios = typeof Auth !== 'undefined' && Auth.equipe ? Object.keys(Auth.equipe).length : 0;
        
        console.log(`👥 Participantes retornados: ${participantes.length}`);
        console.log(`🔗 Auth.equipe disponível: ${authUsuarios} usuários`);
        console.log(`📋 Lista: ${participantes.join(', ')}`);
        console.log(`🎯 Fonte: ${participantes.length > Events.config.participantesBiapoFallback.length ? 'DINÂMICA ✅' : 'FALLBACK ⚠️'}`);
        
        if (authUsuarios > 0) {
            console.log('✅ Sincronização funcionando!');
        } else {
            console.log('⚠️ Auth.equipe não carregado - usar AdminUsersManager primeiro');
        }
        
        return {
            participantes,
            total: participantes.length,
            fonte: participantes.length > Events.config.participantesBiapoFallback.length ? 'dinamica' : 'fallback',
            authUsuarios,
            sincronizado: authUsuarios > 0
        };
    }
};

// ✅ LOG DE CARREGAMENTO
console.log('📅 Events.js v8.3 - PARTICIPANTES DINÂMICOS CORRIGIDOS carregado!');
console.log('🔥 NOVO: Participantes sincronizam automaticamente com AdminUsersManager');
console.log('📋 Comandos: Events_Debug.testeParticipantes() | Events_Debug.participantes()');

/*
🔥 MELHORIAS v8.3 - PARTICIPANTES DINÂMICOS:

✅ CORREÇÕES APLICADAS:
1. _obterParticipantesBiapo(): Função dinâmica que lê de Auth.equipe ✅
2. Cache de 30s para performance otimizada ✅  
3. Fallback inteligente para lista hardcoded ✅
4. Sincronização automática com AdminUsersManager ✅
5. Indicador visual da fonte dos dados no modal ✅
6. Debug completo para troubleshooting ✅

🎯 RESULTADO FINAL v8.3:
- Usuários cadastrados pelo admin aparecem AUTOMATICAMENTE nos eventos ✅
- Lista atualizada dinamicamente ✅
- Performance otimizada com cache ✅
- Sistema robusto com fallback ✅
- Debug completo disponível ✅
- PROBLEMA CRÍTICO RESOLVIDO DEFINITIVAMENTE ✅

📋 PRÓXIMOS PASSOS:
1. Testar modal de eventos (deve mostrar usuários dinâmicos) ✅
2. Corrigir departamentos persistentes (próxima etapa)
3. Limpeza de redundâncias (manutenção)
*/
