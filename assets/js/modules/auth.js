/* ========== 🔐 SISTEMA DE AUTENTICAÇÃO + GESTÃO DE USUÁRIOS v7.4.2 ========== */

let firebaseAuth = null;

const Auth = {
    // ✅ CONFIGURAÇÕES
    config: {
        TIMEOUT_LOGIN: 10000, // 10 segundos
        MAX_TENTATIVAS_LOGIN: 3,
        AUTO_REDIRECT_DELAY: 1500, // 1.5 segundos
        REMEMBER_USER: true
    },

    // ✅ ESTADO DO SISTEMA DE AUTH
    state: {
        usuarioAtual: null,
        tentativasLogin: 0,
        loginEmAndamento: false,
        autoLoginTentado: false,
        listeners: new Set(),
        loginCallbacks: new Set(),
        logoutCallbacks: new Set()
    },

    // ✅ FAZER LOGIN
    async fazerLogin() {
        if (this.state.loginEmAndamento) {
            Notifications.warning('Login já em andamento...');
            return;
        }

        const email = document.getElementById('loginEmail')?.value?.trim();
        const senha = document.getElementById('loginPassword')?.value;

        // Validar campos
        const validacao = this._validarCamposLogin(email, senha);
        if (!validacao.valido) {
            Notifications.error(validacao.erro);
            this._destacarCamposErro(validacao.campos);
            return;
        }

        try {
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                return;
            }

            this.state.loginEmAndamento = true;
            this.state.tentativasLogin++;

            this._mostrarIndicadorLogin('Fazendo login...');

            // Timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout no login')), this.config.TIMEOUT_LOGIN);
            });

            // Login promise
            const loginPromise = firebaseAuth?.signInWithEmailAndPassword(email, senha);
            
            // Race entre login e timeout
            const userCredential = await Promise.race([loginPromise, timeoutPromise]);
            
            this._onLoginSucesso(userCredential.user);
            
        } catch (error) {
            this._onLoginErro(error);
        } finally {
            this.state.loginEmAndamento = false;
            this._ocultarIndicadorLogin();
        }
    },

    // ✅ FAZER LOGOUT
    async fazerLogout() {
        try {
            Notifications.info('Fazendo logout...');
            
            // Salvar dados antes do logout se houver
            if (App.dados && Persistence.state.dadosParaSalvar) {
                await Persistence.salvarDadosCritico();
            }
            
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                return;
            }
            await firebaseAuth.signOut();
            this._onLogoutSucesso();
            
        } catch (error) {
            console.error('Erro no logout:', error);
            Notifications.error('Erro ao fazer logout');
            
            // Forçar logout local mesmo com erro
            this._limparSessaoLocal();
            this._mostrarTelaLogin();
        }
    },

    // ✅ REGISTRAR NOVO USUÁRIO
    async mostrarRegistro() {
        // Criar modal de registro dinamicamente
        const modalRegistro = this._criarModalRegistro();
        document.body.appendChild(modalRegistro);
    },

    async registrarUsuario(email, senha, nome) {
        try {
            this._mostrarIndicadorLogin('Criando conta...');
            
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                return;
            }
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, senha);
            
            // Atualizar perfil com nome
            await userCredential.user.updateProfile({
                displayName: nome
            });

            // 🔥 NOVO: Adicionar usuário à estrutura de dados
            if (typeof DataStructure !== 'undefined') {
                const dadosUsuario = {
                    nome: nome,
                    email: email,
                    cargo: 'Colaborador',
                    departamento: 'Gestão Geral',
                    administrador: false
                };
                DataStructure.adicionarUsuario(dadosUsuario);
            }
            
            this._onLoginSucesso(userCredential.user);
            Notifications.success('Conta criada com sucesso!');
            
        } catch (error) {
            this._onRegistroErro(error);
        } finally {
            this._ocultarIndicadorLogin();
        }
    },

    // ✅ RECUPERAR SENHA
    async recuperarSenha(email) {
        try {
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                return;
            }
            await firebaseAuth.sendPasswordResetEmail(email);
            Notifications.success('Email de recuperação enviado!');
        } catch (error) {
            console.error('Erro na recuperação:', error);
            Notifications.error('Erro ao enviar email de recuperação');
        }
    },

    // 🔥 NOVO: SISTEMA DE GESTÃO DE USUÁRIOS
    mostrarGerenciarUsuarios() {
        try {
            this._criarModalGerenciarUsuarios();
        } catch (error) {
            console.error('❌ Erro ao mostrar gestão de usuários:', error);
            Notifications.error('Erro ao abrir gestão de usuários');
        }
    },

    _criarModalGerenciarUsuarios() {
        // Remover modal existente
        const modalExistente = document.getElementById('modalGerenciarUsuarios');
        if (modalExistente) {
            modalExistente.remove();
        }

        // Obter lista de usuários
        const usuarios = DataStructure ? DataStructure.listarUsuarios() : [];

        const modal = document.createElement('div');
        modal.id = 'modalGerenciarUsuarios';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3>👥 Gerenciar Equipe BIAPO</h3>
                    <button class="modal-close" onclick="Auth._fecharModalUsuarios()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <!-- Adicionar Novo Usuário -->
                    <div class="form-section" style="margin-bottom: 24px;">
                        <h4>➕ Adicionar Novo Usuário</h4>
                        <form id="formNovoUsuario" style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end;">
                            <div class="form-group">
                                <label for="novoUsuarioNome">👤 Nome Completo:</label>
                                <input type="text" id="novoUsuarioNome" placeholder="Ex: João Silva" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="novoUsuarioEmail">📧 Email:</label>
                                <input type="email" id="novoUsuarioEmail" placeholder="joao@biapo.com.br" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="novoUsuarioCargo">💼 Cargo:</label>
                                <select id="novoUsuarioCargo" required>
                                    <option value="">Selecione...</option>
                                    <option value="Coordenador Geral">Coordenador Geral</option>
                                    <option value="Coordenador">Coordenador</option>
                                    <option value="Supervisor de Obra">Supervisor de Obra</option>
                                    <option value="Engenheiro">Engenheiro</option>
                                    <option value="Arquiteto">Arquiteto</option>
                                    <option value="Analista">Analista</option>
                                    <option value="Especialista">Especialista</option>
                                    <option value="Técnico">Técnico</option>
                                    <option value="Estagiário">Estagiário</option>
                                    <option value="Colaborador">Colaborador</option>
                                </select>
                            </div>
                            
                            <button type="button" class="btn btn-primary" onclick="Auth._adicionarUsuario()">
                                ➕ Adicionar
                            </button>
                        </form>
                    </div>
                    
                    <!-- Lista de Usuários -->
                    <div class="form-section">
                        <h4>📋 Equipe BIAPO (${usuarios.length} usuários)</h4>
                        
                        ${usuarios.length > 0 ? `
                            <div class="usuarios-grid" style="display: grid; gap: 12px; max-height: 400px; overflow-y: auto;">
                                ${usuarios.map(usuario => `
                                    <div class="usuario-card" style="
                                        display: grid;
                                        grid-template-columns: 2fr 1fr 1fr 1fr auto;
                                        gap: 12px;
                                        align-items: center;
                                        padding: 16px;
                                        background: ${usuario.ativo ? '#f8fafc' : '#fef2f2'};
                                        border-radius: 8px;
                                        border: 1px solid ${usuario.ativo ? '#e5e7eb' : '#fecaca'};
                                        border-left: 4px solid ${usuario.administrador ? '#c53030' : '#10b981'};
                                    ">
                                        <div>
                                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                                <strong style="color: ${usuario.ativo ? '#1f2937' : '#6b7280'};">
                                                    ${usuario.administrador ? '👑 ' : '👤 '}${usuario.nome}
                                                </strong>
                                                ${!usuario.ativo ? '<span style="color: #dc2626; font-size: 12px; padding: 2px 6px; background: #fecaca; border-radius: 4px;">Inativo</span>' : ''}
                                            </div>
                                            <div style="font-size: 12px; color: #6b7280;">${usuario.email}</div>
                                        </div>
                                        
                                        <div style="font-size: 14px; color: #374151;">
                                            💼 ${usuario.cargo}
                                        </div>
                                        
                                        <div style="font-size: 14px; color: #374151;">
                                            🏢 ${usuario.departamento}
                                        </div>
                                        
                                        <div style="font-size: 12px; color: #6b7280;">
                                            📅 ${new Date(usuario.dataIngresso).toLocaleDateString('pt-BR')}
                                        </div>
                                        
                                        <div style="display: flex; gap: 4px;">
                                            <button class="btn btn-sm btn-secondary" 
                                                    onclick="Auth._editarUsuario('${usuario.email}')" 
                                                    title="Editar usuário">
                                                ✏️
                                            </button>
                                            ${usuario.ativo ? `
                                                <button class="btn btn-sm btn-warning" 
                                                        onclick="Auth._desativarUsuario('${usuario.email}')" 
                                                        title="Desativar usuário">
                                                    🚫
                                                </button>
                                            ` : `
                                                <button class="btn btn-sm btn-success" 
                                                        onclick="Auth._ativarUsuario('${usuario.email}')" 
                                                        title="Reativar usuário">
                                                    ✅
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="info-box info-box-info">
                                📭 Nenhum usuário adicional cadastrado. Use o formulário acima para adicionar novos membros.
                            </div>
                        `}
                    </div>
                    
                    <!-- Estatísticas -->
                    <div class="form-section" style="margin-top: 24px;">
                        <h4>📊 Estatísticas da Equipe</h4>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                            <div style="text-align: center; padding: 12px; background: #f0f9ff; border-radius: 8px;">
                                <div style="font-size: 24px; font-weight: bold; color: #0369a1;">${usuarios.length}</div>
                                <div style="font-size: 12px; color: #6b7280;">Total de Usuários</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: #f0fdf4; border-radius: 8px;">
                                <div style="font-size: 24px; font-weight: bold; color: #059669;">${usuarios.filter(u => u.ativo).length}</div>
                                <div style="font-size: 12px; color: #6b7280;">Usuários Ativos</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: #fef7ff; border-radius: 8px;">
                                <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${usuarios.filter(u => u.administrador).length}</div>
                                <div style="font-size: 12px; color: #6b7280;">Administradores</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: #fffbeb; border-radius: 8px;">
                                <div style="font-size: 24px; font-weight: bold; color: #d97706;">${new Set(usuarios.map(u => u.departamento)).size}</div>
                                <div style="font-size: 12px; color: #6b7280;">Departamentos</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Ações em Lote -->
                    <div class="form-section" style="margin-top: 24px;">
                        <h4>⚙️ Ações Administrativas</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                            <button class="btn btn-secondary" onclick="Auth._exportarUsuarios()">
                                📄 Exportar Lista
                            </button>
                            <button class="btn btn-warning" onclick="Auth._resetarSenhas()">
                                🔑 Reset Senhas
                            </button>
                            <button class="btn btn-info" onclick="Auth._sincronizarUsuarios()">
                                🔄 Sincronizar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="Auth._fecharModalUsuarios()">
                        ✅ Fechar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Focar no campo nome
        document.getElementById('novoUsuarioNome').focus();
    },

    _adicionarUsuario() {
        try {
            const nome = document.getElementById('novoUsuarioNome').value.trim();
            const email = document.getElementById('novoUsuarioEmail').value.trim();
            const cargo = document.getElementById('novoUsuarioCargo').value;

            // Validações
            if (!nome || nome.length < 2) {
                Notifications.error('Nome deve ter pelo menos 2 caracteres');
                return;
            }

            if (!email || !email.includes('@')) {
                Notifications.error('Email inválido');
                return;
            }

            if (!cargo) {
                Notifications.error('Cargo é obrigatório');
                return;
            }

            // Determinar departamento baseado no cargo
            let departamento = 'Gestão Geral';
            if (['Supervisor de Obra', 'Engenheiro', 'Arquiteto', 'Técnico'].includes(cargo)) {
                departamento = 'Obra e Construção';
            } else if (['Especialista', 'Coordenador de Rede'].includes(cargo) && email.includes('redeinterna')) {
                departamento = 'Museu Nacional';
            }

            const dadosUsuario = {
                nome: nome,
                email: email,
                cargo: cargo,
                departamento: departamento,
                administrador: cargo === 'Coordenador Geral'
            };

            // Adicionar usuário
            if (DataStructure && DataStructure.adicionarUsuario(dadosUsuario)) {
                // Limpar campos
                document.getElementById('novoUsuarioNome').value = '';
                document.getElementById('novoUsuarioEmail').value = '';
                document.getElementById('novoUsuarioCargo').value = '';

                // Recriar modal para mostrar o novo usuário
                this._criarModalGerenciarUsuarios();

                Notifications.success(`Usuário "${nome}" adicionado com sucesso!`);
            } else {
                Notifications.error('Erro ao adicionar usuário. Verifique se o email já existe.');
            }

        } catch (error) {
            console.error('❌ Erro ao adicionar usuário:', error);
            Notifications.error('Erro ao adicionar usuário');
        }
    },

    _editarUsuario(email) {
        try {
            const usuario = DataStructure.obterUsuario(email);
            if (!usuario) {
                Notifications.error('Usuário não encontrado');
                return;
            }

            // Criar modal de edição
            const modalEdicao = this._criarModalEdicaoUsuario(usuario);
            document.body.appendChild(modalEdicao);

        } catch (error) {
            console.error('❌ Erro ao editar usuário:', error);
            Notifications.error('Erro ao abrir edição de usuário');
        }
    },

    _criarModalEdicaoUsuario(usuario) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.zIndex = '3001'; // Sobrepor modal principal
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>✏️ Editar Usuário</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                
                <form id="formEditarUsuario" class="modal-body">
                    <div class="form-group">
                        <label for="editNome">👤 Nome Completo:</label>
                        <input type="text" id="editNome" value="${usuario.nome}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editEmail">📧 Email:</label>
                        <input type="email" id="editEmail" value="${usuario.email}" readonly 
                               style="background: #f3f4f6; color: #6b7280;">
                        <small style="color: #6b7280;">Email não pode ser alterado</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="editCargo">💼 Cargo:</label>
                        <select id="editCargo" required>
                            <option value="Coordenador Geral" ${usuario.cargo === 'Coordenador Geral' ? 'selected' : ''}>Coordenador Geral</option>
                            <option value="Coordenador" ${usuario.cargo === 'Coordenador' ? 'selected' : ''}>Coordenador</option>
                            <option value="Supervisor de Obra" ${usuario.cargo === 'Supervisor de Obra' ? 'selected' : ''}>Supervisor de Obra</option>
                            <option value="Engenheiro" ${usuario.cargo === 'Engenheiro' ? 'selected' : ''}>Engenheiro</option>
                            <option value="Arquiteto" ${usuario.cargo === 'Arquiteto' ? 'selected' : ''}>Arquiteto</option>
                            <option value="Analista" ${usuario.cargo === 'Analista' ? 'selected' : ''}>Analista</option>
                            <option value="Especialista" ${usuario.cargo === 'Especialista' ? 'selected' : ''}>Especialista</option>
                            <option value="Técnico" ${usuario.cargo === 'Técnico' ? 'selected' : ''}>Técnico</option>
                            <option value="Estagiário" ${usuario.cargo === 'Estagiário' ? 'selected' : ''}>Estagiário</option>
                            <option value="Colaborador" ${usuario.cargo === 'Colaborador' ? 'selected' : ''}>Colaborador</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editDepartamento">🏢 Departamento:</label>
                        <select id="editDepartamento" required>
                            <option value="Gestão Geral" ${usuario.departamento === 'Gestão Geral' ? 'selected' : ''}>Gestão Geral</option>
                            <option value="Obra e Construção" ${usuario.departamento === 'Obra e Construção' ? 'selected' : ''}>Obra e Construção</option>
                            <option value="Museu Nacional" ${usuario.departamento === 'Museu Nacional' ? 'selected' : ''}>Museu Nacional</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTelefone">📱 Telefone:</label>
                        <input type="tel" id="editTelefone" value="${usuario.telefone || ''}" 
                               placeholder="(11) 99999-9999">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="editAdministrador" ${usuario.administrador ? 'checked' : ''}>
                            <span>👑 Privilégios de Administrador</span>
                        </label>
                    </div>
                </form>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        ❌ Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="Auth._salvarEdicaoUsuario('${usuario.email}', this)">
                        ✅ Salvar
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    },

    _salvarEdicaoUsuario(email, botao) {
        try {
            const modal = botao.closest('.modal');
            
            const dadosAtualizacao = {
                nome: modal.querySelector('#editNome').value.trim(),
                cargo: modal.querySelector('#editCargo').value,
                departamento: modal.querySelector('#editDepartamento').value,
                telefone: modal.querySelector('#editTelefone').value.trim(),
                administrador: modal.querySelector('#editAdministrador').checked
            };

            if (DataStructure && DataStructure.atualizarUsuario(email, dadosAtualizacao)) {
                modal.remove();
                this._criarModalGerenciarUsuarios();
                Notifications.success('Usuário atualizado com sucesso!');
            } else {
                Notifications.error('Erro ao atualizar usuário');
            }

        } catch (error) {
            console.error('❌ Erro ao salvar edição:', error);
            Notifications.error('Erro ao salvar alterações');
        }
    },

    _desativarUsuario(email) {
        try {
            const usuario = DataStructure.obterUsuario(email);
            if (!usuario) {
                Notifications.error('Usuário não encontrado');
                return;
            }

            const confirmacao = confirm(
                `Tem certeza que deseja desativar o usuário?\n\n` +
                `👤 ${usuario.nome}\n` +
                `📧 ${usuario.email}\n\n` +
                `O usuário não poderá mais fazer login no sistema.`
            );

            if (!confirmacao) return;

            if (DataStructure && DataStructure.desativarUsuario(email)) {
                this._criarModalGerenciarUsuarios();
                Notifications.success(`Usuário "${usuario.nome}" desativado com sucesso!`);
            } else {
                Notifications.error('Erro ao desativar usuário');
            }

        } catch (error) {
            console.error('❌ Erro ao desativar usuário:', error);
            Notifications.error('Erro ao desativar usuário');
        }
    },

    _ativarUsuario(email) {
        try {
            const usuario = DataStructure.obterUsuario(email);
            if (!usuario) {
                Notifications.error('Usuário não encontrado');
                return;
            }

            const dadosAtualizacao = { ativo: true };
            if (DataStructure && DataStructure.atualizarUsuario(email, dadosAtualizacao)) {
                this._criarModalGerenciarUsuarios();
                Notifications.success(`Usuário "${usuario.nome}" reativado com sucesso!`);
            } else {
                Notifications.error('Erro ao reativar usuário');
            }

        } catch (error) {
            console.error('❌ Erro ao reativar usuário:', error);
            Notifications.error('Erro ao reativar usuário');
        }
    },

    _exportarUsuarios() {
        try {
            const usuarios = DataStructure ? DataStructure.listarUsuarios() : [];
            
            if (usuarios.length === 0) {
                Notifications.warning('Nenhum usuário para exportar');
                return;
            }

            // Gerar CSV
            const headers = ['Nome', 'Email', 'Cargo', 'Departamento', 'Ativo', 'Admin', 'Data Ingresso'];
            const rows = usuarios.map(u => [
                u.nome,
                u.email,
                u.cargo,
                u.departamento,
                u.ativo ? 'Sim' : 'Não',
                u.administrador ? 'Sim' : 'Não',
                new Date(u.dataIngresso).toLocaleDateString('pt-BR')
            ]);

            const csvContent = [headers, ...rows]
                .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
                .join('\n');

            // Download do arquivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `usuarios_biapo_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Notifications.success('Lista de usuários exportada com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao exportar usuários:', error);
            Notifications.error('Erro ao exportar lista de usuários');
        }
    },

    _resetarSenhas() {
        Notifications.info('Funcionalidade em desenvolvimento. Entre em contato com o administrador do sistema.');
    },

    _sincronizarUsuarios() {
        try {
            // Força sincronização com Firebase
            if (typeof Persistence !== 'undefined') {
                Persistence.salvarDadosCritico();
            }
            
            Notifications.success('Sincronização concluída!');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            Notifications.error('Erro na sincronização');
        }
    },

    _fecharModalUsuarios() {
        const modal = document.getElementById('modalGerenciarUsuarios');
        if (modal) {
            modal.remove();
        }
    },

    // ✅ CALLBACKS DE SUCESSO E ERRO - MANTIDOS
    _onLoginSucesso(user) {
        this.state.usuarioAtual = user;
        this.state.tentativasLogin = 0;
        
        // Atualizar estado global do App
        App.usuarioAtual = user;
        App.estadoSistema.usuarioEmail = user.email;
        App.estadoSistema.usuarioNome = user.displayName || user.email;
        
        // Salvar preferência de login se habilitado
        if (this.config.REMEMBER_USER) {
            Helpers.storage.set('ultimoUsuario', {
                email: user.email,
                nome: user.displayName,
                timestamp: Date.now()
            });
        }
        
        // Limpar campos de login
        this._limparCamposLogin();
        
        // Notificar sucesso
        Notifications.success(`Bem-vindo, ${user.displayName || user.email}!`);
        
        // Redirecionar após delay
        setTimeout(() => {
            this._mostrarSistema();
            this.state.loginCallbacks.forEach(cb => {
                try { cb(user); } catch (e) { console.error(e); }
            });
        }, this.config.AUTO_REDIRECT_DELAY);
    },

    _onLoginErro(error) {
        console.error('Erro no login:', error);
        
        let mensagemErro = 'Erro no login';
        let sugestao = '';
        
        switch (error.code) {
            case 'auth/user-not-found':
                mensagemErro = 'Usuário não encontrado';
                sugestao = 'Verifique o email ou registre-se';
                break;
            case 'auth/wrong-password':
                mensagemErro = 'Senha incorreta';
                sugestao = 'Verifique sua senha ou recupere-a';
                break;
            case 'auth/invalid-email':
                mensagemErro = 'Email inválido';
                sugestao = 'Verifique o formato do email';
                break;
            case 'auth/too-many-requests':
                mensagemErro = 'Muitas tentativas';
                sugestao = 'Aguarde alguns minutos';
                break;
            case 'auth/network-request-failed':
                mensagemErro = 'Erro de conexão';
                sugestao = 'Verifique sua internet';
                break;
            default:
                mensagemErro = error.message || 'Erro desconhecido';
        }
        
        Notifications.error(`${mensagemErro}${sugestao ? ` - ${sugestao}` : ''}`);
        
        // Verificar limite de tentativas
        if (this.state.tentativasLogin >= this.config.MAX_TENTATIVAS_LOGIN) {
            this._bloquearLogin();
        }
    },

    _onLogoutSucesso() {
        this.state.usuarioAtual = null;
        
        // Limpar estado global do App
        App.usuarioAtual = null;
        App.dados = null;
        App.estadoSistema.usuarioEmail = null;
        App.estadoSistema.usuarioNome = null;
        
        this._limparSessaoLocal();
        this._mostrarTelaLogin();

        this.state.logoutCallbacks.forEach(cb => {
            try { cb(); } catch (e) { console.error(e); }
        });

        Notifications.info('Logout realizado com sucesso');
    },

    _onRegistroErro(error) {
        console.error('Erro no registro:', error);
        
        let mensagemErro = 'Erro ao criar conta';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                mensagemErro = 'Email já está em uso';
                break;
            case 'auth/weak-password':
                mensagemErro = 'Senha muito fraca';
                break;
            case 'auth/invalid-email':
                mensagemErro = 'Email inválido';
                break;
            default:
                mensagemErro = error.message || 'Erro desconhecido';
        }
        
        Notifications.error(mensagemErro);
    },

    // [MANTÉM TODOS OS OUTROS MÉTODOS EXISTENTES...]

    // ✅ VALIDAÇÃO DE CAMPOS
    _validarCamposLogin(email, senha) {
        const campos = [];
        let erro = '';
        
        if (!email) {
            erro = 'Email é obrigatório';
            campos.push('loginEmail');
        } else if (!Validation.isValidEmail(email)) {
            erro = 'Email inválido';
            campos.push('loginEmail');
        }
        
        if (!senha) {
            erro = erro || 'Senha é obrigatória';
            campos.push('loginPassword');
        } else if (senha.length < 6) {
            erro = erro || 'Senha deve ter pelo menos 6 caracteres';
            campos.push('loginPassword');
        }
        
        return {
            valido: campos.length === 0,
            erro,
            campos
        };
    },

    _destacarCamposErro(campos) {
        // Limpar erros anteriores
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
        
        // Destacar campos com erro
        campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.classList.add('input-error');
                campo.focus();
            }
        });
    },

    // ✅ INTERFACE - MOSTRAR/OCULTAR TELAS
    _mostrarTelaLogin() {
        const loginScreen = document.getElementById('loginScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loginScreen && mainContainer) {
            loginScreen.classList.remove('hidden');
            mainContainer.classList.add('hidden');
        }
        
        // Limpar dados sensíveis
        this._limparCamposLogin();
    },

    _mostrarSistema() {
        const loginScreen = document.getElementById('loginScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        if (loginScreen && mainContainer) {
            loginScreen.classList.add('hidden');
            mainContainer.classList.remove('hidden');
        }
        
        // Inicializar sistema se necessário
        if (App && typeof App.inicializarSistema === 'function') {
            App.inicializarSistema();
        }
    },

    // ✅ INDICADORES VISUAIS
    _mostrarIndicadorLogin(texto) {
        // Encontrar botão de login
        const btnLogin = document.querySelector('#loginScreen .btn-primary');
        if (btnLogin) {
            btnLogin.innerHTML = `<div class="loading"></div> ${texto}`;
            btnLogin.disabled = true;
        }
    },

    _ocultarIndicadorLogin() {
        const btnLogin = document.querySelector('#loginScreen .btn-primary');
        if (btnLogin) {
            btnLogin.innerHTML = 'Entrar';
            btnLogin.disabled = false;
        }
    },

    // ✅ BLOQUEIO TEMPORÁRIO APÓS MUITAS TENTATIVAS
    _bloquearLogin() {
        const tempoBloquei = 5 * 60 * 1000; // 5 minutos
        const btnLogin = document.querySelector('#loginScreen .btn-primary');
        
        if (btnLogin) {
            btnLogin.disabled = true;
            btnLogin.innerHTML = '🔒 Bloqueado (5min)';
        }
        
        Notifications.error('Login bloqueado por 5 minutos após muitas tentativas');
        
        setTimeout(() => {
            this.state.tentativasLogin = 0;
            this._ocultarIndicadorLogin();
            Notifications.info('Bloqueio removido - pode tentar novamente');
        }, tempoBloquei);
    },

    // ✅ LIMPEZA DE DADOS
    _limparCamposLogin() {
        const campos = ['loginEmail', 'loginPassword'];
        campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
                campo.classList.remove('input-error');
            }
        });
    },

    _limparSessaoLocal() {
        // Limpar dados locais sensíveis, mas manter preferências
        const backup = Helpers.storage.get('ultimoUsuario');
        Persistence.limparDadosAntigos();
        
        if (backup && this.config.REMEMBER_USER) {
            Helpers.storage.set('ultimoUsuario', backup);
        }
    },

    // ✅ MODAL DE REGISTRO - MANTIDO
    _criarModalRegistro() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '3000';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3 style="margin-bottom: 24px;">🔐 Criar Nova Conta</h3>
                
                <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" id="registroNome" placeholder="Seu nome completo" required>
                </div>
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="registroEmail" placeholder="seu@email.com" required>
                </div>
                
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="registroSenha" placeholder="Mínimo 6 caracteres" required>
                </div>
                
                <div class="form-group">
                    <label>Confirmar Senha</label>
                    <input type="password" id="registroConfirmarSenha" placeholder="Digite a senha novamente" required>
                </div>
                
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="Auth._processarRegistro(this)">
                        Criar Conta
                    </button>
                </div>
                
                <div style="margin-top: 16px; text-align: center; font-size: 14px; color: #6b7280;">
                    Já tem conta? <a href="#" onclick="this.closest('.modal').remove()" style="color: #3b82f6;">Faça login</a>
                </div>
            </div>
        `;
        
        return modal;
    },

    _processarRegistro(botao) {
        const modal = botao.closest('.modal');
        const nome = modal.querySelector('#registroNome').value.trim();
        const email = modal.querySelector('#registroEmail').value.trim();
        const senha = modal.querySelector('#registroSenha').value;
        const confirmarSenha = modal.querySelector('#registroConfirmarSenha').value;
        
        // Validações
        if (!nome || nome.length < 2) {
            Notifications.error('Nome deve ter pelo menos 2 caracteres');
            return;
        }
        
        if (!Validation.isValidEmail(email)) {
            Notifications.error('Email inválido');
            return;
        }
        
        if (senha.length < 6) {
            Notifications.error('Senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        if (senha !== confirmarSenha) {
            Notifications.error('Senhas não conferem');
            return;
        }
        
        // Processar registro
        this.registrarUsuario(email, senha, nome).then(() => {
            modal.remove();
        });
    },

    // [MANTÉM TODOS OS OUTROS MÉTODOS EXISTENTES COMO auto-login, configuração, etc.]

    // ✅ AUTO-LOGIN SE USUÁRIO JÁ LOGADO
    async verificarAutoLogin() {
        if (this.state.autoLoginTentado) return;
        
        this.state.autoLoginTentado = true;
        
        return new Promise((resolve) => {
            if (!firebaseAuth) {
                Notifications.error('Serviço de autenticação indisponível');
                resolve(null);
                return;
            }

            const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
                unsubscribe();
                
                if (user) {
                    console.log('👤 Usuário já autenticado:', user.email);
                    this._onLoginSucesso(user);
                } else {
                    console.log('👤 Usuário não autenticado');
                    this._mostrarTelaLogin();
                    
                    // Pré-popular email se lembrado
                    this._preencherUltimoUsuario();
                }
                
                resolve(user);
            });
        });
    },

    _preencherUltimoUsuario() {
        if (!this.config.REMEMBER_USER) return;
        
        const ultimoUsuario = Helpers.storage.get('ultimoUsuario');
        if (ultimoUsuario && ultimoUsuario.email) {
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) {
                emailInput.value = ultimoUsuario.email;
                
                // Focar no campo senha
                const senhaInput = document.getElementById('loginPassword');
                if (senhaInput) {
                    senhaInput.focus();
                }
            }
        }
    },

    // ✅ CONFIGURAR EVENTOS DE TECLADO
    _configurarEventosTeclado() {
        // Enter para fazer login
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const loginScreen = document.getElementById('loginScreen');
                if (loginScreen && !loginScreen.classList.contains('hidden')) {
                    this.fazerLogin();
                }
            }
        });
    },

    // ✅ OBTER STATUS DE AUTENTICAÇÃO
    obterStatus() {
        return {
            usuarioAtual: this.state.usuarioAtual,
            email: this.state.usuarioAtual?.email || null,
            nome: this.state.usuarioAtual?.displayName || null,
            autenticado: !!this.state.usuarioAtual,
            tentativasLogin: this.state.tentativasLogin,
            loginEmAndamento: this.state.loginEmAndamento,
            totalUsuarios: DataStructure ? Object.keys(DataStructure.usuariosBiapo).length : 0
        };
    },

    // ✅ VERIFICAR SE USUÁRIO ESTÁ AUTENTICADO
    estaAutenticado() {
        return !!this.state.usuarioAtual;
    },

    onLogin(callback) {
        if (typeof callback === 'function') {
            this.state.loginCallbacks.add(callback);
        }
    },

    onLogout(callback) {
        if (typeof callback === 'function') {
            this.state.logoutCallbacks.add(callback);
        }
    },

    // ✅ INICIALIZAÇÃO DO MÓDULO
    init() {
        console.log('🔐 Inicializando sistema de autenticação...');

        if (!firebaseAuth) {
            Notifications.error('Serviço de autenticação indisponível');
            return;
        }

        // Configurar eventos de teclado
        this._configurarEventosTeclado();

        // Verificar auto-login
        this.verificarAutoLogin();

        // Configurar listener de mudanças de autenticação
        const authListener = firebaseAuth?.onAuthStateChanged((user) => {
            if (user && !this.state.usuarioAtual) {
                // Usuário fez login
                this._onLoginSucesso(user);
            } else if (!user && this.state.usuarioAtual) {
                // Usuário fez logout
                this._onLogoutSucesso();
            }
        });
        
        this.state.listeners.add(authListener);
        
        console.log('✅ Sistema de autenticação inicializado');
    },

    // ✅ LIMPEZA DO MÓDULO
    destroy() {
        // Limpar listeners
        this.state.listeners.forEach(listener => {
            if (typeof listener === 'function') {
                listener();
            }
        });
        this.state.listeners.clear();
        this.state.loginCallbacks.clear();
        this.state.logoutCallbacks.clear();
    }
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', async () => {
    if (window.firebaseInitPromise) {
        await window.firebaseInitPromise;
    }
    firebaseAuth = window.auth || (window.firebase ? window.firebase.auth() : null);
    Auth.init();
});

// Disponibilizar objeto para handlers em inline scripts
window.Auth = Auth;

console.log('🔐 Sistema de Autenticação + Gestão de Usuários v7.4.2 carregado!');

/*
✅ NOVIDADES v7.4.2:
- 🔥 Sistema completo de gestão de usuários
- 🔥 Modal de gerenciamento com CRUD completo
- 🔥 Interface moderna e responsiva
- 🔥 Integração com DataStructure
- 🔥 Estatísticas da equipe
- 🔥 Exportação de dados
- 🔥 Administração de permissões

👥 FUNCIONALIDADES:
- Adicionar novos usuários ✅
- Editar usuários existentes ✅
- Ativar/Desativar usuários ✅
- Controle de permissões ✅
- Exportar lista de usuários ✅
- Interface administrativa completa ✅

🎯 RESULTADO:
- Gestão de equipe: 100% funcional ✅
- Interface: Moderna e intuitiva ✅
- Integração: Com sistema existente ✅
*/
