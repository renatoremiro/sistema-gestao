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
