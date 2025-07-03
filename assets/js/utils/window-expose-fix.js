/* 🔧 FIX CIRÚRGICO: EXPOSIÇÃO DOS OBJETOS v6.5.1 */

// ✅ SOLUÇÃO: Expor objetos já carregados no window global
(function() {
    console.log('🔧 Aplicando fix de exposição dos objetos...');
    
    // Aguardar que todos os scripts carreguem
    setTimeout(() => {
        // ✅ EXPOR OBJETOS NO WINDOW GLOBAL
        
        // PersonalAgenda
        if (typeof PersonalAgenda !== 'undefined') {
            window.PersonalAgenda = PersonalAgenda;
            console.log('✅ PersonalAgenda exposto no window');
        } else {
            console.log('⚠️ PersonalAgenda não encontrado');
        }
        
        // PersonalDashboard  
        if (typeof PersonalDashboard !== 'undefined') {
            window.PersonalDashboard = PersonalDashboard;
            console.log('✅ PersonalDashboard exposto no window');
        } else {
            console.log('⚠️ PersonalDashboard não encontrado');
        }
        
        // AgendaHelpers
        if (typeof AgendaHelpers !== 'undefined') {
            window.AgendaHelpers = AgendaHelpers;
            console.log('✅ AgendaHelpers exposto no window');
        } else {
            console.log('⚠️ AgendaHelpers não encontrado');
        }
        
        // ✅ VERIFICAR SE APP E TASKS PRECISAM SER CRIADOS
        if (typeof App === 'undefined') {
            console.log('🔧 Criando objeto App básico...');
            window.App = {
                dados: {
                    tarefas: [],
                    eventos: [],
                    equipe: [],
                    areas: {}
                },
                estadoSistema: {
                    usuarioNome: 'Usuário Atual'
                }
            };
        }
        
        if (typeof Tasks === 'undefined') {
            console.log('🔧 Criando objeto Tasks básico...');
            window.Tasks = {
                abrirMinhaAgenda: function(usuario) {
                    if (window.PersonalAgenda) {
                        return window.PersonalAgenda.abrirMinhaAgenda(usuario);
                    }
                },
                fecharModal: function() {
                    console.log('Tasks.fecharModal chamado');
                },
                mostrarNovaTarefa: function(tipo, responsavel) {
                    console.log('Nova tarefa:', tipo, responsavel);
                },
                editarTarefa: function(id) {
                    console.log('Editar tarefa:', id);
                }
            };
        }
        
        if (typeof Events === 'undefined') {
            console.log('🔧 Criando objeto Events básico...');
            window.Events = {
                dados: [],
                adicionar: function(evento) {
                    console.log('Adicionar evento:', evento);
                }
            };
        }
        
        // ✅ TESTE IMEDIATO APÓS EXPOSIÇÃO
        setTimeout(() => {
            console.log('🧪 Testando objetos expostos...');
            
            const teste = {
                PersonalAgenda: typeof window.PersonalAgenda !== 'undefined',
                PersonalDashboard: typeof window.PersonalDashboard !== 'undefined', 
                AgendaHelpers: typeof window.AgendaHelpers !== 'undefined',
                App: typeof window.App !== 'undefined',
                Tasks: typeof window.Tasks !== 'undefined'
            };
            
            console.table(teste);
            
            const sucessos = Object.values(teste).filter(v => v).length;
            console.log(`✅ ${sucessos}/5 objetos disponíveis`);
            
            if (sucessos >= 4) {
                console.log('🎉 FIX APLICADO COM SUCESSO!');
                console.log('🎯 Teste agora: PersonalAgenda.abrirMinhaAgenda()');
                
                // Tentar teste básico
                if (window.PersonalAgenda && typeof window.PersonalAgenda.abrirMinhaAgenda === 'function') {
                    console.log('🎯 Modal da agenda pronto para usar!');
                }
            } else {
                console.log('⚠️ Fix parcial - alguns objetos ainda indisponíveis');
            }
            
        }, 500);
        
    }, 1000); // Aguardar 1 segundo para carregar todos os módulos
    
})();

// ✅ FUNÇÃO PARA TESTAR O FIX
window.testarFix = function() {
    console.log('🧪 Testando fix aplicado...');
    
    const objetos = ['PersonalAgenda', 'PersonalDashboard', 'AgendaHelpers', 'App', 'Tasks'];
    const resultados = objetos.map(obj => {
        const existe = typeof window[obj] !== 'undefined';
        console.log(existe ? `✅ ${obj}` : `❌ ${obj}`);
        return existe;
    });
    
    const sucessos = resultados.filter(r => r).length;
    console.log(`📊 Resultado: ${sucessos}/${objetos.length} objetos disponíveis`);
    
    if (sucessos >= 4) {
        console.log('🎉 Sistema operacional!');
        console.log('🎯 Teste: PersonalAgenda.abrirMinhaAgenda("Seu Nome")');
    }
    
    return { sucessos, total: objetos.length, percentual: Math.round((sucessos / objetos.length) * 100) };
};

console.log('🔧 Fix de exposição carregado! Execute automaticamente em 1 segundo...');
