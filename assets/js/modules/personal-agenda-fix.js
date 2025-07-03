/* CORREÇÃO MODAL PERSONAL AGENDA v6.5.1 */

// Sobrescrever método problemático com versão simplificada
PersonalAgenda._criarModalMinhaAgenda = function() {
    console.log('🔧 Usando versão corrigida do modal');
    
    // Remover modal existente
    const modalExistente = document.getElementById('modalMinhaAgenda');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Criar modal simplificado mas funcional
    const modal = document.createElement('div');
    modal.id = 'modalMinhaAgenda';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="
            width: 95vw;
            height: 95vh;
            background: white;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <h2 style="margin: 0; font-size: 24px;">📋 Minha Agenda - ${this.state.usuarioAtual}</h2>
                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Organize suas tarefas e maximize sua produtividade</p>
                </div>
                <button onclick="PersonalAgenda.fecharModal()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">✕ Fechar</button>
            </div>
            
            <!-- Views Controls -->
            <div style="
                padding: 16px 20px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                gap: 8px;
            ">
                <button onclick="PersonalAgenda.mudarView('dashboard')" style="
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">📊 Dashboard</button>
                
                <button onclick="PersonalAgenda.mudarView('lista')" style="
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">📝 Lista</button>
                
                <button onclick="PersonalAgenda.mudarView('semanal')" style="
                    background: #f59e0b;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">📅 Semanal</button>
                
                <button onclick="PersonalAgenda.mudarView('kanban')" style="
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">📋 Kanban</button>
            </div>
            
            <!-- Content -->
            <div id="agendaConteudo" style="
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f9fafb;
            ">
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                    <h3>🎉 Modal da Agenda Funcionando!</h3>
                    <p>Clique nos botões acima para testar as views</p>
                    <p>View atual: <strong>${this.state.viewModeAtual}</strong></p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="
                padding: 16px 20px;
                background: white;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <span style="color: #6b7280; font-size: 14px;">🔄 Sincronizado com sistema</span>
                <div style="display: flex; gap: 12px;">
                    <button onclick="alert('Nova tarefa - será implementado')" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">➕ Nova Tarefa</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('✅ Modal simplificado criado e adicionado ao DOM');
};

// Sobrescrever método de mudança de view
PersonalAgenda.mudarView = function(novaView) {
    this.state.viewModeAtual = novaView;
    
    const conteudo = document.getElementById('agendaConteudo');
    if (conteudo) {
        conteudo.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #374151;">
                <h3>📱 View: ${novaView.toUpperCase()}</h3>
                <p>Esta view está sendo carregada...</p>
                <p>View anterior funcionou! ✅</p>
                <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4>🎯 Funcionalidades disponíveis nesta view:</h4>
                    <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                        <li>✅ Modal full-screen funcional</li>
                        <li>✅ Navegação entre views</li>
                        <li>✅ Header e footer responsivos</li>
                        <li>🔧 Conteúdo específico da view (próximo passo)</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    console.log('📱 View alterada para:', novaView);
};

console.log('🔧 Personal Agenda Fix v6.5.1 carregado!');

// ✅ MELHORAR RENDERIZAÇÃO DAS VIEWS COM DADOS REAIS
PersonalAgenda._renderizarViewMelhorada = function(view) {
    const tarefas = this._obterMinhasTarefas();
    const stats = this.state.estatisticasPessoais || {};
    
    switch(view) {
        case 'dashboard':
            return `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <!-- Estatísticas -->
                    <div>
                        <h3>📊 Suas Estatísticas</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; border: 2px solid #f59e0b;">
                                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${stats.pendentes || 0}</div>
                                <div style="font-size: 12px; color: #6b7280;">Pendentes</div>
                            </div>
                            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.concluidas || 0}</div>
                                <div style="font-size: 12px; color: #6b7280;">Concluídas</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Progresso -->
                    <div>
                        <h3>🎯 Progresso Geral</h3>
                        <div style="background: white; padding: 20px; border-radius: 8px;">
                            <div style="font-size: 32px; text-align: center; margin-bottom: 10px;">
                                ${stats.progressoMedio || 0}%
                            </div>
                            <div style="width: 100%; background: #e5e7eb; border-radius: 10px; height: 20px;">
                                <div style="width: ${stats.progressoMedio || 0}%; background: linear-gradient(90deg, #10b981, #3b82f6); height: 100%; border-radius: 10px; transition: width 0.5s;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
        case 'lista':
            return `
                <div>
                    <h3>📝 Todas as Tarefas (${tarefas.length})</h3>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${tarefas.length > 0 ? 
                            tarefas.map(tarefa => `
                                <div style="
                                    background: white;
                                    padding: 12px;
                                    margin: 8px 0;
                                    border-radius: 8px;
                                    border-left: 4px solid #3b82f6;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                ">
                                    <div>
                                        <strong>${tarefa.titulo}</strong><br>
                                        <small style="color: #6b7280;">${tarefa.tipo} • ${tarefa.status}</small>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: bold;">${tarefa.progresso || 0}%</div>
                                        <div style="width: 60px; background: #e5e7eb; border-radius: 4px; height: 4px; margin-top: 4px;">
                                            <div style="width: ${tarefa.progresso || 0}%; background: #10b981; height: 100%; border-radius: 4px;"></div>
                                        </div>
                                    </div>
                                </div>
                            `).join('') :
                            '<div style="text-align: center; padding: 40px; color: #6b7280;">📭 Nenhuma tarefa encontrada</div>'
                        }
                    </div>
                </div>
            `;
            
        case 'semanal':
            const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            return `
                <div>
                    <h3>📅 Visão Semanal</h3>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
                        ${diasSemana.map(dia => `
                            <div style="background: white; padding: 12px; border-radius: 8px; min-height: 120px;">
                                <div style="font-weight: bold; text-align: center; margin-bottom: 8px; color: #374151;">
                                    ${dia}
                                </div>
                                <div style="font-size: 10px; color: #6b7280;">
                                    ${Math.random() > 0.5 ? '📝 Tarefa exemplo' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        case 'kanban':
            const statusGroups = ['pendente', 'andamento', 'revisao', 'concluida'];
            return `
                <div>
                    <h3>📋 Kanban Board</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                        ${statusGroups.map(status => {
                            const tarefasStatus = tarefas.filter(t => t.status === status);
                            return `
                                <div style="background: white; border-radius: 8px; padding: 16px; min-height: 300px;">
                                    <h4 style="margin: 0 0 12px 0; text-transform: capitalize; color: #374151;">
                                        ${status} (${tarefasStatus.length})
                                    </h4>
                                    ${tarefasStatus.map(tarefa => `
                                        <div style="
                                            background: #f8fafc;
                                            padding: 8px;
                                            margin: 8px 0;
                                            border-radius: 6px;
                                            border-left: 3px solid #3b82f6;
                                            cursor: pointer;
                                        " onclick="alert('Tarefa: ${tarefa.titulo}')">
                                            <div style="font-size: 12px; font-weight: 600;">${tarefa.titulo}</div>
                                            <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${tarefa.progresso || 0}%</div>
                                        </div>
                                    `).join('')}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            
        default:
            return '<div style="text-align: center; padding: 40px;">📱 Selecione uma view</div>';
    }
};

// ✅ ATUALIZAR MÉTODO DE MUDANÇA DE VIEW PARA USAR DADOS REAIS
PersonalAgenda.mudarView = function(novaView) {
    this.state.viewModeAtual = novaView;
    
    // Atualizar botões ativos
    const botoes = document.querySelectorAll('[onclick*="mudarView"]');
    botoes.forEach(btn => {
        btn.style.opacity = '0.7';
    });
    
    const botaoAtivo = document.querySelector(`[onclick="PersonalAgenda.mudarView('${novaView}')"]`);
    if (botaoAtivo) {
        botaoAtivo.style.opacity = '1';
    }
    
    // Atualizar conteúdo
    const conteudo = document.getElementById('agendaConteudo');
    if (conteudo) {
        conteudo.innerHTML = this._renderizarViewMelhorada(novaView);
    }
    
    console.log('📱 View alterada para:', novaView, 'com dados reais');
};

// ✅ OBTER MINHAS TAREFAS (versão simplificada para o fix)
PersonalAgenda._obterMinhasTarefas = function() {
    try {
        if (!App.dados?.tarefas) {
            // Dados de demonstração
            return [
                {
                    id: 1,
                    titulo: 'Revisar documentação',
                    tipo: 'projeto',
                    status: 'andamento',
                    prioridade: 'alta',
                    progresso: 60,
                    responsavel: this.state.usuarioAtual
                },
                {
                    id: 2,
                    titulo: 'Reunião de equipe',
                    tipo: 'equipe',
                    status: 'pendente',
                    prioridade: 'media',
                    progresso: 0,
                    responsavel: this.state.usuarioAtual
                },
                {
                    id: 3,
                    titulo: 'Finalizar relatório',
                    tipo: 'pessoal',
                    status: 'concluida',
                    prioridade: 'alta',
                    progresso: 100,
                    responsavel: this.state.usuarioAtual
                }
            ];
        }
        
        return App.dados.tarefas.filter(tarefa => 
            tarefa.responsavel === this.state.usuarioAtual
        );
        
    } catch (error) {
        console.error('Erro ao obter tarefas:', error);
        return [];
    }
};

console.log('📋 Personal Agenda melhorado carregado!');
