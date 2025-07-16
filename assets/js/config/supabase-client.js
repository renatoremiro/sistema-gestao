// 🚀 CLIENTE SUPABASE OTIMIZADO PARA SISTEMA BIAPO
// Arquivo: assets/js/config/supabase-client.js

// ✅ CONFIGURAÇÕES SUPABASE - SISTEMA GESTÃO 292
const SUPABASE_URL = 'https://vyquhmlxjrvbdwgadtxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cXVobWx4anJ2YmR3Z2FkdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzQyMDYsImV4cCI6MjA2ODI1MDIwNn0.zyj_8uW4T7E40ekdqDDW8E91P7LpXD5Pr53GCrPqMvM';

class SupabaseClient {
    constructor() {
        this.url = SUPABASE_URL;
        this.key = SUPABASE_ANON_KEY;
        this.headers = {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
        this.conectado = false;
        this.cache = new Map();
        
        console.log('🚀 Inicializando Supabase Client...');
        this.testarConexao();
    }

    // 🔌 TESTE DE CONEXÃO
    async testarConexao() {
        try {
            const response = await fetch(`${this.url}/rest/v1/usuarios?select=count`, {
                method: 'GET',
                headers: this.headers
            });

            if (response.ok) {
                this.conectado = true;
                console.log('✅ Supabase conectado com sucesso!');
                return true;
            } else {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

        } catch (error) {
            console.error('❌ Erro na conexão Supabase:', error);
            this.conectado = false;
            return false;
        }
    }

    // 📥 BUSCAR DADOS
    async buscar(tabela, filtros = {}) {
        try {
            let url = `${this.url}/rest/v1/${tabela}?select=*`;
            
            // Aplicar filtros
            Object.entries(filtros).forEach(([chave, valor]) => {
                url += `&${chave}=eq.${encodeURIComponent(valor)}`;
            });

            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const dados = await response.json();
            console.log(`📥 ${dados.length} registros de ${tabela}`);
            return dados;

        } catch (error) {
            console.error(`❌ Erro ao buscar ${tabela}:`, error);
            return [];
        }
    }

    // 💾 INSERIR DADOS
    async inserir(tabela, dados) {
        try {
            const response = await fetch(`${this.url}/rest/v1/${tabela}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                const erro = await response.text();
                throw new Error(`Erro ${response.status}: ${erro}`);
            }

            const resultado = await response.json();
            console.log(`✅ Inserido em ${tabela}:`, resultado[0]?.id);
            return resultado[0];

        } catch (error) {
            console.error(`❌ Erro ao inserir em ${tabela}:`, error);
            throw error;
        }
    }

    // 🔄 UPSERT (inserir ou atualizar)
    async upsert(tabela, dados) {
        try {
            const response = await fetch(`${this.url}/rest/v1/${tabela}`, {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Prefer': 'resolution=merge-duplicates,return=representation'
                },
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                const erro = await response.text();
                throw new Error(`Erro ${response.status}: ${erro}`);
            }

            const resultado = await response.json();
            console.log(`✅ Upsert em ${tabela}:`, resultado[0]?.id);
            return resultado[0];

        } catch (error) {
            console.error(`❌ Erro ao fazer upsert em ${tabela}:`, error);
            throw error;
        }
    }

    // 📊 MÉTODOS ESPECÍFICOS PARA O SISTEMA

    // 👥 BUSCAR OU CRIAR USUÁRIO
    async buscarOuCriarUsuario(email, nome) {
        try {
            // Buscar usuário existente
            let usuarios = await this.buscar('usuarios', { email: email });
            
            if (usuarios.length > 0) {
                console.log(`👤 Usuário encontrado: ${email}`);
                return usuarios[0];
            }

            // Criar novo usuário
            const novoUsuario = await this.inserir('usuarios', {
                email: email,
                nome: nome || email.split('@')[0],
                perfil: email.includes('biapo.com.br') ? 'admin' : 'usuario',
                admin: email === 'renatoremiro@biapo.com.br'
            });

            console.log(`👤 Novo usuário criado: ${email}`);
            return novoUsuario;

        } catch (error) {
            console.error('❌ Erro ao buscar/criar usuário:', error);
            throw error;
        }
    }

    // 📅 CARREGAR EVENTOS DO USUÁRIO
    async carregarEventosUsuario(usuarioId) {
        try {
            const url = `${this.url}/rest/v1/eventos_completos?or=(criado_por.eq.${usuarioId},responsavel.eq.${usuarioId},visibilidade.eq.publica)&order=data.asc`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
            }

            const eventos = await response.json();
            console.log(`📅 ${eventos.length} eventos carregados`);
            return eventos;

        } catch (error) {
            console.error('❌ Erro ao carregar eventos:', error);
            return [];
        }
    }

    // 📋 CARREGAR TAREFAS DO USUÁRIO
    async carregarTarefasUsuario(usuarioId) {
        try {
            const url = `${this.url}/rest/v1/tarefas_completas?or=(criado_por.eq.${usuarioId},responsavel.eq.${usuarioId})&order=data_inicio.asc`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
            }

            const tarefas = await response.json();
            console.log(`📋 ${tarefas.length} tarefas carregadas`);
            return tarefas;

        } catch (error) {
            console.error('❌ Erro ao carregar tarefas:', error);
            return [];
        }
    }

    // 🚀 CARREGAR TODOS OS DADOS DO USUÁRIO
    async carregarDadosCompletos(email) {
        try {
            console.log(`📡 Carregando dados completos para: ${email}`);

            // 1. Buscar ou criar usuário
            const usuario = await this.buscarOuCriarUsuario(email);
            
            if (!usuario) {
                throw new Error('Falha ao obter usuário');
            }

            // 2. Carregar eventos e tarefas em paralelo
            const [eventos, tarefas] = await Promise.all([
                this.carregarEventosUsuario(usuario.id),
                this.carregarTarefasUsuario(usuario.id)
            ]);

            const dados = {
                usuario: usuario,
                eventos: eventos || [],
                tarefas: tarefas || [],
                timestamp: Date.now()
            };

            console.log(`✅ Dados completos carregados: ${dados.eventos.length} eventos, ${dados.tarefas.length} tarefas`);
            return dados;

        } catch (error) {
            console.error('❌ Erro ao carregar dados completos:', error);
            throw error;
        }
    }

    // 📊 ESTATÍSTICAS
    async obterEstatisticas() {
        try {
            const [usuarios, eventos, tarefas] = await Promise.all([
                this.buscar('usuarios'),
                this.buscar('eventos'),
                this.buscar('tarefas')
            ]);

            return {
                usuarios: usuarios.length,
                eventos: eventos.length,
                tarefas: tarefas.length,
                conectado: this.conectado
            };

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return { usuarios: 0, eventos: 0, tarefas: 0, conectado: false };
        }
    }
}

// 🚀 INICIALIZAÇÃO GLOBAL
const supabaseClient = new SupabaseClient();

// Expor globalmente
window.supabaseClient = supabaseClient;
window.supabase = supabaseClient; // Alias

// 🧪 FUNÇÕES DE TESTE
window.testarSupabase = () => supabaseClient.testarConexao();
window.estatisticasSupabase = () => supabaseClient.obterEstatisticas();
window.carregarDadosSupabase = (email) => supabaseClient.carregarDadosCompletos(email);

console.log('🚀 Supabase Client v1.0 carregado!');
console.log('🧪 Teste: testarSupabase()');
console.log('📊 Stats: estatisticasSupabase()');
console.log('📥 Dados: carregarDadosSupabase("seu@email.com")');

/*
🔧 CONFIGURAÇÃO NECESSÁRIA:

1. SUBSTITUIR no topo do arquivo:
   - SUPABASE_URL: Sua URL do projeto
   - SUPABASE_ANON_KEY: Sua chave anon

2. TESTAR no console:
   - testarSupabase() deve retornar true
   - estatisticasSupabase() deve mostrar contagens

3. PRONTO PARA MIGRAÇÃO!
*/