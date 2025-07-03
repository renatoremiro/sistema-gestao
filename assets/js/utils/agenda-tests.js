/* ========== 🧪 SISTEMA DE TESTES - AGENDA HÍBRIDA v6.5.0 ========== */

const AgendaTests = {
    // ✅ CONFIGURAÇÃO DOS TESTES
    config: {
        timeoutTeste: 5000,
        delayEntreTestes: 500,
        logDetalhado: true
    },

    // ✅ ESTADO DOS TESTES
    state: {
        testesExecutados: 0,
        testesPassaram: 0,
        testesFalharam: 0,
        erros: [],
        relatorio: []
    },

    // ✅ EXECUTAR TODOS OS TESTES
    async executarTodos() {
        console.log('🧪 ===== INICIANDO BATERIA DE TESTES v6.5.0 =====');
        this._resetarContadores();
        
        const suites = [
            this.testarInfraestruturaBasica,
            this.testarPersonalAgenda,
            this.testarPersonalDashboard,
            this.testarAgendaHelpers,
            this.testarIntegracoes,
            this.testarFluxosCompletos
        ];

        for (const suite of suites) {
            try {
                await suite.call(this);
                await this._delay(this.config.delayEntreTestes);
            } catch (error) {
                console.error('❌ Erro na suite de testes:', error);
                this._registrarErro('Suite de testes', error.message);
            }
        }

        this._gerarRelatorioFinal();
        return this._obterResultado();
    },

    // ✅ TESTE 1: INFRAESTRUTURA BÁSICA
    async testarInfraestruturaBasica() {
        console.log('📋 Testando infraestrutura básica...');
        
        // App.js disponível
        this._teste('App.js carregado', () => {
            return typeof App !== 'undefined' && App.dados;
        });

        // Tasks.js disponível
        this._teste('Tasks.js carregado', () => {
            return typeof Tasks !== 'undefined';
        });

        // Calendar.js disponível
        this._teste('Calendar.js carregado', () => {
            return typeof Calendar !== 'undefined';
        });

        // Estrutura de dados
        this._teste('Estrutura App.dados válida', () => {
            return App.dados && 
                   typeof App.dados === 'object' &&
                   Array.isArray(App.dados.tarefas);
        });

        // Utilitários carregados
        this._teste('Notifications disponível', () => {
            return typeof Notifications !== 'undefined';
        });

        this._teste('Helpers disponível', () => {
            return typeof Helpers !== 'undefined';
        });
    },

    // ✅ TESTE 2: PERSONAL AGENDA
    async testarPersonalAgenda() {
        console.log('📋 Testando PersonalAgenda...');

        // Objeto principal
        this._teste('PersonalAgenda carregado', () => {
            return typeof PersonalAgenda !== 'undefined';
        });

        // Configurações
        this._teste('Configurações válidas', () => {
            return PersonalAgenda.config &&
                   Array.isArray(PersonalAgenda.config.tipos) &&
                   Array.isArray(PersonalAgenda.config.prioridades) &&
                   Array.isArray(PersonalAgenda.config.status);
        });

        // Estado inicial
        this._teste('Estado inicial correto', () => {
            return PersonalAgenda.state &&
                   typeof PersonalAgenda.state.modalAberto === 'boolean' &&
                   PersonalAgenda.state.viewModeAtual === 'dashboard';
        });

        // Métodos principais
        this._teste('Método abrirMinhaAgenda disponível', () => {
            return typeof PersonalAgenda.abrirMinhaAgenda === 'function';
        });

        this._teste('Método fecharModal disponível', () => {
            return typeof PersonalAgenda.fecharModal === 'function';
        });

        this._teste('Método mudarView disponível', () => {
            return typeof PersonalAgenda.mudarView === 'function';
        });

        // Obter tarefas do usuário
        this._teste('Método _obterMinhasTarefas funcional', () => {
            const tarefas = PersonalAgenda._obterMinhasTarefas();
            return Array.isArray(tarefas);
        });
    },

    // ✅ TESTE 3: PERSONAL DASHBOARD
    async testarPersonalDashboard() {
        console.log('📊 Testando PersonalDashboard...');

        // Objeto principal
        this._teste('PersonalDashboard carregado', () => {
            return typeof PersonalDashboard !== 'undefined';
        });

        // Métodos de renderização
        this._teste('Método renderizarGraficoProgresso disponível', () => {
            return typeof PersonalDashboard.renderizarGraficoProgresso === 'function';
        });

        this._teste('Método renderizarTarefaMini disponível', () => {
            return typeof PersonalDashboard.renderizarTarefaMini === 'function';
        });

        // Testar renderização com dados mock
        this._teste('Renderização de tarefa mini funcional', () => {
            const tarefaMock = {
                id: 999,
                titulo: 'Teste',
                tipo: 'pessoal',
                prioridade: 'media',
                progresso: 50
            };
            
            const html = PersonalDashboard.renderizarTarefaMini(tarefaMock);
            return html && html.includes('Teste') && html.includes('50%');
        });

        // Organização de dados
        this._teste('Agrupar tarefas por status funcional', () => {
            const grupos = PersonalDashboard.agruparTarefasPorStatus();
            return grupos && typeof grupos === 'object';
        });
    },

    // ✅ TESTE 4: AGENDA HELPERS
    async testarAgendaHelpers() {
        console.log('🛠️ Testando AgendaHelpers...');

        // Objeto principal
        this._teste('AgendaHelpers carregado', () => {
            return typeof AgendaHelpers !== 'undefined';
        });

        // Formatação de datas
        this._teste('Formatação de semana funcional', () => {
            const data = new Date('2025-07-15');
            const semana = AgendaHelpers.formatarSemana(data);
            return semana && typeof semana === 'string' && semana.length > 0;
        });

        this._teste('Verificação isHoje funcional', () => {
            const hoje = new Date();
            const isHoje = AgendaHelpers.isHoje(hoje);
            return isHoje === true;
        });

        this._teste('Obter início da semana funcional', () => {
            const data = new Date('2025-07-15'); // Terça
            const inicio = AgendaHelpers.obterInicioSemana(data);
            return inicio instanceof Date && inicio.getDay() === 0; // Domingo
        });

        // Validação de dados
        this._teste('Validação de dados funcional', () => {
            const resultado = AgendaHelpers.validarDados();
            return resultado && 
                   typeof resultado.valido === 'boolean' &&
                   Array.isArray(resultado.problemas);
        });

        // Estatísticas
        this._teste('Estatísticas detalhadas funcionais', () => {
            const stats = AgendaHelpers.obterEstatisticasDetalhadas();
            return stats && 
                   stats.geral && 
                   typeof stats.geral.total === 'number';
        });
    },

    // ✅ TESTE 5: INTEGRAÇÕES
    async testarIntegracoes() {
        console.log('🔗 Testando integrações...');

        // PersonalAgenda ↔ PersonalDashboard
        this._teste('Integração PersonalAgenda ↔ PersonalDashboard', () => {
            return typeof PersonalAgenda._renderizarGraficoProgresso === 'function' &&
                   typeof PersonalAgenda._renderizarTarefaMini === 'function';
        });

        // PersonalAgenda ↔ AgendaHelpers
        this._teste('Integração PersonalAgenda ↔ AgendaHelpers', () => {
            return typeof PersonalAgenda._formatarSemana === 'function' &&
                   typeof PersonalAgenda.navegarSemana === 'function' &&
                   typeof PersonalAgenda.validarDados === 'function';
        });

        // Tasks.js ↔ PersonalAgenda
        this._teste('Integração Tasks.js ↔ PersonalAgenda', () => {
            return typeof Tasks.abrirMinhaAgenda === 'function';
        });

        // Debug functions disponíveis
        this._teste('Funções de debug disponíveis', () => {
            return typeof PersonalAgenda_Debug !== 'undefined' &&
                   typeof PersonalDashboard_Debug !== 'undefined' &&
                   typeof AgendaHelpers_Debug !== 'undefined';
        });
    },

    // ✅ TESTE 6: FLUXOS COMPLETOS
    async testarFluxosCompletos() {
        console.log('🔄 Testando fluxos completos...');

        // Criar tarefa mock para testes
        const tarefaTeste = {
            id: Date.now(),
            titulo: 'Tarefa de Teste',
            tipo: 'pessoal',
            prioridade: 'media',
            status: 'pendente',
            responsavel: 'Teste User',
            progresso: 25,
            dataInicio: new Date().toISOString().split('T')[0],
            estimativa: 60,
            subtarefas: [
                { titulo: 'Subtarefa 1', concluida: false },
                { titulo: 'Subtarefa 2', concluida: true }
            ]
        };

        // Adicionar tarefa aos dados
        if (!App.dados.tarefas) App.dados.tarefas = [];
        App.dados.tarefas.push(tarefaTeste);

        // Testar obtenção de tarefas
        this._teste('Obter tarefas do usuário', () => {
            PersonalAgenda.state.usuarioAtual = 'Teste User';
            const tarefas = PersonalAgenda._obterMinhasTarefas();
            return tarefas.length > 0 && tarefas.some(t => t.id === tarefaTeste.id);
        });

        // Testar filtros
        this._teste('Aplicar filtros', () => {
            PersonalAgenda.state.filtros = { tipo: 'pessoal', status: 'todos', prioridade: 'todos' };
            const tarefasFiltradas = PersonalAgenda._obterMinhasTarefasFiltradas();
            return tarefasFiltradas.some(t => t.tipo === 'pessoal');
        });

        // Testar cálculo de estatísticas
        this._teste('Calcular estatísticas pessoais', () => {
            PersonalAgenda._calcularEstatisticasPessoais();
            const stats = PersonalAgenda.state.estatisticasPessoais;
            return stats && typeof stats.total === 'number';
        });

        // Testar renderização de tarefa
        this._teste('Renderizar tarefa completa', () => {
            const html = PersonalDashboard.renderizarTarefaCompleta(tarefaTeste);
            return html && 
                   html.includes(tarefaTeste.titulo) &&
                   html.includes('25%') &&
                   html.includes('Subtarefa');
        });

        // Testar organização por dia
        this._teste('Organizar tarefas por dia', () => {
            const inicioSemana = AgendaHelpers.obterInicioSemana(new Date());
            const tarefasPorDia = PersonalDashboard.organizarTarefasPorDia(inicioSemana);
            return tarefasPorDia && typeof tarefasPorDia === 'object';
        });

        // Limpar tarefa de teste
        const index = App.dados.tarefas.findIndex(t => t.id === tarefaTeste.id);
        if (index > -1) {
            App.dados.tarefas.splice(index, 1);
        }
    },

    // ✅ TESTES ESPECÍFICOS DE INTERFACE
    async testarInterface() {
        console.log('🎨 Testando interface...');

        // Verificar se botão foi adicionado
        this._teste('Botão Minha Agenda adicionado', () => {
            const botao = document.getElementById('btnMinhaAgenda');
            return botao !== null;
        });

        // Testar abertura de modal (simulada)
        this._teste('Modal pode ser criado', () => {
            try {
                // Simular usuário
                PersonalAgenda.state.usuarioAtual = 'Teste User';
                PersonalAgenda._calcularEstatisticasPessoais();
                
                // Criar HTML do modal (sem adicionar ao DOM)
                const modalHTML = PersonalAgenda._criarModalMinhaAgenda;
                return typeof modalHTML === 'function';
            } catch (error) {
                return false;
            }
        });

        // Testar views disponíveis
        this._teste('Views configuradas corretamente', () => {
            const views = PersonalAgenda.config.viewModes;
            return Array.isArray(views) && 
                   views.length === 4 &&
                   views.some(v => v.value === 'dashboard');
        });
    },

    // ✅ MÉTODOS AUXILIARES DE TESTE
    _teste(nome, funcaoTeste) {
        this.state.testesExecutados++;
        
        try {
            const resultado = funcaoTeste();
            
            if (resultado) {
                this.state.testesPassaram++;
                this._log(`✅ ${nome}`, 'success');
                this.state.relatorio.push({ nome, status: 'PASS', detalhes: null });
            } else {
                this.state.testesFalharam++;
                this._log(`❌ ${nome}`, 'error');
                this.state.relatorio.push({ nome, status: 'FAIL', detalhes: 'Retornou false' });
            }
            
        } catch (error) {
            this.state.testesFalharam++;
            this._log(`❌ ${nome}: ${error.message}`, 'error');
            this.state.relatorio.push({ nome, status: 'ERROR', detalhes: error.message });
            this._registrarErro(nome, error.message);
        }
    },

    _log(mensagem, tipo = 'info') {
        if (!this.config.logDetalhado) return;
        
        const cor = {
            'success': 'color: #10b981',
            'error': 'color: #ef4444',
            'info': 'color: #3b82f6',
            'warning': 'color: #f59e0b'
        }[tipo] || 'color: #6b7280';
        
        console.log(`%c${mensagem}`, cor);
    },

    _registrarErro(teste, erro) {
        this.state.erros.push({ teste, erro, timestamp: new Date().toISOString() });
    },

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    _resetarContadores() {
        this.state.testesExecutados = 0;
        this.state.testesPassaram = 0;
        this.state.testesFalharam = 0;
        this.state.erros = [];
        this.state.relatorio = [];
    },

    _obterResultado() {
        return {
            total: this.state.testesExecutados,
            passaram: this.state.testesPassaram,
            falharam: this.state.testesFalharam,
            sucessoPercentual: Math.round((this.state.testesPassaram / this.state.testesExecutados) * 100),
            erros: this.state.erros,
            relatorio: this.state.relatorio
        };
    },

    _gerarRelatorioFinal() {
        const resultado = this._obterResultado();
        
        console.log('\n🧪 ===== RELATÓRIO FINAL DOS TESTES =====');
        console.log(`📊 Total de testes: ${resultado.total}`);
        console.log(`✅ Passaram: ${resultado.passaram}`);
        console.log(`❌ Falharam: ${resultado.falharam}`);
        console.log(`📈 Taxa de sucesso: ${resultado.sucessoPercentual}%`);
        
        if (resultado.erros.length > 0) {
            console.log('\n❌ ERROS ENCONTRADOS:');
            resultado.erros.forEach(erro => {
                console.log(`   • ${erro.teste}: ${erro.erro}`);
            });
        }
        
        console.log('\n📋 RESUMO POR CATEGORIA:');
        const categorias = {};
        resultado.relatorio.forEach(item => {
            const categoria = item.nome.split(' ')[0];
            if (!categorias[categoria]) {
                categorias[categoria] = { pass: 0, fail: 0, error: 0 };
            }
            categorias[categoria][item.status.toLowerCase()]++;
        });
        
        Object.entries(categorias).forEach(([cat, stats]) => {
            console.log(`   ${cat}: ✅${stats.pass} ❌${stats.fail} ⚠️${stats.error}`);
        });
        
        const statusGeral = resultado.sucessoPercentual >= 90 ? '🎉 EXCELENTE' :
                           resultado.sucessoPercentual >= 75 ? '✅ BOM' :
                           resultado.sucessoPercentual >= 50 ? '⚠️ REGULAR' : '❌ CRÍTICO';
        
        console.log(`\n${statusGeral} - Sistema ${resultado.sucessoPercentual >= 75 ? 'pronto para uso' : 'precisa de ajustes'}`);
        console.log('🧪 ===== FIM DO RELATÓRIO =====\n');
        
        return resultado;
    },

    // ✅ TESTES RÁPIDOS INDIVIDUAIS
    testeRapido: {
        agenda: () => {
            console.log('🧪 Teste rápido: PersonalAgenda');
            return typeof PersonalAgenda !== 'undefined' && 
                   typeof PersonalAgenda.abrirMinhaAgenda === 'function';
        },
        
        dashboard: () => {
            console.log('🧪 Teste rápido: PersonalDashboard');
            return typeof PersonalDashboard !== 'undefined' && 
                   typeof PersonalDashboard.renderizarGraficoProgresso === 'function';
        },
        
        helpers: () => {
            console.log('🧪 Teste rápido: AgendaHelpers');
            return typeof AgendaHelpers !== 'undefined' && 
                   typeof AgendaHelpers.validarDados === 'function';
        },
        
        integracao: () => {
            console.log('🧪 Teste rápido: Integração');
            return typeof PersonalAgenda._formatarSemana === 'function' &&
                   typeof Tasks.abrirMinhaAgenda === 'function';
        }
    },

    // ✅ DIAGNÓSTICO DO SISTEMA
    async diagnosticar() {
        console.log('🔍 Executando diagnóstico do sistema...');
        
        const diagnostico = {
            timestamp: new Date().toISOString(),
            modulos: {
                App: typeof App !== 'undefined' && !!App.dados,
                Tasks: typeof Tasks !== 'undefined',
                Calendar: typeof Calendar !== 'undefined',
                PersonalAgenda: typeof PersonalAgenda !== 'undefined',
                PersonalDashboard: typeof PersonalDashboard !== 'undefined',
                AgendaHelpers: typeof AgendaHelpers !== 'undefined',
                Notifications: typeof Notifications !== 'undefined'
            },
            dados: {
                estruturaValida: !!(App.dados && Array.isArray(App.dados.tarefas)),
                totalTarefas: App.dados?.tarefas?.length || 0,
                totalEventos: App.dados?.eventos?.length || 0,
                areas: App.dados?.areas ? Object.keys(App.dados.areas).length : 0
            },
            integracao: {
                agendaExtendida: typeof PersonalAgenda._formatarSemana === 'function',
                tasksExtendido: typeof Tasks.abrirMinhaAgenda === 'function',
                debugDisponivel: typeof PersonalAgenda_Debug !== 'undefined'
            },
            interface: {
                botaoAdicionado: !!document.getElementById('btnMinhaAgenda'),
                estilosCarregados: !!document.getElementById('personalAgendaStyles')
            }
        };
        
        console.table(diagnostico.modulos);
        console.table(diagnostico.dados);
        console.table(diagnostico.integracao);
        console.table(diagnostico.interface);
        
        const problemas = [];
        if (!diagnostico.modulos.PersonalAgenda) problemas.push('PersonalAgenda não carregado');
        if (!diagnostico.dados.estruturaValida) problemas.push('Estrutura de dados inválida');
        if (!diagnostico.integracao.agendaExtendida) problemas.push('Integração incompleta');
        
        if (problemas.length === 0) {
            console.log('✅ Sistema funcionando corretamente!');
        } else {
            console.log('⚠️ Problemas encontrados:', problemas);
        }
        
        return diagnostico;
    }
};

// ✅ FUNÇÕES GLOBAIS PARA TESTES
window.AgendaTests = AgendaTests;

window.testarAgendaCompleta = () => AgendaTests.executarTodos();
window.diagnosticarAgenda = () => AgendaTests.diagnosticar();
window.testeRapidoAgenda = () => {
    console.log('🧪 ===== TESTE RÁPIDO =====');
    const resultados = Object.entries(AgendaTests.testeRapido).map(([nome, teste]) => {
        const passou = teste();
        console.log(passou ? `✅ ${nome}` : `❌ ${nome}`);
        return passou;
    });
    
    const sucessos = resultados.filter(r => r).length;
    const total = resultados.length;
    const percentual = Math.round((sucessos / total) * 100);
    
    console.log(`📊 Resultado: ${sucessos}/${total} (${percentual}%)`);
    return { sucessos, total, percentual };
};

// ✅ EXECUTAR TESTE BÁSICO NA INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🧪 Executando teste básico de inicialização...');
        
        const basicTest = {
            personalAgenda: typeof PersonalAgenda !== 'undefined',
            personalDashboard: typeof PersonalDashboard !== 'undefined',
            agendaHelpers: typeof AgendaHelpers !== 'undefined',
            integracaoCompleta: typeof PersonalAgenda._formatarSemana === 'function'
        };
        
        const sucessos = Object.values(basicTest).filter(v => v).length;
        const total = Object.keys(basicTest).length;
        
        if (sucessos === total) {
            console.log('✅ Sistema híbrido inicializado com sucesso!');
            console.log('🎯 Para testes completos: testarAgendaCompleta()');
            console.log('🔍 Para diagnóstico: diagnosticarAgenda()');
        } else {
            console.log('⚠️ Sistema parcialmente carregado');
            console.log('🧪 Execute: diagnosticarAgenda() para detalhes');
        }
    }, 3000);
});

console.log('🧪 Sistema de Testes v6.5.0 carregado!');
console.log('🎯 Comandos disponíveis:');
console.log('   • testarAgendaCompleta() - Bateria completa de testes');
console.log('   • testeRapidoAgenda() - Teste rápido dos módulos');
console.log('   • diagnosticarAgenda() - Diagnóstico detalhado');
console.log('   • AgendaTests.testarInterface() - Testes de interface');
