/* ========== 🛠️ AGENDA HELPERS v6.5.0 - FUNCIONALIDADES COMPLEMENTARES ========== */

const AgendaHelpers = {
    // ✅ FORMATAÇÃO DE DATAS
    formatarSemana(inicioSemana) {
        const inicio = new Date(inicioSemana);
        const fim = new Date(inicioSemana);
        fim.setDate(inicio.getDate() + 6);
        
        const formatoData = { day: 'numeric', month: 'short' };
        const inicioStr = inicio.toLocaleDateString('pt-BR', formatoData);
        const fimStr = fim.toLocaleDateString('pt-BR', formatoData);
        
        const ano = inicio.getFullYear();
        const anoAtual = new Date().getFullYear();
        
        if (ano !== anoAtual) {
            return `${inicioStr} - ${fimStr} de ${ano}`;
        }
        
        return `${inicioStr} - ${fimStr}`;
    },

    // ✅ VERIFICAR SE É HOJE
    isHoje(data) {
        const hoje = new Date();
        const dataCheck = new Date(data);
        
        return hoje.getDate() === dataCheck.getDate() &&
               hoje.getMonth() === dataCheck.getMonth() &&
               hoje.getFullYear() === dataCheck.getFullYear();
    },

    // ✅ OBTER INÍCIO DA SEMANA
    obterInicioSemana(data) {
        const date = new Date(data);
        const diaSemana = date.getDay();
        
        const inicioSemana = new Date(date);
        inicioSemana.setDate(date.getDate() - diaSemana);
        inicioSemana.setHours(0, 0, 0, 0);
        
        return inicioSemana;
    },

    // ✅ NAVEGAÇÃO DE SEMANA
    navegarSemana(direcao) {
        const novaData = new Date(PersonalAgenda.state.semanaAtual);
        novaData.setDate(novaData.getDate() + (direcao * 7));
        
        PersonalAgenda.state.semanaAtual = novaData;
        PersonalAgenda._renderizarViewAtual();
        
        if (typeof Notifications !== 'undefined') {
            const semanaTexto = this.formatarSemana(this.obterInicioSemana(novaData));
            Notifications.info(`📅 Navegando para: ${semanaTexto}`);
        }
        
        console.log('📅 Semana alterada:', this.formatarSemana(this.obterInicioSemana(novaData)));
    },

    // ✅ ADICIONAR TAREFA EM DIA ESPECÍFICO
    adicionarTarefaDia(data) {
        if (typeof Tasks !== 'undefined') {
            // Criar modal com data pré-preenchida
            Tasks.mostrarNovaTarefa('pessoal', PersonalAgenda.state.usuarioAtual);
            
            // Pré-preencher data após um pequeno delay
            setTimeout(() => {
                const dataInput = document.getElementById('tarefaDataInicio');
                if (dataInput) {
                    dataInput.value = data;
                }
                
                const dataFimInput = document.getElementById('tarefaDataFim');
                if (dataFimInput && !dataFimInput.value) {
                    dataFimInput.value = data;
                }
            }, 100);
            
            console.log('📝 Adicionando tarefa para:', data);
        } else {
            console.warn('⚠️ Módulo Tasks não disponível');
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('Módulo de tarefas não disponível');
            }
        }
    },

    // ✅ ADICIONAR TAREFA COM STATUS ESPECÍFICO
    adicionarTarefaStatus(status) {
        if (typeof Tasks !== 'undefined') {
            Tasks.mostrarNovaTarefa('pessoal', PersonalAgenda.state.usuarioAtual);
            
            // Pré-preencher status após um pequeno delay
            setTimeout(() => {
                const statusSelect = document.getElementById('tarefaStatus');
                if (statusSelect) {
                    statusSelect.value = status;
                }
            }, 100);
            
            console.log('📝 Adicionando tarefa com status:', status);
        } else {
            console.warn('⚠️ Módulo Tasks não disponível');
        }
    },

    // ✅ ORDENAR TAREFAS
    ordenarTarefas(criterio) {
        PersonalAgenda.state.ordenacaoAtiva = criterio;
        PersonalAgenda._renderizarViewAtual();
        
        const criterios = {
            'prioridade': 'Prioridade',
            'prazo': 'Prazo',
            'criacao': 'Data de Criação',
            'progresso': 'Progresso',
            'titulo': 'Título'
        };
        
        if (typeof Notifications !== 'undefined') {
            Notifications.info(`🔄 Ordenado por: ${criterios[criterio] || criterio}`);
        }
        
        console.log('📊 Tarefas ordenadas por:', criterio);
    },

    // ✅ DROP DE TAREFA (Drag & Drop)
    async dropTarefa(event) {
        event.preventDefault();
        
        const tarefaId = event.dataTransfer.getData('text/plain');
        const novoStatus = event.currentTarget.dataset.status;
        
        if (!tarefaId || !novoStatus) {
            console.warn('⚠️ Dados insuficientes para drop');
            return;
        }
        
        try {
            // Encontrar tarefa
            const tarefa = App.dados?.tarefas?.find(t => t.id == tarefaId);
            if (!tarefa) {
                throw new Error('Tarefa não encontrada');
            }
            
            // Atualizar status
            const statusAnterior = tarefa.status;
            tarefa.status = novoStatus;
            
            // Atualizar progresso baseado no status
            if (novoStatus === 'concluida') {
                tarefa.progresso = 100;
                tarefa.dataConclusao = new Date().toISOString();
            } else if (novoStatus === 'andamento' && tarefa.progresso === 0) {
                tarefa.progresso = 25;
            }
            
            // Salvar alterações
            if (typeof Persistence !== 'undefined') {
                await Persistence.salvarDadosCritico();
            }
            
            // Atualizar interface
            PersonalAgenda._renderizarViewAtual();
            PersonalAgenda._calcularEstatisticasPessoais();
            
            // Atualizar calendário principal
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }
            
            // Notificar sucesso
            if (typeof Notifications !== 'undefined') {
                const statusLabel = PersonalAgenda.config.status.find(s => s.value === novoStatus)?.label || novoStatus;
                Notifications.success(`✅ "${tarefa.titulo}" movida para: ${statusLabel}`);
            }
            
            console.log(`🔄 Tarefa ${tarefaId} movida de "${statusAnterior}" para "${novoStatus}"`);

        } catch (error) {
            console.error('❌ Erro ao mover tarefa:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro ao mover tarefa: ${error.message}`);
            }
        } finally {
            // Remover classe de drag
            document.querySelectorAll('.kanban-card.dragging').forEach(card => {
                card.classList.remove('dragging');
            });
        }
    },

    // ✅ MARCAR TAREFA COMO CONCLUÍDA
    async marcarConcluida(tarefaId) {
        try {
            const tarefa = App.dados?.tarefas?.find(t => t.id == tarefaId);
            if (!tarefa) {
                throw new Error('Tarefa não encontrada');
            }
            
            // Confirmar se necessário
            if (tarefa.subtarefas && tarefa.subtarefas.length > 0) {
                const subtarefasPendentes = tarefa.subtarefas.filter(s => !s.concluida).length;
                if (subtarefasPendentes > 0) {
                    const confirmar = confirm(
                        `A tarefa "${tarefa.titulo}" ainda possui ${subtarefasPendentes} subtarefa(s) pendente(s).\n\nDeseja mesmo marcar como concluída?`
                    );
                    if (!confirmar) {
                        return false;
                    }
                }
            }
            
            // Atualizar tarefa
            tarefa.status = 'concluida';
            tarefa.progresso = 100;
            tarefa.dataConclusao = new Date().toISOString();
            
            // Marcar todas as subtarefas como concluídas
            if (tarefa.subtarefas) {
                tarefa.subtarefas.forEach(sub => {
                    sub.concluida = true;
                });
            }
            
            // Salvar alterações
            if (typeof Persistence !== 'undefined') {
                await Persistence.salvarDadosCritico();
            }
            
            // Atualizar interfaces
            PersonalAgenda._renderizarViewAtual();
            PersonalAgenda._calcularEstatisticasPessoais();
            
            if (typeof Calendar !== 'undefined') {
                Calendar.gerar();
            }
            
            // Notificar sucesso com animação
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`🎉 "${tarefa.titulo}" concluída com sucesso!`);
            }
            
            console.log(`✅ Tarefa ${tarefaId} marcada como concluída`);
            return true;

        } catch (error) {
            console.error('❌ Erro ao marcar tarefa como concluída:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error(`Erro: ${error.message}`);
            }
            return false;
        }
    },

    // ✅ EDITAR TAREFA (delegação para Tasks.js)
    editarTarefa(tarefaId) {
        if (typeof Tasks !== 'undefined' && typeof Tasks.editarTarefa === 'function') {
            Tasks.editarTarefa(tarefaId);
        } else {
            console.warn('⚠️ Módulo Tasks não disponível');
            if (typeof Notifications !== 'undefined') {
                Notifications.warning('Módulo de edição não disponível');
            }
        }
    },

    // ✅ CONFIGURAR EVENTOS DA VIEW ATUAL
    configurarEventosView() {
        const view = PersonalAgenda.state.viewModeAtual;
        
        switch (view) {
            case 'semanal':
                this._configurarEventosVisualizacaoSemanal();
                break;
            case 'lista':
                this._configurarEventosLista();
                break;
            case 'kanban':
                this._configurarEventosKanban();
                break;
            case 'dashboard':
                this._configurarEventosDashboard();
                break;
        }
        
        console.log(`⚙️ Eventos configurados para view: ${view}`);
    },

    // ✅ CONFIGURAR EVENTOS ESPECÍFICOS DE CADA VIEW
    _configurarEventosVisualizacaoSemanal() {
        // Adicionar listeners para os dias da semana
        document.querySelectorAll('.dia-card').forEach(diaCard => {
            // Destaque no hover
            diaCard.addEventListener('mouseenter', () => {
                diaCard.style.background = '#f0f9ff';
            });
            
            diaCard.addEventListener('mouseleave', () => {
                diaCard.style.background = diaCard.classList.contains('hoje') ? '#dbeafe' : 'white';
            });
        });
    },

    _configurarEventosLista() {
        // Configurar ordenação automática
        const orderSelect = document.querySelector('select[onchange*="ordenarTarefas"]');
        if (orderSelect) {
            orderSelect.value = PersonalAgenda.state.ordenacaoAtiva || 'prioridade';
        }
    },

    _configurarEventosKanban() {
        // Configurar drop zones
        document.querySelectorAll('.kanban-tarefas').forEach(zona => {
            zona.addEventListener('dragover', (e) => {
                e.preventDefault();
                zona.style.background = '#f0f9ff';
            });
            
            zona.addEventListener('dragleave', () => {
                zona.style.background = 'transparent';
            });
            
            zona.addEventListener('drop', (e) => {
                zona.style.background = 'transparent';
                this.dropTarefa(e);
            });
        });
    },

    _configurarEventosDashboard() {
        // Configurar animações das métricas
        document.querySelectorAll('.metrica-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Animar barras do gráfico
        setTimeout(() => {
            document.querySelectorAll('.barra').forEach((barra, index) => {
                setTimeout(() => {
                    barra.style.animation = 'barraAnimation 0.6s ease-out forwards';
                }, index * 100);
            });
        }, 300);
    },

    // ✅ VALIDAR INTEGRIDADE DOS DADOS
    validarDados() {
        const problemas = [];
        
        // Verificar estrutura básica
        if (!App.dados) {
            problemas.push('❌ App.dados não está definido');
            return { valido: false, problemas };
        }
        
        if (!App.dados.tarefas) {
            App.dados.tarefas = [];
            problemas.push('⚠️ Estrutura de tarefas inicializada');
        }
        
        // Verificar tarefas
        App.dados.tarefas.forEach((tarefa, index) => {
            if (!tarefa.id) {
                problemas.push(`❌ Tarefa ${index} sem ID`);
            }
            
            if (!tarefa.titulo) {
                problemas.push(`❌ Tarefa ${tarefa.id || index} sem título`);
            }
            
            if (!tarefa.responsavel) {
                problemas.push(`⚠️ Tarefa ${tarefa.id || index} sem responsável`);
            }
            
            // Validar progresso
            if (tarefa.progresso !== undefined) {
                if (tarefa.progresso < 0 || tarefa.progresso > 100) {
                    tarefa.progresso = Math.max(0, Math.min(100, tarefa.progresso));
                    problemas.push(`🔧 Progresso da tarefa ${tarefa.id} corrigido`);
                }
            }
            
            // Validar subtarefas
            if (tarefa.subtarefas && !Array.isArray(tarefa.subtarefas)) {
                tarefa.subtarefas = [];
                problemas.push(`🔧 Subtarefas da tarefa ${tarefa.id} corrigidas`);
            }
        });
        
        const valido = !problemas.some(p => p.startsWith('❌'));
        
        return { valido, problemas };
    },

    // ✅ OBTER ESTATÍSTICAS DETALHADAS
    obterEstatisticasDetalhadas() {
        const tarefas = PersonalAgenda._obterMinhasTarefas();
        const hoje = new Date().toISOString().split('T')[0];
        const inicioSemana = this.obterInicioSemana(new Date());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        
        const stats = {
            geral: {
                total: tarefas.length,
                concluidas: tarefas.filter(t => t.status === 'concluida').length,
                pendentes: tarefas.filter(t => t.status === 'pendente').length,
                emAndamento: tarefas.filter(t => t.status === 'andamento').length,
                atrasadas: tarefas.filter(t => t.dataFim && t.dataFim < hoje && t.status !== 'concluida').length
            },
            hoje: {
                total: tarefas.filter(t => t.dataFim === hoje || t.dataInicio === hoje).length,
                concluidas: tarefas.filter(t => (t.dataFim === hoje || t.dataInicio === hoje) && t.status === 'concluida').length
            },
            semana: {
                total: tarefas.filter(t => this._tarefaNaSemana(t, inicioSemana, fimSemana)).length,
                concluidas: tarefas.filter(t => this._tarefaNaSemana(t, inicioSemana, fimSemana) && t.status === 'concluida').length
            },
            prioridades: this._contarPorPropriedade(tarefas, 'prioridade'),
            tipos: this._contarPorPropriedade(tarefas, 'tipo'),
            status: this._contarPorPropriedade(tarefas, 'status'),
            tempoEstimado: this._calcularTempoTotal(tarefas)
        };
        
        // Calcular percentuais
        if (stats.geral.total > 0) {
            stats.geral.percentualConcluidas = Math.round((stats.geral.concluidas / stats.geral.total) * 100);
        }
        
        if (stats.hoje.total > 0) {
            stats.hoje.percentualConcluidas = Math.round((stats.hoje.concluidas / stats.hoje.total) * 100);
        }
        
        if (stats.semana.total > 0) {
            stats.semana.percentualConcluidas = Math.round((stats.semana.concluidas / stats.semana.total) * 100);
        }
        
        return stats;
    },

    // ✅ MÉTODOS AUXILIARES PRIVADOS
    _tarefaNaSemana(tarefa, inicio, fim) {
        const inicioStr = inicio.toISOString().split('T')[0];
        const fimStr = fim.toISOString().split('T')[0];
        
        return (tarefa.dataInicio && tarefa.dataInicio >= inicioStr && tarefa.dataInicio <= fimStr) ||
               (tarefa.dataFim && tarefa.dataFim >= inicioStr && tarefa.dataFim <= fimStr) ||
               (tarefa.agendaSemanal);
    },

    _contarPorPropriedade(tarefas, propriedade) {
        const contagem = {};
        tarefas.forEach(tarefa => {
            const valor = tarefa[propriedade] || 'indefinido';
            contagem[valor] = (contagem[valor] || 0) + 1;
        });
        return contagem;
    },

    _calcularTempoTotal(tarefas) {
        const tempoTotal = tarefas
            .filter(t => t.estimativa && t.status !== 'concluida')
            .reduce((total, tarefa) => total + (tarefa.estimativa || 0), 0);
        
        return {
            minutos: tempoTotal,
            horas: Math.round(tempoTotal / 60 * 10) / 10
        };
    },

    // ✅ EXPORTAR DADOS DA AGENDA
    exportarAgendaPessoal(formato = 'json') {
        try {
            const tarefas = PersonalAgenda._obterMinhasTarefas();
            const stats = this.obterEstatisticasDetalhadas();
            const timestamp = new Date().toISOString().split('T')[0];
            
            const dadosExport = {
                usuario: PersonalAgenda.state.usuarioAtual,
                dataExportacao: new Date().toISOString(),
                estatisticas: stats,
                tarefas: tarefas,
                configuracoes: PersonalAgenda.state.filtros
            };
            
            if (formato === 'json') {
                const json = JSON.stringify(dadosExport, null, 2);
                if (typeof Helpers !== 'undefined' && typeof Helpers.downloadFile === 'function') {
                    Helpers.downloadFile(json, `agenda_pessoal_${timestamp}.json`, 'application/json');
                } else {
                    this._downloadFile(json, `agenda_pessoal_${timestamp}.json`, 'application/json');
                }
            } else if (formato === 'csv') {
                const csv = this._gerarCSVTarefas(tarefas);
                this._downloadFile(csv, `tarefas_pessoais_${timestamp}.csv`, 'text/csv');
            }
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`📤 Agenda exportada em ${formato.toUpperCase()}`);
            }

        } catch (error) {
            console.error('❌ Erro ao exportar agenda:', error);
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Erro ao exportar agenda');
            }
        }
    },

    _gerarCSVTarefas(tarefas) {
        const headers = ['ID', 'Título', 'Tipo', 'Prioridade', 'Status', 'Responsável', 'Data Início', 'Data Fim', 'Progresso', 'Estimativa', 'Subtarefas'];
        
        const rows = tarefas.map(tarefa => [
            tarefa.id,
            tarefa.titulo,
            tarefa.tipo,
            tarefa.prioridade,
            tarefa.status,
            tarefa.responsavel,
            tarefa.dataInicio || '',
            tarefa.dataFim || '',
            tarefa.progresso || 0,
            tarefa.estimativa || '',
            tarefa.subtarefas ? tarefa.subtarefas.length : 0
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');
    },

    _downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
};

// ✅ INTEGRAR TODOS OS HELPERS COM PERSONALAGENDA
if (typeof PersonalAgenda !== 'undefined') {
    // Métodos de formatação
    PersonalAgenda._formatarSemana = AgendaHelpers.formatarSemana.bind(AgendaHelpers);
    PersonalAgenda._isHoje = AgendaHelpers.isHoje.bind(AgendaHelpers);
    PersonalAgenda._obterInicioSemana = AgendaHelpers.obterInicioSemana.bind(AgendaHelpers);
    
    // Métodos de navegação e ação
    PersonalAgenda.navegarSemana = AgendaHelpers.navegarSemana.bind(AgendaHelpers);
    PersonalAgenda.adicionarTarefaDia = AgendaHelpers.adicionarTarefaDia.bind(AgendaHelpers);
    PersonalAgenda.adicionarTarefaStatus = AgendaHelpers.adicionarTarefaStatus.bind(AgendaHelpers);
    PersonalAgenda.ordenarTarefas = AgendaHelpers.ordenarTarefas.bind(AgendaHelpers);
    PersonalAgenda.dropTarefa = AgendaHelpers.dropTarefa.bind(AgendaHelpers);
    PersonalAgenda.marcarConcluida = AgendaHelpers.marcarConcluida.bind(AgendaHelpers);
    PersonalAgenda.editarTarefa = AgendaHelpers.editarTarefa.bind(AgendaHelpers);
    
    // Métodos de configuração
    PersonalAgenda._configurarEventosView = AgendaHelpers.configurarEventosView.bind(AgendaHelpers);
    
    // Métodos utilitários
    PersonalAgenda.validarDados = AgendaHelpers.validarDados.bind(AgendaHelpers);
    PersonalAgenda.obterEstatisticasDetalhadas = AgendaHelpers.obterEstatisticasDetalhadas.bind(AgendaHelpers);
    PersonalAgenda.exportarAgendaPessoal = AgendaHelpers.exportarAgendaPessoal.bind(AgendaHelpers);
    
    console.log('✅ AgendaHelpers integrado ao PersonalAgenda');
}

// ✅ ADICIONAR ESTILOS COMPLEMENTARES
const adicionarEstilosComplementares = () => {
    const styleId = 'agendaHelpersStyles';
    
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Animações */
        @keyframes barraAnimation {
            from { height: 0; }
            to { height: var(--altura-final); }
        }
        
        @keyframes slideIn {
            from { 
                opacity: 0; 
                transform: translateY(-10px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* Drag and Drop */
        .kanban-tarefas.drag-over {
            background: #f0f9ff !important;
            border: 2px dashed #3b82f6;
        }
        
        .kanban-card.dragging {
            opacity: 0.5;
            transform: rotate(5deg);
            z-index: 1000;
        }
        
        /* Transições suaves */
        .tarefa-mini,
        .tarefa-dia,
        .kanban-card,
        .tarefa-completa {
            animation: slideIn 0.3s ease-out;
        }
        
        /* Estados de loading */
        .loading-state {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }
        
        .loading-state::before {
            content: "⏳";
            font-size: 24px;
            display: block;
            margin-bottom: 8px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Estados vazios */
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #9ca3af;
        }
        
        .empty-state::before {
            content: "📭";
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
        }
        
        /* Melhorias de acessibilidade */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Focus states */
        .kanban-card:focus,
        .tarefa-mini:focus,
        .tarefa-dia:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }
    `;
    
    document.head.appendChild(style);
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        adicionarEstilosComplementares();
        console.log('🎨 Estilos complementares da agenda adicionados');
    }, 1000);
});

// ✅ FUNÇÃO GLOBAL PARA DEBUG
window.AgendaHelpers_Debug = {
    validar: () => AgendaHelpers.validarDados(),
    stats: () => AgendaHelpers.obterEstatisticasDetalhadas(),
    exportar: (formato) => AgendaHelpers.exportarAgendaPessoal(formato),
    semana: (data) => AgendaHelpers.formatarSemana(AgendaHelpers.obterInicioSemana(data || new Date())),
    isHoje: (data) => AgendaHelpers.isHoje(data)
};

console.log('🛠️ Agenda Helpers v6.5.0 carregado!');
console.log('🎯 Funcionalidades: Navegação, Drag&Drop, Validação, Exportação');
console.log('✅ Integração: PersonalAgenda completamente funcional');
console.log('🧪 Debug: AgendaHelpers_Debug.validar(), AgendaHelpers_Debug.stats()');
