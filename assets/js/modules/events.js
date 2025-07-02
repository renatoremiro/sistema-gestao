/* ========== 📅 SISTEMA DE GESTÃO DE EVENTOS v6.3.0 ========== */

const Events = {
    // ✅ CONFIGURAÇÕES
    config: {
        tipos: [
            { value: 'reuniao', label: 'Reunião', icon: '📅', cor: '#3b82f6' },
            { value: 'entrega', label: 'Entrega', icon: '📦', cor: '#10b981' },
            { value: 'prazo', label: 'Prazo', icon: '⏰', cor: '#ef4444' },
            { value: 'marco', label: 'Marco', icon: '🏁', cor: '#8b5cf6' },
            { value: 'outro', label: 'Outro', icon: '📌', cor: '#6b7280' }
        ],
        status: [
            { value: 'agendado', label: 'Agendado', cor: '#3b82f6' },
            { value: 'confirmado', label: 'Confirmado', cor: '#10b981' },
            { value: 'em_andamento', label: 'Em andamento', cor: '#f59e0b' },
            { value: 'concluido', label: 'Concluído', cor: '#22c55e' },
            { value: 'cancelado', label: 'Cancelado', cor: '#ef4444' },
            { value: 'adiado', label: 'Adiado', cor: '#6b7280' }
        ],
        lembretes: [
            { value: 15, label: '15 minutos antes' },
            { value: 30, label: '30 minutos antes' },
            { value: 60, label: '1 hora antes' },
            { value: 240, label: '4 horas antes' },
            { value: 1440, label: '1 dia antes' }
        ],
        recorrencia: [
            { value: 'nenhuma', label: 'Não repetir' },
            { value: 'diaria', label: 'Diariamente' },
            { value: 'semanal', label: 'Semanalmente' },
            { value: 'mensal', label: 'Mensalmente' },
            { value: 'anual', label: 'Anualmente' }
        ]
    },

    // ✅ ESTADO INTERNO
    state: {
        modalAtivo: false,
        eventoEditando: null,
        participantesSelecionados: [],
        filtroAtivo: 'todos',
        ordenacaoAtiva: 'data',
        buscarTexto: '',
        estatisticas: null
    },

    // ✅ MOSTRAR MODAL DE NOVO EVENTO
    mostrarNovoEvento(dataInicial = null) {
        try {
            console.log('📅 Abrindo modal de novo evento:', dataInicial);
            
            // Definir data inicial
            const hoje = new Date();
            const dataInput = dataInicial || hoje.toISOString().split('T')[0];
            
            // Limpar estado anterior
            this.state.eventoEditando = null;
            this.state.participantesSelecionados = [];
            
            // Criar modal
            this._criarModalEvento(dataInput);
            
            this.state.modalAtivo = true;
            console.log('✅ Modal de novo evento criado');

        } catch (error) {
            console.error('❌ Erro ao mostrar modal de novo evento:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao abrir modal de evento');
            }
        }
    },

    // ✅ EDITAR EVENTO EXISTENTE
    editarEvento(id) {
        try {
            console.log('✏️ Editando evento:', id);
            
            if (!App.dados?.eventos) {
                throw new Error('Dados de eventos não disponíveis');
            }
            
            const evento = App.dados.eventos.find(e => e.id == id);
            if (!evento) {
                throw new Error('Evento não encontrado');
            }
            
            // Configurar estado de edição
            this.state.eventoEditando = id;
            this.state.participantesSelecionados = evento.pessoas || [];
            
            // Criar modal com dados do evento
            this._criarModalEvento(evento.data, evento);
            
            this.state.modalAtivo = true;
            console.log('✅ Modal de edição criado para evento:', evento.titulo);

        } catch (error) {
            console.error('❌ Erro ao editar evento:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao editar evento: ${error.message}`);
            }
        }
    },

    // ✅ SALVAR EVENTO (criar ou atualizar)
    async salvarEvento(dadosEvento) {
        try {
            console.log('💾 Salvando evento:', dadosEvento.titulo);
            
            // Validar dados obrigatórios
            const validacao = this._validarDadosEvento(dadosEvento);
            if (!validacao.valido) {
                throw new Error(validacao.erro);
            }
            
            // Garantir estrutura de eventos
            if (!App.dados.eventos) {
                App.dados.eventos = [];
            }
            
            if (this.state.eventoEditando) {
                // Atualizar evento existente
                const index = App.dados.eventos.findIndex(e => e.id == this.state.eventoEditando);
                if (index !== -1) {
                    App.dados.eventos[index] = {
                        ...App.dados.eventos[index],
                        ...dadosEvento,
                        id: this.state.eventoEditando,
                        ultimaAtualizacao: new Date().toISOString()
                    };
                    console.log('✅ Evento atualizado');
                }
            } else {
                // Criar novo evento
                const novoEvento = {
                    id: Date.now(),
                    ...dadosEvento,
                    dataCriacao: new Date().toISOString(),
                    ultimaAtualizacao: new Date().toISOString(),
                    status: dadosEvento.status || 'agendado'
                };
                
                App.dados.eventos.push(novoEvento);
                console.log('✅ Novo evento criado');
            }
            
            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                await Persistence.salvarDadosCritico();
            }
            
            // Atualizar calendário
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }
            
            // Atualizar estatísticas
            this._calcularEstatisticas();
            
            // Fechar modal
            this.fecharModal();
            
            // Notificar sucesso
            if (typeof Notifications !== 'undefined') {
                const acao = this.state.eventoEditando ? 'atualizado' : 'criado';
                Notifications.success(`Evento "${dadosEvento.titulo}" ${acao} com sucesso!`);
            }
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar evento:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao salvar evento: ${error.message}`);
            }
            return false;
        }
    },

    // ✅ EXCLUIR EVENTO
    async excluirEvento(id) {
        try {
            console.log('🗑️ Excluindo evento:', id);
            
            if (!App.dados?.eventos) {
                throw new Error('Dados de eventos não disponíveis');
            }
            
            const eventoIndex = App.dados.eventos.findIndex(e => e.id == id);
            if (eventoIndex === -1) {
                throw new Error('Evento não encontrado');
            }
            
            const evento = App.dados.eventos[eventoIndex];
            
            // Confirmar exclusão
            const confirmacao = confirm(
                `Tem certeza que deseja excluir o evento?\n\n` +
                `📅 ${evento.titulo}\n` +
                `Data: ${new Date(evento.data).toLocaleDateString('pt-BR')}\n\n` +
                `Esta ação não pode ser desfeita.`
            );
            
            if (!confirmacao) {
                console.log('❌ Exclusão cancelada pelo usuário');
                return false;
            }
            
            // Remover evento
            App.dados.eventos.splice(eventoIndex, 1);
            
            // Salvar dados
            if (typeof Persistence !== 'undefined') {
                await Persistence.salvarDadosCritico();
            }
            
            // Atualizar calendário
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }
            
            // Atualizar estatísticas
            this._calcularEstatisticas();
            
            // Notificar sucesso
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Evento "${evento.titulo}" excluído com sucesso!`);
            }
            
            console.log('✅ Evento excluído com sucesso');
            return true;

        } catch (error) {
            console.error('❌ Erro ao excluir evento:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao excluir evento: ${error.message}`);
            }
            return false;
        }
    },

    // ✅ BUSCAR EVENTOS
    buscarEventos(termo = '', filtros = {}) {
        try {
            if (!App.dados?.eventos) {
                return [];
            }
            
            let eventos = [...App.dados.eventos];
            
            // Filtrar por termo de busca
            if (termo) {
                const termoLower = termo.toLowerCase();
                eventos = eventos.filter(evento => 
                    evento.titulo.toLowerCase().includes(termoLower) ||
                    evento.descricao?.toLowerCase().includes(termoLower) ||
                    evento.pessoas?.some(pessoa => pessoa.toLowerCase().includes(termoLower))
                );
            }
            
            // Filtrar por tipo
            if (filtros.tipo) {
                eventos = eventos.filter(evento => evento.tipo === filtros.tipo);
            }
            
            // Filtrar por status
            if (filtros.status) {
                eventos = eventos.filter(evento => evento.status === filtros.status);
            }
            
            // Filtrar por data
            if (filtros.dataInicio && filtros.dataFim) {
                eventos = eventos.filter(evento => 
                    evento.data >= filtros.dataInicio && evento.data <= filtros.dataFim
                );
            }
            
            // Filtrar por pessoa
            if (filtros.pessoa) {
                eventos = eventos.filter(evento => 
                    evento.pessoas?.includes(filtros.pessoa)
                );
            }
            
            // Ordenar
            const ordenacao = filtros.ordenacao || this.state.ordenacaoAtiva;
            eventos.sort((a, b) => {
                switch (ordenacao) {
                    case 'data':
                        return new Date(a.data) - new Date(b.data);
                    case 'titulo':
                        return a.titulo.localeCompare(b.titulo);
                    case 'tipo':
                        return a.tipo.localeCompare(b.tipo);
                    case 'status':
                        return a.status.localeCompare(b.status);
                    default:
                        return 0;
                }
            });
            
            return eventos;

        } catch (error) {
            console.error('❌ Erro ao buscar eventos:', error);
            return [];
        }
    },

    // ✅ OBTER PRÓXIMOS EVENTOS
    obterProximosEventos(limite = 5) {
        try {
            if (!App.dados?.eventos) {
                return [];
            }
            
            const agora = new Date();
            const hoje = agora.toISOString().split('T')[0];
            
            return App.dados.eventos
                .filter(evento => evento.data >= hoje)
                .sort((a, b) => {
                    const dataA = new Date(a.data + (a.horarioInicio ? 'T' + a.horarioInicio : 'T00:00'));
                    const dataB = new Date(b.data + (b.horarioInicio ? 'T' + b.horarioInicio : 'T00:00'));
                    return dataA - dataB;
                })
                .slice(0, limite);

        } catch (error) {
            console.error('❌ Erro ao obter próximos eventos:', error);
            return [];
        }
    },

    // ✅ EXPORTAR EVENTOS
    exportarEventos(formato = 'csv') {
        try {
            console.log(`📤 Exportando eventos em formato: ${formato}`);
            
            const eventos = this.buscarEventos();
            
            if (eventos.length === 0) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Nenhum evento para exportar');
                }
                return;
            }
            
            const timestamp = new Date().toISOString().split('T')[0];
            
            if (formato === 'csv') {
                const csv = this._gerarCSV(eventos);
                if (typeof Helpers !== 'undefined') {
                    Helpers.downloadFile(csv, `eventos_${timestamp}.csv`, 'text/csv');
                }
            } else if (formato === 'json') {
                const json = JSON.stringify(eventos, null, 2);
                if (typeof Helpers !== 'undefined') {
                    Helpers.downloadFile(json, `eventos_${timestamp}.json`, 'application/json');
                }
            }
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`Eventos exportados em ${formato.toUpperCase()}`);
            }

        } catch (error) {
            console.error('❌ Erro ao exportar eventos:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao exportar eventos');
            }
        }
    },

    // ✅ OBTER ESTATÍSTICAS
    obterEstatisticas() {
        try {
            if (!this.state.estatisticas) {
                this._calcularEstatisticas();
            }
            return this.state.estatisticas;

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                total: 0,
                porTipo: {},
                eventosPassados: 0,
                eventosFuturos: 0,
                proximoEvento: null
            };
        }
    },

    // ✅ OBTER STATUS DO SISTEMA
    obterStatus() {
        return {
            modalAtivo: this.state.modalAtivo,
            eventoEditando: this.state.eventoEditando,
            participantesSelecionados: this.state.participantesSelecionados.length,
            totalEventos: App.dados?.eventos?.length || 0,
            filtroAtivo: this.state.filtroAtivo,
            ordenacaoAtiva: this.state.ordenacaoAtiva,
            estatisticas: !!this.state.estatisticas
        };
    },

    // ✅ FECHAR MODAL
    fecharModal() {
        try {
            const modal = document.getElementById('modalEvento');
            if (modal) {
                modal.remove();
            }
            
            // Limpar estado
            this.state.modalAtivo = false;
            this.state.eventoEditando = null;
            this.state.participantesSelecionados = [];
            
            console.log('✅ Modal de evento fechado');

        } catch (error) {
            console.error('❌ Erro ao fechar modal:', error);
        }
    },

    // === MÉTODOS PRIVADOS ===

    // ✅ CRIAR MODAL DE EVENTO
    _criarModalEvento(dataInicial, dadosEvento = null) {
        try {
            // Remover modal existente
            const modalExistente = document.getElementById('modalEvento');
            if (modalExistente) {
                modalExistente.remove();
            }
            
            const ehEdicao = !!dadosEvento;
            const titulo = ehEdicao ? 'Editar Evento' : 'Novo Evento';
            
            // Obter lista de pessoas disponíveis
            const pessoas = this._obterListaPessoas();
            
            const modal = document.createElement('div');
            modal.id = 'modalEvento';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>${ehEdicao ? '✏️' : '📅'} ${titulo}</h3>
                        <button class="modal-close" onclick="Events.fecharModal()">&times;</button>
                    </div>
                    
                    <form id="formEvento" class="modal-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <!-- Título -->
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label for="eventoTitulo">📝 Título: *</label>
                                <input type="text" id="eventoTitulo" required 
                                       value="${dadosEvento?.titulo || ''}"
                                       placeholder="Ex: Reunião de planejamento">
                            </div>
                            
                            <!-- Tipo e Status -->
                            <div class="form-group">
                                <label for="eventoTipo">📂 Tipo: *</label>
                                <select id="eventoTipo" required>
                                    ${this.config.tipos.map(tipo => 
                                        `<option value="${tipo.value}" ${dadosEvento?.tipo === tipo.value ? 'selected' : ''}>${tipo.icon} ${tipo.label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="eventoStatus">⚡ Status:</label>
                                <select id="eventoStatus">
                                    ${this.config.status.map(status => 
                                        `<option value="${status.value}" ${dadosEvento?.status === status.value ? 'selected' : ''}>${status.label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <!-- Data e Horários -->
                            <div class="form-group">
                                <label for="eventoData">📅 Data: *</label>
                                <input type="date" id="eventoData" required 
                                       value="${dadosEvento?.data || dataInicial}">
                            </div>
                            
                            <div class="form-group">
                                <label for="eventoHorarioInicio">🕐 Horário:</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="time" id="eventoHorarioInicio" 
                                           value="${dadosEvento?.horarioInicio || ''}"
                                           placeholder="Início">
                                    <span>até</span>
                                    <input type="time" id="eventoHorarioFim" 
                                           value="${dadosEvento?.horarioFim || ''}"
                                           placeholder="Fim">
                                </div>
                            </div>
                            
                            <!-- Descrição -->
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label for="eventoDescricao">📄 Descrição:</label>
                                <textarea id="eventoDescricao" rows="3" 
                                          placeholder="Descreva o evento...">${dadosEvento?.descricao || ''}</textarea>
                            </div>
                            
                            <!-- Participantes -->
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>👥 Participantes:</label>
                                <div id="participantesContainer" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                                    ${pessoas.map(pessoa => `
                                        <label style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #f3f4f6; border-radius: 4px; cursor: pointer;">
                                            <input type="checkbox" name="participantes" value="${pessoa}" 
                                                   ${dadosEvento?.pessoas?.includes(pessoa) ? 'checked' : ''}>
                                            <span style="font-size: 12px;">${pessoa}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <!-- Local e Link -->
                            <div class="form-group">
                                <label for="eventoLocal">📍 Local:</label>
                                <input type="text" id="eventoLocal" 
                                       value="${dadosEvento?.local || ''}"
                                       placeholder="Ex: Sala de reuniões">
                            </div>
                            
                            <div class="form-group">
                                <label for="eventoLink">🔗 Link:</label>
                                <input type="url" id="eventoLink" 
                                       value="${dadosEvento?.link || ''}"
                                       placeholder="Ex: https://meet.google.com/...">
                            </div>
                            
                            <!-- Lembrete e Recorrência -->
                            <div class="form-group">
                                <label for="eventoLembrete">🔔 Lembrete:</label>
                                <select id="eventoLembrete">
                                    <option value="">Sem lembrete</option>
                                    ${this.config.lembretes.map(lembrete => 
                                        `<option value="${lembrete.value}" ${dadosEvento?.lembrete == lembrete.value ? 'selected' : ''}>${lembrete.label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="eventoRecorrencia">🔄 Recorrência:</label>
                                <select id="eventoRecorrencia">
                                    ${this.config.recorrencia.map(rec => 
                                        `<option value="${rec.value}" ${dadosEvento?.recorrencia === rec.value ? 'selected' : ''}>${rec.label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    </form>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Events.fecharModal()">
                            ❌ Cancelar
                        </button>
                        ${ehEdicao ? `
                            <button type="button" class="btn btn-danger" onclick="Events.excluirEvento(${dadosEvento.id})">
                                🗑️ Excluir
                            </button>
                        ` : ''}
                        <button type="submit" class="btn btn-primary" onclick="Events._submeterFormulario(event)">
                            ${ehEdicao ? '✅ Atualizar' : '📅 Criar'} Evento
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);
            
            // Focar no campo título
            document.getElementById('eventoTitulo').focus();

        } catch (error) {
            console.error('❌ Erro ao criar modal de evento:', error);
            throw error;
        }
    },

    // ✅ SUBMETER FORMULÁRIO
    _submeterFormulario(event) {
        event.preventDefault();
        
        try {
            // Obter dados do formulário
            const dados = this._obterDadosFormulario();
            
            // Salvar evento
            this.salvarEvento(dados);

        } catch (error) {
            console.error('❌ Erro ao submeter formulário:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao salvar: ${error.message}`);
            }
        }
    },

    // ✅ OBTER DADOS DO FORMULÁRIO
    _obterDadosFormulario() {
        const form = document.getElementById('formEvento');
        if (!form) {
            throw new Error('Formulário não encontrado');
        }
        
        // Obter participantes selecionados
        const participantes = Array.from(form.querySelectorAll('input[name="participantes"]:checked'))
            .map(input => input.value);
        
        return {
            titulo: document.getElementById('eventoTitulo').value.trim(),
            tipo: document.getElementById('eventoTipo').value,
            status: document.getElementById('eventoStatus').value,
            data: document.getElementById('eventoData').value,
            horarioInicio: document.getElementById('eventoHorarioInicio').value,
            horarioFim: document.getElementById('eventoHorarioFim').value,
            descricao: document.getElementById('eventoDescricao').value.trim(),
            pessoas: participantes,
            local: document.getElementById('eventoLocal').value.trim(),
            link: document.getElementById('eventoLink').value.trim(),
            lembrete: document.getElementById('eventoLembrete').value,
            recorrencia: document.getElementById('eventoRecorrencia').value
        };
    },

    // ✅ VALIDAR DADOS DO EVENTO
    _validarDadosEvento(dados) {
        try {
            // Título obrigatório
            if (!dados.titulo || dados.titulo.length < 3) {
                return { valido: false, erro: 'Título deve ter pelo menos 3 caracteres' };
            }
            
            // Tipo obrigatório
            if (!dados.tipo) {
                return { valido: false, erro: 'Tipo do evento é obrigatório' };
            }
            
            // Data obrigatória e válida
            if (!dados.data) {
                return { valido: false, erro: 'Data do evento é obrigatória' };
            }
            
            const dataEvento = new Date(dados.data);
            if (isNaN(dataEvento.getTime())) {
                return { valido: false, erro: 'Data inválida' };
            }
            
            // Validar horários se fornecidos
            if (dados.horarioInicio && dados.horarioFim) {
                const [horaIni, minIni] = dados.horarioInicio.split(':').map(Number);
                const [horaFim, minFim] = dados.horarioFim.split(':').map(Number);
                
                const minutosIni = horaIni * 60 + minIni;
                const minutosFim = horaFim * 60 + minFim;
                
                if (minutosIni >= minutosFim) {
                    return { valido: false, erro: 'Horário de início deve ser anterior ao horário de fim' };
                }
            }
            
            // Validar URL se fornecida
            if (dados.link && !this._validarURL(dados.link)) {
                return { valido: false, erro: 'URL do link é inválida' };
            }
            
            return { valido: true };

        } catch (error) {
            return { valido: false, erro: `Erro na validação: ${error.message}` };
        }
    },

    // ✅ VALIDAR URL
    _validarURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // ✅ OBTER LISTA DE PESSOAS
    _obterListaPessoas() {
        try {
            if (!App.dados?.areas) {
                return ['Usuário Padrão'];
            }
            
            const pessoas = new Set();
            
            Object.values(App.dados.areas).forEach(area => {
                if (area.equipe && Array.isArray(area.equipe)) {
                    area.equipe.forEach(membro => {
                        if (membro.nome) {
                            pessoas.add(membro.nome);
                        }
                    });
                }
            });
            
            return Array.from(pessoas).sort();

        } catch (error) {
            console.error('❌ Erro ao obter lista de pessoas:', error);
            return ['Usuário Padrão'];
        }
    },

    // ✅ CALCULAR ESTATÍSTICAS
    _calcularEstatisticas() {
        try {
            if (!App.dados?.eventos) {
                this.state.estatisticas = {
                    total: 0,
                    porTipo: {},
                    eventosPassados: 0,
                    eventosFuturos: 0,
                    proximoEvento: null
                };
                return;
            }
            
            const eventos = App.dados.eventos;
            const hoje = new Date().toISOString().split('T')[0];
            
            const stats = {
                total: eventos.length,
                porTipo: {},
                eventosPassados: 0,
                eventosFuturos: 0,
                proximoEvento: null
            };
            
            // Contar por tipo
            eventos.forEach(evento => {
                stats.porTipo[evento.tipo] = (stats.porTipo[evento.tipo] || 0) + 1;
                
                if (evento.data < hoje) {
                    stats.eventosPassados++;
                } else if (evento.data >= hoje) {
                    stats.eventosFuturos++;
                }
            });
            
            // Próximo evento
            const proximos = this.obterProximosEventos(1);
            if (proximos.length > 0) {
                stats.proximoEvento = proximos[0];
            }
            
            this.state.estatisticas = stats;

        } catch (error) {
            console.error('❌ Erro ao calcular estatísticas:', error);
        }
    },

    // ✅ GERAR CSV
    _gerarCSV(eventos) {
        try {
            const headers = ['ID', 'Título', 'Tipo', 'Status', 'Data', 'Horário Início', 'Horário Fim', 'Participantes', 'Local', 'Descrição'];
            
            const rows = eventos.map(evento => [
                evento.id,
                evento.titulo,
                evento.tipo,
                evento.status || 'agendado',
                evento.data,
                evento.horarioInicio || '',
                evento.horarioFim || '',
                evento.pessoas?.join('; ') || '',
                evento.local || '',
                evento.descricao || ''
            ]);
            
            const csvContent = [headers, ...rows]
                .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
                .join('\n');
            
            return csvContent;

        } catch (error) {
            console.error('❌ Erro ao gerar CSV:', error);
            return '';
        }
    }
};

// ✅ FUNÇÃO GLOBAL PARA DEBUG
window.Events_Debug = {
    status: () => Events.obterStatus(),
    estatisticas: () => Events.obterEstatisticas(),
    buscar: (termo) => Events.buscarEventos(termo),
    criarTeste: () => {
        const hoje = new Date().toISOString().split('T')[0];
        Events.mostrarNovoEvento(hoje);
    }
};

console.log('📅 Sistema de Gestão de Eventos v6.3.0 carregado!');
console.log('🎯 Funcionalidades: CRUD completo, Modal responsivo, Integração Calendar.js');
console.log('✅ Integração: App.dados, Calendar.gerar(), Notifications, Persistence');
console.log('🧪 Debug: Events_Debug.status(), Events_Debug.criarTeste()');
