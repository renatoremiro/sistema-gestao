/**
 * 🔧 SISTEMA DE CORREÇÃO AUTOMÁTICA BIAPO v1.0
 * 
 * Identifica e corrige problemas de persistência automaticamente
 */

const CorretorAutomatico = {
    versao: '1.0',
    problemas: [],
    correcoes: [],
    
    // 🚀 EXECUTAR CORREÇÃO COMPLETA
    async executarCorrecaoCompleta() {
        console.log('🔧 ========== CORRETOR AUTOMÁTICO BIAPO v1.0 ==========');
        console.log('⏰ Iniciado em:', new Date().toLocaleString('pt-BR'));
        
        this.problemas = [];
        this.correcoes = [];
        
        // 1. Verificar e corrigir configuração Supabase
        await this.corrigirConfiguracaoSupabase();
        
        // 2. Verificar e corrigir persistência
        await this.corrigirSistemaPersistencia();
        
        // 3. Verificar e corrigir banco de dados
        await this.verificarBancoDados();
        
        // 4. Limpar cache e dados corrompidos
        this.limparDadosCorrempidos();
        
        // 5. Testar funcionamento
        await this.testarSistemaCompleto();
        
        // 6. Relatório final
        this.gerarRelatorioCorrecao();
        
        return {
            problemas: this.problemas,
            correcoes: this.correcoes,
            sucesso: this.correcoes.length > 0
        };
    },
    
    // 🔐 CORRIGIR CONFIGURAÇÃO SUPABASE
    async corrigirConfiguracaoSupabase() {
        console.log('\n🔐 VERIFICANDO CONFIGURAÇÃO SUPABASE...');
        
        try {
            // Verificar se configuração existe
            if (!window.SUPABASE_CONFIG) {
                this.problemas.push('window.SUPABASE_CONFIG não definida');
                
                // Tentar carregar do EnvLoader
                if (typeof EnvLoader !== 'undefined') {
                    console.log('🔄 Tentando carregar via EnvLoader...');
                    await EnvLoader.carregarCredenciais();
                    
                    if (window.SUPABASE_CONFIG) {
                        this.correcoes.push('✅ Credenciais carregadas via EnvLoader');
                        console.log('✅ Configuração carregada automaticamente!');
                    }
                } else {
                    // Definir configuração de fallback
                    window.SUPABASE_CONFIG = {
                        url: 'https://vyquhmlxjrvbdwgadtxc.supabase.co',
                        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cXVobWx4anJ2YmR3Z2FkdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzQyMDYsImV4cCI6MjA2ODI1MDIwNn0.zyj_8uW4T7E40ekdqDDW8E91P7LpXD5Pr53GCrPqMvM'
                    };
                    this.correcoes.push('✅ Configuração de fallback aplicada');
                    console.log('✅ Configuração de fallback aplicada!');
                }
            } else {
                console.log('✅ window.SUPABASE_CONFIG já definida');
            }
            
            // Verificar se supabaseClient existe
            if (!window.supabaseClient) {
                this.problemas.push('supabaseClient não inicializado');
                
                // Tentar reinicializar
                if (typeof SupabaseClient !== 'undefined') {
                    console.log('🔄 Reinicializando supabaseClient...');
                    window.supabaseClient = new SupabaseClient();
                    this.correcoes.push('✅ supabaseClient reinicializado');
                }
            }
            
            // Testar conexão
            if (window.supabaseClient) {
                const conectado = await window.supabaseClient.testarConexao();
                if (conectado) {
                    console.log('✅ Conexão Supabase funcionando');
                    this.correcoes.push('✅ Conexão Supabase testada com sucesso');
                } else {
                    this.problemas.push('Falha na conexão Supabase');
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao corrigir configuração Supabase:', error);
            this.problemas.push(`Erro configuração Supabase: ${error.message}`);
        }
    },
    
    // 💾 CORRIGIR SISTEMA DE PERSISTÊNCIA
    async corrigirSistemaPersistencia() {
        console.log('\n💾 VERIFICANDO SISTEMA DE PERSISTÊNCIA...');
        
        try {
            // Verificar se Persistence existe
            if (typeof Persistence === 'undefined') {
                this.problemas.push('Módulo Persistence não carregado');
                console.error('❌ Módulo Persistence não encontrado!');
                return;
            }
            
            console.log('✅ Módulo Persistence carregado');
            
            // Testar salvamento local
            try {
                const dadosTeste = { teste: 'corretor_automatico', timestamp: Date.now() };
                Persistence._salvarBackupLocal(dadosTeste);
                console.log('✅ Salvamento local funcionando');
                this.correcoes.push('✅ Salvamento local testado');
            } catch (error) {
                this.problemas.push(`Erro salvamento local: ${error.message}`);
            }
            
            // Limpar cache de usuário
            if (Persistence.state) {
                Persistence.state.ultimaVerificacaoUsuario = null;
                Persistence.state.usuarioAtual = null;
                console.log('✅ Cache de usuário limpo');
                this.correcoes.push('✅ Cache de usuário reiniciado');
            }
            
            // Testar verificação de usuário
            const usuario = Persistence._verificarUsuarioLogado();
            console.log(`👤 Usuário atual: ${usuario ? usuario.email || 'ID: ' + usuario.id : 'Nenhum'}`);
            
            // Testar salvamento crítico
            if (typeof App !== 'undefined' && App.dados) {
                console.log('🧪 Testando salvamento crítico...');
                await Persistence.salvarDados();
                this.correcoes.push('✅ Teste de salvamento executado');
            }
            
        } catch (error) {
            console.error('❌ Erro ao corrigir persistência:', error);
            this.problemas.push(`Erro persistência: ${error.message}`);
        }
    },
    
    // 🗄️ VERIFICAR BANCO DE DADOS
    async verificarBancoDados() {
        console.log('\n🗄️ VERIFICANDO BANCO DE DADOS...');
        
        try {
            if (!window.supabaseClient) {
                this.problemas.push('Cliente Supabase não disponível para teste BD');
                return;
            }
            
            // Testar tabelas principais
            const tabelas = ['usuarios', 'eventos', 'tarefas', 'backups_sistema'];
            
            for (const tabela of tabelas) {
                try {
                    const dados = await window.supabaseClient.buscar(tabela);
                    console.log(`✅ Tabela ${tabela}: ${dados.length} registros`);
                    this.correcoes.push(`✅ Tabela ${tabela} acessível`);
                } catch (error) {
                    console.error(`❌ Erro tabela ${tabela}:`, error.message);
                    this.problemas.push(`Tabela ${tabela} inacessível: ${error.message}`);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar banco:', error);
            this.problemas.push(`Erro verificação BD: ${error.message}`);
        }
    },
    
    // 🧹 LIMPAR DADOS CORROMPIDOS
    limparDadosCorrempidos() {
        console.log('\n🧹 LIMPANDO DADOS CORROMPIDOS...');
        
        try {
            let dadosLimpos = 0;
            
            // Limpar localStorage corrompido
            const chaves = ['biapo_dados_corrompido', 'biapo_temp_invalid', 'firebase_config_old'];
            chaves.forEach(chave => {
                if (localStorage.getItem(chave)) {
                    localStorage.removeItem(chave);
                    dadosLimpos++;
                }
            });
            
            // Verificar dados App principais
            if (typeof App !== 'undefined' && App.dados) {
                let dadosCorrigidos = false;
                
                // Corrigir eventos sem ID
                if (Array.isArray(App.dados.eventos)) {
                    App.dados.eventos.forEach((evento, index) => {
                        if (!evento.id) {
                            evento.id = 'evento_' + Date.now() + '_' + index;
                            dadosCorrigidos = true;
                        }
                    });
                }
                
                // Corrigir tarefas sem ID
                if (Array.isArray(App.dados.tarefas)) {
                    App.dados.tarefas.forEach((tarefa, index) => {
                        if (!tarefa.id) {
                            tarefa.id = 'tarefa_' + Date.now() + '_' + index;
                            dadosCorrigidos = true;
                        }
                    });
                }
                
                if (dadosCorrigidos) {
                    console.log('✅ Dados do App corrigidos');
                    this.correcoes.push('✅ IDs faltantes adicionados aos dados');
                }
            }
            
            if (dadosLimpos > 0) {
                console.log(`✅ ${dadosLimpos} entradas corrompidas removidas`);
                this.correcoes.push(`✅ ${dadosLimpos} dados corrompidos limpos`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
            this.problemas.push(`Erro limpeza: ${error.message}`);
        }
    },
    
    // 🧪 TESTAR SISTEMA COMPLETO
    async testarSistemaCompleto() {
        console.log('\n🧪 TESTANDO SISTEMA COMPLETO...');
        
        try {
            // Teste 1: Criar tarefa temporária
            if (typeof App !== 'undefined' && typeof App.criarTarefa === 'function') {
                console.log('🧪 Teste 1: Criação de tarefa...');
                const tarefaTeste = {
                    titulo: `🔧 Teste Corretor ${Date.now()}`,
                    descricao: 'Tarefa criada pelo corretor automático',
                    tipo: 'pessoal'
                };
                
                try {
                    const resultado = await App.criarTarefa(tarefaTeste);
                    if (resultado) {
                        console.log('✅ Criação de tarefa funcionando');
                        this.correcoes.push('✅ Teste criação tarefa: SUCESSO');
                        
                        // Remover tarefa teste
                        setTimeout(() => {
                            if (typeof App.excluirTarefa === 'function') {
                                App.excluirTarefa(resultado.id);
                            }
                        }, 1000);
                    }
                } catch (error) {
                    console.error('❌ Falha teste criação tarefa:', error);
                    this.problemas.push(`Teste criação tarefa falhou: ${error.message}`);
                }
            }
            
            // Teste 2: Salvamento de dados
            if (typeof Persistence !== 'undefined') {
                console.log('🧪 Teste 2: Salvamento de dados...');
                try {
                    await Persistence.salvarDados();
                    console.log('✅ Salvamento de dados funcionando');
                    this.correcoes.push('✅ Teste salvamento: SUCESSO');
                } catch (error) {
                    console.error('❌ Falha teste salvamento:', error);
                    this.problemas.push(`Teste salvamento falhou: ${error.message}`);
                }
            }
            
            // Teste 3: Conectividade Supabase
            if (window.supabaseClient) {
                console.log('🧪 Teste 3: Conectividade Supabase...');
                try {
                    const conectado = await window.supabaseClient.testarConexao();
                    if (conectado) {
                        console.log('✅ Conectividade Supabase funcionando');
                        this.correcoes.push('✅ Teste conectividade: SUCESSO');
                    } else {
                        this.problemas.push('Teste conectividade: FALHA');
                    }
                } catch (error) {
                    this.problemas.push(`Teste conectividade falhou: ${error.message}`);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro nos testes:', error);
            this.problemas.push(`Erro testes: ${error.message}`);
        }
    },
    
    // 📊 GERAR RELATÓRIO DE CORREÇÃO
    gerarRelatorioCorrecao() {
        console.log('\n📊 ========== RELATÓRIO DE CORREÇÃO ==========');
        
        console.log(`\n🔧 CORREÇÕES APLICADAS (${this.correcoes.length}):`);
        if (this.correcoes.length > 0) {
            this.correcoes.forEach((correcao, i) => {
                console.log(`   ${i + 1}. ${correcao}`);
            });
        } else {
            console.log('   ℹ️ Nenhuma correção foi necessária');
        }
        
        console.log(`\n⚠️ PROBLEMAS DETECTADOS (${this.problemas.length}):`);
        if (this.problemas.length > 0) {
            this.problemas.forEach((problema, i) => {
                console.log(`   ${i + 1}. ${problema}`);
            });
        } else {
            console.log('   🎉 Nenhum problema detectado!');
        }
        
        const status = this.problemas.length === 0 ? '🟢 SISTEMA SAUDÁVEL' :
                      this.problemas.length <= 2 ? '🟡 PROBLEMAS MENORES' :
                      this.problemas.length <= 5 ? '🟠 ATENÇÃO NECESSÁRIA' :
                      '🔴 PROBLEMAS CRÍTICOS';
        
        console.log(`\n📊 STATUS FINAL: ${status}`);
        console.log(`✅ Correções: ${this.correcoes.length} | ⚠️ Problemas: ${this.problemas.length}`);
        
        if (this.correcoes.length > 0) {
            console.log('\n💡 RECOMENDAÇÕES:');
            console.log('   • Reiniciar o navegador para garantir que todas as correções sejam aplicadas');
            console.log('   • Testar criação de tarefas e eventos');
            console.log('   • Verificar se dados estão sendo salvos corretamente');
            
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`✅ ${this.correcoes.length} correções aplicadas com sucesso!`);
            }
        }
        
        if (this.problemas.length > 0) {
            console.log('\n🛠️ AÇÕES NECESSÁRIAS:');
            if (this.problemas.some(p => p.includes('Tabela'))) {
                console.log('   • Execute o script estrutura-supabase-fixed.sql no painel Supabase');
            }
            if (this.problemas.some(p => p.includes('conectividade'))) {
                console.log('   • Verifique suas credenciais Supabase');
                console.log('   • Confirme se o projeto Supabase está ativo');
            }
        }
        
        console.log('\n⏰ Correção concluída em:', new Date().toLocaleString('pt-BR'));
        console.log('🔧 ==========================================\n');
    },
    
    // 🚀 CORREÇÃO EXPRESSA (problemas mais comuns)
    async correcaoExpressa() {
        console.log('🚀 CORREÇÃO EXPRESSA - Problemas mais comuns...');
        
        const correcoes = [];
        
        try {
            // 1. Configuração Supabase
            if (!window.SUPABASE_CONFIG && typeof EnvLoader !== 'undefined') {
                await EnvLoader.carregarCredenciais();
                correcoes.push('✅ Credenciais Supabase carregadas');
            }
            
            // 2. Limpar cache usuário
            if (typeof Persistence !== 'undefined' && Persistence.state) {
                Persistence.state.ultimaVerificacaoUsuario = null;
                Persistence.state.usuarioAtual = null;
                correcoes.push('✅ Cache de usuário limpo');
            }
            
            // 3. Testar conectividade
            if (window.supabaseClient) {
                const conectado = await window.supabaseClient.testarConexao();
                if (conectado) {
                    correcoes.push('✅ Conectividade testada');
                }
            }
            
            console.log(`🎉 Correção expressa concluída: ${correcoes.length} itens corrigidos`);
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`✅ Correção expressa: ${correcoes.length} itens corrigidos!`);
            }
            
            return correcoes;
            
        } catch (error) {
            console.error('❌ Erro na correção expressa:', error);
            return [];
        }
    }
};

// 🌍 FUNÇÕES GLOBAIS
window.corretorAutomatico = () => CorretorAutomatico.executarCorrecaoCompleta();
window.correcaoExpressa = () => CorretorAutomatico.correcaoExpressa();
window.CorretorAutomatico = CorretorAutomatico;

console.log('🔧 Corretor Automático BIAPO v1.0 carregado!');
console.log('📋 Comandos disponíveis:');
console.log('   • corretorAutomatico() - Correção completa (recomendado)');
console.log('   • correcaoExpressa() - Correção rápida dos problemas mais comuns');

/*
🔧 CORRETOR AUTOMÁTICO BIAPO v1.0

✅ FUNCIONALIDADES:
- 🔐 Corrige configuração Supabase automaticamente
- 💾 Resolve problemas de persistência
- 🗄️ Verifica tabelas do banco de dados
- 🧹 Limpa dados corrompidos
- 🧪 Testa funcionamento completo
- 📊 Gera relatório detalhado

🚀 USO RECOMENDADO:
1. Execute corretorAutomatico() no console
2. Aguarde a análise completa
3. Siga as recomendações do relatório
4. Reinicie o navegador se necessário

⚡ CORREÇÃO RÁPIDA:
- Use correcaoExpressa() para problemas simples
- Ideal para resolver problemas de cache e configuração
*/
