// 🚀 SISTEMA BIAPO v8.13.0 - IMPLEMENTAÇÃO PRÁTICA
// =============================================================================
// PASSO 1: VERIFICAÇÃO E DIAGNÓSTICO INICIAL
// =============================================================================

const BiapoDiagnostico = {
    versao: '8.13.0',
    
    async executarDiagnosticoCompleto() {
        console.log('🔍 ========== DIAGNÓSTICO BIAPO v8.13.0 ==========');
        
        const problemas = [];
        const sucessos = [];
        
        // 1. Verificar módulos carregados
        const modulosEsperados = [
            'App', 'Auth', 'Calendar', 'Events', 'Persistence', 
            'Notifications', 'Helpers', 'firebase'
        ];
        
        console.log('\n📦 VERIFICAÇÃO DE MÓDULOS:');
        modulosEsperados.forEach(modulo => {
            const existe = typeof window[modulo] !== 'undefined';
            console.log(`  ${existe ? '✅' : '❌'} ${modulo}`);
            
            if (existe) {
                sucessos.push(`Módulo ${modulo} carregado`);
            } else {
                problemas.push(`Módulo ${modulo} não encontrado`);
            }
        });
        
        // 2. Verificar versões
        console.log('\n🔢 VERIFICAÇÃO DE VERSÕES:');
        const versoes = {
            'App.js': window.App?.config?.versao,
            'Auth.js': window.Auth?.config?.versao,
            'Calendar.js': window.Calendar?.config?.versao,
            'Events.js': window.Events?.config?.versao
        };
        
        Object.entries(versoes).forEach(([modulo, versao]) => {
            const temVersao = !!versao;
            console.log(`  ${temVersao ? '✅' : '❌'} ${modulo}: ${versao || 'N/A'}`);
            
            if (!temVersao) {
                problemas.push(`${modulo} sem informação de versão`);
            }
        });
        
        // 3. Verificar funcionalidades críticas
        console.log('\n⚙️ VERIFICAÇÃO DE FUNCIONALIDADES:');
        const funcionalidades = [
            { nome: 'App.criarTarefa', test: () => typeof App?.criarTarefa === 'function' },
            { nome: 'App.criarEvento', test: () => typeof App?.criarEvento === 'function' },
            { nome: 'Auth.login', test: () => typeof Auth?.login === 'function' },
            { nome: 'Calendar.renderizar', test: () => typeof Calendar?.renderizarCalendario === 'function' },
            { nome: 'Events.abrirModal', test: () => typeof Events?.abrirModalEdicao === 'function' }
        ];
        
        funcionalidades.forEach(func => {
            const funciona = func.test();
            console.log(`  ${funciona ? '✅' : '❌'} ${func.nome}`);
            
            if (!funciona) {
                problemas.push(`Funcionalidade ${func.nome} não disponível`);
            }
        });
        
        // 4. Verificar estrutura de dados
        console.log('\n📊 VERIFICAÇÃO DE DADOS:');
        const dados = {
            'App.dados.eventos': Array.isArray(App?.dados?.eventos),
            'App.dados.tarefas': Array.isArray(App?.dados?.tarefas),
            'App.dados.usuarios': typeof App?.dados?.usuarios === 'object'
        };
        
        Object.entries(dados).forEach(([estrutura, existe]) => {
            console.log(`  ${existe ? '✅' : '❌'} ${estrutura}`);
            
            if (!existe) {
                problemas.push(`Estrutura ${estrutura} não inicializada`);
            }
        });
        
        // 5. Relatório final
        console.log('\n📋 RELATÓRIO FINAL:');
        console.log(`✅ Sucessos: ${sucessos.length}`);
        console.log(`❌ Problemas: ${problemas.length}`);
        
        if (problemas.length > 0) {
            console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
            problemas.forEach((problema, i) => {
                console.log(`  ${i + 1}. ${problema}`);
            });
        }
        
        return {
            sucessos: sucessos.length,
            problemas: problemas.length,
            detalhes: { sucessos, problemas },
            status: problemas.length === 0 ? 'PERFEITO' : 
                   problemas.length <= 3 ? 'BOM' : 
                   problemas.length <= 6 ? 'REGULAR' : 'CRÍTICO'
        };
    }
};

// =============================================================================
// PASSO 2: CONFIGURAÇÃO SEGURA DO FIREBASE
// =============================================================================

const FirebaseSeguro = {
    
    // Remover configuração insegura e implementar variáveis ambiente
    configurarSeguro() {
        console.log('🔐 Configurando Firebase de forma segura...');
        
        // Verificar se existe configuração exposta
        const configExposta = document.querySelector('script[src*="firebaseConfig.json"]');
        if (configExposta) {
            console.warn('⚠️ ALERTA: firebaseConfig.json ainda sendo carregado!');
            console.log('📝 AÇÃO NECESSÁRIA: Remover arquivo do repositório');
        }
        
        // Implementar carregamento seguro
        const configSegura = this.carregarConfigSegura();
        
        if (configSegura) {
            console.log('✅ Configuração Firebase carregada com segurança');
            return configSegura;
        } else {
            console.error('❌ Falha ao carregar configuração segura');
            return null;
        }
    },
    
    carregarConfigSegura() {
        // Prioridade 1: Variáveis de ambiente
        if (typeof process !== 'undefined' && process.env) {
            const config = {
                apiKey: process.env.FIREBASE_API_KEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                databaseURL: process.env.FIREBASE_DATABASE_URL,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.FIREBASE_APP_ID,
                measurementId: process.env.FIREBASE_MEASUREMENT_ID
            };
            
            if (config.apiKey) {
                return config;
            }
        }
        
        // Prioridade 2: Configuração do servidor
        if (window.BIAPO_CONFIG) {
            return window.BIAPO_CONFIG;
        }
        
        // Fallback: Solicitar configuração
        console.warn('⚠️ Configuração Firebase não encontrada');
        return null;
    }
};

// =============================================================================
// PASSO 3: ESTRUTURA DE DADOS UNIFICADA
// =============================================================================

const EstruturaUnificada = {
    versao: '8.13.0',
    
    // Definir estrutura padrão para TODAS as entidades
    schemas: {
        evento: {
            // Campos obrigatórios
            id: { tipo: 'string', obrigatorio: true },
            titulo: { tipo: 'string', obrigatorio: true },
            data: { tipo: 'date', obrigatorio: true },
            tipo: { tipo: 'enum', valores: ['reuniao', 'entrega', 'prazo', 'marco', 'treinamento', 'outro'] },
            
            // Campos opcionais
            descricao: { tipo: 'string', default: '' },
            horarioInicio: { tipo: 'time', default: null },
            horarioFim: { tipo: 'time', default: null },
            local: { tipo: 'string', default: '' },
            participantes: { tipo: 'array', default: [] },
            responsavel: { tipo: 'email', default: null },
            
            // Metadados
            criadoPor: { tipo: 'email', obrigatorio: true },
            dataCriacao: { tipo: 'datetime', obrigatorio: true },
            ultimaAtualizacao: { tipo: 'datetime', obrigatorio: true },
            _versao: { tipo: 'string', default: '8.13.0' },
            _tipo: { tipo: 'literal', valor: 'evento' }
        },
        
        tarefa: {
            // Campos obrigatórios
            id: { tipo: 'string', obrigatorio: true },
            titulo: { tipo: 'string', obrigatorio: true },
            dataInicio: { tipo: 'date', obrigatorio: true },
            tipo: { tipo: 'enum', valores: ['pessoal', 'equipe', 'projeto', 'urgente', 'rotina'] },
            
            // Campos específicos de tarefa
            prioridade: { tipo: 'enum', valores: ['baixa', 'media', 'alta', 'critica'], default: 'media' },
            status: { tipo: 'enum', valores: ['pendente', 'andamento', 'concluida', 'cancelada'], default: 'pendente' },
            progresso: { tipo: 'number', min: 0, max: 100, default: 0 },
            
            // Campos opcionais (herdam de evento)
            descricao: { tipo: 'string', default: '' },
            horarioInicio: { tipo: 'time', default: null },
            horarioFim: { tipo: 'time', default: null },
            dataFim: { tipo: 'date', default: null },
            participantes: { tipo: 'array', default: [] },
            responsavel: { tipo: 'email', default: null },
            
            // Campos específicos
            aparecerNoCalendario: { tipo: 'boolean', default: false },
            lembretesAtivos: { tipo: 'boolean', default: false },
            subtarefas: { tipo: 'array', default: [] },
            
            // Metadados
            criadoPor: { tipo: 'email', obrigatorio: true },
            dataCriacao: { tipo: 'datetime', obrigatorio: true },
            ultimaAtualizacao: { tipo: 'datetime', obrigatorio: true },
            _versao: { tipo: 'string', default: '8.13.0' },
            _tipo: { tipo: 'literal', valor: 'tarefa' }
        }
    },
    
    // Validar entidade contra schema
    validar(entidade, tipoSchema) {
        const schema = this.schemas[tipoSchema];
        if (!schema) {
            throw new Error(`Schema ${tipoSchema} não encontrado`);
        }
        
        const erros = [];
        
        // Verificar campos obrigatórios
        Object.entries(schema).forEach(([campo, config]) => {
            if (config.obrigatorio && !entidade[campo]) {
                erros.push(`Campo obrigatório '${campo}' não fornecido`);
            }
        });
        
        // Verificar tipos
        Object.entries(entidade).forEach(([campo, valor]) => {
            const config = schema[campo];
            if (config && !this.validarTipo(valor, config)) {
                erros.push(`Campo '${campo}' com tipo inválido`);
            }
        });
        
        return {
            valido: erros.length === 0,
            erros
        };
    },
    
    validarTipo(valor, config) {
        switch (config.tipo) {
            case 'string':
                return typeof valor === 'string';
            case 'number':
                return typeof valor === 'number' && 
                       (!config.min || valor >= config.min) &&
                       (!config.max || valor <= config.max);
            case 'boolean':
                return typeof valor === 'boolean';
            case 'array':
                return Array.isArray(valor);
            case 'date':
                return /^\d{4}-\d{2}-\d{2}$/.test(valor);
            case 'time':
                return !valor || /^\d{2}:\d{2}$/.test(valor);
            case 'email':
                return !valor || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
            case 'enum':
                return config.valores.includes(valor);
            case 'literal':
                return valor === config.valor;
            default:
                return true;
        }
    },
    
    // Normalizar entidade para estrutura padrão
    normalizar(entidade, tipoSchema) {
        const schema = this.schemas[tipoSchema];
        const normalizada = { ...entidade };
        
        // Aplicar valores padrão
        Object.entries(schema).forEach(([campo, config]) => {
            if (config.default !== undefined && normalizada[campo] === undefined) {
                normalizada[campo] = config.default;
            }
        });
        
        // Garantir metadados
        normalizada._versao = '8.13.0';
        normalizada._tipo = tipoSchema;
        
        if (!normalizada.dataCriacao) {
            normalizada.dataCriacao = new Date().toISOString();
        }
        
        normalizada.ultimaAtualizacao = new Date().toISOString();
        
        return normalizada;
    }
};

// =============================================================================
// PASSO 4: API UNIFICADA
// =============================================================================

const ApiUnificada = {
    versao: '8.13.0',
    
    // Ponto único de acesso para TODAS as operações
    async criarEvento(dados) {
        try {
            console.log('📅 Criando evento via API unificada...');
            
            // 1. Validar dados
            const validacao = EstruturaUnificada.validar(dados, 'evento');
            if (!validacao.valido) {
                throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
            }
            
            // 2. Normalizar
            const eventoNormalizado = EstruturaUnificada.normalizar(dados, 'evento');
            
            // 3. Gerar ID único se não fornecido
            if (!eventoNormalizado.id) {
                eventoNormalizado.id = 'evento_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            
            // 4. Definir responsável
            if (!eventoNormalizado.criadoPor) {
                eventoNormalizado.criadoPor = this.obterUsuarioAtual();
            }
            
            // 5. Criar via App.js
            const evento = await App.criarEvento(eventoNormalizado);
            
            // 6. Notificar módulos
            this.notificarCriacao('evento', evento);
            
            console.log('✅ Evento criado com sucesso:', evento.titulo);
            return evento;
            
        } catch (error) {
            console.error('❌ Erro ao criar evento:', error);
            throw error;
        }
    },
    
    async criarTarefa(dados) {
        try {
            console.log('📋 Criando tarefa via API unificada...');
            
            // 1. Validar dados
            const validacao = EstruturaUnificada.validar(dados, 'tarefa');
            if (!validacao.valido) {
                throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
            }
            
            // 2. Normalizar
            const tarefaNormalizada = EstruturaUnificada.normalizar(dados, 'tarefa');
            
            // 3. Gerar ID único se não fornecido
            if (!tarefaNormalizada.id) {
                tarefaNormalizada.id = 'tarefa_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            
            // 4. Definir responsável
            if (!tarefaNormalizada.criadoPor) {
                tarefaNormalizada.criadoPor = this.obterUsuarioAtual();
            }
            
            // 5. Criar via App.js
            const tarefa = await App.criarTarefa(tarefaNormalizada);
            
            // 6. Notificar módulos
            this.notificarCriacao('tarefa', tarefa);
            
            console.log('✅ Tarefa criada com sucesso:', tarefa.titulo);
            return tarefa;
            
        } catch (error) {
            console.error('❌ Erro ao criar tarefa:', error);
            throw error;
        }
    },
    
    obterUsuarioAtual() {
        if (Auth?.obterUsuario) {
            const usuario = Auth.obterUsuario();
            return usuario?.email || 'sistema@biapo.com';
        }
        return 'sistema@biapo.com';
    },
    
    notificarCriacao(tipo, item) {
        // Notificar Calendar para atualizar
        if (typeof Calendar?.atualizarEventos === 'function') {
            Calendar.atualizarEventos();
        }
        
        // Disparar evento customizado
        document.dispatchEvent(new CustomEvent(`biapo:${tipo}-criado`, {
            detail: item
        }));
    }
};

// =============================================================================
// PASSO 5: SISTEMA DE MIGRAÇÃO
// =============================================================================

const SistemaMigracao = {
    versao: '8.13.0',
    
    async migrarTodosSistema() {
        console.log('🔄 Iniciando migração completa para v8.13.0...');
        
        const resultados = {
            eventos: { migrados: 0, erros: 0 },
            tarefas: { migrados: 0, erros: 0 }
        };
        
        try {
            // Migrar eventos
            if (App?.dados?.eventos) {
                for (const evento of App.dados.eventos) {
                    try {
                        const eventoMigrado = this.migrarEvento(evento);
                        Object.assign(evento, eventoMigrado);
                        resultados.eventos.migrados++;
                    } catch (error) {
                        console.error('❌ Erro ao migrar evento:', error);
                        resultados.eventos.erros++;
                    }
                }
            }
            
            // Migrar tarefas
            if (App?.dados?.tarefas) {
                for (const tarefa of App.dados.tarefas) {
                    try {
                        const tarefaMigrada = this.migrarTarefa(tarefa);
                        Object.assign(tarefa, tarefaMigrada);
                        resultados.tarefas.migrados++;
                    } catch (error) {
                        console.error('❌ Erro ao migrar tarefa:', error);
                        resultados.tarefas.erros++;
                    }
                }
            }
            
            // Salvar mudanças
            if (typeof App?._salvarDadosUnificados === 'function') {
                await App._salvarDadosUnificados();
            }
            
            console.log('✅ Migração concluída:', resultados);
            return resultados;
            
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            throw error;
        }
    },
    
    migrarEvento(evento) {
        const migrado = { ...evento };
        
        // Migrar campos antigos
        if (evento.horario && !migrado.horarioInicio) {
            migrado.horarioInicio = evento.horario;
        }
        
        if (evento.pessoas && !migrado.participantes) {
            migrado.participantes = evento.pessoas;
        }
        
        // Normalizar com nova estrutura
        return EstruturaUnificada.normalizar(migrado, 'evento');
    },
    
    migrarTarefa(tarefa) {
        const migrada = { ...tarefa };
        
        // Migrar campos antigos
        if (tarefa.data && !migrada.dataInicio) {
            migrada.dataInicio = tarefa.data;
        }
        
        if (tarefa.horario && !migrada.horarioInicio) {
            migrada.horarioInicio = tarefa.horario;
        }
        
        // Normalizar com nova estrutura
        return EstruturaUnificada.normalizar(migrada, 'tarefa');
    }
};

// =============================================================================
// INICIALIZAÇÃO E COMANDOS GLOBAIS
// =============================================================================

// Expor API globalmente
window.BIAPO = {
    // Diagnóstico
    diagnostico: () => BiapoDiagnostico.executarDiagnosticoCompleto(),
    
    // Configuração
    configurarFirebase: () => FirebaseSeguro.configurarSeguro(),
    
    // CRUD Unificado
    criarEvento: (dados) => ApiUnificada.criarEvento(dados),
    criarTarefa: (dados) => ApiUnificada.criarTarefa(dados),
    
    // Migração
    migrar: () => SistemaMigracao.migrarTodosSistema(),
    
    // Utilitários
    validar: (entidade, tipo) => EstruturaUnificada.validar(entidade, tipo),
    normalizar: (entidade, tipo) => EstruturaUnificada.normalizar(entidade, tipo)
};

// Auto-executar diagnóstico quando carregado
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🚀 Sistema BIAPO v8.13.0 inicializado');
        BIAPO.diagnostico();
    }, 2000);
});

console.log('✅ Implementação prática BIAPO v8.13.0 carregada!');
console.log('📋 Comandos disponíveis:');
console.log('  • BIAPO.diagnostico() - Verificar sistema');
console.log('  • BIAPO.migrar() - Migrar dados para v8.13.0');
console.log('  • BIAPO.criarEvento(dados) - Criar evento');
console.log('  • BIAPO.criarTarefa(dados) - Criar tarefa'); 