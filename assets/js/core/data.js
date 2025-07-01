/* ========== 📊 ESTRUTURA DE DADOS v6.2 ========== */

const DataStructure = {
    // ✅ VERSÃO DOS DADOS
    VERSAO_DB: 6,
    
    // ✅ INICIALIZAR ESTRUTURA PADRÃO DE DADOS
    inicializarDados() {
        return {
            versao: this.VERSAO_DB,
            ultimaAtualizacao: new Date().toISOString(),
            ultimoUsuario: null,
            
            // ✅ ÁREAS DE TRABALHO
            areas: {
                documentacao: {
                    nome: "Documentação & Arquivo",
                    coordenador: "Renato Remiro",
                    cor: "#8b5cf6",
                    equipe: [
                        {nome: "Renato", cargo: "Coordenador"},
                        {nome: "Bruna", cargo: "Arquiteta Trainee"},
                        {nome: "Juliana A.", cargo: "Estagiária de Arquitetura"},
                        {nome: "Lara", cargo: "Arquiteta Trainee"}
                    ],
                    atividades: [
                        {
                            id: 1, 
                            nome: "As Built", 
                            status: "verde", 
                            prazo: "2025-07-18", 
                            responsaveis: ["Renato", "Bruna"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 2, 
                            nome: "Relatório Fotográfico", 
                            status: "amarelo", 
                            prazo: "2025-07-12", 
                            responsaveis: ["Bruna"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 3, 
                            nome: "Manual de Conservação", 
                            status: "verde", 
                            prazo: "2025-07-25", 
                            responsaveis: ["Renato"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 4, 
                            nome: "BIM 2D", 
                            status: "verde", 
                            prazo: "2025-07-20", 
                            responsaveis: ["Bruna"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 5, 
                            nome: "BIM", 
                            status: "verde", 
                            prazo: "2025-07-22", 
                            responsaveis: ["Bruna"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 6, 
                            nome: "Databook", 
                            status: "verde", 
                            prazo: "2025-07-18", 
                            responsaveis: ["Juliana A."], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        }
                    ]
                },
                
                planejamento: {
                    nome: "Planejamento & Controle de Obra",
                    coordenador: "Isabella Rocha (Coord. Geral)",
                    cor: "#06b6d4",
                    equipe: [
                        {nome: "Isabella", cargo: "Coordenadora Geral"},
                        {nome: "Lara", cargo: "Arquiteta Trainee"},
                        {nome: "Eduardo", cargo: "Engenheiro Civil"},
                        {nome: "Beto", cargo: "Arquiteto"},
                        {nome: "Jean", cargo: "Estagiário de Eng. Civil"}
                    ],
                    atividades: [
                        {
                            id: 7, 
                            nome: "Cronograma Longo Prazo (CLP)", 
                            status: "verde", 
                            prazo: "2025-07-10", 
                            responsaveis: ["Lara", "Isabella"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 8, 
                            nome: "PPCO", 
                            status: "verde", 
                            prazo: "2025-07-31", 
                            responsaveis: ["Lara", "Isabella"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 9, 
                            nome: "Vínculos Orçamentários", 
                            status: "verde", 
                            prazo: "2025-07-31", 
                            responsaveis: ["Lara", "Isabella"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 10, 
                            nome: "CFF", 
                            status: "amarelo", 
                            prazo: "2025-07-15", 
                            responsaveis: ["Isabella"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 11, 
                            nome: "Previsão Financeira", 
                            status: "verde", 
                            prazo: "2025-07-31", 
                            responsaveis: ["Eduardo", "Isabella"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 12, 
                            nome: "Planilha de Medição", 
                            status: "amarelo", 
                            prazo: "2025-07-12", 
                            responsaveis: ["Lara", "Isabella"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 13, 
                            nome: "CCP", 
                            status: "verde", 
                            prazo: "2025-07-05", 
                            responsaveis: ["Lara", "Beto", "Eduardo"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        }
                    ]
                },
                
                producao: {
                    nome: "Produção & Qualidade",
                    coordenador: "Beto / Eduardo",
                    cor: "#ef4444",
                    equipe: [
                        {nome: "Beto", cargo: "Coordenador Arquiteto"},
                        {nome: "Eduardo", cargo: "Coordenador Eng. Civil"},
                        {nome: "Jean", cargo: "Estagiário de Eng. Civil"},
                        {nome: "Nominato", cargo: "Almoxarifado"},
                        {nome: "Alex", cargo: "Comprador"},
                        {nome: "Manu", cargo: "Assistente de Arquitetura"},
                        {nome: "Marcus", cargo: "Especialista Meio Ambiente"},
                        {nome: "Juliana E.", cargo: "Técnica de Enfermagem"},
                        {nome: "Carlos", cargo: "Técnico de Segurança"}
                    ],
                    atividades: [
                        {
                            id: 14, 
                            nome: "Levantamento de Materiais", 
                            status: "verde", 
                            prazo: "2025-07-05", 
                            responsaveis: ["Jean", "Beto", "Eduardo"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 15, 
                            nome: "Certificação de Estoque", 
                            status: "verde", 
                            prazo: "2025-07-31", 
                            responsaveis: ["Nominato", "Jean", "Eduardo"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 16, 
                            nome: "Controle de Patrimônio", 
                            status: "verde", 
                            prazo: "2025-07-31", 
                            responsaveis: ["Nominato", "Alex"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 17, 
                            nome: "Procedimento SIENGE", 
                            status: "amarelo", 
                            prazo: "2025-07-09", 
                            responsaveis: ["Alex", "Eduardo"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 18, 
                            nome: "Lançamento de Solicitações", 
                            status: "verde", 
                            prazo: "2025-07-01", 
                            responsaveis: ["Nominato", "Alex", "Eduardo"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        },
                        {
                            id: 19, 
                            nome: "Negociações de Compra", 
                            status: "amarelo", 
                            prazo: "2025-07-05", 
                            responsaveis: ["Alex", "Eduardo"], 
                            progresso: 0, 
                            dataAdicionado: new Date().toISOString(), 
                            tarefas: []
                        }
                    ]
                }
            },
            
            // ✅ EVENTOS PRINCIPAIS
            eventos: [
                {
                    id: 1, 
                    titulo: "Reunião semanal de planejamento", 
                    tipo: "reuniao",
                    data: "2025-07-01",
                    horarioInicio: "09:00",
                    horarioFim: "11:00",
                    pessoas: ["Isabella", "Lara", "Eduardo", "Beto", "Renato"],
                    descricao: "Revisão do cronograma e distribuição de tarefas da semana"
                },
                {
                    id: 2, 
                    titulo: "Entrega Relatório Fotográfico", 
                    tipo: "entrega",
                    data: "2025-07-15",
                    horarioInicio: "17:00",
                    pessoas: ["Bruna"],
                    descricao: "Entrega mensal do relatório com registro fotográfico do progresso da obra"
                },
                {
                    id: 3, 
                    titulo: "Revisão As Built", 
                    tipo: "reuniao",
                    data: this.obterDataAmanha(),
                    horarioInicio: "14:00",
                    horarioFim: "16:00",
                    pessoas: ["Renato", "Bruna"],
                    descricao: "Revisão final do As Built antes da entrega"
                }
            ],
            
            // ✅ AGENDAS PESSOAIS
            agendas: {
                "Renato": {
                    "segunda": [
                        {
                            id: Date.now(),
                            titulo: "Verificar projetos",
                            tipo: "reuniao",
                            horarioInicio: "08:00",
                            horarioFim: "09:00",
                            descricao: "Revisão dos projetos em andamento",
                            mostrarNoCalendario: true
                        }
                    ],
                    "sexta": [
                        {
                            id: Date.now() + 4,
                            titulo: "Relatório semanal",
                            tipo: "entrega",
                            horarioInicio: "16:00",
                            horarioFim: "17:00",
                            descricao: "Preparar relatório semanal de progresso",
                            mostrarNoCalendario: false
                        }
                    ]
                },
                "Isabella": {
                    "segunda": [
                        {
                            id: Date.now() + 5,
                            titulo: "Planejamento semanal",
                            tipo: "reuniao",
                            horarioInicio: "07:30",
                            horarioFim: "08:30",
                            descricao: "Planejamento estratégico da semana",
                            mostrarNoCalendario: true
                        }
                    ]
                }
            },
            
            // ✅ FERIADOS E DATAS ESPECIAIS
            feriados: {},
            
            // ✅ STATUS PESSOAL (ausências, home office, etc.)
            statusPessoal: {}
        };
    },

    // ✅ OBTER DATA DE AMANHÃ FORMATADA
    obterDataAmanha() {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        return amanha.toISOString().split('T')[0];
    },

    // ✅ VALIDAR ESTRUTURA DE DADOS
    validarEstrutura(dados) {
        if (!dados) return false;
        
        const camposObrigatorios = ['versao', 'areas', 'eventos', 'agendas'];
        
        for (const campo of camposObrigatorios) {
            if (!dados.hasOwnProperty(campo)) {
                console.error(`Campo obrigatório ausente: ${campo}`);
                return false;
            }
        }
        
        // Validar versão
        if (dados.versao < this.VERSAO_DB) {
            console.warn(`Dados em versão antiga: ${dados.versao}. Atual: ${this.VERSAO_DB}`);
            return this.migrarDados(dados);
        }
        
        return true;
    },

    // ✅ MIGRAR DADOS DE VERSÕES ANTIGAS
    migrarDados(dados) {
        console.log('🔄 Migrando dados para versão', this.VERSAO_DB);
        
        // Migração básica - adicionar campos faltantes
        const dadosNovos = this.inicializarDados();
        
        // Preservar dados existentes
        if (dados.areas) {
            Object.keys(dados.areas).forEach(areaKey => {
                if (dadosNovos.areas[areaKey]) {
                    dadosNovos.areas[areaKey] = {
                        ...dadosNovos.areas[areaKey],
                        ...dados.areas[areaKey]
                    };
                }
            });
        }
        
        if (dados.eventos && Array.isArray(dados.eventos)) {
            dadosNovos.eventos = [...dados.eventos, ...dadosNovos.eventos];
        }
        
        if (dados.agendas) {
            dadosNovos.agendas = { ...dadosNovos.agendas, ...dados.agendas };
        }
        
        if (dados.feriados) {
            dadosNovos.feriados = dados.feriados;
        }
        
        if (dados.statusPessoal) {
            dadosNovos.statusPessoal = dados.statusPessoal;
        }
        
        // Atualizar versão
        dadosNovos.versao = this.VERSAO_DB;
        dadosNovos.ultimaAtualizacao = new Date().toISOString();
        
        console.log('✅ Migração concluída');
        return dadosNovos;
    },

    // ✅ OBTER TODAS AS PESSOAS DO SISTEMA
    obterTodasPessoas(dados) {
        const pessoas = new Set();
        
        if (dados && dados.areas) {
            Object.values(dados.areas).forEach(area => {
                if (area.equipe) {
                    area.equipe.forEach(pessoa => {
                        pessoas.add(pessoa.nome);
                    });
                }
            });
        }
        
        return Array.from(pessoas).sort();
    },

    // ✅ OBTER ATIVIDADES POR STATUS
    obterAtividadesPorStatus(dados, status = null) {
        const atividades = [];
        
        if (dados && dados.areas) {
            Object.values(dados.areas).forEach(area => {
                if (area.atividades) {
                    area.atividades.forEach(atividade => {
                        if (!status || atividade.status === status) {
                            atividades.push({
                                ...atividade,
                                nomeArea: area.nome,
                                corArea: area.cor
                            });
                        }
                    });
                }
            });
        }
        
        return atividades;
    },

    // ✅ OBTER EVENTOS DO MÊS
    obterEventosDoMes(dados, mes, ano) {
        if (!dados || !dados.eventos) return [];
        
        return dados.eventos.filter(evento => {
            const dataEvento = new Date(evento.data + 'T00:00:00');
            return dataEvento.getMonth() === mes && dataEvento.getFullYear() === ano;
        });
    },

    // ✅ CALCULAR ESTATÍSTICAS
    calcularEstatisticas(dados) {
        if (!dados) {
            return { emDia: 0, atencao: 0, atraso: 0, total: 0 };
        }
        
        const todasAtividades = this.obterAtividadesPorStatus(dados);
        
        const stats = {
            emDia: 0,
            atencao: 0,
            atraso: 0,
            total: todasAtividades.length
        };
        
        todasAtividades.forEach(atividade => {
            switch (atividade.status) {
                case 'verde':
                    stats.emDia++;
                    break;
                case 'amarelo':
                    stats.atencao++;
                    break;
                case 'vermelho':
                    stats.atraso++;
                    break;
            }
        });
        
        return stats;
    },

    // ✅ LIMPAR DADOS ANTIGOS (manutenção)
    limparDadosAntigos(dados) {
        if (!dados) return dados;
        
        const agora = new Date();
        const umMesAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Remover eventos muito antigos (mais de 1 mês)
        if (dados.eventos) {
            dados.eventos = dados.eventos.filter(evento => {
                const dataEvento = new Date(evento.data + 'T00:00:00');
                return dataEvento >= umMesAtras;
            });
        }
        
        return dados;
    }
};

console.log('📊 Estrutura de Dados v6.2 carregada!');
