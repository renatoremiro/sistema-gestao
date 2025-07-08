// admin-users-manager.js v8.4.1 - CORREÇÃO PERSISTÊNCIA DEPARTAMENTOS
// Módulo para gestão administrativa de usuários E departamentos

const AdminUsersManager = {
    // Lista de departamentos (agora persistente)
    departamentos: [],

    // ===== NOVA FUNÇÃO v8.4.1: SALVAR DEPARTAMENTOS NO FIREBASE =====
    async _salvarDepartamentosNoFirebase() {
        console.log('💾 AdminUsersManager: Salvando departamentos no Firebase...');
        
        try {
            if (!window.database) {
                console.log('❌ Firebase não disponível');
                return false;
            }

            // Usar a função do Auth.js para salvar departamentos
            if (typeof Auth !== 'undefined' && Auth.salvarDepartamentosNoFirebase) {
                const sucesso = await Auth.salvarDepartamentosNoFirebase(this.departamentos);
                if (sucesso) {
                    console.log(`✅ AdminUsersManager: ${this.departamentos.length} departamentos salvos`);
                    return true;
                } else {
                    console.log('❌ AdminUsersManager: Falha ao salvar departamentos');
                    return false;
                }
            }

            // Fallback: salvar diretamente no Firebase
            const departamentosParaFirebase = {};
            this.departamentos.forEach(dept => {
                departamentosParaFirebase[dept] = {
                    nome: dept,
                    ativo: true,
                    criadoEm: new Date().toISOString()
                };
            });

            await database.ref('dados/departamentos').set(departamentosParaFirebase);
            console.log(`✅ AdminUsersManager: ${this.departamentos.length} departamentos salvos (fallback)`);
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar departamentos:', error);
            return false;
        }
    },

    // ===== FUNÇÃO MODIFICADA v8.4.1: ADICIONAR DEPARTAMENTO =====
    adicionarDepartamento() {
        const nome = prompt('Nome do novo departamento:');
        if (nome && nome.trim()) {
            const nomeFormatado = nome.trim();
            if (!this.departamentos.includes(nomeFormatado)) {
                this.departamentos.push(nomeFormatado);
                console.log(`✅ Departamento '${nomeFormatado}' adicionado`);
                
                // ===== NOVO v8.4.1: SALVAR NO FIREBASE =====
                this._salvarDepartamentosNoFirebase().then(sucesso => {
                    if (sucesso) {
                        console.log('✅ Departamento salvo no Firebase');
                    } else {
                        console.log('⚠️ Departamento adicionado apenas localmente');
                    }
                });
                
                this._atualizarSelectDepartamentos();
                this._atualizarListaDepartamentos();
            } else {
                alert('Departamento já existe!');
            }
        }
    },

    // ===== FUNÇÃO MODIFICADA v8.4.1: REMOVER DEPARTAMENTO =====
    removerDepartamento(nome) {
        const index = this.departamentos.indexOf(nome);
        if (index > -1) {
            this.departamentos.splice(index, 1);
            console.log(`✅ Departamento '${nome}' removido`);
            
            // ===== NOVO v8.4.1: SALVAR NO FIREBASE =====
            this._salvarDepartamentosNoFirebase().then(sucesso => {
                if (sucesso) {
                    console.log('✅ Remoção salva no Firebase');
                } else {
                    console.log('⚠️ Remoção apenas local');
                }
            });
            
            this._atualizarSelectDepartamentos();
            this._atualizarListaDepartamentos();
        }
    },

    // ===== FUNÇÃO MODIFICADA v8.4.1: CARREGAR DEPARTAMENTOS =====
    _carregarDepartamentos() {
        // Carregar departamentos do Auth.js (que carrega do Firebase)
        if (typeof Auth !== 'undefined' && Auth.departamentos) {
            this.departamentos = [...Auth.departamentos];
            console.log(`📋 AdminUsersManager: ${this.departamentos.length} departamentos carregados do Auth.js`);
        } else {
            // Fallback para departamentos hardcoded
            this.departamentos = [
                "Gestão Geral",
                "Suprimentos", 
                "Qualidade & Produção",
                "Documentação & Arquivo",
                "Planejamento & Controle",
                "Recursos Humanos"
            ];
            console.log('📦 AdminUsersManager: Usando departamentos hardcoded');
        }
    },

    // ===== FUNÇÃO MODIFICADA v8.4.1: SALVAR USUÁRIOS =====
    async _salvarUsuariosNoFirebase() {
        console.log('💾 AdminUsersManager: Salvando usuários no Firebase...');
        
        try {
            if (!window.database) {
                console.log('❌ Firebase não disponível');
                return false;
            }

            // Salvar usuários no path correto
            await database.ref('dados/auth_equipe').set(Auth.equipe);
            console.log(`✅ ${Object.keys(Auth.equipe).length} usuários salvos no Firebase`);
            
            // ===== NOVO v8.4.1: SALVAR DEPARTAMENTOS TAMBÉM =====
            const deptSucesso = await this._salvarDepartamentosNoFirebase();
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar usuários:', error);
            
            // Retry após 1 segundo
            setTimeout(() => {
                console.log('🔄 Tentando salvar novamente...');
                this._salvarUsuariosNoFirebase();
            }, 1000);
            
            return false;
        }
    },

    // ===== RESTO DAS FUNÇÕES MANTIDAS =====
    
    // Abrir interface de gestão
    abrirInterfaceGestao() {
        console.log('🔧 Abrindo interface de gestão de usuários...');
        
        // Verificar permissões
        if (!Auth.isAdmin()) {
            alert('❌ Acesso negado! Apenas administradores podem gerenciar usuários.');
            return;
        }

        // Carregar departamentos atualizados
        this._carregarDepartamentos();

        // Criar interface
        this._criarInterfaceGestao();
    },

    // Criar a interface de gestão
    _criarInterfaceGestao() {
        // Remover interface existente
        const interfaceExistente = document.getElementById('admin-interface');
        if (interfaceExistente) {
            interfaceExistente.remove();
        }

        // Criar container da interface
        const container = document.createElement('div');
        container.id = 'admin-interface';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        // Criar modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 1200px;
            height: 90%;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
        `;

        // Criar header
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const titulo = document.createElement('h2');
        titulo.textContent = '🔧 Gestão de Usuários e Departamentos v8.4.1';
        titulo.style.margin = '0';

        const botaoFechar = document.createElement('button');
        botaoFechar.textContent = '✕';
        botaoFechar.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
        `;
        botaoFechar.onclick = () => container.remove();

        header.appendChild(titulo);
        header.appendChild(botaoFechar);

        // Criar conteúdo
        const conteudo = document.createElement('div');
        conteudo.style.cssText = `
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        `;

        // Seção de usuários
        const secaoUsuarios = this._criarSecaoUsuarios();
        
        // Seção de departamentos
        const secaoDepartamentos = this._criarSecaoDepartamentos();

        conteudo.appendChild(secaoUsuarios);
        conteudo.appendChild(secaoDepartamentos);

        modal.appendChild(header);
        modal.appendChild(conteudo);
        container.appendChild(modal);
        document.body.appendChild(container);

        console.log('✅ Interface de gestão criada');
    },

    // Criar seção de usuários
    _criarSecaoUsuarios() {
        const secao = document.createElement('div');
        secao.style.cssText = `
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
        `;

        const titulo = document.createElement('h3');
        titulo.textContent = '👥 Gestão de Usuários';
        titulo.style.cssText = `
            color: #495057;
            margin-bottom: 20px;
            border-bottom: 2px solid #dee2e6;
            padding-bottom: 10px;
        `;

        const listaUsuarios = document.createElement('div');
        listaUsuarios.id = 'lista-usuarios';
        
        this._atualizarListaUsuarios(listaUsuarios);

        secao.appendChild(titulo);
        secao.appendChild(listaUsuarios);

        return secao;
    },

    // Criar seção de departamentos
    _criarSecaoDepartamentos() {
        const secao = document.createElement('div');
        secao.style.cssText = `
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
        `;

        const titulo = document.createElement('h3');
        titulo.textContent = '🏢 Gestão de Departamentos';
        titulo.style.cssText = `
            color: #495057;
            margin-bottom: 20px;
            border-bottom: 2px solid #dee2e6;
            padding-bottom: 10px;
        `;

        // Botão adicionar departamento
        const botaoAdicionar = document.createElement('button');
        botaoAdicionar.textContent = '➕ Adicionar Departamento';
        botaoAdicionar.style.cssText = `
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 15px;
            font-weight: 500;
        `;
        botaoAdicionar.onclick = () => this.adicionarDepartamento();

        // Status da persistência
        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = `
            background: #e3f2fd;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 15px;
            font-size: 14px;
        `;
        
        const fonteDeptos = Auth.state ? Auth.state.fonteDepartamentosAtual : 'unknown';
        const persistindo = fonteDeptos === 'firebase';
        
        statusDiv.innerHTML = `
            📊 <strong>Status:</strong> ${persistindo ? '✅ Persistindo no Firebase' : '⚠️ Apenas local (hardcoded)'}<br>
            🔗 <strong>Fonte:</strong> ${fonteDeptos}<br>
            📋 <strong>Total:</strong> ${this.departamentos.length} departamentos
        `;

        const listaDepartamentos = document.createElement('div');
        listaDepartamentos.id = 'lista-departamentos';
        
        this._atualizarListaDepartamentos();

        secao.appendChild(titulo);
        secao.appendChild(botaoAdicionar);
        secao.appendChild(statusDiv);
        secao.appendChild(listaDepartamentos);

        return secao;
    },

    // Atualizar lista de departamentos
    _atualizarListaDepartamentos() {
        const container = document.getElementById('lista-departamentos');
        if (!container) return;

        container.innerHTML = '';

        this.departamentos.forEach((dept, index) => {
            const item = document.createElement('div');
            item.style.cssText = `
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            const nome = document.createElement('span');
            nome.textContent = dept;
            nome.style.fontWeight = '500';

            const botaoRemover = document.createElement('button');
            botaoRemover.textContent = '🗑️';
            botaoRemover.style.cssText = `
                background: #dc3545;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 4px;
                cursor: pointer;
            `;
            botaoRemover.onclick = () => {
                if (confirm(`Remover departamento "${dept}"?`)) {
                    this.removerDepartamento(dept);
                }
            };

            // Não permitir remover departamentos básicos
            const deptoBasico = index < 6;
            if (deptoBasico) {
                botaoRemover.style.opacity = '0.3';
                botaoRemover.style.cursor = 'not-allowed';
                botaoRemover.onclick = () => {
                    alert('Não é possível remover departamentos básicos do sistema.');
                };
            }

            item.appendChild(nome);
            item.appendChild(botaoRemover);
            container.appendChild(item);
        });
    },

    // Atualizar lista de usuários
    _atualizarListaUsuarios(container) {
        container.innerHTML = '';

        Object.values(Auth.equipe).forEach(usuario => {
            const item = document.createElement('div');
            item.style.cssText = `
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 10px;
            `;

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>${usuario.nome}</strong>
                    <div>
                        <button onclick="AdminUsersManager.editarUsuario('${usuario.id}')" 
                                style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                            ✏️ Editar
                        </button>
                        <button onclick="AdminUsersManager.alternarStatusUsuario('${usuario.id}')"
                                style="background: ${usuario.ativo ? '#dc3545' : '#28a745'}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            ${usuario.ativo ? '🚫 Desativar' : '✅ Ativar'}
                        </button>
                    </div>
                </div>
                <div style="color: #6c757d; font-size: 14px;">
                    📧 ${usuario.email}<br>
                    🏢 ${usuario.departamento} | 💼 ${usuario.cargo}<br>
                    🔑 ${usuario.permissoes} | 📞 ${usuario.telefone || 'Não informado'}
                </div>
            `;

            container.appendChild(item);
        });
    },

    // Atualizar selects de departamento
    _atualizarSelectDepartamentos() {
        const selects = document.querySelectorAll('select[data-campo="departamento"]');
        selects.forEach(select => {
            const valorAtual = select.value;
            select.innerHTML = '';
            
            this.departamentos.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                if (dept === valorAtual) option.selected = true;
                select.appendChild(option);
            });
        });
    },

    // Editar usuário
    editarUsuario(usuarioId) {
        const usuario = Auth.equipe[usuarioId];
        if (!usuario) return;

        const modal = this._criarModalEdicao(usuario);
        document.body.appendChild(modal);
    },

    // Criar modal de edição
    _criarModalEdicao(usuario) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 20000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 500px;
            max-height: 80%;
            overflow-y: auto;
        `;

        const campos = [
            { campo: 'nome', label: 'Nome', tipo: 'text' },
            { campo: 'email', label: 'Email', tipo: 'email' },
            { campo: 'cargo', label: 'Cargo', tipo: 'text' },
            { campo: 'departamento', label: 'Departamento', tipo: 'select' },
            { campo: 'telefone', label: 'Telefone', tipo: 'text' },
            { campo: 'permissoes', label: 'Permissões', tipo: 'select', opcoes: ['admin', 'editor', 'viewer'] }
        ];

        let formHTML = `<h3>✏️ Editando: ${usuario.nome}</h3>`;

        campos.forEach(campo => {
            formHTML += `<div style="margin-bottom: 15px;">`;
            formHTML += `<label style="display: block; margin-bottom: 5px; font-weight: 500;">${campo.label}:</label>`;
            
            if (campo.tipo === 'select') {
                formHTML += `<select data-campo="${campo.campo}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">`;
                
                if (campo.campo === 'departamento') {
                    this.departamentos.forEach(dept => {
                        formHTML += `<option value="${dept}" ${dept === usuario[campo.campo] ? 'selected' : ''}>${dept}</option>`;
                    });
                } else if (campo.opcoes) {
                    campo.opcoes.forEach(opcao => {
                        formHTML += `<option value="${opcao}" ${opcao === usuario[campo.campo] ? 'selected' : ''}>${opcao}</option>`;
                    });
                }
                
                formHTML += `</select>`;
            } else {
                formHTML += `<input type="${campo.tipo}" data-campo="${campo.campo}" value="${usuario[campo.campo] || ''}" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">`;
            }
            
            formHTML += `</div>`;
        });

        formHTML += `
            <div style="text-align: right; margin-top: 20px;">
                <button id="cancelar-edicao" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                    Cancelar
                </button>
                <button id="salvar-edicao" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                    💾 Salvar
                </button>
            </div>
        `;

        modal.innerHTML = formHTML;

        // Event listeners
        modal.querySelector('#cancelar-edicao').onclick = () => overlay.remove();
        modal.querySelector('#salvar-edicao').onclick = () => {
            this._salvarEdicaoUsuario(usuario, modal);
            overlay.remove();
        };

        overlay.appendChild(modal);
        return overlay;
    },

    // Salvar edição do usuário
    _salvarEdicaoUsuario(usuario, modal) {
        const campos = modal.querySelectorAll('[data-campo]');
        
        campos.forEach(campo => {
            const nomeCampo = campo.getAttribute('data-campo');
            const valor = campo.value;
            usuario[nomeCampo] = valor;
        });

        console.log(`✅ Usuário ${usuario.nome} atualizado`);
        
        // Salvar no Firebase
        this._salvarUsuariosNoFirebase().then(sucesso => {
            if (sucesso) {
                console.log('✅ Alterações salvas no Firebase');
                // Atualizar interface
                const listaUsuarios = document.getElementById('lista-usuarios');
                if (listaUsuarios) {
                    this._atualizarListaUsuarios(listaUsuarios);
                }
            }
        });
    },

    // Alterar status do usuário
    alternarStatusUsuario(usuarioId) {
        const usuario = Auth.equipe[usuarioId];
        if (!usuario) return;

        usuario.ativo = !usuario.ativo;
        console.log(`✅ Usuário ${usuario.nome} ${usuario.ativo ? 'ativado' : 'desativado'}`);
        
        // Salvar no Firebase
        this._salvarUsuariosNoFirebase().then(sucesso => {
            if (sucesso) {
                console.log('✅ Status salvo no Firebase');
                // Atualizar interface
                const listaUsuarios = document.getElementById('lista-usuarios');
                if (listaUsuarios) {
                    this._atualizarListaUsuarios(listaUsuarios);
                }
            }
        });
    }
};

// ===== COMANDOS GLOBAIS v8.4.1 =====

// Verificar persistência completa (usuários + departamentos)
async function verificarPersistenciaCompleta() {
    console.log('\n🧪 VERIFICAÇÃO PERSISTÊNCIA COMPLETA v8.4.1');
    console.log('=' .repeat(60));
    
    // Verificar usuários
    console.log('1️⃣ USUÁRIOS:');
    try {
        const snapshotUsuarios = await database.ref('dados/auth_equipe').once('value');
        const usuarios = snapshotUsuarios.val();
        console.log(`   ✅ No Firebase: ${usuarios ? Object.keys(usuarios).length : 0} usuários`);
        console.log(`   ✅ Na memória: ${Object.keys(Auth.equipe).length} usuários`);
    } catch (error) {
        console.log('   ❌ Erro ao verificar usuários:', error.message);
    }
    
    // Verificar departamentos
    console.log('2️⃣ DEPARTAMENTOS:');
    try {
        const snapshotDepartamentos = await database.ref('dados/departamentos').once('value');
        const departamentos = snapshotDepartamentos.val();
        console.log(`   ✅ No Firebase: ${departamentos ? Object.keys(departamentos).length : 0} departamentos`);
        console.log(`   ✅ Na memória: ${Auth.departamentos.length} departamentos`);
        
        if (Auth.departamentos.length > 6) {
            console.log('   🎯 DEPARTAMENTOS CUSTOMIZADOS:');
            Auth.departamentos.slice(6).forEach(dept => {
                console.log(`      + ${dept}`);
            });
        }
        
    } catch (error) {
        console.log('   ❌ Erro ao verificar departamentos:', error.message);
    }
    
    console.log('\n📊 STATUS GERAL:');
    console.log(`   Auth.js: ${Auth.state.fonteEquipeAtual} (usuários) | ${Auth.state.fonteDepartamentosAtual} (departamentos)`);
    console.log(`   Firebase: ${Auth.state.equipeCarregadaDoFirebase ? 'SIM' : 'NÃO'} (usuários) | ${Auth.state.departamentosCarregadosDoFirebase ? 'SIM' : 'NÃO'} (departamentos)`);
}

// ===== COMENTÁRIOS v8.4.1 =====
/*
CORREÇÕES APLICADAS v8.4.1:

1. ✅ NOVA FUNÇÃO: _salvarDepartamentosNoFirebase() - salva em dados/departamentos
2. ✅ MODIFICADA: adicionarDepartamento() - salva no Firebase após adicionar
3. ✅ MODIFICADA: removerDepartamento() - salva no Firebase após remover
4. ✅ MODIFICADA: _carregarDepartamentos() - usa dados do Auth.js (que carrega do Firebase)
5. ✅ MODIFICADA: _salvarUsuariosNoFirebase() - salva departamentos também
6. ✅ NOVA INTERFACE: Status de persistência dos departamentos
7. ✅ NOVO COMANDO: verificarPersistenciaCompleta()

FLUXO CORRIGIDO v8.4.1:
AdminUsersManager → salva usuários em dados/auth_equipe ✅
AdminUsersManager → salva departamentos em dados/departamentos ✅ (NOVO)
auth.js → carrega usuários de dados/auth_equipe ✅
auth.js → carrega departamentos de dados/departamentos ✅ (NOVO)

RESULTADO: Usuários E departamentos persistem após F5! ✅✅
*/
