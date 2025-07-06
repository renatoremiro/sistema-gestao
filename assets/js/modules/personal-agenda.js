/* ========== 📋 SISTEMA HÍBRIDO - MINHA AGENDA v6.6.0 - PÁGINA DEDICADA INTEGRADA ========== */

const PersonalAgenda = {
    // ✅ CONFIGURAÇÕES HÍBRIDAS COMPLETAS
    config: {
        // Tipos de tarefas
        tipos: [
            { value: 'pessoal', label: 'Pessoal', icon: '👤', cor: '#f59e0b' },
            { value: 'equipe', label: 'Equipe', icon: '👥', cor: '#06b6d4' },
            { value: 'projeto', label: 'Projeto', icon: '🏗️', cor: '#8b5cf6' },
            { value: 'urgente', label: 'Urgente', icon: '🚨', cor: '#ef4444' },
            { value: 'rotina', label: 'Rotina', icon: '🔄', cor: '#6b7280' }
        ],
        
        // Prioridades
        prioridades: [
            { value: 'baixa', label: 'Baixa', cor: '#22c55e' },
            { value: 'media', label: 'Média', cor: '#f59e0b' },
            { value: 'alta', label: 'Alta', cor: '#ef4444' },
            { value: 'critica', label: 'Crítica', cor: '#dc2626' }
        ],
        
        // Status das tarefas
        status: [
            { value: 'pendente', label: 'Pendente', cor: '#6b7280' },
            { value: 'andamento', label: 'Em andamento', cor: '#3b82f6' },
            { value: 'revisao', label: 'Em revisão', cor: '#f59e0b' },
            { value: 'concluida', label: 'Concluída', cor: '#10b981' },
            { value: 'cancelada', label: 'Cancelada', cor: '#ef4444' }
        ],
        
        // Dias da semana
        diasSemana: [
            { value: 'segunda', label: 'Segunda-feira', abrev: 'Seg' },
            { value: 'terca', label: 'Terça-feira', abrev: 'Ter' },
            { value: 'quarta', label: 'Quarta-feira', abrev: 'Qua' },
            { value: 'quinta', label: 'Quinta-feira', abrev: 'Qui' },
            { value: 'sexta', label: 'Sexta-feira', abrev: 'Sex' },
            { value: 'sabado', label: 'Sábado', abrev: 'Sáb' },
            { value: 'domingo', label: 'Domingo', abrev: 'Dom' }
        ],

        // URLs e navegação
        urls: {
            agendaDedicada: 'agenda.html',
            sistemaprincipal: 'index.html'
        }
    },

    // ✅ ESTADO INTERNO ATUALIZADO
    state: {
        pessoaAtual: null,
        usuarioLogado: false,
        versao: '6.6.0 - Página Dedicada',
        tipoSistema: 'Redirecionamento',
        modalObsoleto: true, // Modal foi removido
        navegacaoAtiva: true,
        ultimaAtualizacao: null
    },

    // ✅ INICIALIZAÇÃO
    init() {
        try {
            console.log('📋 Inicializando PersonalAgenda v6.6.0 (Página Dedicada Integrada)...');
            
            // Definir usuário atual dinamicamente
            this._definirUsuarioAtual();
            
            // Verificar dependências
            this._verificarDependencias();
            
            // Configurar eventos se necessário
            this._configurarEventosGlobais();
            
            // Atualizar estado
            this.state.ultimaAtualizacao = new Date().toISOString();
            
            console.log(`✅ PersonalAgenda inicializado para: ${this.state.pessoaAtual}`);
            console.log(`🔄 Modo: ${this.state.tipoSistema} → ${this.config.urls.agendaDedicada}`);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar PersonalAgenda:', error);
            // Fallback
            this.state.pessoaAtual = 'Usuário';
            this.state.usuarioLogado = false;
        }
    },

    // 🔧 FUNÇÃO PRINCIPAL: ABRIR AGENDA DEDICADA
    abrirMinhaAgenda(pessoa = null) {
        try {
            console.log('📋 Abrindo agenda dedicada...');
            
            // Definir usuário se fornecido
            if (pessoa) {
                this.state.pessoaAtual = pessoa;
                console.log(`👤 Usuário definido: ${pessoa}`);
            } else {
                this._definirUsuarioAtual();
            }

            // Salvar estado atual para preservar navegação
            this._salvarEstadoNavegacao();

            // 🎯 REDIRECIONAMENTO PARA PÁGINA DEDICADA
            const urlAgenda = this.config.urls.agendaDedicada;
            
            // Adicionar parâmetros se necessário
            const params = new URLSearchParams();
            if (this.state.pessoaAtual && this.state.pessoaAtual !== 'Usuário') {
                params.append('usuario', this.state.pessoaAtual);
            }
            
            // Adicionar timestamp para forçar recarregamento se necessário
            params.append('t', Date.now());
            
            const urlCompleta = params.toString() ? `${urlAgenda}?${params.toString()}` : urlAgenda;
            
            // Notificar usuário
            if (typeof Notifications !== 'undefined') {
                Notifications.info(`📋 Abrindo agenda de ${this.state.pessoaAtual}...`);
            }
            
            // Fazer redirecionamento
            console.log(`🔄 Redirecionando para: ${urlCompleta}`);
            window.location.href = urlCompleta;
            
        } catch (error) {
            console.error('❌ Erro ao abrir agenda dedicada:', error);
            
            // Fallback: tentar abrir em nova aba
            this._fallbackNovaAba();
        }
    },

    // ✅ ABRIR AGENDA EM NOVA ABA
    abrirAgendaNovaAba() {
        try {
            console.log('🔗 Abrindo agenda em nova aba...');
            
            this._definirUsuarioAtual();
            this._salvarEstadoNavegacao();
            
            const urlAgenda = this.config.urls.agendaDedicada;
            const params = new URLSearchParams();
            
            if (this.state.pessoaAtual && this.state.pessoaAtual !== 'Usuário') {
                params.append('usuario', this.state.pessoaAtual);
            }
            params.append('nova_aba', 'true');
            params.append('t', Date.now());
            
            const urlCompleta = params.toString() ? `${urlAgenda}?${params.toString()}` : urlAgenda;
            
            // Abrir nova aba
            const novaAba = window.open(urlCompleta, '_blank');
            
            if (novaAba) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.success(`🔗 Agenda de ${this.state.pessoaAtual} aberta em nova aba!`);
                }
                console.log('✅ Nova aba aberta com sucesso');
            } else {
                throw new Error('Popup bloqueado ou erro ao abrir nova aba');
            }
            
        } catch (error) {
            console.error('❌ Erro ao abrir nova aba:', error);
            
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('⚠️ Não foi possível abrir nova aba. Verifique bloqueador de popup.');
            }
            
            // Fallback: redirecionamento normal
            this.abrirMinhaAgenda();
        }
    },

    // 🔧 FUNÇÃO AUXILIAR: DEFINIR USUÁRIO ATUAL DINAMICAMENTE
    _definirUsuarioAtual() {
        try {
            let usuarioDetectado = null;
            let fonte = 'fallback';

            // Prioridade 1: Usuário do App.js (Firebase Auth)
            if (App && App.usuarioAtual && App.usuarioAtual.email) {
                usuarioDetectado = this._extrairNomeDoEmail(App.usuarioAtual.email);
                this.state.usuarioLogado = true;
                fonte = 'App.usuarioAtual';
            }
            // Prioridade 2: Usuário do Auth.js
            else if (typeof Auth !== 'undefined' && Auth.state && Auth.state.usuarioAtual) {
                const usuario = Auth.state.usuarioAtual;
                usuarioDetectado = usuario.displayName || this._extrairNomeDoEmail(usuario.email);
                this.state.usuarioLogado = true;
                fonte = 'Auth.state.usuarioAtual';
            }
            // Prioridade 3: Função global obterUsuarioAtual (se existir)
            else if (typeof obterUsuarioAtual === 'function') {
                const usuario = obterUsuarioAtual();
                if (usuario && usuario.nome) {
                    usuarioDetectado = usuario.nome;
                    this.state.usuarioLogado = true;
                    fonte = 'obterUsuarioAtual()';
                }
            }
            // Prioridade 4: SessionStorage (navegação anterior)
            else {
                const estadoNavegacao = sessionStorage.getItem('agenda_navegacao');
                if (estadoNavegacao) {
                    try {
                        const estado = JSON.parse(estadoNavegacao);
                        if (estado.usuario) {
                            usuarioDetectado = estado.usuario;
                            fonte = 'sessionStorage';
                        }
                    } catch (e) {
                        console.warn('⚠️ Erro ao ler sessionStorage:', e);
                    }
                }
            }

            // Fallback final
            if (!usuarioDetectado) {
                usuarioDetectado = 'Usuário';
                this.state.usuarioLogado = false;
                fonte = 'fallback';
            }

            this.state.pessoaAtual = usuarioDetectado;
            
            console.log(`👤 Usuário detectado: ${usuarioDetectado} (fonte: ${fonte})`);
            
        } catch (error) {
            console.error('❌ Erro ao definir usuário atual:', error);
            this.state.pessoaAtual = 'Usuário';
            this.state.usuarioLogado = false;
        }
    },

    // 🔧 EXTRAIR NOME DO EMAIL
    _extrairNomeDoEmail(email) {
        if (!email) return 'Usuário';
        
        const parteLocal = email.split('@')[0];
        
        // Casos especiais conhecidos da BIAPO
        const mapaUsuarios = {
            'renatoremiro': 'Renato Remiro',
            'isabella': 'Isabella',
            'eduardo': 'Eduardo',
            'lara': 'Lara',
            'beto': 'Beto',
            'admin': 'Administrador',
            'admin@biapo': 'Administrador BIAPO',
            'suporte': 'Suporte',
            'teste': 'Usuário Teste'
        };
        
        const usuarioMapeado = mapaUsuarios[parteLocal.toLowerCase()];
        if (usuarioMapeado) {
            return usuarioMapeado;
        }
        
        // Caso geral: capitalizar primeira letra e tentar limpar
        let nomeFormatado = parteLocal.charAt(0).toUpperCase() + parteLocal.slice(1);
        
        // Remover números do final (ex: user123 → User)
        nomeFormatado = nomeFormatado.replace(/\d+$/, '');
        
        // Tratar underscores e pontos (ex: joao_silva → Joao Silva)
        nomeFormatado = nomeFormatado.replace(/[_\.]/g, ' ');
        
        return nomeFormatado.trim() || 'Usuário';
    },

    // 💾 SALVAR ESTADO DE NAVEGAÇÃO
    _salvarEstadoNavegacao() {
        try {
            const estado = {
                usuario: this.state.pessoaAtual,
                usuarioLogado: this.state.usuarioLogado,
                timestamp: new Date().toISOString(),
                origem: this._obterOrigemPagina(),
                dadosApp: App && App.dados ? JSON.stringify(App.dados) : null,
                versao: this.state.versao
            };
            
            // Salvar no sessionStorage para a página agenda acessar
            sessionStorage.setItem('agenda_navegacao', JSON.stringify(estado));
            
            console.log('💾 Estado de navegação salvo:', {
                usuario: estado.usuario,
                origem: estado.origem,
                temDados: !!estado.dadosApp
            });
            
        } catch (error) {
            console.error('❌ Erro ao salvar estado de navegação:', error);
        }
    },

    // 🔍 OBTER ORIGEM DA PÁGINA
    _obterOrigemPagina() {
        try {
            const path = window.location.pathname;
            const filename = path.split('/').pop();
            
            if (filename.includes('index') || filename === '') {
                return 'Sistema Principal';
            } else if (filename.includes('agenda')) {
                return 'Agenda Dedicada';
            } else {
                return filename || 'Página Desconhecida';
            }
        } catch (error) {
            return 'Página Desconhecida';
        }
    },

    // 🔧 FALLBACK: NOVA ABA SE REDIRECIONAMENTO FALHAR
    _fallbackNovaAba() {
        try {
            console.log('🔄 Tentando fallback: nova aba...');
            
            const urlSimples = this.config.urls.agendaDedicada;
            window.open(urlSimples, '_blank');
            
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('⚠️ Redirecionamento falhou. Agenda aberta em nova aba.');
            }
            
        } catch (fallbackError) {
            console.error('❌ Fallback também falhou:', fallbackError);
            
            if (typeof Notifications !== 'undefined') {
                Notifications.error('❌ Erro ao abrir agenda. Verifique se arquivo agenda.html existe.');
            }
            
            // Último recurso: mostrar alerta com instruções
            alert(
                '⚠️ Não foi possível abrir a agenda automaticamente.\n\n' +
                'Por favor, abra manualmente o arquivo: agenda.html\n\n' +
                'Ou verifique se o arquivo existe no mesmo diretório.'
            );
        }
    },

    // ✅ VERIFICAR DEPENDÊNCIAS
    _verificarDependencias() {
        try {
            const dependencias = {
                App: typeof App !== 'undefined',
                Helpers: typeof Helpers !== 'undefined',
                Notifications: typeof Notifications !== 'undefined',
                Storage: typeof Storage !== 'undefined' || typeof sessionStorage !== 'undefined'
            };
            
            let dependenciasOk = 0;
            let dependenciasTotal = Object.keys(dependencias).length;
            
            Object.entries(dependencias).forEach(([nome, disponivel]) => {
                if (disponivel) {
                    dependenciasOk++;
                    console.log(`✅ ${nome} disponível`);
                } else {
                    console.warn(`⚠️ ${nome} não disponível`);
                }
            });
            
            console.log(`📊 Dependências: ${dependenciasOk}/${dependenciasTotal} disponíveis`);
            
            return dependencias.Storage; // Pelo menos storage deve funcionar
            
        } catch (error) {
            console.error('❌ Erro ao verificar dependências:', error);
            return false;
        }
    },

    // ⚙️ CONFIGURAR EVENTOS GLOBAIS
    _configurarEventosGlobais() {
        try {
            // Listener para mudanças no localStorage/sessionStorage
            window.addEventListener('storage', (e) => {
                if (e.key === 'agenda_navegacao' || e.key === 'agenda_acao') {
                    console.log('🔄 Estado de navegação alterado externamente');
                }
            });
            
            // Listener para beforeunload (opcional)
            window.addEventListener('beforeunload', () => {
                this._salvarEstadoNavegacao();
            });
            
            console.log('⚙️ Eventos globais configurados');
            
        } catch (error) {
            console.warn('⚠️ Erro ao configurar eventos globais:', error);
        }
    },

    // ✅ FUNÇÃO DE COMPATIBILIDADE: MOSTRAR NOVA TAREFA
    mostrarNovaTarefa(tipo = 'pessoal', responsavel = null) {
        try {
            console.log(`📝 Criando nova tarefa tipo: ${tipo}`);
            
            const responsavelFinal = responsavel || this.state.pessoaAtual;
            
            // Verificar se Tasks está disponível (sistema principal)
            if (typeof Tasks !== 'undefined' && typeof Tasks.mostrarNovaTarefa === 'function') {
                Tasks.mostrarNovaTarefa(tipo, responsavelFinal);
                return;
            }
            
            // Se Tasks não disponível, criar tarefa rápida e ir para agenda
            this._criarTarefaRapidaEIrParaAgenda(tipo, responsavelFinal);
            
        } catch (error) {
            console.error('❌ Erro ao mostrar nova tarefa:', error);
            
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao criar nova tarefa');
            }
        }
    },

    // 🚀 CRIAR TAREFA RÁPIDA E IR PARA AGENDA
    _criarTarefaRapidaEIrParaAgenda(tipo, responsavel) {
        try {
            const titulo = prompt(`📝 Título da nova tarefa ${tipo}:`);
            if (!titulo || titulo.trim() === '') {
                console.log('⏹️ Criação de tarefa cancelada');
                return;
            }
            
            const novaTarefa = {
                id: Date.now(),
                titulo: titulo.trim(),
                tipo: tipo,
                status: 'pendente',
                prioridade: tipo === 'urgente' ? 'alta' : 'media',
                responsavel: responsavel,
                dataCriacao: new Date().toISOString(),
                dataInicio: new Date().toISOString().split('T')[0]
            };
            
            // Garantir estrutura de dados
            if (typeof App !== 'undefined') {
                if (!App.dados) App.dados = {};
                if (!App.dados.tarefas) App.dados.tarefas = [];
                
                App.dados.tarefas.push(novaTarefa);
                
                // Tentar salvar se Persistence disponível
                if (typeof Persistence !== 'undefined') {
                    Persistence.salvarDadosCritico();
                }
            }
            
            // Salvar ação para processar na agenda
            sessionStorage.setItem('agenda_acao', JSON.stringify({
                tipo: 'nova_tarefa_criada',
                tarefaId: novaTarefa.id,
                timestamp: new Date().toISOString()
            }));
            
            console.log('✅ Tarefa rápida criada:', novaTarefa.titulo);
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`📝 Tarefa "${novaTarefa.titulo}" criada!`);
            }
            
            // Ir para agenda para ver/editar a tarefa
            setTimeout(() => {
                this.abrirMinhaAgenda();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erro ao criar tarefa rápida:', error);
            
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao criar tarefa rápida');
            }
        }
    },

    // ✅ FUNÇÕES DE COMPATIBILIDADE (manter para não quebrar código existente)
    
    // Editar tarefa - redireciona para agenda
    editarTarefa(tarefaId) {
        console.log(`✏️ Redirecionando para edição da tarefa: ${tarefaId}`);
        
        sessionStorage.setItem('agenda_acao', JSON.stringify({
            tipo: 'editar',
            tarefaId: tarefaId,
            timestamp: new Date().toISOString()
        }));
        
        this.abrirMinhaAgenda();
    },

    // Sincronizar e abrir agenda
    sincronizarComCalendario() {
        console.log('🔄 Sincronizando e abrindo agenda...');
        
        try {
            // Tentar sincronizar se HybridSync disponível
            if (typeof HybridSync !== 'undefined' && typeof HybridSync.sincronizarEventosParaTarefas === 'function') {
                HybridSync.sincronizarEventosParaTarefas();
                
                if (typeof Notifications !== 'undefined') {
                    Notifications.success('🔄 Sincronização iniciada!');
                }
            }
            
            // Ir para agenda
            setTimeout(() => {
                this.abrirMinhaAgenda();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            
            // Ir para agenda mesmo se sincronização falhar
            this.abrirMinhaAgenda();
        }
    },

    // Marcar tarefa como concluída (compatibilidade)
    marcarConcluida(tarefaId) {
        console.log(`✅ Marcando tarefa como concluída: ${tarefaId}`);
        
        sessionStorage.setItem('agenda_acao', JSON.stringify({
            tipo: 'marcar_concluida',
            tarefaId: tarefaId,
            timestamp: new Date().toISOString()
        }));
        
        this.abrirMinhaAgenda();
    },

    // Excluir tarefa (compatibilidade)
    excluirTarefa(tarefaId) {
        console.log(`🗑️ Redirecionando para exclusão da tarefa: ${tarefaId}`);
        
        sessionStorage.setItem('agenda_acao', JSON.stringify({
            tipo: 'excluir',
            tarefaId: tarefaId,
            timestamp: new Date().toISOString()
        }));
        
        this.abrirMinhaAgenda();
    },

    // ⚠️ FUNÇÕES OBSOLETAS (mantidas para compatibilidade)
    _criarModalAgenda() {
        console.warn('⚠️ _criarModalAgenda() obsoleta - redirecionando para página dedicada');
        this.abrirMinhaAgenda();
    },

    _mostrarModalNovaTarefa(tipo) {
        console.warn('⚠️ _mostrarModalNovaTarefa() obsoleta - usando nova implementação');
        this.mostrarNovaTarefa(tipo);
    },

    _renderizarConteudoAgenda() {
        console.warn('⚠️ _renderizarConteudoAgenda() obsoleta - função movida para agenda.html');
        this.abrirMinhaAgenda();
        return '';
    },

    // ✅ OBTER STATUS COMPLETO DO SISTEMA
    obterStatus() {
        return {
            // Informações do usuário
            pessoaAtual: this.state.pessoaAtual,
            usuarioLogado: this.state.usuarioLogado,
            emailDetectado: this._obterEmailUsuarioAtual(),
            
            // Informações do sistema
            versao: this.state.versao,
            tipoSistema: this.state.tipoSistema,
            modalObsoleto: this.state.modalObsoleto,
            navegacaoAtiva: this.state.navegacaoAtiva,
            
            // URLs e configuração
            agendaDedicada: this.config.urls.agendaDedicada,
            sistemaAtual: this._obterOrigemPagina(),
            
            // Dependências
            dependenciasOk: this._verificarDependencias(),
            appDisponivel: typeof App !== 'undefined',
            dadosCarregados: typeof App !== 'undefined' && !!App.dados,
            
            // Estado da navegação
            ultimaAtualizacao: this.state.ultimaAtualizacao,
            estadoSalvo: !!sessionStorage.getItem('agenda_navegacao'),
            
            // Compatibilidade
            funcoesDisponiveis: {
                abrirMinhaAgenda: typeof this.abrirMinhaAgenda === 'function',
                abrirAgendaNovaAba: typeof this.abrirAgendaNovaAba === 'function',
                mostrarNovaTarefa: typeof this.mostrarNovaTarefa === 'function',
                editarTarefa: typeof this.editarTarefa === 'function',
                sincronizarComCalendario: typeof this.sincronizarComCalendario === 'function'
            }
        };
    },

    // 🔧 OBTER EMAIL DO USUÁRIO ATUAL
    _obterEmailUsuarioAtual() {
        try {
            if (App && App.usuarioAtual && App.usuarioAtual.email) {
                return App.usuarioAtual.email;
            }
            
            if (typeof Auth !== 'undefined' && Auth.state && Auth.state.usuarioAtual) {
                return Auth.state.usuarioAtual.email;
            }
            
            if (typeof obterUsuarioAtual === 'function') {
                const usuario = obterUsuarioAtual();
                return usuario ? usuario.email : null;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao obter email do usuário:', error);
            return null;
        }
    },

    // 🔧 MÉTODOS AUXILIARES DE DADOS (compatibilidade)
    _obterMinhasTarefas() {
        try {
            if (!App.dados?.tarefas) return [];
            
            return App.dados.tarefas.filter(tarefa => {
                return tarefa.responsavel === this.state.pessoaAtual ||
                       tarefa.pessoas?.includes(this.state.pessoaAtual);
            });
        } catch (error) {
            console.error('❌ Erro ao obter tarefas:', error);
            return [];
        }
    },

    _obterAgendaSemanal() {
        try {
            if (!App.dados?.agendas?.[this.state.pessoaAtual]) {
                return {};
            }
            
            return App.dados.agendas[this.state.pessoaAtual] || {};
        } catch (error) {
            console.error('❌ Erro ao obter agenda semanal:', error);
            return {};
        }
    },

    // 🧪 FUNÇÃO DE DEBUG E TESTES
    debug() {
        const status = this.obterStatus();
        console.group('🧪 DEBUG PersonalAgenda v6.6.0');
        console.log('📊 Status completo:', status);
        console.log('👤 Usuário atual:', this.state.pessoaAtual);
        console.log('🔗 URL da agenda:', this.config.urls.agendaDedicada);
        console.log('💾 Estado salvo:', sessionStorage.getItem('agenda_navegacao'));
        console.log('📋 Minhas tarefas:', this._obterMinhasTarefas().length);
        console.log('📅 Agenda semanal:', this._obterAgendaSemanal());
        console.groupEnd();
        
        return status;
    }
};

// ✅ EXPOR NO WINDOW GLOBAL
window.PersonalAgenda = PersonalAgenda;

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    if (typeof PersonalAgenda !== 'undefined') {
        PersonalAgenda.init();
    }
});

// ✅ FUNÇÃO GLOBAL DE TESTE
window.testarPersonalAgenda = () => {
    console.log('🧪 Testando PersonalAgenda...');
    
    const status = PersonalAgenda.obterStatus();
    console.log('📊 Status:', status);
    
    if (typeof Notifications !== 'undefined') {
        Notifications.info(`✅ PersonalAgenda v${status.versao} funcionando!`);
    }
    
    return status;
};

// ✅ LOG DE INICIALIZAÇÃO COMPLETO
console.log('📋 PersonalAgenda v6.6.0 - PÁGINA DEDICADA INTEGRADA carregado!');
console.log('🔄 MUDANÇA PRINCIPAL: Modal → Redirecionamento para agenda.html');
console.log('📱 Uso principal: PersonalAgenda.abrirMinhaAgenda()');
console.log('🆕 Novas funções: PersonalAgenda.abrirAgendaNovaAba()');
console.log('✅ Compatibilidade: 100% mantida com código existente');
console.log('🧪 Debug: PersonalAgenda.debug() ou testarPersonalAgenda()');
console.log('📊 Status: PersonalAgenda.obterStatus()');
console.log('🎯 Sistema pronto para integração com agenda dedicada!');
