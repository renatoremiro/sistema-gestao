/**
 * 📊 Sistema de Estrutura de Dados v8.3 - CORRIGIDO SEM DUPLICIDADE
 * 
 * 🔥 CORREÇÃO CRÍTICA: Removida duplicidade de usuários
 * ✅ REFERÊNCIA: Aponta para Auth.equipe como fonte única
 * ✅ COMPATIBILIDADE: Mantém funções necessárias
 */

const DataStructure = {
    // ✅ CONFIGURAÇÕES GLOBAIS
    config: {
        versao: '8.3.0', // ATUALIZADO
        dataAtualizacao: '2025-07-07',
        autoSave: true,
        validacao: true,
        cache: true,
        maxEventos: 1000,
        maxTarefas: 500,
        maxBackups: 5
    },

    // 🔥 USUÁRIOS REMOVIDOS - USAR Auth.equipe COMO FONTE ÚNICA
    // usuariosBiapo: REMOVIDO - EVITA DUPLICIDADE

    // ✅ CONFIGURAÇÕES DOS MÓDULOS
    modulosConfig: {
        auth: {
            ativo: true,
            autoLogin: true,
            sessionTimeout: 3600000, // 1 hora
            maxTentativas: 3
        },
        calendar: {
            ativo: true,
            viewType: 'month',
            weekStart: 1, // Segunda-feira
            showWeekends: true,
            showFeriados: true
        },
        events: {
            ativo: true,
            autoSave: true,
            validacao: true,
            maxRecorrencia: 365,
            alertas: true
        },
        tasks: {
            ativo: true,
            autoSave: true,
            validacao: true,
            progressoAuto: false,
            notificacoes: true
        },
        persistence: {
            ativo: true,
            autoSave: true,
            intervalo: 30000, // 30 segundos
            backup: true,
            compressao: false
        }
    },

    // ✅ FERIADOS NACIONAIS 2025
    feriadosNacionais2025: {
        '2025-01-01': { nome: 'Confraternização Universal', tipo: 'nacional' },
        '2025-02-17': { nome: 'Carnaval', tipo: 'nacional' },
        '2025-02-18': { nome: 'Carnaval', tipo: 'nacional' },
        '2025-04-18': { nome: 'Sexta-feira Santa', tipo: 'nacional' },
        '2025-04-21': { nome: 'Tiradentes', tipo: 'nacional' },
        '2025-05-01': { nome: 'Dia do Trabalhador', tipo: 'nacional' },
        '2025-09-07': { nome: 'Independência do Brasil', tipo: 'nacional' },
        '2025-10-12': { nome: 'Nossa Senhora Aparecida', tipo: 'nacional' },
        '2025-11-02': { nome: 'Finados', tipo: 'nacional' },
        '2025-11-15': { nome: 'Proclamação da República', tipo: 'nacional' },
        '2025-12-25': { nome: 'Natal', tipo: 'nacional' }
    },

    // 🔥 INICIALIZAR DADOS CORRIGIDO - SEM CONFLITO DE USUÁRIOS
    inicializarDados() {
        return {
            areas: {
                "area-geral": {
                    nome: "Gestão Geral",
                    coordenador: "Renato Remiro",
                    cor: "#C53030",
                    equipe: [
                        "Renato Remiro",
                        "Bruna Britto", 
                        "Lara Coutinho",
                        "Jean (Estagiário)"
                    ],
                    atividades: [
                        {
                            id: 'ativ_001',
                            nome: 'Planejamento Semanal',
                            responsavel: 'Renato Remiro',
                            prazo: '2025-07-10',
                            status: 'verde',
                            progresso: 85,
                            descricao: 'Organizar cronograma da semana'
                        },
                        {
                            id: 'ativ_002',
                            nome: 'Relatório Mensal',
                            responsavel: 'Bruna Britto',
                            prazo: '2025-07-15',
                            status: 'amarelo',
                            progresso: 60,
                            descricao: 'Compilar dados do mês'
                        }
                    ]
                },
                "area-obra": {
                    nome: "Obra e Construção", 
                    coordenador: "Carlos Mendonça (Beto)",
                    cor: "#DD6B20",
                    equipe: [
                        "Carlos Mendonça (Beto)",
                        "Eduardo Santos",
                        "Isabella",
                        "Alex"
                    ],
                    atividades: [
                        {
                            id: 'ativ_003',
                            nome: 'Inspeção Estrutural',
                            responsavel: 'Eduardo Santos',
                            prazo: '2025-07-08',
                            status: 'vermelho',
                            progresso: 30,
                            descricao: 'Verificar integridade estrutural'
                        },
                        {
                            id: 'ativ_004',
                            nome: 'Instalações Elétricas',
                            responsavel: 'Alex',
                            prazo: '2025-07-12',
                            status: 'verde',
                            progresso: 90,
                            descricao: 'Finalizar instalações elétricas'
                        }
                    ]
                },
                "area-museu": {
                    nome: "Museu Nacional",
                    coordenador: "Nominato Pires",
                    cor: "#2D3748",
                    equipe: [
                        "Nominato Pires",
                        "Nayara Alencar",
                        "Juliana (Rede Interna)"
                    ],
                    atividades: [
                        {
                            id: 'ativ_005',
                            nome: 'Catalogação de Peças',
                            responsavel: 'Nayara Alencar',
                            prazo: '2025-07-20',
                            status: 'verde',
                            progresso: 75,
                            descricao: 'Catalogar novas aquisições'
                        }
                    ]
                }
            },
            eventos: [],
            tarefas: [],
            feriados: {},
            configuracoes: this.modulosConfig,
            
            // 🔥 USUÁRIOS: REFERÊNCIA AO Auth.equipe - NÃO COPIA
            usuarios: this._obterUsuariosDoAuth(),
            
            metadata: {
                versao: this.config.versao,
                ultimaAtualizacao: new Date().toISOString(),
                ultimoUsuario: this._obterUsuarioAtual(),
                totalUsuarios: this._contarUsuariosAuth(),
                fonteUsuarios: 'Auth.equipe' // IDENTIFICAR FONTE
            }
        };
    },

    // 🔥 NOVA FUNÇÃO: OBTER USUÁRIOS DO AUTH (FONTE ÚNICA)
    _obterUsuariosDoAuth() {
        try {
            if (typeof Auth !== 'undefined' && Auth.equipe) {
                return Auth.equipe; // REFERÊNCIA DIRETA
            }
            console.warn('⚠️ Auth.equipe não disponível, retornando objeto vazio');
            return {};
        } catch (error) {
            console.error('❌ Erro ao acessar Auth.equipe:', error);
            return {};
        }
    },

    // 🔥 NOVA FUNÇÃO: CONTAR USUÁRIOS DO AUTH
    _contarUsuariosAuth() {
        try {
            if (typeof Auth !== 'undefined' && Auth.equipe) {
                return Object.keys(Auth.equipe).length;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    },

    // 🔥 VALIDAR ESTRUTURA - CORRIGIDA PARA NÃO SOBRESCREVER USUÁRIOS
    validarEstrutura(dados) {
        if (!dados || typeof dados !== 'object') {
            console.warn('❌ DATA: Dados inválidos, inicializando estrutura padrão');
            return false;
        }
        
        // 🔥 GARANTIR estruturas ANTES de validar
        if (!dados.areas) {
            dados.areas = {};
        }
        if (!dados.eventos) {
            dados.eventos = [];
        }
        if (!dados.tarefas) {
            dados.tarefas = [];
        }
        if (!dados.feriados) {
            dados.feriados = {};
        }
        if (!dados.configuracoes) {
            dados.configuracoes = this.modulosConfig;
        }
        
        // 🔥 USUÁRIOS: NÃO SOBRESCREVER - MANTER Auth.equipe
        if (!dados.usuarios) {
            dados.usuarios = this._obterUsuariosDoAuth();
        }
        
        if (!dados.metadata) {
            dados.metadata = {
                versao: this.config.versao,
                ultimaAtualizacao: new Date().toISOString(),
                ultimoUsuario: this._obterUsuarioAtual(),
                totalUsuarios: this._contarUsuariosAuth(),
                fonteUsuarios: 'Auth.equipe'
            };
        }
        
        // Validar e corrigir estrutura das áreas
        if (dados.areas && typeof dados.areas === 'object') {
            for (const [chave, area] of Object.entries(dados.areas)) {
                if (!area.nome || !area.coordenador) {
                    // Corrigir área com estrutura inválida
                    area.nome = area.nome || `Área ${chave}`;
                    area.coordenador = area.coordenador || 'Coordenador';
                    area.cor = area.cor || '#6b7280';
                    area.equipe = area.equipe || [];
                    area.atividades = area.atividades || [];
                }
                
                // Garantir que equipe e atividades são arrays
                if (!Array.isArray(area.equipe)) {
                    area.equipe = [];
                }
                if (!Array.isArray(area.atividades)) {
                    area.atividades = [];
                }
            }
        }
        
        // Garantir que eventos e tarefas são arrays
        if (!Array.isArray(dados.eventos)) {
            dados.eventos = [];
        }
        if (!Array.isArray(dados.tarefas)) {
            dados.tarefas = [];
        }
        
        // 🔥 SEMPRE retornar TRUE após garantir/corrigir estruturas
        return true;
    },

    // ✅ CALCULAR ESTATÍSTICAS
    calcularEstatisticas(dados) {
        if (!dados || !dados.areas) {
            return { emDia: 0, atencao: 0, atraso: 0, total: 0 };
        }

        let stats = { emDia: 0, atencao: 0, atraso: 0, total: 0 };

        Object.values(dados.areas).forEach(area => {
            if (area.atividades && Array.isArray(area.atividades)) {
                area.atividades.forEach(atividade => {
                    stats.total++;
                    switch (atividade.status) {
                        case 'verde':
                        case 'concluido':
                        case 'concluída':
                            stats.emDia++;
                            break;
                        case 'amarelo':
                        case 'atencao':
                        case 'em andamento':
                            stats.atencao++;
                            break;
                        case 'vermelho':
                        case 'atraso':
                        case 'atrasado':
                            stats.atraso++;
                            break;
                        default:
                            stats.atencao++;
                    }
                });
            }
        });

        return stats;
    },

    // 🔥 OBTER USUÁRIO - DELEGADO PARA Auth.js
    obterUsuario(email) {
        try {
            if (typeof Auth !== 'undefined' && Auth.equipe) {
                // Buscar por email nas chaves ou nos valores
                for (const [key, usuario] of Object.entries(Auth.equipe)) {
                    if (usuario.email === email || key === email) {
                        return usuario;
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao obter usuário:', error);
            return null;
        }
    },

    // 🔥 LISTAR USUÁRIOS - DELEGADO PARA Auth.js
    listarUsuarios(filtros = {}) {
        try {
            if (typeof Auth !== 'undefined' && Auth.equipe) {
                let usuarios = Object.values(Auth.equipe);

                if (filtros.ativo !== undefined) {
                    usuarios = usuarios.filter(u => u.ativo === filtros.ativo);
                }

                if (filtros.departamento) {
                    usuarios = usuarios.filter(u => u.departamento === filtros.departamento);
                }

                if (filtros.administrador !== undefined) {
                    usuarios = usuarios.filter(u => u.admin === filtros.administrador);
                }

                return usuarios.sort((a, b) => a.nome.localeCompare(b.nome));
            }
            return [];
        } catch (error) {
            console.error('❌ DATA: Erro ao listar usuários:', error);
            return [];
        }
    },

    // 🔥 FUNÇÕES DE USUÁRIO DELEGADAS PARA Auth.js
    adicionarUsuario(dadosUsuario) {
        console.warn('⚠️ Use AdminUsersManager para adicionar usuários');
        return false;
    },

    atualizarUsuario(email, dadosAtualizacao) {
        console.warn('⚠️ Use AdminUsersManager para atualizar usuários');
        return false;
    },

    desativarUsuario(email) {
        console.warn('⚠️ Use AdminUsersManager para desativar usuários');
        return false;
    },

    // ✅ OBTER FERIADOS
    obterFeriados(ano = 2025) {
        if (ano === 2025) {
            return this.feriadosNacionais2025;
        }
        return {};
    },

    // ✅ VERIFICAR FERIADO
    ehFeriado(data) {
        const feriados = this.obterFeriados();
        return feriados.hasOwnProperty(data);
    },

    // ✅ MÉTODOS AUXILIARES
    _obterUsuarioAtual() {
        try {
            if (typeof window !== 'undefined' && window.App && window.App.usuarioAtual) {
                return window.App.usuarioAtual.email || window.App.usuarioAtual.displayName || 'Sistema';
            }
            return 'Sistema';
        } catch {
            return 'Sistema';
        }
    },

    // ✅ OBTER STATUS
    obterStatus() {
        return {
            modulo: 'DataStructure',
            versao: this.config.versao,
            status: 'CORRIGIDO SEM DUPLICIDADE',
            usuariosDoAuth: this._contarUsuariosAuth(),
            fonteUsuarios: 'Auth.equipe',
            funcoes: {
                inicializarDados: typeof this.inicializarDados === 'function',
                validarEstrutura: typeof this.validarEstrutura === 'function',
                calcularEstatisticas: typeof this.calcularEstatisticas === 'function'
            },
            exposicaoGlobal: typeof window !== 'undefined' && window.DataStructure === this,
            integracao: {
                authDisponivel: typeof Auth !== 'undefined',
                authEquipe: typeof Auth !== 'undefined' && !!Auth.equipe
            }
        };
    }
};

// 🔥 EXPOSIÇÃO GLOBAL CRÍTICA - GARANTIDA
if (typeof window !== 'undefined') {
    window.DataStructure = DataStructure;
    
    // Verificação de exposição
    setTimeout(() => {
        if (window.DataStructure) {
            console.log('✅ DataStructure v8.3 SEM DUPLICIDADE exposto globalmente!');
        } else {
            console.error('❌ FALHA CRÍTICA: DataStructure não exposto!');
        }
    }, 100);
}

// ✅ DEBUG OTIMIZADO
if (typeof window !== 'undefined') {
    window.DataStructure_Debug = {
        status: () => DataStructure.obterStatus(),
        usuarios: () => DataStructure.listarUsuarios(),
        fonteUsuarios: () => {
            console.log('🔍 Verificando fonte de usuários:');
            console.log('Auth.equipe disponível:', typeof Auth !== 'undefined' && !!Auth.equipe);
            console.log('Total usuários Auth:', DataStructure._contarUsuariosAuth());
            return {
                fonte: 'Auth.equipe',
                disponivel: typeof Auth !== 'undefined' && !!Auth.equipe,
                total: DataStructure._contarUsuariosAuth(),
                primeiroUsuario: typeof Auth !== 'undefined' && Auth.equipe ? Object.keys(Auth.equipe)[0] : 'nenhum'
            };
        },
        testar: () => {
            console.log('🧪 TESTE DataStructure v8.3:');
            console.log('- inicializarDados:', typeof DataStructure.inicializarDados);
            console.log('- validarEstrutura:', typeof DataStructure.validarEstrutura);
            console.log('- calcularEstatisticas:', typeof DataStructure.calcularEstatisticas);
            console.log('- Fonte usuários:', DataStructure._obterUsuariosDoAuth() ? 'Auth.equipe' : 'ERRO');
            
            const dados = DataStructure.inicializarDados();
            const valido = DataStructure.validarEstrutura(dados);
            const stats = DataStructure.calcularEstatisticas(dados);
            
            return { dados, valido, stats };
        }
    };
}

// ✅ LOG FINAL
console.log('✅ DataStructure v8.3 - SEM DUPLICIDADE! Fonte única: Auth.equipe');

/*
🔥 CORREÇÕES APLICADAS v8.3:
- ❌ Removido usuariosBiapo (duplicidade eliminada)
- ✅ _obterUsuariosDoAuth(): Referência direta ao Auth.equipe
- ✅ Validação não sobrescreve usuários
- ✅ Inicialização usa Auth.equipe como fonte única
- ✅ Funções de gestão delegadas ao AdminUsersManager
- ✅ Debug mostra fonte de usuários
- ✅ Status identifica fonte como Auth.equipe

🎯 RESULTADO:
- Uma única fonte de usuários: Auth.equipe ✅
- DataStructure não cria conflito ✅  
- AdminUsersManager pode persistir sem interferência ✅
- Firebase vai receber dados corretos ✅
- DUPLICIDADE ELIMINADA DEFINITIVAMENTE ✅
*/
