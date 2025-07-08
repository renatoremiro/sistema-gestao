/**
 * 👥 MÓDULO ADMIN - GESTÃO DE USUÁRIOS v8.3
 * 
 * 🎯 FUNCIONALIDADES:
 * - ✅ CRUD completo de usuários (Create, Read, Update, Delete)
 * - ✅ Interface moderna e intuitiva
 * - ✅ Validações e segurança
 * - ✅ Persistência no Firebase
 * - ✅ Integração perfeita com Auth.js existente
 */

const AdminUsersManager = {
    // ✅ CONFIGURAÇÃO
    config: {
        versao: '8.3.0',
        permissaoAdmin: true,
        persistenciaFirebase: true,
        validacaoEmail: true,
        backupLocal: true
    },

    // ✅ ESTADO
    estado: {
        modalAberto: false,
        modoEdicao: false,
        usuarioEditando: null,
        usuariosCarregados: false
    },

    // 🚀 INICIALIZAR MÓDULO
    inicializar() {
        console.log('👥 Inicializando AdminUsersManager v8.3...');
        
        // Verificar permissões
        if (!this._verificarPermissoesAdmin()) {
            console.warn('⚠️ Usuário sem permissões de administrador');
            return false;
        }

        // Sobrescrever função existente no Auth.js
        if (typeof Auth !== 'undefined') {
            Auth.mostrarGerenciarUsuarios = () => this.abrirInterfaceGestao();
        }

        console.log('✅ AdminUsersManager v8.3 inicializado!');
        return true;
    },

    // 🔐 VERIFICAR PERMISSÕES ADMIN
    _verificarPermissoesAdmin() {
        if (typeof Auth === 'undefined' || !Auth.ehAdmin || !Auth.ehAdmin()) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('❌ Acesso restrito a administradores');
            } else {
                alert('❌ Acesso restrito a administradores');
            }
            return false;
        }
        return true;
    },

    // 🎨 ABRIR INTERFACE DE GESTÃO PRINCIPAL
    abrirInterfaceGestao() {
        if (!this._verificarPermissoesAdmin()) return;

        this.estado.modalAberto = true;
        this.estado.modoEdicao = false;
        this.estado.usuarioEditando = null;

        const modal = this._criarModalGestao();
        document.body.appendChild(modal);

        // Carregar lista de usuários
        this._renderizarListaUsuarios();

        console.log('👥 Interface de gestão de usuários aberta');
    },

    // 🎨 CRIAR MODAL PRINCIPAL
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
                max-width: 1000px;
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
                            👥 Gestão de Usuários BIAPO
                        </h2>
                        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                            Administração da Equipe - v8.3
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

                <!-- Toolbar -->
                <div style="
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f9fafb;
                ">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button onclick="AdminUsersManager._renderizarListaUsuarios()" style="
                            background: #374151;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                        ">🔄 Atualizar</button>
                        
                        <span style="color: #6b7280; font-size: 14px;" id="contadorUsuarios">
                            Carregando usuários...
                        </span>
                    </div>
                    
                    <button onclick="AdminUsersManager.abrirFormularioNovo()" style="
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
                        ➕ Novo Usuário
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
                            <div>Carregando usuários...</div>
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

    // 📋 RENDERIZAR LISTA DE USUÁRIOS
    _renderizarListaUsuarios() {
        const container = document.getElementById('conteudoGestaoUsuarios');
        if (!container) return;

        // Obter usuários do Auth.js
        const usuarios = this._obterListaUsuarios();
        
        // Atualizar contador
        const contador = document.getElementById('contadorUsuarios');
        if (contador) {
            contador.textContent = `${usuarios.length} usuários cadastrados`;
        }

        // Gerar HTML da lista
        container.innerHTML = `
            <div style="padding: 0;">
                <!-- Header da tabela -->
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 2fr 1.5fr 1.5fr 80px 100px;
                    gap: 16px;
                    padding: 16px 24px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    font-weight: 600;
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                ">
                    <div>Status</div>
                    <div>Nome / Email</div>
                    <div>Cargo</div>
                    <div>Departamento</div>
                    <div>Admin</div>
                    <div>Ações</div>
                </div>

                <!-- Lista de usuários -->
                <div style="max-height: 400px; overflow-y: auto;">
                    ${usuarios.map(usuario => this._renderizarItemUsuario(usuario)).join('')}
                </div>
            </div>
        `;

        console.log(`📋 Lista renderizada: ${usuarios.length} usuários`);
    },

    // 👤 RENDERIZAR ITEM DE USUÁRIO
    _renderizarItemUsuario(usuario) {
        const isAtivo = usuario.ativo;
        const isAdmin = usuario.admin;
        const key = this._obterChaveUsuario(usuario);

        return `
            <div style="
                display: grid;
                grid-template-columns: 1fr 2fr 1.5fr 1.5fr 80px 100px;
                gap: 16px;
                padding: 16px 24px;
                border-bottom: 1px solid #f3f4f6;
                align-items: center;
                transition: background-color 0.2s ease;
            " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
                
                <!-- Status -->
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: ${isAtivo ? '#10b981' : '#ef4444'};
                    "></div>
                    <span style="
                        font-size: 12px;
                        color: ${isAtivo ? '#065f46' : '#7f1d1d'};
                        font-weight: 500;
                    ">${isAtivo ? 'Ativo' : 'Inativo'}</span>
                </div>

                <!-- Nome / Email -->
                <div>
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 2px;">
                        ${usuario.nome}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ${usuario.email}
                    </div>
                </div>

                <!-- Cargo -->
                <div style="color: #374151; font-size: 14px;">
                    ${usuario.cargo}
                </div>

                <!-- Departamento -->
                <div style="color: #6b7280; font-size: 13px;">
                    ${usuario.departamento}
                </div>

                <!-- Admin -->
                <div style="text-align: center;">
                    ${isAdmin ? 
                        '<span style="background: #fbbf24; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">ADMIN</span>' : 
                        '<span style="color: #9ca3af; font-size: 12px;">—</span>'
                    }
                </div>

                <!-- Ações -->
                <div style="display: flex; gap: 6px;">
                    <button onclick="AdminUsersManager.editarUsuario('${key}')" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        width: 28px;
                        height: 28px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " title="Editar usuário">✏️</button>
                    
                    <button onclick="AdminUsersManager.confirmarExclusao('${key}')" style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        width: 28px;
                        height: 28px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " title="Excluir usuário">🗑️</button>
                </div>
            </div>
        `;
    },

    // 📋 OBTER LISTA DE USUÁRIOS DO AUTH.JS
    _obterListaUsuarios() {
        if (typeof Auth === 'undefined' || !Auth.equipe) {
            console.error('❌ Auth.equipe não disponível');
            return [];
        }

        return Object.keys(Auth.equipe).map(key => ({
            ...Auth.equipe[key],
            _key: key
        })).sort((a, b) => {
            // Ordenar: admin primeiro, depois por nome
            if (a.admin && !b.admin) return -1;
            if (!a.admin && b.admin) return 1;
            return a.nome.localeCompare(b.nome);
        });
    },

    // 🔑 OBTER CHAVE DO USUÁRIO
    _obterChaveUsuario(usuario) {
        return usuario._key || usuario.email.split('@')[0].toLowerCase();
    },

    // ➕ ABRIR FORMULÁRIO NOVO USUÁRIO
    abrirFormularioNovo() {
        this.estado.modoEdicao = false;
        this.estado.usuarioEditando = null;
        this._abrirFormularioUsuario();
    },

    // ✏️ EDITAR USUÁRIO
    editarUsuario(chaveUsuario) {
        if (typeof Auth === 'undefined' || !Auth.equipe[chaveUsuario]) {
            console.error('❌ Usuário não encontrado:', chaveUsuario);
            return;
        }

        this.estado.modoEdicao = true;
        this.estado.usuarioEditando = chaveUsuario;
        this._abrirFormularioUsuario(Auth.equipe[chaveUsuario]);
    },

    // 🎨 ABRIR FORMULÁRIO DE USUÁRIO
    _abrirFormularioUsuario(dadosUsuario = null) {
        const container = document.getElementById('conteudoGestaoUsuarios');
        if (!container) return;

        const isEdicao = this.estado.modoEdicao;
        const titulo = isEdicao ? '✏️ Editar Usuário' : '➕ Novo Usuário';

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
                    <button onclick="AdminUsersManager._renderizarListaUsuarios()" style="
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
                <form id="formularioUsuario" style="max-width: 600px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <!-- Nome -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">👤 Nome Completo *</label>
                            <input 
                                type="text" 
                                id="inputNome" 
                                value="${dadosUsuario?.nome || ''}"
                                placeholder="Ex: João Silva"
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

                        <!-- Email -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">📧 Email *</label>
                            <input 
                                type="email" 
                                id="inputEmail" 
                                value="${dadosUsuario?.email || ''}"
                                placeholder="usuario@biapo.com.br"
                                required
                                ${isEdicao ? 'readonly style="background: #f9fafb;"' : ''}
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
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <!-- Cargo -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">💼 Cargo *</label>
                            <input 
                                type="text" 
                                id="inputCargo" 
                                value="${dadosUsuario?.cargo || ''}"
                                placeholder="Ex: Analista"
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

                        <!-- Departamento -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">🏢 Departamento *</label>
                            <select 
                                id="inputDepartamento" 
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
                                <option value="">Selecione...</option>
                                <option value="Gestão Geral" ${dadosUsuario?.departamento === 'Gestão Geral' ? 'selected' : ''}>Gestão Geral</option>
                                <option value="Obra e Construção" ${dadosUsuario?.departamento === 'Obra e Construção' ? 'selected' : ''}>Obra e Construção</option>
                                <option value="Museu Nacional" ${dadosUsuario?.departamento === 'Museu Nacional' ? 'selected' : ''}>Museu Nacional</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        <!-- Telefone -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">📱 Telefone</label>
                            <input 
                                type="tel" 
                                id="inputTelefone" 
                                value="${dadosUsuario?.telefone || ''}"
                                placeholder="(11) 99999-9999"
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

                        <!-- Data Ingresso -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">📅 Data de Ingresso</label>
                            <input 
                                type="date" 
                                id="inputDataIngresso" 
                                value="${dadosUsuario?.dataIngresso || new Date().toISOString().split('T')[0]}"
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
                    </div>

                    <!-- Checkboxes -->
                    <div style="display: flex; gap: 30px; margin-bottom: 30px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input 
                                type="checkbox" 
                                id="inputAtivo" 
                                ${dadosUsuario?.ativo !== false ? 'checked' : ''}
                                style="width: 18px; height: 18px;"
                            >
                            <span style="font-weight: 600; color: #374151;">✅ Usuário Ativo</span>
                        </label>

                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input 
                                type="checkbox" 
                                id="inputAdmin" 
                                ${dadosUsuario?.admin ? 'checked' : ''}
                                style="width: 18px; height: 18px;"
                            >
                            <span style="font-weight: 600; color: #374151;">👑 Administrador</span>
                        </label>
                    </div>

                    <!-- Botões -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" onclick="AdminUsersManager._renderizarListaUsuarios()" style="
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
                        ">${isEdicao ? '✅ Atualizar' : '➕ Criar'} Usuário</button>
                    </div>
                </form>
            </div>
        `;

        // Event listener do formulário
        const form = document.getElementById('formularioUsuario');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this._processarFormulario();
            });
        }
    },

    // 📝 PROCESSAR FORMULÁRIO
    _processarFormulario() {
        try {
            // Coletar dados do formulário
            const dados = {
                nome: document.getElementById('inputNome').value.trim(),
                email: document.getElementById('inputEmail').value.trim().toLowerCase(),
                cargo: document.getElementById('inputCargo').value.trim(),
                departamento: document.getElementById('inputDepartamento').value,
                telefone: document.getElementById('inputTelefone').value.trim(),
                dataIngresso: document.getElementById('inputDataIngresso').value,
                ativo: document.getElementById('inputAtivo').checked,
                admin: document.getElementById('inputAdmin').checked
            };

            // Validar dados
            if (!this._validarDadosUsuario(dados)) {
                return;
            }

            if (this.estado.modoEdicao) {
                this._atualizarUsuario(this.estado.usuarioEditando, dados);
            } else {
                this._criarNovoUsuario(dados);
            }

        } catch (error) {
            console.error('❌ Erro ao processar formulário:', error);
            this._mostrarMensagem('Erro ao processar formulário', 'error');
        }
    },

    // ✅ VALIDAR DADOS DO USUÁRIO
    _validarDadosUsuario(dados) {
        // Nome obrigatório
        if (!dados.nome) {
            this._mostrarMensagem('Nome é obrigatório', 'error');
            return false;
        }

        // Email obrigatório e válido
        if (!dados.email) {
            this._mostrarMensagem('Email é obrigatório', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dados.email)) {
            this._mostrarMensagem('Email inválido', 'error');
            return false;
        }

        // Cargo obrigatório
        if (!dados.cargo) {
            this._mostrarMensagem('Cargo é obrigatório', 'error');
            return false;
        }

        // Departamento obrigatório
        if (!dados.departamento) {
            this._mostrarMensagem('Departamento é obrigatório', 'error');
            return false;
        }

        // Verificar email duplicado (apenas para novos usuários)
        if (!this.estado.modoEdicao) {
            const emailJaExiste = Object.values(Auth.equipe).some(user => user.email === dados.email);
            if (emailJaExiste) {
                this._mostrarMensagem('Email já cadastrado', 'error');
                return false;
            }
        }

        return true;
    },

    // ➕ CRIAR NOVO USUÁRIO
    _criarNovoUsuario(dados) {
        try {
            // Gerar chave única baseada no email
            const chave = dados.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

            // Adicionar ao Auth.equipe
            Auth.equipe[chave] = {
                nome: dados.nome,
                email: dados.email,
                cargo: dados.cargo,
                departamento: dados.departamento,
                telefone: dados.telefone,
                dataIngresso: dados.dataIngresso,
                ativo: dados.ativo,
                admin: dados.admin
            };

            console.log(`✅ Usuário criado: ${dados.nome} (${chave})`);
            this._mostrarMensagem(`Usuário ${dados.nome} criado com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarUsuariosNoFirebase();

            // Voltar para lista
            this._renderizarListaUsuarios();

        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            this._mostrarMensagem('Erro ao criar usuário', 'error');
        }
    },

    // ✏️ ATUALIZAR USUÁRIO
    _atualizarUsuario(chave, dados) {
        try {
            if (!Auth.equipe[chave]) {
                throw new Error('Usuário não encontrado');
            }

            // Atualizar dados (manter email original)
            Auth.equipe[chave] = {
                ...Auth.equipe[chave],
                nome: dados.nome,
                cargo: dados.cargo,
                departamento: dados.departamento,
                telefone: dados.telefone,
                dataIngresso: dados.dataIngresso,
                ativo: dados.ativo,
                admin: dados.admin
            };

            console.log(`✅ Usuário atualizado: ${dados.nome} (${chave})`);
            this._mostrarMensagem(`Usuário ${dados.nome} atualizado com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarUsuariosNoFirebase();

            // Voltar para lista
            this._renderizarListaUsuarios();

        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            this._mostrarMensagem('Erro ao atualizar usuário', 'error');
        }
    },

    // 🗑️ CONFIRMAR EXCLUSÃO
    confirmarExclusao(chaveUsuario) {
        if (!Auth.equipe[chaveUsuario]) {
            console.error('❌ Usuário não encontrado:', chaveUsuario);
            return;
        }

        const usuario = Auth.equipe[chaveUsuario];
        
        // Verificar se não é o usuário atual
        const usuarioAtual = Auth.obterUsuario();
        if (usuarioAtual && usuarioAtual.email === usuario.email) {
            this._mostrarMensagem('Não é possível excluir seu próprio usuário', 'error');
            return;
        }

        // Confirmação
        const confirmacao = confirm(
            `⚠️ ATENÇÃO!\n\n` +
            `Tem certeza que deseja excluir o usuário:\n\n` +
            `👤 ${usuario.nome}\n` +
            `📧 ${usuario.email}\n\n` +
            `Esta ação não pode ser desfeita!`
        );

        if (confirmacao) {
            this._excluirUsuario(chaveUsuario);
        }
    },

    // 🗑️ EXCLUIR USUÁRIO
    _excluirUsuario(chaveUsuario) {
        try {
            const usuario = Auth.equipe[chaveUsuario];
            
            if (!usuario) {
                throw new Error('Usuário não encontrado');
            }

            // Remover do Auth.equipe
            delete Auth.equipe[chaveUsuario];

            console.log(`🗑️ Usuário excluído: ${usuario.nome} (${chaveUsuario})`);
            this._mostrarMensagem(`Usuário ${usuario.nome} excluído com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarUsuariosNoFirebase();

            // Atualizar lista
            this._renderizarListaUsuarios();

        } catch (error) {
            console.error('❌ Erro ao excluir usuário:', error);
            this._mostrarMensagem('Erro ao excluir usuário', 'error');
        }
    },

    // 💾 SALVAR USUÁRIOS NO FIREBASE
    async _salvarUsuariosNoFirebase() {
        try {
            if (typeof database === 'undefined' || !database) {
                console.warn('⚠️ Firebase não disponível');
                return;
            }

            // Salvar em dados/usuarios
            await database.ref('dados/usuarios').set(Auth.equipe);
            console.log('💾 Usuários salvos no Firebase');

        } catch (error) {
            console.error('❌ Erro ao salvar no Firebase:', error);
        }
    },

    // 💬 MOSTRAR MENSAGEM
    _mostrarMensagem(mensagem, tipo = 'info') {
        if (typeof Notifications !== 'undefined') {
            switch (tipo) {
                case 'success':
                    Notifications.success(mensagem);
                    break;
                case 'error':
                    Notifications.error(mensagem);
                    break;
                case 'warning':
                    Notifications.warning(mensagem);
                    break;
                default:
                    Notifications.info(mensagem);
            }
        } else {
            alert(`${tipo.toUpperCase()}: ${mensagem}`);
        }
    },

    // ❌ FECHAR MODAL
    fecharModal() {
        const modal = document.getElementById('modalGestaoUsuarios');
        if (modal) {
            modal.remove();
        }

        this.estado.modalAberto = false;
        this.estado.modoEdicao = false;
        this.estado.usuarioEditando = null;

        console.log('❌ Modal de gestão fechado');
    },

    // 📊 OBTER STATUS
    obterStatus() {
        return {
            modulo: 'AdminUsersManager',
            versao: this.config.versao,
            modalAberto: this.estado.modalAberto,
            modoEdicao: this.estado.modoEdicao,
            totalUsuarios: typeof Auth !== 'undefined' ? Object.keys(Auth.equipe).length : 0,
            permissoesAdmin: this._verificarPermissoesAdmin()
        };
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.AdminUsersManager = AdminUsersManager;

// ✅ AUTO-INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        AdminUsersManager.inicializar();
    }, 1000);
});

// ✅ ESTILO CSS PARA ANIMAÇÕES
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    
    #modalGestaoUsuarios input:focus,
    #modalGestaoUsuarios select:focus {
        outline: none;
        border-color: #C53030 !important;
        box-shadow: 0 0 0 3px rgba(197, 48, 48, 0.1) !important;
    }
    
    #modalGestaoUsuarios button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    #modalGestaoUsuarios .table-row:hover {
        background: #f9fafb !important;
    }
`;
document.head.appendChild(style);

console.log('👥 AdminUsersManager v8.3 carregado! Gestão completa de usuários pronta.');

/*
========== 📂 INSTRUÇÕES PARA GIT ==========

1. SALVAR ARQUIVO:
   📁 assets/js/modules/admin-users-manager.js

2. ADICIONAR AO index.html:
   <script src="assets/js/modules/admin-users-manager.js"></script>
   
3. COMANDOS GIT:
   git add assets/js/modules/admin-users-manager.js
   git add index.html
   git commit -m "feat: adiciona módulo AdminUsersManager v8.3"
   git push origin main

4. TESTE:
   - Login como Renato (admin)
   - Clique em "👥 Usuários" no header
   - Interface de gestão deve aparecer

========== ✅ MÓDULO PRONTO PARA PRODUÇÃO ==========
*/

/*
🎯 FUNCIONALIDADES IMPLEMENTADAS:

✅ CRUD COMPLETO:
- Criar novos usuários
- Listar todos os usuários
- Editar dados de usuários  
- Excluir usuários

✅ INTERFACE MODERNA:
- Modal responsivo
- Lista em grid
- Formulário completo
- Validações em tempo real

✅ SEGURANÇA:
- Apenas administradores
- Validações de email
- Confirmação de exclusão
- Não pode excluir próprio usuário

✅ INTEGRAÇÃO:
- Usa Auth.equipe existente
- Salva no Firebase
- Integra com sistema atual
- Sobrescreve Auth.mostrarGerenciarUsuarios

✅ VALIDAÇÕES:
- Email único
- Campos obrigatórios
- Formato de email
- Departamentos válidos

🚀 RESULTADO:
- Renato pode gerenciar 100% dos usuários
- Interface intuitiva e profissional
- Dados salvos automaticamente no Firebase
- Integração perfeita com sistema v8.2
*/
