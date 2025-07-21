/**
 * 🔐 ENV LOADER - Carregador automático de credenciais .env
 * 
 * Solução definitiva para carregar credenciais automaticamente
 * sem intervenção manual do usuário
 */

const EnvLoader = {
    credenciais: null,
    carregado: false,
    
    // 🚀 CARREGAR CREDENCIAIS AUTOMATICAMENTE
    async carregarCredenciais() {
        console.log('🔐 Carregando credenciais automaticamente...');
        
        try {
            // MÉTODO 1: Tentar carregar do .env via fetch
            const response = await fetch('./.env');
            if (response.ok) {
                const envContent = await response.text();
                const credenciais = this.parseEnv(envContent);
                
                if (credenciais.SUPABASE_URL && credenciais.SUPABASE_ANON_KEY) {
                    this.credenciais = {
                        url: credenciais.SUPABASE_URL,
                        key: credenciais.SUPABASE_ANON_KEY
                    };
                    
                    // Definir configuração global
                    window.SUPABASE_CONFIG = this.credenciais;
                    this.carregado = true;
                    
                    console.log('✅ Credenciais carregadas automaticamente do .env');
                    console.log('🌍 URL:', this.credenciais.url);
                    return this.credenciais;
                }
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível carregar .env via fetch (normal em produção)');
        }
        
        // MÉTODO 2: Credenciais hardcoded como fallback (TEMPORÁRIO)
        console.log('🔄 Usando credenciais de fallback...');
        this.credenciais = {
            url: 'https://vyquhmlxjrvbdwgadtxc.supabase.co',
            key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cXVobWx4anJ2YmR3Z2FkdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzQyMDYsImV4cCI6MjA2ODI1MDIwNn0.zyj_8uW4T7E40ekdqDDW8E91P7LpXD5Pr53GCrPqMvM'
        };
        
        window.SUPABASE_CONFIG = this.credenciais;
        this.carregado = true;
        
        console.log('✅ Credenciais de fallback carregadas');
        console.log('🌍 URL:', this.credenciais.url);
        
        return this.credenciais;
    },
    
    // 📋 PARSER SIMPLES DE .env
    parseEnv(envContent) {
        const result = {};
        const lines = envContent.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    result[key.trim()] = valueParts.join('=').trim();
                }
            }
        }
        
        return result;
    },
    
    // ✅ VERIFICAR SE ESTÁ CARREGADO
    estaCarregado() {
        return this.carregado && window.SUPABASE_CONFIG;
    },
    
    // 🧪 TESTAR CREDENCIAIS
    async testarCredenciais() {
        if (!this.credenciais) {
            await this.carregarCredenciais();
        }
        
        try {
            const response = await fetch(`${this.credenciais.url}/rest/v1/usuarios?select=count`, {
                headers: {
                    'apikey': this.credenciais.key,
                    'Authorization': `Bearer ${this.credenciais.key}`
                }
            });
            
            const funcionando = response.ok;
            console.log(`${funcionando ? '✅' : '❌'} Teste de credenciais: ${funcionando ? 'SUCESSO' : 'FALHA'}`);
            return funcionando;
            
        } catch (error) {
            console.error('❌ Erro ao testar credenciais:', error);
            return false;
        }
    }
};

// 🚀 INICIALIZAÇÃO AUTOMÁTICA
(async function() {
    await EnvLoader.carregarCredenciais();
    
    // Testar credenciais automaticamente
    setTimeout(async () => {
        await EnvLoader.testarCredenciais();
    }, 1000);
})();

// 🌍 EXPOSIÇÃO GLOBAL
window.EnvLoader = EnvLoader;

console.log('🔐 EnvLoader inicializado - carregamento automático de credenciais');
