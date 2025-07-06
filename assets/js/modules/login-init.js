/**
 * 🔐 Login Initialization Module v7.2.0
 * Extracted from index.html to keep the page lean.
 */

        // 🔐 FUNÇÕES DE LOGIN DINÂMICO v7.2.0
        
        // ✅ FUNÇÃO PARA ABRIR AGENDA DINÂMICA BASEADA NO USUÁRIO LOGADO
        function abrirMinhaAgendaDinamica() {
            const usuario = obterUsuarioAtual();
            if (usuario) {
                PersonalAgenda.abrirMinhaAgenda(usuario.nome);
            } else {
                Notifications.error('Usuário não identificado');
            }
        }
        
        // ✅ OBTER USUÁRIO ATUAL
        function obterUsuarioAtual() {
            if (App && App.usuarioAtual) {
                return {
                    email: App.usuarioAtual.email,
                    nome: App.usuarioAtual.displayName || extrairNomeDoEmail(App.usuarioAtual.email)
                };
            }
            
            if (Auth && Auth.state && Auth.state.usuarioAtual) {
                return {
                    email: Auth.state.usuarioAtual.email,
                    nome: Auth.state.usuarioAtual.displayName || extrairNomeDoEmail(Auth.state.usuarioAtual.email)
                };
            }
            
            return null;
        }
        
        // ✅ EXTRAIR NOME DO EMAIL PARA RENATOREMIRO@BIAPO.COM.BR
        function extrairNomeDoEmail(email) {
            if (!email) return 'Usuário';
            
            // Para renatoremiro@biapo.com.br -> Renato Remiro
            const parteLocal = email.split('@')[0];
            
            // Casos especiais conhecidos
            const mapaUsuarios = {
                'renatoremiro': 'Renato Remiro',
                'isabella': 'Isabella',
                'eduardo': 'Eduardo',
                'lara': 'Lara',
                'beto': 'Beto',
                'admin': 'Administrador'
            };
            
            if (mapaUsuarios[parteLocal.toLowerCase()]) {
                return mapaUsuarios[parteLocal.toLowerCase()];
            }
            
            // Caso geral: capitalizar primeira letra
            return parteLocal.charAt(0).toUpperCase() + parteLocal.slice(1);
        }
        
        // ✅ ATUALIZAR INFORMAÇÕES DO USUÁRIO NO HEADER
        function atualizarUsuarioHeader() {
            const usuario = obterUsuarioAtual();
            const usuarioElement = document.getElementById('usuarioLogado');
            
            if (usuario && usuarioElement) {
                usuarioElement.textContent = `👤 ${usuario.nome}`;
            }
        }
        
        // ✅ MOSTRAR RECUPERAR SENHA
        function mostrarRecuperarSenha() {
            const email = document.getElementById('loginEmail').value.trim();
            
            if (!email) {
                Notifications.error('Digite seu email primeiro');
                return;
            }
            
            if (!Validation.isValidEmail(email)) {
                Notifications.error('Email inválido');
                return;
            }
            
            const confirmacao = confirm(`Enviar email de recuperação para:\n${email}?`);
            
            if (confirmacao) {
                Auth.recuperarSenha(email);
            }
        }
        
        // ✅ INICIALIZAÇÃO COM LOGIN DINÂMICO
        function inicializarSistemaComLogin() {
            console.log('🔐 Inicializando sistema com login dinâmico...');

            // Verificar se Auth está disponível
            if (window.Auth && typeof Auth.verificarAutoLogin === 'function') {
                // Verificar auto-login
                Auth.verificarAutoLogin().then((user) => {
                    if (user) {
                        console.log('✅ Auto-login realizado:', user.email);
                        mostrarSistemaPrincipal();
                        atualizarUsuarioHeader();
                    } else {
                        console.log('👤 Nenhum usuário logado - mostrando tela de login');
                        mostrarTelaLogin();
                    }
                }).catch((error) => {
                    console.error('❌ Erro no auto-login:', error);
                    mostrarTelaLogin();
                });
            } else {
                console.error('❌ Módulo de autenticação não disponível');
                if (window.Notifications && typeof Notifications.error === 'function') {
                    Notifications.error('Módulo de autenticação não carregado.');
                }
                mostrarTelaLogin();
            }
        }
        
        // ✅ MOSTRAR TELA DE LOGIN
        function mostrarTelaLogin() {
            const loginScreen = document.getElementById('loginScreen');
            const mainContainer = document.getElementById('mainContainer');
            
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (mainContainer) mainContainer.classList.add('hidden');
        }
        
        // ✅ MOSTRAR SISTEMA PRINCIPAL
        function mostrarSistemaPrincipal() {
            const loginScreen = document.getElementById('loginScreen');
            const mainContainer = document.getElementById('mainContainer');
            
            if (loginScreen) loginScreen.classList.add('hidden');
            if (mainContainer) mainContainer.classList.remove('hidden');
            
            // Inicializar dados se necessário
            setTimeout(() => {
                if (typeof App !== 'undefined' && typeof DataStructure !== 'undefined') {
                    if (!App.dados) {
                        App.dados = DataStructure.inicializarDados();
                    }
                    console.log('📊 Dados inicializados para usuário logado');
                }
                
                // Atualizar informações do usuário
                atualizarUsuarioHeader();
                
                // Inicializar estatísticas
                setTimeout(atualizarEstatisticasHybrid, 2000);
            }, 500);
        }
        
        // ✅ TODAS AS FUNÇÕES ORIGINAIS DO INDEX.HTML MANTIDAS
        
        // Atualizar data atual
        document.getElementById('dataAtual').textContent = new Date().toLocaleDateString('pt-BR');
        
        // ✅ FUNÇÕES DE CONTROLE HÍBRIDO v6.6.0 (ORIGINAIS)
        function mostrarStatusHybrid() {
            if (typeof HybridSync !== 'undefined') {
                const status = HybridSync.obterStatus();
                const stats = HybridSync.obterEstatisticas();
                const usuario = obterUsuarioAtual();
                
                alert(
                    `📊 STATUS DO SISTEMA HÍBRIDO v7.2.0\n\n` +
                    `👤 Usuário: ${usuario ? usuario.nome + ' (' + usuario.email + ')' : 'Não logado'}\n` +
                    `✅ Ativo: ${status.ativo ? 'Sim' : 'Não'}\n` +
                    `🔄 Auto-sync: ${status.autoSync ? 'Ativo' : 'Inativo'}\n` +
                    `⚠️ Detectar conflitos: ${status.detectarConflitos ? 'Ativo' : 'Inativo'}\n` +
                    `📅 Eventos sincronizados: ${stats.eventosSync}\n` +
                    `⬆️ Tarefas promovidas: ${stats.tarefasPromovidas}\n` +
                    `⚠️ Conflitos ativos: ${stats.conflitosAtivos}\n` +
                    `🕒 Última sync: ${status.ultimaSync || 'Nunca'}\n\n` +
                    `Dependências: ${status.dependenciasOk ? '✅' : '❌'}`
                );
            } else {
                alert('❌ Sistema de sincronização não disponível');
            }
        }
        
        function forcarSincronizacao() {
            if (typeof HybridSync !== 'undefined') {
                HybridSync.sincronizarEventosParaTarefas();
                Notifications.info('🔄 Sincronização forçada iniciada...');
                
                // Atualizar estatísticas após um tempo
                setTimeout(atualizarEstatisticasHybrid, 2000);
            } else {
                Notifications.error('❌ Sistema de sincronização não disponível');
            }
        }
        
        function detectarConflitos() {
            if (typeof HybridSync !== 'undefined') {
                const conflitos = HybridSync.detectarConflitos();
                
                if (conflitos.length === 0) {
                    Notifications.success('✅ Nenhum conflito detectado');
                } else {
                    Notifications.warning(`⚠️ ${conflitos.length} conflito(s) detectado(s)`);
                }
                
                // Atualizar estatísticas
                setTimeout(atualizarEstatisticasHybrid, 1000);
            } else {
                Notifications.error('❌ Sistema de detecção de conflitos não disponível');
            }
        }
        
        function criarDadosTeste() {
            if (typeof HybridSync_Debug !== 'undefined') {
                HybridSync_Debug.criarEventoTeste();
                HybridSync_Debug.criarTarefaTeste();
                Notifications.success('🧪 Dados de teste criados!');
                
                // Forçar sincronização dos novos dados
                setTimeout(() => {
                    if (typeof HybridSync !== 'undefined') {
                        HybridSync.sincronizarEventosParaTarefas();
                    }
                }, 1000);
                
                // Atualizar estatísticas
                setTimeout(atualizarEstatisticasHybrid, 3000);
            } else {
                Notifications.error('❌ Sistema de debug não disponível');
            }
        }
        
        // ✅ ATUALIZAR ESTATÍSTICAS EM TEMPO REAL (ORIGINAL)
        function atualizarEstatisticasHybrid() {
            if (typeof HybridSync !== 'undefined' && HybridSync.state && HybridSync.state.inicializado) {
                const stats = HybridSync.obterEstatisticas();
                
                const statEventosSync = document.getElementById('statEventosSync');
                const statTarefasPromovidas = document.getElementById('statTarefasPromovidas');
                const statConflitos = document.getElementById('statConflitos');
                const statUltimaSync = document.getElementById('statUltimaSync');
                
                if (statEventosSync) statEventosSync.textContent = stats.eventosSync || 0;
                if (statTarefasPromovidas) statTarefasPromovidas.textContent = stats.tarefasPromovidas || 0;
                if (statConflitos) statConflitos.textContent = stats.conflitosAtivos || 0;
                
                if (statUltimaSync) {
                    const ultimaSync = stats.ultimaSync ? 
                        new Date(stats.ultimaSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 
                        'Nunca';
                    statUltimaSync.textContent = ultimaSync;
                }
            }
        }
        
        // ✅ LOG INICIAL E INICIALIZAÇÃO v7.2.0 COM LOGIN
        console.log('🔐 Sistema BIAPO v7.2.0 - Login Dinâmico Implementado!');
        console.log('📦 Autenticação + Módulos base + agenda pessoal + sincronização');
        
        // ✅ INICIALIZAÇÃO AUTOMÁTICA COM LOGIN v7.2.0
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('🔐 Inicializando sistema BIAPO com autenticação...');

            try {
                if (window.firebaseInitPromise) {
                    await window.firebaseInitPromise;
                }

                inicializarSistemaComLogin();
            } catch (error) {
                console.error('❌ Erro ao aguardar inicialização do Firebase:', error);
                if (window.Notifications && typeof Notifications.error === 'function') {
                    Notifications.error('Erro ao inicializar o Firebase');
                }
            }
        });
        
        // ✅ INTERCEPTAR LOGIN SUCESSO PARA MOSTRAR SISTEMA
        if (typeof Auth !== 'undefined') {
            // Sobrescrever função de sucesso do Auth para integrar com nossa interface
            const originalOnLoginSucesso = Auth._onLoginSucesso;
            Auth._onLoginSucesso = function(user) {
                // Chamar função original
                originalOnLoginSucesso.call(this, user);
                
                // Mostrar sistema principal
                mostrarSistemaPrincipal();
                
                console.log('✅ Login realizado - sistema principal exibido');
            };
            
            // Sobrescrever logout para mostrar tela de login
            const originalOnLogoutSucesso = Auth._onLogoutSucesso;
            Auth._onLogoutSucesso = function() {
                // Chamar função original
                originalOnLogoutSucesso.call(this);
                
                // Mostrar tela de login
                mostrarTelaLogin();
                
                console.log('✅ Logout realizado - tela de login exibida');
            };
        }
        
        // Atualizar estatísticas a cada 30 segundos
        setInterval(atualizarEstatisticasHybrid, 30000);
        
        
        // ✅ MOSTRAR/OCULTAR SEÇÕES DE DEBUG BASEADO NO USUÁRIO
        function toggleDebugSections() {
            const debugSections = document.querySelectorAll('.debug-section');
            const usuario = obterUsuarioAtual();
            const isAdmin = usuario && (usuario.email.includes('admin') || usuario.email.includes('renatoremiro'));
            
            debugSections.forEach(section => {
                section.style.display = isAdmin ? 'block' : 'none';
            });
        }
        
        // Chamar toggle debug após login
        setTimeout(() => {
            toggleDebugSections();
        }, 3000);

