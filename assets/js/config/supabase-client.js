// 🔐 CLIENTE SUPABASE SEGURO v2.0 - SEM CREDENCIAIS HARDCODED
// Arquivo: assets/js/config/supabase-client.js
// 
// 🔥 CORREÇÃO CRÍTICA: Credenciais movidas para configuração externa
// 🛡️ SEGURANÇA: Nunca mais credenciais no código fonte

// 🔐 SISTEMA DE CONFIGURAÇÃO SEGURA
class SupabaseConfig {
    constructor() {
        this.config = null;
        this.carregado = false;
    }

    // 🔍 CARREGAR CONFIGURAÇÕES (múltiplas fontes)
    async carregarConfig() {
        console.log('🔐 Carregando configurações Supabase de forma segura...');

        // FONTE 1: Variáveis globais definidas no HTML (recomendado)
        if (window.SUPABASE_CONFIG) {
            console.log('✅ Configuração encontrada em window.SUPABASE_CONFIG');
            this.config = window.SUPABASE_CONFIG;
            this.carregado = true;
            return this.config;
        }

        // FONTE 2: Meta tags no HTML
        const urlMeta = document.querySelector('meta[name="supabase-url"]');
        const keyMeta = document.querySelector('meta[name="supabase-key"]');
        
        if (urlMeta && keyMeta) {
            console.log('✅ Configuração encontrada em meta tags');
            this.config = {
                url: urlMeta.content,
                key: keyMeta.content
            };
            this.carregado = true;
            return this.config;
        }

        // FONTE 3: Arquivo de configuração (fallback)
        try {
            const response = await fetch('./config/supabase-runtime.json');
            if (response.ok) {
                this.config = await response.json();
                console.log('✅ Configuração carregada do arquivo JSON');
                this.carregado = true;
                return this.config;
            }
        } catch (error) {
            console.warn('⚠️ Arquivo de configuração não encontrado');
        }

        // ERRO: Nenhuma configuração encontrada
        const errorMsg = `
🚨 ERRO CRÍTICO DE CONFIGURAÇÃO SUPABASE:

Nenhuma configuração Supabase encontrada. Configure usando uma das opções:

OPÇÃO 1 (Recomendada) - Variável global no HTML:
<script>
window.SUPABASE_CONFIG = {
    url: 'sua_url_aqui',
    key: 'sua_key_aqui'
};
</script>

OPÇÃO 2 - Meta tags no HTML:
<meta name="supabase-url" content="sua_url_aqui">
<meta name="supabase-key" content="sua_key_aqui">

OPÇÃO 3 - Arquivo config/supabase-runtime.json:
{
    "url": "sua_url_aqui",
    "key": "sua_key_aqui"
}

🔧 Consulte o arquivo .env.example para obter as credenciais.
        `;
        
        console.error(errorMsg);
        throw new Error('Configuração Supabase não encontrada - consulte .env.example');
    }

    // 🔍 VALIDAR CONFIGURAÇÕES
    validarConfig() {
        if (!this.config) {
            throw new Error('Configuração não carregada');
        }

        if (!this.config.url || !this.config.key) {
            throw new Error('URL ou KEY do Supabase não fornecidos');
        }

        if (!this.config.url.includes('supabase.co')) {
            console.warn('⚠️ URL do Supabase parece inválida');
        }

        if (this.config.key.length < 100) {
            console.warn('⚠️ Key do Supabase parece muito curta');
        }

        console.log('✅ Configuração Supabase validada');
        return true;
    }
}

// 🚀 CLIENTE SUPABASE OTIMIZADO E SEGURO
class SupabaseClient {
    constructor() {
        this.configManager = new SupabaseConfig();
        this.url = null;
        this.key = null;
        this.headers = null;
        this.conectado = false;
        this.cache = new Map();
        this.inicializado = false;
        
        console.log('🚀 Inicializando Supabase Client Seguro v2.0...');
        this.inicializar();
    }

    // 🔧 INICIALIZAÇÃO SEGURA v2.1
    async inicializar() {
        try {
            // Aguardar configuração segura externa
            if (!window.SUPABASE_CONFIG && window.configurarSupabaseSeguro) {
                console.log('🔐 Carregando configuração segura...');
                await window.configurarSupabaseSeguro();
            }
            
            // Carregar e validar configurações
            await this.configManager.carregarConfig();
            this.configManager.validarConfig();
            
            // Configurar cliente
            this.url = this.configManager.config.url;
            this.key = this.configManager.config.key;
            this.headers = {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            };
            
            this.inicializado = true;
            console.log('✅ Supabase Client inicializado com segurança!');
            
            // Testar conexão
            await this.testarConexao();
            
        } catch (error) {
            console.error('❌ Erro na inicialização do Supabase Client:', error);
            this.inicializado = false;
            
            // Mostrar instruções de configuração
            this._mostrarInstrucoesConfiguracao();
        }
    }

    // 📋 MOSTRAR INSTRUÇÕES DE CONFIGURAÇÃO
    _mostrarInstrucoesConfiguracao() {
        const instrucoes = `
🔧 COMO CONFIGURAR O SUPABASE:

1. Copie o arquivo .env.example para obter o template
2. Acesse seu painel Supabase em https://supabase.com/dashboard
3. Vá em Settings > API e copie URL e anon key
4. Configure usando uma das opções abaixo:

MÉTODO 1 (Recomendado) - No HTML antes do script:
<script>
window.SUPABASE_CONFIG = {
    url: 'https://seu-projeto.supabase.co',
    key: 'sua-chave-anonima-aqui'
};
</script>
<script src="assets/js/config/supabase-client.js"></script>

MÉTODO 2 - Via meta tags:
<meta name="supabase-url" content="https://seu-projeto.supabase.co">
<meta name="supabase-key" content="sua-chave-anonima-aqui">
        `;
        
        console.log(instrucoes);
        
        // Criar alerta visual se possível
        if (typeof document !== 'undefined' && document.body) {
            const alert = document.createElement('div');
            alert.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                background: #fee2e2;
                border: 2px solid #dc2626;
                color: #dc2626;
                padding: 20px;
                border-radius: 8px;
                z-index: 9999;
                font-family: monospace;
                font-size: 12px;
                white-space: pre-wrap;
                max-height: 300px;
                overflow-y: auto;
            `;
            alert.textContent = '🚨 CONFIGURAÇÃO SUPABASE NECESSÁRIA\n\nConsulte o console (F12) para instruções detalhadas.\n\nArquivo: .env.example';
            
            // Botão para fechar
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕';
            closeBtn.style.cssText = 'position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 18px; cursor: pointer;';
            closeBtn.onclick = () => alert.remove();
            alert.appendChild(closeBtn);
            
            document.body.appendChild(alert);
        }
    }

    // 🔌 TESTE DE CONEXÃO
    async testarConexao() {
        if (!this.inicializado) {
            console.warn('⚠️ Cliente não inicializado, não é possível testar conexão');
            return false;
        }

        try {
            const response = await fetch(`${this.url}/rest/v1/usuarios?select=count`, {
                method: 'GET',
                headers: this.headers
            });

            if (response.ok) {
                this.conectado = true;
                console.log('✅ Supabase conectado com sucesso!');
                console.log(`🌍 Servidor: ${this.url}`);
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

    // 🛡️ VERIFICAR SE ESTÁ PRONTO
    _verificarPronto() {
        if (!this.inicializado) {
            throw new Error('Supabase Client não inicializado - configure as credenciais');
        }
        if (!this.conectado) {
            console.warn('⚠️ Supabase não conectado - operação pode falhar');
        }
    }

    // 📥 BUSCAR DADOS
    async buscar(tabela, filtros = {}) {
        this._verificarPronto();
        
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
        this._verificarPronto();
        
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
        this._verificarPronto();
        
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

    // 📊 MÉTODOS ESPECÍFICOS PARA O SISTEMA (mantidos)

    // 👥 BUSCAR OU CRIAR USUÁRIO
    async buscarOuCriarUsuario(email, nome) {
        this._verificarPronto();
        
        try {
            let usuarios = await this.buscar('usuarios', { email: email });
            
            if (usuarios.length > 0) {
                console.log(`👤 Usuário encontrado: ${email}`);
                return usuarios[0];
            }

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
        this._verificarPronto();
        
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
        this._verificarPronto();
        
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
        this._verificarPronto();
        
        try {
            console.log(`📡 Carregando dados completos para: ${email}`);

            const usuario = await this.buscarOuCriarUsuario(email);
            
            if (!usuario) {
                throw new Error('Falha ao obter usuário');
            }

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
        this._verificarPronto();
        
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
                conectado: this.conectado,
                inicializado: this.inicializado,
                servidor: this.url
            };

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return { 
                usuarios: 0, 
                eventos: 0, 
                tarefas: 0, 
                conectado: false,
                inicializado: this.inicializado,
                erro: error.message 
            };
        }
    }

    // 📊 STATUS PARA DEBUG
    obterStatus() {
        return {
            inicializado: this.inicializado,
            conectado: this.conectado,
            url: this.url ? this.url.substring(0, 30) + '...' : 'não configurado',
            keyConfigured: !!this.key,
            configSource: this.configManager.carregado ? 'carregado' : 'não carregado'
        };
    }
}

// 🚀 INICIALIZAÇÃO GLOBAL SEGURA
let supabaseClient = null;

// Aguardar carregamento do DOM para inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        supabaseClient = new SupabaseClient();
        window.supabaseClient = supabaseClient;
        window.supabase = supabaseClient; // Alias
    });
} else {
    // DOM já carregado
    supabaseClient = new SupabaseClient();
    window.supabaseClient = supabaseClient;
    window.supabase = supabaseClient; // Alias
}

// 🧪 FUNÇÕES DE TESTE GLOBAIS
window.testarSupabase = () => {
    if (!supabaseClient) {
        console.error('❌ Supabase Client não inicializado ainda');
        return false;
    }
    return supabaseClient.testarConexao();
};

window.estatisticasSupabase = () => {
    if (!supabaseClient) {
        console.error('❌ Supabase Client não inicializado ainda');
        return null;
    }
    return supabaseClient.obterEstatisticas();
};

window.carregarDadosSupabase = (email) => {
    if (!supabaseClient) {
        console.error('❌ Supabase Client não inicializado ainda');
        return null;
    }
    return supabaseClient.carregarDadosCompletos(email);
};

window.statusSupabase = () => {
    if (!supabaseClient) {
        return { inicializado: false, erro: 'Cliente não criado ainda' };
    }
    return supabaseClient.obterStatus();
};

console.log('🔐 Supabase Client Seguro v2.0 carregado!');
console.log('🧪 Comandos: testarSupabase() | estatisticasSupabase() | statusSupabase()');
console.log('📋 Configure usando window.SUPABASE_CONFIG ou meta tags');
console.log('🔧 Consulte .env.example para instruções detalhadas');

/*
🔐 CONFIGURAÇÃO SEGURA v2.0:

✅ CREDENCIAIS PROTEGIDAS:
- Nunca mais hardcoded no código
- Múltiplas fontes de configuração
- Validação automática
- Instruções claras de setup

🛡️ SEGURANÇA IMPLEMENTADA:
- Verificações de configuração
- Alertas visuais se mal configurado
- Logs detalhados para debug
- Fallbacks seguros

🚀 USO RECOMENDADO:
1. Configure window.SUPABASE_CONFIG no HTML
2. Ou use meta tags
3. Ou crie arquivo config/supabase-runtime.json
4. Teste com testarSupabase()
*/