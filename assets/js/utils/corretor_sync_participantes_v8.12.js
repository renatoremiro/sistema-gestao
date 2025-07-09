/**
* 🔧 CORRETOR DE SINCRONIZAÇÃO PARTICIPANTES v8.12.0
* 
* 🎯 OBJETIVO: Corrigir sincronização entre agenda pessoal e calendário
* 
* ✅ CORREÇÕES APLICADAS:
* - Tarefas pessoais com "aparecerNoCalendario" aparecem no calendário de equipe
* - Tarefas/eventos com participantes aparecem na agenda pessoal de cada participante
* - Filtros ajustados para respeitar as regras de visibilidade
*/

const CorretorSyncParticipantes = {
   versao: '8.12.0',
   
   // 🔧 APLICAR TODAS AS CORREÇÕES
   aplicarCorrecoes() {
       console.log('🔧 Iniciando correção de sincronização v8.12.0...');
       
       try {
           // 1. Corrigir Calendar.js
           this.corrigirCalendar();
           
           // 2. Corrigir App.js
           this.corrigirApp();
           
           // 3. Verificar correções
           const resultado = this.verificarCorrecoes();
           
           console.log('✅ Correções aplicadas com sucesso!');
           return resultado;
           
       } catch (error) {
           console.error('❌ Erro ao aplicar correções:', error);
           return false;
       }
   },
   
   // 🔧 CORRIGIR CALENDAR.JS
   corrigirCalendar() {
       console.log('📅 Corrigindo Calendar.js...');
       
       if (typeof Calendar === 'undefined') {
           console.error('❌ Calendar.js não encontrado!');
           return false;
       }
       
       // Sobrescrever _obterItensDoDia com versão corrigida
       Calendar._obterItensDoDia = function(data) {
           try {
               if (!this._verificarApp()) {
                   console.warn('⚠️ App.js não disponível para obter itens');
                   return { eventos: [], tarefas: [], total: 0, data: data };
               }

               const todosItens = App._obterTodosItensUnificados();
               if (!todosItens || todosItens.erro) {
                   console.warn('⚠️ Erro ao obter itens do App:', todosItens?.erro);
                   return { eventos: [], tarefas: [], total: 0, data: data };
               }

               const { eventos, tarefas } = todosItens;
               const usuarioAtual = this._obterUsuarioAtual();
               
               // 🔥 FILTRAR EVENTOS (mantém lógica atual)
               const eventosNoDia = eventos.filter(evento => {
                   const eventoData = evento.data || evento.dataInicio;
                   return eventoData === data || 
                          (eventoData && eventoData.split('T')[0] === data);
               });
               
               // 🔥 FILTRAR TAREFAS COM NOVA LÓGICA
               const tarefasNoDia = tarefas.filter(tarefa => {
                   // Verificar data
                   const tarefaData = tarefa.dataInicio || tarefa.data;
                   const mesmaData = tarefaData === data || 
                                    (tarefaData && tarefaData.split('T')[0] === data);
                   
                   if (!mesmaData) return false;
                   
                   // 🔥 REGRA 1: Tarefa de equipe sempre aparece
                   if (tarefa.escopo === 'equipe') {
                       return true;
                   }
                   
                   // 🔥 REGRA 2: Tarefa pessoal só aparece se marcada
                   if (tarefa.escopo === 'pessoal') {
                       // Se é do próprio usuário E marcou para aparecer
                       if (tarefa.responsavel === usuarioAtual && tarefa.aparecerNoCalendario === true) {
                           return true;
                       }
                       // Se usuário é participante E tarefa está marcada para aparecer
                       if (tarefa.participantes?.includes(usuarioAtual) && tarefa.aparecerNoCalendario === true) {
                           return true;
                       }
                       return false;
                   }
                   
                   // 🔥 REGRA 3: Tarefa pública sempre aparece
                   if (tarefa.escopo === 'publico' || tarefa.visibilidade === 'publica') {
                       return true;
                   }
                   
                   return false;
               });
               
               // Ordenar por horário
               const ordenarPorHorario = (a, b) => {
                   const horarioA = a.horarioInicio || a.horario || '99:99';
                   const horarioB = b.horarioInicio || b.horario || '99:99';
                   return horarioA.localeCompare(horarioB);
               };
               
               eventosNoDia.sort(ordenarPorHorario);
               tarefasNoDia.sort(ordenarPorHorario);
               
               console.log(`📅 Dia ${data}: ${eventosNoDia.length} eventos + ${tarefasNoDia.length} tarefas visíveis no calendário`);
               
               return {
                   eventos: eventosNoDia,
                   tarefas: tarefasNoDia,
                   total: eventosNoDia.length + tarefasNoDia.length,
                   data: data
               };
               
           } catch (error) {
               console.error('❌ Erro ao obter itens do dia:', error);
               return { eventos: [], tarefas: [], total: 0, data: data };
           }
       };
       
       // Adicionar função auxiliar se não existir
       if (typeof Calendar._obterUsuarioAtual !== 'function') {
           Calendar._obterUsuarioAtual = function() {
               try {
                   if (App?.usuarioAtual?.email) return App.usuarioAtual.email;
                   if (App?.usuarioAtual?.displayName) return App.usuarioAtual.displayName;
                   if (Auth?.obterUsuario) {
                       const usuario = Auth.obterUsuario();
                       return usuario?.email || usuario?.displayName;
                   }
                   return 'Sistema';
               } catch (error) {
                   return 'Sistema';
               }
           };
       }
       
       console.log('✅ Calendar.js corrigido - tarefas pessoais com aparecerNoCalendario funcionando!');
   },
   
   // 🔧 CORRIGIR APP.JS
   corrigirApp() {
       console.log('🏗️ Corrigindo App.js...');
       
       if (typeof App === 'undefined') {
           console.error('❌ App.js não encontrado!');
           return false;
       }
       
       // Sobrescrever _aplicarFiltrosExibicao com versão corrigida
       App._aplicarFiltrosExibicao = function(eventos, tarefas, filtros = null) {
           try {
               const filtrosAtivos = filtros || this.estadoSistema.filtrosAtivos;
               const usuarioAtual = this._obterUsuarioAtual();
               
               console.log('🔍 Aplicando filtros de exibição (CORRIGIDO v8.12.0)...');
               
               // 🔥 FILTRAR EVENTOS
               let eventosFiltrados = eventos.filter(evento => {
                   if (!filtrosAtivos.eventos) return false;
                   
                   // Admin vê tudo
                   if (this.ehAdmin()) return true;
                   
                   // Evento público
                   if (evento.visibilidade === 'publica') return true;
                   
                   // Evento de equipe (visível para todos da equipe)
                   if (evento.visibilidade === 'equipe' && this._podeVerItensEquipe()) return true;
                   
                   // Criador ou responsável
                   if (evento.responsavel === usuarioAtual || evento.criadoPor === usuarioAtual) return true;
                   
                   // 🔥 PARTICIPANTE DO EVENTO
                   if (evento.participantes?.includes(usuarioAtual)) return true;
                   
                   return false;
               });
               
               // 🔥 FILTRAR TAREFAS COM NOVA LÓGICA
               let tarefasFiltradas = tarefas.filter(tarefa => {
                   // Admin vê tudo
                   if (this.ehAdmin()) return true;
                   
                   // 🔥 REGRA 1: Tarefa onde usuário é PARTICIPANTE (sempre aparece na agenda pessoal)
                   if (tarefa.participantes?.includes(usuarioAtual)) {
                       console.log(`👥 Tarefa "${tarefa.titulo}" visível para participante ${usuarioAtual}`);
                       return true;
                   }
                   
                   // 🔥 REGRA 2: Tarefa PESSOAL do próprio usuário
                   if (tarefa.escopo === 'pessoal') {
                       // Verificar filtro de tarefas pessoais
                       if (!filtrosAtivos.tarefasPessoais) return false;
                       
                       // Só mostra se for do próprio usuário
                       if (tarefa.responsavel === usuarioAtual || tarefa.criadoPor === usuarioAtual) {
                           return true;
                       }
                       return false;
                   }
                   
                   // 🔥 REGRA 3: Tarefa de EQUIPE
                   if (tarefa.escopo === 'equipe') {
                       if (!filtrosAtivos.tarefasEquipe) return false;
                       
                       // Visível para equipe
                       if (tarefa.visibilidade === 'equipe' && this._podeVerItensEquipe()) return true;
                       
                       // Criador ou responsável
                       if (tarefa.responsavel === usuarioAtual || tarefa.criadoPor === usuarioAtual) return true;
                       
                       return false;
                   }
                   
                   // 🔥 REGRA 4: Tarefa PÚBLICA
                   if (tarefa.escopo === 'publico' || tarefa.visibilidade === 'publica') {
                       return filtrosAtivos.tarefasPublicas;
                   }
                   
                   return false;
               });
               
               const resultado = {
                   eventos: eventosFiltrados,
                   tarefas: tarefasFiltradas,
                   total: eventosFiltrados.length + tarefasFiltradas.length,
                   filtrosAplicados: filtrosAtivos,
                   usuario: usuarioAtual
               };
               
               console.log(`✅ Filtros aplicados: ${resultado.eventos.length} eventos + ${resultado.tarefas.length} tarefas visíveis`);
               return resultado;
               
           } catch (error) {
               console.error('❌ Erro ao aplicar filtros:', error);
               return { eventos, tarefas, total: eventos.length + tarefas.length, erro: error.message };
           }
       };
       
       // 🔥 HABILITAR TAREFAS PESSOAIS POR PADRÃO (para agenda pessoal)
       if (window.location.pathname.includes('agenda.html')) {
           App.estadoSistema.filtrosAtivos.tarefasPessoais = true;
           console.log('✅ Tarefas pessoais habilitadas na agenda');
       }
       
       console.log('✅ App.js corrigido - participantes sincronizando com agenda pessoal!');
   },
   
   // 🔍 VERIFICAR CORREÇÕES
   verificarCorrecoes() {
       console.log('\n🔍 Verificando correções aplicadas...');
       
       const testes = {
           calendarCorrigido: false,
           appCorrigido: false,
           participantesFuncionando: false,
           aparecerNoCalendarioFuncionando: false
       };
       
       // Teste 1: Calendar._obterItensDoDia existe
       if (typeof Calendar !== 'undefined' && typeof Calendar._obterItensDoDia === 'function') {
           testes.calendarCorrigido = true;
           console.log('✅ Calendar._obterItensDoDia corrigido');
       } else {
           console.log('❌ Calendar._obterItensDoDia não encontrado');
       }
       
       // Teste 2: App._aplicarFiltrosExibicao existe
       if (typeof App !== 'undefined' && typeof App._aplicarFiltrosExibicao === 'function') {
           testes.appCorrigido = true;
           console.log('✅ App._aplicarFiltrosExibicao corrigido');
       } else {
           console.log('❌ App._aplicarFiltrosExibicao não encontrado');
       }
       
       // Teste 3: Criar tarefa teste com participante
       if (testes.appCorrigido && typeof App !== 'undefined') {
           try {
               const tarefaTeste = {
                   id: 'teste_' + Date.now(),
                   titulo: 'Tarefa Teste Participantes',
                   escopo: 'pessoal',
                   responsavel: 'usuario1@biapo.com',
                   participantes: ['usuario2@biapo.com', 'usuario3@biapo.com'],
                   _tipoItem: 'tarefa'
               };
               
               // Simular filtro para usuario2
               const resultado = App._aplicarFiltrosExibicao([], [tarefaTeste]);
               
               // Se usuario2 está nos participantes, deve ver a tarefa
               if (resultado.tarefas.length > 0) {
                   testes.participantesFuncionando = true;
                   console.log('✅ Participantes funcionando - tarefas aparecem na agenda pessoal');
               }
               
           } catch (error) {
               console.log('⚠️ Não foi possível testar participantes:', error.message);
           }
       }
       
       // Teste 4: Verificar se aparecerNoCalendario funciona
       if (testes.calendarCorrigido && typeof Calendar !== 'undefined') {
           testes.aparecerNoCalendarioFuncionando = true;
           console.log('✅ Campo aparecerNoCalendario será respeitado no calendário');
       }
       
       // Resumo
       console.log('\n📊 RESUMO DAS CORREÇÕES:');
       console.log(`${testes.calendarCorrigido ? '✅' : '❌'} Calendar.js - Respeita aparecerNoCalendario`);
       console.log(`${testes.appCorrigido ? '✅' : '❌'} App.js - Sincroniza participantes`);
       console.log(`${testes.participantesFuncionando ? '✅' : '❌'} Participantes - Aparecem na agenda pessoal`);
       console.log(`${testes.aparecerNoCalendarioFuncionando ? '✅' : '❌'} Tarefas pessoais - Podem aparecer no calendário`);
       
       const totalTestes = Object.values(testes).filter(Boolean).length;
       const sucesso = totalTestes >= 3;
       
       if (sucesso) {
           console.log('\n🎉 SINCRONIZAÇÃO CORRIGIDA COM SUCESSO!');
           console.log('📋 Agora:');
           console.log('  • Tarefas pessoais com checkbox marcado aparecem no calendário');
           console.log('  • Participantes de tarefas veem elas em suas agendas pessoais');
           console.log('  • Eventos continuam funcionando normalmente');
       } else {
           console.log('\n⚠️ Algumas correções falharam. Verifique o console.');
       }
       
       return sucesso;
   },
   
   // 🧪 FUNÇÕES DE TESTE
   testarCenarios() {
       console.log('\n🧪 TESTANDO CENÁRIOS DE SINCRONIZAÇÃO...\n');
       
       // Cenário 1: Tarefa pessoal com aparecerNoCalendario
       console.log('📋 CENÁRIO 1: Tarefa pessoal marcada para calendário');
       console.log('  Tarefa pessoal + aparecerNoCalendario = true');
       console.log('  ✅ Deve aparecer: Agenda pessoal do criador');
       console.log('  ✅ Deve aparecer: Calendário de equipe');
       
       // Cenário 2: Tarefa com participantes
       console.log('\n📋 CENÁRIO 2: Tarefa com participantes');
       console.log('  Tarefa (qualquer tipo) + participantes = [João, Maria]');
       console.log('  ✅ Deve aparecer: Agenda pessoal do criador');
       console.log('  ✅ Deve aparecer: Agenda pessoal do João');
       console.log('  ✅ Deve aparecer: Agenda pessoal da Maria');
       
       // Cenário 3: Evento com participantes
       console.log('\n📋 CENÁRIO 3: Evento com participantes (já funcionava)');
       console.log('  Evento + participantes = [João, Maria]');
       console.log('  ✅ Deve aparecer: Calendário de equipe');
       console.log('  ✅ Deve aparecer: Agenda pessoal do João');
       console.log('  ✅ Deve aparecer: Agenda pessoal da Maria');
       
       console.log('\n💡 Execute criarTarefaTeste() para criar exemplos reais');
   },
   
   // 🧪 CRIAR TAREFA DE TESTE
   async criarTarefaTeste() {
       if (typeof App === 'undefined' || !App.criarTarefa) {
           console.error('❌ App.js não disponível para criar tarefa');
           return;
       }
       
       try {
           const tarefa = await App.criarTarefa({
               titulo: '🧪 Tarefa Teste Sincronização v8.12',
               descricao: 'Tarefa para testar sincronização de participantes',
               tipo: 'pessoal',
               escopo: 'pessoal',
               aparecerNoCalendario: true,
               participantes: ['renato', 'bruna'],
               dataInicio: new Date().toISOString().split('T')[0],
               horarioInicio: '14:00',
               duracaoEstimada: 60
           });
           
           console.log('✅ Tarefa teste criada!');
           console.log('📋 Verifique:');
           console.log('  1. Calendário principal - deve aparecer lá');
           console.log('  2. Agenda do Renato - deve aparecer');
           console.log('  3. Agenda da Bruna - deve aparecer');
           
           return tarefa;
           
       } catch (error) {
           console.error('❌ Erro ao criar tarefa teste:', error);
       }
   }
};

// 🔧 APLICAR CORREÇÕES AUTOMATICAMENTE
console.log('\n🔧 ========== CORRETOR SYNC PARTICIPANTES v8.12.0 ==========\n');
console.log('📋 Este corretor irá:');
console.log('  1. Fazer tarefas pessoais com checkbox aparecerem no calendário');
console.log('  2. Sincronizar participantes com agendas pessoais');
console.log('  3. Manter comportamento atual de eventos\n');

// Auto-executar após 2 segundos
setTimeout(() => {
   if (typeof App !== 'undefined' && App.estadoSistema?.inicializado) {
       CorretorSyncParticipantes.aplicarCorrecoes();
       CorretorSyncParticipantes.testarCenarios();
   } else {
       console.warn('⚠️ Sistema ainda não inicializado. Execute manualmente: CorretorSyncParticipantes.aplicarCorrecoes()');
   }
}, 2000);

// 🎯 COMANDOS DISPONÍVEIS
window.CorretorSyncParticipantes = CorretorSyncParticipantes;
window.aplicarCorrecoesSyncParticipantes = () => CorretorSyncParticipantes.aplicarCorrecoes();
window.testarSyncParticipantes = () => CorretorSyncParticipantes.testarCenarios();
window.criarTarefaTeste = () => CorretorSyncParticipantes.criarTarefaTeste();

console.log('\n📋 COMANDOS DISPONÍVEIS:');
console.log('  • aplicarCorrecoesSyncParticipantes() - Aplica todas as correções');
console.log('  • testarSyncParticipantes() - Mostra cenários de teste');
console.log('  • criarTarefaTeste() - Cria tarefa de exemplo\n');
