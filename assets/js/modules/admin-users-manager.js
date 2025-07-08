/**
 * 🏢 EXPANSÃO ADMIN - GESTÃO DE ÁREAS v8.3
 * 
 * 🎯 ADICIONADO AO AdminUsersManager:
 * - ✅ CRUD completo de áreas (Create, Read, Update, Delete)  
 * - ✅ Sistema de abas (Usuários | Áreas)
 * - ✅ Seleção de coordenador da lista de usuários
 * - ✅ Seleção de equipe com múltipla escolha
 * - ✅ Picker de cores para as áreas
 * - ✅ Persistência no Firebase
 */

// 🔥 EXPANDIR AdminUsersManager EXISTENTE
Object.assign(AdminUsersManager, {
    
    // ✅ ESTADO EXPANDIDO PARA ÁREAS
    estadoAreas: {
        abaAtiva: 'usuarios', // 'usuarios' | 'areas'
        modoEdicaoArea: false,
        areaEditando: null,
        areasCarregadas: false
    },

    // 🎨 SOBRESCREVER CRIAÇÃO DO MODAL PARA INCLUIR ABAS
    _criarModalGestao() {
        const modal = document.createElement('div');
        modal.id = 'modalGestaoUsuarios';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                width: 95%;
                max-width: 1200px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
            ">
                <!-- Header -->
                <div style="
                    background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%);
                    color: white;
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700;">
                            👑 Administração BIAPO
                        </h2>
                        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                            Gestão Completa - Usuários & Áreas - v8.3
                        </p>
                    </div>
                    <button onclick="AdminUsersManager.fecharModal()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">✕</button>
                </div>

                <!-- Abas -->
                <div style="
                    display: flex;
                    background: #f9fafb;
                    border-bottom: 2px solid #e5e7eb;
                ">
                    <button 
                        id="abaUsuarios"
                        onclick="AdminUsersManager.trocarAba('usuarios')" 
                        style="
                            flex: 1;
                            padding: 16px 24px;
                            border: none;
                            background: ${this.estadoAreas.abaAtiva === 'usuarios' ? 'white' : 'transparent'};
                            color: ${this.estadoAreas.abaAtiva === 'usuarios' ? '#C53030' : '#6b7280'};
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            border-bottom: 3px solid ${this.estadoAreas.abaAtiva === 'usuarios' ? '#C53030' : 'transparent'};
                            transition: all 0.3s ease;
                        "
                    >
                        👥 Usuários (${this._contarUsuarios()})
                    </button>
                    
                    <button 
                        id="abaAreas"
                        onclick="AdminUsersManager.trocarAba('areas')" 
                        style="
                            flex: 1;
                            padding: 16px 24px;
                            border: none;
                            background: ${this.estadoAreas.abaAtiva === 'areas' ? 'white' : 'transparent'};
                            color: ${this.estadoAreas.abaAtiva === 'areas' ? '#C53030' : '#6b7280'};
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            border-bottom: 3px solid ${this.estadoAreas.abaAtiva === 'areas' ? '#C53030' : 'transparent'};
                            transition: all 0.3s ease;
                        "
                    >
                        🏢 Áreas (${this._contarAreas()})
                    </button>
                </div>

                <!-- Toolbar -->
                <div style="
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                ">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button onclick="AdminUsersManager._atualizarAbaAtiva()" style="
                            background: #374151;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                        ">🔄 Atualizar</button>
                        
                        <span style="color: #6b7280; font-size: 14px;" id="contadorItens">
                            Carregando...
                        </span>
                    </div>
                    
                    <button id="botaoNovo" onclick="AdminUsersManager._abrirFormularioNovo()" style="
                        background: linear-gradient(135deg, #059669 0%, #047857 100%);
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    ">
                        ➕ Novo
                    </button>
                </div>

                <!-- Conteúdo -->
                <div style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 0;
                ">
                    <div id="conteudoGestaoUsuarios">
                        <div style="padding: 40px; text-align: center; color: #6b7280;">
                            <div style="font-size: 40px; margin-bottom: 16px;">⏳</div>
                            <div>Carregando...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event listener para fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.fecharModal();
            }
        });

        return modal;
    },

    // 🔄 TROCAR ABA
    trocarAba(aba) {
        this.estadoAreas.abaAtiva = aba;
        
        // Atualizar visual das abas
        this._atualizarVisualAbas();
        
        // Carregar conteúdo da aba
        this._atualizarAbaAtiva();
        
        console.log(`🔄 Aba trocada para: ${aba}`);
    },

    // 🎨 ATUALIZAR VISUAL DAS ABAS
    _atualizarVisualAbas() {
        const abaUsuarios = document.getElementById('abaUsuarios');
        const abaAreas = document.getElementById('abaAreas');
        const botaoNovo = document.getElementById('botaoNovo');

        if (abaUsuarios && abaAreas && botaoNovo) {
            const isUsuarios = this.estadoAreas.abaAtiva === 'usuarios';
            
            // Aba Usuários
            abaUsuarios.style.background = isUsuarios ? 'white' : 'transparent';
            abaUsuarios.style.color = isUsuarios ? '#C53030' : '#6b7280';
            abaUsuarios.style.borderBottom = `3px solid ${isUsuarios ? '#C53030' : 'transparent'}`;
            
            // Aba Áreas
            abaAreas.style.background = !isUsuarios ? 'white' : 'transparent';
            abaAreas.style.color = !isUsuarios ? '#C53030' : '#6b7280';
            abaAreas.style.borderBottom = `3px solid ${!isUsuarios ? '#C53030' : 'transparent'}`;
            
            // Botão Novo
            botaoNovo.innerHTML = isUsuarios ? 
                '➕ Novo Usuário' : 
                '➕ Nova Área';
        }
    },

    // 🔄 ATUALIZAR ABA ATIVA
    _atualizarAbaAtiva() {
        if (this.estadoAreas.abaAtiva === 'usuarios') {
            this._renderizarListaUsuarios();
        } else {
            this._renderizarListaAreas();
        }
    },

    // 📝 ABRIR FORMULÁRIO NOVO (GENÉRICO)
    _abrirFormularioNovo() {
        if (this.estadoAreas.abaAtiva === 'usuarios') {
            this.abrirFormularioNovo();
        } else {
            this.abrirFormularioNovaArea();
        }
    },

    // 📊 CONTAR USUÁRIOS
    _contarUsuarios() {
        return typeof Auth !== 'undefined' && Auth.equipe ? Object.keys(Auth.equipe).length : 0;
    },

    // 📊 CONTAR ÁREAS
    _contarAreas() {
        return this._obterAreas().length;
    },

    // ==================== GESTÃO DE ÁREAS ====================

    // 📋 RENDERIZAR LISTA DE ÁREAS
    _renderizarListaAreas() {
        const container = document.getElementById('conteudoGestaoUsuarios');
        if (!container) return;

        const areas = this._obterAreas();
        
        // Atualizar contador
        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `${areas.length} áreas cadastradas`;
        }

        container.innerHTML = `
            <div style="padding: 0;">
                <!-- Header da tabela -->
                <div style="
                    display: grid;
                    grid-template-columns: 2fr 1.5fr 1.5fr 100px 120px;
                    gap: 16px;
                    padding: 16px 24px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    font-weight: 600;
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                ">
                    <div>Área / Coordenador</div>
                    <div>Equipe</div>
                    <div>Atividades</div>
                    <div>Cor</div>
                    <div>Ações</div>
                </div>

                <!-- Lista de áreas -->
                <div style="max-height: 400px; overflow-y: auto;">
                    ${areas.map(area => this._renderizarItemArea(area)).join('')}
                </div>
                
                ${areas.length === 0 ? `
                    <div style="padding: 60px 24px; text-align: center; color: #6b7280;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🏢</div>
                        <div style="font-size: 18px; margin-bottom: 8px;">Nenhuma área cadastrada</div>
                        <div style="font-size: 14px;">Clique em "Nova Área" para começar</div>
                    </div>
                ` : ''}
            </div>
        `;

        console.log(`📋 Lista de áreas renderizada: ${areas.length} áreas`);
    },

    // 🏢 RENDERIZAR ITEM DE ÁREA
    _renderizarItemArea(area) {
        const chave = area._key;
        const totalEquipe = area.equipe ? area.equipe.length : 0;
        const totalAtividades = area.atividades ? area.atividades.length : 0;

        return `
            <div style="
                display: grid;
                grid-template-columns: 2fr 1.5fr 1.5fr 100px 120px;
                gap: 16px;
                padding: 20px 24px;
                border-bottom: 1px solid #f3f4f6;
                align-items: center;
                transition: background-color 0.2s ease;
            " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
                
                <!-- Área / Coordenador -->
                <div>
                    <div style="font-weight: 700; color: #1f2937; margin-bottom: 4px; font-size: 16px;">
                        ${area.nome}
                    </div>
                    <div style="font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px;">
                        <span>👤</span>
                        <span>${area.coordenador}</span>
                    </div>
                </div>

                <!-- Equipe -->
                <div>
                    <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">
                        👥 ${totalEquipe} membro${totalEquipe !== 1 ? 's' : ''}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ${area.equipe && area.equipe.length > 0 ? 
                            area.equipe.slice(0, 2).map(nome => nome.split(' ')[0]).join(', ') + 
                            (area.equipe.length > 2 ? ` +${area.equipe.length - 2}` : '') :
                            'Sem membros'
                        }
                    </div>
                </div>

                <!-- Atividades -->
                <div>
                    <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">
                        📋 ${totalAtividades} atividade${totalAtividades !== 1 ? 's' : ''}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ${this._obterStatusAtividades(area.atividades)}
                    </div>
                </div>

                <!-- Cor -->
                <div style="text-align: center;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: ${area.cor || '#6b7280'};
                        border-radius: 8px;
                        margin: 0 auto;
                        border: 2px solid rgba(255,255,255,0.2);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    "></div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">
                        ${area.cor || '#6b7280'}
                    </div>
                </div>

                <!-- Ações -->
                <div style="display: flex; gap: 6px;">
                    <button onclick="AdminUsersManager.editarArea('${chave}')" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        width: 32px;
                        height: 32px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " title="Editar área">✏️</button>
                    
                    <button onclick="AdminUsersManager.confirmarExclusaoArea('${chave}')" style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        width: 32px;
                        height: 32px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " title="Excluir área">🗑️</button>
                </div>
            </div>
        `;
    },

    // 📊 OBTER STATUS DAS ATIVIDADES
    _obterStatusAtividades(atividades) {
        if (!atividades || atividades.length === 0) {
            return 'Nenhuma atividade';
        }

        const verde = atividades.filter(a => a.status === 'verde' || a.status === 'concluido').length;
        const amarelo = atividades.filter(a => a.status === 'amarelo' || a.status === 'em andamento').length;
        const vermelho = atividades.filter(a => a.status === 'vermelho' || a.status === 'atraso').length;

        const partes = [];
        if (verde > 0) partes.push(`🟢 ${verde}`);
        if (amarelo > 0) partes.push(`🟡 ${amarelo}`);
        if (vermelho > 0) partes.push(`🔴 ${vermelho}`);

        return partes.join(' ');
    },

    // 📋 OBTER ÁREAS
    _obterAreas() {
        // Tentar obter de App.dados primeiro
        if (typeof App !== 'undefined' && App.dados && App.dados.areas) {
            return Object.keys(App.dados.areas).map(key => ({
                ...App.dados.areas[key],
                _key: key
            }));
        }

        // Fallback para DataStructure
        if (typeof DataStructure !== 'undefined' && DataStructure.inicializarDados) {
            const dados = DataStructure.inicializarDados();
            return Object.keys(dados.areas).map(key => ({
                ...dados.areas[key],
                _key: key
            }));
        }

        return [];
    },

    // ➕ NOVA ÁREA
    abrirFormularioNovaArea() {
        this.estadoAreas.modoEdicaoArea = false;
        this.estadoAreas.areaEditando = null;
        this._abrirFormularioArea();
    },

    // ✏️ EDITAR ÁREA
    editarArea(chaveArea) {
        const areas = this._obterAreas();
        const area = areas.find(a => a._key === chaveArea);
        
        if (!area) {
            console.error('❌ Área não encontrada:', chaveArea);
            return;
        }

        this.estadoAreas.modoEdicaoArea = true;
        this.estadoAreas.areaEditando = chaveArea;
        this._abrirFormularioArea(area);
    },

    // 🎨 ABRIR FORMULÁRIO DE ÁREA
    _abrirFormularioArea(dadosArea = null) {
        const container = document.getElementById('conteudoGestaoUsuarios');
        if (!container) return;

        const isEdicao = this.estadoAreas.modoEdicaoArea;
        const titulo = isEdicao ? '✏️ Editar Área' : '➕ Nova Área';
        const usuarios = this._obterListaUsuarios();

        container.innerHTML = `
            <div style="padding: 24px;">
                <!-- Header do formulário -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #e5e7eb;
                ">
                    <h3 style="margin: 0; font-size: 18px; color: #1f2937;">${titulo}</h3>
                    <button onclick="AdminUsersManager._renderizarListaAreas()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">⬅️ Voltar</button>
                </div>

                <!-- Formulário -->
                <form id="formularioArea" style="max-width: 800px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <!-- Nome da Área -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">🏢 Nome da Área *</label>
                            <input 
                                type="text" 
                                id="inputNomeArea" 
                                value="${dadosArea?.nome || ''}"
                                placeholder="Ex: Desenvolvimento de Software"
                                required
                                style="
                                    width: 100%;
                                    padding: 12px;
                                    border: 2px solid #e5e7eb;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    box-sizing: border-box;
                                "
                            >
                        </div>

                        <!-- Coordenador -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">👤 Coordenador *</label>
                            <select 
                                id="inputCoordenador" 
                                required
                                style="
                                    width: 100%;
                                    padding: 12px;
                                    border: 2px solid #e5e7eb;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    box-sizing: border-box;
                                "
                            >
                                <option value="">Selecionar coordenador...</option>
                                ${usuarios.map(user => `
                                    <option value="${user.nome}" ${dadosArea?.coordenador === user.nome ? 'selected' : ''}>
                                        ${user.nome} - ${user.cargo}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Cor da Área -->
                    <div style="margin-bottom: 20px;">
                        <label style="
                            display: block;
                            margin-bottom: 6px;
                            font-weight: 600;
                            color: #374151;
                            font-size: 14px;
                        ">🎨 Cor da Área *</label>
                        
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <!-- Input de cor -->
                            <input 
                                type="color" 
                                id="inputCor" 
                                value="${dadosArea?.cor || '#C53030'}"
                                style="
                                    width: 60px;
                                    height: 44px;
                                    border: 2px solid #e5e7eb;
                                    border-radius: 8px;
                                    cursor: pointer;
                                "
                            >
                            
                            <!-- Cores predefinidas -->
                            <div style="display: flex; gap: 8px;">
                                ${[
                                    '#C53030', '#DD6B20', '#2D3748', '#38A169', 
                                    '#3182CE', '#805AD5', '#D53F8C', '#718096'
                                ].map(cor => `
                                    <button type="button" onclick="document.getElementById('inputCor').value='${cor}'" style="
                                        width: 32px;
                                        height: 32px;
                                        background: ${cor};
                                        border: 2px solid #e5e7eb;
                                        border-radius: 6px;
                                        cursor: pointer;
                                    " title="${cor}"></button>
                                `).join('')}
                            </div>
                            
                            <!-- Preview -->
                            <div style="
                                padding: 8px 16px;
                                background: var(--preview-color, ${dadosArea?.cor || '#C53030'});
                                color: white;
                                border-radius: 6px;
                                font-size: 12px;
                                font-weight: 600;
                            " id="previewCor">Preview</div>
                        </div>
                    </div>

                    <!-- Equipe -->
                    <div style="margin-bottom: 30px;">
                        <label style="
                            display: block;
                            margin-bottom: 6px;
                            font-weight: 600;
                            color: #374151;
                            font-size: 14px;
                        ">👥 Membros da Equipe</label>
                        
                        <div style="
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 16px;
                            background: #f9fafb;
                            max-height: 200px;
                            overflow-y: auto;
                        ">
                            ${usuarios.map(user => `
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    padding: 8px;
                                    margin-bottom: 4px;
                                    cursor: pointer;
                                    border-radius: 6px;
                                    transition: background-color 0.2s ease;
                                " onmouseover="this.style.backgroundColor='#e5e7eb'" onmouseout="this.style.backgroundColor='transparent'">
                                    <input 
                                        type="checkbox" 
                                        name="equipe" 
                                        value="${user.nome}"
                                        ${dadosArea?.equipe && dadosArea.equipe.includes(user.nome) ? 'checked' : ''}
                                        style="width: 16px; height: 16px;"
                                    >
                                    <div>
                                        <div style="font-weight: 500; color: #1f2937;">${user.nome}</div>
                                        <div style="font-size: 12px; color: #6b7280;">${user.cargo} - ${user.departamento}</div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Botões -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" onclick="AdminUsersManager._renderizarListaAreas()" style="
                            background: #6b7280;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                        ">Cancelar</button>

                        <button type="submit" style="
                            background: linear-gradient(135deg, #059669 0%, #047857 100%);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                        ">${isEdicao ? '✅ Atualizar' : '➕ Criar'} Área</button>
                    </div>
                </form>
            </div>
        `;

        // Event listeners
        const form = document.getElementById('formularioArea');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this._processarFormularioArea();
            });
        }

        // Preview da cor
        const inputCor = document.getElementById('inputCor');
        const preview = document.getElementById('previewCor');
        if (inputCor && preview) {
            inputCor.addEventListener('input', (e) => {
                preview.style.background = e.target.value;
            });
        }
    },

    // 📝 PROCESSAR FORMULÁRIO DE ÁREA
    _processarFormularioArea() {
        try {
            // Coletar dados do formulário
            const dados = {
                nome: document.getElementById('inputNomeArea').value.trim(),
                coordenador: document.getElementById('inputCoordenador').value,
                cor: document.getElementById('inputCor').value,
                equipe: Array.from(document.querySelectorAll('input[name="equipe"]:checked')).map(cb => cb.value),
                atividades: [] // Manter atividades existentes ou começar vazio
            };

            // Se estiver editando, manter atividades existentes
            if (this.estadoAreas.modoEdicaoArea) {
                const areas = this._obterAreas();
                const areaAtual = areas.find(a => a._key === this.estadoAreas.areaEditando);
                if (areaAtual && areaAtual.atividades) {
                    dados.atividades = areaAtual.atividades;
                }
            }

            // Validar dados
            if (!this._validarDadosArea(dados)) {
                return;
            }

            if (this.estadoAreas.modoEdicaoArea) {
                this._atualizarArea(this.estadoAreas.areaEditando, dados);
            } else {
                this._criarNovaArea(dados);
            }

        } catch (error) {
            console.error('❌ Erro ao processar formulário de área:', error);
            this._mostrarMensagem('Erro ao processar formulário', 'error');
        }
    },

    // ✅ VALIDAR DADOS DA ÁREA
    _validarDadosArea(dados) {
        if (!dados.nome) {
            this._mostrarMensagem('Nome da área é obrigatório', 'error');
            return false;
        }

        if (!dados.coordenador) {
            this._mostrarMensagem('Coordenador é obrigatório', 'error');
            return false;
        }

        if (!dados.cor) {
            this._mostrarMensagem('Cor da área é obrigatória', 'error');
            return false;
        }

        return true;
    },

    // ➕ CRIAR NOVA ÁREA
    _criarNovaArea(dados) {
        try {
            // Gerar chave única
            const chave = 'area-' + dados.nome.toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 20);

            // Verificar se App.dados existe
            if (typeof App === 'undefined' || !App.dados) {
                throw new Error('Sistema App não disponível');
            }

            // Adicionar aos dados do App
            if (!App.dados.areas) App.dados.areas = {};
            
            App.dados.areas[chave] = {
                nome: dados.nome,
                coordenador: dados.coordenador,
                cor: dados.cor,
                equipe: dados.equipe,
                atividades: dados.atividades
            };

            console.log(`✅ Área criada: ${dados.nome} (${chave})`);
            this._mostrarMensagem(`Área ${dados.nome} criada com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarAreasNoFirebase();

            // Voltar para lista
            this._renderizarListaAreas();

        } catch (error) {
            console.error('❌ Erro ao criar área:', error);
            this._mostrarMensagem('Erro ao criar área', 'error');
        }
    },

    // ✏️ ATUALIZAR ÁREA
    _atualizarArea(chave, dados) {
        try {
            if (typeof App === 'undefined' || !App.dados || !App.dados.areas || !App.dados.areas[chave]) {
                throw new Error('Área não encontrada');
            }

            // Atualizar dados
            App.dados.areas[chave] = {
                ...App.dados.areas[chave],
                nome: dados.nome,
                coordenador: dados.coordenador,
                cor: dados.cor,
                equipe: dados.equipe,
                atividades: dados.atividades
            };

            console.log(`✅ Área atualizada: ${dados.nome} (${chave})`);
            this._mostrarMensagem(`Área ${dados.nome} atualizada com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarAreasNoFirebase();

            // Voltar para lista
            this._renderizarListaAreas();

        } catch (error) {
            console.error('❌ Erro ao atualizar área:', error);
            this._mostrarMensagem('Erro ao atualizar área', 'error');
        }
    },

    // 🗑️ CONFIRMAR EXCLUSÃO DE ÁREA
    confirmarExclusaoArea(chaveArea) {
        const areas = this._obterAreas();
        const area = areas.find(a => a._key === chaveArea);
        
        if (!area) {
            console.error('❌ Área não encontrada:', chaveArea);
            return;
        }

        const confirmacao = confirm(
            `⚠️ ATENÇÃO!\n\n` +
            `Tem certeza que deseja excluir a área:\n\n` +
            `🏢 ${area.nome}\n` +
            `👤 Coordenador: ${area.coordenador}\n` +
            `👥 Equipe: ${area.equipe ? area.equipe.length : 0} membros\n` +
            `📋 Atividades: ${area.atividades ? area.atividades.length : 0}\n\n` +
            `Esta ação não pode ser desfeita!`
        );

        if (confirmacao) {
            this._excluirArea(chaveArea);
        }
    },

    // 🗑️ EXCLUIR ÁREA
    _excluirArea(chaveArea) {
        try {
            const areas = this._obterAreas();
            const area = areas.find(a => a._key === chaveArea);
            
            if (!area) {
                throw new Error('Área não encontrada');
            }

            // Remover dos dados do App
            if (App.dados && App.dados.areas) {
                delete App.dados.areas[chaveArea];
            }

            console.log(`🗑️ Área excluída: ${area.nome} (${chaveArea})`);
            this._mostrarMensagem(`Área ${area.nome} excluída com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarAreasNoFirebase();

            // Atualizar lista
            this._renderizarListaAreas();

        } catch (error) {
            console.error('❌ Erro ao excluir área:', error);
            this._mostrarMensagem('Erro ao excluir área', 'error');
        }
    },

    // 💾 SALVAR ÁREAS NO FIREBASE
    async _salvarAreasNoFirebase() {
        try {
            if (typeof database === 'undefined' || !database) {
                console.warn('⚠️ Firebase não disponível');
                return;
            }

            if (!App.dados || !App.dados.areas) {
                console.warn('⚠️ Dados de áreas não disponíveis');
                return;
            }

            // Salvar em dados/areas
            await database.ref('dados/areas').set(App.dados.areas);
            console.log('💾 Áreas salvas no Firebase');

        } catch (error) {
            console.error('❌ Erro ao salvar áreas no Firebase:', error);
        }
    }
});

console.log('🔥 AdminUsersManager expandido com Gestão de Áreas v8.3!');

/*
========== 🏢 FUNCIONALIDADES DE ÁREAS ADICIONADAS ==========

✅ CRUD COMPLETO DE ÁREAS:
- Criar novas áreas com coordenador e equipe
- Listar todas as áreas com informações visuais
- Editar dados de áreas existentes
- Excluir áreas com confirmação

✅ INTERFACE AVANÇADA:
- Sistema de abas (Usuários | Áreas)
- Seleção de coordenador da lista de usuários
- Seleção múltipla de equipe
- Picker de cores com predefinições
- Preview visual das cores

✅ INTEGRAÇÃO COMPLETA:
- Usa App.dados.areas
- Salva no Firebase em /dados/areas
- Mantém atividades existentes
- Contadores automáticos

✅ VALIDAÇÕES:
- Nome obrigatório
- Coordenador obrigatório  
- Cor obrigatória
- Equipe opcional mas visual

🎯 RESULTADO:
Renato agora pode gerenciar TUDO:
- 👥 Usuários da equipe BIAPO
- 🏢 Áreas organizacionais
- 📊 Interface unificada e moderna
- 💾 Tudo salvo automaticamente

========== 🚀 EXPANSÃO COMPLETA IMPLEMENTADA ==========
*/
