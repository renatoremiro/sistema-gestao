/**
 * 📄 MODAIS PDF COMPLETOS E FUNCIONAIS
 * 
 * SUBSTITUIR estas funções no arquivo assets/js/modules/pdf.js
 * Procurar pelas funções com nomes iguais e substituir completamente
 */

// ✅ MODAL DE CALENDÁRIO COMPLETO
_criarModalCalendarioHTML() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    // Obter lista de pessoas para filtros
    const pessoas = this._obterListaPessoas();
    
    const modal = document.createElement('div');
    modal.id = 'modalPdfCalendario';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>📄 Gerar PDF do Calendário</h3>
                <button class="modal-close" onclick="PDF.fecharModal()">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Período -->
                <div class="form-section" style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #1f2937;">📅 Período</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>Mês:</label>
                            <select id="pdfCalendarioMes">
                                <option value="1" ${mesAtual === 1 ? 'selected' : ''}>Janeiro</option>
                                <option value="2" ${mesAtual === 2 ? 'selected' : ''}>Fevereiro</option>
                                <option value="3" ${mesAtual === 3 ? 'selected' : ''}>Março</option>
                                <option value="4" ${mesAtual === 4 ? 'selected' : ''}>Abril</option>
                                <option value="5" ${mesAtual === 5 ? 'selected' : ''}>Maio</option>
                                <option value="6" ${mesAtual === 6 ? 'selected' : ''}>Junho</option>
                                <option value="7" ${mesAtual === 7 ? 'selected' : ''}>Julho</option>
                                <option value="8" ${mesAtual === 8 ? 'selected' : ''}>Agosto</option>
                                <option value="9" ${mesAtual === 9 ? 'selected' : ''}>Setembro</option>
                                <option value="10" ${mesAtual === 10 ? 'selected' : ''}>Outubro</option>
                                <option value="11" ${mesAtual === 11 ? 'selected' : ''}>Novembro</option>
                                <option value="12" ${mesAtual === 12 ? 'selected' : ''}>Dezembro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Ano:</label>
                            <select id="pdfCalendarioAno">
                                <option value="2024" ${anoAtual === 2024 ? 'selected' : ''}>2024</option>
                                <option value="2025" ${anoAtual === 2025 ? 'selected' : ''}>2025</option>
                                <option value="2026" ${anoAtual === 2026 ? 'selected' : ''}>2026</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Conteúdo -->
                <div class="form-section" style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #1f2937;">📋 Conteúdo</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="pdfIncluirEventos" checked>
                            📅 Incluir Eventos
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="pdfIncluirTarefas" checked>
                            📝 Incluir Tarefas
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="pdfIncluirFeriados" checked>
                            🎉 Incluir Feriados
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="pdfMostrarDetalhes" checked>
                            📄 Mostrar Detalhes
                        </label>
                    </div>
                </div>

                <!-- Filtros -->
                <div class="form-section" style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #1f2937;">🔍 Filtros</h4>
                    <div class="form-group">
                        <label>👤 Filtrar por Pessoa:</label>
                        <select id="pdfFiltrarPessoa">
                            <option value="">🔸 Todas as pessoas</option>
                            ${pessoas.map(pessoa => 
                                `<option value="${pessoa}">${pessoa}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>🏷️ Tipos de Eventos:</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 8px;">
                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
                                <input type="checkbox" id="pdfTipoReuniao" checked>
                                📅 Reunião
                            </label>
                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
                                <input type="checkbox" id="pdfTipoEntrega" checked>
                                📦 Entrega
                            </label>
                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
                                <input type="checkbox" id="pdfTipoPrazo" checked>
                                ⏰ Prazo
                            </label>
                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
                                <input type="checkbox" id="pdfTipoMarco" checked>
                                🏁 Marco
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Layout -->
                <div class="form-section">
                    <h4 style="margin: 0 0 12px 0; color: #1f2937;">🎨 Layout</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>📐 Orientação:</label>
                            <select id="pdfOrientacao">
                                <option value="landscape">🖼️ Paisagem (Recomendado)</option>
                                <option value="portrait">📄 Retrato</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>📏 Tamanho:</label>
                            <select id="pdfTamanho">
                                <option value="a4">A4</option>
                                <option value="letter">Carta</option>
                                <option value="legal">Legal</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="PDF.fecharModal()">
                    ❌ Cancelar
                </button>
                <button class="btn btn-primary" onclick="PDF.confirmarCalendario()">
                    📄 Gerar PDF
                </button>
            </div>
        </div>
    `;
    
    return modal;
},

// ✅ MODAL DE AGENDA SEMANAL COMPLETO
_criarModalAgendaHTML() {
    const hoje = new Date();
    const inicioSemana = this._obterInicioSemanaCorrigido(hoje);
    
    // Obter lista de pessoas
    const pessoas = this._obterListaPessoas();
    
    const modal = document.createElement('div');
    modal.id = 'modalPdfAgenda';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>📋 Gerar Agenda Semanal PDF</h3>
                <button class="modal-close" onclick="PDF.fecharModal()">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Pessoa -->
                <div class="form-section" style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #1f2937;">👤 Pessoa</h4>
                    <div class="form-group">
                        <label>Selecione a pessoa:</label>
                        <select id="pdfAgendaPessoa" required>
                            <option value="">🔸 Selecione uma pessoa...</option>
                            ${pessoas.map(pessoa => 
                                `<option value="${pessoa}">${pessoa}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>

                <!-- Período -->
                <div class="form-section" style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #1f2937;">📅 Semana</h4>
                    <div class="form-group">
                        <label>Início da semana (Segunda-feira):</label>
                        <input type="date" id="pdfAgendaDataInicio" value="${inicioSemana}">
                    </div>
                    <p style="font-size: 12px; color: #6b7280; margin: 8px 0 0 0;">
                        💡 A agenda incluirá de segunda a domingo desta semana
                    </p>
                </div>

                <!-- Conteúdo -->
                <div class="form-section" style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #1f2937;">📋 Conteúdo</h4>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="pdfAgendaIncluirDescricoes" checked>
                            📄 Incluir descrições das tarefas
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="pdfAgendaIncluirDuracoes" checked>
                            ⏱️ Incluir duração das tarefas
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="pdfAgendaApenasRecorrentes" checked>
                            🔄 Apenas tarefas da agenda semanal
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="pdfAgendaIncluirEventos">
                            📅 Incluir eventos da pessoa
                        </label>
                    </div>
                </div>

                <!-- Prévia -->
                <div class="form-section">
                    <h4 style="margin: 0 0 12px 0; color: #1f2937;">👁️ Prévia</h4>
                    <div id="pdfAgendaPrevia" style="padding: 12px; background: #f9fafb; border-radius: 6px; min-height: 60px; font-size: 12px; color: #6b7280;">
                        Selecione uma pessoa para ver a prévia da agenda...
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="PDF.fecharModal()">
                    ❌ Cancelar
                </button>
                <button class="btn btn-success" onclick="PDF.confirmarAgenda()" id="btnGerarAgenda" disabled>
                    📋 Gerar Agenda PDF
                </button>
            </div>
        </div>
    `;
    
    return modal;
},

// ✅ CONFIGURAR MODAL DE CALENDÁRIO
_configurarModalCalendario() {
    console.log('⚙️ Configurando modal do calendário...');
    
    try {
        // Event listeners para validação em tempo real
        const mes = document.getElementById('pdfCalendarioMes');
        const ano = document.getElementById('pdfCalendarioAno');
        
        if (mes && ano) {
            const atualizarPrevia = () => {
                const mesNome = mes.options[mes.selectedIndex].text;
                const anoVal = ano.value;
                console.log(`📅 Selecionado: ${mesNome} ${anoVal}`);
            };
            
            mes.addEventListener('change', atualizarPrevia);
            ano.addEventListener('change', atualizarPrevia);
        }
        
    } catch (error) {
        console.error('❌ Erro ao configurar modal calendário:', error);
    }
},

// ✅ CONFIGURAR MODAL DE AGENDA
_configurarModalAgenda() {
    console.log('⚙️ Configurando modal da agenda...');
    
    try {
        const pessoaSelect = document.getElementById('pdfAgendaPessoa');
        const dataInput = document.getElementById('pdfAgendaDataInicio');
        const previaDiv = document.getElementById('pdfAgendaPrevia');
        const btnGerar = document.getElementById('btnGerarAgenda');
        
        if (pessoaSelect && previaDiv && btnGerar) {
            pessoaSelect.addEventListener('change', () => {
                const pessoa = pessoaSelect.value;
                
                if (pessoa) {
                    btnGerar.disabled = false;
                    this._atualizarPreviaAgenda(pessoa, dataInput.value, previaDiv);
                } else {
                    btnGerar.disabled = true;
                    previaDiv.innerHTML = 'Selecione uma pessoa para ver a prévia da agenda...';
                }
            });
            
            dataInput.addEventListener('change', () => {
                const pessoa = pessoaSelect.value;
                if (pessoa) {
                    this._atualizarPreviaAgenda(pessoa, dataInput.value, previaDiv);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao configurar modal agenda:', error);
    }
},

// ✅ ATUALIZAR PRÉVIA DA AGENDA
_atualizarPreviaAgenda(pessoa, dataInicio, previaDiv) {
    try {
        if (!pessoa || !dataInicio) return;
        
        // Buscar tarefas da pessoa para a semana
        const tarefas = this._obterTarefasSemanaPessoa(pessoa, dataInicio);
        
        if (tarefas.length === 0) {
            previaDiv.innerHTML = `
                <div style="color: #f59e0b;">
                    ⚠️ Nenhuma tarefa encontrada na agenda semanal de <strong>${pessoa}</strong>
                </div>
            `;
            return;
        }
        
        const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const tarefasPorDia = {};
        
        tarefas.forEach(tarefa => {
            const dia = tarefa.diaSemana;
            if (!tarefasPorDia[dia]) tarefasPorDia[dia] = [];
            tarefasPorDia[dia].push(tarefa);
        });
        
        let html = `<div style="color: #10b981; margin-bottom: 8px;">✅ <strong>${tarefas.length} tarefas</strong> encontradas para ${pessoa}:</div>`;
        
        Object.entries(tarefasPorDia).forEach(([dia, tarefasDia]) => {
            const diaNome = {
                'segunda': 'Segunda',
                'terca': 'Terça', 
                'quarta': 'Quarta',
                'quinta': 'Quinta',
                'sexta': 'Sexta',
                'sabado': 'Sábado',
                'domingo': 'Domingo'
            }[dia] || dia;
            
            html += `<div style="margin: 4px 0;"><strong>${diaNome}:</strong> ${tarefasDia.length} tarefa(s)</div>`;
        });
        
        previaDiv.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar prévia:', error);
        previaDiv.innerHTML = '<div style="color: #ef4444;">❌ Erro ao carregar prévia</div>';
    }
},

// ✅ COLETAR OPÇÕES DO CALENDÁRIO
_coletarOpcoesCalendario() {
    try {
        const opcoes = {
            mes: parseInt(document.getElementById('pdfCalendarioMes').value),
            ano: parseInt(document.getElementById('pdfCalendarioAno').value),
            incluirEventos: document.getElementById('pdfIncluirEventos').checked,
            incluirTarefas: document.getElementById('pdfIncluirTarefas').checked,
            incluirFeriados: document.getElementById('pdfIncluirFeriados').checked,
            mostrarDetalhes: document.getElementById('pdfMostrarDetalhes').checked,
            filtrarPessoa: document.getElementById('pdfFiltrarPessoa').value || null,
            orientacao: document.getElementById('pdfOrientacao').value,
            tamanho: document.getElementById('pdfTamanho').value,
            filtros: {
                tipos: []
            }
        };
        
        // Coletar tipos selecionados
        const tipos = ['reuniao', 'entrega', 'prazo', 'marco'];
        tipos.forEach(tipo => {
            const checkbox = document.getElementById(`pdfTipo${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
            if (checkbox && checkbox.checked) {
                opcoes.filtros.tipos.push(tipo);
            }
        });
        
        // Validações
        if (!opcoes.mes || opcoes.mes < 1 || opcoes.mes > 12) {
            throw new Error('Mês inválido');
        }
        
        if (!opcoes.ano || opcoes.ano < 2020 || opcoes.ano > 2030) {
            throw new Error('Ano inválido');
        }
        
        console.log('📊 Opções coletadas:', opcoes);
        return opcoes;
        
    } catch (error) {
        console.error('❌ Erro ao coletar opções do calendário:', error);
        if (typeof Notifications !== 'undefined') {
            Notifications.error(`Erro nas configurações: ${error.message}`);
        } else {
            alert(`Erro nas configurações: ${error.message}`);
        }
        return null;
    }
},

// ✅ COLETAR OPÇÕES DA AGENDA
_coletarOpcoesAgenda() {
    try {
        const pessoa = document.getElementById('pdfAgendaPessoa').value;
        if (!pessoa) {
            throw new Error('Selecione uma pessoa');
        }
        
        const opcoes = {
            pessoa,
            dataInicio: document.getElementById('pdfAgendaDataInicio').value,
            incluirDescricoes: document.getElementById('pdfAgendaIncluirDescricoes').checked,
            incluirDuracoes: document.getElementById('pdfAgendaIncluirDuracoes').checked,
            apenasAgendaSemanal: document.getElementById('pdfAgendaApenasRecorrentes').checked,
            incluirEventos: document.getElementById('pdfAgendaIncluirEventos').checked
        };
        
        // Validações
        if (!opcoes.dataInicio) {
            throw new Error('Data de início é obrigatória');
        }
        
        console.log('📊 Opções da agenda coletadas:', opcoes);
        return opcoes;
        
    } catch (error) {
        console.error('❌ Erro ao coletar opções da agenda:', error);
        if (typeof Notifications !== 'undefined') {
            Notifications.error(`Erro nas configurações: ${error.message}`);
        } else {
            alert(`Erro nas configurações: ${error.message}`);
        }
        return null;
    }
},

// ✅ OBTER TAREFAS DA SEMANA DE UMA PESSOA
_obterTarefasSemanaPessoa(pessoa, dataInicio) {
    try {
        if (!App.dados?.tarefas) return [];
        
        return App.dados.tarefas.filter(tarefa => {
            // Filtrar por responsável
            if (tarefa.responsavel !== pessoa) return false;
            
            // Apenas tarefas da agenda semanal
            if (tarefa.agendaSemanal) return true;
            
            // Ou tarefas com data na semana especificada
            if (tarefa.dataInicio || tarefa.dataFim) {
                const inicioSemana = new Date(dataInicio);
                const fimSemana = new Date(inicioSemana);
                fimSemana.setDate(fimSemana.getDate() + 6);
                
                const dataTask = new Date(tarefa.dataInicio || tarefa.dataFim);
                return dataTask >= inicioSemana && dataTask <= fimSemana;
            }
            
            return false;
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter tarefas da semana:', error);
        return [];
    }
}
