// 🔄 MÓDULO DE MIGRAÇÃO FIREBASE → SUPABASE
// Arquivo: assets/js/utils/migration-supabase.js
// Data: 2025-07-16

class MigracaoSupabase {
    constructor() {
        this.firebaseData = null;
        this.supabaseClient = null;
        this.logMigracao = [];
        this.status = 'aguardando';
        
        console.log('🔄 Módulo de Migração Supabase carregado');
    }

    // 📊 INICIALIZAR MIGRAÇÃO
    async inicializar() {
        try {
            console.log('🚀 Inicializando migração Firebase → Supabase...');
            this.status = 'inicializando';

            // Verificar se Supabase está disponível
            if (!window.supabaseClient) {
                throw new Error('Supabase client não encontrado');
            }
            this.supabaseClient = window.supabaseClient;

            // Testar conexão Supabase
            const conectado = await this.supabaseClient.testarConexao();
            if (!conectado) {
                throw new Error('Falha na conexão com Supabase');
            }

            this.log('✅ Migração inicializada com sucesso');
            this.status = 'pronto';
            return true;

        } catch (error) {
            this.log(`❌ Erro na inicialização: ${error.message}`);
            this.status = 'erro';
            return false;
        }
    }

    // 🛡️ BACKUP COMPLETO FIREBASE
    async backupFirebase() {
        try {
            console.log('🛡️ Iniciando backup completo do Firebase...');
            this.status = 'backup';

            const backup = {
                timestamp: Date.now(),
                data: new Date().toISOString(),
                versao: '8.13.0',
                dados: {}
            };

            // Aguardar Firebase estar pronto
            if (window.firebaseInitPromise) {
                await window.firebaseInitPromise;
            }

            if (!window.database) {
                throw new Error('Firebase não inicializado');
            }

            // Backup dos dados principais
            const tabelas = [
                'usuarios', 
                'eventos', 
                'tarefas', 
                'participantes',
                'configuracoes'
            ];

            for (const tabela of tabelas) {
                try {
                    const snapshot = await window.database.ref(tabela).once('value');
                    backup.dados[tabela] = snapshot.val() || {};
                    this.log(`📥 Backup ${tabela}: ${Object.keys(backup.dados[tabela]).length} registros`);
                } catch (error) {
                    this.log(`⚠️ Erro no backup ${tabela}: ${error.message}`);
                    backup.dados[tabela] = {};
                }
            }

            // Salvar backup local
            localStorage.setItem('backup_firebase_migration', JSON.stringify(backup));
            
            this.firebaseData = backup;
            this.log('✅ Backup Firebase completo realizado');
            
            // Download do backup
            this.downloadBackup(backup);
            
            return backup;

        } catch (error) {
            this.log(`❌ Erro no backup Firebase: ${error.message}`);
            throw error;
        }
    }

    // 💾 DOWNLOAD BACKUP
    downloadBackup(backup) {
        try {
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `backup-firebase-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.log('💾 Backup baixado com sucesso');
        } catch (error) {
            this.log(`⚠️ Erro no download: ${error.message}`);
        }
    }

    // 🔄 MIGRAR USUÁRIOS
    async migrarUsuarios() {
        try {
            this.log('👥 Migrando usuários...');
            
            if (!this.firebaseData?.dados?.usuarios) {
                this.log('⚠️ Nenhum usuário encontrado no Firebase');
                return { sucesso: 0, erro: 0 };
            }

            const usuarios = this.firebaseData.dados.usuarios;
            let sucesso = 0, erro = 0;

            for (const [id, usuario] of Object.entries(usuarios)) {
                try {
                    if (!usuario.email) {
                        this.log(`⚠️ Usuário ${id} sem email - ignorado`);
                        continue;
                    }

                    const usuarioSupabase = {
                        email: usuario.email,
                        nome: usuario.nome || usuario.email.split('@')[0],
                        perfil: usuario.perfil || 'usuario',
                        admin: usuario.admin || false,
                        ativo: usuario.ativo !== false
                    };

                    await this.supabaseClient.upsert('usuarios', usuarioSupabase);
                    sucesso++;
                    this.log(`✅ Usuário migrado: ${usuario.email}`);

                } catch (error) {
                    erro++;
                    this.log(`❌ Erro usuário ${usuario.email}: ${error.message}`);
                }
            }

            this.log(`👥 Usuários: ${sucesso} sucessos, ${erro} erros`);
            return { sucesso, erro };

        } catch (error) {
            this.log(`❌ Erro na migração de usuários: ${error.message}`);
            throw error;
        }
    }

    // 📅 MIGRAR EVENTOS
    async migrarEventos() {
        try {
            this.log('📅 Migrando eventos...');
            
            if (!this.firebaseData?.dados?.eventos) {
                this.log('⚠️ Nenhum evento encontrado no Firebase');
                return { sucesso: 0, erro: 0 };
            }

            const eventos = this.firebaseData.dados.eventos;
            let sucesso = 0, erro = 0;

            // Buscar usuários do Supabase para mapping
            const usuariosSupabase = await this.supabaseClient.buscar('usuarios');
            const emailToId = {};
            usuariosSupabase.forEach(u => emailToId[u.email] = u.id);

            for (const [id, evento] of Object.entries(eventos)) {
                try {
                    if (!evento.titulo) {
                        this.log(`⚠️ Evento ${id} sem título - ignorado`);
                        continue;
                    }

                    const eventoSupabase = {
                        titulo: evento.titulo,
                        descricao: evento.descricao || null,
                        data: this.formatarData(evento.data),
                        hora_inicio: evento.horaInicio || evento.hora_inicio || null,
                        hora_fim: evento.horaFim || evento.hora_fim || null,
                        local: evento.local || null,
                        categoria: evento.categoria || 'geral',
                        prioridade: evento.prioridade || 'media',
                        status: evento.status || 'agendado',
                        visibilidade: evento.visibilidade || 'publica',
                        cor: evento.cor || 'blue',
                        criado_por: emailToId[evento.criadoPor] || null,
                        responsavel: emailToId[evento.responsavel] || null,
                        observacoes: evento.observacoes || null
                    };

                    await this.supabaseClient.inserir('eventos', eventoSupabase);
                    sucesso++;
                    this.log(`✅ Evento migrado: ${evento.titulo}`);

                } catch (error) {
                    erro++;
                    this.log(`❌ Erro evento ${evento.titulo}: ${error.message}`);
                }
            }

            this.log(`📅 Eventos: ${sucesso} sucessos, ${erro} erros`);
            return { sucesso, erro };

        } catch (error) {
            this.log(`❌ Erro na migração de eventos: ${error.message}`);
            throw error;
        }
    }

    // 📋 MIGRAR TAREFAS
    async migrarTarefas() {
        try {
            this.log('📋 Migrando tarefas...');
            
            if (!this.firebaseData?.dados?.tarefas) {
                this.log('⚠️ Nenhuma tarefa encontrada no Firebase');
                return { sucesso: 0, erro: 0 };
            }

            const tarefas = this.firebaseData.dados.tarefas;
            let sucesso = 0, erro = 0;

            // Buscar usuários do Supabase para mapping
            const usuariosSupabase = await this.supabaseClient.buscar('usuarios');
            const emailToId = {};
            usuariosSupabase.forEach(u => emailToId[u.email] = u.id);

            for (const [id, tarefa] of Object.entries(tarefas)) {
                try {
                    if (!tarefa.titulo) {
                        this.log(`⚠️ Tarefa ${id} sem título - ignorada`);
                        continue;
                    }

                    const tarefaSupabase = {
                        titulo: tarefa.titulo,
                        descricao: tarefa.descricao || null,
                        data_inicio: this.formatarData(tarefa.dataInicio || tarefa.data_inicio),
                        data_fim: this.formatarData(tarefa.dataFim || tarefa.data_fim),
                        categoria: tarefa.categoria || 'geral',
                        prioridade: tarefa.prioridade || 'media',
                        status: tarefa.status || 'pendente',
                        progresso: tarefa.progresso || 0,
                        tipo: tarefa.tipo || 'tarefa',
                        criado_por: emailToId[tarefa.criadoPor] || null,
                        responsavel: emailToId[tarefa.responsavel] || null,
                        observacoes: tarefa.observacoes || null
                    };

                    await this.supabaseClient.inserir('tarefas', tarefaSupabase);
                    sucesso++;
                    this.log(`✅ Tarefa migrada: ${tarefa.titulo}`);

                } catch (error) {
                    erro++;
                    this.log(`❌ Erro tarefa ${tarefa.titulo}: ${error.message}`);
                }
            }

            this.log(`📋 Tarefas: ${sucesso} sucessos, ${erro} erros`);
            return { sucesso, erro };

        } catch (error) {
            this.log(`❌ Erro na migração de tarefas: ${error.message}`);
            throw error;
        }
    }

    // 🔄 MIGRAÇÃO COMPLETA
    async executarMigracaoCompleta() {
        try {
            console.log('🚀 INICIANDO MIGRAÇÃO COMPLETA FIREBASE → SUPABASE');
            this.status = 'migrando';
            this.logMigracao = [];

            // 1. Inicializar
            const inicializado = await this.inicializar();
            if (!inicializado) {
                throw new Error('Falha na inicialização');
            }

            // 2. Backup Firebase
            await this.backupFirebase();

            // 3. Migrar dados
            const resultadoUsuarios = await this.migrarUsuarios();
            const resultadoEventos = await this.migrarEventos();
            const resultadoTarefas = await this.migrarTarefas();

            // 4. Resumo
            const resumo = {
                usuarios: resultadoUsuarios,
                eventos: resultadoEventos,
                tarefas: resultadoTarefas,
                totalSucesso: resultadoUsuarios.sucesso + resultadoEventos.sucesso + resultadoTarefas.sucesso,
                totalErro: resultadoUsuarios.erro + resultadoEventos.erro + resultadoTarefas.erro
            };

            this.log('🎉 MIGRAÇÃO COMPLETA FINALIZADA!');
            this.log(`📊 RESUMO: ${resumo.totalSucesso} sucessos, ${resumo.totalErro} erros`);
            
            this.status = 'concluido';
            
            // Salvar log da migração
            localStorage.setItem('log_migracao_supabase', JSON.stringify(this.logMigracao));
            
            return resumo;

        } catch (error) {
            this.log(`❌ ERRO NA MIGRAÇÃO: ${error.message}`);
            this.status = 'erro';
            throw error;
        }
    }

    // 📊 VALIDAR MIGRAÇÃO
    async validarMigracao() {
        try {
            this.log('🔍 Validando migração...');

            const stats = await this.supabaseClient.obterEstatisticas();
            
            this.log(`📊 DADOS MIGRADOS:`);
            this.log(`👥 Usuários: ${stats.usuarios}`);
            this.log(`📅 Eventos: ${stats.eventos}`);
            this.log(`📋 Tarefas: ${stats.tarefas}`);

            return stats;

        } catch (error) {
            this.log(`❌ Erro na validação: ${error.message}`);
            throw error;
        }
    }

    // 🛠️ MÉTODOS AUXILIARES
    formatarData(data) {
        if (!data) return null;
        
        // Se já está no formato YYYY-MM-DD
        if (typeof data === 'string' && data.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return data;
        }

        // Converter outros formatos
        try {
            const date = new Date(data);
            return date.toISOString().split('T')[0];
        } catch {
            return null;
        }
    }

    log(mensagem) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${mensagem}`;
        this.logMigracao.push(logEntry);
        console.log(logEntry);
    }

    // 📋 RELATÓRIO COMPLETO
    gerarRelatorio() {
        return {
            status: this.status,
            log: this.logMigracao,
            timestamp: Date.now()
        };
    }
}

// 🚀 INICIALIZAÇÃO
const migracaoSupabase = new MigracaoSupabase();

// Expor globalmente
window.migracaoSupabase = migracaoSupabase;
window.MigracaoSupabase = MigracaoSupabase;

// 🧪 FUNÇÕES DE TESTE E EXECUÇÃO
window.executarMigracaoCompleta = () => migracaoSupabase.executarMigracaoCompleta();
window.backupFirebase = () => migracaoSupabase.backupFirebase();
window.validarMigracaoSupabase = () => migracaoSupabase.validarMigracao();
window.statusMigracao = () => migracaoSupabase.gerarRelatorio();

console.log('🔄 Módulo Migração Supabase v1.0 carregado!');
console.log('🚀 Comandos:');
console.log('   executarMigracaoCompleta() - Migração completa');
console.log('   backupFirebase() - Apenas backup');
console.log('   validarMigracaoSupabase() - Validar dados');
console.log('   statusMigracao() - Ver relatório');

/*
🎯 COMO USAR:

1. Carregar este módulo na página
2. Executar: executarMigracaoCompleta()
3. Aguardar conclusão
4. Validar: validarMigracaoSupabase()
5. Ver relatório: statusMigracao()

O backup será baixado automaticamente!
*/