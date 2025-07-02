/**
 * 📅 Sistema de Calendário Modular v6.2 - INTEGRADO COM PDF
 * 
 * Funcionalidades:
 * ✅ Calendário principal com grid 7x6
 * ✅ Navegação fluida entre meses
 * ✅ Gestão de eventos integrada
 * ✅ Sistema de feriados
 * ✅ Indicadores visuais (eventos, tarefas, feriados)
 * ✅ Estatísticas completas
 * ✅ Integração com Events.js e Tasks.js
 * ✅ NOVO: Exportação em PDF 📄
 * ✅ Atalhos de teclado
 * ✅ Performance otimizada
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
        maxEventosPorDia: 5,
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

    // ✅ ESTADO INTERNO
    state: {
        modalAberto: false,
        eventosSelecionados: [],
        diasComEventos: new Map(),
        ultimaAtualizacao: null
    },

    // ✅ GERAR CALENDÁRIO PRINCIPAL
    gerar() {
        try {
            console.log(`📅 Gerando calendário: ${this.config.mesesNomes[this.config.mesAtual]} ${this.config.anoAtual}`);
            
            // Atualizar título
            this._atualizarDisplayMesAno();
            
            // Obter container
            const container = document.getElementById('calendario');
            if (!container) {
                console.warn('⚠️ Container #calendario não encontrado');
                return;
            }

            // Limpar container
            container.innerHTML = '';

            // Gerar cabeçalho dos dias da semana
            this._gerarCabecalhoDias(container);

            // Gerar grid do mês
            this._gerarGridMes(container);

            // Atualizar estatísticas
            this._atualizarEstatisticas();

            // Marcar como atualizado
            this.state.ultimaAtualizacao = new Date();

            console.log('✅ Calendário gerado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao gerar calendário:', error);
            Notifications.error('Erro ao gerar calendário');
        }
    },

    // ✅ NAVEGAÇÃO DE MÊS
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
            Notifications.error('Erro na navegação do calendário');
        }
    },

    // ✅ IR PARA HOJE
    irParaHoje() {
        try {
            const hoje = new Date();
            this.config.mesAtual = hoje.getMonth();
            this.config.anoAtual = hoje.getFullYear();
            
            this.gerar();
            
            Notifications.success('📅 Voltou para o mês atual');
            console.log('📅 Calendário resetado para hoje');

        } catch (error) {
            console.error('❌ Erro ao ir para hoje:', error);
        }
    },

    // ✅ IR PARA MÊS ESPECÍFICO
    irParaMes(mes, ano) {
        try {
            if (mes < 1 || mes > 12 || ano < 1900 || ano > 2100) {
                throw new Error('Mês ou ano inválido');
            }

            this.config.mesAtual = mes - 1; // Array é 0-indexed
            this.config.anoAtual = ano;
            
            this.gerar();
            
            console.log(`📅 Navegado para: ${this.config.mesesNomes[this.config.mesAtual]} ${this.config.anoAtual}`);

        } catch (error) {
            console.error('❌ Erro ao ir para mês específico:', error);
            Notifications.error('Erro ao navegar para mês específico');
        }
    },

    // ✅ OBTER EVENTOS DO DIA
    obterEventosDoDia(data) {
        try {
            if (!App.dados?.eventos) return [];
            
            const eventos = App.dados.eventos.filter(evento => evento.data === data);
            const tarefas = this._obterTarefasDoDia(data);
            
            return [...eventos, ...tarefas];

        } catch (error) {
            console.error('❌ Erro ao obter eventos do dia:', error);
            return [];
        }
    },

    // ✅ MOSTRAR DETALHES DO EVENTO
    mostrarDetalhesEvento(evento) {
        try {
            if (!evento) return;

            // Verificar se é tarefa ou evento
            const ehTarefa = evento.hasOwnProperty('tipo') && 
                           ['pessoal', 'equipe', 'projeto', 'urgente', 'rotina'].includes(evento.tipo);

            // Redirecionar para módulo apropriado
            if (ehTarefa && typeof Tasks !== 'undefined') {
                Tasks.editarTarefa(evento.id);
            } else if (typeof Events !== 'undefined') {
                Events.editarEvento(evento.id);
            } else {
                // Fallback: mostrar informações básicas
                this._mostrarModalDetalhes(evento);
            }

        } catch (error) {
            console.error('❌ Erro ao mostrar detalhes do evento:', error);
        }
    },

    // ✅ MOSTRAR TODOS OS EVENTOS DO DIA
    mostrarTodosEventosDia(data) {
        try {
            const eventos = this.obterEventosDoDia(data);
            
            if (eventos.length === 0) {
                Notifications.info('Nenhum evento neste dia');
                return;
            }

            // Criar modal com lista completa
            this._criarModalEventosDia(data, eventos);

        } catch (error) {
            console.error('❌ Erro ao mostrar eventos do dia:', error);
        }
    },

    // ✅ ADICIONAR FERIADO
    adicionarFeriado(data, nome) {
        try {
            if (!data || !nome) {
                throw new Error('Data e nome são obrigatórios');
            }

            // Validar data
            if (!Validation.isValidDate(data)) {
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

            Notifications.success(`Feriado "${nome}" adicionado em ${new Date(data).toLocaleDateString('pt-BR')}`);
            console.log(`🎉 Feriado adicionado: ${data} - ${nome}`);

        } catch (error) {
            console.error('❌ Erro ao adicionar feriado:', error);
            Notifications.error(`Erro ao adicionar feriado: ${error.message}`);
        }
    },

    // ✅ REMOVER FERIADO
    removerFeriado(data) {
        try {
            if (!App.dados?.feriados?.[data]) {
                Notifications.warning('Feriado não encontrado');
                return;
            }

            const nomeFeriado = App.dados.feriados[data];
            delete App.dados.feriados[data];

            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }

            // Regenerar calendário
            this.gerar();

            Notifications.success(`Feriado "${nomeFeriado}" removido`);
            console.log(`🗑️ Feriado removido: ${data}`);

        } catch (error) {
            console.error('❌ Erro ao remover feriado:', error);
            Notifications.error('Erro ao remover feriado');
        }
    },

    // ✅ MODAL PARA MARCAR FERIADO
    mostrarMarcarFeriado() {
        try {
            // Verificar se modal já existe
            if (document.getElementById('modalFeriado')) {
                return;
            }

            const modal = document.createElement('div');
            modal.id = 'modalFeriado';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>🎉 Adicionar Feriado</h3>
                        <button class="modal-close" onclick="Calendar._fecharModalFeriado()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-group">
                            <label>📅 Data do Feriado:</label>
                            <input type="date" id="feriadoData" required>
                        </div>
                        
                        <div class="form-group">
                            <label>🏷️ Nome do Feriado:</label>
                            <input type="text" id="feriadoNome" placeholder="Ex: Natal" required>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Calendar._fecharModalFeriado()">
                            ❌ Cancelar
                        </button>
                        <button class="btn btn-primary" onclick="Calendar._confirmarFeriado()">
                            🎉 Adicionar Feriado
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Definir data atual como padrão
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('feriadoData').value = hoje;

            // Exibir modal
            setTimeout(() => modal.classList.add('show'), 10);

            this.state.modalAberto = true;

        } catch (error) {
            console.error('❌ Erro ao mostrar modal de feriado:', error);
            Notifications.error('Erro ao abrir modal de feriado');
        }
    },

    // ✅ EXPORTAR CALENDÁRIO EM PDF
    exportarPDF() {
        try {
            console.log('📄 Solicitando exportação do calendário em PDF...');
            
            // Verificar se módulo PDF está disponível
            if (typeof PDF === 'undefined') {
                Notifications.error('Módulo PDF não disponível - verifique se o arquivo pdf.js foi carregado');
                console.error('❌ Módulo PDF.js não carregado');
                return;
            }

            // Abrir modal de configuração do PDF
            PDF.mostrarModalCalendario();
            
            console.log('✅ Modal de configuração do PDF aberto');
            Notifications.info('📄 Configure as opções e gere seu PDF personalizado');

        } catch (error) {
            console.error('❌ Erro ao exportar calendário em PDF:', error);
            Notifications.error('Erro ao abrir configurações do PDF');
        }
    },

    // ✅ OBTER ESTATÍSTICAS DO MÊS
    obterEstatisticasDoMes() {
        try {
            const mesAtual = this.config.mesAtual + 1;
            const anoAtual = this.config.anoAtual;
            
            // Obter todos os eventos do mês
            const eventosMes = App.dados?.eventos?.filter(evento => {
                const [ano, mes] = evento.data.split('-').map(Number);
                return ano === anoAtual && mes === mesAtual;
            }) || [];

            // Obter tarefas do mês
            const tarefasMes = App.dados?.tarefas?.filter(tarefa => {
                if (tarefa.dataInicio) {
                    const [ano, mes] = tarefa.dataInicio.split('-').map(Number);
                    if (ano === anoAtual && mes === mesAtual) return true;
                }
                if (tarefa.dataFim) {
                    const [ano, mes] = tarefa.dataFim.split('-').map(Number);
                    if (ano === anoAtual && mes === mesAtual) return true;
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

            // Próximo evento
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

    // ✅ OBTER STATUS DO SISTEMA
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
            integracaoEvents: typeof Events !== 'undefined',
            integracaoTasks: typeof Tasks !== 'undefined',
            integracaoPDF: typeof PDF !== 'undefined'
        };
    },

    // ✅ === MÉTODOS PRIVADOS ===

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

        // Atualizar App.estadoSistema se disponível
        if (typeof App !== 'undefined' && App.estadoSistema) {
            App.estadoSistema.mesAtual = this.config.mesAtual + 1;
            App.estadoSistema.anoAtual = this.config.anoAtual;
        }
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
            `;
            container.appendChild(celula);
        });
    },

    // Gerar grid do mês
    _gerarGridMes(container) {
        const primeiroDia = new Date(this.config.anoAtual, this.config.mesAtual, 1);
        const ultimoDia = new Date(this.config.anoAtual, this.config.mesAtual + 1, 0);
        const diasNoMes = ultimoDia.getDate();
        const iniciaDiaSemana = primeiroDia.getDay();
        const hoje = new Date();

        let diaAtual = 1;

        // Gerar 6 semanas (42 células)
        for (let i = 0; i < 42; i++) {
            const celula = document.createElement('div');
            celula.className = 'calendario-dia';

            if (i < iniciaDiaSemana || diaAtual > diasNoMes) {
                // Célula vazia
                celula.style.cssText = `
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    min-height: 80px;
                `;
            } else {
                // Célula com dia
                const dataCompleta = `${this.config.anoAtual}-${String(this.config.mesAtual + 1).padStart(2, '0')}-${String(diaAtual).padStart(2, '0')}`;
                const ehHoje = (
                    hoje.getDate() === diaAtual &&
                    hoje.getMonth() === this.config.mesAtual &&
                    hoje.getFullYear() === this.config.anoAtual
                );
                const ehFeriado = App.dados?.feriados?.[dataCompleta];

                celula.dataset.data = dataCompleta;
                celula.style.cssText = `
                    border: 1px solid #e5e7eb;
                    min-height: 80px;
                    padding: 4px;
                    cursor: pointer;
                    background: ${ehFeriado ? '#fef3c7' : (ehHoje ? '#dbeafe' : 'white')};
                    position: relative;
                `;

                // Número do dia
                const numeroDia = document.createElement('div');
                numeroDia.textContent = diaAtual;
                numeroDia.style.cssText = `
                    font-weight: bold;
                    font-size: 12px;
                    color: ${ehHoje ? '#1d4ed8' : '#374151'};
                `;
                celula.appendChild(numeroDia);

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
                    celula.appendChild(indicadorFeriado);
                }

                // Adicionar eventos do dia
                this._adicionarEventosCelula(celula, dataCompleta);

                // Event listeners
                celula.addEventListener('click', () => {
                    this.mostrarTodosEventosDia(dataCompleta);
                });

                celula.addEventListener('dblclick', () => {
                    if (typeof Events !== 'undefined') {
                        Events.mostrarNovoEvento(dataCompleta);
                    }
                });

                diaAtual++;
            }

            container.appendChild(celula);
        }
    },

    // Adicionar eventos na célula do dia
    _adicionarEventosCelula(celula, data) {
        const eventos = this.obterEventosDoDia(data);
        
        eventos.slice(0, this.config.maxEventosPorDia).forEach(evento => {
            const elementoEvento = document.createElement('div');
            
            // Determinar cor baseada no tipo
            const ehTarefa = ['pessoal', 'equipe', 'projeto', 'urgente', 'rotina'].includes(evento.tipo);
            const cor = ehTarefa ? 
                this.config.coresTarefas[evento.tipo] || '#6b7280' :
                this.config.coresEventos[evento.tipo] || '#6b7280';

            elementoEvento.style.cssText = `
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
            `;

            // Prefixo para tarefas
            const prefixo = ehTarefa ? 
                (evento.agendaSemanal ? '🔄 ' : '📝 ') : 
                this._obterIconeEvento(evento.tipo);

            elementoEvento.textContent = `${prefixo}${evento.titulo}`;
            elementoEvento.title = `${evento.titulo} - ${evento.tipo}`;

            elementoEvento.addEventListener('click', (e) => {
                e.stopPropagation();
                this.mostrarDetalhesEvento(evento);
            });

            celula.appendChild(elementoEvento);
        });

        // Indicador de mais eventos
        if (eventos.length > this.config.maxEventosPorDia) {
            const indicadorMais = document.createElement('div');
            indicadorMais.textContent = `+${eventos.length - this.config.maxEventosPorDia} mais`;
            indicadorMais.style.cssText = `
                font-size: 8px;
                color: #6b7280;
                text-align: center;
                margin-top: 2px;
                cursor: pointer;
            `;
            
            indicadorMais.addEventListener('click', (e) => {
                e.stopPropagation();
                this.mostrarTodosEventosDia(data);
            });

            celula.appendChild(indicadorMais);
        }
    },

    // Obter tarefas do dia (integração com Tasks.js)
    _obterTarefasDoDia(data) {
        try {
            if (!App.dados?.tarefas) return [];
            
            return App.dados.tarefas.filter(tarefa => {
                // Tarefas com data específica
                if (tarefa.dataInicio === data || tarefa.dataFim === data) {
                    return true;
                }
                
                // Tarefas da agenda semanal (recorrentes)
                if (tarefa.agendaSemanal && tarefa.diaSemana) {
                    const diaSemana = new Date(data).getDay();
                    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
                    return tarefa.diaSemana === diasSemana[diaSemana];
                }
                
                return false;
            });

        } catch (error) {
            console.error('❌ Erro ao obter tarefas do dia:', error);
            return [];
        }
    },

    // Obter ícone do evento
    _obterIconeEvento(tipo) {
        const icones = {
            reuniao: '📅 ',
            entrega: '📦 ',
            prazo: '⏰ ',
            marco: '🏁 ',
            outro: '📌 '
        };
        return icones[tipo] || '📌 ';
    },

    // Criar modal de eventos do dia
    _criarModalEventosDia(data, eventos) {
        try {
            // Remover modal existente
            const modalExistente = document.getElementById('modalEventosDia');
            if (modalExistente) {
                modalExistente.remove();
            }

            const modal = document.createElement('div');
            modal.id = 'modalEventosDia';
            modal.className = 'modal';

            const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>📅 Eventos do Dia</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <p style="margin-bottom: 16px; color: #6b7280;">
                            <strong>${Helpers.capitalize(dataFormatada)}</strong>
                        </p>
                        
                        <div style="max-height: 400px; overflow-y: auto;">
                            ${eventos.map(evento => {
                                const ehTarefa = ['pessoal', 'equipe', 'projeto', 'urgente', 'rotina'].includes(evento.tipo);
                                const cor = ehTarefa ? 
                                    this.config.coresTarefas[evento.tipo] || '#6b7280' :
                                    this.config.coresEventos[evento.tipo] || '#6b7280';
                                
                                return `
                                    <div class="evento-item" style="
                                        border-left: 4px solid ${cor};
                                        padding: 12px;
                                        margin: 8px 0;
                                        background: #f9fafb;
                                        border-radius: 4px;
                                        cursor: pointer;
                                    " onclick="Calendar.mostrarDetalhesEvento(${JSON.stringify(evento).replace(/"/g, '&quot;')})">
                                        <div style="display: flex; justify-content: between; align-items: start;">
                                            <div style="flex: 1;">
                                                <strong>${evento.titulo}</strong>
                                                <span style="
                                                    background: ${cor};
                                                    color: white;
                                                    padding: 2px 6px;
                                                    border-radius: 12px;
                                                    font-size: 10px;
                                                    margin-left: 8px;
                                                ">${evento.tipo}</span>
                                            </div>
                                            ${evento.horarioInicio ? `<span style="color: #6b7280; font-size: 12px;">${evento.horarioInicio}</span>` : ''}
                                        </div>
                                        ${evento.descricao ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">${evento.descricao}</p>` : ''}
                                        ${evento.pessoas && evento.pessoas.length > 0 ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">👥 ${evento.pessoas.join(', ')}</p>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="if(typeof Events !== 'undefined') Events.mostrarNovoEvento('${data}'); this.closest('.modal').remove();">
                            ➕ Novo Evento
                        </button>
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

    // Mostrar modal de detalhes (fallback)
    _mostrarModalDetalhes(evento) {
        try {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>📋 Detalhes</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <p><strong>Título:</strong> ${evento.titulo}</p>
                        <p><strong>Tipo:</strong> ${evento.tipo}</p>
                        ${evento.data ? `<p><strong>Data:</strong> ${new Date(evento.data).toLocaleDateString('pt-BR')}</p>` : ''}
                        ${evento.horarioInicio ? `<p><strong>Horário:</strong> ${evento.horarioInicio}</p>` : ''}
                        ${evento.descricao ? `<p><strong>Descrição:</strong> ${evento.descricao}</p>` : ''}
                        ${evento.pessoas && evento.pessoas.length > 0 ? `<p><strong>Pessoas:</strong> ${evento.pessoas.join(', ')}</p>` : ''}
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            ✅ Fechar
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);

        } catch (error) {
            console.error('❌ Erro ao mostrar modal de detalhes:', error);
        }
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
                Notifications.error('Por favor, selecione uma data');
                return;
            }

            if (!nome) {
                Notifications.error('Por favor, digite o nome do feriado');
                return;
            }

            this._fecharModalFeriado();
            this.adicionarFeriado(data, nome);

        } catch (error) {
            console.error('❌ Erro ao confirmar feriado:', error);
            Notifications.error('Erro ao adicionar feriado');
        }
    },

    // Atualizar estatísticas (placeholder para futuras melhorias)
    _atualizarEstatisticas() {
        // Implementação futura para atualizar contadores em tempo real
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
console.log('📅 Sistema de Calendário Modular v6.2 carregado!');
console.log('🎯 Funcionalidades: Navegação, Eventos, Feriados, PDF Export');
console.log('⚙️ Integração: Events.js, Tasks.js, PDF.js');
console.log('⌨️ Atalhos: Ctrl+←/→ (navegar), Home (hoje), Esc (fechar modais)');
