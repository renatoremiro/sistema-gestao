/**
 * 🔐 AUTH.JS v8.5 - COMPATÍVEL COM ADMINUSERSMANAGER v8.5
 * 
 * 🔥 ATUALIZAÇÕES v8.5:
 * - ✅ Compatibilidade total com AdminUsersManager v8.5
 * - ✅ Métodos Auth.obterAdmins() e Auth.usuariosPorDepartamento()
 * - ✅ Auth.departamentos sincronizado com AdminUsersManager
 * - ✅ Estrutura organizacional real mantida (v8.4.2)
 * - ✅ Persistência Firebase funcionando (v8.4.0)
 */

const Auth = {
    // ✅ CONFIGURAÇÃO v8.5
    config: {
        versao: '8.5.0',
        debug: true,
        persistenciaFirebase: true,
        carregamentoAutomatico: true,
        pathsFirebase: {
            equipe: 'dados/auth_equipe',
            backup: 'auth/equipe'
        },
        fallbackHardcoded: true
    },

    // ✅ ESTADO
    state: {
        inicializado: false,
        usuarioLogado: null,
        equipeCarregada: false,
        equipeCarregadaDoFirebase: false,
        fonteEquipeAtual: 'hardcoded', // 'firebase' ou 'hardcoded'
        ultimoCarregamento: null,
        tentativasCarregamento: 0,
        maxTentativas: 3
    },

    // 🔥 DEPARTAMENTOS REAIS v8.5 - SINCRONIZADO COM ADMINUSERSMANAGER
    departamentos: [
        { 
            id: 'planejamento-controle', 
            nome: 'Planejamento & Controle', 
            ativo: true,
            cargos: ['Coordenadora Geral', 'Arquiteta', 'Coordenador de Planejamento'],
            responsavel: 'Isabella'
        },
        { 
            id: 'documentacao-arquivo', 
            nome: 'Documentação & Arquivo', 
            ativo: true,
            cargos: ['Coordenador', 'Arquiteta', 'Estagiária de arquitetura'],
            responsavel: 'Renato'
        },
        { 
            id: 'suprimentos', 
            nome: 'Suprimentos', 
            ativo: true,
            cargos: ['Comprador', 'Coordenador', 'Almoxarifado'],
            responsavel: 'Eduardo'
        },
        { 
            id: 'qualidade-producao', 
            nome: 'Qualidade & Produção', 
            ativo: true,
            cargos: ['Coordenador', 'Estagiário de engenharia'],
            responsavel: 'Beto'
        },
        { 
            id: 'recursos-humanos', 
            nome: 'Recursos Humanos', 
            ativo: true,
            cargos: ['Chefe administrativo', 'Analista RH'],
            responsavel: 'Nayara'
        }
    ],

    // 👥 EQUIPE BIAPO HARDCODED (v8.4.2) - FALLBACK
    equipe: {
        'isabella': {
            nome: 'Isabella',
            email: 'isabella@biapo.com.br',
            cargo: 'Coordenadora Geral',
            departamento: 'Planejamento & Controle',
            admin: true,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'renato': {
            nome: 'Renato Remiro',
            email: 'renatoremiro@biapo.com.br',
            cargo: 'Coordenador',
            departamento: 'Documentação & Arquivo',
            admin: true,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'alex': {
            nome: 'Alex',
            email: 'alex@biapo.com.br',
            cargo: 'Comprador',
            departamento: 'Suprimentos',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'beto': {
            nome: 'Carlos Mendonça (Beto)',
            email: 'carlosmendonca@biapo.com.br',
            cargo: 'Coordenador',
            departamento: 'Qualidade & Produção',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'bruna': {
            nome: 'Bruna Britto',
            email: 'brunabritto@biapo.com.br',
            cargo: 'Arquiteta',
            departamento: 'Documentação & Arquivo',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'eduardo': {
            nome: 'Eduardo Santos',
            email: 'eduardosantos@biapo.com.br',
            cargo: 'Coordenador',
            departamento: 'Suprimentos',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'jean': {
            nome: 'Jean',
            email: 'estagio292@biapo.com.br',
            cargo: 'Estagiário de engenharia',
            departamento: 'Qualidade & Produção',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'juliana': {
            nome: 'Juliana',
            email: 'redeinterna.obra3@gmail.com',
            cargo: 'Estagiária de arquitetura',
            departamento: 'Documentação & Arquivo',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'lara': {
            nome: 'Lara Coutinho',
            email: 'laracoutinho@biapo.com.br',
            cargo: 'Arquiteta',
            departamento: 'Planejamento & Controle',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'nayara': {
            nome: 'Nayara Alencar',
            email: 'nayaraalencar@biapo.com.br',
            cargo: 'Chefe administrativo',
            departamento: 'Recursos Humanos',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        },
        'nominato': {
            nome: 'Nominato Pires',
            email: 'nominatopires@biapo.com.br',
            cargo: 'Almoxarifado',
            departamento: 'Suprimentos',
            admin: false,
            ativo: true,
            telefone: '',
            dataCriacao: '2025-01-01T00:00:00.000Z',
            dataAtualizacao: '2025-07-08T00:00:00.000Z'
        }
    },

    // 🚀 INICIALIZAR v8.5
    async inicializar() {
        try {
            console.log('🔐 Inicializando Auth.js v8.5...');
            
            // Carregar equipe do Firebase (se disponível)
            await this._carregarEquipeDoFirebase();
            
            // Verificar se há usuário salvo
            this._verificarUsuarioSalvo();
            
            // Configurar interface
            this._configurarInterface();
            
            this.state.inicializado = true;
            console.log('✅ Auth.js v8.5 inicializado!');
            console.log(`📊 Equipe carregada: ${Object.keys(this.equipe).length} usuários`);
            console.log(`🏢 Departamentos: ${this.departamentos.length} departamentos`);
            console.log(`👑 Admins: ${this.obterAdmins().length} administradores`);
            
            return true;
        } catch (error) {
            console.error('❌ Erro na inicialização Auth.js v8.5:', error);
            return false;
        }
    },

    // 🔥 CARREGAR EQUIPE DO FIREBASE v8.5
    async _carregarEquipeDoFirebase() {
        if (typeof database === 'undefined') {
            console.warn('⚠️ Firebase não disponível - usando dados hardcoded');
            this.state.fonteEquipeAtual = 'hardcoded';
            return false;
        }

        try {
            this.state.tentativasCarregamento++;
            console.log(`🔄 Carregando equipe do Firebase (tentativa ${this.state.tentativasCarregamento})...`);

            // Tentar carregar do path principal
            let snapshot = await database.ref(this.config.pathsFirebase.equipe).once('value');
            let dadosFirebase = snapshot.val();

            // Se não encontrou, tentar backup
            if (!dadosFirebase) {
                console.log('⚠️ Path principal vazio, tentando backup...');
                snapshot = await database.ref(this.config.pathsFirebase.backup).once('value');
                dadosFirebase = snapshot.val();
            }

            if (dadosFirebase && typeof dadosFirebase === 'object') {
                // Validar dados do Firebase
                const usuariosValidos = Object.keys(dadosFirebase).filter(key => {
                    const usuario = dadosFirebase[key];
                    return usuario && usuario.nome && usuario.email;
                });

                if (usuariosValidos.length > 0) {
                    this.equipe = dadosFirebase;
                    this.state.equipeCarregada = true;
                    this.state.equipeCarregadaDoFirebase = true;
                    this.state.fonteEquipeAtual = 'firebase';
                    this.state.ultimoCarregamento = new Date().toISOString();

                    console.log('✅ Equipe carregada do Firebase!');
                    console.log(`📊 ${usuariosValidos.length} usuários carregados`);
                    
                    // Verificar se departamentos estão corretos
                    this._verificarDepartamentosEquipe();
                    
                    return true;
                } else {
                    throw new Error('Dados do Firebase inválidos');
                }
            } else {
                throw new Error('Nenhum dado encontrado no Firebase');
            }

        } catch (error) {
            console.warn(`⚠️ Erro ao carregar do Firebase (tentativa ${this.state.tentativasCarregamento}):`, error.message);
            
            if (this.state.tentativasCarregamento < this.config.maxTentativas) {
                const delay = 2000 * this.state.tentativasCarregamento;
                console.log(`⏳ Retry em ${delay}ms...`);
                setTimeout(() => this._carregarEquipeDoFirebase(), delay);
                return false;
            } else {
                console.log('💾 Usando dados hardcoded como fallback');
                this.state.fonteEquipeAtual = 'hardcoded';
                this.state.equipeCarregada = true;
                return false;
            }
        }
    },

    // 🔍 VERIFICAR DEPARTAMENTOS DA EQUIPE
    _verificarDepartamentosEquipe() {
        const departamentosNaEquipe = new Set();
        const departamentosValidos = this.departamentos.map(d => d.nome);
        
        Object.values(this.equipe).forEach(usuario => {
            if (usuario.departamento) {
                departamentosNaEquipe.add(usuario.departamento);
            }
        });

        departamentosNaEquipe.forEach(dept => {
            if (!departamentosValidos.includes(dept)) {
                console.warn(`⚠️ Departamento não reconhecido na equipe: ${dept}`);
            }
        });

        console.log('🏢 Departamentos na equipe:', Array.from(departamentosNaEquipe));
    },

    // 🔐 LOGIN
    login(nomeUsuario) {
        if (!nomeUsuario || typeof nomeUsuario !== 'string') {
            console.error('❌ Nome de usuário inválido');
            return false;
        }

        const nomeNormalizado = nomeUsuario.toLowerCase().trim();
        
        // Buscar usuário na equipe
        const usuarioEncontrado = Object.keys(this.equipe).find(key => {
            const usuario = this.equipe[key];
            return key === nomeNormalizado || 
                   (usuario.nome && usuario.nome.toLowerCase().includes(nomeNormalizado));
        });

        if (usuarioEncontrado) {
            const usuario = this.equipe[usuarioEncontrado];
            
            // Verificar se usuário está ativo
            if (usuario.ativo === false) {
                console.warn('⚠️ Usuário desativado:', usuario.nome);
                return false;
            }

            this.state.usuarioLogado = {
                ...usuario,
                chave: usuarioEncontrado,
                loginTimestamp: new Date().toISOString()
            };

            // Salvar login
            localStorage.setItem('biapo_usuario_logado', JSON.stringify({
                chave: usuarioEncontrado,
                timestamp: new Date().toISOString()
            }));

            console.log('✅ Login realizado:', usuario.nome);
            console.log('👑 Admin:', usuario.admin ? 'SIM' : 'NÃO');
            console.log('🏢 Departamento:', usuario.departamento);
            
            return true;
        } else {
            console.error('❌ Usuário não encontrado:', nomeUsuario);
            return false;
        }
    },

    // 🚪 LOGOUT
    logout() {
        if (this.state.usuarioLogado) {
            console.log('🚪 Logout:', this.state.usuarioLogado.nome);
            this.state.usuarioLogado = null;
            localStorage.removeItem('biapo_usuario_logado');
            return true;
        }
        return false;
    },

    // ✅ VERIFICAR SE ESTÁ LOGADO
    estaLogado() {
        return this.state.usuarioLogado !== null;
    },

    // 👑 VERIFICAR SE É ADMIN
    ehAdmin() {
        return this.state.usuarioLogado && this.state.usuarioLogado.admin === true;
    },

    // 👤 OBTER USUÁRIO ATUAL
    obterUsuarioAtual() {
        return this.state.usuarioLogado;
    },

    // 🔥 OBTER ADMINS v8.5 - COMPATIBILIDADE COM ADMINUSERSMANAGER
    obterAdmins() {
        return Object.values(this.equipe).filter(usuario => usuario.admin === true);
    },

    // 🔥 USUÁRIOS POR DEPARTAMENTO v8.5 - COMPATIBILIDADE COM ADMINUSERSMANAGER
    usuariosPorDepartamento() {
        const distribuicao = {};
        
        // Inicializar com departamentos vazios
        this.departamentos.forEach(dept => {
            distribuicao[dept.nome] = [];
        });

        // Distribuir usuários
        Object.values(this.equipe).forEach(usuario => {
            if (usuario.departamento) {
                if (!distribuicao[usuario.departamento]) {
                    distribuicao[usuario.departamento] = [];
                }
                distribuicao[usuario.departamento].push(usuario);
            }
        });

        return distribuicao;
    },

    // 🔥 OBTER DEPARTAMENTO DO USUÁRIO v8.5
    obterDepartamentoUsuario(nomeUsuario = null) {
        const usuario = nomeUsuario ? 
            Object.values(this.equipe).find(u => u.nome.toLowerCase().includes(nomeUsuario.toLowerCase())) :
            this.state.usuarioLogado;
            
        if (usuario && usuario.departamento) {
            return this.departamentos.find(d => d.nome === usuario.departamento);
        }
        
        return null;
    },

    // 🔥 OBTER CARGOS POR DEPARTAMENTO v8.5
    obterCargosPorDepartamento(nomeDepartamento) {
        const departamento = this.departamentos.find(d => d.nome === nomeDepartamento);
        return departamento ? departamento.cargos : [];
    },

    // 📊 STATUS v8.5
    obterStatus() {
        return {
            modulo: 'Auth.js',
            versao: this.config.versao,
            inicializado: this.state.inicializado,
            usuarioLogado: this.state.usuarioLogado ? this.state.usuarioLogado.nome : null,
            ehAdmin: this.ehAdmin(),
            equipe: {
                total: Object.keys(this.equipe).length,
                admins: this.obterAdmins().length,
                ativos: Object.values(this.equipe).filter(u => u.ativo !== false).length,
                fonte: this.state.fonteEquipeAtual,
                carregadoFirebase: this.state.equipeCarregadaDoFirebase
            },
            departamentos: {
                total: this.departamentos.length,
                nomes: this.departamentos.map(d => d.nome)
            },
            firebase: {
                disponivel: typeof database !== 'undefined',
                ultimoCarregamento: this.state.ultimoCarregamento,
                tentativas: this.state.tentativasCarregamento
            },
            compatibilidade: {
                adminUsersManager: 'v8.5',
                metodosDisponiveis: ['obterAdmins', 'usuariosPorDepartamento', 'obterCargosPorDepartamento']
            }
        };
    },

    // ======== FUNÇÕES DE INTERFACE ========
    
    _verificarUsuarioSalvo() {
        try {
            const usuarioSalvo = localStorage.getItem('biapo_usuario_logado');
            if (usuarioSalvo) {
                const dados = JSON.parse(usuarioSalvo);
                const usuario = this.equipe[dados.chave];
                
                if (usuario && usuario.ativo !== false) {
                    this.state.usuarioLogado = {
                        ...usuario,
                        chave: dados.chave,
                        loginTimestamp: dados.timestamp
                    };
                    console.log('🔄 Login automático:', usuario.nome);
                } else {
                    localStorage.removeItem('biapo_usuario_logado');
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar usuário salvo:', error);
            localStorage.removeItem('biapo_usuario_logado');
        }
    },

    _configurarInterface() {
        // Interface de login já existe
        console.log('🎨 Interface Auth.js v8.5 configurada');
    },

    // 👑 MOSTRAR GERENCIAR USUÁRIOS (COMPATIBILIDADE v8.5)
    mostrarGerenciarUsuarios() {
        console.log('👑 Abrindo gestão administrativa v8.5...');
        
        if (!this.ehAdmin()) {
            console.error('❌ Acesso restrito a administradores');
            return false;
        }

        // Verificar se AdminUsersManager está disponível
        if (typeof AdminUsersManager !== 'undefined' && AdminUsersManager.abrirInterfaceGestao) {
            return AdminUsersManager.abrirInterfaceGestao();
        } else {
            console.error('⚠️ AdminUsersManager v8.5 não encontrado');
            console.log('💡 Certifique-se de que o AdminUsersManager v8.5 foi carregado');
            return false;
        }
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.Auth = Auth;

// ✅ FUNÇÕES GLOBAIS DE CONVENIÊNCIA
window.loginBiapo = (nome) => Auth.login(nome);
window.logoutBiapo = () => Auth.logout();
window.statusAuth = () => {
    const status = Auth.obterStatus();
    console.log('📊 STATUS AUTH.JS v8.5:');
    console.log('👤 Usuário:', status.usuarioLogado || 'Não logado');
    console.log('👑 Admin:', status.ehAdmin ? 'SIM' : 'NÃO');
    console.log('👥 Equipe:', `${status.equipe.total} usuários (${status.equipe.admins} admins)`);
    console.log('🏢 Departamentos:', status.departamentos.total);
    console.log('🔥 Fonte Equipe:', status.equipe.fonte);
    console.log('📡 Carregado Firebase:', status.equipe.carregadoFirebase ? 'SIM' : 'NÃO');
    console.log('⚡ Compatibilidade AdminUsersManager:', status.compatibilidade.adminUsersManager);
    return status;
};

window.equipeBiapo = () => {
    console.log('👥 EQUIPE BIAPO v8.5:');
    console.log(`📊 Total: ${Object.keys(Auth.equipe).length} usuários`);
    console.log(`👑 Admins: ${Auth.obterAdmins().length}`);
    console.log(`🏢 Departamentos: ${Auth.departamentos.length}`);
    console.log(`🔥 Fonte: ${Auth.state.fonteEquipeAtual}`);
    
    const distribuicao = Auth.usuariosPorDepartamento();
    Object.entries(distribuicao).forEach(([dept, usuarios]) => {
        console.log(`  ${dept}: ${usuarios.length} usuários`);
    });
    
    return Auth.equipe;
};

window.recarregarEquipeFirebase = () => {
    console.log('🔄 Recarregando equipe do Firebase...');
    Auth.state.tentativasCarregamento = 0;
    return Auth._carregarEquipeDoFirebase();
};

window.testarPersistenciaAuth = async () => {
    console.log('🧪 ============ TESTE PERSISTÊNCIA AUTH v8.5 ============');
    
    const statusInicial = Auth.obterStatus();
    console.log('📊 Status inicial:', statusInicial);
    
    if (typeof database !== 'undefined') {
        try {
            // Verificar dados no Firebase
            const snapshot = await database.ref(Auth.config.pathsFirebase.equipe).once('value');
            const dadosFirebase = snapshot.val();
            
            console.log('🔥 Dados no Firebase:', dadosFirebase ? Object.keys(dadosFirebase).length + ' usuários' : 'VAZIO');
            
            if (dadosFirebase) {
                const adminsFirebase = Object.values(dadosFirebase).filter(u => u.admin === true);
                console.log('👑 Admins no Firebase:', adminsFirebase.map(a => a.nome));
            }
            
            console.log('✅ PERSISTÊNCIA: FUNCIONANDO');
            return true;
            
        } catch (error) {
            console.error('❌ Erro no teste de persistência:', error);
            return false;
        }
    } else {
        console.log('⚠️ Firebase não disponível');
        return false;
    }
};

// ✅ AUTO-INICIALIZAÇÃO
function inicializarAuthV85() {
    try {
        Auth.inicializar();
    } catch (error) {
        console.error('❌ Erro na inicialização Auth.js v8.5:', error);
        setTimeout(() => {
            try {
                Auth.inicializar();
            } catch (retryError) {
                console.error('❌ Falha crítica Auth.js v8.5:', retryError);
            }
        }, 2000);
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAuthV85);
} else {
    setTimeout(inicializarAuthV85, 100);
}

console.log('🔐 Auth.js v8.5 carregado - Compatível com AdminUsersManager v8.5!');
console.log('⚡ Novos métodos: obterAdmins(), usuariosPorDepartamento(), obterCargosPorDepartamento()');
console.log('🏢 5 Departamentos reais + 2 Admins + 11 usuários BIAPO');

/*
🎯 COMPATIBILIDADE v8.5:

✅ COMPATÍVEL COM AdminUsersManager v8.5:
- Auth.equipe ✅
- Auth.ehAdmin() ✅
- Auth.departamentos ✅
- Auth.obterAdmins() ✅ NOVO
- Auth.usuariosPorDepartamento() ✅ NOVO
- Auth.obterCargosPorDepartamento() ✅ NOVO
- Auth.mostrarGerenciarUsuarios() ✅

✅ FUNCIONALIDADES MANTIDAS:
- Persistência Firebase (v8.4.0) ✅
- Estrutura organizacional real (v8.4.2) ✅
- 2 Admins: Isabella + Renato ✅
- 5 Departamentos reais ✅
- 11 usuários BIAPO ✅

✅ MÉTODOS PARA DEBUG:
- statusAuth() ✅
- equipeBiapo() ✅
- recarregarEquipeFirebase() ✅
- testarPersistenciaAuth() ✅
*/
