/* ========== 📊 DASHBOARD PESSOAL v6.5.0 - MÉTRICAS E VIEWS ========== */

const PersonalDashboard = {
    // ✅ CONFIGURAÇÕES
    config: {
        coresGrafico: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        diasSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    },

    // ✅ RENDERIZAR GRÁFICO DE PROGRESSO SEMANAL
    renderizarGraficoProgresso() {
        const dadosSemana = this._obterDadosProgressoSemanal();
        
        return `
            <div class="grafico-container">
                <div class="grafico-barras">
                    ${dadosSemana.map((dia, index) => `
                        <div class="barra-dia">
                            <div class="barra" 
                                 style="height: ${dia.progresso}%; background: ${this.config.coresGrafico[index % this.config.coresGrafico.length]}">
                            </div>
                            <div class="barra-label">${this.config.diasSemana[index]}</div>
                            <div class="barra-valor">${dia.progresso}%</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="grafico-legenda">
                    <div class="legenda-item">
                        <div class="legenda-cor" style="background: #10b981;"></div>
                        <span>Produtividade diária (%)</span>
                    </div>
                </div>
            </div>
            
            <style>
                .grafico-container {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .grafico-barras {
                    display: flex;
                    align-items: end;
                    justify-content: space-between;
                    height: 200px;
                    margin-bottom: 16px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 6px;
                }
                
                .barra-dia {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    max-width: 60px;
                }
                
                .barra {
                    width: 24px;
                    min-height: 4px;
                    border-radius: 12px 12px 0 0;
                    transition: all 0.3s ease;
                    margin-bottom: 8px;
                }
                
                .barra-label {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .barra-valor {
                    font-size: 10px;
                    color: #374151;
                    font-weight: bold;
                }
                
                .grafico-legenda {
                    display: flex;
                    justify-content: center;
                }
                
                .legenda-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #6b7280;
                }
                
                .legenda-cor {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                }
            </style>
        `;
    },

    // ✅ RENDERIZAR TAREFA MINI
    renderizarTarefaMini(tarefa) {
        const tipoCor = PersonalAgenda.config.tipos.find(t => t.value === tarefa.tipo)?.cor || '#6b7280';
        const prioridadeCor = PersonalAgenda.config.prioridades.find(p => p.value === tarefa.prioridade)?.cor || '#6b7280';
        
        return `
            <div class="tarefa-mini" onclick="PersonalAgenda.editarTarefa(${tarefa.id})">
                <div class="tarefa-mini-header">
                    <div class="tarefa-tipo" style="background: ${tipoCor};">
                        ${PersonalAgenda.config.tipos.find(t => t.value === tarefa.tipo)?.icon || '📝'}
                    </div>
                    <div class="tarefa-prioridade" style="border-color: ${prioridadeCor};">
                        ${tarefa.prioridade}
                    </div>
                </div>
                
                <div class="tarefa-mini-content">
                    <h4 class="tarefa-titulo">${tarefa.titulo}</h4>
                    ${tarefa.dataFim ? `<div class="tarefa-prazo">📅 ${new Date(tarefa.dataFim).toLocaleDateString('pt-BR')}</div>` : ''}
                </div>
                
                <div class="tarefa-mini-footer">
                    <div class="tarefa-progresso-container">
                        <div class="tarefa-progresso-bar">
                            <div class="tarefa-progresso-fill" style="width: ${tarefa.progresso || 0}%; background: ${prioridadeCor};"></div>
                        </div>
                        <span class="tarefa-progresso-text">${tarefa.progresso || 0}%</span>
                    </div>
                </div>
            </div>
            
            <style>
                .tarefa-mini {
                    background: white;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-left: 4px solid ${prioridadeCor};
                }
                
                .tarefa-mini:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .tarefa-mini-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .tarefa-tipo {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                }
                
                .tarefa-prioridade {
                    background: #f8fafc;
                    border: 1px solid;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .tarefa-titulo {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    line-height: 1.4;
                }
                
                .tarefa-prazo {
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .tarefa-mini-footer {
                    margin-top: 12px;
                }
                
                .tarefa-progresso-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .tarefa-progresso-bar {
                    flex: 1;
                    height: 6px;
                    background: #e5e7eb;
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .tarefa-progresso-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                    border-radius: 3px;
                }
                
                .tarefa-progresso-text {
                    font-size: 12px;
                    font-weight: 600;
                    color: #374151;
                    min-width: 30px;
                }
            </style>
        `;
    },

    // ✅ RENDERIZAR TAREFA URGENTE
    renderizarTarefaUrgente(tarefa) {
        const diasRestantes = this._calcularDiasRestantes(tarefa.dataFim);
        const corUrgencia = diasRestantes <= 0 ? '#ef4444' : diasRestantes <= 1 ? '#f59e0b' : '#ef4444';
        
        return `
            <div class="tarefa-urgente" style="border-color: ${corUrgencia};" onclick="PersonalAgenda.editarTarefa(${tarefa.id})">
                <div class="urgente-header">
                    <div class="urgente-icon" style="background: ${corUrgencia};">
                        ${diasRestantes <= 0 ? '🔥' : '🚨'}
                    </div>
                    <div class="urgente-info">
                        <h4>${tarefa.titulo}</h4>
                        <div class="urgente-prazo">
                            ${diasRestantes <= 0 ? 
                                '⏰ ATRASADA' : 
                                diasRestantes === 1 ? 
                                    '⚡ HOJE' : 
                                    `📅 ${diasRestantes} dias restantes`
                            }
                        </div>
                    </div>
                </div>
                
                <div class="urgente-actions">
                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); PersonalAgenda.marcarConcluida(${tarefa.id});">
                        ✅ Concluir
                    </button>
                </div>
            </div>
            
            <style>
                .tarefa-urgente {
                    background: white;
                    border: 2px solid;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .tarefa-urgente:hover {
                    transform: translateX(4px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .urgente-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                
                .urgente-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 18px;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .urgente-info h4 {
                    margin: 0 0 4px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #374151;
                }
                
                .urgente-prazo {
                    font-size: 14px;
                    font-weight: 600;
                    color: ${corUrgencia};
                }
                
                .urgente-actions {
                    display: flex;
                    justify-content: flex-end;
                }
            </style>
        `;
    },

    // ✅ ORGANIZAR TAREFAS POR DIA DA SEMANA
    organizarTarefasPorDia(inicioSemana) {
        const tarefas = PersonalAgenda._obterMinhasTarefas();
        const tarefasPorDia = {};
        
        // Inicializar todos os dias da semana
        for (let i = 0; i < 7; i++) {
            const data = new Date(inicioSemana);
            data.setDate(inicioSemana.getDate() + i);
            const dataStr = data.toISOString().split('T')[0];
            tarefasPorDia[dataStr] = [];
        }
        
        // Distribuir tarefas pelos dias
        tarefas.forEach(tarefa => {
            // Tarefas com data específica
            if (tarefa.dataInicio) {
                const dataStr = tarefa.dataInicio;
                if (tarefasPorDia[dataStr]) {
                    tarefasPorDia[dataStr].push(tarefa);
                }
            }
            
            if (tarefa.dataFim) {
                const dataStr = tarefa.dataFim;
                if (tarefasPorDia[dataStr]) {
                    tarefasPorDia[dataStr].push(tarefa);
                }
            }
            
            // Tarefas recorrentes da agenda semanal
            if (tarefa.agendaSemanal && tarefa.diaSemana) {
                const indiceDia = this._obterIndiceDiaSemana(tarefa.diaSemana);
                if (indiceDia >= 0) {
                    const data = new Date(inicioSemana);
                    data.setDate(inicioSemana.getDate() + indiceDia);
                    const dataStr = data.toISOString().split('T')[0];
                    if (tarefasPorDia[dataStr]) {
                        tarefasPorDia[dataStr].push(tarefa);
                    }
                }
            }
        });
        
        return tarefasPorDia;
    },

    // ✅ RENDERIZAR TAREFA DO DIA (visão semanal)
    renderizarTarefaDia(tarefa) {
        const tipoCor = PersonalAgenda.config.tipos.find(t => t.value === tarefa.tipo)?.cor || '#6b7280';
        const statusCor = PersonalAgenda.config.status.find(s => s.value === tarefa.status)?.cor || '#6b7280';
        
        return `
            <div class="tarefa-dia" style="border-left: 3px solid ${tipoCor};" onclick="PersonalAgenda.editarTarefa(${tarefa.id})">
                <div class="tarefa-dia-header">
                    <span class="tarefa-dia-titulo">${tarefa.titulo}</span>
                    ${tarefa.horario ? `<span class="tarefa-dia-horario">${tarefa.horario}</span>` : ''}
                </div>
                
                <div class="tarefa-dia-meta">
                    <span class="tarefa-dia-status" style="background: ${statusCor};">
                        ${PersonalAgenda.config.status.find(s => s.value === tarefa.status)?.label || tarefa.status}
                    </span>
                    ${tarefa.estimativa ? `<span class="tarefa-dia-tempo">⏱️ ${tarefa.estimativa}min</span>` : ''}
                </div>
                
                ${tarefa.progresso !== undefined ? `
                    <div class="tarefa-dia-progresso">
                        <div class="progress-bar-mini">
                            <div class="progress-fill-mini" style="width: ${tarefa.progresso}%; background: ${tipoCor};"></div>
                        </div>
                        <span>${tarefa.progresso}%</span>
                    </div>
                ` : ''}
            </div>
            
            <style>
                .tarefa-dia {
                    background: white;
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .tarefa-dia:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }
                
                .tarefa-dia-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .tarefa-dia-titulo {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                    line-height: 1.3;
                    flex: 1;
                }
                
                .tarefa-dia-horario {
                    font-size: 11px;
                    color: #6b7280;
                    background: #f3f4f6;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 500;
                }
                
                .tarefa-dia-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .tarefa-dia-status {
                    font-size: 10px;
                    color: white;
                    padding: 3px 6px;
                    border-radius: 3px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                
                .tarefa-dia-tempo {
                    font-size: 11px;
                    color: #6b7280;
                }
                
                .tarefa-dia-progresso {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: #6b7280;
                }
                
                .progress-bar-mini {
                    flex: 1;
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .progress-fill-mini {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.3s ease;
                }
            </style>
        `;
    },

    // ✅ RENDERIZAR TAREFA COMPLETA (lista)
    renderizarTarefaCompleta(tarefa) {
        const tipoCor = PersonalAgenda.config.tipos.find(t => t.value === tarefa.tipo)?.cor || '#6b7280';
        const prioridadeCor = PersonalAgenda.config.prioridades.find(p => p.value === tarefa.prioridade)?.cor || '#6b7280';
        const statusCor = PersonalAgenda.config.status.find(s => s.value === tarefa.status)?.cor || '#6b7280';
        
        return `
            <div class="tarefa-completa" onclick="PersonalAgenda.editarTarefa(${tarefa.id})">
                <div class="tarefa-completa-header">
                    <div class="tarefa-completa-left">
                        <div class="tarefa-tipo-icon" style="background: ${tipoCor};">
                            ${PersonalAgenda.config.tipos.find(t => t.value === tarefa.tipo)?.icon || '📝'}
                        </div>
                        <div class="tarefa-info">
                            <h3 class="tarefa-completa-titulo">${tarefa.titulo}</h3>
                            <div class="tarefa-meta">
                                <span class="tarefa-meta-status" style="background: ${statusCor};">
                                    ${PersonalAgenda.config.status.find(s => s.value === tarefa.status)?.label || tarefa.status}
                                </span>
                                <span class="tarefa-meta-prioridade" style="color: ${prioridadeCor};">
                                    ${PersonalAgenda.config.prioridades.find(p => p.value === tarefa.prioridade)?.label || tarefa.prioridade}
                                </span>
                                ${tarefa.estimativa ? `<span class="tarefa-meta-tempo">⏱️ ${tarefa.estimativa}min</span>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="tarefa-completa-right">
                        ${tarefa.dataFim ? `
                            <div class="tarefa-prazo">
                                📅 ${new Date(tarefa.dataFim).toLocaleDateString('pt-BR')}
                            </div>
                        ` : ''}
                        <div class="tarefa-progresso-completa">
                            <div class="progresso-circular" style="background: conic-gradient(${prioridadeCor} ${(tarefa.progresso || 0) * 3.6}deg, #e5e7eb 0deg);">
                                <span>${tarefa.progresso || 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${tarefa.descricao ? `
                    <div class="tarefa-descricao">
                        ${tarefa.descricao}
                    </div>
                ` : ''}
                
                ${tarefa.subtarefas && tarefa.subtarefas.length > 0 ? `
                    <div class="tarefa-subtarefas">
                        <div class="subtarefas-header">
                            <span>📋 Subtarefas (${tarefa.subtarefas.filter(s => s.concluida).length}/${tarefa.subtarefas.length})</span>
                        </div>
                        <div class="subtarefas-lista">
                            ${tarefa.subtarefas.slice(0, 3).map(sub => `
                                <div class="subtarefa-item">
                                    <input type="checkbox" ${sub.concluida ? 'checked' : ''} onclick="event.stopPropagation();">
                                    <span class="${sub.concluida ? 'concluida' : ''}">${sub.titulo}</span>
                                </div>
                            `).join('')}
                            ${tarefa.subtarefas.length > 3 ? `
                                <div class="subtarefas-mais">
                                    +${tarefa.subtarefas.length - 3} mais...
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="tarefa-actions">
                    <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); PersonalAgenda.marcarConcluida(${tarefa.id});">
                        ✅ Concluir
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); PersonalAgenda.promoverTarefa(${tarefa.id});">
                        ↗️ Promover
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); PersonalAgenda.editarTarefa(${tarefa.id});">
                        ✏️ Editar
                    </button>
                </div>
            </div>
            
            <style>
                .tarefa-completa {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid #e5e7eb;
                }
                
                .tarefa-completa:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                    border-color: ${tipoCor};
                }
                
                .tarefa-completa-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                
                .tarefa-completa-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 1;
                }
                
                .tarefa-tipo-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                .tarefa-completa-titulo {
                    margin: 0 0 8px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                    line-height: 1.4;
                }
                
                .tarefa-meta {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                
                .tarefa-meta-status {
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .tarefa-meta-prioridade {
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: capitalize;
                }
                
                .tarefa-meta-tempo {
                    font-size: 14px;
                    color: #6b7280;
                }
                
                .tarefa-completa-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .tarefa-prazo {
                    font-size: 14px;
                    color: #6b7280;
                    text-align: right;
                }
                
                .progresso-circular {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    color: #374151;
                }
                
                .tarefa-descricao {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.5;
                }
                
                .tarefa-subtarefas {
                    margin-bottom: 16px;
                }
                
                .subtarefas-header {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                }
                
                .subtarefas-lista {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 8px;
                }
                
                .subtarefa-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                
                .subtarefa-item:last-child {
                    margin-bottom: 0;
                }
                
                .subtarefa-item span.concluida {
                    text-decoration: line-through;
                    color: #9ca3af;
                }
                
                .subtarefas-mais {
                    font-size: 12px;
                    color: #6b7280;
                    font-style: italic;
                    margin-top: 8px;
                }
                
                .tarefa-actions {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }
            </style>
        `;
    },

    // ✅ AGRUPAR TAREFAS POR STATUS (kanban)
    agruparTarefasPorStatus() {
        const tarefas = PersonalAgenda._obterMinhasTarefasFiltradas();
        const grupos = {};
        
        // Inicializar grupos
        PersonalAgenda.config.status.forEach(status => {
            grupos[status.value] = [];
        });
        
        // Agrupar tarefas
        tarefas.forEach(tarefa => {
            const status = tarefa.status || 'pendente';
            if (grupos[status]) {
                grupos[status].push(tarefa);
            }
        });
        
        return grupos;
    },

    // ✅ RENDERIZAR TAREFA KANBAN
    renderizarTarefaKanban(tarefa) {
        const tipoCor = PersonalAgenda.config.tipos.find(t => t.value === tarefa.tipo)?.cor || '#6b7280';
        const prioridadeCor = PersonalAgenda.config.prioridades.find(p => p.value === tarefa.prioridade)?.cor || '#6b7280';
        
        return `
            <div class="kanban-card" draggable="true" data-tarefa-id="${tarefa.id}" 
                 ondragstart="PersonalDashboard.dragStart(event)"
                 onclick="PersonalAgenda.editarTarefa(${tarefa.id})">
                <div class="kanban-card-header">
                    <div class="kanban-tipo" style="background: ${tipoCor};">
                        ${PersonalAgenda.config.tipos.find(t => t.value === tarefa.tipo)?.icon || '📝'}
                    </div>
                    <div class="kanban-prioridade" style="border-color: ${prioridadeCor}; color: ${prioridadeCor};">
                        ${tarefa.prioridade}
                    </div>
                </div>
                
                <h4 class="kanban-titulo">${tarefa.titulo}</h4>
                
                ${tarefa.dataFim ? `
                    <div class="kanban-prazo">
                        📅 ${new Date(tarefa.dataFim).toLocaleDateString('pt-BR')}
                    </div>
                ` : ''}
                
                ${tarefa.progresso !== undefined ? `
                    <div class="kanban-progresso">
                        <div class="kanban-progress-bar">
                            <div class="kanban-progress-fill" style="width: ${tarefa.progresso}%; background: ${prioridadeCor};"></div>
                        </div>
                        <span>${tarefa.progresso}%</span>
                    </div>
                ` : ''}
                
                ${tarefa.subtarefas && tarefa.subtarefas.length > 0 ? `
                    <div class="kanban-subtarefas">
                        📋 ${tarefa.subtarefas.filter(s => s.concluida).length}/${tarefa.subtarefas.length} subtarefas
                    </div>
                ` : ''}
            </div>
            
            <style>
                .kanban-card {
                    background: white;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid #e5e7eb;
                }
                
                .kanban-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .kanban-card.dragging {
                    opacity: 0.5;
                    transform: rotate(5deg);
                }
                
                .kanban-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .kanban-tipo {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                }
                
                .kanban-prioridade {
                    border: 1px solid;
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                
                .kanban-titulo {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    line-height: 1.4;
                }
                
                .kanban-prazo {
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 8px;
                }
                
                .kanban-progresso {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                
                .kanban-progress-bar {
                    flex: 1;
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .kanban-progress-fill {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.3s ease;
                }
                
                .kanban-subtarefas {
                    font-size: 11px;
                    color: #6b7280;
                    background: #f3f4f6;
                    padding: 4px 8px;
                    border-radius: 4px;
                    text-align: center;
                }
            </style>
        `;
    },

    // ✅ DRAG AND DROP HANDLERS
    dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.tarefaId);
        event.target.classList.add('dragging');
    },

    // ✅ MÉTODOS AUXILIARES
    _obterDadosProgressoSemanal() {
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        
        const dados = [];
        
        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(inicioSemana.getDate() + i);
            
            // Calcular produtividade do dia (simulado)
            const produtividade = Math.random() * 100;
            
            dados.push({
                dia: dia,
                progresso: Math.round(produtividade)
            });
        }
        
        return dados;
    },

    _calcularDiasRestantes(dataFim) {
        if (!dataFim) return 999;
        
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const prazo = new Date(dataFim);
        prazo.setHours(0, 0, 0, 0);
        
        const diffTime = prazo - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    },

    _obterIndiceDiaSemana(diaSemana) {
        const mapeamento = {
            'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3,
            'quinta': 4, 'sexta': 5, 'sabado': 6
        };
        return mapeamento[diaSemana] ?? -1;
    }
};

// ✅ INTEGRAR COM PERSONALAGENDA
if (typeof PersonalAgenda !== 'undefined') {
    // Sobrescrever métodos placeholder
    PersonalAgenda._renderizarGraficoProgresso = PersonalDashboard.renderizarGraficoProgresso.bind(PersonalDashboard);
    PersonalAgenda._renderizarTarefaMini = PersonalDashboard.renderizarTarefaMini.bind(PersonalDashboard);
    PersonalAgenda._renderizarTarefaUrgente = PersonalDashboard.renderizarTarefaUrgente.bind(PersonalDashboard);
    PersonalAgenda._organizarTarefasPorDia = PersonalDashboard.organizarTarefasPorDia.bind(PersonalDashboard);
    PersonalAgenda._renderizarTarefaDia = PersonalDashboard.renderizarTarefaDia.bind(PersonalDashboard);
    PersonalAgenda._renderizarTarefaCompleta = PersonalDashboard.renderizarTarefaCompleta.bind(PersonalDashboard);
    PersonalAgenda._agruparTarefasPorStatus = PersonalDashboard.agruparTarefasPorStatus.bind(PersonalDashboard);
    PersonalAgenda._renderizarTarefaKanban = PersonalDashboard.renderizarTarefaKanban.bind(PersonalDashboard);
    
    // Adicionar métodos auxiliares
    PersonalAgenda.dragStart = PersonalDashboard.dragStart.bind(PersonalDashboard);
    
    console.log('✅ PersonalDashboard integrado ao PersonalAgenda');
}

// ✅ FUNÇÃO GLOBAL PARA DEBUG
window.PersonalDashboard_Debug = {
    dados: () => PersonalDashboard._obterDadosProgressoSemanal(),
    tarefasPorDia: () => PersonalDashboard.organizarTarefasPorDia(new Date()),
    tarefasPorStatus: () => PersonalDashboard.agruparTarefasPorStatus(),
    diasRestantes: (data) => PersonalDashboard._calcularDiasRestantes(data)
};

console.log('📊 Dashboard Pessoal v6.5.0 carregado!');
console.log('🎯 Funcionalidades: Gráficos, Views completas, Drag&Drop');
console.log('✅ Integração: PersonalAgenda estendido com todas as views');
console.log('🧪 Debug: PersonalDashboard_Debug.dados(), PersonalDashboard_Debug.tarefasPorStatus()');
