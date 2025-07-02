/**
 * 📄 Sistema de Geração de PDFs v6.2 - MODULAR CORRIGIDO
 * 
 * Funcionalidades:
 * ✅ PDF do Calendário Mensal (visual, filtros, escolha de mês)
 * ✅ PDF da Agenda Semanal Individual (horários, descrições, durações)
 * ✅ Modais de configuração intuitivos
 * ✅ Integração total com Calendar.js e Tasks.js
 * ✅ Visual organizado e "bonitinho" 
 * ✅ Orientação paisagem
 * ✅ Cabeçalho profissional
 * ✅ Títulos completos garantidos
 * ✅ CORREÇÕES: Emojis removidos para compatibilidade jsPDF
 */

const PDF = {
    // ✅ CONFIGURAÇÕES
    config: {
        ORIENTACAO: 'landscape',
        FORMATO: 'a4',
        MARGEM: 20,
        FONTE_TITULO: 16,
        FONTE_SUBTITULO: 12,
        FONTE_TEXTO: 10,
        CORES: {
            CABECALHO: '#1f2937',
            EVENTO_REUNIAO: '#3b82f6',
            EVENTO_ENTREGA: '#10b981',
            EVENTO_PRAZO: '#ef4444',
            EVENTO_MARCO: '#8b5cf6',
            EVENTO_OUTRO: '#6b7280',
            TAREFA_PESSOAL: '#f59e0b',
            TAREFA_EQUIPE: '#06b6d4',
            TAREFA_PROJETO: '#8b5cf6',
            FERIADO: '#facc15',
            GRID: '#e5e7eb',
            TEXTO: '#374151'
        },
        DIMENSOES_PAISAGEM: {
            LARGURA: 297,
            ALTURA: 210,
            GRID_LARGURA: 257,  // 297 - 40 (margens)
            GRID_ALTURA: 130    // Espaço para grid do calendário
        }
    },

    // ✅ ESTADO INTERNO
    state: {
        pdfAtivo: null,
        modalAberto: false,
        tipoModal: null, // 'calendario' ou 'agenda'
        opcoesSelecionadas: {}
    },

    // ✅ GERAR PDF DO CALENDÁRIO MENSAL
    gerarCalendarioMensal(opcoes = {}) {
        try {
            console.log('📄 Iniciando geração de PDF do calendário...', opcoes);
            
            // Validar dependências
            if (!this._validarDependencias()) {
                Notifications.error('Sistema PDF não disponível');
                return;
            }

            // Opções padrão
            const config = {
                mes: opcoes.mes || (new Date().getMonth() + 1),
                ano: opcoes.ano || new Date().getFullYear(),
                filtros: opcoes.filtros || {},
                incluirFeriados: opcoes.incluirFeriados !== false,
                incluirEventos: opcoes.incluirEventos !== false,
                incluirTarefas: opcoes.incluirTarefas !== false,
                ...opcoes
            };

            // Criar PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: this.config.ORIENTACAO,
                unit: 'mm',
                format: this.config.FORMATO
            });

            this.state.pdfAtivo = pdf;

            // Gerar conteúdo
            this._adicionarCabecalhoCalendario(pdf, config);
            this._gerarGridCalendario(pdf, config);
            this._adicionarLegendaCalendario(pdf);

            // Salvar arquivo
            const nomeArquivo = `calendario_${config.mes.toString().padStart(2, '0')}_${config.ano}.pdf`;
            pdf.save(nomeArquivo);

            console.log('✅ PDF do calendário gerado:', nomeArquivo);
            Notifications.success(`PDF do calendário salvo: ${nomeArquivo}`);

            return true;

        } catch (error) {
            console.error('❌ Erro ao gerar PDF do calendário:', error);
            Notifications.error(`Erro ao gerar PDF: ${error.message}`);
            return false;
        }
    },

    // ✅ GERAR PDF DA AGENDA SEMANAL
    gerarAgendaSemanal(opcoes = {}) {
        try {
            console.log('📋 Iniciando geração de PDF da agenda semanal...', opcoes);
            
            // Validar dependências
            if (!this._validarDependencias()) {
                Notifications.error('Sistema PDF não disponível');
                return;
            }

            // Validar pessoa
            if (!opcoes.pessoa) {
                Notifications.error('Pessoa não selecionada para agenda');
                return;
            }

            // Opções padrão
            const config = {
                pessoa: opcoes.pessoa,
                dataInicio: opcoes.dataInicio || this._obterInicioSemana(new Date()),
                incluirDescricoes: opcoes.incluirDescricoes !== false,
                incluirDuracoes: opcoes.incluirDuracoes !== false,
                apenasAgendaSemanal: opcoes.apenasAgendaSemanal !== false,
                ...opcoes
            };

            // Criar PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: this.config.ORIENTACAO,
                unit: 'mm',
                format: this.config.FORMATO
            });

            this.state.pdfAtivo = pdf;

            // Gerar conteúdo
            this._adicionarCabecalhoAgenda(pdf, config);
            this._gerarGridAgendaSemanal(pdf, config);

            // Salvar arquivo
            const dataFormatada = new Date(config.dataInicio).toLocaleDateString('pt-BR').replace(/\//g, '-');
            const nomeArquivo = `agenda_semanal_${Helpers.toSlug(config.pessoa)}_${dataFormatada}.pdf`;
            pdf.save(nomeArquivo);

            console.log('✅ PDF da agenda semanal gerado:', nomeArquivo);
            Notifications.success(`Agenda semanal salva: ${nomeArquivo}`);

            return true;

        } catch (error) {
            console.error('❌ Erro ao gerar PDF da agenda:', error);
            Notifications.error(`Erro ao gerar agenda: ${error.message}`);
            return false;
        }
    },

    // ✅ MODAL DE CONFIGURAÇÃO DO CALENDÁRIO
    mostrarModalCalendario() {
        try {
            // Verificar se modal já existe
            if (document.getElementById('modalPdfCalendario')) {
                return;
            }

            this.state.modalAberto = true;
            this.state.tipoModal = 'calendario';

            const modal = document.createElement('div');
            modal.id = 'modalPdfCalendario';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Gerar PDF do Calendario</h3>
                        <button class="modal-close" onclick="PDF.fecharModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Seleção de Mês/Ano -->
                        <div class="form-group">
                            <label>Mes e Ano:</label>
                            <div style="display: flex; gap: 12px;">
                                <select id="pdfCalendarioMes" style="flex: 2;">
                                    <option value="1">Janeiro</option>
                                    <option value="2">Fevereiro</option>
                                    <option value="3">Marco</option>
                                    <option value="4">Abril</option>
                                    <option value="5">Maio</option>
                                    <option value="6">Junho</option>
                                    <option value="7">Julho</option>
                                    <option value="8">Agosto</option>
                                    <option value="9">Setembro</option>
                                    <option value="10">Outubro</option>
                                    <option value="11">Novembro</option>
                                    <option value="12">Dezembro</option>
                                </select>
                                <input type="number" id="pdfCalendarioAno" placeholder="2025" min="2020" max="2030" style="flex: 1;" value="${new Date().getFullYear()}">
                            </div>
                        </div>

                        <!-- Filtros de Conteúdo -->
                        <div class="form-group">
                            <label>Incluir no PDF:</label>
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="pdfIncluirEventos" checked>
                                    Eventos (Reunioes, Entregas, Prazos, Marcos)
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="pdfIncluirTarefas" checked>
                                    Tarefas da Agenda Semanal
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="pdfIncluirFeriados" checked>
                                    Feriados
                                </label>
                            </div>
                        </div>

                        <!-- Filtros de Tipo -->
                        <div class="form-group">
                            <label>Filtrar por Tipo de Evento:</label>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                                <label style="display: flex; align-items: center; gap: 4px;">
                                    <input type="checkbox" id="pdfFiltroReuniao" checked>
                                    Reuniao
                                </label>
                                <label style="display: flex; align-items: center; gap: 4px;">
                                    <input type="checkbox" id="pdfFiltroEntrega" checked>
                                    Entrega
                                </label>
                                <label style="display: flex; align-items: center; gap: 4px;">
                                    <input type="checkbox" id="pdfFiltroPrazo" checked>
                                    Prazo
                                </label>
                                <label style="display: flex; align-items: center; gap: 4px;">
                                    <input type="checkbox" id="pdfFiltroMarco" checked>
                                    Marco
                                </label>
                            </div>
                        </div>

                        <!-- Filtro por Pessoa -->
                        <div class="form-group">
                            <label>Filtrar por Pessoa (opcional):</label>
                            <select id="pdfFiltroPessoa">
                                <option value="">Todas as pessoas</option>
                                ${this._obterListaPessoas().map(pessoa => 
                                    `<option value="${pessoa}">${pessoa}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="PDF.fecharModal()">
                            Cancelar
                        </button>
                        <button class="btn btn-primary" onclick="PDF.confirmarCalendario()">
                            Gerar PDF
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Definir mês atual como selecionado
            const mesAtual = new Date().getMonth() + 1;
            document.getElementById('pdfCalendarioMes').value = mesAtual;

            // Exibir modal
            setTimeout(() => modal.classList.add('show'), 10);

            console.log('📄 Modal de configuração do calendário aberto');

        } catch (error) {
            console.error('❌ Erro ao abrir modal do calendário:', error);
            Notifications.error('Erro ao abrir configurações do PDF');
        }
    },

    // ✅ MODAL DE CONFIGURAÇÃO DA AGENDA SEMANAL
    mostrarModalAgenda() {
        try {
            // Verificar se modal já existe
            if (document.getElementById('modalPdfAgenda')) {
                return;
            }

            this.state.modalAberto = true;
            this.state.tipoModal = 'agenda';

            const modal = document.createElement('div');
            modal.id = 'modalPdfAgenda';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Gerar Agenda Semanal PDF</h3>
                        <button class="modal-close" onclick="PDF.fecharModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Seleção de Pessoa -->
                        <div class="form-group">
                            <label>Pessoa:</label>
                            <select id="pdfAgendaPessoa" required>
                                <option value="">Selecione uma pessoa</option>
                                ${this._obterListaPessoas().map(pessoa => 
                                    `<option value="${pessoa}">${pessoa}</option>`
                                ).join('')}
                            </select>
                        </div>

                        <!-- Seleção de Semana -->
                        <div class="form-group">
                            <label>Semana (Data de Inicio - Segunda-feira):</label>
                            <input type="date" id="pdfAgendaData" value="${this._obterInicioSemana(new Date())}">
                            <small style="color: #6b7280; font-size: 12px;">
                                Selecione qualquer dia da semana - o sistema ajustara para a segunda-feira
                            </small>
                        </div>

                        <!-- Opções de Conteúdo -->
                        <div class="form-group">
                            <label>Incluir na Agenda:</label>
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="pdfAgendaDescricoes" checked>
                                    Descricoes das tarefas
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="pdfAgendaDuracoes" checked>
                                    Duracoes dos horarios
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="pdfAgendaApenasRecorrente" checked>
                                    Apenas tarefas da agenda semanal (recorrentes)
                                </label>
                            </div>
                        </div>

                        <!-- Preview -->
                        <div id="pdfAgendaPreview" style="
                            margin-top: 16px; 
                            padding: 12px; 
                            background: #f9fafb; 
                            border-radius: 6px; 
                            border: 1px solid #e5e7eb;
                            font-size: 12px;
                            color: #6b7280;
                        ">
                            Preview: Selecione uma pessoa para ver quantas tarefas serao incluidas
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="PDF.fecharModal()">
                            Cancelar
                        </button>
                        <button class="btn btn-primary" onclick="PDF.confirmarAgenda()">
                            Gerar Agenda PDF
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Adicionar listeners
            document.getElementById('pdfAgendaPessoa').addEventListener('change', () => {
                this._atualizarPreviewAgenda();
            });

            document.getElementById('pdfAgendaData').addEventListener('change', () => {
                this._atualizarPreviewAgenda();
            });

            // Exibir modal
            setTimeout(() => modal.classList.add('show'), 10);

            console.log('📋 Modal de configuração da agenda aberto');

        } catch (error) {
            console.error('❌ Erro ao abrir modal da agenda:', error);
            Notifications.error('Erro ao abrir configurações da agenda');
        }
    },

    // ✅ CONFIRMAR GERAÇÃO DO CALENDÁRIO
    confirmarCalendario() {
        try {
            const mes = parseInt(document.getElementById('pdfCalendarioMes').value);
            const ano = parseInt(document.getElementById('pdfCalendarioAno').value);
            
            if (!mes || !ano || ano < 2020 || ano > 2030) {
                Notifications.error('Por favor, selecione um mês e ano válidos');
                return;
            }

            const opcoes = {
                mes,
                ano,
                incluirEventos: document.getElementById('pdfIncluirEventos').checked,
                incluirTarefas: document.getElementById('pdfIncluirTarefas').checked,
                incluirFeriados: document.getElementById('pdfIncluirFeriados').checked,
                filtros: {
                    tipos: [],
                    pessoa: document.getElementById('pdfFiltroPessoa').value || null
                }
            };

            // Coletar filtros de tipo
            if (document.getElementById('pdfFiltroReuniao').checked) opcoes.filtros.tipos.push('reuniao');
            if (document.getElementById('pdfFiltroEntrega').checked) opcoes.filtros.tipos.push('entrega');
            if (document.getElementById('pdfFiltroPrazo').checked) opcoes.filtros.tipos.push('prazo');
            if (document.getElementById('pdfFiltroMarco').checked) opcoes.filtros.tipos.push('marco');

            this.fecharModal();
            
            Notifications.info('Gerando PDF do calendario...');
            
            setTimeout(() => {
                this.gerarCalendarioMensal(opcoes);
            }, 500);

        } catch (error) {
            console.error('❌ Erro ao confirmar calendário:', error);
            Notifications.error('Erro ao processar configurações');
        }
    },

    // ✅ CONFIRMAR GERAÇÃO DA AGENDA
    confirmarAgenda() {
        try {
            const pessoa = document.getElementById('pdfAgendaPessoa').value;
            const data = document.getElementById('pdfAgendaData').value;
            
            if (!pessoa) {
                Notifications.error('Por favor, selecione uma pessoa');
                return;
            }

            if (!data) {
                Notifications.error('Por favor, selecione uma data');
                return;
            }

            const opcoes = {
                pessoa,
                dataInicio: this._obterInicioSemana(new Date(data)),
                incluirDescricoes: document.getElementById('pdfAgendaDescricoes').checked,
                incluirDuracoes: document.getElementById('pdfAgendaDuracoes').checked,
                apenasAgendaSemanal: document.getElementById('pdfAgendaApenasRecorrente').checked
            };

            this.fecharModal();
            
            Notifications.info('Gerando agenda semanal em PDF...');
            
            setTimeout(() => {
                this.gerarAgendaSemanal(opcoes);
            }, 500);

        } catch (error) {
            console.error('❌ Erro ao confirmar agenda:', error);
            Notifications.error('Erro ao processar configurações da agenda');
        }
    },

    // ✅ FECHAR MODAL
    fecharModal() {
        try {
            const modals = [
                document.getElementById('modalPdfCalendario'),
                document.getElementById('modalPdfAgenda')
            ];

            modals.forEach(modal => {
                if (modal) {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        if (modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    }, 300);
                }
            });

            this.state.modalAberto = false;
            this.state.tipoModal = null;

        } catch (error) {
            console.error('❌ Erro ao fechar modal:', error);
        }
    },

    // ✅ OBTER STATUS DO SISTEMA
    obterStatus() {
        return {
            moduloCarregado: typeof window.jspdf !== 'undefined',
            modalAberto: this.state.modalAberto,
            tipoModal: this.state.tipoModal,
            pdfAtivo: this.state.pdfAtivo !== null,
            dependenciasOk: this._validarDependencias(),
            pessoasDisponiveis: this._obterListaPessoas().length,
            eventosCarregados: App.dados?.eventos?.length || 0,
            tarefasCarregadas: App.dados?.tarefas?.length || 0
        };
    },

    // ✅ === MÉTODOS PRIVADOS ===

    // Validar dependências necessárias
    _validarDependencias() {
        return (
            typeof window.jspdf !== 'undefined' &&
            typeof App !== 'undefined' &&
            App.dados &&
            typeof Helpers !== 'undefined' &&
            typeof Notifications !== 'undefined'
        );
    },

    // Obter lista de pessoas do sistema
    _obterListaPessoas() {
        try {
            if (!App.dados) return [];
            
            const pessoas = new Set();
            
            // Pessoas das áreas
            if (App.dados.areas) {
                Object.values(App.dados.areas).forEach(area => {
                    if (area.pessoas) {
                        area.pessoas.forEach(pessoa => pessoas.add(pessoa));
                    }
                });
            }

            // Pessoas dos eventos
            if (App.dados.eventos) {
                App.dados.eventos.forEach(evento => {
                    if (evento.pessoas) {
                        evento.pessoas.forEach(pessoa => pessoas.add(pessoa));
                    }
                });
            }

            // Pessoas das tarefas
            if (App.dados.tarefas) {
                App.dados.tarefas.forEach(tarefa => {
                    if (tarefa.responsavel) {
                        pessoas.add(tarefa.responsavel);
                    }
                });
            }

            // Pessoa atual
            if (App.pessoaAtual) {
                pessoas.add(App.pessoaAtual);
            }

            return Array.from(pessoas).sort();

        } catch (error) {
            console.error('❌ Erro ao obter lista de pessoas:', error);
            return [];
        }
    },

    // Obter início da semana (segunda-feira)
    _obterInicioSemana(data) {
        const d = new Date(data);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
    },

    // ✅ CABEÇALHO DO CALENDÁRIO (SEM EMOJIS)
    _adicionarCabecalhoCalendario(pdf, config) {
        const { CORES, FONTE_TITULO, FONTE_SUBTITULO, MARGEM } = this.config;
        
        // Título principal
        pdf.setFontSize(FONTE_TITULO);
        pdf.setTextColor(CORES.CABECALHO);
        pdf.text('CALENDARIO MENSAL', MARGEM, MARGEM + 10);

        // Subtítulo com mês/ano
        const meses = [
            '', 'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const mesNome = meses[config.mes];
        
        pdf.setFontSize(FONTE_SUBTITULO);
        pdf.text(`${mesNome} ${config.ano}`, MARGEM, MARGEM + 20);

        // Informações de geração
        pdf.setFontSize(8);
        pdf.setTextColor('#6b7280');
        const dataGeracao = new Date().toLocaleString('pt-BR');
        pdf.text(`Gerado em: ${dataGeracao}`, MARGEM, MARGEM + 28);

        // Sistema
        pdf.text('Sistema de Gestao - Obra 292 (Museu Nacional)', MARGEM + 150, MARGEM + 28);
    },

    // ✅ CABEÇALHO DA AGENDA (SEM EMOJIS)
    _adicionarCabecalhoAgenda(pdf, config) {
        const { CORES, FONTE_TITULO, FONTE_SUBTITULO, MARGEM } = this.config;
        
        // Título principal
        pdf.setFontSize(FONTE_TITULO);
        pdf.setTextColor(CORES.CABECALHO);
        pdf.text('AGENDA SEMANAL', MARGEM, MARGEM + 10);

        // Subtítulo com pessoa e período
        const dataInicio = new Date(config.dataInicio);
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataInicio.getDate() + 6);
        
        pdf.setFontSize(FONTE_SUBTITULO);
        pdf.text(`${config.pessoa}`, MARGEM, MARGEM + 20);
        pdf.text(`${dataInicio.toLocaleDateString('pt-BR')} - ${dataFim.toLocaleDateString('pt-BR')}`, MARGEM, MARGEM + 28);

        // Informações de geração
        pdf.setFontSize(8);
        pdf.setTextColor('#6b7280');
        const dataGeracao = new Date().toLocaleString('pt-BR');
        pdf.text(`Gerado em: ${dataGeracao}`, MARGEM, MARGEM + 36);

        // Sistema
        pdf.text('Sistema de Gestao - Obra 292 (Museu Nacional)', MARGEM + 150, MARGEM + 36);
    },

    // Gerar grid do calendário
    _gerarGridCalendario(pdf, config) {
        const { MARGEM, DIMENSOES_PAISAGEM, CORES } = this.config;
        
        const inicioY = MARGEM + 50;
        const larguraCelula = DIMENSOES_PAISAGEM.GRID_LARGURA / 7;
        const alturaCelula = 18;

        // Cabeçalho dos dias da semana
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        
        pdf.setFontSize(10);
        pdf.setTextColor(CORES.CABECALHO);
        
        diasSemana.forEach((dia, index) => {
            const x = MARGEM + (index * larguraCelula);
            pdf.rect(x, inicioY, larguraCelula, 12);
            pdf.text(dia, x + larguraCelula/2 - 8, inicioY + 8);
        });

        // Gerar dias do mês
        const primeiroDia = new Date(config.ano, config.mes - 1, 1);
        const ultimoDia = new Date(config.ano, config.mes, 0);
        const diasNoMes = ultimoDia.getDate();
        const iniciaDiaSemana = primeiroDia.getDay();

        let diaAtual = 1;
        let linha = 0;

        while (diaAtual <= diasNoMes) {
            for (let coluna = 0; coluna < 7; coluna++) {
                const x = MARGEM + (coluna * larguraCelula);
                const y = inicioY + 12 + (linha * alturaCelula);

                // Verificar se deve desenhar o dia
                if ((linha === 0 && coluna < iniciaDiaSemana) || diaAtual > diasNoMes) {
                    // Célula vazia
                    pdf.setFillColor('#f9fafb');
                    pdf.rect(x, y, larguraCelula, alturaCelula, 'F');
                    pdf.setDrawColor(CORES.GRID);
                    pdf.rect(x, y, larguraCelula, alturaCelula);
                } else {
                    // Célula com dia
                    const dataCompleta = `${config.ano}-${config.mes.toString().padStart(2, '0')}-${diaAtual.toString().padStart(2, '0')}`;
                    
                    // Verificar se é feriado
                    const ehFeriado = this._verificarFeriado(dataCompleta);
                    
                    if (ehFeriado) {
                        pdf.setFillColor(CORES.FERIADO);
                        pdf.rect(x, y, larguraCelula, alturaCelula, 'F');
                    }

                    // Desenhar borda
                    pdf.setDrawColor(CORES.GRID);
                    pdf.rect(x, y, larguraCelula, alturaCelula);

                    // Número do dia
                    pdf.setFontSize(10);
                    pdf.setTextColor(CORES.TEXTO);
                    pdf.text(diaAtual.toString(), x + 2, y + 10);

                    // Adicionar eventos/tarefas do dia
                    this._adicionarEventosDoDia(pdf, x, y + 12, larguraCelula, dataCompleta, config);

                    diaAtual++;
                }
            }
            linha++;
        }
    },

    // Gerar grid da agenda semanal
    _gerarGridAgendaSemanal(pdf, config) {
        const { MARGEM, DIMENSOES_PAISAGEM, CORES } = this.config;
        
        const inicioY = MARGEM + 60;
        const larguraColuna = DIMENSOES_PAISAGEM.GRID_LARGURA / 7;
        const alturaLinha = 6;

        // Cabeçalho dos dias
        const diasSemana = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
        
        pdf.setFontSize(10);
        pdf.setTextColor(CORES.CABECALHO);
        
        for (let i = 0; i < 7; i++) {
            const x = MARGEM + (i * larguraColuna);
            const dataColuna = new Date(config.dataInicio);
            dataColuna.setDate(dataColuna.getDate() + i);
            
            // Cabeçalho da coluna
            pdf.setFillColor('#f3f4f6');
            pdf.rect(x, inicioY, larguraColuna, 15, 'F');
            pdf.setDrawColor(CORES.GRID);
            pdf.rect(x, inicioY, larguraColuna, 15);
            
            // Nome do dia
            pdf.setFontSize(9);
            pdf.text(diasSemana[i], x + 2, inicioY + 8);
            
            // Data
            pdf.setFontSize(8);
            pdf.text(dataColuna.toLocaleDateString('pt-BR'), x + 2, inicioY + 13);
            
            // Adicionar tarefas da agenda semanal
            this._adicionarTarefasDoDia(pdf, x, inicioY + 15, larguraColuna, i, config);
        }
    },

    // Verificar se data é feriado
    _verificarFeriado(data) {
        try {
            return App.dados?.feriados?.[data] || false;
        } catch {
            return false;
        }
    },

    // ✅ ADICIONAR EVENTOS DO DIA (SEM EMOJIS)
    _adicionarEventosDoDia(pdf, x, y, largura, data, config) {
        try {
            const eventos = this._obterEventosDoDia(data, config);
            const tarefas = this._obterTarefasDoDia(data, config);
            
            let posY = y;
            const alturaItem = 4;
            const maxItens = 3;
            
            pdf.setFontSize(6);
            
            // Adicionar eventos
            let contador = 0;
            eventos.slice(0, maxItens).forEach(evento => {
                if (contador >= maxItens) return;
                
                const cor = this._obterCorTipo(evento.tipo, 'evento');
                pdf.setTextColor(cor);
                
                const titulo = this._truncarTexto(evento.titulo, 15);
                pdf.text(titulo, x + 1, posY);
                posY += alturaItem;
                contador++;
            });
            
            // Adicionar tarefas se houver espaço
            tarefas.slice(0, maxItens - contador).forEach(tarefa => {
                if (contador >= maxItens) return;
                
                const cor = this._obterCorTipo(tarefa.tipo, 'tarefa');
                pdf.setTextColor(cor);
                
                const titulo = this._truncarTexto(tarefa.titulo, 15);
                pdf.text(`- ${titulo}`, x + 1, posY);
                posY += alturaItem;
                contador++;
            });
            
            // Indicador de mais itens
            const total = eventos.length + tarefas.length;
            if (total > maxItens) {
                pdf.setTextColor('#6b7280');
                pdf.text(`+${total - maxItens} mais`, x + 1, posY);
            }
            
        } catch (error) {
            console.error('❌ Erro ao adicionar eventos do dia:', error);
        }
    },

    // Adicionar tarefas do dia na agenda semanal
    _adicionarTarefasDoDia(pdf, x, y, largura, diaSemana, config) {
        try {
            const tarefas = this._obterTarefasAgendaSemanal(config.pessoa, diaSemana, config);
            
            let posY = y + 5;
            const alturaItem = 8;
            
            pdf.setFontSize(7);
            
            tarefas.forEach(tarefa => {
                // Horário
                if (tarefa.horario && config.incluirDuracoes) {
                    pdf.setTextColor('#374151');
                    const horarioFim = this._calcularHorarioFim(tarefa.horario, tarefa.duracao);
                    pdf.text(`${tarefa.horario}-${horarioFim}`, x + 2, posY);
                    posY += 4;
                } else if (tarefa.horario) {
                    pdf.setTextColor('#374151');
                    pdf.text(tarefa.horario, x + 2, posY);
                    posY += 4;
                }
                
                // Título
                const cor = this._obterCorTipo(tarefa.tipo, 'tarefa');
                pdf.setTextColor(cor);
                const titulo = this._quebrarTexto(tarefa.titulo, largura - 4, pdf);
                titulo.forEach(linha => {
                    pdf.text(linha, x + 2, posY);
                    posY += 3;
                });
                
                // Descrição (se habilitada)
                if (config.incluirDescricoes && tarefa.descricao) {
                    pdf.setTextColor('#6b7280');
                    pdf.setFontSize(6);
                    const descricao = this._quebrarTexto(tarefa.descricao, largura - 4, pdf);
                    descricao.slice(0, 2).forEach(linha => { // Máximo 2 linhas
                        pdf.text(linha, x + 2, posY);
                        posY += 3;
                    });
                    pdf.setFontSize(7);
                }
                
                posY += 3; // Espaço entre tarefas
            });
            
        } catch (error) {
            console.error('❌ Erro ao adicionar tarefas do dia:', error);
        }
    },

    // ✅ LEGENDA DO CALENDÁRIO (SEM EMOJIS) - BUG CORRIGIDO
    _adicionarLegendaCalendario(pdf) {
        const { MARGEM, CORES } = this.config;
        let y = 180; // ← CORREÇÃO: const para let
        
        pdf.setFontSize(8);
        pdf.setTextColor(CORES.TEXTO);
        pdf.text('Legenda:', MARGEM, y);
        
        const itens = [
            { cor: CORES.EVENTO_REUNIAO, texto: '• Reuniao' },
            { cor: CORES.EVENTO_ENTREGA, texto: '• Entrega' },
            { cor: CORES.EVENTO_PRAZO, texto: '• Prazo' },
            { cor: CORES.EVENTO_MARCO, texto: '• Marco' },
            { cor: CORES.TAREFA_PESSOAL, texto: '• Tarefa Pessoal' },
            { cor: CORES.TAREFA_EQUIPE, texto: '• Tarefa Equipe' }
        ];
        
        let x = MARGEM + 40;
        itens.forEach((item, index) => {
            if (index > 0 && index % 3 === 0) {
                x = MARGEM + 40;
                y += 8; // ← Agora funciona porque y é let
            }
            
            pdf.setFillColor(item.cor);
            pdf.rect(x, y - 3, 3, 3, 'F');
            pdf.setTextColor(CORES.TEXTO);
            pdf.text(item.texto, x + 8, y);
            x += 60;
        });
    },

    // Obter eventos do dia com filtros
    _obterEventosDoDia(data, config) {
        try {
            if (!config.incluirEventos || !App.dados?.eventos) return [];
            
            return App.dados.eventos.filter(evento => {
                // Filtro de data
                if (evento.data !== data) return false;
                
                // Filtro de tipo
                if (config.filtros.tipos.length > 0 && !config.filtros.tipos.includes(evento.tipo)) {
                    return false;
                }
                
                // Filtro de pessoa
                if (config.filtros.pessoa && evento.pessoas && !evento.pessoas.includes(config.filtros.pessoa)) {
                    return false;
                }
                
                return true;
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter eventos do dia:', error);
            return [];
        }
    },

    // Obter tarefas do dia
    _obterTarefasDoDia(data, config) {
        try {
            if (!config.incluirTarefas || !App.dados?.tarefas) return [];
            
            return App.dados.tarefas.filter(tarefa => {
                // Verificar se tarefa é deste dia
                if (tarefa.dataInicio === data || tarefa.dataFim === data) {
                    // Filtro de pessoa
                    if (config.filtros.pessoa && tarefa.responsavel !== config.filtros.pessoa) {
                        return false;
                    }
                    return true;
                }
                
                return false;
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter tarefas do dia:', error);
            return [];
        }
    },

    // Obter tarefas da agenda semanal
    _obterTarefasAgendaSemanal(pessoa, diaSemana, config) {
        try {
            if (!App.dados?.tarefas) return [];
            
            const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
            const diaString = diasSemana[diaSemana];
            
            return App.dados.tarefas.filter(tarefa => {
                // Verificar se é da agenda semanal
                if (!tarefa.agendaSemanal) {
                    return !config.apenasAgendaSemanal;
                }
                
                // Verificar pessoa
                if (tarefa.responsavel !== pessoa) return false;
                
                // Verificar dia da semana
                if (tarefa.diaSemana !== diaString) return false;
                
                return true;
            }).sort((a, b) => {
                // Ordenar por horário
                if (a.horario && b.horario) {
                    return a.horario.localeCompare(b.horario);
                }
                return 0;
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter tarefas da agenda semanal:', error);
            return [];
        }
    },

    // Atualizar preview da agenda
    _atualizarPreviewAgenda() {
        try {
            const pessoa = document.getElementById('pdfAgendaPessoa').value;
            const data = document.getElementById('pdfAgendaData').value;
            const preview = document.getElementById('pdfAgendaPreview');
            
            if (!pessoa || !data || !preview) return;
            
            const dataInicio = this._obterInicioSemana(new Date(data));
            let totalTarefas = 0;
            
            // Contar tarefas por dia
            for (let i = 0; i < 7; i++) {
                const tarefasDia = this._obterTarefasAgendaSemanal(pessoa, i, { apenasAgendaSemanal: true });
                totalTarefas += tarefasDia.length;
            }
            
            const dataInicioFormatada = new Date(dataInicio).toLocaleDateString('pt-BR');
            const dataFimFormatada = new Date(new Date(dataInicio).setDate(new Date(dataInicio).getDate() + 6)).toLocaleDateString('pt-BR');
            
            preview.innerHTML = `
                <strong>Preview:</strong><br>
                Pessoa: ${pessoa}<br>
                Semana: ${dataInicioFormatada} - ${dataFimFormatada}<br>
                Total de tarefas: ${totalTarefas}<br>
                ${totalTarefas === 0 ? 'Nenhuma tarefa encontrada para esta pessoa/semana' : 'Agenda pronta para gerar PDF'}
            `;
            
        } catch (error) {
            console.error('❌ Erro ao atualizar preview:', error);
        }
    },

    // Obter cor por tipo
    _obterCorTipo(tipo, categoria) {
        const { CORES } = this.config;
        
        if (categoria === 'evento') {
            switch (tipo) {
                case 'reuniao': return CORES.EVENTO_REUNIAO;
                case 'entrega': return CORES.EVENTO_ENTREGA;
                case 'prazo': return CORES.EVENTO_PRAZO;
                case 'marco': return CORES.EVENTO_MARCO;
                default: return CORES.EVENTO_OUTRO;
            }
        } else if (categoria === 'tarefa') {
            switch (tipo) {
                case 'pessoal': return CORES.TAREFA_PESSOAL;
                case 'equipe': return CORES.TAREFA_EQUIPE;
                case 'projeto': return CORES.TAREFA_PROJETO;
                default: return CORES.EVENTO_OUTRO;
            }
        }
        
        return CORES.TEXTO;
    },

    // Truncar texto
    _truncarTexto(texto, maxLength) {
        if (!texto) return '';
        return texto.length > maxLength ? texto.substring(0, maxLength - 3) + '...' : texto;
    },

    // Quebrar texto em múltiplas linhas
    _quebrarTexto(texto, larguraMaxima, pdf) {
        if (!texto) return [''];
        
        const palavras = texto.split(' ');
        const linhas = [];
        let linhaAtual = '';
        
        palavras.forEach(palavra => {
            const testeLinhas = linhaAtual ? `${linhaAtual} ${palavra}` : palavra;
            const larguraTexto = pdf.getTextWidth(testeLinhas);
            
            if (larguraTexto <= larguraMaxima) {
                linhaAtual = testeLinhas;
            } else {
                if (linhaAtual) {
                    linhas.push(linhaAtual);
                    linhaAtual = palavra;
                } else {
                    linhas.push(palavra);
                }
            }
        });
        
        if (linhaAtual) {
            linhas.push(linhaAtual);
        }
        
        return linhas;
    },

    // Calcular horário fim
    _calcularHorarioFim(horarioInicio, duracao) {
        try {
            if (!horarioInicio || !duracao) return '';
            
            const [horas, minutos] = horarioInicio.split(':').map(Number);
            const totalMinutos = horas * 60 + minutos + parseInt(duracao);
            
            const horasFim = Math.floor(totalMinutos / 60);
            const minutosFim = totalMinutos % 60;
            
            return `${horasFim.toString().padStart(2, '0')}:${minutosFim.toString().padStart(2, '0')}`;
            
        } catch (error) {
            return '';
        }
    }
};

// ✅ INICIALIZAÇÃO DO MÓDULO
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Sistema de Geração de PDFs v6.2 carregado!');
    
    // Verificar dependências
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF não encontrado - funcionalidade PDF limitada');
    }
    
    // Adicionar event listeners para ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && PDF.state.modalAberto) {
            PDF.fecharModal();
        }
    });
});

// ✅ LOG DE CARREGAMENTO
console.log('📄 Sistema de Geração de PDFs v6.2 carregado!');
console.log('🎯 Funcionalidades: Calendário Mensal + Agenda Semanal');
console.log('🎨 Visual organizado e profissional');
console.log('⚙️ Integração total com Calendar.js e Tasks.js');
console.log('✅ CORRIGIDO: Emojis removidos para compatibilidade jsPDF');
