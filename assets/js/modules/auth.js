// auth.js v8.4.1 - CORREÇÃO PERSISTÊNCIA DEPARTAMENTOS
// Módulo de autenticação com carregamento completo do Firebase

const Auth = {
    // Estado do sistema de autenticação
    state: {
        usuarioAtual: null,
        isLoggedIn: false,
        equipeCarregadaDoFirebase: false,
        fonteEquipeAtual: 'hardcoded', // 'firebase' | 'hardcoded'
        fonteDepartamentosAtual: 'hardcoded', // 'firebase' | 'hardcoded'
        departamentosCarregadosDoFirebase: false
    },

    // Configuração dos paths do Firebase
    config: {
        pathsFirebase: {
            usuarios: 'dados/auth_equipe',
            departamentos: 'dados/departamentos' // ← NOVO PATH para departamentos
        }
    },

    // ===== CORREÇÃO v8.4.1: DEPARTAMENTOS PERSISTENTES =====
    
    // Departamentos hardcoded como fallback
    departamentosHardcoded: [
        "Gestão Geral",
        "Suprimentos", 
        "Qualidade & Produção",
        "Documentação & Arquivo",
        "Planejamento & Controle",
        "Recursos Humanos"
    ],

    // Departamentos em memória (carregados do Firebase ou fallback)
    departamentos: [],

    // ===== FUNÇÃO NOVA: CARREGAR DEPARTAMENTOS DO FIREBASE =====
    async _carregarDepartamentosDoFirebase() {
        console.log('🏢 Auth: Carregando departamentos do Firebase...');
        
        try {
            if (!window.database) {
                console.log('❌ Firebase não disponível - usando departamentos hardcoded');
                this.departamentos = [...this.departamentosHardcoded];
                this.state.fonteDepartamentosAtual = 'hardcoded';
                return false;
            }

            const snapshot = await database.ref(this.config.pathsFirebase.departamentos).once('value');
            const departamentosFirebase = snapshot.val();

            if (departamentosFirebase && Object.keys(departamentosFirebase).length > 0) {
                // Carregar departamentos do Firebase
                this.departamentos = Object.keys(departamentosFirebase);
                this.state.departamentosCarregadosDoFirebase = true;
                this.state.fonteDepartamentosAtual = 'firebase';
                
                console.log(`✅ Auth: ${this.departamentos.length} departamentos carregados do Firebase`);
                console.log('📋 Departamentos:', this.departamentos);
                return true;
                
            } else {
                console.log('⚠️ Nenhum departamento no Firebase - usando hardcoded');
                this.departamentos = [...this.departamentosHardcoded];
                this.state.fonteDepartamentosAtual = 'hardcoded';
                return false;
            }

        } catch (error) {
            console.error('❌ Erro ao carregar departamentos do Firebase:', error);
            this.departamentos = [...this.departamentosHardcoded];
            this.state.fonteDepartamentosAtual = 'hardcoded';
            return false;
        }
    },

    // ===== FUNÇÃO NOVA: SALVAR DEPARTAMENTOS NO FIREBASE =====
    async salvarDepartamentosNoFirebase(listaDepartamentos) {
        console.log('💾 Auth: Salvando departamentos no Firebase...');
        
        try {
            if (!window.database) {
                console.log('❌ Firebase não disponível - não é possível salvar departamentos');
                return false;
            }

            // Converter array de departamentos para objeto Firebase
            const departamentosParaFirebase = {};
            listaDepartamentos.forEach(dept => {
                departamentosParaFirebase[dept] = {
                    nome: dept,
                    ativo: true,
                    criadoEm: new Date().toISOString()
                };
            });

            await database.ref(this.config.pathsFirebase.departamentos).set(departamentosParaFirebase);
            
            // Atualizar estado local
            this.departamentos = [...listaDepartamentos];
            this.state.departamentosCarregadosDoFirebase = true;
            this.state.fonteDepartamentosAtual = 'firebase';
            
            console.log(`✅ ${listaDepartamentos.length} departamentos salvos no Firebase`);
            console.log('📋 Salvos:', listaDepartamentos);
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar departamentos no Firebase:', error);
            return false;
        }
    },

    // ===== MODIFICAÇÃO v8.4.1: CARREGAR USUÁRIOS + DEPARTAMENTOS =====
    async _carregarEquipeDoFirebase() {
        console.log('👥 Auth: Carregando equipe do Firebase...');
        
        try {
            if (!window.database) {
                console.log('❌ Firebase não disponível - usando dados hardcoded');
                this._aplicarDadosHardcoded();
                return false;
            }

            const snapshot = await database.ref(this.config.pathsFirebase.usuarios).once('value');
            const usuariosFirebase = snapshot.val();

            if (usuariosFirebase && Object.keys(usuariosFirebase).length > 0) {
                // Carregar usuários do Firebase
                this.equipe = usuariosFirebase;
                this.state.equipeCarregadaDoFirebase = true;
                this.state.fonteEquipeAtual = 'firebase';
                
                console.log(`✅ Auth: ${Object.keys(usuariosFirebase).length} usuários carregados do Firebase`);
                
                // ===== NOVO v8.4.1: CARREGAR DEPARTAMENTOS TAMBÉM =====
                await this._carregarDepartamentosDoFirebase();
                
                return true;
                
            } else {
                console.log('⚠️ Nenhum usuário no Firebase - aplicando dados hardcoded');
                this._aplicarDadosHardcoded();
                return false;
            }

        } catch (error) {
            console.error('❌ Erro ao carregar equipe do Firebase:', error);
            this._aplicarDadosHardcoded();
            return false;
        }
    },

    // Aplicar dados hardcoded como fallback
    _aplicarDadosHardcoded() {
        this.equipe = { ...this.equipeHardcoded };
        this.departamentos = [...this.departamentosHardcoded];
        this.state.equipeCarregadaDoFirebase = false;
        this.state.departamentosCarregadosDoFirebase = false;
        this.state.fonteEquipeAtual = 'hardcoded';
        this.state.fonteDepartamentosAtual = 'hardcoded';
        console.log('📦 Dados hardcoded aplicados como fallback');
    },

    // ===== RESTO DO CÓDIGO MANTIDO =====
    
    // Equipe BIAPO hardcoded (fallback)
    equipeHardcoded: {
        renato: {
            id: 'renato',
            nome: 'Renato Remiro',
            email: 'renatoremiro@biapo.com.br',
            cargo: 'Coordenador Geral',
            departamento: 'Gestão Geral',
            permissoes: 'admin',
            telefone: '',
            ativo: true
        },
        alex: {
            id: 'alex',
            nome: 'Alex',
            email: 'alex@biapo.com.br',
            cargo: 'Comprador',
            departamento: 'Suprimentos',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        carlos: {
            id: 'carlos',
            nome: 'Carlos Mendonça (Beto)',
            email: 'carlosmendonca@biapo.com.br',
            cargo: 'Coordenador',
            departamento: 'Qualidade & Produção',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        bruna: {
            id: 'bruna',
            nome: 'Bruna Britto',
            email: 'brunabritto@biapo.com.br',
            cargo: 'Arquiteta',
            departamento: 'Documentação & Arquivo',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        eduardo: {
            id: 'eduardo',
            nome: 'Eduardo Santos',
            email: 'eduardosantos@biapo.com.br',
            cargo: 'Coordenador',
            departamento: 'Suprimentos',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        isabella: {
            id: 'isabella',
            nome: 'Isabella',
            email: 'isabella@biapo.com.br',
            cargo: 'Coordenadora Geral',
            departamento: 'Planejamento & Controle',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        jean: {
            id: 'jean',
            nome: 'Jean (Estagiário)',
            email: 'estagio292@biapo.com.br',
            cargo: 'Estagiário de engenharia',
            departamento: 'Qualidade & Produção',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        juliana: {
            id: 'juliana',
            nome: 'Juliana (Rede Interna)',
            email: 'redeinterna.obra3@gmail.com',
            cargo: 'Estagiária de arquitetura',
            departamento: 'Documentação & Arquivo',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        lara: {
            id: 'lara',
            nome: 'Lara Coutinho',
            email: 'laracoutinho@biapo.com.br',
            cargo: 'Arquiteta',
            departamento: 'Planejamento & Controle',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        nayara: {
            id: 'nayara',
            nome: 'Nayara Alencar',
            email: 'nayaraalencar@biapo.com.br',
            cargo: 'Chefe administrativo',
            departamento: 'Recursos Humanos',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        },
        nominato: {
            id: 'nominato',
            nome: 'Nominato Pires',
            email: 'nominatopires@biapo.com.br',
            cargo: 'Almoxarifado',
            departamento: 'Suprimentos',
            permissoes: 'editor',
            telefone: '',
            ativo: true
        }
    },

    // Equipe em memória (carregada do Firebase ou hardcoded)
    equipe: {},

    // Inicialização do módulo auth
    async inicializar() {
        console.log('🚀 Auth: Inicializando sistema...');
        
        // Carregar dados do Firebase (usuários + departamentos)
        await this._carregarEquipeDoFirebase();
        
        // Verificar se há usuário salvo no localStorage
        const usuarioSalvo = localStorage.getItem('usuario_biapo');
        if (usuarioSalvo) {
            const dadosUsuario = JSON.parse(usuarioSalvo);
            this.state.usuarioAtual = dadosUsuario;
            this.state.isLoggedIn = true;
            console.log(`👤 Auto-login: ${dadosUsuario.nome}`);
        }
        
        console.log('✅ Auth: Sistema inicializado');
        this._exibirStatusCarregamento();
    },

    // Exibir status do carregamento
    _exibirStatusCarregamento() {
        console.log('\n📊 STATUS AUTH v8.4.1:');
        console.log(`   👥 Usuários: ${Object.keys(this.equipe).length} (fonte: ${this.state.fonteEquipeAtual})`);
        console.log(`   🏢 Departamentos: ${this.departamentos.length} (fonte: ${this.state.fonteDepartamentosAtual})`);
        console.log(`   🔑 Logado: ${this.state.isLoggedIn ? this.state.usuarioAtual?.nome : 'Não'}`);
        console.log(`   🔥 Firebase Usuários: ${this.state.equipeCarregadaDoFirebase ? 'SIM' : 'NÃO'}`);
        console.log(`   🔥 Firebase Departamentos: ${this.state.departamentosCarregadosDoFirebase ? 'SIM' : 'NÃO'}`);
    },

    // Função de login
    login(nomeUsuario) {
        const usuario = this.equipe[nomeUsuario.toLowerCase()];
        
        if (!usuario) {
            console.log(`❌ Usuário '${nomeUsuario}' não encontrado`);
            return false;
        }
        
        if (!usuario.ativo) {
            console.log(`❌ Usuário '${nomeUsuario}' está inativo`);
            return false;
        }
        
        this.state.usuarioAtual = usuario;
        this.state.isLoggedIn = true;
        
        // Salvar no localStorage
        localStorage.setItem('usuario_biapo', JSON.stringify(usuario));
        
        console.log(`✅ Login realizado: ${usuario.nome}`);
        return true;
    },

    // Função de logout
    logout() {
        this.state.usuarioAtual = null;
        this.state.isLoggedIn = false;
        localStorage.removeItem('usuario_biapo');
        console.log('👋 Logout realizado');
    },

    // Verificar se usuário pode editar
    podeEditar() {
        return this.state.isLoggedIn && 
               ['admin', 'editor'].includes(this.state.usuarioAtual?.permissoes);
    },

    // Verificar se usuário é admin
    isAdmin() {
        return this.state.isLoggedIn && 
               this.state.usuarioAtual?.permissoes === 'admin';
    },

    // Obter usuário atual
    getUsuarioAtual() {
        return this.state.usuarioAtual;
    },

    // Verificar se está logado
    isLoggedIn() {
        return this.state.isLoggedIn;
    }
};

// ===== FUNÇÕES GLOBAIS DE DEBUG v8.4.1 =====

// Status completo do sistema auth
function statusAuth() {
    console.log('\n🔍 STATUS AUTH v8.4.1 - COMPLETO:');
    console.log('=' .repeat(50));
    console.log(`🔑 Logado: ${Auth.state.isLoggedIn ? Auth.state.usuarioAtual.nome : 'NÃO'}`);
    console.log(`👥 Usuários: ${Object.keys(Auth.equipe).length}`);
    console.log(`🏢 Departamentos: ${Auth.departamentos.length}`);
    console.log(`📊 Fonte Usuários: ${Auth.state.fonteEquipeAtual}`);
    console.log(`📊 Fonte Departamentos: ${Auth.state.fonteDepartamentosAtual}`);
    console.log(`🔥 Firebase Usuários: ${Auth.state.equipeCarregadaDoFirebase ? 'SIM' : 'NÃO'}`);
    console.log(`🔥 Firebase Departamentos: ${Auth.state.departamentosCarregadosDoFirebase ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Persistência Usuários: ${Auth.state.fonteEquipeAtual === 'firebase' ? 'FUNCIONANDO' : 'USANDO FALLBACK'}`);
    console.log(`✅ Persistência Departamentos: ${Auth.state.fonteDepartamentosAtual === 'firebase' ? 'FUNCIONANDO' : 'USANDO FALLBACK'}`);
    
    if (Auth.departamentos.length > 6) {
        console.log('🎯 DEPARTAMENTOS CUSTOMIZADOS DETECTADOS:');
        Auth.departamentos.forEach((dept, i) => {
            if (i >= 6) console.log(`   + ${dept}`);
        });
    }
}

// Recarregar departamentos do Firebase
async function recarregarDepartamentosFirebase() {
    console.log('🔄 Recarregando departamentos do Firebase...');
    const sucesso = await Auth._carregarDepartamentosDoFirebase();
    if (sucesso) {
        console.log('✅ Departamentos recarregados com sucesso');
    } else {
        console.log('⚠️ Usando departamentos hardcoded');
    }
    return sucesso;
}

// Listar departamentos atuais
function departamentosAtuais() {
    console.log('\n🏢 DEPARTAMENTOS ATUAIS:');
    console.log(`📊 Fonte: ${Auth.state.fonteDepartamentosAtual}`);
    console.log(`📋 Total: ${Auth.departamentos.length}`);
    Auth.departamentos.forEach((dept, i) => {
        console.log(`   ${i + 1}. ${dept}`);
    });
}

// Teste completo de persistência v8.4.1
async function testarPersistenciaDepartamentos() {
    console.log('\n🧪 TESTE PERSISTÊNCIA DEPARTAMENTOS v8.4.1');
    console.log('=' .repeat(60));
    
    // 1. Salvar departamentos de teste
    const deptsTeste = [
        ...Auth.departamentosHardcoded,
        'Departamento Teste 1',
        'Departamento Teste 2'
    ];
    
    console.log('1️⃣ Salvando departamentos de teste...');
    const salvoSucesso = await Auth.salvarDepartamentosNoFirebase(deptsTeste);
    console.log(`   ${salvoSucesso ? '✅' : '❌'} Salvamento: ${salvoSucesso ? 'SUCESSO' : 'FALHOU'}`);
    
    // 2. Recarregar do Firebase
    console.log('2️⃣ Recarregando do Firebase...');
    const carregadoSucesso = await Auth._carregarDepartamentosDoFirebase();
    console.log(`   ${carregadoSucesso ? '✅' : '❌'} Carregamento: ${carregadoSucesso ? 'SUCESSO' : 'FALHOU'}`);
    
    // 3. Verificar persistência
    console.log('3️⃣ Verificando persistência...');
    const temDeptsTeste = Auth.departamentos.includes('Departamento Teste 1');
    console.log(`   ${temDeptsTeste ? '✅' : '❌'} Departamentos persistiram: ${temDeptsTeste ? 'SIM' : 'NÃO'}`);
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`   Departamentos: ${Auth.departamentos.length}`);
    console.log(`   Fonte: ${Auth.state.fonteDepartamentosAtual}`);
    console.log(`   Status: ${salvoSucesso && carregadoSucesso && temDeptsTeste ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
}

// Inicializar quando DOM estiver pronto
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        Auth.inicializar();
    });
}

// ===== COMENTÁRIOS v8.4.1 =====
/*
CORREÇÕES APLICADAS v8.4.1:

1. ✅ NOVO PATH: dados/departamentos para salvar departamentos
2. ✅ NOVA FUNÇÃO: _carregarDepartamentosDoFirebase()
3. ✅ NOVA FUNÇÃO: salvarDepartamentosNoFirebase()
4. ✅ MODIFICADA: _carregarEquipeDoFirebase() agora carrega departamentos também
5. ✅ NOVO ESTADO: departamentosCarregadosDoFirebase e fonteDepartamentosAtual
6. ✅ NOVOS COMANDOS: departamentosAtuais(), testarPersistenciaDepartamentos()

FLUXO CORRIGIDO:
AdminUsersManager → salva usuários em dados/auth_equipe
AdminUsersManager → salva departamentos em dados/departamentos (NOVO)
auth.js → carrega usuários de dados/auth_equipe
auth.js → carrega departamentos de dados/departamentos (NOVO)

RESULTADO: Usuários E departamentos persistem após F5! ✅
*/
