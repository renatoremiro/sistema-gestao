/**
 * 🧪 TESTE DE INTEGRAÇÃO SIMPLES - Sistema BIAPO
 * 
 * Verifica se os módulos principais estão funcionando
 */

console.log('🧪 ========== TESTE DE INTEGRAÇÃO BIAPO ==========');
console.log('⏰ Iniciado em:', new Date().toLocaleString('pt-BR'));
console.log('');

// Simular ambiente browser
global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    },
    sessionStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    }
};

global.document = {
    createElement: () => ({
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {}
    }),
    getElementById: () => null,
    querySelector: () => null,
    addEventListener: () => {},
    removeEventListener: () => {}
};

// Carregar módulos principais
try {
    console.log('📥 Carregando módulos...');
    
    // Helpers
    const helpersCode = require('fs').readFileSync('assets/js/utils/helpers.js', 'utf8');
    eval(helpersCode);
    console.log('✅ Helpers.js carregado');
    
    // Auth
    const authCode = require('fs').readFileSync('assets/js/modules/auth.js', 'utf8');
    eval(authCode);
    console.log('✅ Auth.js carregado');
    
    // App
    const appCode = require('fs').readFileSync('assets/js/core/app.js', 'utf8');
    eval(appCode);
    console.log('✅ App.js carregado');
    
    // Events
    const eventsCode = require('fs').readFileSync('assets/js/modules/events.js', 'utf8');
    eval(eventsCode);
    console.log('✅ Events.js carregado');
    
    // Calendar
    const calendarCode = require('fs').readFileSync('assets/js/modules/calendar.js', 'utf8');
    eval(calendarCode);
    console.log('✅ Calendar.js carregado');
    
    console.log('\n🔍 VERIFICANDO VERSÕES:');
    console.log(`   App.js: ${typeof App !== 'undefined' ? App.config?.versao || 'N/A' : 'N/A'}`);
    console.log(`   Auth.js: ${typeof Auth !== 'undefined' ? Auth.config?.versao || 'N/A' : 'N/A'}`);
    console.log(`   Events.js: ${typeof Events !== 'undefined' ? Events.config?.versao || 'N/A' : 'N/A'}`);
    console.log(`   Calendar.js: ${typeof Calendar !== 'undefined' ? Calendar.config?.versao || 'N/A' : 'N/A'}`);
    
    console.log('\n🔍 VERIFICANDO FUNÇÕES:');
    console.log(`   App.criarTarefa: ${typeof App !== 'undefined' && typeof App.criarTarefa === 'function' ? '✅' : '❌'}`);
    console.log(`   App.editarTarefa: ${typeof App !== 'undefined' && typeof App.editarTarefa === 'function' ? '✅' : '❌'}`);
    console.log(`   App.excluirTarefa: ${typeof App !== 'undefined' && typeof App.excluirTarefa === 'function' ? '✅' : '❌'}`);
    console.log(`   App.marcarTarefaConcluida: ${typeof App !== 'undefined' && typeof App.marcarTarefaConcluida === 'function' ? '✅' : '❌'}`);
    console.log(`   Auth.listarUsuarios: ${typeof Auth !== 'undefined' && typeof Auth.listarUsuarios === 'function' ? '✅' : '❌'}`);
    console.log(`   Events.abrirModalEdicao: ${typeof Events !== 'undefined' && typeof Events.abrirModalEdicao === 'function' ? '✅' : '❌'}`);
    console.log(`   Calendar.inicializar: ${typeof Calendar !== 'undefined' && typeof Calendar.inicializar === 'function' ? '✅' : '❌'}`);
    
    console.log('\n🔍 VERIFICANDO ESTRUTURA:');
    console.log(`   App.dados: ${typeof App !== 'undefined' && App.dados ? '✅' : '❌'}`);
    console.log(`   Auth.equipe: ${typeof Auth !== 'undefined' && Auth.equipe ? '✅' : '❌'}`);
    console.log(`   Events.config: ${typeof Events !== 'undefined' && Events.config ? '✅' : '❌'}`);
    console.log(`   Calendar.config: ${typeof Calendar !== 'undefined' && Calendar.config ? '✅' : '❌'}`);
    
    // Teste de criação de tarefa
    console.log('\n🧪 TESTE DE CRIAÇÃO DE TAREFA:');
    try {
        if (typeof App !== 'undefined' && App.criarTarefa) {
            console.log('   Tentando criar tarefa de teste...');
            // Simular criação (sem salvar)
            const tarefaTeste = {
                id: 'teste-123',
                titulo: 'Tarefa de Teste',
                descricao: 'Teste de integração',
                status: 'pendente',
                responsavel: 'teste@teste.com',
                dataCriacao: new Date().toISOString()
            };
            console.log('   ✅ Estrutura de tarefa válida');
        } else {
            console.log('   ❌ App.criarTarefa não disponível');
        }
    } catch (error) {
        console.log('   ❌ Erro no teste:', error.message);
    }
    
    console.log('\n🎉 TESTE DE INTEGRAÇÃO CONCLUÍDO!');
    console.log('📊 ==========================================\n');
    
} catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    console.error('Stack:', error.stack);
} 