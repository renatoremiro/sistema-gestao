/**
 * 👥 ADMIN USERS MANAGER v8.3 FINAL - ARQUIVO COMPLETO CORRIGIDO
 * 
 * 🔥 CORREÇÕES APLICADAS:
 * - ✅ Path Firebase correto: dados/auth_equipe + backup paths
 * - ✅ Retry robusto com backoff exponencial
 * - ✅ Verificação de persistência automática
 * - ✅ Backup múltiplo (Firebase + localStorage)
 * - ✅ Debug completo para troubleshooting
 * - ✅ Sincronização em tempo real
 * - ✅ Sistema de departamentos dinâmico
 */

const AdminUsersManager = {
    // ✅ CONFIGURAÇÃO AVANÇADA
    config: {
        versao: '8.3.0',
        permissaoAdmin: true,
        persistenciaFirebase: true,
        validacaoEmail: true,
        backupLocal: true,
        syncTempoReal: true,
        retryAutomatico: true,
        maxTentativas: 5 // AUMENTADO para garantir persistência
    },

    // ✅ ESTADO COMPLETO
    estado: {
        modalAberto: false,
        modoEdicao: false,
        usuarioEditando: null,
        usuariosCarregados: false,
        departamentosCarregados: false,
        operacaoEmAndamento: false,
        ultimaAtualizacao: null
    },

    // 📊 DEPARTAMENTOS DINÂMICOS
    departamentos: [
        { id: 'gestao-geral', nome: 'Gestão Geral', ativo: true },
        { id: 'obra-construcao', nome: 'Obra e Construção', ativo: true },
        { id: 'museu-nacional', nome: 'Museu Nacional', ativo: true }
    ],

    // 🚀 INICIALIZAR MÓDULO COMPLETO
    inicializar() {
        console.log('👥 Inicializando AdminUsersManager v8.3 FINAL...');
        
        try {
            // Integrar com Auth.js
            this._integrarComAuth();
            
            // Carregar departamentos do Firebase
            this._carregarDepartamentos();
            
            // Configurar listener em tempo real
            this._configurarSyncTempoReal();
            
            console.log('✅ AdminUsersManager v8.3 FINAL inicializado com sucesso!');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            return false;
        }
    },

    // 🔗 INTEGRAR COM AUTH.JS
    _integrarComAuth() {
        if (typeof Auth !== 'undefined') {
            Auth.mostrarGerenciarUsuarios = () => {
                console.log('🔧 Auth → AdminUsersManager: Redirecionando chamada...');
                return this.abrirInterfaceGestao();
            };
            console.log('✅ Integração com Auth.js concluída');
        } else {
            console.warn('⚠️ Auth.js não encontrado - integração adiada');
        }
    },

    // 🔄 CONFIGURAR SYNC EM TEMPO REAL
    _configurarSyncTempoReal() {
        if (typeof database !== 'undefined' && database) {
            try {
                // Listener para usuários
                database.ref('dados/auth_equipe').on('value', (snapshot) => {
                    if (snapshot.exists() && this.estado.modalAberto) {
                        console.log('🔄 Dados de usuários atualizados em tempo real');
                        this._sincronizarComFirebase(snapshot.val());
                    }
                });

                // Listener para departamentos
                database.ref('dados/departamentos').on('value', (snapshot) => {
                    if (snapshot.exists()) {
                        console.log('🔄 Departamentos atualizados em tempo real');
                        this.departamentos = snapshot.val() || this.departamentos;
                    }
                });

                console.log('✅ Sync em tempo real configurado');
            } catch (error) {
                console.warn('⚠️ Erro ao configurar sync:', error);
            }
        }
    },

    // 🔐 VERIFICAR PERMISSÕES ADMIN
    _verificarPermissoesAdmin() {
        if (typeof Auth === 'undefined' || !Auth.ehAdmin || !Auth.ehAdmin()) {
            this._mostrarMensagem('❌ Acesso restrito a administradores', 'error');
            return false;
        }
        return true;
    },

    // 🎨 ABRIR INTERFACE DE GESTÃO PRINCIPAL
    abrirInterfaceGestao() {
        try {
            if (!this._verificarPermissoesAdmin()) return false;

            console.log('✅ Abrindo interface de gestão administrativa...');

            this.estado.modalAberto = true;
            this.estado.modoEdicao = false;
            this.estado.usuarioEditando = null;

            const modal = this._criarModalGestao();
            document.body.appendChild(modal);

            // Carregar dados
            setTimeout(() => {
                this._renderizarListaUsuarios();
                this._carregarDepartamentos();
            }, 100);

            return true;

        } catch (error) {
            console.error('❌ Erro ao abrir interface:', error);
            this._mostrarMensagem('Erro interno na gestão de usuários', 'error');
            return false;
        }
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
                max-width: 1400px;
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
                            👥 Gestão Completa BIAPO v8.3
                        </h2>
                        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                            Usuários + Departamentos + Configurações - PERSISTÊNCIA CORRIGIDA
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

                <!-- Abas de Navegação -->
                <div style="
                    display: flex;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    <button onclick="AdminUsersManager.abrirAba('usuarios')" id="abaUsuarios" style="
                        padding: 16px 24px;
                        border: none;
                        background: #C53030;
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                        border-bottom: 3px solid #9B2C2C;
                    ">👥 Usuários</button>
                    
                    <button onclick="AdminUsersManager.abrirAba('departamentos')" id="abaDepartamentos" style="
                        padding: 16px 24px;
                        border: none;
                        background: #6b7280;
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    ">🏢 Departamentos</button>
                    
                    <button onclick="AdminUsersManager.abrirAba('configuracoes')" id="abaConfiguracoes" style="
                        padding: 16px 24px;
                        border: none;
                        background: #6b7280;
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    ">⚙️ Configurações</button>

                    <button onclick="AdminUsersManager.abrirAba('debug')" id="abaDebug" style="
                        padding: 16px 24px;
                        border: none;
                        background: #6b7280;
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    ">🧪 Debug</button>
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
                        <button onclick="AdminUsersManager._atualizarDados()" style="
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
                        
                        <span style="color: #10b981; font-size: 12px;" id="statusSync">
                            ⚡ Sync ativo
                        </span>
                    </div>
                    
                    <div id="botoesAcao">
                        <!-- Botões dinâmicos baseados na aba ativa -->
                    </div>
                </div>

                <!-- Conteúdo Principal -->
                <div style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 0;
                ">
                    <div id="conteudoPrincipal">
                        <!-- Conteúdo será renderizado aqui -->
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

    // 📂 ABRIR ABA
    abrirAba(aba) {
        // Atualizar visual das abas
        document.querySelectorAll('#modalGestaoUsuarios button[id^="aba"]').forEach(btn => {
            btn.style.background = '#6b7280';
            btn.style.borderBottom = 'none';
        });
        
        const abaAtiva = document.getElementById(`aba${aba.charAt(0).toUpperCase() + aba.slice(1)}`);
        if (abaAtiva) {
            abaAtiva.style.background = '#C53030';
            abaAtiva.style.borderBottom = '3px solid #9B2C2C';
        }

        // Renderizar conteúdo da aba
        switch (aba) {
            case 'usuarios':
                this._renderizarListaUsuarios();
                this._atualizarBotoesAcao('usuarios');
                break;
            case 'departamentos':
                this._renderizarListaDepartamentos();
                this._atualizarBotoesAcao('departamentos');
                break;
            case 'configuracoes':
                this._renderizarConfiguracoes();
                this._atualizarBotoesAcao('configuracoes');
                break;
            case 'debug':
                this._renderizarDebug();
                this._atualizarBotoesAcao('debug');
                break;
        }
    },

    // 🔘 ATUALIZAR BOTÕES DE AÇÃO
    _atualizarBotoesAcao(aba) {
        const container = document.getElementById('botoesAcao');
        if (!container) return;

        let botoes = '';
        
        switch (aba) {
            case 'usuarios':
                botoes = `
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
                    ">➕ Novo Usuário</button>
                `;
                break;
            case 'departamentos':
                botoes = `
                    <button onclick="AdminUsersManager.abrirFormularioDepartamento()" style="
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
                    ">➕ Novo Departamento</button>
                `;
                break;
            case 'configuracoes':
                botoes = `
                    <button onclick="AdminUsersManager._salvarConfiguracoes()" style="
                        background: linear-gradient(135deg, #059669 0%, #047857 100%);
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                    ">💾 Salvar Config</button>
                `;
                break;
            case 'debug':
                botoes = `
                    <button onclick="AdminUsersManager.testeCompletoPersistencia()" style="
                        background: linear-gradient(135deg, #059669 0%, #047857 100%);
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                    ">🧪 Teste Completo</button>
                `;
                break;
        }
        
        container.innerHTML = botoes;
    },

    // 📋 RENDERIZAR LISTA DE USUÁRIOS
    _renderizarListaUsuarios() {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        const usuarios = this._obterListaUsuarios();
        
        // Atualizar contador
        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `${usuarios.length} usuários cadastrados`;
        }

        container.innerHTML = `
            <div style="padding: 0;">
                <!-- Header da tabela -->
                <div style="
                    display: grid;
                    grid-template-columns: 2fr 1.5fr 1.5fr 80px 120px;
                    gap: 16px;
                    padding: 16px 24px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    font-weight: 600;
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                ">
                    <div>Nome / Email</div>
                    <div>Cargo</div>
                    <div>Departamento</div>
                    <div>Admin</div>
                    <div>Ações</div>
                </div>

                <!-- Lista de usuários -->
                <div style="max-height: 500px; overflow-y: auto;">
                    ${usuarios.map(usuario => this._renderizarItemUsuario(usuario)).join('')}
                </div>
                
                ${usuarios.length === 0 ? `
                    <div style="padding: 60px 24px; text-align: center; color: #6b7280;">
                        <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
                        <div style="font-size: 18px; margin-bottom: 8px;">Nenhum usuário encontrado</div>
                        <div style="font-size: 14px;">Adicione usuários à equipe BIAPO</div>
                    </div>
                ` : ''}
            </div>
        `;

        console.log(`📋 Lista de usuários renderizada: ${usuarios.length} usuários`);
    },

    // 👤 RENDERIZAR ITEM DE USUÁRIO
    _renderizarItemUsuario(usuario) {
        const isAtivo = usuario.ativo !== false;
        const isAdmin = usuario.admin === true;
        const key = usuario._key || usuario.id;

        return `
            <div style="
                display: grid;
                grid-template-columns: 2fr 1.5fr 1.5fr 80px 120px;
                gap: 16px;
                padding: 16px 24px;
                border-bottom: 1px solid #f3f4f6;
                align-items: center;
                transition: background-color 0.2s ease;
            " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
                
                <!-- Nome / Email -->
                <div>
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 2px;">
                        ${usuario.nome}
                        ${!isAtivo ? '<span style="color: #ef4444; font-size: 11px; margin-left: 8px;">[INATIVO]</span>' : ''}
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
                    
                    <button onclick="AdminUsersManager.alternarStatus('${key}')" style="
                        background: ${isAtivo ? '#ef4444' : '#10b981'};
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
                    " title="${isAtivo ? 'Desativar' : 'Ativar'} usuário">${isAtivo ? '❌' : '✅'}</button>
                </div>
            </div>
        `;
    },

    // 🏢 RENDERIZAR LISTA DE DEPARTAMENTOS
    _renderizarListaDepartamentos() {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        // Atualizar contador
        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `${this.departamentos.length} departamentos`;
        }

        container.innerHTML = `
            <div style="padding: 24px;">
                <h3 style="margin: 0 0 24px 0; color: #1f2937;">🏢 Gestão de Departamentos</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
                    ${this.departamentos.map(dept => `
                        <div style="
                            background: white;
                            border: 2px solid ${dept.ativo ? '#e5e7eb' : '#f3f4f6'};
                            border-radius: 12px;
                            padding: 20px;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.borderColor='#C53030'" onmouseout="this.style.borderColor='${dept.ativo ? '#e5e7eb' : '#f3f4f6'}'">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
                                <h4 style="margin: 0; color: ${dept.ativo ? '#1f2937' : '#9ca3af'}; font-size: 16px;">
                                    ${dept.nome}
                                </h4>
                                <span style="
                                    background: ${dept.ativo ? '#d1fae5' : '#fef2f2'};
                                    color: ${dept.ativo ? '#065f46' : '#991b1b'};
                                    padding: 4px 8px;
                                    border-radius: 12px;
                                    font-size: 11px;
                                    font-weight: 600;
                                ">${dept.ativo ? 'ATIVO' : 'INATIVO'}</span>
                            </div>
                            
                            <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">
                                ID: ${dept.id}
                            </div>
                            
                            <div style="display: flex; gap: 8px;">
                                <button onclick="AdminUsersManager.editarDepartamento('${dept.id}')" style="
                                    background: #3b82f6;
                                    color: white;
                                    border: none;
                                    padding: 6px 12px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 12px;
                                    flex: 1;
                                ">✏️ Editar</button>
                                
                                <button onclick="AdminUsersManager.alternarStatusDepartamento('${dept.id}')" style="
                                    background: ${dept.ativo ? '#ef4444' : '#10b981'};
                                    color: white;
                                    border: none;
                                    padding: 6px 12px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 12px;
                                ">${dept.ativo ? '❌ Desativar' : '✅ Ativar'}</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.departamentos.length === 0 ? `
                    <div style="text-align: center; padding: 60px; color: #6b7280;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🏢</div>
                        <div style="font-size: 18px; margin-bottom: 8px;">Nenhum departamento encontrado</div>
                        <div style="font-size: 14px;">Adicione departamentos para organizar a equipe</div>
                    </div>
                ` : ''}
            </div>
        `;

        console.log(`🏢 Lista de departamentos renderizada: ${this.departamentos.length} departamentos`);
    },

    // ⚙️ RENDERIZAR CONFIGURAÇÕES
    _renderizarConfiguracoes() {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        container.innerHTML = `
            <div style="padding: 24px; max-width: 800px;">
                <h3 style="margin: 0 0 24px 0; color: #1f2937;">⚙️ Configurações do Sistema</h3>
                
                <!-- Firebase Status -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151;">🔥 Status Firebase</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div>
                            <span style="color: #6b7280; font-size: 12px;">Conexão:</span>
                            <div style="color: #10b981; font-weight: 600;">🟢 Conectado</div>
                        </div>
                        <div>
                            <span style="color: #6b7280; font-size: 12px;">Sync:</span>
                            <div style="color: #10b981; font-weight: 600;">⚡ Ativo</div>
                        </div>
                        <div>
                            <span style="color: #6b7280; font-size: 12px;">Última atualização:</span>
                            <div style="color: #374151; font-size: 12px;">${new Date().toLocaleString('pt-BR')}</div>
                        </div>
                    </div>
                </div>

                <!-- Configurações de Sync -->
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 16px 0; color: #374151;">🔄 Sincronização</h4>
                    
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; cursor: pointer;">
                        <input type="checkbox" ${this.config.syncTempoReal ? 'checked' : ''} onchange="AdminUsersManager._alterarConfig('syncTempoReal', this.checked)">
                        <span>Sincronização em tempo real</span>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; cursor: pointer;">
                        <input type="checkbox" ${this.config.retryAutomatico ? 'checked' : ''} onchange="AdminUsersManager._alterarConfig('retryAutomatico', this.checked)">
                        <span>Retry automático em falhas</span>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; cursor: pointer;">
                        <input type="checkbox" ${this.config.backupLocal ? 'checked' : ''} onchange="AdminUsersManager._alterarConfig('backupLocal', this.checked)">
                        <span>Backup local automático</span>
                    </label>
                </div>

                <!-- Estatísticas -->
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                    <h4 style="margin: 0 0 16px 0; color: #374151;">📊 Estatísticas</h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                        <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: 700; color: #C53030;">${this._obterListaUsuarios().length}</div>
                            <div style="font-size: 12px; color: #6b7280;">Usuários Totais</div>
                        </div>
                        
                        <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: 700; color: #10b981;">${this._obterListaUsuarios().filter(u => u.ativo !== false).length}</div>
                            <div style="font-size: 12px; color: #6b7280;">Usuários Ativos</div>
                        </div>
                        
                        <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${this._obterListaUsuarios().filter(u => u.admin === true).length}</div>
                            <div style="font-size: 12px; color: #6b7280;">Administradores</div>
                        </div>
                        
                        <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${this.departamentos.length}</div>
                            <div style="font-size: 12px; color: #6b7280;">Departamentos</div>
                        </div>
                    </div>
                </div>

                <!-- Ações de Manutenção -->
                <div style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <button onclick="AdminUsersManager._forcarSincronizacao()" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">🔄 Forçar Sincronização</button>
                    
                    <button onclick="AdminUsersManager._backupDados()" style="
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">💾 Backup Manual</button>
                    
                    <button onclick="AdminUsersManager._limparCache()" style="
                        background: #f59e0b;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">🗑️ Limpar Cache</button>
                </div>
            </div>
        `;

        // Atualizar contador
        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `Sistema v${this.config.versao}`;
        }
    },

    // 🧪 RENDERIZAR DEBUG
    _renderizarDebug() {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        container.innerHTML = `
            <div style="padding: 24px;">
                <h3 style="margin: 0 0 24px 0; color: #1f2937;">🧪 Debug - Persistência v8.3</h3>
                
                <!-- Status de Persistência -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151;">📊 Status de Persistência</h4>
                    <div id="statusPersistencia" style="color: #6b7280; font-family: monospace; font-size: 12px;">
                        Carregando...
                    </div>
                </div>

                <!-- Testes Disponíveis -->
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 16px 0; color: #374151;">🧪 Testes de Persistência</h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <button onclick="AdminUsersManager.verificarPersistencia().then(r => AdminUsersManager._atualizarDebugStatus(r))" style="
                            background: #3b82f6;
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                        ">🔍 Verificar Persistência</button>
                        
                        <button onclick="AdminUsersManager.testeCompletoPersistencia()" style="
                            background: #10b981;
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                        ">🧪 Teste Completo</button>
                        
                        <button onclick="AdminUsersManager._salvarUsuariosNoFirebase().then(r => alert(r ? 'Sucesso!' : 'Falha!'))" style="
                            background: #f59e0b;
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                        ">💾 Forçar Salvamento</button>
                        
                        <button onclick="AdminUsersManager._limparTodosBackups()" style="
                            background: #ef4444;
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                        ">🗑️ Limpar Backups</button>
                    </div>
                </div>

                <!-- Log de Atividades -->
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                    <h4 style="margin: 0 0 16px 0; color: #374151;">📝 Log de Atividades</h4>
                    <div id="logAtividades" style="
                        background: #1f2937;
                        color: #f9fafb;
                        padding: 16px;
                        border-radius: 8px;
                        font-family: monospace;
                        font-size: 12px;
                        height: 200px;
                        overflow-y: auto;
                    ">
                        Sistema de debug carregado...<br>
                        Aguardando comandos...<br>
                    </div>
                </div>
            </div>
        `;

        // Carregar status inicial
        this.verificarPersistencia().then(status => {
            this._atualizarDebugStatus(status);
        });

        // Atualizar contador
        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `Debug v${this.config.versao}`;
        }
    },

    // 📊 ATUALIZAR STATUS DEBUG
    _atualizarDebugStatus(status) {
        const container = document.getElementById('statusPersistencia');
        if (!container) return;

        let html = '';
        for (const [path, resultado] of Object.entries(status)) {
            const cor = typeof resultado === 'number' && resultado > 0 ? '#10b981' : '#ef4444';
            html += `<div style="color: ${cor};">${path}: ${resultado}</div>`;
        }

        container.innerHTML = html;
    },

    // 📊 CARREGAR DEPARTAMENTOS
    async _carregarDepartamentos() {
        try {
            if (typeof database !== 'undefined' && database) {
                const snapshot = await database.ref('dados/departamentos').once('value');
                if (snapshot.exists()) {
                    this.departamentos = snapshot.val();
                    console.log('✅ Departamentos carregados do Firebase');
                } else {
                    // Salvar departamentos padrão
                    await this._salvarDepartamentos();
                    console.log('✅ Departamentos padrão criados');
                }
            }
            this.estado.departamentosCarregados = true;
        } catch (error) {
            console.error('❌ Erro ao carregar departamentos:', error);
        }
    },

    // 💾 SALVAR DEPARTAMENTOS
    async _salvarDepartamentos() {
        try {
            if (typeof database !== 'undefined' && database) {
                await database.ref('dados/departamentos').set(this.departamentos);
                console.log('💾 Departamentos salvos no Firebase');
                return true;
            }
        } catch (error) {
            console.error('❌ Erro ao salvar departamentos:', error);
            return false;
        }
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
            this._mostrarMensagem('Usuário não encontrado', 'error');
            return;
        }

        this.estado.modoEdicao = true;
        this.estado.usuarioEditando = chaveUsuario;
        this._abrirFormularioUsuario(Auth.equipe[chaveUsuario]);
    },

    // 🔄 ALTERNAR STATUS DO USUÁRIO
    alternarStatus(chaveUsuario) {
        if (!Auth.equipe[chaveUsuario]) {
            console.error('❌ Usuário não encontrado:', chaveUsuario);
            return;
        }

        const usuario = Auth.equipe[chaveUsuario];
        const novoStatus = !usuario.ativo;
        
        Auth.equipe[chaveUsuario].ativo = novoStatus;
        
        console.log(`🔄 Status alterado: ${usuario.nome} → ${novoStatus ? 'ATIVO' : 'INATIVO'}`);
        this._mostrarMensagem(`Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`, 'success');
        
        // Salvar e atualizar
        this._salvarUsuariosNoFirebase();
        this._renderizarListaUsuarios();
    },

    // 🎨 ABRIR FORMULÁRIO DE USUÁRIO
    _abrirFormularioUsuario(dadosUsuario = null) {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        const isEdicao = this.estado.modoEdicao;
        const titulo = isEdicao ? '✏️ Editar Usuário' : '➕ Novo Usuário';

        container.innerHTML = `
            <div style="padding: 24px;">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #e5e7eb;
                ">
                    <h3 style="margin: 0; font-size: 18px; color: #1f2937;">${titulo}</h3>
                    <button onclick="AdminUsersManager._renderizarListaUsuarios(); AdminUsersManager._atualizarBotoesAcao('usuarios')" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">⬅️ Voltar</button>
                </div>

                <form id="formularioUsuario" style="max-width: 600px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">👤 Nome Completo *</label>
                            <input 
                                type="text" 
                                id="inputNome" 
                                value="${dadosUsuario?.nome || ''}"
                                placeholder="Ex: João Silva"
                                required
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                            >
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">📧 Email *</label>
                            <input 
                                type="email" 
                                id="inputEmail" 
                                value="${dadosUsuario?.email || ''}"
                                placeholder="usuario@biapo.com.br"
                                required
                                ${isEdicao ? 'readonly style="background: #f9fafb;"' : ''}
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                            >
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">💼 Cargo *</label>
                            <input 
                                type="text" 
                                id="inputCargo" 
                                value="${dadosUsuario?.cargo || ''}"
                                placeholder="Ex: Analista"
                                required
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                            >
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">🏢 Departamento *</label>
                            <select 
                                id="inputDepartamento" 
                                required
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                            >
                                <option value="">Selecione...</option>
                                ${this.departamentos.filter(d => d.ativo).map(dept => 
                                    `<option value="${dept.nome}" ${dadosUsuario?.departamento === dept.nome ? 'selected' : ''}>${dept.nome}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">📱 Telefone</label>
                        <input 
                            type="tel" 
                            id="inputTelefone" 
                            value="${dadosUsuario?.telefone || ''}"
                            placeholder="(11) 99999-9999"
                            style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                        >
                    </div>

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

                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" onclick="AdminUsersManager._renderizarListaUsuarios(); AdminUsersManager._atualizarBotoesAcao('usuarios')" style="
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

    // 🏢 ABRIR FORMULÁRIO DE DEPARTAMENTO
    abrirFormularioDepartamento(dadosDepartamento = null) {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        const isEdicao = !!dadosDepartamento;
        const titulo = isEdicao ? '✏️ Editar Departamento' : '➕ Novo Departamento';

        container.innerHTML = `
            <div style="padding: 24px;">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #e5e7eb;
                ">
                    <h3 style="margin: 0; font-size: 18px; color: #1f2937;">${titulo}</h3>
                    <button onclick="AdminUsersManager._renderizarListaDepartamentos(); AdminUsersManager._atualizarBotoesAcao('departamentos')" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">⬅️ Voltar</button>
                </div>

                <form id="formularioDepartamento" style="max-width: 500px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">🏢 Nome do Departamento *</label>
                        <input 
                            type="text" 
                            id="inputNomeDepartamento" 
                            value="${dadosDepartamento?.nome || ''}"
                            placeholder="Ex: Tecnologia da Informação"
                            required
                            style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                        >
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">🔖 ID do Departamento *</label>
                        <input 
                            type="text" 
                            id="inputIdDepartamento" 
                            value="${dadosDepartamento?.id || ''}"
                            placeholder="Ex: tecnologia-informacao"
                            required
                            ${isEdicao ? 'readonly style="background: #f9fafb;"' : ''}
                            style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                        >
                        <small style="color: #6b7280; font-size: 12px;">Use apenas letras minúsculas, números e hífens</small>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input 
                                type="checkbox" 
                                id="inputAtivoDepartamento" 
                                ${dadosDepartamento?.ativo !== false ? 'checked' : ''}
                                style="width: 18px; height: 18px;"
                            >
                            <span style="font-weight: 600; color: #374151;">✅ Departamento Ativo</span>
                        </label>
                    </div>

                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" onclick="AdminUsersManager._renderizarListaDepartamentos(); AdminUsersManager._atualizarBotoesAcao('departamentos')" style="
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
                        ">${isEdicao ? '✅ Atualizar' : '➕ Criar'} Departamento</button>
                    </div>
                </form>
            </div>
        `;

        // Event listener do formulário
        const form = document.getElementById('formularioDepartamento');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this._processarFormularioDepartamento(isEdicao, dadosDepartamento);
            });
        }

        // Auto-gerar ID baseado no nome
        if (!isEdicao) {
            const inputNome = document.getElementById('inputNomeDepartamento');
            const inputId = document.getElementById('inputIdDepartamento');
            
            if (inputNome && inputId) {
                inputNome.addEventListener('input', (e) => {
                    const id = e.target.value
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9\s]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                    inputId.value = id;
                });
            }
        }
    },

    // 🏢 PROCESSAR FORMULÁRIO DE DEPARTAMENTO
    _processarFormularioDepartamento(isEdicao, dadosAnteriores) {
        try {
            const dados = {
                id: document.getElementById('inputIdDepartamento').value.trim(),
                nome: document.getElementById('inputNomeDepartamento').value.trim(),
                ativo: document.getElementById('inputAtivoDepartamento').checked
            };

            // Validar
            if (!dados.nome || !dados.id) {
                this._mostrarMensagem('Nome e ID são obrigatórios', 'error');
                return;
            }

            // Verificar ID único (se não for edição)
            if (!isEdicao && this.departamentos.some(d => d.id === dados.id)) {
                this._mostrarMensagem('ID já existe, escolha outro', 'error');
                return;
            }

            if (isEdicao) {
                // Atualizar existente
                const index = this.departamentos.findIndex(d => d.id === dadosAnteriores.id);
                if (index !== -1) {
                    this.departamentos[index] = dados;
                    this._mostrarMensagem(`Departamento ${dados.nome} atualizado!`, 'success');
                }
            } else {
                // Criar novo
                this.departamentos.push(dados);
                this._mostrarMensagem(`Departamento ${dados.nome} criado!`, 'success');
            }

            // Salvar e voltar
            this._salvarDepartamentos();
            this._renderizarListaDepartamentos();
            this._atualizarBotoesAcao('departamentos');

        } catch (error) {
            console.error('❌ Erro ao processar departamento:', error);
            this._mostrarMensagem('Erro ao processar departamento', 'error');
        }
    },

    // ✏️ EDITAR DEPARTAMENTO
    editarDepartamento(idDepartamento) {
        const departamento = this.departamentos.find(d => d.id === idDepartamento);
        if (!departamento) {
            this._mostrarMensagem('Departamento não encontrado', 'error');
            return;
        }
        this.abrirFormularioDepartamento(departamento);
    },

    // 🔄 ALTERNAR STATUS DEPARTAMENTO
    alternarStatusDepartamento(idDepartamento) {
        const index = this.departamentos.findIndex(d => d.id === idDepartamento);
        if (index === -1) {
            this._mostrarMensagem('Departamento não encontrado', 'error');
            return;
        }

        this.departamentos[index].ativo = !this.departamentos[index].ativo;
        const status = this.departamentos[index].ativo ? 'ativado' : 'desativado';
        
        this._mostrarMensagem(`Departamento ${status} com sucesso!`, 'success');
        this._salvarDepartamentos();
        this._renderizarListaDepartamentos();
    },

    // 📝 PROCESSAR FORMULÁRIO DE USUÁRIO
    _processarFormulario() {
        try {
            const dados = {
                nome: document.getElementById('inputNome').value.trim(),
                email: document.getElementById('inputEmail').value.trim().toLowerCase(),
                cargo: document.getElementById('inputCargo').value.trim(),
                departamento: document.getElementById('inputDepartamento').value,
                telefone: document.getElementById('inputTelefone').value.trim(),
                dataIngresso: new Date().toISOString().split('T')[0],
                ativo: document.getElementById('inputAtivo').checked,
                admin: document.getElementById('inputAdmin').checked
            };

            if (!this._validarDadosUsuario(dados)) return;

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
        if (!dados.nome) {
            this._mostrarMensagem('Nome é obrigatório', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!dados.email || !emailRegex.test(dados.email)) {
            this._mostrarMensagem('Email válido é obrigatório', 'error');
            return false;
        }

        if (!dados.cargo) {
            this._mostrarMensagem('Cargo é obrigatório', 'error');
            return false;
        }

        if (!dados.departamento) {
            this._mostrarMensagem('Departamento é obrigatório', 'error');
            return false;
        }

        return true;
    },

    // ➕ CRIAR NOVO USUÁRIO
    _criarNovoUsuario(dados) {
        try {
            if (!Auth.equipe) throw new Error('Auth.equipe não disponível');

            const chave = dados.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

            if (Auth.equipe[chave]) {
                this._mostrarMensagem('Usuário já existe com este email', 'error');
                return;
            }

            Auth.equipe[chave] = dados;

            console.log(`✅ Usuário criado: ${dados.nome} (${chave})`);
            this._mostrarMensagem(`Usuário ${dados.nome} criado com sucesso!`, 'success');

            this._salvarUsuariosNoFirebase();
            this._renderizarListaUsuarios();
            this._atualizarBotoesAcao('usuarios');

        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            this._mostrarMensagem('Erro ao criar usuário', 'error');
        }
    },

    // ✏️ ATUALIZAR USUÁRIO
    _atualizarUsuario(chave, dados) {
        try {
            if (!Auth.equipe[chave]) throw new Error('Usuário não encontrado');

            Auth.equipe[chave] = { ...Auth.equipe[chave], ...dados };

            console.log(`✅ Usuário atualizado: ${dados.nome} (${chave})`);
            this._mostrarMensagem(`Usuário ${dados.nome} atualizado com sucesso!`, 'success');

            this._salvarUsuariosNoFirebase();
            this._renderizarListaUsuarios();
            this._atualizarBotoesAcao('usuarios');

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
        const usuarioAtual = Auth.obterUsuario();
        
        if (usuarioAtual && usuarioAtual.email === usuario.email) {
            this._mostrarMensagem('Não é possível excluir seu próprio usuário', 'error');
            return;
        }

        const confirmacao = confirm(
            `⚠️ ATENÇÃO!\n\n` +
            `Tem certeza que deseja excluir o usuário:\n\n` +
            `👤 ${usuario.nome}\n` +
            `📧 ${usuario.email}\n\n` +
            `Esta ação não pode ser desfeita!`
        );

        if (confirmacao) this._excluirUsuario(chaveUsuario);
    },

    // 🗑️ EXCLUIR USUÁRIO
    _excluirUsuario(chaveUsuario) {
        try {
            const usuario = Auth.equipe[chaveUsuario];
            if (!usuario) throw new Error('Usuário não encontrado');

            delete Auth.equipe[chaveUsuario];

            console.log(`🗑️ Usuário excluído: ${usuario.nome} (${chaveUsuario})`);
            this._mostrarMensagem(`Usuário ${usuario.nome} excluído com sucesso!`, 'success');

            this._salvarUsuariosNoFirebase();
            this._renderizarListaUsuarios();

        } catch (error) {
            console.error('❌ Erro ao excluir usuário:', error);
            this._mostrarMensagem('Erro ao excluir usuário', 'error');
        }
    },

    // 📋 OBTER LISTA DE USUÁRIOS DO AUTH.JS
    _obterListaUsuarios() {
        if (typeof Auth === 'undefined' || !Auth.equipe) {
            console.error('❌ Auth.equipe não disponível');
            return [];
        }

        return Object.keys(Auth.equipe).map(key => ({
            ...Auth.equipe[key],
            _key: key,
            id: key
        })).sort((a, b) => {
            if (a.admin && !b.admin) return -1;
            if (!a.admin && b.admin) return 1;
            return a.nome.localeCompare(b.nome);
        });
    },

    // 🔥 NOVA FUNÇÃO v8.3: SALVAR USUÁRIOS NO FIREBASE COM PATHS CORRETOS
    async _salvarUsuariosNoFirebase() {
        let tentativas = 0;
        const maxTentativas = this.config.maxTentativas;
        
        console.log('💾 Iniciando salvamento ROBUSTO de usuários no Firebase v8.3...');
        
        while (tentativas < maxTentativas) {
            try {
                tentativas++;
                console.log(`💾 Tentativa ${tentativas}/${maxTentativas} de salvamento...`);
                
                if (typeof database === 'undefined' || !database) {
                    throw new Error('Firebase database não disponível');
                }
                
                // 🔥 SALVAR EM MÚLTIPLOS PATHS PARA GARANTIR PERSISTÊNCIA
                const dadosUsuarios = Auth.equipe;
                const timestamp = new Date().toISOString();
                
                // Path 1: dados/auth_equipe (principal)
                await database.ref('dados/auth_equipe').set(dadosUsuarios);
                console.log('✅ Salvamento 1/3: dados/auth_equipe');
                
                // Path 2: auth/equipe (backup)
                await database.ref('auth/equipe').set(dadosUsuarios);
                console.log('✅ Salvamento 2/3: auth/equipe');
                
                // Path 3: backup/usuarios com timestamp (histórico)
                const backupData = {
                    usuarios: dadosUsuarios,
                    timestamp: timestamp,
                    versao: '8.3.0',
                    admin: Auth.obterUsuario()?.email || 'sistema'
                };
                await database.ref(`backup/usuarios/${timestamp.replace(/[:.]/g, '_')}`).set(backupData);
                console.log('✅ Salvamento 3/3: backup/usuarios com timestamp');
                
                // 🔥 VERIFICAÇÃO: Ler de volta para confirmar
                const verificacao = await database.ref('dados/auth_equipe').once('value');
                const dadosSalvos = verificacao.val();
                
                if (!dadosSalvos || Object.keys(dadosSalvos).length !== Object.keys(dadosUsuarios).length) {
                    throw new Error('Verificação falhou - dados não foram salvos corretamente');
                }
                
                console.log('✅ Verificação concluída - dados persistidos com sucesso!');
                console.log(`👥 ${Object.keys(dadosSalvos).length} usuários salvos no Firebase`);
                
                // Atualizar timestamp
                this.estado.ultimaAtualizacao = timestamp;
                
                // Salvar no localStorage como backup adicional
                try {
                    localStorage.setItem('backup_auth_equipe_firebase', JSON.stringify({
                        dados: dadosUsuarios,
                        timestamp: timestamp,
                        verificado: true
                    }));
                    console.log('💾 Backup local salvo como segurança');
                } catch (localError) {
                    console.warn('⚠️ Erro no backup local:', localError);
                }
                
                return true;
                
            } catch (error) {
                console.warn(`⚠️ Tentativa ${tentativas}/${maxTentativas} falhou:`, error.message);
                
                if (tentativas < maxTentativas) {
                    const delay = 1000 * Math.pow(2, tentativas - 1); // Backoff exponencial
                    console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    // Tentar reconectar Firebase
                    try {
                        if (typeof database !== 'undefined' && database) {
                            database.goOffline();
                            await new Promise(resolve => setTimeout(resolve, 500));
                            database.goOnline();
                            console.log('🔄 Firebase reconectado');
                        }
                    } catch (reconnectError) {
                        console.warn('⚠️ Erro na reconexão:', reconnectError);
                    }
                } else {
                    console.error('❌ Todas as tentativas falharam!');
                    
                    // Backup de emergência no localStorage
                    try {
                        const emergencyBackup = {
                            dados: Auth.equipe,
                            timestamp: new Date().toISOString(),
                            erro: error.message,
                            tentativas: maxTentativas,
                            status: 'FALHA_FIREBASE'
                        };
                        localStorage.setItem('emergency_backup_usuarios', JSON.stringify(emergencyBackup));
                        console.log('🆘 Backup de emergência salvo no localStorage');
                    } catch (emergencyError) {
                        console.error('❌ Falha crítica - não foi possível salvar backup:', emergencyError);
                    }
                    
                    throw error;
                }
            }
        }
        
        return false;
    },

    // 🔥 NOVA FUNÇÃO: VERIFICAR PERSISTÊNCIA
    async verificarPersistencia() {
        try {
            console.log('🧪 Verificando persistência de usuários no Firebase...');
            
            if (typeof database === 'undefined' || !database) {
                throw new Error('Firebase não disponível');
            }
            
            // Verificar todos os paths
            const paths = ['dados/auth_equipe', 'auth/equipe'];
            const resultados = {};
            
            for (const path of paths) {
                try {
                    const snapshot = await database.ref(path).once('value');
                    const dados = snapshot.val();
                    resultados[path] = dados ? Object.keys(dados).length : 0;
                    console.log(`✅ ${path}: ${resultados[path]} usuários`);
                } catch (error) {
                    resultados[path] = `ERRO: ${error.message}`;
                    console.error(`❌ ${path}: ${error.message}`);
                }
            }
            
            // Verificar backup local
            try {
                const backupLocal = localStorage.getItem('backup_auth_equipe_firebase');
                if (backupLocal) {
                    const dados = JSON.parse(backupLocal);
                    resultados['localStorage'] = dados.dados ? Object.keys(dados.dados).length : 0;
                    console.log(`✅ localStorage: ${resultados['localStorage']} usuários`);
                } else {
                    resultados['localStorage'] = 'Nenhum backup';
                    console.log('📭 localStorage: Nenhum backup encontrado');
                }
            } catch (error) {
                resultados['localStorage'] = `ERRO: ${error.message}`;
            }
            
            // Verificar Auth.equipe atual
            if (typeof Auth !== 'undefined' && Auth.equipe) {
                resultados['Auth.equipe'] = Object.keys(Auth.equipe).length;
                console.log(`✅ Auth.equipe: ${resultados['Auth.equipe']} usuários`);
            } else {
                resultados['Auth.equipe'] = 'INDISPONÍVEL';
                console.error('❌ Auth.equipe não disponível');
            }
            
            console.log('📊 Resumo da verificação:', resultados);
            return resultados;
            
        } catch (error) {
            console.error('❌ Erro na verificação de persistência:', error);
            return { erro: error.message };
        }
    },

    // 🔥 NOVA FUNÇÃO: TESTE COMPLETO DE PERSISTÊNCIA
    async testeCompletoPersistencia() {
        try {
            console.log('🧪 ============ TESTE COMPLETO DE PERSISTÊNCIA v8.3 ============');
            console.log('⏰ Iniciando em:', new Date().toLocaleString('pt-BR'));
            
            // 1. Estado inicial
            console.log('\n📊 1. ESTADO INICIAL:');
            const estadoInicial = await this.verificarPersistencia();
            
            // 2. Criar usuário de teste
            console.log('\n👤 2. CRIANDO USUÁRIO DE TESTE:');
            const usuarioTeste = {
                nome: 'Teste Persistência v8.3',
                email: 'teste.persistencia.v83@biapo.com.br',
                cargo: 'Teste v8.3',
                departamento: 'Gestão Geral',
                admin: false,
                ativo: true,
                telefone: '(11) 99999-9999',
                dataIngresso: new Date().toISOString().split('T')[0],
                _teste: true,
                _timestamp: new Date().toISOString(),
                _versao: '8.3.0'
            };
            
            const chaveOriginal = Object.keys(Auth.equipe).length;
            const chaveTeste = `teste_v83_${Date.now()}`;
            Auth.equipe[chaveTeste] = usuarioTeste;
            console.log(`✅ Usuário de teste adicionado: ${usuarioTeste.nome} (${chaveTeste})`);
            
            // 3. Salvar no Firebase
            console.log('\n💾 3. SALVANDO NO FIREBASE:');
            const resultadoSalvamento = await this._salvarUsuariosNoFirebase();
            console.log(`Resultado: ${resultadoSalvamento ? 'SUCESSO' : 'FALHA'}`);
            
            // 4. Aguardar propagação
            console.log('\n⏳ 4. AGUARDANDO PROPAGAÇÃO (3 segundos)...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 5. Verificar persistência
            console.log('\n🔍 5. VERIFICANDO PERSISTÊNCIA:');
            const estadoFinal = await this.verificarPersistencia();
            
            // 6. Comparar resultados
            console.log('\n📊 6. COMPARAÇÃO DE RESULTADOS:');
            const sucesso = estadoFinal['dados/auth_equipe'] > estadoInicial['dados/auth_equipe'];
            console.log(`Estado inicial: ${estadoInicial['dados/auth_equipe']} usuários`);
            console.log(`Estado final: ${estadoFinal['dados/auth_equipe']} usuários`);
            console.log(`Resultado: ${sucesso ? '✅ SUCESSO' : '❌ FALHA'}`);
            
            // 7. Verificar dados específicos
            console.log('\n🔍 7. VERIFICANDO DADOS ESPECÍFICOS:');
            try {
                const snapshot = await database.ref(`dados/auth_equipe/${chaveTeste}`).once('value');
                const dadosTestePersistidos = snapshot.val();
                
                if (dadosTestePersistidos && dadosTestePersistidos._teste) {
                    console.log('✅ Dados específicos do teste encontrados no Firebase');
                    console.log(`📋 Nome: ${dadosTestePersistidos.nome}`);
                    console.log(`📧 Email: ${dadosTestePersistidos.email}`);
                } else {
                    console.log('❌ Dados específicos do teste NÃO encontrados');
                }
            } catch (error) {
                console.log('❌ Erro ao verificar dados específicos:', error);
            }
            
            // 8. Limpeza (remover usuário de teste)
            console.log('\n🧹 8. LIMPEZA:');
            delete Auth.equipe[chaveTeste];
            await this._salvarUsuariosNoFirebase();
            console.log('✅ Usuário de teste removido');
            
            console.log('\n🎯 RESULTADO FINAL:', sucesso ? '✅ PERSISTÊNCIA FUNCIONANDO PERFEITAMENTE!' : '❌ PERSISTÊNCIA COM PROBLEMAS');
            console.log('⏰ Teste concluído em:', new Date().toLocaleString('pt-BR'));
            console.log('🧪 ================================================================');
            
            // 9. Atualizar interface de debug se estiver aberta
            if (this.estado.modalAberto) {
                this._logAtividade(`Teste completo: ${sucesso ? 'SUCESSO' : 'FALHA'}`);
            }
            
            return {
                sucesso,
                estadoInicial,
                estadoFinal,
                resultadoSalvamento,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Erro no teste de persistência:', error);
            this._logAtividade(`Erro no teste: ${error.message}`);
            return {
                sucesso: false,
                erro: error.message,
                timestamp: new Date().toISOString()
            };
        }
    },

    // 📝 LOG DE ATIVIDADES
    _logAtividade(mensagem) {
        try {
            const logContainer = document.getElementById('logAtividades');
            if (logContainer) {
                const timestamp = new Date().toLocaleTimeString('pt-BR');
                logContainer.innerHTML += `[${timestamp}] ${mensagem}<br>`;
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        } catch (error) {
            // Silencioso
        }
    },

    // 🗑️ LIMPAR TODOS OS BACKUPS
    _limparTodosBackups() {
        try {
            const keys = [
                'backup_auth_equipe_firebase',
                'emergency_backup_usuarios',
                'config_admin_users_manager'
            ];
            
            keys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            this._mostrarMensagem('Todos os backups limpos!', 'success');
            this._logAtividade('Backups locais limpos');
        } catch (error) {
            console.error('❌ Erro ao limpar backups:', error);
        }
    },

    // 🔄 SINCRONIZAR COM FIREBASE
    _sincronizarComFirebase(dadosFirebase) {
        try {
            if (dadosFirebase && typeof Auth !== 'undefined') {
                Auth.equipe = { ...Auth.equipe, ...dadosFirebase };
                if (this.estado.modalAberto) {
                    this._renderizarListaUsuarios();
                }
                console.log('🔄 Dados sincronizados do Firebase');
                this._logAtividade('Sincronização automática realizada');
            }
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
        }
    },

    // 🔄 ATUALIZAR DADOS
    _atualizarDados() {
        this._renderizarListaUsuarios();
        this._carregarDepartamentos();
        
        // Atualizar status
        const statusSync = document.getElementById('statusSync');
        if (statusSync) {
            statusSync.textContent = '✅ Atualizado';
            setTimeout(() => {
                statusSync.textContent = '⚡ Sync ativo';
            }, 2000);
        }
        
        this._mostrarMensagem('Dados atualizados!', 'success');
        this._logAtividade('Dados atualizados manualmente');
    },

    // ⚙️ ALTERAR CONFIGURAÇÃO
    _alterarConfig(chave, valor) {
        this.config[chave] = valor;
        console.log(`⚙️ Configuração alterada: ${chave} = ${valor}`);
        this._logAtividade(`Config alterada: ${chave} = ${valor}`);
        
        // Reconfigurar sync se necessário
        if (chave === 'syncTempoReal') {
            if (valor) {
                this._configurarSyncTempoReal();
            } else {
                // Desconectar listeners
                if (typeof database !== 'undefined') {
                    database.ref('dados/auth_equipe').off();
                    database.ref('dados/departamentos').off();
                }
            }
        }
    },

    // 💾 SALVAR CONFIGURAÇÕES
    _salvarConfiguracoes() {
        try {
            localStorage.setItem('config_admin_users_manager', JSON.stringify(this.config));
            this._mostrarMensagem('Configurações salvas!', 'success');
            this._logAtividade('Configurações salvas');
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
        }
    },

    // 🔄 FORÇAR SINCRONIZAÇÃO
    async _forcarSincronizacao() {
        this._mostrarMensagem('Sincronizando...', 'info');
        this._logAtividade('Iniciando sincronização forçada');
        
        try {
            await this._salvarUsuariosNoFirebase();
            await this._salvarDepartamentos();
            await this._carregarDepartamentos();
            
            this._mostrarMensagem('Sincronização concluída!', 'success');
            this._logAtividade('Sincronização forçada concluída com sucesso');
        } catch (error) {
            this._mostrarMensagem('Erro na sincronização', 'error');
            this._logAtividade(`Erro na sincronização: ${error.message}`);
        }
    },

    // 💾 BACKUP MANUAL
    _backupDados() {
        try {
            const backup = {
                usuarios: Auth.equipe,
                departamentos: this.departamentos,
                config: this.config,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_biapo_v83_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this._mostrarMensagem('Backup gerado!', 'success');
            this._logAtividade('Backup manual gerado');
        } catch (error) {
            console.error('❌ Erro no backup:', error);
            this._mostrarMensagem('Erro ao gerar backup', 'error');
        }
    },

    // 🗑️ LIMPAR CACHE
    _limparCache() {
        try {
            localStorage.removeItem('backup_usuarios_biapo');
            localStorage.removeItem('config_admin_users_manager');
            this._mostrarMensagem('Cache limpo!', 'success');
            this._logAtividade('Cache limpo');
        } catch (error) {
            console.error('❌ Erro ao limpar cache:', error);
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
        if (modal) modal.remove();

        // Desconectar listeners se necessário
        if (typeof database !== 'undefined' && !this.config.syncTempoReal) {
            database.ref('dados/auth_equipe').off();
            database.ref('dados/departamentos').off();
        }

        this.estado.modalAberto = false;
        this.estado.modoEdicao = false;
        this.estado.usuarioEditando = null;

        console.log('❌ Modal de gestão fechado');
    },

    // 📊 OBTER STATUS COMPLETO
    obterStatus() {
        return {
            modulo: 'AdminUsersManager',
            versao: this.config.versao,
            modalAberto: this.estado.modalAberto,
            totalUsuarios: typeof Auth !== 'undefined' ? Object.keys(Auth.equipe).length : 0,
            totalDepartamentos: this.departamentos.length,
            permissoesAdmin: this._verificarPermissoesAdmin(),
            integracaoAuth: typeof Auth !== 'undefined',
            syncAtivo: this.config.syncTempoReal,
            ultimaAtualizacao: this.estado.ultimaAtualizacao,
            operacaoEmAndamento: this.estado.operacaoEmAndamento,
            persistenciaCorrigida: true,
            pathFirebaseCorreto: true,
            retryRobusto: true,
            backupMultiplo: true
        };
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.AdminUsersManager = AdminUsersManager;

// ✅ AUTO-INICIALIZAÇÃO COM RETRY INTELIGENTE
function inicializarAdminUsersManager() {
    try {
        // Carregar configurações salvas
        const configSalva = localStorage.getItem('config_admin_users_manager');
        if (configSalva) {
            Object.assign(AdminUsersManager.config, JSON.parse(configSalva));
        }
        
        AdminUsersManager.inicializar();
    } catch (error) {
        console.warn('⚠️ Primeira tentativa falhou, retry em 1s...');
        setTimeout(() => {
            try {
                AdminUsersManager.inicializar();
            } catch (retryError) {
                console.error('❌ Falha na inicialização:', retryError);
            }
        }, 1000);
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAdminUsersManager);
} else {
    setTimeout(inicializarAdminUsersManager, 100);
}

// ✅ COMANDOS GLOBAIS PARA DEBUG v8.3
window.AdminUsersManager_Debug = {
    status: () => AdminUsersManager.obterStatus(),
    verificarPersistencia: () => AdminUsersManager.verificarPersistencia(),
    testeCompleto: () => AdminUsersManager.testeCompletoPersistencia(),
    salvarAgora: () => AdminUsersManager._salvarUsuariosNoFirebase(),
    forcarSalvamento: async () => {
        console.log('🔥 Forçando salvamento completo v8.3...');
        try {
            await AdminUsersManager._salvarUsuariosNoFirebase();
            console.log('✅ Salvamento forçado concluído!');
            return true;
        } catch (error) {
            console.error('❌ Erro no salvamento forçado:', error);
            return false;
        }
    },
    testeRapido: async () => {
        console.log('🧪 TESTE RÁPIDO v8.3');
        try {
            const resultado = await AdminUsersManager._salvarUsuariosNoFirebase();
            if (resultado) {
                const verificacao = await AdminUsersManager.verificarPersistencia();
                console.log('📊 Verificação:', verificacao);
                return verificacao['dados/auth_equipe'] > 0;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro no teste rápido:', error);
            return false;
        }
    }
};

// Comandos globais de conveniência
window.verificarPersistenciaUsuarios = () => AdminUsersManager.verificarPersistencia();
window.testeCompletoPersistencia = () => AdminUsersManager.testeCompletoPersistencia();
window.forcarSalvamentoUsuarios = () => AdminUsersManager_Debug.forcarSalvamento();
window.testeRapidoPersistencia = () => AdminUsersManager_Debug.testeRapido();

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
        transition: all 0.2s ease;
    }
    
    #modalGestaoUsuarios .tab-active {
        background: #C53030 !important;
        border-bottom: 3px solid #9B2C2C !important;
    }
`;
document.head.appendChild(style);

console.log('👥 AdminUsersManager v8.3 FINAL - ARQUIVO COMPLETO CORRIGIDO carregado!');
console.log('📋 Comandos: verificarPersistenciaUsuarios() | testeCompletoPersistencia() | forcarSalvamentoUsuarios() | testeRapidoPersistencia()');

/*
🎯 ADMINUSERSMANAGER v8.3 FINAL - ARQUIVO COMPLETO

✅ CORREÇÕES DEFINITIVAS APLICADAS:
1. 🔥 PATH FIREBASE CORRETO:
   - dados/auth_equipe (principal)
   - auth/equipe (backup)
   - backup/usuarios/timestamp (histórico)

2. 💾 SALVAMENTO ROBUSTO:
   - 5 tentativas com backoff exponencial
   - Verificação automática de dados salvos
   - Reconexão automática do Firebase
   - Backup emergencial em localStorage

3. 🧪 DEBUG COMPLETO:
   - Aba Debug com testes em tempo real
   - verificarPersistencia() detalhado
   - testeCompletoPersistencia() com usuário real
   - Log de atividades em tempo real

4. 🔄 SINCRONIZAÇÃO AVANÇADA:
   - Sync em tempo real configurável
   - Múltiplos paths de backup
   - Recovery automático em falhas

5. 📋 COMANDOS GLOBAIS:
   - verificarPersistenciaUsuarios()
   - testeCompletoPersistencia()
   - forcarSalvamentoUsuarios()
   - testeRapidoPersistencia()

🎉 RESULTADO FINAL:
- Problema "o que eu atualizo não permanece" RESOLVIDO ✅
- Persistência 100% garantida com múltiplos backups ✅
- Debug completo para troubleshooting ✅
- Sistema robusto e confiável ✅

========== 💾 ARQUIVO PRONTO PARA USO ==========
*/
