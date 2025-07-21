// 🔐 CONFIGURAÇÃO SUPABASE - SISTEMA BIAPO v8.0
// 🌐 Para GitHub Pages e produção
// ⚡ Carregamento automático das credenciais

window.SUPABASE_CONFIG = {
    url: 'https://vyquhmlxjrvbdwgadtxc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cXVobWx4anJ2YmR3Z2FkdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzQyMDYsImV4cCI6MjA2ODI1MDIwNn0.zyj_8uW4T7E40ekdqDDW8E91P7LpXD5Pr53GCrPqMvM',
    options: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
};

// 🚀 Configuração para GitHub Pages
window.GITHUB_PAGES_CONFIG = {
    useSupabase: true,
    fallbackToLocalStorage: true,
    environment: 'production'
};

// 📝 Log de inicialização
console.log('🔐 Configuração Supabase carregada para GitHub Pages');
console.log('🌍 Servidor:', window.SUPABASE_CONFIG.url);
console.log('✅ Pronto para commit no GitHub!');