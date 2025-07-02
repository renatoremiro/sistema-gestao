/* ========== 📅 SISTEMA DE CALENDÁRIO MODULAR v6.2 ========== */

const Calendar = {
    // ✅ CONFIGURAÇÕES
    config: {
        MAX_EVENTOS_VISIVEIS: 5,
        DIAS_SEMANA: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        MESES_NOMES: [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ],
        CORES_EVENTOS: {
            'reuniao': '#3b82f6',
            'entrega': '#10b981', 
            'prazo': '#ef4444',
            'marco': '#8b5cf6',
            'outro': '#6b7280'
        }
    },

    // ✅ ESTADO DO CALENDÁRIO
    state: {
        mesAtual: new Date().getMonth(),
        anoAtual: new Date().getFullYear(),
        diaAtual: new Date().getDate(),
        eventosSelecionados: new Map(),
        modalDetalhes: null,
        modalListaEventos: null
    },

    // ✅ GERAR CALENDÁRIO PRINCIPAL
    gerar() {
        const calendario = document.getElementById('calendario');
        if (!calendario) {
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('Elemento calendario não encontrado');
            }
            return;
        }

        console.log(`📅 Gerando calendário: ${this.state.mesAtual + 1}/${this.state.anoAtual}`);

        // Limpar calendário
        calendario.innerHTML = '';

        // Adicionar cabeçalhos dos dias
        this._adicionarCabecalhos(calendario);

        // Gerar dias do mês
        this._gerarDiasDoMes(calendario);

        // Atualizar display do mês/ano
        this._atualizarDisplayMesAno();
    },

    // ✅ ADICIONAR CABEÇALHOS DOS DIAS DA SEMANA
    _adicionarCabecalhos(calendario) {
        this.config.DIAS_SEMANA.forEach(dia => {
            const diaHeader = document.createElement('div');
            diaHeader.className = 'dia-header';
            diaHeader.textContent = dia;
            calendario.appendChild(diaHeader);
        });
    },

    // ✅ GERAR DIAS DO MÊS
    _gerarDiasDoMes(calendario) {
        const primeiroDia = new Date(this.state.anoAtual, this.state.mesAtual, 1);
        const ultimoDia = new Date(this.state.anoAtual, this.state.mesAtual + 1, 0);
        const primeiroDiaSemana = primeiroDia.getDay();

        let diaAtual = 1;

        // Gerar 6 semanas (42 células)
        for (let i = 0; i < 42; i++) {
            const diaElement = document.createElement('div');
            diaElement.className = 'dia';

            if (i >= primeiroDiaSemana && diaAtual <= ultimoDia.getDate()) {
                this._configurarDia(diaElement, diaAtual);
                diaAtual++;
            } else {
                diaElement.style.visibility = 'hidden';
            }

            calendario.appendChild(diaElement);
        }
    },

    // ✅ CONFIGURAR DIA INDIVIDUAL
    _configurarDia(diaElement, numeroDia) {
        const dataCompleta = this._obterDataCompleta(numeroDia);
        
        // Criar estrutura do dia
        const diaNumero = document.createElement('div');
        diaNumero.className = 'dia-numero';
        diaNumero.textContent = numeroDia;

        // Verificar se é hoje
        if (this._ehHoje(numeroDia)) {
            diaElement.classList.add('dia-hoje');
            diaNumero.style.fontWeight = 'bold';
            diaNumero.style.color = '#3b82f6';
        }

        // Verificar se é feriado
        if (this._ehFeriado(dataCompleta)) {
            diaElement.classList.add('dia-feriado');
            const feriado = document.createElement('span');
            feriado.className = 'feriado-label';
            feriado.textContent = 'FERIADO';
            diaNumero.appendChild(feriado);
        }

        diaElement.appendChild(diaNumero);

        // Adicionar eventos do dia
        this._adicionarEventosNoDia(diaElement, dataCompleta);

        // Adicionar evento de clique
        diaElement.addEventListener('click', () => {
            this.abrirDetalheDia(dataCompleta);
        });
    },

    // ✅ ADICIONAR EVENTOS NO DIA
    _adicionarEventosNoDia(diaElement, data) {
        const eventosDoDia = this.obterEventosDoDia(data);
        const eventosVisiveis = eventosDoDia.slice(0, this.config.MAX_EVENTOS_VISIVEIS);
        const eventosRestantes = eventosDoDia.length - this.config.MAX_EVENTOS_VISIVEIS;

        eventosVisiveis.forEach(evento => {
            const eventoElement = this._criarElementoEvento(evento);
            diaElement.appendChild(eventoElement);
        });

        // Mostrar indicador de mais eventos
        if (eventosRestantes > 0) {
            const maisEventos = this._criarIndicadorMaisEventos(eventosRestantes, data);
            diaElement.appendChild(maisEventos);
        }
    },

    // ✅ CRIAR ELEMENTO DE EVENTO
    _criarElementoEvento(evento) {
        const eventoElement = document.createElement('div');
        eventoElement.className = `mini-evento evento-${evento.tipo}`;
        
        // Determinar se é evento pessoal
        if (evento.origem === 'tarefa_pessoal' || this._ehEventoPessoal(evento)) {
            eventoElement.classList.add('evento-pessoal');
        }

        // Adicionar ícone de recorrência se aplicável
        if (evento.recorrente || evento.isRecorrente) {
            eventoElement.classList.add('evento-recorrente');
        }

        // Definir conteúdo
        const horario = evento.horarioInicio ? `${evento.horarioInicio} ` : '';
        const titulo = typeof Helpers !== 'undefined' ? 
            Helpers.truncateText(evento.titulo, 15) : 
            evento.titulo.substring(0, 15);
        eventoElement.textContent = `${horario}${titulo}`;

        // Adicionar tooltip
        eventoElement.title = `${evento.titulo}\n${horario}${evento.horarioFim ? `- ${evento.horarioFim}` : ''}`;

        // Adicionar evento de clique
        eventoElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.mostrarDetalhesEvento(evento);
        });

        return eventoElement;
    },

    // ✅ CRIAR INDICADOR DE MAIS EVENTOS
    _criarIndicadorMaisEventos(quantidade, data) {
        const maisEventos = document.createElement('div');
        maisEventos.className = 'mais-eventos-mini';
        maisEventos.textContent = `+${quantidade} mais`;
        maisEventos.title = `Clique para ver todos os ${quantidade + this.config.MAX_EVENTOS_VISIVEIS} eventos`;
        
        maisEventos.addEventListener('click', (e) => {
            e.stopPropagation();
            this.mostrarTodosEventosDia(data);
        });
        
        return maisEventos;
    },

    // ✅ NAVEGAÇÃO DE MÊS
    mudarMes(direcao) {
        this.state.mesAtual += direcao;
        
        if (this.state.mesAtual > 11) {
            this.state.mesAtual = 0;
            this.state.anoAtual++;
        } else if (this.state.mesAtual < 0) {
            this.state.mesAtual = 11;
            this.state.anoAtual--;
        }
        
        // Atualizar estado global do App se existir
        if (typeof App !== 'undefined' && App.estadoSistema) {
            App.estadoSistema.mesAtual = this.state.mesAtual;
            App.estadoSistema.anoAtual = this.state.anoAtual;
        }
        
        this.gerar();
        
        // Atualizar estatísticas se App estiver disponível
        if (typeof App !== 'undefined' && typeof App.atualizarEstatisticas === 'function') {
            App.atualizarEstatisticas();
        }
    },

    // ✅ IR PARA MÊS ESPECÍFICO
    irParaMes(mes, ano) {
        this.state.mesAtual = mes;
        this.state.anoAtual = ano;
        
        if (typeof App !== 'undefined' && App.estadoSistema) {
            App.estadoSistema.mesAtual = mes;
            App.estadoSistema.anoAtual = ano;
        }
        
        this.gerar();
    },

    // ✅ IR PARA HOJE
    irParaHoje() {
        const hoje = new Date();
        this.irParaMes(hoje.getMonth(), hoje.getFullYear());
    },

    // ✅ OBTER EVENTOS DO DIA
    obterEventosDoDia(data) {
        if (typeof App === 'undefined' || !App.dados || !App.dados.eventos) return [];
        
        const eventos = App.dados.eventos.filter(evento => evento.data === data);
        
        // Adicionar eventos da agenda pessoal se aplicável
        const eventosAgenda = this._obterEventosAgendaPessoal(data);
        
        return [...eventos, ...eventosAgenda].sort((a, b) => {
            // Ordenar por horário
            const horaA = a.horarioInicio || '00:00';
            const horaB = b.horarioInicio || '00:00';
            return horaA.localeCompare(horaB);
        });
    },

    // ✅ OBTER EVENTOS DA AGENDA PESSOAL
    _obterEventosAgendaPessoal(data) {
        const eventos = [];
        
        if (typeof App === 'undefined' || !App.dados || !App.dados.agendas) return eventos;
        
        const dataObj = new Date(data + 'T00:00:00');
        const diaSemana = this._obterDiaSemanaPortugues(dataObj.getDay());
        
        // Verificar todas as agendas pessoais
        Object.entries(App.dados.agendas).forEach(([pessoa, agenda]) => {
            if (agenda[diaSemana]) {
                agenda[diaSemana].forEach(tarefa => {
                    if (tarefa.mostrarNoCalendario) {
                        eventos.push({
                            ...tarefa,
                            data: data,
                            pessoas: [pessoa],
                            origem: 'tarefa_pessoal'
                        });
                    }
                });
            }
        });
        
        return eventos;
    },

    // ✅ MOSTRAR DETALHES DO EVENTO
    mostrarDetalhesEvento(evento) {
        // Remover modal anterior se existir
        this._fecharDetalhesEvento();
        
        this.state.modalDetalhes = this._criarModalDetalhes(evento);
        document.body.appendChild(this.state.modalDetalhes);
    },

    // ✅ CRIAR MODAL DE DETALHES
    _criarModalDetalhes(evento) {
        const modal = document.createElement('div');
        modal.className = 'modal-evento-detalhes active';
        
        const participantes = Array.isArray(evento.pessoas) ? evento.pessoas.join(', ') : (evento.pessoas || 'N/A');
        const horario = evento.horarioInicio ? 
            `${evento.horarioInicio}${evento.horarioFim ? ` - ${evento.horarioFim}` : ''}` : 
            'Todo o dia';
        
        const dataFormatada = typeof Helpers !== 'undefined' ? 
            Helpers.formatarDataBR(evento.data) : 
            evento.data;
            
        modal.innerHTML = `
            <div class="modal-evento-content">
                <div class="evento-detalhes-header">
                    <h3 class="evento-detalhes-titulo">${this._sanitizeHTML(evento.titulo)}</h3>
                    <span class="evento-detalhes-tipo evento-${evento.tipo}">${this._obterNomeTipo(evento.tipo)}</span>
                </div>
                
                <div class="evento-detalhes-info">
                    <span class="evento-detalhes-label">📅 Data:</span>
                    ${dataFormatada}
                </div>
                
                <div class="evento-detalhes-info">
                    <span class="evento-detalhes-label">⏰ Horário:</span>
                    ${horario}
                </div>
                
                <div class="evento-detalhes-info">
                    <span class="evento-detalhes-label">👥 Participantes:</span>
                    ${this._sanitizeHTML(participantes)}
                </div>
                
                ${evento.descricao ? `
                    <div class="evento-detalhes-info">
                        <span class="evento-detalhes-label">📝 Descrição:</span>
                        ${this._sanitizeHTML(evento.descricao)}
                    </div>
                ` : ''}
                
                ${evento.origem === 'tarefa_pessoal' ? `
                    <div class="evento-detalhes-info" style="color: #8b5cf6;">
                        <span class="evento-detalhes-label">📌 Tipo:</span>
                        Tarefa pessoal
                    </div>
                ` : ''}
                
                <div class="evento-detalhes-acoes">
                    <button class="btn btn-secondary btn-sm" onclick="Calendar._fecharDetalhesEvento()">
                        Fechar
                    </button>
                    ${!evento.origem || evento.origem !== 'tarefa_pessoal' ? `
                        <button class="btn btn-primary btn-sm" onclick="Calendar._editarEvento(${evento.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="Calendar._confirmarExclusaoEvento(${evento.id})">
                            🗑️ Excluir
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Fechar com clique fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this._fecharDetalhesEvento();
            }
        });
        
        return modal;
    },

    // ✅ MOSTRAR TODOS EVENTOS DO DIA
    mostrarTodosEventosDia(data) {
        this._fecharListaEventos();
        
        const eventos = this.obterEventosDoDia(data);
        if (eventos.length === 0) {
            if (typeof Notifications !== 'undefined') {
                Notifications.info('Nenhum evento neste dia');
            }
            return;
        }
        
        this.state.modalListaEventos = this._criarModalListaEventos(data, eventos);
        document.body.appendChild(this.state.modalListaEventos);
    },

    // ✅ CRIAR MODAL LISTA DE EVENTOS
    _criarModalListaEventos(data, eventos) {
        const modal = document.createElement('div');
        modal.className = 'modal-evento-detalhes active';
        
        const dataFormatada = typeof Helpers !== 'undefined' ? 
            Helpers.formatarDataBR(data) : 
            data;
        
        const eventosHtml = eventos.map(evento => {
            const horario = evento.horarioInicio ? `${evento.horarioInicio} - ` : '';
            const participantes = Array.isArray(evento.pessoas) ? evento.pessoas.join(', ') : (evento.pessoas || '');
            
            return `
                <div class="evento-lista-item" style="padding: 12px; margin-bottom: 8px; border-radius: 6px; background: ${this.config.CORES_EVENTOS[evento.tipo] || '#6b7280'}20; border-left: 4px solid ${this.config.CORES_EVENTOS[evento.tipo] || '#6b7280'}; cursor: pointer;" onclick="Calendar.mostrarDetalhesEvento(${JSON.stringify(evento).replace(/"/g, '&quot;')})">
                    <div style="font-weight: bold; margin-bottom: 4px;">
                        ${horario}${this._sanitizeHTML(evento.titulo)}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        👥 ${this._sanitizeHTML(participantes)}
                    </div>
                    ${evento.origem === 'tarefa_pessoal' ? '<div style="font-size: 11px; color: #8b5cf6;">📌 Tarefa pessoal</div>' : ''}
                </div>
            `;
        }).join('');
        
        modal.innerHTML = `
            <div class="modal-evento-content" style="max-width: 500px;">
                <div class="evento-detalhes-header">
                    <h3 class="evento-detalhes-titulo">Eventos do dia</h3>
                    <span style="font-size: 14px; color: #6b7280;">${dataFormatada}</span>
                </div>
                
                <div style="max-height: 400px; overflow-y: auto; margin: 16px 0;">
                    ${eventosHtml}
                </div>
                
                <div class="evento-detalhes-acoes">
                    <button class="btn btn-secondary" onclick="Calendar._fecharListaEventos()">
                        Fechar
                    </button>
                    <button class="btn btn-primary" onclick="Calendar._adicionarEventoData('${data}')">
                        + Novo Evento
                    </button>
                </div>
            </div>
        `;
        
        // Fechar com clique fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this._fecharListaEventos();
            }
        });
        
        return modal;
    },

    // ✅ ABRIR DETALHE DO DIA
    abrirDetalheDia(data) {
        console.log('📅 Abrindo detalhe do dia:', data);
        this.mostrarTodosEventosDia(data);
    },

    // ✅ ADICIONAR FERIADO
    adicionarFeriado(data, nome) {
        if (typeof App === 'undefined' || !App.dados) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Sistema não inicializado');
            }
            return;
        }
        
        if (!App.dados.feriados) {
            App.dados.feriados = {};
        }
        
        App.dados.feriados[data] = nome;
        
        // Salvar dados usando sistema de persistência
        if (typeof Persistence !== 'undefined' && typeof Persistence.salvarDadosCritico === 'function') {
            Persistence.salvarDadosCritico().then(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.success(`Feriado "${nome}" adicionado!`);
                }
                this.gerar();
            }).catch(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Erro ao salvar feriado');
                }
            });
        } else {
            this.gerar();
        }
    },

    // ✅ REMOVER FERIADO
    removerFeriado(data) {
        if (typeof App === 'undefined' || !App.dados || !App.dados.feriados) return;
        
        delete App.dados.feriados[data];
        
        if (typeof Persistence !== 'undefined' && typeof Persistence.salvarDadosCritico === 'function') {
            Persistence.salvarDadosCritico().then(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.success('Feriado removido!');
                }
                this.gerar();
            }).catch(() => {
                if (typeof Notifications !== 'undefined') {
                    Notifications.error('Erro ao remover feriado');
                }
            });
        } else {
            this.gerar();
        }
    },

    // ✅ MOSTRAR MODAL MARCAR FERIADO
    mostrarMarcarFeriado() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3 style="margin-bottom: 24px;">🎉 Marcar Feriado</h3>
                
                <div class="form-group">
                    <label>Data do Feriado</label>
                    <input type="date" id="feriadoData" required>
                </div>
                
                <div class="form-group">
                    <label>Nome do Feriado</label>
                    <input type="text" id="feriadoNome" placeholder="Ex: Dia da Independência" required>
                </div>
                
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="Calendar._processarFeriado(this)">
                        Marcar Feriado
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    // ✅ PROCESSAR FERIADO
    _processarFeriado(botao) {
        const modal = botao.closest('.modal');
        const data = modal.querySelector('#feriadoData').value;
        const nome = modal.querySelector('#feriadoNome').value.trim();
        
        if (!data || !nome) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Preencha todos os campos');
            }
            return;
        }
        
        this.adicionarFeriado(data, nome);
        modal.remove();
    },

    // ✅ FUNÇÕES AUXILIARES
    _obterDataCompleta(dia) {
        return `${this.state.anoAtual}-${String(this.state.mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    },

    _ehHoje(dia) {
        const hoje = new Date();
        return hoje.getDate() === dia && 
               hoje.getMonth() === this.state.mesAtual && 
               hoje.getFullYear() === this.state.anoAtual;
    },

    _ehFeriado(data) {
        return typeof App !== 'undefined' && App.dados && App.dados.feriados && App.dados.feriados[data];
    },

    _ehEventoPessoal(evento) {
        return evento.origem === 'tarefa_pessoal' || 
               (typeof App !== 'undefined' && App.estadoSistema && App.estadoSistema.pessoaAtual && 
                evento.pessoas && evento.pessoas.length === 1 && 
                evento.pessoas[0] === App.estadoSistema.pessoaAtual);
    },

    _obterDiaSemanaPortugues(diaJS) {
        const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        return dias[diaJS];
    },

    _obterNomeTipo(tipo) {
        const tipos = {
            'reuniao': 'Reunião',
            'entrega': 'Entrega',
            'prazo': 'Prazo',
            'marco': 'Marco',
            'outro': 'Outro'
        };
        return tipos[tipo] || 'Evento';
    },

    _atualizarDisplayMesAno() {
        // Atualizar display principal (se existir)
        const mesAno = document.getElementById('mesAno');
        if (mesAno) {
            mesAno.textContent = `${this.config.MESES_NOMES[this.state.mesAtual]} ${this.state.anoAtual}`;
        }
        
        // Atualizar display do calendário específico (index-dev.html)
        const mesAnoCalendario = document.getElementById('mesAnoCalendario');
        if (mesAnoCalendario) {
            mesAnoCalendario.textContent = `${this.config.MESES_NOMES[this.state.mesAtual]} ${this.state.anoAtual}`;
        }
    },

    _sanitizeHTML(str) {
        if (typeof Helpers !== 'undefined' && typeof Helpers.sanitizeHTML === 'function') {
            return Helpers.sanitizeHTML(str);
        }
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ✅ AÇÕES DE EVENTOS (INTEGRAÇÃO COM OUTROS MÓDULOS)
    _editarEvento(eventoId) {
        console.log('✏️ Editando evento:', eventoId);
        this._fecharDetalhesEvento();
        
        // Integração com módulo Events quando criado
        if (typeof Events !== 'undefined' && typeof Events.editarEvento === 'function') {
            Events.editarEvento(eventoId);
        } else {
            if (typeof Notifications !== 'undefined') {
                Notifications.info('Módulo Events será implementado em breve');
            }
        }
    },

    _confirmarExclusaoEvento(eventoId) {
        this._fecharDetalhesEvento();
        
        if (typeof Notifications !== 'undefined' && typeof Notifications.confirmar === 'function') {
            Notifications.confirmar(
                'Confirmar Exclusão',
                'Deseja realmente excluir este evento?',
                (confirmado) => {
                    if (confirmado) {
                        this._excluirEvento(eventoId);
                    }
                }
            );
        } else {
            // Fallback para confirm nativo
            if (confirm('Deseja realmente excluir este evento?')) {
                this._excluirEvento(eventoId);
            }
        }
    },

    _excluirEvento(eventoId) {
        if (typeof App === 'undefined' || !App.dados || !App.dados.eventos) return;
        
        const eventoIndex = App.dados.eventos.findIndex(e => e.id === eventoId);
        if (eventoIndex !== -1) {
            App.dados.eventos.splice(eventoIndex, 1);
            
            if (typeof Persistence !== 'undefined' && typeof Persistence.salvarDadosCritico === 'function') {
                Persistence.salvarDadosCritico().then(() => {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.success('Evento excluído!');
                    }
                    this.gerar();
                }).catch(() => {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.error('Erro ao excluir evento');
                    }
                });
            } else {
                this.gerar();
            }
        }
    },

    _adicionarEventoData(data) {
        console.log('➕ Adicionando evento para:', data);
        this._fecharListaEventos();
        
        // Integração com módulo Events quando criado
        if (typeof Events !== 'undefined' && typeof Events.mostrarNovoEvento === 'function') {
            Events.mostrarNovoEvento(data);
        } else {
            if (typeof Notifications !== 'undefined') {
                Notifications.info('Módulo Events será implementado em breve');
            }
        }
    },

    // ✅ FECHAR MODAIS
    _fecharDetalhesEvento() {
        if (this.state.modalDetalhes && this.state.modalDetalhes.parentElement) {
            this.state.modalDetalhes.parentElement.removeChild(this.state.modalDetalhes);
            this.state.modalDetalhes = null;
        }
    },

    _fecharListaEventos() {
        if (this.state.modalListaEventos && this.state.modalListaEventos.parentElement) {
            this.state.modalListaEventos.parentElement.removeChild(this.state.modalListaEventos);
            this.state.modalListaEventos = null;
        }
    },

    // ✅ OBTER ESTATÍSTICAS DO MÊS
    obterEstatisticasDoMes() {
        const eventos = this.obterEventosDoMes();
        const stats = {
            total: eventos.length,
            porTipo: {},
            proximoEvento: null
        };
        
        // Contar por tipo
        eventos.forEach(evento => {
            if (!stats.porTipo[evento.tipo]) {
                stats.porTipo[evento.tipo] = 0;
            }
            stats.porTipo[evento.tipo]++;
        });
        
        // Encontrar próximo evento
        const hoje = new Date().toISOString().split('T')[0];
        const eventosProximos = eventos
            .filter(e => e.data >= hoje)
            .sort((a, b) => a.data.localeCompare(b.data));
            
        if (eventosProximos.length > 0) {
            stats.proximoEvento = eventosProximos[0];
        }
        
        return stats;
    },

    // ✅ OBTER EVENTOS DO MÊS ATUAL
    obterEventosDoMes() {
        if (typeof App === 'undefined' || !App.dados || !App.dados.eventos) return [];
        
        return App.dados.eventos.filter(evento => {
            const dataEvento = new Date(evento.data + 'T00:00:00');
            return dataEvento.getMonth() === this.state.mesAtual && 
                   dataEvento.getFullYear() === this.state.anoAtual;
        });
    },

    // ✅ SINCRONIZAR COM ESTADO GLOBAL
    sincronizarComApp() {
        if (typeof App !== 'undefined' && App.estadoSistema) {
            this.state.mesAtual = App.estadoSistema.mesAtual || this.state.mesAtual;
            this.state.anoAtual = App.estadoSistema.anoAtual || this.state.anoAtual;
        }
    },

    // ✅ CONFIGURAR EVENTOS DE TECLADO
    _configurarEventosTeclado() {
        document.addEventListener('keydown', (e) => {
            // Setas para navegar meses (apenas se não houver modal aberto)
            if (!document.querySelector('.modal.active')) {
                if (e.key === 'ArrowLeft' && e.ctrlKey) {
                    e.preventDefault();
                    this.mudarMes(-1);
                } else if (e.key === 'ArrowRight' && e.ctrlKey) {
                    e.preventDefault();
                    this.mudarMes(1);
                } else if (e.key === 'Home' && e.ctrlKey) {
                    e.preventDefault();
                    this.irParaHoje();
                }
            }
            
            // ESC para fechar modais
            if (e.key === 'Escape') {
                this._fecharDetalhesEvento();
                this._fecharListaEventos();
            }
        });
    },

    // ✅ INICIALIZAÇÃO DO MÓDULO
    init() {
        console.log('📅 Inicializando sistema de calendário...');
        
        // Sincronizar com App se disponível
        this.sincronizarComApp();
        
        // Configurar eventos de teclado
        this._configurarEventosTeclado();
        
        // Gerar calendário inicial
        this.gerar();
        
        console.log('✅ Sistema de calendário inicializado');
    },

    // ✅ OBTER STATUS DO CALENDÁRIO
    obterStatus() {
        return {
            mesAtual: this.state.mesAtual,
            anoAtual: this.state.anoAtual,
            mesNome: this.config.MESES_NOMES[this.state.mesAtual],
            eventosDoMes: this.obterEventosDoMes().length,
            estatisticas: this.obterEstatisticasDoMes(),
            modalAberto: !!(this.state.modalDetalhes || this.state.modalListaEventos)
        };
    }
};

// ✅ FUNÇÕES GLOBAIS PARA COMPATIBILIDADE
window.mudarMes = (direcao) => Calendar.mudarMes(direcao);
window.gerarCalendario = () => Calendar.gerar();
window.mostrarMarcarFeriado = () => Calendar.mostrarMarcarFeriado();

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que outros módulos carregaram
    setTimeout(() => {
        Calendar.init();
    }, 200);
});

console.log('📅 Sistema de Calendário Modular v6.2 carregado!');
