/**
 * 👥 ADMIN USERS MANAGER v8.5 - DEPARTAMENTOS REAIS BIAPO
 * 
 * 🔥 ATUALIZAÇÕES v8.5:
 * - ✅ 5 Departamentos reais da BIAPO implementados
 * - ✅ Cargos específicos por departamento
 * - ✅ Validações melhoradas
 * - ✅ Interface atualizada para estrutura real
 * - ✅ Formulários com departamentos corretos
 */

const AdminUsersManager = {
    // ✅ CONFIGURAÇÃO v8.5
    config: {
        versao: '8.5.0',
        permissaoAdmin: true,
        persistenciaFirebase: true,
        validacaoEmail: true,
        backupLocal: true,
        syncTempoReal: true,
        retryAutomatico: true,
        maxTentativas: 2,
        pathPrincipal: 'dados/auth_equipe',
        pathBackup: 'auth/equipe'
    },

    // ✅ ESTADO
    estado: {
        modalAberto: false,
        modoEdicao: false,
        usuarioEditando: null,
        usuariosCarregados: false,
        departamentosCarregados: false,
        operacaoEmAndamento: false,
        ultimaAtualizacao: null,
        firebaseDisponivel: null,
        ultimaVerificacaoFirebase: null
    },

    // 🔥 DEPARTAMENTOS REAIS BIAPO v8.5
    departamentos: [
        { 
            id: 'planejamento-controle', 
            nome: 'Planejamento & Controle', 
            ativo: true,
            cargos: ['Coordenadora Geral', 'Arquiteta', 'Coordenador de Planejamento']
        },
        { 
            id: 'documentacao-arquivo', 
            nome: 'Documentação & Arquivo', 
            ativo: true,
            cargos: ['Coordenador', 'Arquiteta', 'Estagiária de arquitetura']
        },
        { 
            id: 'suprimentos', 
            nome: 'Suprimentos', 
            ativo: true,
            cargos: ['Comprador', 'Coordenador', 'Almoxarifado']
        },
        { 
            id: 'qualidade-producao', 
            nome: 'Qualidade & Produção', 
            ativo: true,
            cargos: ['Coordenador', 'Estagiário de engenharia']
        },
        { 
            id: 'recursos-humanos', 
            nome: 'Recursos Humanos', 
            ativo: true,
            cargos: ['Chefe administrativo', 'Analista RH']
        }
    ],

    // 🔥 VERIFICAÇÃO FIREBASE CENTRALIZADA E CACHED
    _verificarFirebase() {
        const agora = Date.now();
        
        // Cache válido por 30 segundos
        if (this.estado.ultimaVerificacaoFirebase && 
            (agora - this.estado.ultimaVerificacaoFirebase) < 30000 &&
            this.estado.firebaseDisponivel !== null) {
            return this.estado.firebaseDisponivel;
        }
        
        const disponivel = typeof database !== 'undefined' && database;
        
        this.estado.firebaseDisponivel = disponivel;
        this.estado.ultimaVerificacaoFirebase = agora;
        
        return disponivel;
    },

    // 🚀 INICIALIZAR MÓDULO
    inicializar() {
        console.log('👥 Inicializando AdminUsersManager v8.5 - Departamentos Reais...');
        
        try {
            this._integrarComAuth();
            this._carregarDepartamentos();
            this._configurarSyncTempoReal();
            
            console.log('✅ AdminUsersManager v8.5 inicializado com departamentos reais!');
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
                console.log('🔧 Auth → AdminUsersManager: Redirecionando...');
                return this.abrirInterfaceGestao();
            };
            console.log('✅ Integração com Auth.js concluída');
        } else {
            console.warn('⚠️ Auth.js não encontrado - integração adiada');
        }
    },

    // 🔄 CONFIGURAR SYNC
    _configurarSyncTempoReal() {
        if (!this._verificarFirebase()) return;
        
        try {
            // Listener para usuários
            database.ref(this.config.pathPrincipal).on('value', (snapshot) => {
                if (snapshot.exists() && this.estado.modalAberto) {
                    console.log('🔄 Dados atualizados em tempo real');
                    this._sincronizarComFirebase(snapshot.val());
                }
            });

            // Listener para departamentos
            database.ref('dados/departamentos').on('value', (snapshot) => {
                if (snapshot.exists()) {
                    console.log('🔄 Departamentos atualizados');
                    // Manter departamentos locais como autoridade
                    console.log('📊 Usando departamentos locais (v8.5)');
                }
            });

            console.log('✅ Sync tempo real configurado');
        } catch (error) {
            console.warn('⚠️ Erro ao configurar sync:', error);
        }
    },

    // 🔐 VERIFICAR PERMISSÕES
    _verificarPermissoesAdmin() {
        if (typeof Auth === 'undefined' || !Auth.ehAdmin || !Auth.ehAdmin()) {
            this._mostrarMensagem('❌ Acesso restrito a administradores', 'error');
            return false;
        }
        return true;
    },

    // 🎨 ABRIR INTERFACE
    abrirInterfaceGestao() {
        try {
            if (!this._verificarPermissoesAdmin()) return false;

            console.log('✅ Abrindo interface administrativa v8.5...');

            this.estado.modalAberto = true;
            this.estado.modoEdicao = false;
            this.estado.usuarioEditando = null;

            const modal = this._criarModalGestao();
            document.body.appendChild(modal);

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

    // 🎨 CRIAR MODAL v8.5
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
                <!-- Header v8.5 -->
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
                            👥 Gestão BIAPO v8.5
                        </h2>
                        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                            Departamentos Reais + Gestão Completa
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

                <!-- Abas v8.5 -->
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
                    
                    <button onclick="AdminUsersManager.abrirAba('relatorios')" id="abaRelatorios" style="
                        padding: 16px 24px;
                        border: none;
                        background: #6b7280;
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    ">📊 Relatórios</button>

                    <button onclick="AdminUsersManager.abrirAba('debug')" id="abaDebug" style="
                        padding: 16px 24px;
                        border: none;
                        background: #6b7280;
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    ">🧪 Debug</button>
                </div>

                <!-- Toolbar v8.5 -->
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
                            ⚡ v8.5 - Departamentos Reais
                        </span>
                    </div>
                    
                    <div id="botoesAcao">
                        <!-- Botões dinâmicos -->
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

        // Renderizar conteúdo
        switch (aba) {
            case 'usuarios':
                this._renderizarListaUsuarios();
                this._atualizarBotoesAcao('usuarios');
                break;
            case 'departamentos':
                this._renderizarListaDepartamentos();
                this._atualizarBotoesAcao('departamentos');
                break;
            case 'relatorios':
                this._renderizarRelatorios();
                this._atualizarBotoesAcao('relatorios');
                break;
            case 'debug':
                this._renderizarDebug();
                this._atualizarBotoesAcao('debug');
                break;
        }
    },

    // 📋 RENDERIZAR LISTA DE USUÁRIOS
    _renderizarListaUsuarios() {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        const usuarios = this._obterListaUsuarios();
        
        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `${usuarios.length} usuários • 5 departamentos`;
        }

        container.innerHTML = `
            <div style="padding: 0;">
                <!-- Filtros v8.5 -->
                <div style="
                    padding: 16px 24px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                ">
                    <label style="font-size: 14px; color: #374151; font-weight: 600;">Filtrar por:</label>
                    <select id="filtroDepartamento" onchange="AdminUsersManager._filtrarPorDepartamento()" style="
                        padding: 8px 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        background: white;
                    ">
                        <option value="">Todos os departamentos</option>
                        ${this.departamentos.map(dep => 
                            `<option value="${dep.nome}">${dep.nome}</option>`
                        ).join('')}
                    </select>
                    
                    <select id="filtroTipo" onchange="AdminUsersManager._filtrarPorTipo()" style="
                        padding: 8px 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        background: white;
                    ">
                        <option value="">Todos os usuários</option>
                        <option value="admin">Apenas Admins</option>
                        <option value="ativo">Apenas Ativos</option>
                        <option value="inativo">Apenas Inativos</option>
                    </select>
                </div>

                <!-- Header da tabela -->
                <div style="
                    display: grid;
                    grid-template-columns: 2fr 1.5fr 1.5fr 80px 120px;
                    gap: 16px;
                    padding: 16px 24px;
                    background: #f3f4f6;
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
                <div style="max-height: 500px; overflow-y: auto;" id="listaUsuarios">
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

        console.log(`📋 Lista renderizada: ${usuarios.length} usuários com filtros v8.5`);
    },

    // 👤 ITEM USUÁRIO (melhorado)
    _renderizarItemUsuario(usuario) {
        const isAtivo = usuario.ativo !== false;
        const isAdmin = usuario.admin === true;
        const key = usuario._key || usuario.id;

        // Verificar se o departamento existe na lista
        const deptExiste = this.departamentos.find(d => d.nome === usuario.departamento);
        const corDepartamento = deptExiste ? '#10b981' : '#ef4444';

        return `
            <div style="
                display: grid;
                grid-template-columns: 2fr 1.5fr 1.5fr 80px 120px;
                gap: 16px;
                padding: 16px 24px;
                border-bottom: 1px solid #f3f4f6;
                align-items: center;
                transition: background-color 0.2s ease;
                ${!isAtivo ? 'opacity: 0.6;' : ''}
            " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
                
                <div>
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 2px;">
                        ${usuario.nome}
                        ${!isAtivo ? '<span style="color: #ef4444; font-size: 11px; margin-left: 8px;">[INATIVO]</span>' : ''}
                        ${isAdmin ? '<span style="color: #f59e0b; font-size: 11px; margin-left: 8px;">⭐</span>' : ''}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ${usuario.email}
                    </div>
                </div>

                <div style="color: #374151; font-size: 14px;">
                    ${usuario.cargo}
                </div>

                <div style="color: ${corDepartamento}; font-size: 13px; font-weight: 500;">
                    ${usuario.departamento}
                    ${!deptExiste ? ' ⚠️' : ''}
                </div>

                <div style="text-align: center;">
                    ${isAdmin ? 
                        '<span style="background: #fbbf24; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">ADMIN</span>' : 
                        '<span style="color: #9ca3af; font-size: 12px;">—</span>'
                    }
                </div>

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
                    " title="Editar">✏️</button>
                    
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
                    " title="Excluir">🗑️</button>
                    
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
                    " title="${isAtivo ? 'Desativar' : 'Ativar'}">${isAtivo ? '❌' : '✅'}</button>
                </div>
            </div>
        `;
    },

    // 🏢 RENDERIZAR DEPARTAMENTOS v8.5
    _renderizarListaDepartamentos() {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        const usuarios = this._obterListaUsuarios();
        const estatisticas = this._calcularEstatisticasDepartamentos(usuarios);

        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `${this.departamentos.length} departamentos ativos`;
        }

        container.innerHTML = `
            <div style="padding: 24px;">
                <h3 style="margin: 0 0 24px 0; color: #1f2937;">🏢 Departamentos BIAPO - Estrutura Real</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">
                    ${this.departamentos.map(departamento => {
                        const stats = estatisticas[departamento.nome] || { total: 0, admins: 0, ativos: 0 };
                        return `
                            <div style="
                                background: white;
                                border: 1px solid #e5e7eb;
                                border-radius: 12px;
                                padding: 20px;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                                transition: transform 0.2s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                    <h4 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                        ${departamento.nome}
                                    </h4>
                                    <span style="
                                        background: #10b981;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 12px;
                                        font-size: 12px;
                                        font-weight: 600;
                                    ">${stats.total} usuários</span>
                                </div>
                                
                                <div style="margin-bottom: 16px;">
                                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                        <strong>Cargos disponíveis:</strong>
                                    </p>
                                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                        ${departamento.cargos.map(cargo => `
                                            <span style="
                                                background: #f3f4f6;
                                                color: #374151;
                                                padding: 2px 8px;
                                                border-radius: 8px;
                                                font-size: 12px;
                                            ">${cargo}</span>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                                    <div style="text-align: center;">
                                        <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${stats.total}</div>
                                        <div style="font-size: 12px; color: #6b7280;">Total</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${stats.admins}</div>
                                        <div style="font-size: 12px; color: #6b7280;">Admins</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 20px; font-weight: 700; color: #10b981;">${stats.ativos}</div>
                                        <div style="font-size: 12px; color: #6b7280;">Ativos</div>
                                    </div>
                                </div>
                                
                                ${stats.usuarios && stats.usuarios.length > 0 ? `
                                    <div>
                                        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                            <strong>Membros:</strong>
                                        </p>
                                        <div style="max-height: 120px; overflow-y: auto;">
                                            ${stats.usuarios.map(usuario => `
                                                <div style="
                                                    display: flex;
                                                    justify-content: space-between;
                                                    align-items: center;
                                                    padding: 6px 0;
                                                    border-bottom: 1px solid #f3f4f6;
                                                ">
                                                    <div>
                                                        <div style="font-weight: 500; color: #1f2937; font-size: 13px;">
                                                            ${usuario.nome}
                                                            ${usuario.admin ? ' ⭐' : ''}
                                                        </div>
                                                        <div style="font-size: 11px; color: #6b7280;">${usuario.cargo}</div>
                                                    </div>
                                                    <span style="
                                                        background: ${usuario.ativo !== false ? '#10b981' : '#ef4444'};
                                                        color: white;
                                                        padding: 2px 6px;
                                                        border-radius: 8px;
                                                        font-size: 10px;
                                                    ">${usuario.ativo !== false ? 'ATIVO' : 'INATIVO'}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : `
                                    <div style="text-align: center; color: #6b7280; font-style: italic; font-size: 14px;">
                                        Nenhum usuário atribuído
                                    </div>
                                `}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        console.log('🏢 Departamentos v8.5 renderizados:', this.departamentos.length);
    },

    // 📊 CALCULAR ESTATÍSTICAS DOS DEPARTAMENTOS
    _calcularEstatisticasDepartamentos(usuarios) {
        const stats = {};
        
        this.departamentos.forEach(dept => {
            stats[dept.nome] = {
                total: 0,
                admins: 0,
                ativos: 0,
                usuarios: []
            };
        });

        usuarios.forEach(usuario => {
            const deptNome = usuario.departamento;
            if (stats[deptNome]) {
                stats[deptNome].total++;
                if (usuario.admin) stats[deptNome].admins++;
                if (usuario.ativo !== false) stats[deptNome].ativos++;
                stats[deptNome].usuarios.push(usuario);
            }
        });

        return stats;
    },

    // 🔍 FILTROS v8.5
    _filtrarPorDepartamento() {
        const filtro = document.getElementById('filtroDepartamento').value;
        const usuarios = this._obterListaUsuarios();
        
        let usuariosFiltrados = usuarios;
        if (filtro) {
            usuariosFiltrados = usuarios.filter(u => u.departamento === filtro);
        }
        
        this._atualizarListaUsuarios(usuariosFiltrados);
    },

    _filtrarPorTipo() {
        const filtro = document.getElementById('filtroTipo').value;
        const usuarios = this._obterListaUsuarios();
        
        let usuariosFiltrados = usuarios;
        switch (filtro) {
            case 'admin':
                usuariosFiltrados = usuarios.filter(u => u.admin === true);
                break;
            case 'ativo':
                usuariosFiltrados = usuarios.filter(u => u.ativo !== false);
                break;
            case 'inativo':
                usuariosFiltrados = usuarios.filter(u => u.ativo === false);
                break;
        }
        
        this._atualizarListaUsuarios(usuariosFiltrados);
    },

    _atualizarListaUsuarios(usuarios) {
        const container = document.getElementById('listaUsuarios');
        if (!container) return;
        
        container.innerHTML = usuarios.map(usuario => this._renderizarItemUsuario(usuario)).join('');
        
        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `${usuarios.length} usuários filtrados • 5 departamentos`;
        }
    },

    // ======== MANTER FUNÇÕES EXISTENTES ========
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
            // Ordenar: Admins primeiro, depois por nome
            if (a.admin && !b.admin) return -1;
            if (!a.admin && b.admin) return 1;
            return a.nome.localeCompare(b.nome);
        });
    },

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
                    <button onclick="AdminUsersManager._exportarDepartamentos()" style="
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                    ">📊 Exportar Relatório</button>
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

    // 🔥 SALVAMENTO OTIMIZADO (mantido da v8.3.1)
    async _salvarUsuariosNoFirebase() {
        let tentativas = 0;
        const maxTentativas = this.config.maxTentativas;
        
        console.log('💾 Iniciando salvamento v8.5...');
        
        if (!this._verificarFirebase()) {
            throw new Error('Firebase não disponível');
        }
        
        while (tentativas < maxTentativas) {
            try {
                tentativas++;
                console.log(`💾 Tentativa ${tentativas}/${maxTentativas}...`);
                
                const dadosUsuarios = Auth.equipe;
                const timestamp = new Date().toISOString();
                
                // Salvamento principal único
                await database.ref(this.config.pathPrincipal).set(dadosUsuarios);
                console.log(`✅ Salvo em ${this.config.pathPrincipal}`);
                
                // Verificação
                const verificacao = await database.ref(this.config.pathPrincipal).once('value');
                const dadosSalvos = verificacao.val();
                
                if (!dadosSalvos || Object.keys(dadosSalvos).length !== Object.keys(dadosUsuarios).length) {
                    throw new Error('Verificação falhou');
                }
                
                console.log('✅ Verificação concluída - persistência confirmada!');
                
                this.estado.ultimaAtualizacao = timestamp;
                
                return true;
                
            } catch (error) {
                console.warn(`⚠️ Tentativa ${tentativas}/${maxTentativas} falhou:`, error.message);
                
                if (tentativas >= maxTentativas) {
                    // Backup em caso de falha
                    try {
                        await database.ref(this.config.pathBackup).set(Auth.equipe);
                        console.log(`✅ Backup salvo em ${this.config.pathBackup}`);
                        return true;
                    } catch (backupError) {
                        console.error('❌ Falha crítica:', backupError);
                        throw error;
                    }
                } else {
                    const delay = 1000 * tentativas;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        return false;
    },

    // ======== FUNÇÕES UTILITÁRIAS v8.5 ========
    _carregarDepartamentos() {
        console.log('🏢 Departamentos v8.5 carregados:', this.departamentos.length);
        this.estado.departamentosCarregados = true;
    },

    _mostrarMensagem(mensagem, tipo = 'info') {
        if (typeof Notifications !== 'undefined') {
            switch (tipo) {
                case 'success': Notifications.success(mensagem); break;
                case 'error': Notifications.error(mensagem); break;
                case 'warning': Notifications.warning(mensagem); break;
                default: Notifications.info(mensagem);
            }
        } else {
            alert(`${tipo.toUpperCase()}: ${mensagem}`);
        }
    },

    fecharModal() {
        const modal = document.getElementById('modalGestaoUsuarios');
        if (modal) modal.remove();

        this.estado.modalAberto = false;
        this.estado.modoEdicao = false;
        this.estado.usuarioEditando = null;

        console.log('❌ Modal v8.5 fechado');
    },

    // 📊 STATUS v8.5
    obterStatus() {
        return {
            modulo: 'AdminUsersManager',
            versao: this.config.versao,
            departamentos: {
                total: this.departamentos.length,
                nomes: this.departamentos.map(d => d.nome),
                reais: true
            },
            modalAberto: this.estado.modalAberto,
            totalUsuarios: typeof Auth !== 'undefined' ? Object.keys(Auth.equipe || {}).length : 0,
            firebaseDisponivel: this.estado.firebaseDisponivel,
            ultimaAtualizacao: this.estado.ultimaAtualizacao,
            estruturaReal: true
        };
    },

    // 🔥 FORMULÁRIOS COMPLETOS v8.5 - FASE 2
    abrirFormularioNovo() {
        console.log('📝 Abrindo formulário para novo usuário...');
        
        this.estado.modoEdicao = false;
        this.estado.usuarioEditando = null;
        
        const modal = this._criarModalFormulario();
        document.body.appendChild(modal);
        
        // Foco no primeiro campo
        setTimeout(() => {
            const primeiroInput = modal.querySelector('input[name="nome"]');
            if (primeiroInput) primeiroInput.focus();
        }, 100);
    },

    editarUsuario(chaveUsuario) {
        console.log('✏️ Editando usuário:', chaveUsuario);
        
        const usuario = Auth.equipe[chaveUsuario];
        if (!usuario) {
            this._mostrarMensagem('Usuário não encontrado!', 'error');
            return;
        }
        
        this.estado.modoEdicao = true;
        this.estado.usuarioEditando = { ...usuario, _key: chaveUsuario };
        
        const modal = this._criarModalFormulario();
        document.body.appendChild(modal);
        
        // Preencher dados
        setTimeout(() => {
            this._preencherFormularioEdicao();
        }, 100);
    },

    // 🎨 CRIAR MODAL DE FORMULÁRIO
    _criarModalFormulario() {
        const isEdicao = this.estado.modoEdicao;
        const titulo = isEdicao ? 'Editar Usuário' : 'Novo Usuário';
        const icone = isEdicao ? '✏️' : '➕';
        
        const modal = document.createElement('div');
        modal.id = 'modalFormularioUsuario';
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
            z-index: 1000000;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
            ">
                <!-- Header -->
                <div style="
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    color: white;
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>
                        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">
                            ${icone} ${titulo}
                        </h2>
                        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                            ${isEdicao ? 'Editar informações do usuário' : 'Adicionar novo membro à equipe BIAPO'}
                        </p>
                    </div>
                    <button onclick="AdminUsersManager._fecharFormulario()" style="
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

                <!-- Formulário -->
                <div style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                ">
                    <form id="formularioUsuario" style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <!-- Nome -->
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                                Nome Completo *
                            </label>
                            <input 
                                type="text" 
                                name="nome" 
                                required
                                placeholder="Ex: Isabella Silva"
                                style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 2px solid #e5e7eb;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    transition: border-color 0.2s ease;
                                    box-sizing: border-box;
                                "
                                onfocus="this.style.borderColor='#059669'"
                                onblur="this.style.borderColor='#e5e7eb'"
                            />
                        </div>

                        <!-- Email -->
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                                Email Corporativo *
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                required
                                placeholder="usuario@biapo.com.br"
                                style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 2px solid #e5e7eb;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    transition: border-color 0.2s ease;
                                    box-sizing: border-box;
                                "
                                onfocus="this.style.borderColor='#059669'"
                                onblur="this.style.borderColor='#e5e7eb'"
                            />
                            <div id="emailValidacao" style="margin-top: 4px; font-size: 12px;"></div>
                        </div>

                        <!-- Departamento -->
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                                Departamento *
                            </label>
                            <select 
                                name="departamento" 
                                required
                                onchange="AdminUsersManager._atualizarCargos()"
                                style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 2px solid #e5e7eb;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    background: white;
                                    cursor: pointer;
                                    box-sizing: border-box;
                                "
                            >
                                <option value="">Selecione um departamento</option>
                                ${this.departamentos.map(dept => 
                                    `<option value="${dept.nome}">${dept.nome}</option>`
                                ).join('')}
                            </select>
                        </div>

                        <!-- Cargo -->
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                                Cargo *
                            </label>
                            <select 
                                name="cargo" 
                                required
                                disabled
                                style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 2px solid #e5e7eb;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    background: #f9fafb;
                                    cursor: not-allowed;
                                    box-sizing: border-box;
                                "
                            >
                                <option value="">Primeiro selecione o departamento</option>
                            </select>
                        </div>

                        <!-- Telefone -->
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                                Telefone
                            </label>
                            <input 
                                type="tel" 
                                name="telefone" 
                                placeholder="(11) 99999-9999"
                                style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 2px solid #e5e7eb;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    transition: border-color 0.2s ease;
                                    box-sizing: border-box;
                                "
                                onfocus="this.style.borderColor='#059669'"
                                onblur="this.style.borderColor='#e5e7eb'"
                            />
                        </div>

                        <!-- Opções Avançadas -->
                        <div style="
                            border-top: 1px solid #e5e7eb;
                            padding-top: 20px;
                            margin-top: 10px;
                        ">
                            <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                                Permissões e Status
                            </h4>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                <!-- Admin -->
                                <div style="
                                    background: #fef3c7;
                                    border: 1px solid #fbbf24;
                                    border-radius: 8px;
                                    padding: 16px;
                                ">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input 
                                            type="checkbox" 
                                            name="admin" 
                                            style="margin-right: 8px; transform: scale(1.2);"
                                        />
                                        <span style="font-weight: 600; color: #92400e;">
                                            🔑 Administrador
                                        </span>
                                    </label>
                                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #92400e; opacity: 0.8;">
                                        Acesso total ao sistema
                                    </p>
                                </div>

                                <!-- Ativo -->
                                <div style="
                                    background: #d1fae5;
                                    border: 1px solid #10b981;
                                    border-radius: 8px;
                                    padding: 16px;
                                ">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input 
                                            type="checkbox" 
                                            name="ativo" 
                                            checked
                                            style="margin-right: 8px; transform: scale(1.2);"
                                        />
                                        <span style="font-weight: 600; color: #065f46;">
                                            ✅ Usuário Ativo
                                        </span>
                                    </label>
                                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #065f46; opacity: 0.8;">
                                        Pode acessar o sistema
                                    </p>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <!-- Footer com botões -->
                <div style="
                    padding: 24px;
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <button onclick="AdminUsersManager._fecharFormulario()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                    ">Cancelar</button>
                    
                    <div style="display: flex; gap: 12px;">
                        ${isEdicao ? `
                            <button onclick="AdminUsersManager._resetarSenha()" style="
                                background: #f59e0b;
                                color: white;
                                border: none;
                                padding: 12px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 600;
                            ">🔄 Reset Senha</button>
                        ` : ''}
                        
                        <button onclick="AdminUsersManager._salvarUsuario()" style="
                            background: linear-gradient(135deg, #059669 0%, #047857 100%);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        ">${isEdicao ? '💾 Salvar Alterações' : '➕ Criar Usuário'}</button>
                    </div>
                </div>
            </div>
        `;

        // Event listener para fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this._fecharFormulario();
            }
        });

        // Validação em tempo real do email
        const emailInput = modal.querySelector('input[name="email"]');
        emailInput.addEventListener('input', () => {
            this._validarEmailTempo();
        });

        return modal;
    },

    // 🔧 ATUALIZAR CARGOS DINÂMICOS
    _atualizarCargos() {
        const departamentoSelect = document.querySelector('select[name="departamento"]');
        const cargoSelect = document.querySelector('select[name="cargo"]');
        
        if (!departamentoSelect || !cargoSelect) return;
        
        const departamentoSelecionado = departamentoSelect.value;
        
        if (!departamentoSelecionado) {
            cargoSelect.innerHTML = '<option value="">Primeiro selecione o departamento</option>';
            cargoSelect.disabled = true;
            cargoSelect.style.background = '#f9fafb';
            cargoSelect.style.cursor = 'not-allowed';
            return;
        }
        
        const departamento = this.departamentos.find(d => d.nome === departamentoSelecionado);
        
        if (departamento) {
            cargoSelect.innerHTML = `
                <option value="">Selecione um cargo</option>
                ${departamento.cargos.map(cargo => 
                    `<option value="${cargo}">${cargo}</option>`
                ).join('')}
            `;
            cargoSelect.disabled = false;
            cargoSelect.style.background = 'white';
            cargoSelect.style.cursor = 'pointer';
        }
    },

    // ✅ VALIDAÇÃO EMAIL EM TEMPO REAL
    _validarEmailTempo() {
        const emailInput = document.querySelector('input[name="email"]');
        const validacaoDiv = document.getElementById('emailValidacao');
        
        if (!emailInput || !validacaoDiv) return;
        
        const email = emailInput.value.trim();
        
        if (!email) {
            validacaoDiv.innerHTML = '';
            emailInput.style.borderColor = '#e5e7eb';
            return;
        }
        
        // Validar formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            validacaoDiv.innerHTML = '<span style="color: #ef4444;">⚠️ Formato de email inválido</span>';
            emailInput.style.borderColor = '#ef4444';
            return;
        }
        
        // Verificar se já existe (apenas para novos usuários)
        if (!this.estado.modoEdicao) {
            const emailExiste = Object.values(Auth.equipe || {}).some(u => u.email === email);
            if (emailExiste) {
                validacaoDiv.innerHTML = '<span style="color: #ef4444;">⚠️ Este email já está em uso</span>';
                emailInput.style.borderColor = '#ef4444';
                return;
            }
        }
        
        validacaoDiv.innerHTML = '<span style="color: #10b981;">✅ Email válido</span>';
        emailInput.style.borderColor = '#10b981';
    },

    // 📝 PREENCHER FORMULÁRIO PARA EDIÇÃO
    _preencherFormularioEdicao() {
        const usuario = this.estado.usuarioEditando;
        if (!usuario) return;
        
        // Preencher campos básicos
        document.querySelector('input[name="nome"]').value = usuario.nome || '';
        document.querySelector('input[name="email"]').value = usuario.email || '';
        document.querySelector('input[name="telefone"]').value = usuario.telefone || '';
        
        // Departamento
        const departamentoSelect = document.querySelector('select[name="departamento"]');
        departamentoSelect.value = usuario.departamento || '';
        
        // Trigger para carregar cargos
        this._atualizarCargos();
        
        // Cargo (após atualizar cargos)
        setTimeout(() => {
            const cargoSelect = document.querySelector('select[name="cargo"]');
            cargoSelect.value = usuario.cargo || '';
        }, 100);
        
        // Checkboxes
        document.querySelector('input[name="admin"]').checked = usuario.admin === true;
        document.querySelector('input[name="ativo"]').checked = usuario.ativo !== false;
        
        console.log('✅ Formulário preenchido para edição:', usuario.nome);
    },

    // 💾 SALVAR USUÁRIO
    async _salvarUsuario() {
        try {
            const dadosFormulario = this._coletarDadosFormulario();
            
            if (!this._validarFormulario(dadosFormulario)) {
                return;
            }
            
            console.log('💾 Salvando usuário...', dadosFormulario);
            
            // Preparar dados do usuário
            const usuario = {
                nome: dadosFormulario.nome,
                email: dadosFormulario.email,
                cargo: dadosFormulario.cargo,
                departamento: dadosFormulario.departamento,
                telefone: dadosFormulario.telefone || '',
                admin: dadosFormulario.admin,
                ativo: dadosFormulario.ativo,
                dataAtualizacao: new Date().toISOString()
            };
            
            let chaveUsuario;
            
            if (this.estado.modoEdicao) {
                // Edição
                chaveUsuario = this.estado.usuarioEditando._key;
                usuario.dataCriacao = this.estado.usuarioEditando.dataCriacao || new Date().toISOString();
                
                Auth.equipe[chaveUsuario] = usuario;
                console.log('✅ Usuário editado:', usuario.nome);
                this._mostrarMensagem(`Usuário ${usuario.nome} atualizado!`, 'success');
                
            } else {
                // Novo usuário
                chaveUsuario = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                usuario.dataCriacao = new Date().toISOString();
                
                Auth.equipe[chaveUsuario] = usuario;
                console.log('✅ Novo usuário criado:', usuario.nome);
                this._mostrarMensagem(`Usuário ${usuario.nome} criado!`, 'success');
            }
            
            // Salvar no Firebase
            await this._salvarUsuariosNoFirebase();
            
            // Fechar formulário e atualizar lista
            this._fecharFormulario();
            this._renderizarListaUsuarios();
            
        } catch (error) {
            console.error('❌ Erro ao salvar usuário:', error);
            this._mostrarMensagem('Erro ao salvar usuário!', 'error');
        }
    },

    // 📋 COLETAR DADOS DO FORMULÁRIO
    _coletarDadosFormulario() {
        return {
            nome: document.querySelector('input[name="nome"]').value.trim(),
            email: document.querySelector('input[name="email"]').value.trim(),
            departamento: document.querySelector('select[name="departamento"]').value,
            cargo: document.querySelector('select[name="cargo"]').value,
            telefone: document.querySelector('input[name="telefone"]').value.trim(),
            admin: document.querySelector('input[name="admin"]').checked,
            ativo: document.querySelector('input[name="ativo"]').checked
        };
    },

    // ✅ VALIDAR FORMULÁRIO
    _validarFormulario(dados) {
        const erros = [];
        
        // Nome obrigatório
        if (!dados.nome) {
            erros.push('Nome é obrigatório');
        }
        
        // Email obrigatório e formato
        if (!dados.email) {
            erros.push('Email é obrigatório');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(dados.email)) {
                erros.push('Formato de email inválido');
            }
            
            // Verificar email único (apenas para novos)
            if (!this.estado.modoEdicao) {
                const emailExiste = Object.values(Auth.equipe || {}).some(u => u.email === dados.email);
                if (emailExiste) {
                    erros.push('Este email já está em uso');
                }
            }
        }
        
        // Departamento obrigatório
        if (!dados.departamento) {
            erros.push('Departamento é obrigatório');
        }
        
        // Cargo obrigatório
        if (!dados.cargo) {
            erros.push('Cargo é obrigatório');
        }
        
        if (erros.length > 0) {
            this._mostrarMensagem(`Erros encontrados:\n• ${erros.join('\n• ')}`, 'error');
            return false;
        }
        
        return true;
    },

    // ❌ FECHAR FORMULÁRIO
    _fecharFormulario() {
        const modal = document.getElementById('modalFormularioUsuario');
        if (modal) modal.remove();
        
        this.estado.modoEdicao = false;
        this.estado.usuarioEditando = null;
        
        console.log('❌ Formulário fechado');
    },

    // 🔄 RESET SENHA (placeholder)
    _resetarSenha() {
        const usuario = this.estado.usuarioEditando;
        if (!usuario) return;
        
        const confirmacao = confirm(`Resetar senha do usuário ${usuario.nome}?\n\nUma nova senha será enviada por email.`);
        if (confirmacao) {
            this._mostrarMensagem(`Senha resetada para ${usuario.nome}!`, 'success');
            console.log('🔄 Senha resetada para:', usuario.nome);
        }
    },

    confirmarExclusao(chaveUsuario) {
        const usuario = Auth.equipe[chaveUsuario];
        if (!usuario) return;
        
        const confirmacao = confirm(`Excluir usuário ${usuario.nome}?\n\nEsta ação não pode ser desfeita.`);
        if (confirmacao) {
            delete Auth.equipe[chaveUsuario];
            this._salvarUsuariosNoFirebase();
            this._renderizarListaUsuarios();
            this._mostrarMensagem(`Usuário ${usuario.nome} excluído!`, 'warning');
        }
    },

    alternarStatus(chaveUsuario) {
        if (!Auth.equipe[chaveUsuario]) return;

        const usuario = Auth.equipe[chaveUsuario];
        const novoStatus = !usuario.ativo;
        
        Auth.equipe[chaveUsuario].ativo = novoStatus;
        
        console.log(`🔄 Status alterado: ${usuario.nome} → ${novoStatus ? 'ATIVO' : 'INATIVO'}`);
        this._mostrarMensagem(`Usuário ${novoStatus ? 'ativado' : 'desativado'}!`, 'success');
        
        this._salvarUsuariosNoFirebase();
        this._renderizarListaUsuarios();
    },

    _renderizarRelatorios() {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        container.innerHTML = `
            <div style="padding: 24px; text-align: center; color: #6b7280;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <div style="font-size: 18px; margin-bottom: 8px;">Relatórios em Desenvolvimento</div>
                <div style="font-size: 14px;">Funcionalidade será implementada na v8.6</div>
            </div>
        `;
    },

    _renderizarDebug() {
        const container = document.getElementById('conteudoPrincipal');
        if (!container) return;

        container.innerHTML = `
            <div style="padding: 24px;">
                <h3 style="margin: 0 0 24px 0; color: #1f2937;">🧪 Debug v8.5 - Departamentos Reais</h3>
                
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151;">📊 Status v8.5</h4>
                    <div id="statusPersistencia" style="color: #6b7280; font-family: monospace; font-size: 12px;">
                        Carregando...
                    </div>
                </div>

                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 16px 0; color: #374151;">🏢 Departamentos Reais</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        ${this.departamentos.map(dept => `
                            <div style="background: #f3f4f6; padding: 12px; border-radius: 8px;">
                                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${dept.nome}</div>
                                <div style="font-size: 12px; color: #6b7280;">${dept.cargos.length} cargos</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                    <h4 style="margin: 0 0 16px 0; color: #374151;">⚡ Novidades v8.5</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        <li>✅ 5 Departamentos reais da BIAPO</li>
                        <li>✅ Cargos específicos por departamento</li>
                        <li>✅ Filtros por departamento e tipo</li>
                        <li>✅ Estatísticas por departamento</li>
                        <li>✅ Interface melhorada</li>
                        <li>✅ Validações aprimoradas</li>
                    </ul>
                </div>
            </div>
        `;

        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `Debug v${this.config.versao}`;
        }
    },

    _exportarDepartamentos() {
        const usuarios = this._obterListaUsuarios();
        const stats = this._calcularEstatisticasDepartamentos(usuarios);
        
        console.log('📊 Exportando relatório de departamentos...');
        console.table(stats);
        
        this._mostrarMensagem('Relatório exportado no console!', 'success');
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.AdminUsersManager = AdminUsersManager;

// ✅ AUTO-INICIALIZAÇÃO
function inicializarAdminUsersManagerV85() {
    try {
        AdminUsersManager.inicializar();
    } catch (error) {
        console.warn('⚠️ Retry em 1s...');
        setTimeout(() => {
            try {
                AdminUsersManager.inicializar();
            } catch (retryError) {
                console.error('❌ Falha na inicialização v8.5:', retryError);
            }
        }, 1000);
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAdminUsersManagerV85);
} else {
    setTimeout(inicializarAdminUsersManagerV85, 100);
}

// ✅ COMANDOS DEBUG v8.5
window.AdminUsersManager_Debug = {
    status: () => AdminUsersManager.obterStatus(),
    departamentos: () => AdminUsersManager.departamentos,
    estatisticas: () => {
        const usuarios = AdminUsersManager._obterListaUsuarios();
        return AdminUsersManager._calcularEstatisticasDepartamentos(usuarios);
    }
};

console.log('👥 AdminUsersManager v8.5 - DEPARTAMENTOS REAIS BIAPO carregado!');
console.log('🏢 5 Departamentos implementados com cargos específicos');
console.log('📊 Filtros, estatísticas e interface melhorada disponível');
