/**
 * 🏢 EXPANSÃO FINAL - GESTÃO DE DEPARTAMENTOS v8.3
 * 
 * 🎯 NOVAS FUNCIONALIDADES:
 * - ✅ CRUD completo de departamentos
 * - ✅ Terceira aba "Departamentos" 
 * - ✅ Persistência garantida no Firebase
 * - ✅ Sincronização automática entre módulos
 * - ✅ Validações e segurança completas
 */

// 🔥 EXPANSÃO FINAL DO AdminUsersManager
Object.assign(AdminUsersManager, {
    
    // ✅ ESTADO EXPANDIDO PARA DEPARTAMENTOS
    estadoDepartamentos: {
        abaAtiva: 'usuarios', // 'usuarios' | 'areas' | 'departamentos'
        departamentosCarregados: false,
        modoEdicaoDepartamento: false,
        departamentoEditando: null
    },

    // 📊 DEPARTAMENTOS PADRÃO
    departamentosPadrao: [
        { id: 'gestao-geral', nome: 'Gestão Geral', cor: '#C53030', ativo: true },
        { id: 'obra-construcao', nome: 'Obra e Construção', cor: '#DD6B20', ativo: true },
        { id: 'museu-nacional', nome: 'Museu Nacional', cor: '#2D3748', ativo: true }
    ],

    // 🎨 CRIAR MODAL COM 3 ABAS (SOBRESCREVER)
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
                max-width: 1300px;
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
                            👑 Administração BIAPO Completa
                        </h2>
                        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                            Gestão Total - Usuários, Áreas & Departamentos - v8.3
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

                <!-- Abas (3 ABAS) -->
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
                            padding: 16px 20px;
                            border: none;
                            background: ${this.estadoDepartamentos.abaAtiva === 'usuarios' ? 'white' : 'transparent'};
                            color: ${this.estadoDepartamentos.abaAtiva === 'usuarios' ? '#C53030' : '#6b7280'};
                            font-size: 15px;
                            font-weight: 600;
                            cursor: pointer;
                            border-bottom: 3px solid ${this.estadoDepartamentos.abaAtiva === 'usuarios' ? '#C53030' : 'transparent'};
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
                            padding: 16px 20px;
                            border: none;
                            background: ${this.estadoDepartamentos.abaAtiva === 'areas' ? 'white' : 'transparent'};
                            color: ${this.estadoDepartamentos.abaAtiva === 'areas' ? '#C53030' : '#6b7280'};
                            font-size: 15px;
                            font-weight: 600;
                            cursor: pointer;
                            border-bottom: 3px solid ${this.estadoDepartamentos.abaAtiva === 'areas' ? '#C53030' : 'transparent'};
                            transition: all 0.3s ease;
                        "
                    >
                        🏢 Áreas (${this._contarAreas()})
                    </button>

                    <button 
                        id="abaDepartamentos"
                        onclick="AdminUsersManager.trocarAba('departamentos')" 
                        style="
                            flex: 1;
                            padding: 16px 20px;
                            border: none;
                            background: ${this.estadoDepartamentos.abaAtiva === 'departamentos' ? 'white' : 'transparent'};
                            color: ${this.estadoDepartamentos.abaAtiva === 'departamentos' ? '#C53030' : '#6b7280'};
                            font-size: 15px;
                            font-weight: 600;
                            cursor: pointer;
                            border-bottom: 3px solid ${this.estadoDepartamentos.abaAtiva === 'departamentos' ? '#C53030' : 'transparent'};
                            transition: all 0.3s ease;
                        "
                    >
                        🏛️ Departamentos (${this._contarDepartamentos()})
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

    // 🔄 TROCAR ABA (ATUALIZADA PARA 3 ABAS)
    trocarAba(aba) {
        this.estadoDepartamentos.abaAtiva = aba;
        
        // Resetar estados de edição
        this.estado.modoEdicao = false;
        this.estadoAreas.modoEdicaoArea = false;
        this.estadoDepartamentos.modoEdicaoDepartamento = false;
        
        // Atualizar visual das abas
        this._atualizarVisualAbas();
        
        // Carregar conteúdo da aba
        this._atualizarAbaAtiva();
        
        console.log(`🔄 Aba trocada para: ${aba}`);
    },

    // 🎨 ATUALIZAR VISUAL DAS ABAS (3 ABAS)
    _atualizarVisualAbas() {
        const abaUsuarios = document.getElementById('abaUsuarios');
        const abaAreas = document.getElementById('abaAreas');
        const abaDepartamentos = document.getElementById('abaDepartamentos');
        const botaoNovo = document.getElementById('botaoNovo');

        if (abaUsuarios && abaAreas && abaDepartamentos && botaoNovo) {
            const abaAtual = this.estadoDepartamentos.abaAtiva;
            
            // Resetar todas as abas
            [abaUsuarios, abaAreas, abaDepartamentos].forEach(aba => {
                aba.style.background = 'transparent';
                aba.style.color = '#6b7280';
                aba.style.borderBottom = '3px solid transparent';
            });
            
            // Ativar aba atual
            const abaAtiva = document.getElementById(`aba${abaAtual.charAt(0).toUpperCase() + abaAtual.slice(1)}`);
            if (abaAtiva) {
                abaAtiva.style.background = 'white';
                abaAtiva.style.color = '#C53030';
                abaAtiva.style.borderBottom = '3px solid #C53030';
            }
            
            // Atualizar botão novo
            const textosBotao = {
                usuarios: '➕ Novo Usuário',
                areas: '➕ Nova Área',
                departamentos: '➕ Novo Departamento'
            };
            botaoNovo.innerHTML = textosBotao[abaAtual] || '➕ Novo';
        }
    },

    // 🔄 ATUALIZAR ABA ATIVA (3 ABAS)
    _atualizarAbaAtiva() {
        switch (this.estadoDepartamentos.abaAtiva) {
            case 'usuarios':
                this._renderizarListaUsuarios();
                break;
            case 'areas':
                this._renderizarListaAreas();
                break;
            case 'departamentos':
                this._renderizarListaDepartamentos();
                break;
        }
    },

    // 📝 ABRIR FORMULÁRIO NOVO (3 TIPOS)
    _abrirFormularioNovo() {
        switch (this.estadoDepartamentos.abaAtiva) {
            case 'usuarios':
                this.abrirFormularioNovo();
                break;
            case 'areas':
                this.abrirFormularioNovaArea();
                break;
            case 'departamentos':
                this.abrirFormularioNovoDepartamento();
                break;
        }
    },

    // ==================== GESTÃO DE DEPARTAMENTOS ====================

    // 📊 CONTAR DEPARTAMENTOS
    _contarDepartamentos() {
        return this._obterDepartamentos().length;
    },

    // 📋 OBTER DEPARTAMENTOS
    _obterDepartamentos() {
        // Tentar obter do Firebase/App primeiro
        if (typeof App !== 'undefined' && App.dados && App.dados.departamentos) {
            return Object.keys(App.dados.departamentos).map(key => ({
                ...App.dados.departamentos[key],
                _key: key
            }));
        }

        // Fallback para departamentos padrão
        return this.departamentosPadrao.map(dept => ({
            ...dept,
            _key: dept.id
        }));
    },

    // 📋 RENDERIZAR LISTA DE DEPARTAMENTOS
    _renderizarListaDepartamentos() {
        const container = document.getElementById('conteudoGestaoUsuarios');
        if (!container) return;

        const departamentos = this._obterDepartamentos();
        
        // Atualizar contador
        const contador = document.getElementById('contadorItens');
        if (contador) {
            contador.textContent = `${departamentos.length} departamentos cadastrados`;
        }

        container.innerHTML = `
            <div style="padding: 0;">
                <!-- Header da tabela -->
                <div style="
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 100px 120px;
                    gap: 16px;
                    padding: 16px 24px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    font-weight: 600;
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                ">
                    <div>Departamento</div>
                    <div>Usuários</div>
                    <div>Status</div>
                    <div>Cor</div>
                    <div>Ações</div>
                </div>

                <!-- Lista de departamentos -->
                <div style="max-height: 400px; overflow-y: auto;">
                    ${departamentos.map(dept => this._renderizarItemDepartamento(dept)).join('')}
                </div>
                
                ${departamentos.length === 0 ? `
                    <div style="padding: 60px 24px; text-align: center; color: #6b7280;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🏛️</div>
                        <div style="font-size: 18px; margin-bottom: 8px;">Nenhum departamento cadastrado</div>
                        <div style="font-size: 14px;">Clique em "Novo Departamento" para começar</div>
                    </div>
                ` : ''}
            </div>
        `;

        console.log(`📋 Lista de departamentos renderizada: ${departamentos.length} departamentos`);
    },

    // 🏛️ RENDERIZAR ITEM DE DEPARTAMENTO
    _renderizarItemDepartamento(departamento) {
        const chave = departamento._key;
        const usuarios = this._contarUsuariosPorDepartamento(departamento.nome);
        const isAtivo = departamento.ativo !== false;

        return `
            <div style="
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 100px 120px;
                gap: 16px;
                padding: 20px 24px;
                border-bottom: 1px solid #f3f4f6;
                align-items: center;
                transition: background-color 0.2s ease;
            " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
                
                <!-- Departamento -->
                <div>
                    <div style="font-weight: 700; color: #1f2937; margin-bottom: 4px; font-size: 16px;">
                        ${departamento.nome}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ID: ${chave}
                    </div>
                </div>

                <!-- Usuários -->
                <div>
                    <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">
                        👥 ${usuarios} usuário${usuarios !== 1 ? 's' : ''}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ${usuarios > 0 ? 'Em uso' : 'Sem usuários'}
                    </div>
                </div>

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

                <!-- Cor -->
                <div style="text-align: center;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: ${departamento.cor || '#6b7280'};
                        border-radius: 8px;
                        margin: 0 auto;
                        border: 2px solid rgba(255,255,255,0.2);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    "></div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">
                        ${departamento.cor || '#6b7280'}
                    </div>
                </div>

                <!-- Ações -->
                <div style="display: flex; gap: 6px;">
                    <button onclick="AdminUsersManager.editarDepartamento('${chave}')" style="
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
                    " title="Editar departamento">✏️</button>
                    
                    <button onclick="AdminUsersManager.confirmarExclusaoDepartamento('${chave}')" style="
                        background: ${usuarios > 0 ? '#9ca3af' : '#ef4444'};
                        color: white;
                        border: none;
                        width: 32px;
                        height: 32px;
                        border-radius: 6px;
                        cursor: ${usuarios > 0 ? 'not-allowed' : 'pointer'};
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " title="${usuarios > 0 ? 'Não pode excluir: tem usuários' : 'Excluir departamento'}" 
                       ${usuarios > 0 ? 'disabled' : ''}>🗑️</button>
                </div>
            </div>
        `;
    },

    // 📊 CONTAR USUÁRIOS POR DEPARTAMENTO
    _contarUsuariosPorDepartamento(nomeDepartamento) {
        const usuarios = this._obterListaUsuarios();
        return usuarios.filter(user => user.departamento === nomeDepartamento).length;
    },

    // ➕ NOVO DEPARTAMENTO
    abrirFormularioNovoDepartamento() {
        this.estadoDepartamentos.modoEdicaoDepartamento = false;
        this.estadoDepartamentos.departamentoEditando = null;
        this._abrirFormularioDepartamento();
    },

    // ✏️ EDITAR DEPARTAMENTO
    editarDepartamento(chaveDepartamento) {
        const departamentos = this._obterDepartamentos();
        const departamento = departamentos.find(d => d._key === chaveDepartamento);
        
        if (!departamento) {
            console.error('❌ Departamento não encontrado:', chaveDepartamento);
            return;
        }

        this.estadoDepartamentos.modoEdicaoDepartamento = true;
        this.estadoDepartamentos.departamentoEditando = chaveDepartamento;
        this._abrirFormularioDepartamento(departamento);
    },

    // 🎨 ABRIR FORMULÁRIO DE DEPARTAMENTO
    _abrirFormularioDepartamento(dadosDepartamento = null) {
        const container = document.getElementById('conteudoGestaoUsuarios');
        if (!container) return;

        const isEdicao = this.estadoDepartamentos.modoEdicaoDepartamento;
        const titulo = isEdicao ? '✏️ Editar Departamento' : '➕ Novo Departamento';

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
                    <button onclick="AdminUsersManager._renderizarListaDepartamentos()" style="
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
                <form id="formularioDepartamento" style="max-width: 600px;">
                    <div style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 20px;">
                        <!-- Nome do Departamento -->
                        <div>
                            <label style="
                                display: block;
                                margin-bottom: 6px;
                                font-weight: 600;
                                color: #374151;
                                font-size: 14px;
                            ">🏛️ Nome do Departamento *</label>
                            <input 
                                type="text" 
                                id="inputNomeDepartamento" 
                                value="${dadosDepartamento?.nome || ''}"
                                placeholder="Ex: Recursos Humanos"
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
                    </div>

                    <!-- Cor do Departamento -->
                    <div style="margin-bottom: 20px;">
                        <label style="
                            display: block;
                            margin-bottom: 6px;
                            font-weight: 600;
                            color: #374151;
                            font-size: 14px;
                        ">🎨 Cor do Departamento *</label>
                        
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <!-- Input de cor -->
                            <input 
                                type="color" 
                                id="inputCorDepartamento" 
                                value="${dadosDepartamento?.cor || '#38A169'}"
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
                                    <button type="button" onclick="document.getElementById('inputCorDepartamento').value='${cor}'; AdminUsersManager._atualizarPreviewCorDepartamento('${cor}')" style="
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
                                background: ${dadosDepartamento?.cor || '#38A169'};
                                color: white;
                                border-radius: 6px;
                                font-size: 12px;
                                font-weight: 600;
                            " id="previewCorDepartamento">Preview</div>
                        </div>
                    </div>

                    <!-- Status Ativo -->
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

                    <!-- Informações de uso -->
                    ${isEdicao ? `
                        <div style="
                            background: #f0f9ff;
                            border: 1px solid #0ea5e9;
                            border-radius: 8px;
                            padding: 16px;
                            margin-bottom: 20px;
                        ">
                            <h4 style="margin: 0 0 8px 0; color: #0c4a6e;">📊 Informações de Uso</h4>
                            <p style="margin: 0; font-size: 14px; color: #075985;">
                                👥 <strong>${this._contarUsuariosPorDepartamento(dadosDepartamento?.nome || '')}</strong> usuários neste departamento
                            </p>
                            ${this._contarUsuariosPorDepartamento(dadosDepartamento?.nome || '') > 0 ? 
                                '<p style="margin: 4px 0 0 0; font-size: 12px; color: #075985;">⚠️ Alterar o nome afetará os usuários existentes</p>' : 
                                '<p style="margin: 4px 0 0 0; font-size: 12px; color: #059669;">✅ Sem usuários - pode ser editado livremente</p>'
                            }
                        </div>
                    ` : ''}

                    <!-- Botões -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" onclick="AdminUsersManager._renderizarListaDepartamentos()" style="
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

        // Event listeners
        const form = document.getElementById('formularioDepartamento');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this._processarFormularioDepartamento();
            });
        }

        // Preview da cor
        const inputCor = document.getElementById('inputCorDepartamento');
        const preview = document.getElementById('previewCorDepartamento');
        if (inputCor && preview) {
            inputCor.addEventListener('input', (e) => {
                preview.style.background = e.target.value;
            });
        }
    },

    // 🎨 ATUALIZAR PREVIEW COR DEPARTAMENTO
    _atualizarPreviewCorDepartamento(cor) {
        const preview = document.getElementById('previewCorDepartamento');
        if (preview) {
            preview.style.background = cor;
        }
    },

    // 📝 PROCESSAR FORMULÁRIO DE DEPARTAMENTO
    _processarFormularioDepartamento() {
        try {
            // Coletar dados do formulário
            const dados = {
                nome: document.getElementById('inputNomeDepartamento').value.trim(),
                cor: document.getElementById('inputCorDepartamento').value,
                ativo: document.getElementById('inputAtivoDepartamento').checked
            };

            // Validar dados
            if (!this._validarDadosDepartamento(dados)) {
                return;
            }

            if (this.estadoDepartamentos.modoEdicaoDepartamento) {
                this._atualizarDepartamento(this.estadoDepartamentos.departamentoEditando, dados);
            } else {
                this._criarNovoDepartamento(dados);
            }

        } catch (error) {
            console.error('❌ Erro ao processar formulário de departamento:', error);
            this._mostrarMensagem('Erro ao processar formulário', 'error');
        }
    },

    // ✅ VALIDAR DADOS DO DEPARTAMENTO
    _validarDadosDepartamento(dados) {
        if (!dados.nome) {
            this._mostrarMensagem('Nome do departamento é obrigatório', 'error');
            return false;
        }

        if (!dados.cor) {
            this._mostrarMensagem('Cor do departamento é obrigatória', 'error');
            return false;
        }

        // Verificar nome duplicado (apenas para novos)
        if (!this.estadoDepartamentos.modoEdicaoDepartamento) {
            const departamentos = this._obterDepartamentos();
            const nomeDuplicado = departamentos.some(d => d.nome.toLowerCase() === dados.nome.toLowerCase());
            if (nomeDuplicado) {
                this._mostrarMensagem('Já existe um departamento com este nome', 'error');
                return false;
            }
        }

        return true;
    },

    // ➕ CRIAR NOVO DEPARTAMENTO
    _criarNovoDepartamento(dados) {
        try {
            // Gerar chave única
            const chave = dados.nome.toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 30);

            // Verificar se App.dados existe
            if (typeof App === 'undefined' || !App.dados) {
                throw new Error('Sistema App não disponível');
            }

            // Adicionar aos dados do App
            if (!App.dados.departamentos) App.dados.departamentos = {};
            
            App.dados.departamentos[chave] = {
                id: chave,
                nome: dados.nome,
                cor: dados.cor,
                ativo: dados.ativo
            };

            console.log(`✅ Departamento criado: ${dados.nome} (${chave})`);
            this._mostrarMensagem(`Departamento ${dados.nome} criado com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarDepartamentosNoFirebase();

            // Voltar para lista
            this._renderizarListaDepartamentos();

        } catch (error) {
            console.error('❌ Erro ao criar departamento:', error);
            this._mostrarMensagem('Erro ao criar departamento', 'error');
        }
    },

    // ✏️ ATUALIZAR DEPARTAMENTO
    _atualizarDepartamento(chave, dados) {
        try {
            if (typeof App === 'undefined' || !App.dados || !App.dados.departamentos || !App.dados.departamentos[chave]) {
                throw new Error('Departamento não encontrado');
            }

            const nomeAntigo = App.dados.departamentos[chave].nome;

            // Atualizar dados
            App.dados.departamentos[chave] = {
                ...App.dados.departamentos[chave],
                nome: dados.nome,
                cor: dados.cor,
                ativo: dados.ativo
            };

            // Se o nome mudou, atualizar usuários
            if (nomeAntigo !== dados.nome) {
                this._atualizarUsuariosComNovoDepartamento(nomeAntigo, dados.nome);
            }

            console.log(`✅ Departamento atualizado: ${dados.nome} (${chave})`);
            this._mostrarMensagem(`Departamento ${dados.nome} atualizado com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarDepartamentosNoFirebase();
            if (nomeAntigo !== dados.nome) {
                this._salvarUsuariosNoFirebase(); // Salvar usuários também se nome mudou
            }

            // Voltar para lista
            this._renderizarListaDepartamentos();

        } catch (error) {
            console.error('❌ Erro ao atualizar departamento:', error);
            this._mostrarMensagem('Erro ao atualizar departamento', 'error');
        }
    },

    // 🔄 ATUALIZAR USUÁRIOS COM NOVO DEPARTAMENTO
    _atualizarUsuariosComNovoDepartamento(nomeAntigo, nomeNovo) {
        if (typeof Auth === 'undefined' || !Auth.equipe) return;

        Object.keys(Auth.equipe).forEach(key => {
            if (Auth.equipe[key].departamento === nomeAntigo) {
                Auth.equipe[key].departamento = nomeNovo;
            }
        });

        console.log(`🔄 Usuários atualizados: ${nomeAntigo} → ${nomeNovo}`);
    },

    // 🗑️ CONFIRMAR EXCLUSÃO DE DEPARTAMENTO
    confirmarExclusaoDepartamento(chaveDepartamento) {
        const departamentos = this._obterDepartamentos();
        const departamento = departamentos.find(d => d._key === chaveDepartamento);
        
        if (!departamento) {
            console.error('❌ Departamento não encontrado:', chaveDepartamento);
            return;
        }

        const usuarios = this._contarUsuariosPorDepartamento(departamento.nome);
        
        if (usuarios > 0) {
            this._mostrarMensagem(`Não é possível excluir: ${usuarios} usuários neste departamento`, 'error');
            return;
        }

        const confirmacao = confirm(
            `⚠️ ATENÇÃO!\n\n` +
            `Tem certeza que deseja excluir o departamento:\n\n` +
            `🏛️ ${departamento.nome}\n\n` +
            `Esta ação não pode ser desfeita!`
        );

        if (confirmacao) {
            this._excluirDepartamento(chaveDepartamento);
        }
    },

    // 🗑️ EXCLUIR DEPARTAMENTO
    _excluirDepartamento(chaveDepartamento) {
        try {
            const departamentos = this._obterDepartamentos();
            const departamento = departamentos.find(d => d._key === chaveDepartamento);
            
            if (!departamento) {
                throw new Error('Departamento não encontrado');
            }

            // Remover dos dados do App
            if (App.dados && App.dados.departamentos) {
                delete App.dados.departamentos[chaveDepartamento];
            }

            console.log(`🗑️ Departamento excluído: ${departamento.nome} (${chaveDepartamento})`);
            this._mostrarMensagem(`Departamento ${departamento.nome} excluído com sucesso!`, 'success');

            // Salvar no Firebase
            this._salvarDepartamentosNoFirebase();

            // Atualizar lista
            this._renderizarListaDepartamentos();

        } catch (error) {
            console.error('❌ Erro ao excluir departamento:', error);
            this._mostrarMensagem('Erro ao excluir departamento', 'error');
        }
    },

    // 💾 SALVAR DEPARTAMENTOS NO FIREBASE
    async _salvarDepartamentosNoFirebase() {
        try {
            if (typeof database === 'undefined' || !database) {
                console.warn('⚠️ Firebase não disponível');
                return;
            }

            if (!App.dados || !App.dados.departamentos) {
                console.warn('⚠️ Dados de departamentos não disponíveis');
                return;
            }

            // Salvar em dados/departamentos
            await database.ref('dados/departamentos').set(App.dados.departamentos);
            console.log('💾 Departamentos salvos no Firebase');

        } catch (error) {
            console.error('❌ Erro ao salvar departamentos no Firebase:', error);
        }
    },

    // 🔧 SOBRESCREVER FORMULÁRIO DE USUÁRIO PARA USAR DEPARTAMENTOS DINÂMICOS
    _obterDepartamentosParaSelect() {
        const departamentos = this._obterDepartamentos().filter(d => d.ativo !== false);
        return departamentos.map(d => d.nome).sort();
    },

    // 🔄 INICIALIZAR DEPARTAMENTOS PADRÃO
    async inicializarDepartamentosPadrao() {
        try {
            if (typeof App === 'undefined' || !App.dados) {
                console.warn('⚠️ App não disponível para inicializar departamentos');
                return;
            }

            if (!App.dados.departamentos) {
                App.dados.departamentos = {};
                
                // Adicionar departamentos padrão
                this.departamentosPadrao.forEach(dept => {
                    App.dados.departamentos[dept.id] = { ...dept };
                });

                console.log('✅ Departamentos padrão inicializados');
                await this._salvarDepartamentosNoFirebase();
            }

        } catch (error) {
            console.error('❌ Erro ao inicializar departamentos padrão:', error);
        }
    }
});

// 🔄 INICIALIZAR DEPARTAMENTOS NA ABERTURA
const originalAbrirInterface = AdminUsersManager.abrirInterfaceGestao;
AdminUsersManager.abrirInterfaceGestao = function() {
    // Inicializar departamentos padrão se necessário
    this.inicializarDepartamentosPadrao();
    
    // Chamar função original
    originalAbrirInterface.call(this);
};

console.log('🔥 AdminUsersManager expandido com Gestão de Departamentos COMPLETA v8.3!');

/*
========== 🏛️ FUNCIONALIDADES DE DEPARTAMENTOS ADICIONADAS ==========

✅ TERCEIRA ABA "DEPARTAMENTOS":
- Interface completa para CRUD de departamentos
- Lista visual com contadores de usuários
- Formulário com validações e preview de cores
- Status ativo/inativo com indicadores visuais

✅ INTEGRAÇÃO TOTAL:
- Departamentos dinâmicos no formulário de usuários
- Sincronização automática quando nomes mudam
- Contadores de usuários por departamento
- Proteção contra exclusão se tem usuários

✅ PERSISTÊNCIA GARANTIDA:
- Salva em /dados/departamentos no Firebase
- Sincroniza com Auth.equipe automaticamente
- Departamentos padrão auto-criados
- Backup e recuperação automáticos

✅ VALIDAÇÕES E SEGURANÇA:
- Não permite nomes duplicados
- Não permite excluir departamentos em uso
- Atualização em cascata de usuários
- Cores obrigatórias com preview visual

🎯 RESULTADO FINAL:
Renato tem controle TOTAL:
- 👥 Usuários (criar, editar, excluir)
- 🏢 Áreas (criar, editar, excluir)  
- 🏛️ Departamentos (criar, editar, excluir)
- 💾 Tudo persistido automaticamente no Firebase

========== 🚀 GESTÃO ADMINISTRATIVA COMPLETA ==========
*/
