/**
 * 🔥 API UNIFICADA BIAPO v8.13.0
 * Ponto único de acesso para TODAS as operações
 */

const APIUnificada = {
    versao: '8.13.0',
    
    // 📅 EVENTOS
    async criarEvento(dados) {
        console.log('📅 APIUnificada.criarEvento()');
        if (typeof App?.criarEvento === 'function') {
            return await App.criarEvento(dados);
        }
        throw new Error('App.criarEvento não disponível');
    },
    
    async editarEvento(id, dados) {
        console.log('✏️ APIUnificada.editarEvento()');
        if (typeof App?.editarEvento === 'function') {
            return await App.editarEvento(id, dados);
        }
        throw new Error('App.editarEvento não disponível');
    },
    
    // 📋 TAREFAS  
    async criarTarefa(dados) {
        console.log('📋 APIUnificada.criarTarefa()');
        if (typeof App?.criarTarefa === 'function') {
            return await App.criarTarefa(dados);
        }
        throw new Error('App.criarTarefa não disponível');
    },
    
    async editarTarefa(id, dados) {
        console.log('✏️ APIUnificada.editarTarefa()');
        if (typeof App?.editarTarefa === 'function') {
            return await App.editarTarefa(id, dados);
        }
        throw new Error('App.editarTarefa não disponível');
    },
    
    // 👥 USUÁRIOS
    obterUsuarioAtual() {
        if (typeof Auth?.obterUsuario === 'function') {
            return Auth.obterUsuario();
        }
        return null;
    },
    
    listarUsuarios() {
        if (typeof Auth?.listarUsuarios === 'function') {
            return Auth.listarUsuarios();
        }
        return [];
    },
    
    // 📊 STATUS COMPLETO
    obterStatusCompleto() {
        return {
            versao: this.versao,
            app: App?.obterStatusSistema?.() || 'N/A',
            auth: Auth?.obterStatus?.() || 'N/A', 
            calendar: Calendar?.obterStatus?.() || 'N/A',
            events: Events?.obterStatus?.() || 'N/A',
            timestamp: new Date().toISOString()
        };
    }
};

// Expor globalmente
window.APIUnificada = APIUnificada;
console.log('🔥 APIUnificada v8.13.0 carregada!'); 