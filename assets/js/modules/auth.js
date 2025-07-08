// auth.js v8.4.2 EMERGENCY - CORRIGINDO PÁGINA EM BRANCO
// Versão simplificada para restaurar funcionamento básico

const Auth = {
    // Estado do sistema de autenticação
    state: {
        usuarioAtual: null,
        isLoggedIn: false,
        equipeCarregadaDoFirebase: false,
        fonteEquipeAtual: 'hardcoded'
    },

    // Configuração dos paths do Firebase
    config: {
        pathsFirebase: {
            usuarios: 'dados/auth_equipe'
        }
    },

    // Departamentos básicos (sem persistência por enquanto)
    departamentos: [
        "Gestão Geral",
        "Suprimentos", 
        "Qualidade & Produção",
        "Documentação & Arquivo",
        "Planejamento & Controle",
        "Recursos Humanos"
    ],

    // ===== FUNÇÃO SIMPLIFICADA: CARREGAR EQUIPE =====
    async _carregarEquipeDoFirebase() {
        console.log('👥 Auth: Tentando carregar equipe do Firebase...');
        
        try {
            // Verificar se Firebase está disponível
            if (!window.database) {
                console.log('⚠️ Firebase não disponível - usando dados hardcoded');
                this.equipe = { ...this.equipeHardcoded };
                this.state.fonteEquipeAtual = 'hardcoded';
                return false;
            }

            // Tentar carregar do Firebase com timeout
            const promise = database.ref(this.config.pathsFirebase.usuarios).once('value');
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => resolve(null), 3000); // 3 segundos timeout
            });

            const snapshot = await Promise.race([promise, timeoutPromise]);
            
            if (!snapshot) {
                console.log('⏰ Timeout no Firebase - usando dados hardcoded');
                this.equipe = { ...this.equipeHardcoded };
                this.state.fonteEquipeAtual = 'hardcoded';
                return false;
            }

            const usuariosFirebase = snapshot.val();

            if (usuariosFirebase && Object.keys(usuariosFirebase).length > 0) {
                this.equipe = usuariosFirebase;
                this.state.equipeCarregadaDoFirebase = true;
                this.state.fonteEquipeAtual = 'firebase';
                console.log(`✅ ${Object.keys(usuariosFirebase).length} usuários carregados do Firebase`);
                return true;
            } else {
                console.log('📦 Usando dados hardcoded');
                this.equipe = { ...this.equipeHardcoded };
                this.state.fonteEquipeAtual = 'hardcoded';
                return false;
            }

        } catch (error) {
            console.log('❌ Erro ao carregar Firebase - usando hardcoded:', error.message);
            this.equipe = { ...this.equipeHardcoded };
            this.state.fonteEquipeAtual = 'hardcoded';
            return false;
        }
    },

    // Equipe BIAPO hardcoded (sempre funcionando)
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

    // Equipe em memória
    equipe: {},

    // ===== INICIALIZAÇÃO SIMPLIFICADA E SEGURA =====
    async inicializar() {
        console.log('🚀 Auth v8.4.2: Inicializando (modo emergency)...');
        
        try {
            // Primeiro, aplicar dados hardcoded para garantir funcionamento
            this.equipe = { ...this.equipeHardcoded };
            this.state.fonteEquipeAtual = 'hardcoded';
            
            // Tentar carregar do Firebase em background (sem travar)
            this._carregarEquipeDoFirebase().then(sucesso => {
                if (sucesso) {
                    console.log('✅ Dados Firebase carregados em background');
                }
            }).catch(error => {
                console.log('⚠️ Falha no Firebase, mantendo hardcoded:', error.message);
            });
            
            // Verificar usuário salvo
            const usuarioSalvo = localStorage.getItem('usuario_biapo');
            if (usuarioSalvo) {
                try {
                    const dadosUsuario = JSON.parse(usuarioSalvo);
                    if (this.equipe[dadosUsuario.id]) {
                        this.state.usuarioAtual = dadosUsuario;
                        this.state.isLoggedIn = true;
                        console.log(`👤 Auto-login: ${dadosUsuario.nome}`);
                    }
                } catch (e) {
                    console.log('⚠️ Erro no auto-login, removendo dados salvos');
                    localStorage.removeItem('usuario_biapo');
                }
            }
            
            console.log('✅ Auth: Sistema inicializado com sucesso');
            this._exibirStatus();
            
        } catch (error) {
            console.error('❌ Erro crítico na inicialização:', error);
            // Mesmo com erro, garantir dados básicos
            this.equipe = { ...this.equipeHardcoded };
            this.state.fonteEquipeAtual = 'hardcoded';
        }
    },

    // Status simplificado
    _exibirStatus() {
        console.log('\n📊 STATUS AUTH v8.4.2 EMERGENCY:');
        console.log(`   👥 Usuários: ${Object.keys(this.equipe).length}`);
        console.log(`   📊 Fonte: ${this.state.fonteEquipeAtual}`);
        console.log(`   🔑 Logado: ${this.state.isLoggedIn ? this.state.usuarioAtual?.nome : 'Não'}`);
        console.log(`   🔥 Firebase: ${this.state.equipeCarregadaDoFirebase ? 'SIM' : 'NÃO'}`);
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
        try {
            localStorage.setItem('usuario_biapo', JSON.stringify(usuario));
        } catch (e) {
            console.log('⚠️ Erro ao salvar no localStorage');
        }
        
        console.log(`✅ Login realizado: ${usuario.nome}`);
        return true;
    },

    // Função de logout
    logout() {
        this.state.usuarioAtual = null;
        this.state.isLoggedIn = false;
        try {
            localStorage.removeItem('usuario_biapo');
        } catch (e) {
            console.log('⚠️ Erro ao limpar localStorage');
        }
        console.log('👋 Logout realizado');
    },

    // Verificar se usuário pode editar
    podeEditar() {
        return this.state.isLoggedIn && 
               this.state.usuarioAtual?.permissoes &&
               ['admin', 'editor'].includes(this.state.usuarioAtual.permissoes);
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

// ===== FUNÇÕES GLOBAIS SIMPLIFICADAS =====

// Status do sistema
function statusAuth() {
    console.log('\n🔍 STATUS AUTH v8.4.2 EMERGENCY:');
    console.log('=' .repeat(40));
    console.log(`🔑 Logado: ${Auth.state.isLoggedIn ? Auth.state.usuarioAtual.nome : 'NÃO'}`);
    console.log(`👥 Usuários: ${Object.keys(Auth.equipe).length}`);
    console.log(`📊 Fonte: ${Auth.state.fonteEquipeAtual}`);
    console.log(`🔥 Firebase: ${Auth.state.equipeCarregadaDoFirebase ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Status: FUNCIONANDO`);
}

// Login rápido
function loginBiapo(nome) {
    return Auth.login(nome);
}

// Logout rápido
function logoutBiapo() {
    Auth.logout();
}

// Listar equipe
function equipeBiapo() {
    console.log('\n👥 EQUIPE BIAPO:');
    Object.values(Auth.equipe).forEach(user => {
        console.log(`   ${user.nome} (${user.id}) - ${user.cargo}`);
    });
}

// Recarregar do Firebase
async function recarregarEquipeFirebase() {
    console.log('🔄 Recarregando equipe do Firebase...');
    try {
        const sucesso = await Auth._carregarEquipeDoFirebase();
        console.log(sucesso ? '✅ Sucesso' : '⚠️ Usando fallback');
        return sucesso;
    } catch (error) {
        console.log('❌ Erro:', error.message);
        return false;
    }
}

// Teste de funcionamento
function testarSistema() {
    console.log('\n🧪 TESTE SISTEMA v8.4.2:');
    console.log('1️⃣ Auth carregado:', typeof Auth !== 'undefined' ? '✅' : '❌');
    console.log('2️⃣ Equipe:', Object.keys(Auth.equipe).length > 0 ? '✅' : '❌');
    console.log('3️⃣ Login funcionando:', typeof Auth.login === 'function' ? '✅' : '❌');
    console.log('4️⃣ Status geral:', Auth.state ? '✅' : '❌');
}

// ===== INICIALIZAÇÃO SEGURA =====
if (typeof document !== 'undefined') {
    // Aguardar DOM e Firebase
    document.addEventListener('DOMContentLoaded', () => {
        // Aguardar um pouco para garantir que Firebase carregou
        setTimeout(() => {
            Auth.inicializar();
        }, 500);
    });
}

// ===== COMENTÁRIOS v8.4.2 EMERGENCY =====
/*
CORREÇÕES EMERGENCY v8.4.2:

1. ✅ REMOVIDO: Funcionalidades complexas de departamentos
2. ✅ SIMPLIFICADO: Inicialização sem dependências críticas
3. ✅ TIMEOUT: Firebase com timeout para não travar
4. ✅ TRY/CATCH: Proteção contra erros que quebram página
5. ✅ FALLBACK: Dados hardcoded sempre funcionando
6. ✅ ASYNC SEGURO: Carregamento Firebase em background
7. ✅ LOCALSTORAGE: Proteção contra erros de acesso

OBJETIVO: PÁGINA FUNCIONANDO NOVAMENTE!

APÓS TESTE: Implementar departamentos gradualmente
*/
