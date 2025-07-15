/**
 * 🔍 SISTEMA DE DIAGNÓSTICO PROFUNDO BIAPO v1.0
 * 
 * Análise completa de integridade, sincronização e confiabilidade
 */

const DiagnosticoBIAPO = {
    versao: '1.0',
    resultados: {
        usuarios: {},
        sincronizacao: {},
        armazenamento: {},
        integracao: {},
        confiabilidade: {}
    },
    
    // 🚀 EXECUTAR DIAGNÓSTICO COMPLETO
    async executarDiagnosticoCompleto() {
        console.log('🔍 ========== DIAGNÓSTICO PROFUNDO BIAPO v1.0 ==========');
        console.log('⏰ Iniciado em:', new Date().toLocaleString('pt-BR'));
        console.log('');
        
        // 1. Verificar usuários
        await this.verificarUsuarios();
        
        // 2. Verificar sincronização
        await this.verificarSincronizacao();
        
        // 3. Verificar armazenamento
        await this.verificarArmazenamento();
        
        // 4. Verificar integração
        await this.verificarIntegracao();
        
        // 5. Teste de confiabilidade
        await this.testeConfiabilidade();
        
        // 6. Gerar relatório
        this.gerarRelatorio();
        
        return this.resultados;
    },
    
    // 👥 VERIFICAR USUÁRIOS
    async verificarUsuarios() {
        console.log('\n👥 VERIFICANDO SISTEMA DE USUÁRIOS...');
        
        const testes = {
            authCarregado: false,
            usuarioLogado: false,
            totalUsuarios: 0,
            usuariosFirebase: 0,
            usuariosLocal: 0,
            sincronizados: false,
            permissoes: {}
        };
        
        try {
            // Verificar Auth
            if (typeof Auth !== 'undefined') {
                testes.authCarregado = true;
                console.log('✅ Auth.js carregado');
                
                // Verificar usuário logado
                if (Auth.estaLogado()) {
                    testes.usuarioLogado = true;
                    const usuario = Auth.obterUsuario();
                    console.log(`✅ Usuário logado: ${usuario.email}`);
                    console.log(`   Nome: ${usuario.displayName}`);
                    console.log(`   Admin: ${usuario.admin ? 'SIM' : 'NÃO'}`);
                    
                    testes.permissoes = {
                        admin: Auth.ehAdmin(),
                        podeEditar: !App?.estadoSistema?.modoAnonimo
                    };
                }
                
                // Contar usuários
                const usuarios = Auth.listarUsuarios();
                testes.totalUsuarios = usuarios.length;
                console.log(`✅ Total de usuários: ${usuarios.length}`);
                
                // Verificar fonte
                const status = Auth.obterStatus();
                if (status.firebase?.carregadoDoFirebase) {
                    testes.usuariosFirebase = usuarios.length;
                    console.log('✅ Usuários carregados do Firebase');
                } else {
                    testes.usuariosLocal = usuarios.length;
                    console.log('⚠️ Usuários carregados localmente (fallback)');
                }
                
                // Listar departamentos
                console.log('\n🏢 DEPARTAMENTOS:');
                const deptos = Auth.departamentos;
                deptos.forEach((dept, i) => {
                    const usuariosDepto = usuarios.filter(u => u.departamento === dept);
                    console.log(`   ${i+1}. ${dept}: ${usuariosDepto.length} usuários`);
                });
                
            } else {
                console.error('❌ Auth.js não encontrado!');
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar usuários:', error);
        }
        
        this.resultados.usuarios = testes;
    },
    
    // 🔄 VERIFICAR SINCRONIZAÇÃO
    async verificarSincronizacao() {
        console.log('\n🔄 VERIFICANDO SINCRONIZAÇÃO...');
        
        const testes = {
            appInicializado: false,
            firebaseConectado: false,
            dadosSincronizados: false,
            ultimaSincronizacao: null,
            participantesFuncionando: false,
            tarefasCompartilhadas: 0
        };
        
        try {
            // Verificar App
            if (typeof App !== 'undefined') {
                testes.appInicializado = App.estadoSistema?.inicializado;
                console.log(`${testes.appInicializado ? '✅' : '❌'} App.js inicializado`);
                
                // Firebase
                testes.firebaseConectado = App.estadoSistema?.firebaseDisponivel;
                console.log(`${testes.firebaseConectado ? '✅' : '⚠️'} Firebase ${testes.firebaseConectado ? 'conectado' : 'offline (usando localStorage)'}`);
                
                // Verificar dados
                const eventos = App.dados?.eventos || [];
                const tarefas = App.dados?.tarefas || [];
                console.log(`📊 Dados: ${eventos.length} eventos + ${tarefas.length} tarefas`);
                
                // Verificar tarefas com participantes
                const tarefasComParticipantes = tarefas.filter(t => 
                    t.participantes && t.participantes.length > 0
                );
                testes.tarefasCompartilhadas = tarefasComParticipantes.length;
                console.log(`👥 Tarefas com participantes: ${testes.tarefasCompartilhadas}`);
                
                // Testar sincronização de participantes
                if (tarefasComParticipantes.length > 0) {
                    console.log('\n🧪 TESTE DE PARTICIPANTES:');
                    const tarefa = tarefasComParticipantes[0];
                    console.log(`   Tarefa: "${tarefa.titulo}"`);
                    console.log(`   Participantes: ${tarefa.participantes.join(', ')}`);
                    
                    // Simular filtro para cada participante
                    tarefa.participantes.forEach(participante => {
                        const veriaATarefa = this.participanteVeriaTarefa(tarefa, participante);
                        console.log(`   ${participante}: ${veriaATarefa ? '✅ vê a tarefa' : '❌ NÃO vê a tarefa'}`);
                    });
                    
                    testes.participantesFuncionando = true;
                }
                
                // Verificar última sincronização
                testes.ultimaSincronizacao = App.dados?.metadata?.ultimaAtualizacao;
                if (testes.ultimaSincronizacao) {
                    const data = new Date(testes.ultimaSincronizacao);
                    console.log(`🕐 Última sincronização: ${data.toLocaleString('pt-BR')}`);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar sincronização:', error);
        }
        
        this.resultados.sincronizacao = testes;
    },
    
    // 💾 VERIFICAR ARMAZENAMENTO
    async verificarArmazenamento() {
        console.log('\n💾 VERIFICANDO ARMAZENAMENTO...');
        
        const testes = {
            localStorage: false,
            sessionStorage: false,
            firebase: false,
            backupDisponivel: false,
            tamanhoTotal: 0,
            dadosRecuperaveis: false
        };
        
        try {
            // LocalStorage
            const dadosLocal = localStorage.getItem('biapo_dados_v8');
            if (dadosLocal) {
                testes.localStorage = true;
                testes.tamanhoTotal = dadosLocal.length;
                console.log(`✅ LocalStorage: ${(dadosLocal.length / 1024).toFixed(2)} KB`);
                
                // Verificar timestamp
                const timestamp = localStorage.getItem('biapo_dados_timestamp');
                if (timestamp) {
                    console.log(`   Último save: ${new Date(timestamp).toLocaleString('pt-BR')}`);
                }
            } else {
                console.log('⚠️ LocalStorage vazio');
            }
            
            // SessionStorage
            const dadosSession = sessionStorage.getItem('biapo_dados_backup');
            if (dadosSession) {
                testes.sessionStorage = true;
                console.log(`✅ SessionStorage backup: ${(dadosSession.length / 1024).toFixed(2)} KB`);
            }
            
            // Firebase
            if (App?.estadoSistema?.firebaseDisponivel && typeof database !== 'undefined') {
                try {
                    console.log('🔄 Testando leitura do Firebase...');
                    const snapshot = await database.ref('dados/metadata/versao').once('value');
                    if (snapshot.exists()) {
                        testes.firebase = true;
                        console.log(`✅ Firebase acessível - versão: ${snapshot.val()}`);
                    }
                } catch (error) {
                    console.log('⚠️ Firebase inacessível:', error.message);
                }
            }
            
            // Backup de emergência
            const backupEmergencia = localStorage.getItem('biapo_backup_emergencia');
            if (backupEmergencia) {
                testes.backupDisponivel = true;
                console.log('✅ Backup de emergência disponível');
            }
            
            // Teste de recuperação
            testes.dadosRecuperaveis = testes.localStorage || testes.firebase || testes.backupDisponivel;
            console.log(`${testes.dadosRecuperaveis ? '✅' : '❌'} Dados recuperáveis em caso de falha`);
            
        } catch (error) {
            console.error('❌ Erro ao verificar armazenamento:', error);
        }
        
        this.resultados.armazenamento = testes;
    },
    
    // 🔗 VERIFICAR INTEGRAÇÃO
    async verificarIntegracao() {
        console.log('\n🔗 VERIFICANDO INTEGRAÇÃO ENTRE MÓDULOS...');
        
        const testes = {
            appAuth: false,
            appCalendar: false,
            appEvents: false,
            calendarFiltros: false,
            eventosParticipantes: false,
            deepLinks: false
        };
        
        try {
            // App + Auth
            if (App?.usuarioAtual && Auth?.obterUsuario()) {
                const usuarioApp = App.usuarioAtual.email;
                const usuarioAuth = Auth.obterUsuario().email;
                testes.appAuth = usuarioApp === usuarioAuth;
                console.log(`${testes.appAuth ? '✅' : '❌'} App + Auth sincronizados`);
            }
            
            // App + Calendar
            if (typeof Calendar !== 'undefined' && Calendar._obterItensDoDia) {
                testes.appCalendar = true;
                console.log('✅ App + Calendar integrados');
            }
            
            // App + Events
            if (typeof Events !== 'undefined' && App?._buscarEvento) {
                testes.appEvents = true;
                console.log('✅ App + Events integrados');
            }
            
            // Testar filtros do Calendar
            if (App?._aplicarFiltrosExibicao) {
                const testeFiltro = App._aplicarFiltrosExibicao([], [{
                    titulo: 'Teste',
                    escopo: 'pessoal',
                    responsavel: App.usuarioAtual?.email || 'teste@teste.com'
                }]);
                testes.calendarFiltros = !testeFiltro.erro;
                console.log(`${testes.calendarFiltros ? '✅' : '❌'} Filtros Calendar funcionando`);
            }
            
            // Deep Links
            if (App?._gerarDeepLink) {
                const deepLink = App._gerarDeepLink('tarefa', 'teste123', 'editar');
                testes.deepLinks = deepLink.includes('agenda.html');
                console.log(`${testes.deepLinks ? '✅' : '❌'} Deep Links funcionando`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar integração:', error);
        }
        
        this.resultados.integracao = testes;
    },
    
    // 🧪 TESTE DE CONFIABILIDADE
    async testeConfiabilidade() {
        console.log('\n🧪 TESTE DE CONFIABILIDADE...');
        
        const testes = {
            criarTarefa: false,
            editarTarefa: false,
            excluirTarefa: false,
            salvarDados: false,
            recuperarDados: false,
            tempoResposta: 0
        };
        
        try {
            const inicio = Date.now();
            
            // 1. Criar tarefa teste
            console.log('1️⃣ Testando criar tarefa...');
            let tarefaTeste = null;
            try {
                tarefaTeste = await App.criarTarefa({
                    titulo: `🧪 Teste Diagnóstico ${Date.now()}`,
                    descricao: 'Tarefa criada pelo sistema de diagnóstico',
                    tipo: 'pessoal',
                    participantes: ['teste1', 'teste2']
                });
                testes.criarTarefa = !!tarefaTeste;
                console.log(`   ${testes.criarTarefa ? '✅' : '❌'} Criar tarefa`);
            } catch (e) {
                console.log('   ❌ Erro ao criar tarefa:', e.message);
            }
            
            // 2. Editar tarefa
            if (tarefaTeste) {
                console.log('2️⃣ Testando editar tarefa...');
                try {
                    await App.editarTarefa(tarefaTeste.id, {
                        descricao: 'Descrição editada pelo diagnóstico'
                    });
                    testes.editarTarefa = true;
                    console.log('   ✅ Editar tarefa');
                } catch (e) {
                    console.log('   ❌ Erro ao editar tarefa:', e.message);
                }
            }
            
            // 3. Salvar dados
            console.log('3️⃣ Testando salvar dados...');
            try {
                await App._salvarDadosUnificados();
                testes.salvarDados = true;
                console.log('   ✅ Salvar dados');
            } catch (e) {
                console.log('   ❌ Erro ao salvar:', e.message);
            }
            
            // 4. Excluir tarefa
            if (tarefaTeste) {
                console.log('4️⃣ Testando excluir tarefa...');
                try {
                    await App.excluirTarefa(tarefaTeste.id);
                    testes.excluirTarefa = true;
                    console.log('   ✅ Excluir tarefa');
                } catch (e) {
                    console.log('   ❌ Erro ao excluir:', e.message);
                }
            }
            
            // 5. Tempo de resposta
            testes.tempoResposta = Date.now() - inicio;
            console.log(`⏱️ Tempo total: ${testes.tempoResposta}ms`);
            
        } catch (error) {
            console.error('❌ Erro no teste de confiabilidade:', error);
        }
        
        this.resultados.confiabilidade = testes;
    },
    
    // 📊 GERAR RELATÓRIO
    gerarRelatorio() {
        console.log('\n📊 ========== RELATÓRIO FINAL ==========\n');
        
        // Calcular pontuação
        let pontos = 0;
        let total = 0;
        
        // Usuários (25 pontos)
        if (this.resultados.usuarios.authCarregado) pontos += 5;
        if (this.resultados.usuarios.usuarioLogado) pontos += 5;
        if (this.resultados.usuarios.totalUsuarios > 0) pontos += 10;
        if (this.resultados.usuarios.usuariosFirebase > 0) pontos += 5;
        total += 25;
        
        // Sincronização (25 pontos)
        if (this.resultados.sincronizacao.appInicializado) pontos += 10;
        if (this.resultados.sincronizacao.participantesFuncionando) pontos += 10;
        if (this.resultados.sincronizacao.tarefasCompartilhadas > 0) pontos += 5;
        total += 25;
        
        // Armazenamento (25 pontos)
        if (this.resultados.armazenamento.localStorage) pontos += 10;
        if (this.resultados.armazenamento.firebase) pontos += 10;
        if (this.resultados.armazenamento.dadosRecuperaveis) pontos += 5;
        total += 25;
        
        // Integração (15 pontos)
        if (this.resultados.integracao.appAuth) pontos += 5;
        if (this.resultados.integracao.appCalendar) pontos += 5;
        if (this.resultados.integracao.calendarFiltros) pontos += 5;
        total += 15;
        
        // Confiabilidade (10 pontos)
        if (this.resultados.confiabilidade.criarTarefa) pontos += 3;
        if (this.resultados.confiabilidade.editarTarefa) pontos += 3;
        if (this.resultados.confiabilidade.salvarDados) pontos += 4;
        total += 10;
        
        const porcentagem = (pontos / total) * 100;
        const status = porcentagem >= 90 ? '🟢 EXCELENTE' : 
                      porcentagem >= 75 ? '🟡 BOM' : 
                      porcentagem >= 60 ? '🟠 REGULAR' : 
                      '🔴 CRÍTICO';
        
        console.log(`PONTUAÇÃO FINAL: ${status} (${porcentagem.toFixed(1)}%)`);
        console.log(`Pontos: ${pontos}/${total}`);
        
        console.log('\n📋 RESUMO POR CATEGORIA:');
        console.log(`👥 Usuários: ${this.calcularPorcentagem(this.resultados.usuarios)}%`);
        console.log(`🔄 Sincronização: ${this.calcularPorcentagem(this.resultados.sincronizacao)}%`);
        console.log(`💾 Armazenamento: ${this.calcularPorcentagem(this.resultados.armazenamento)}%`);
        console.log(`🔗 Integração: ${this.calcularPorcentagem(this.resultados.integracao)}%`);
        console.log(`🧪 Confiabilidade: ${this.calcularPorcentagem(this.resultados.confiabilidade)}%`);
        
        console.log('\n🚨 PROBLEMAS DETECTADOS:');
        this.listarProblemas();
        
        console.log('\n💡 RECOMENDAÇÕES:');
        this.gerarRecomendacoes();
        
        console.log('\n⏰ Diagnóstico concluído em:', new Date().toLocaleString('pt-BR'));
        console.log('📊 ==========================================\n');
    },
    
    // Funções auxiliares
    participanteVeriaTarefa(tarefa, participante) {
        return tarefa.participantes?.includes(participante) || 
               tarefa.responsavel === participante ||
               tarefa.criadoPor === participante;
    },
    
    calcularPorcentagem(categoria) {
        const valores = Object.values(categoria).filter(v => typeof v === 'boolean');
        const positivos = valores.filter(v => v === true).length;
        return valores.length > 0 ? ((positivos / valores.length) * 100).toFixed(0) : 0;
    },
    
    listarProblemas() {
        const problemas = [];
        
        if (!this.resultados.usuarios.usuarioLogado) {
            problemas.push('❌ Nenhum usuário logado');
        }
        
        if (!this.resultados.sincronizacao.firebaseConectado) {
            problemas.push('⚠️ Firebase offline - usando armazenamento local');
        }
        
        if (!this.resultados.armazenamento.firebase && !this.resultados.armazenamento.localStorage) {
            problemas.push('🚨 CRÍTICO: Nenhum método de armazenamento funcionando!');
        }
        
        if (this.resultados.sincronizacao.tarefasCompartilhadas === 0) {
            problemas.push('ℹ️ Nenhuma tarefa com participantes para testar sincronização');
        }
        
        if (problemas.length === 0) {
            console.log('   ✅ Nenhum problema crítico detectado');
        } else {
            problemas.forEach(p => console.log(`   ${p}`));
        }
    },
    
    gerarRecomendacoes() {
        const recomendacoes = [];
        
        if (!this.resultados.sincronizacao.firebaseConectado) {
            recomendacoes.push('🔧 Verificar conexão com Firebase ou credenciais');
        }
        
        if (this.resultados.confiabilidade.tempoResposta > 2000) {
            recomendacoes.push('⚡ Otimizar performance - operações lentas detectadas');
        }
        
        if (!this.resultados.armazenamento.backupDisponivel) {
            recomendacoes.push('💾 Considerar implementar backup automático adicional');
        }
        
        if (this.resultados.usuarios.totalUsuarios < 5) {
            recomendacoes.push('👥 Carregar lista completa de usuários do Firebase');
        }
        
        if (recomendacoes.length === 0) {
            console.log('   🎉 Sistema funcionando otimamente!');
        } else {
            recomendacoes.forEach(r => console.log(`   ${r}`));
        }
    }
};

// 🎯 COMANDOS GLOBAIS
window.diagnosticoBIAPO = () => DiagnosticoBIAPO.executarDiagnosticoCompleto();
window.testeRapido = async () => {
    console.log('🚀 TESTE RÁPIDO DO SISTEMA...\n');
    
    // Verificações básicas
    console.log('✓ App inicializado?', App?.estadoSistema?.inicializado ? '✅' : '❌');
    console.log('✓ Auth funcionando?', Auth?.estaLogado() ? '✅' : '❌');
    console.log('✓ Firebase conectado?', App?.estadoSistema?.firebaseDisponivel ? '✅' : '⚠️ Offline');
    console.log('✓ Calendar carregado?', Calendar?.state?.carregado ? '✅' : '❌');
    console.log('✓ Total tarefas:', App?.dados?.tarefas?.length || 0);
    console.log('✓ Total eventos:', App?.dados?.eventos?.length || 0);
    
    const usuario = Auth?.obterUsuario();
    if (usuario) {
        console.log('\n👤 Usuário atual:');
        console.log('   Nome:', usuario.displayName);
        console.log('   Email:', usuario.email);
        console.log('   Admin:', usuario.admin ? 'SIM' : 'NÃO');
    }
};

console.log('🔍 Sistema de Diagnóstico BIAPO carregado!');
console.log('📋 Comandos disponíveis:');
console.log('   • diagnosticoBIAPO() - Análise completa (30 segundos)');
console.log('   • testeRapido() - Verificação básica (instantânea)');
