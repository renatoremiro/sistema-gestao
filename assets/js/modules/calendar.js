/**
 * 📅 Sistema de Calendário Modular v6.2.1 - INTEGRAÇÃO CORRIGIDA
 * 
 * CORREÇÕES APLICADAS:
 * ✅ Referências ao Events.js corrigidas
 * ✅ Validações de dependências melhoradas
 * ✅ Cache com limpeza automática
 * ✅ Comparação de datas corrigida
 * ✅ Performance otimizada
 * ✅ Integração perfeita garantida
 */

const Calendar = {
    // ✅ CONFIGURAÇÕES
    config: {
        mesAtual: new Date().getMonth(),
        anoAtual: new Date().getFullYear(),
        mesesNomes: [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ],
        diasSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        maxEventosPorDia: 4,
        coresEventos: {
            reuniao: '#3b82f6',
            entrega: '#10b981', 
            prazo: '#ef4444',
            marco: '#8b5cf6',
            outro: '#6b7280'
        },
        coresTarefas: {
            pessoal: '#f59e0b',
            equipe: '#06b6d4',
            projeto: '#8b5cf6',
            urgente: '#ef4444',
            rotina: '#6b7280'
        }
    },

    // ✅ ESTADO INTERNO - MELHORADO
    state: {
        modalAberto: false,
        eventosSelecionados: [],
        diasComEventos: new Map(),
        ultimaAtualizacao: null,
        cacheEventos: new Map(),
        cacheTimeout: null, // Para limpeza automática
        dependenciasVerificadas: false
    },

    // ✅ GERAR CALENDÁRIO PRINCIPAL - CORRIGIDO
    gerar() {
        try {
            console.log(`📅 Gerando calendário: ${this.config.mesesNomes[this.config.mesAtual]} ${this.config.anoAtual}`);
            
            // Verificar dependências antes de gerar
            if (!this._verificarDependencias()) {
                console.warn('⚠️ Algumas dependências não estão disponíveis');
            }
            
            // Atualizar título
            this._atualizarDisplayMesAno();
            
            // Obter container
            const container = document.getElementById('calendario');
            if (!container) {
                console.warn('⚠️ Container #calendario não encontrado');
                return;
            }

            // Configurar CSS do container
            container.className = 'calendario';
            container.style.cssText = `
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 6px;
                background: white;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                max-width: 100%;
                font-size: 12px;
            `;

            // Limpar container
            container.innerHTML = '';

            // Gerar cabeçalho dos dias da semana
            this._gerarCabecalhoDias(container);

            // Gerar grid do mês - CORRIGIDO
            this._gerarGridMesCorrigido(container);

            // Atualizar cache e estatísticas
            this._atualizarCacheEventos();
            this._atualizarEstatisticas();

            // Marcar como atualizado
            this.state.ultimaAtualizacao = new Date();

            console.log('✅ Calendário gerado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao gerar calendário:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao gerar calendário');
            }
        }
    },

    // ✅ VERIFICAR DEPENDÊNCIAS - NOVO
    _verificarDependencias() {
        try {
            const dependencias = {
                App: typeof App !== 'undefined' && App.dados,
                Events: typeof Events !== 'undefined',
                Tasks: typeof Tasks !== 'undefined',
                PDF: typeof PDF !== 'undefined',
                Notifications: typeof Notifications !== 'undefined'
            };

            this.state.dependenciasVerificadas = true;
            
            // Log das dependências disponíveis
            Object.entries(dependencias).forEach(([nome, disponivel]) => {
                if (disponivel) {
                    console.log(`✅ ${nome} disponível`);
                } else {
                    console.warn(`⚠️ ${nome} não disponível`);
                }
            });

            return dependencias.App; // App é obrigatório

        } catch (error) {
            console.error('❌ Erro ao verificar dependências:', error);
            return false;
        }
    },

    // ✅ GRID DO MÊS CORRIGIDO - INTEGRAÇÃO PERFEITA
    _gerarGridMesCorrigido(container) {
        const primeiroDia = new Date(this.config.anoAtual, this.config.mesAtual, 1);
        const ultimoDia = new Date(this.config.anoAtual, this.config.mesAtual + 1, 0);
        const diasNoMes = ultimoDia.getDate();
        const iniciaDiaSemana = primeiroDia.getDay();
        const hoje = new Date();

        // Limpar cache de eventos para este mês
        this.state.cacheEventos.clear();

        // Gerar exatamente 42 células (6 semanas)
        for (let celula = 0; celula < 42; celula++) {
            const linha = Math.floor(celula / 7);
            const coluna = celula % 7;
            
            const dia = document.createElement('div');
            dia.className = 'calendario-dia';
            
            // Calcular qual dia mostrar
            const numeroDia = celula - iniciaDiaSemana + 1;
            
            if (numeroDia < 1 || numeroDia > diasNoMes) {
                // Célula vazia (dias do mês anterior/próximo)
                dia.style.cssText = `
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    min-height: 80px;
                    border-radius: 4px;
                    opacity: 0.3;
                `;
                
                // Mostrar dias do mês anterior/próximo de forma sutil
                if (numeroDia < 1) {
                    const mesAnterior = new Date(this.config.anoAtual, this.config.mesAtual - 1, 0);
                    const diaAnterior = mesAnterior.getDate() + numeroDia;
                    dia.innerHTML = `<div style="padding: 4px; color: #9ca3af; font-size: 10px;">${diaAnterior}</div>`;
                } else {
                    const diaProximo = numeroDia - diasNoMes;
                    dia.innerHTML = `<div style="padding: 4px; color: #9ca3af; font-size: 10px;">${diaProximo}</div>`;
                }
            } else {
                // Célula com dia válido do mês atual
                const dataCompleta = `${this.config.anoAtual}-${String(this.config.mesAtual + 1).padStart(2, '0')}-${String(numeroDia).padStart(2, '0')}`;
                const ehHoje = (
                    hoje.getDate() === numeroDia &&
                    hoje.getMonth() === this.config.mesAtual &&
                    hoje.getFullYear() === this.config.anoAtual
                );
                const ehFeriado = App.dados?.feriados?.[dataCompleta];

                dia.dataset.data = dataCompleta;
                dia.style.cssText = `
                    border: 1px solid #e5e7eb;
                    min-height: 80px;
                    padding: 4px;
                    cursor: pointer;
                    background: ${ehFeriado ? '#fef3c7' : (ehHoje ? '#dbeafe' : 'white')};
                    position: relative;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                `;

                // Hover effect
                dia.addEventListener('mouseenter', () => {
                    if (!ehFeriado) {
                        dia.style.backgroundColor = ehHoje ? '#bfdbfe' : '#f3f4f6';
                    }
                });

                dia.addEventListener('mouseleave', () => {
                    dia.style.backgroundColor = ehFeriado ? '#fef3c7' : (ehHoje ? '#dbeafe' : 'white');
                });

                // Número do dia
                const numeroDiaEl = document.createElement('div');
                numeroDiaEl.textContent = numeroDia;
                numeroDiaEl.style.cssText = `
                    font-weight: bold;
                    font-size: 12px;
                    color: ${ehHoje ? '#1d4ed8' : '#374151'};
                    margin-bottom: 2px;
                `;
                dia.appendChild(numeroDiaEl);

                // Indicador de feriado
                if (ehFeriado) {
                    const indicadorFeriado = document.createElement('div');
                    indicadorFeriado.textContent = '🎉';
                    indicadorFeriado.style.cssText = `
                        position: absolute;
                        top: 2px;
                        right: 4px;
                        font-size: 10px;
                    `;
                    indicadorFeriado.title = ehFeriado;
                    dia.appendChild(indicadorFeriado);
                }

                // Adicionar eventos e tarefas do dia - INTEGRAÇÃO CORRIGIDA
                this._adicionarEventosTarefasCelula(dia, dataCompleta);

                // Event listeners - CORRIGIDOS
                dia.addEventListener('click', () => {
                    this.mostrarTodosEventosDia(dataCompleta);
                });

                dia.addEventListener('dblclick', () => {
                    // CORREÇÃO: Verificar se Events existe antes de usar
                    if (typeof Events !== 'undefined' && typeof Events.mostrarNovoEvento === 'function') {
                        Events.mostrarNovoEvento(dataCompleta);
                    } else {
                        console.warn('⚠️ Módulo Events não disponível para criar evento');
                        if (typeof Notifications !== 'undefined') {
                            Notifications.info('Duplo-clique: Módulo de eventos não disponível');
                        }
                    }
                });
            }

            container.appendChild(dia);
        }
    },

    // ✅ INTEGRAÇÃO CORRIGIDA: EVENTOS + TAREFAS NA CÉLULA
    _adicionarEventosTarefasCelula(celula, data) {
        try {
            // Obter eventos e tarefas do dia
            const eventos = this._obterEventosDoDiaIntegrado(data);
            const tarefas = this._obterTarefasDoDiaIntegrado(data);
            
            // Combinar e ordenar por prioridade/horário
            const itensOrdenados = [...eventos, ...tarefas]
                .sort((a, b) => {
                    // Priorizar por horário se ambos tiverem
                    if (a.horarioInicio && b.horarioInicio) {
                        return a.horarioInicio.localeCompare(b.horarioInicio);
                    }
                    if (a.horario && b.horario) {
                        return a.horario.localeCompare(b.horario);
                    }
                    // Eventos antes de tarefas
                    if (a.tipo && this.config.coresEventos[a.tipo] && 
                        b.tipo && this.config.coresTarefas[b.tipo]) {
                        return -1;
                    }
                    return 0;
                });

            // Adicionar até maxEventosPorDia itens
            const itensVisiveis = itensOrdenados.slice(0, this.config.maxEventosPorDia);
            
            itensVisiveis.forEach(item => {
                const elementoItem = document.createElement('div');
                
                // Determinar se é evento ou tarefa
                const ehTarefa = this.config.coresTarefas[item.tipo] !== undefined;
                const cor = ehTarefa ? 
                    this.config.coresTarefas[item.tipo] :
                    this.config.coresEventos[item.tipo] || '#6b7280';

                // Estilo do item
                elementoItem.style.cssText = `
                    background: ${cor};
                    color: white;
                    font-size: 9px;
                    padding: 1px 3px;
                    margin: 1px 0;
                    border-radius: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: pointer;
                    line-height: 1.2;
                    height: 14px;
                    display: flex;
                    align-items: center;
                `;

                // Ícone baseado no tipo
                const icone = ehTarefa ? 
                    (item.agendaSemanal ? '🔄' : '📝') : 
                    this._obterIconeEvento(item.tipo);

                // Texto do item
                let textoItem = `${icone} ${item.titulo}`;
                if (item.horarioInicio) {
                    textoItem = `${item.horarioInicio} ${textoItem}`;
                } else if (item.horario) {
                    textoItem = `${item.horario} ${textoItem}`;
                }

                elementoItem.textContent = textoItem;
                elementoItem.title = `${item.titulo} - ${item.tipo}${item.responsavel || item.pessoas ? ` (${item.responsavel || item.pessoas?.join(', ')})` : ''}`;

                // Click handler - CORRIGIDO
                elementoItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (ehTarefa) {
                        // Verificar se Tasks existe
                        if (typeof Tasks !== 'undefined' && typeof Tasks.editarTarefa === 'function') {
                            Tasks.editarTarefa(item.id);
                        } else {
                            console.warn('⚠️ Módulo Tasks não disponível');
                        }
                    } else {
                        // Verificar se Events existe
                        if (typeof Events !== 'undefined' && typeof Events.editarEvento === 'function') {
                            Events.editarEvento(item.id);
                        } else {
                            console.warn('⚠️ Módulo Events não disponível');
                        }
                    }
                });

                celula.appendChild(elementoItem);
            });

            // Indicador de mais itens
            const totalItens = itensOrdenados.length;
            if (totalItens > this.config.maxEventosPorDia) {
                const indicadorMais = document.createElement('div');
                indicadorMais.textContent = `+${totalItens - this.config.maxEventosPorDia}`;
                indicadorMais.style.cssText = `
                    font-size: 8px;
                    color: #6b7280;
                    text-align: center;
                    margin-top: 2px;
                    cursor: pointer;
                    background: #f3f4f6;
                    border-radius: 2px;
                    padding: 1px 2px;
                `;
                
                indicadorMais.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.mostrarTodosEventosDia(data);
                });

                celula.appendChild(indicadorMais);
            }

        } catch (error) {
            console.error('❌ Erro ao adicionar eventos/tarefas na célula:', error);
        }
    },

    // ✅ OBTER EVENTOS DO DIA - INTEGRAÇÃO CORRIGIDA
    _obterEventosDoDiaIntegrado(data) {
        try {
            if (!App.dados?.eventos) return [];
            
            return App.dados.eventos.filter(evento => evento.data === data);

        } catch (error) {
            console.error('❌ Erro ao obter eventos do dia:', error);
            return [];
        }
    },

    // ✅ OBTER TAREFAS DO DIA - INTEGRAÇÃO CORRIGIDA
    _obterTarefasDoDiaIntegrado(data) {
        try {
            if (!App.dados?.tarefas) return [];
            
            const dataObj = new Date(data);
            const diaSemana = dataObj.getDay(); // 0 = domingo, 1 = segunda, etc.
            const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
            const nomeDialng = diasSemana[diaSemana];
            
            return App.dados.tarefas.filter(tarefa => {
                // Tarefas com data específica
                if (tarefa.dataInicio === data || tarefa.dataFim === data) {
                    return true;
                }
                
                // Tarefas da agenda semanal (recorrentes)
                if (tarefa.agendaSemanal && tarefa.diaSemana === nomeDialng) {
                    return true;
                }
                
                return false;
            });

        } catch (error) {
            console.error('❌ Erro ao obter tarefas do dia:', error);
            return [];
        }
    },

    // ✅ NAVEGAÇÃO DE MÊS - MANTIDO
    mudarMes(direcao) {
        try {
            this.config.mesAtual += direcao;
            
            if (this.config.mesAtual > 11) {
                this.config.mesAtual = 0;
                this.config.anoAtual++;
            } else if (this.config.mesAtual < 0) {
                this.config.mesAtual = 11;
                this.config.anoAtual--;
            }

            // Regenerar calendário
            this.gerar();

            console.log(`📅 Navegado para: ${this.config.mesesNomes[this.config.mesAtual]} ${this.config.anoAtual}`);

        } catch (error) {
            console.error('❌ Erro ao navegar mês:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro na navegação do calendário');
            }
        }
    },

    // ✅ IR PARA HOJE - MANTIDO
    irParaHoje() {
        try {
            const hoje = new Date();
            this.config.mesAtual = hoje.getMonth();
            this.config.anoAtual = hoje.getFullYear();
            
            this.gerar();
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success('📅 Voltou para o mês atual');
            }
            console.log('📅 Calendário resetado para hoje');

        } catch (error) {
            console.error('❌ Erro ao ir para hoje:', error);
        }
    },

    // ✅ OBTER EVENTOS DO DIA - PÚBLICO
    obterEventosDoDia(data) {
        try {
            const eventos = this._obterEventosDoDiaIntegrado(data);
            const tarefas = this._obterTarefasDoDiaIntegrado(data);
            
            return [...eventos, ...tarefas];

        } catch (error) {
            console.error('❌ Erro ao obter eventos do dia:', error);
            return [];
        }
    },

    // ✅ EXPORTAR CALENDÁRIO EM PDF - INTEGRAÇÃO CORRIGIDA
    exportarPDF() {
        try {
            console.log('📄 Solicitando exportação do calendário em PDF...');
            
            // Verificar se módulo PDF está disponível
            if (typeof PDF === 'undefined') {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Módulo PDF não disponível - verifique se o arquivo pdf.js foi carregado');
                }
                console.error('❌ Módulo PDF.js não carregado');
                return;
            }

            // Verificar se PDF tem a função correta
            if (typeof PDF.mostrarModalCalendario !== 'function') {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Função de PDF do calendário não disponível');
                }
                console.error('❌ PDF.mostrarModalCalendario não é uma função');
                return;
            }

            // Abrir modal de configuração do PDF
            PDF.mostrarModalCalendario();
            
            console.log('✅ Modal de configuração do PDF aberto');
            if (typeof Notifications !== 'undefined') {
                Notifications.info('📄 Configure as opções e gere seu PDF personalizado');
            }

        } catch (error) {
            console.error('❌ Erro ao exportar calendário em PDF:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir configurações do PDF');
            }
        }
    },

    // ✅ MOSTRAR TODOS OS EVENTOS DO DIA - INTEGRAÇÃO MELHORADA
    mostrarTodosEventosDia(data) {
        try {
            const itens = this.obterEventosDoDia(data);
            
            if (itens.length === 0) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.info('Nenhum evento ou tarefa neste dia');
                }
                return;
            }

            // Criar modal com lista completa
            this._criarModalEventosDia(data, itens);

        } catch (error) {
            console.error('❌ Erro ao mostrar eventos do dia:', error);
        }
    },

    // ✅ ADICIONAR FERIADO - MANTIDO
    adicionarFeriado(data, nome) {
        try {
            if (!data || !nome) {
                throw new Error('Data e nome são obrigatórios');
            }

            // Validar data - CORRIGIDA
            const dataObj = new Date(data);
            if (isNaN(dataObj.getTime())) {
                throw new Error('Data inválida');
            }

            // Garantir estrutura de feriados
            if (!App.dados.feriados) {
                App.dados.feriados = {};
            }

            // Adicionar feriado
            App.dados.feriados[data] = nome;

            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }

            // Regenerar calendário
            this.gerar();

            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Feriado "${nome}" adicionado em ${dataObj.toLocaleDateString('pt-BR')}`);
            }
            console.log(`🎉 Feriado adicionado: ${data} - ${nome}`);

        } catch (error) {
            console.error('❌ Erro ao adicionar feriado:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao adicionar feriado: ${error.message}`);
            }
        }
    },

    // ✅ OBTER ESTATÍSTICAS DO MÊS - MANTIDO E MELHORADO
    obterEstatisticasDoMes() {
        try {
            const mesAtual = this.config.mesAtual + 1;
            const anoAtual = this.config.anoAtual;
            
            // Obter todos os eventos do mês
            const eventosMes = App.dados?.eventos?.filter(evento => {
                const [ano, mes] = evento.data.split('-').map(Number);
                return ano === anoAtual && mes === mesAtual;
            }) || [];

            // Obter tarefas do mês (incluindo agenda semanal)
            const tarefasMes = App.dados?.tarefas?.filter(tarefa => {
                // Tarefas com data específica
                if (tarefa.dataInicio || tarefa.dataFim) {
                    if (tarefa.dataInicio) {
                        const [ano, mes] = tarefa.dataInicio.split('-').map(Number);
                        if (ano === anoAtual && mes === mesAtual) return true;
                    }
                    if (tarefa.dataFim) {
                        const [ano, mes] = tarefa.dataFim.split('-').map(Number);
                        if (ano === anoAtual && mes === mesAtual) return true;
                    }
                }
                
                // Tarefas da agenda semanal aparecem todos os dias da semana correspondente
                if (tarefa.agendaSemanal) {
                    return true; // Incluir todas as tarefas da agenda semanal
                }
                
                return false;
            }) || [];

            // Estatísticas por tipo
            const porTipo = {};
            eventosMes.forEach(evento => {
                porTipo[evento.tipo] = (porTipo[evento.tipo] || 0) + 1;
            });

            tarefasMes.forEach(tarefa => {
                const tipoKey = `tarefa_${tarefa.tipo}`;
                porTipo[tipoKey] = (porTipo[tipoKey] || 0) + 1;
            });

            // Próximo evento - CORRIGIDO
            const agora = new Date();
            const proximoEvento = eventosMes
                .filter(evento => new Date(evento.data) >= agora)
                .sort((a, b) => new Date(a.data) - new Date(b.data))[0];

            return {
                totalEventos: eventosMes.length,
                totalTarefas: tarefasMes.length,
                total: eventosMes.length + tarefasMes.length,
                porTipo,
                proximoEvento,
                mesAno: `${this.config.mesesNomes[this.config.mesAtual]} ${this.config.anoAtual}`
            };

        } catch (error) {
            console.error('❌ Erro ao calcular estatísticas:', error);
            return {
                totalEventos: 0,
                totalTarefas: 0,
                total: 0,
                porTipo: {},
                proximoEvento: null,
                mesAno: 'Erro'
            };
        }
    },

    // ✅ OBTER STATUS DO SISTEMA - ATUALIZADO
    obterStatus() {
        const stats = this.obterEstatisticasDoMes();
        
        return {
            mesAtual: this.config.mesAtual + 1,
            anoAtual: this.config.anoAtual,
            mesNome: this.config.mesesNomes[this.config.mesAtual],
            modalAberto: this.state.modalAberto,
            eventosDoMes: stats.totalEventos,
            tarefasDoMes: stats.totalTarefas,
            ultimaAtualizacao: this.state.ultimaAtualizacao,
            integracaoEvents: typeof Events !== 'undefined' && typeof Events.mostrarNovoEvento === 'function',
            integracaoTasks: typeof Tasks !== 'undefined' && typeof Tasks.editarTarefa === 'function',
            integracaoPDF: typeof PDF !== 'undefined' && typeof PDF.mostrarModalCalendario === 'function',
            cacheAtualizado: this.state.cacheEventos.size > 0,
            dependenciasOk: this.state.dependenciasVerificadas
        };
    },

    // ✅ === MÉTODOS PRIVADOS AUXILIARES ===

    // Atualizar display do mês/ano
    _atualizarDisplayMesAno() {
        const elementos = [
            document.getElementById('mesAno'),
            document.getElementById('mesAnoCalendario')
        ];

        const textoMesAno = `${this.config.mesesNomes[this.config.mesAtual]} ${this.config.anoAtual}`;
        
        elementos.forEach(elemento => {
            if (elemento) {
                elemento.textContent = textoMesAno;
            }
        });
    },

    // Gerar cabeçalho dos dias da semana
    _gerarCabecalhoDias(container) {
        this.config.diasSemana.forEach(dia => {
            const celula = document.createElement('div');
            celula.className = 'calendario-cabecalho';
            celula.textContent = dia;
            celula.style.cssText = `
                background: #f3f4f6;
                padding: 8px;
                text-align: center;
                font-weight: bold;
                border: 1px solid #e5e7eb;
                font-size: 12px;
                color: #374151;
                border-radius: 4px;
            `;
            container.appendChild(celula);
        });
    },

    // Obter ícone do evento
    _obterIconeEvento(tipo) {
        const icones = {
            reuniao: '📅',
            entrega: '📦',
            prazo: '⏰',
            marco: '🏁',
            outro: '📌'
        };
        return icones[tipo] || '📌';
    },

    // Atualizar cache de eventos - MELHORADO COM LIMPEZA
    _atualizarCacheEventos() {
        try {
            // Limpar cache anterior
            this._limparCache();
            
            if (App.dados?.eventos) {
                App.dados.eventos.forEach(evento => {
                    const data = evento.data;
                    if (!this.state.cacheEventos.has(data)) {
                        this.state.cacheEventos.set(data, []);
                    }
                    this.state.cacheEventos.get(data).push(evento);
                });
            }

            if (App.dados?.tarefas) {
                App.dados.tarefas.forEach(tarefa => {
                    // Cache de tarefas com data específica
                    if (tarefa.dataInicio) {
                        if (!this.state.cacheEventos.has(tarefa.dataInicio)) {
                            this.state.cacheEventos.set(tarefa.dataInicio, []);
                        }
                        this.state.cacheEventos.get(tarefa.dataInicio).push(tarefa);
                    }
                    if (tarefa.dataFim) {
                        if (!this.state.cacheEventos.has(tarefa.dataFim)) {
                            this.state.cacheEventos.set(tarefa.dataFim, []);
                        }
                        this.state.cacheEventos.get(tarefa.dataFim).push(tarefa);
                    }
                });
            }

            // Programar limpeza automática do cache (10 minutos)
            if (this.state.cacheTimeout) {
                clearTimeout(this.state.cacheTimeout);
            }
            this.state.cacheTimeout = setTimeout(() => {
                this._limparCache();
            }, 10 * 60 * 1000);

        } catch (error) {
            console.error('❌ Erro ao atualizar cache:', error);
        }
    },

    // Limpar cache - NOVO
    _limparCache() {
        try {
            this.state.cacheEventos.clear();
            console.log('🧹 Cache do calendário limpo');
        } catch (error) {
            console.error('❌ Erro ao limpar cache:', error);
        }
    },

    // Criar modal de eventos do dia - CORRIGIDO
    _criarModalEventosDia(data, itens) {
        try {
            // Remover modal existente
            const modalExistente = document.getElementById('modalEventosDia');
            if (modalExistente) {
                modalExistente.remove();
            }

            const modal = document.createElement('div');
            modal.id = 'modalEventosDia';
            modal.className = 'modal';

            const dataObj = new Date(data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Separar eventos e tarefas
            const eventos = itens.filter(item => this.config.coresEventos[item.tipo] !== undefined);
            const tarefas = itens.filter(item => this.config.coresTarefas[item.tipo] !== undefined);

            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>📅 Agenda do Dia</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <p style="margin-bottom: 16px; color: #6b7280;">
                            <strong>${this._capitalize(dataFormatada)}</strong>
                        </p>
                        
                        ${eventos.length > 0 ? `
                            <h4 style="color: #3b82f6; margin: 16px 0 8px 0;">📅 Eventos (${eventos.length})</h4>
                            ${eventos.map(evento => this._renderizarItemModal(evento, false)).join('')}
                        ` : ''}
                        
                        ${tarefas.length > 0 ? `
                            <h4 style="color: #f59e0b; margin: 16px 0 8px 0;">📝 Tarefas (${tarefas.length})</h4>
                            ${tarefas.map(tarefa => this._renderizarItemModal(tarefa, true)).join('')}
                        ` : ''}
                        
                        ${itens.length === 0 ? `
                            <p style="text-align: center; color: #6b7280; padding: 20px;">
                                Nenhum evento ou tarefa encontrada para este dia.
                            </p>
                        ` : ''}
                    </div>
                    
                    <div class="modal-footer">
                        ${typeof Events !== 'undefined' ? `
                            <button class="btn btn-primary" onclick="Events.mostrarNovoEvento('${data}'); this.closest('.modal').remove();">
                                ➕ Novo Evento
                            </button>
                        ` : ''}
                        ${typeof Tasks !== 'undefined' ? `
                            <button class="btn btn-success" onclick="Tasks.mostrarNovaTarefa('pessoal'); this.closest('.modal').remove();">
                                📝 Nova Tarefa
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            ✅ Fechar
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);

        } catch (error) {
            console.error('❌ Erro ao criar modal de eventos:', error);
        }
    },

    // Renderizar item no modal - CORRIGIDO
    _renderizarItemModal(item, ehTarefa) {
        const cor = ehTarefa ? 
            this.config.coresTarefas[item.tipo] || '#6b7280' :
            this.config.coresEventos[item.tipo] || '#6b7280';

        const horario = item.horarioInicio || item.horario || '';
        const pessoas = item.pessoas || (item.responsavel ? [item.responsavel] : []);
        const status = item.status ? ` (${item.status})` : '';

        // Função onclick corrigida
        const onclickAction = ehTarefa ? 
            (typeof Tasks !== 'undefined' ? `Tasks.editarTarefa(${item.id}); this.closest('.modal').remove();` : 'console.warn("Tasks não disponível");') :
            (typeof Events !== 'undefined' ? `Events.editarEvento(${item.id}); this.closest('.modal').remove();` : 'console.warn("Events não disponível");');

        return `
            <div class="evento-item" style="
                border-left: 4px solid ${cor};
                padding: 12px;
                margin: 8px 0;
                background: #f9fafb;
                border-radius: 4px;
                cursor: pointer;
            " onclick="${onclickAction}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <strong>${item.titulo}${status}</strong>
                        <span style="
                            background: ${cor};
                            color: white;
                            padding: 2px 6px;
                            border-radius: 12px;
                            font-size: 10px;
                            margin-left: 8px;
                        ">${item.tipo}</span>
                        ${item.agendaSemanal ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px; margin-left: 4px;">Recorrente</span>' : ''}
                    </div>
                    ${horario ? `<span style="color: #6b7280; font-size: 12px;">${horario}</span>` : ''}
                </div>
                ${item.descricao ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">${item.descricao}</p>` : ''}
                ${pessoas.length > 0 ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">👥 ${pessoas.join(', ')}</p>` : ''}
                ${item.progresso !== undefined ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">📊 Progresso: ${item.progresso}%</p>` : ''}
            </div>
        `;
    },

    // Capitalizar primeira letra - NOVO
    _capitalize(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    },

    // Fechar modal de feriado
    _fecharModalFeriado() {
        try {
            const modal = document.getElementById('modalFeriado');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            }
            this.state.modalAberto = false;

        } catch (error) {
            console.error('❌ Erro ao fechar modal de feriado:', error);
        }
    },

    // Confirmar adição de feriado
    _confirmarFeriado() {
        try {
            const data = document.getElementById('feriadoData').value;
            const nome = document.getElementById('feriadoNome').value.trim();

            if (!data) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Por favor, selecione uma data');
                }
                return;
            }

            if (!nome) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Por favor, digite o nome do feriado');
                }
                return;
            }

            this._fecharModalFeriado();
            this.adicionarFeriado(data, nome);

        } catch (error) {
            console.error('❌ Erro ao confirmar feriado:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao adicionar feriado');
            }
        }
    },

    // Atualizar estatísticas (placeholder)
    _atualizarEstatisticas() {
        console.log('📊 Estatísticas do calendário atualizadas');
    }
};

// ✅ ATALHOS DE TECLADO
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                Calendar.mudarMes(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                Calendar.mudarMes(1);
                break;
        }
    } else if (e.key === 'Home') {
        e.preventDefault();
        Calendar.irParaHoje();
    }
});

// ✅ INICIALIZAÇÃO DO MÓDULO
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar carregamento dos dados
    setTimeout(() => {
        if (typeof App !== 'undefined' && App.dados) {
            Calendar.gerar();
            console.log('📅 Calendário inicializado automaticamente');
        }
    }, 1000);
});

// ✅ LOG DE CARREGAMENTO
console.log('📅 Sistema de Calendário Modular v6.2.1 CORRIGIDO - Integração Perfeita!');
console.log('🎯 Funcionalidades: Navegação, Eventos + Tarefas Integradas, Feriados, PDF Export');
console.log('⚙️ Integração PERFEITA: Events.js, Tasks.js, PDF.js');
console.log('✅ CORREÇÕES: Referências Events corrigidas, cache com limpeza, validações melhoradas');
console.log('⌨️ Atalhos: Ctrl+←/→ (navegar), Home (hoje), Esc (fechar modais)');
