// 🔐 CONFIGURAÇÃO SUPABASE OTIMIZADA - SISTEMA BIAPO v8.0
// 🚀 Versão definitiva que substitui env-loader.js
// ⚡ Carregamento direto e eficiente

// 🔥 CONFIGURAÇÃO DIRETA (funciona local e GitHub Pages)
window.SUPABASE_CONFIG = {
    url: 'https://vyquhmlxjrvbdwgadtxc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cXVobWx4anJ2YmR3Z2FkdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzQyMDYsImV4cCI6MjA2ODI1MDIwNn0.zyj_8uW4T7E40ekdqDDW8E91P7LpXD5Pr53GCrPqMvM',
    options: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
};

// 🔧 COMPATIBILIDADE COM SISTEMA ATUAL
window.SUPABASE_CONFIG.key = window.SUPABASE_CONFIG.anonKey; // Alias para compatibilidade

// 📝 LOGS DE CARREGAMENTO
console.log('🔐 Configuração Supabase OTIMIZADA carregada!');
console.log('🌍 Servidor:', window.SUPABASE_CONFIG.url);
console.log('🚀 Modo: Produção GitHub Pages');
console.log('✅ Compatibilidade: env-loader.js substituído');

// 🧪 TESTE DE CONEXÃO RÁPIDO
async function testarConexaoRapida() {
    try {
        const response = await fetch(`${window.SUPABASE_CONFIG.url}/rest/v1/usuarios?select=count`, {
            method: 'GET',
            headers: {
                'apikey': window.SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Conexão Supabase: SUCESSO');
            return true;
        } else {
            console.warn('⚠️ Conexão Supabase: Erro', response.status);
            return false;
        }
    } catch (error) {
        console.warn('⚠️ Teste de conexão falhou:', error.message);
        return false;
    }
}

// 🚀 TESTE AUTOMÁTICO EM 2 SEGUNDOS
setTimeout(testarConexaoRapida, 2000);

// 🌐 COMPATIBILIDADE COM GITHUB PAGES
window.GITHUB_PAGES_CONFIG = {
    useSupabase: true,
    fallbackToLocalStorage: false, // Forçar uso do Supabase
    environment: 'production'
};