// Sistema de Verificações BIAPO v8.6.0 UNIFICADO
const VerificacoesBiapoUnificado = {
    async verificacaoRapida() {
        console.log('🚀 VERIFICAÇÃO RÁPIDA SISTEMA BIAPO v8.6.0 UNIFICADO');
        
        const checks = [
            { nome: 'Firebase', test: () => typeof window.firebase !== 'undefined' || typeof window.Firebase !== 'undefined' },
            { nome: 'DataStructure', test: () => typeof window.DataStructure !== 'undefined' },
            { nome: 'App v8.6.0', test: () => typeof window.App !== 'undefined' && App.config?.versao === '8.6.0' },
            { nome: 'Auth', test: () => typeof window.Auth !== 'undefined' },
            { nome: 'Events', test: () => typeof window.Events !== 'undefined' },
            { nome: 'Calendar v8.2.0', test: () => typeof window.Calendar !== 'undefined' },
            { nome: 'Persistence', test: () => typeof window.Persistence !== 'undefined' },
            { nome: 'App.criarTarefa', test: () => typeof App?.criarTarefa === 'function' },
            { nome: 'App.obterTarefasUsuario', test: () => typeof App?.obterTarefasUsuario === 'function' },
            { nome: 'Usuários BIAPO', test: () => DataStructure?.usuariosBiapo && Object.keys(DataStructure.usuariosBiapo).length >= 10 },
            { nome: 'Sistema Unificado', test: () => App?.dados && typeof App.dados.tarefas !== 'undefined' }
        ];
        
        let aprovados = 0;
        let detalhes = {};
        
        for (const check of checks) {
            try {
                const resultado = check.test();
                detalhes[check.nome] = resultado;
                console.log(`${resultado ? '✅' : '❌'} ${check.nome}`);
                if (resultado) aprovados++;
            } catch (e) {
                detalhes[check.nome] = false;
                console.log(`❌ ${check.nome} (erro: ${e.message})`);
            }
        }
        
        const porcentagem = (aprovados / checks.length) * 100;
        const status = porcentagem >= 95 ? '🟢 EXCELENTE' : 
                     porcentagem >= 80 ? '🟡 BOM' : 
                     porcentagem >= 50 ? '🟠 REGULAR' : '🔴 CRÍTICO';
        
        console.log(`\n📊 RESULTADO: ${status} - ${aprovados}/${checks.length} (${porcentagem.toFixed(1)}%)`);
        
        return { porcentagem, aprovados, total: checks.length, detalhes };
    },

    async diagnosticoCompletoUnificado() {
        console.log('🔍 ============ DIAGNÓSTICO SISTEMA BIAPO v8.6.0 UNIFICADO ============');
        console.log('⏰ Iniciando em:', new Date().toLocaleString('pt-BR'));
        
        const resultado = await this.verificacaoRapida();
        
        console.log('\n📦 STATUS DOS MÓDULOS UNIFICADOS:');
        const modulos = ['Firebase', 'DataStructure', 'App', 'Auth', 'Events', 'Calendar', 'Persistence', 'Notifications', 'Helpers'];
        modulos.forEach(modulo => {
            const disponivel = typeof window[modulo] !== 'undefined';
            let extra = '';
            
            if (disponivel) {
                try {
                    if (modulo === 'App' && App.obterStatusSistema) {
                        const status = App.obterStatusSistema();
                        extra = ` (v${status.versao}, ${status.sistemaUnificado ? 'UNIFICADO' : 'Padrão'})`;
                    } else if (modulo === 'Calendar' && Calendar.obterStatus) {
                        const status = Calendar.obterStatus();
                        extra = ` (${status.tipo})`;
                    }
                } catch (e) {
                    extra = ' (erro ao obter info)';
                }
            }
            
            console.log(`  ${disponivel ? '✅' : '❌'} ${modulo}${extra}`);
        });
        
        console.log('\n🔥 FUNCIONALIDADES UNIFICADAS:');
        console.log(`  ${typeof App?.criarTarefa === 'function' ? '✅' : '❌'} App.criarTarefa() - Criar tarefas via App.js`);
        console.log(`  ${typeof App?.editarTarefa === 'function' ? '✅' : '❌'} App.editarTarefa() - Editar tarefas via App.js`);
        console.log(`  ${typeof App?.obterTarefasUsuario === 'function' ? '✅' : '❌'} App.obterTarefasUsuario() - Buscar tarefas`);
        console.log(`  ${App?.dados?.tarefas ? '✅' : '❌'} App.dados.tarefas[] - Array de tarefas unificado`);
        console.log(`  ${App?.dados?.eventos ? '✅' : '❌'} App.dados.eventos[] - Array de eventos unificado`);
        
        // ❌ VERIFICAR REMOÇÃO PERSONALTASKS
        console.log('\n🗑️ VERIFICAÇÃO LIMPEZA:');
        console.log(`  ${typeof PersonalTasks === 'undefined' ? '✅' : '❌'} PersonalTasks removido (esperado: undefined)`);
        console.log(`  ${typeof window.personal_tasks === 'undefined' ? '✅' : '❌'} window.personal_tasks removido`);
        console.log(`  ${typeof criarTarefaPessoal === 'undefined' ? '✅' : '❌'} criarTarefaPessoal() removido (agora App.criarTarefa())`);
        
        console.log('\n💡 RECOMENDAÇÕES v8.6.0:');
        if (resultado.porcentagem >= 95) {
            console.log('  🎉 Sistema UNIFICADO funcionando perfeitamente!');
            console.log('  ✅ App.js v8.6.0 com tarefas integradas funcionando');
            console.log('  🔥 PersonalTasks.js removido com sucesso');
            console.log('  🚀 Sistema pronto para uso em produção');
        } else if (resultado.porcentagem >= 80) {
            console.log('  👍 Sistema UNIFICADO funcionando bem');
            console.log('  🔧 Algumas verificações menores falharam');
        } else {
            console.log('  ⚠️ Sistema UNIFICADO precisa de atenção');
            console.log('  🛠️ Verifique os módulos marcados com ❌');
        }
        
        console.log('\n⏰ Diagnóstico concluído em:', new Date().toLocaleString('pt-BR'));
        console.log('🔍 ================================================================');
        
        return resultado;
    }
};

// 🔥 FUNÇÕES GLOBAIS UNIFICADAS
window.verificarSistemaUnificado = () => VerificacoesBiapoUnificado.diagnosticoCompletoUnificado();
window.verificarSistema = () => VerificacoesBiapoUnificado.diagnosticoCompletoUnificado(); // Manter compatibilidade
window.verificacaoRapida = () => VerificacoesBiapoUnificado.verificacaoRapida();

// ✅ GARANTIR EXPOSIÇÃO DO FIREBASE
if (typeof firebase !== 'undefined') {
    window.Firebase = firebase;
}

// ✅ FUNÇÕES UNIFICADAS PARA TAREFAS (via App.js)
window.criarTarefaUnificada = function() {
    try {
        console.log('📋 Criando tarefa via App.js unificado...');
        
        if (typeof App !== 'undefined' && App.criarTarefa) {
            // Dados básicos para teste
            const dadosTarefa = {
                titulo: 'Tarefa criada pelo sistema principal',
                descricao: 'Tarefa de teste criada via App.js unificado',
                tipo: 'pessoal',
                prioridade: 'media',
                dataInicio: new Date().toISOString().split('T')[0]
            };
            
            App.criarTarefa(dadosTarefa).then(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.success('✅ Tarefa criada via App.js unificado!');
                } else {
                    alert('✅ Tarefa criada via App.js unificado!');
                }
            }).catch(error => {
                console.error('❌ Erro ao criar tarefa:', error);
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('❌ Erro ao criar tarefa');
                } else {
                    alert('❌ Erro ao criar tarefa: ' + error.message);
                }
            });
        } else {
            throw new Error('App.js não disponível ou sem função criarTarefa()');
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar tarefa unificada:', error);
        if (typeof Notifications !== 'undefined') {
            Notifications.error('❌ App.js não disponível para criar tarefa');
        } else {
            alert('❌ App.js não disponível para criar tarefa');
        }
    }
};

// 🔥 ABRIR AGENDA UNIFICADA (nova função)
window.abrirMinhaAgendaUnificada = function() {
    try {
        console.log('📅 Abrindo Minha Agenda UNIFICADA...');
        
        // ✅ VERIFICAR SE APP.JS ESTÁ DISPONÍVEL
        if (typeof App !== 'undefined' && App.estadoSistema?.inicializado) {
            console.log('✅ App.js v8.6.0 UNIFICADO disponível - redirecionando para agenda');
            window.location.href = 'agenda.html';
        } else {
            console.warn('⚠️ App.js não inicializado completamente - redirecionando mesmo assim');
            window.location.href = 'agenda.html';
        }
        
    } catch (error) {
        console.error('❌ Erro ao abrir agenda unificada:', error);
        window.location.href = 'agenda.html'; // Fallback
    }
};

// 💾 SALVAR DADOS VIA SISTEMA UNIFICADO
window.salvarDadosUnificado = function() {
    try {
        console.log('💾 Salvando dados via App.js unificado...');
        
        if (typeof App !== 'undefined' && App._salvarDadosUnificados) {
            App._salvarDadosUnificados().then(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.success('✅ Dados salvos via App.js unificado!');
                } else {
                    alert('✅ Dados salvos via App.js unificado!');
                }
            }).catch(error => {
                console.error('❌ Erro ao salvar:', error);
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('❌ Erro ao salvar dados');
                }
            });
        } else if (typeof Persistence !== 'undefined' && Persistence.salvarDadosCritico) {
            Persistence.salvarDadosCritico();
        } else {
            throw new Error('Sistema de persistência não disponível');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar dados unificado:', error);
        if (typeof Notifications !== 'undefined') {
            Notifications.warning('⚠️ Sistema de salvamento não disponível no momento');
        } else {
            alert('⚠️ Sistema de salvamento não disponível no momento');
        }
    }
};

// ⚠️ MANTER COMPATIBILIDADE COM FUNÇÕES ANTIGAS
window.salvarDadosCritico = function() {
    console.warn('⚠️ salvarDadosCritico() é função legada - usando salvarDadosUnificado()');
    salvarDadosUnificado();
};

// ❌ DETECTAR USO DE PERSONALTASKS (para debug)
if (typeof PersonalTasks !== 'undefined') {
    console.warn('⚠️ PersonalTasks ainda carregado! Deve ser removido para sistema unificado.');
} else {
    console.log('✅ PersonalTasks removido com sucesso - sistema 100% unificado!');
}

console.log('🔍 Sistema de Verificações BIAPO v8.6.0 UNIFICADO carregado!');
console.log('📋 Comandos: verificarSistemaUnificado() | verificacaoRapida()');
console.log('🔥 Funções: criarTarefaUnificada() | abrirMinhaAgendaUnificada()');
let agendaFase4;

// ✅ AGUARDAR CARREGAMENTO COMPLETO
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado - inicializando Agenda Fase 4...');
    agendaFase4 = new AgendaFase4();
});

// ✅ FALLBACK PARA CASOS DE CARREGAMENTO TARDIO
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!agendaFase4) {
            agendaFase4 = new AgendaFase4();
        }
    });
} else {
    setTimeout(() => {
        if (!agendaFase4) {
            agendaFase4 = new AgendaFase4();
        }
    }, 100);
}
