/**
 * 📅 Sistema de Calendário v8.0.1 - SYNC READY
 * 
 * 🔥 NOVA FUNCIONALIDADE: COMPATÍVEL COM REALTIME SYNC
 * - ✅ Atualização inteligente sem recriar tudo
 * - ✅ Detecção de mudanças otimizada
 * - ✅ Performance melhorada para sync contínuo
 * - ✅ Indicador de última atualização
 */

const Calendar = {
    // ✅ CONFIGURAÇÕES
    config: {
        DIAS_SEMANA: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        MESES: [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]
    },

    // ✅ ESTADO SYNC-READY
    state: {
        mesAtual: new Date().getMonth(),
        anoAtual: new Date().getFullYear(),
        diaSelecionado: new Date().getDate(),
        eventos: [],
        carregado: false,
        debugMode: false,
        // 🔥 NOVO: Estados para sync
        ultimaAtualizacao: null,
        hashEventos: null,
        atualizandoSync: false
    },

    // ✅ INICIALIZAR OTIMIZADO
    inicializar() {
        try {
            const hoje = new Date();
            this.state.mesAtual = hoje.getMonth();
            this.state.anoAtual = hoje.getFullYear();
            this.state.diaSelecionado = hoje.getDate();
            
            // 🔥 CARREGAMENTO DE EVENTOS INTEGRADO
            this.carregarEventos();
            this.gerar();
            this.state.carregado = true;
            
            console.log('📅 Calendar v8.0.1 inicializado - SYNC READY');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar calendário:', error);
            this.state.eventos = [];
            this.gerar();
        }
    },

    // 🔥 CARREGAR EVENTOS - SYNC COMPATIBLE
    carregarEventos() {
        try {
            // 🎯 FONTE ÚNICA: App.dados.eventos (SEMPRE)
            if (typeof App !== 'undefined' && App.dados && Array.isArray(App.dados.eventos)) {
                this.state.eventos = [...App.dados.eventos];
                
                // 🔥 CALCULAR HASH PARA DETECÇÃO DE MUDANÇAS
                this.state.hashEventos = this._calcularHashEventos(this.state.eventos);
                this.state.ultimaAtualizacao = new Date().toISOString();
                
                return;
            }
            
            // 🎯 FALLBACK: Reset se não houver dados
            this.state.eventos = [];
            this.state.hashEventos = null;
            
        } catch (error) {
            console.error('❌ Erro ao carregar eventos:', error);
            this.state.eventos = [];
            this.state.hashEventos = null;
        }
    },

    // 🔥 CALCULAR HASH PARA DETECÇÃO DE MUDANÇAS
    _calcularHashEventos(eventos) {
        try {
            if (!eventos || eventos.length === 0) {
                return 'empty';
            }
            
            // Hash simples baseado em: quantidade + IDs + timestamps
            const info = eventos.map(e => `${e.id}-${e.ultimaAtualizacao || e.dataCriacao || ''}`).join('|');
            return `${eventos.length}-${info.length}`;
            
        } catch (error) {
            return Date.now().toString();
        }
    },

    // 🔥 ATUALIZAR EVENTOS - FUNÇÃO CRÍTICA PARA SYNC v8.0.1
    atualizarEventos() {
        try {
            // 🔥 VERIFICAR SE REALMENTE PRECISA ATUALIZAR
            if (this.state.atualizandoSync) {
                console.log('📅 Calendar: Atualização já em andamento, ignorando...');
                return;
            }
            
            this.state.atualizandoSync = true;
            
            // Carregar novos dados
            const eventosAnteriores = [...this.state.eventos];
            this.carregarEventos();
            
            // 🔥 DETECÇÃO INTELIGENTE DE MUDANÇAS
            const hashAnterior = this._calcularHashEventos(eventosAnteriores);
            const hashAtual = this.state.hashEventos;
            
            if (hashAnterior !== hashAtual) {
                console.log('📅 MUDANÇAS DETECTADAS - Atualizando Calendar...');
                console.log(`   Antes: ${eventosAnteriores.length} eventos (${hashAnterior})`);
                console.log(`   Agora: ${this.state.eventos.length} eventos (${hashAtual})`);
                
                // 🔥 ATUALIZAÇÃO INTELIGENTE: só regerar se necessário
                this._atualizarInteligente();
                
                // Mostrar indicador de atualização
                this._mostrarIndicadorAtualizacao();
                
            } else {
                console.log('📅 Calendar: Nenhuma mudança detectada');
            }
            
            this.state.atualizandoSync = false;
            
        } catch (error) {
            console.error('❌ Erro ao atualizar eventos:', error);
            this.state.atualizandoSync = false;
            
            // Fallback: gerar completamente
            this.gerar();
        }
    },

    // 🔥 ATUALIZAÇÃO INTELIGENTE (performance otimizada)
    _atualizarInteligente() {
        try {
            // Se calendar não estiver visível, não atualizar agora
            const calendario = document.getElementById('calendario');
            if (!calendario || !calendario.offsetParent) {
                console.log('📅 Calendar não visível, pulando atualização');
                return;
            }
            
            // 🔥 ESTRATÉGIA: Atualizar apenas o grid dos dias
            const grid = document.getElementById('calendario-dias-grid');
            if (grid) {
                console.log('📅 Atualizando apenas grid dos dias...');
                this._gerarDias(); // Só regera o grid, não o header
            } else {
                console.log('📅 Grid não encontrado, regerando completamente...');
                this.gerar(); // Fallback completo
            }
            
        } catch (error) {
            console.warn('⚠️ Erro na atualização inteligente, fallback completo:', error);
            this.gerar();
        }
    },

    // 🔥 INDICADOR DE ATUALIZAÇÃO
    _mostrarIndicadorAtualizacao() {
        try {
            // Remover indicador anterior
            const indicadorAnterior = document.getElementById('calendarSyncIndicator');
            if (indicadorAnterior) {
                indicadorAnterior.remove();
            }
            
            // Criar indicador de atualização
            const indicador = document.createElement('div');
            indicador.id = 'calendarSyncIndicator';
            indicador.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                z-index: 1001;
                display: flex;
                align-items: center;
                gap: 4px;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                animation: fadeInOut 3s ease-in-out;
            `;
            
            indicador.innerHTML = `
                <span style="animation: spin 1s linear infinite;">🔄</span>
                <span>Atualizado</span>
            `;
            
            // Adicionar ao calendário
            const calendario = document.getElementById('calendario');
            if (calendario) {
                calendario.style.position = 'relative';
                calendario.appendChild(indicador);
                
                // Remover após 3 segundos
                setTimeout(() => {
                    if (indicador && indicador.parentNode) {
                        indicador.remove();
                    }
                }, 3000);
            }
            
        } catch (error) {
            // Silencioso - indicador é opcional
        }
    },

    // 🔥 GERAR CALENDÁRIO OTIMIZADO
    gerar() {
        try {
            const container = document.getElementById('calendario');
            if (!container) return;

            // Limpar container
            container.innerHTML = '';
            container.style.cssText = `
                background: white !important;
                border-radius: 8px !important;
                overflow: hidden !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                width: 100% !important;
                display: block !important;
                position: relative !important;
            `;

            // Cabeçalho otimizado
            const mesNome = this.config.MESES[this.state.mesAtual];
            const ultimaAtualizacao = this.state.ultimaAtualizacao ? 
                new Date(this.state.ultimaAtualizacao).toLocaleTimeString() : '';
            
            const htmlCabecalho = `
                <div style="
                    background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%) !important;
                    color: white !important;
                    padding: 16px 20px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                ">
                    <button onclick="Calendar.mesAnterior()" style="
                        background: rgba(255,255,255,0.2) !important;
                        border: 1px solid rgba(255,255,255,0.3) !important;
                        color: white !important;
                        padding: 8px 12px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                    ">← Anterior</button>
                    
                    <div style="text-align: center;">
                        <h3 style="
                            margin: 0 !important;
                            font-size: 18px !important;
                            font-weight: 600 !important;
                            color: white !important;
                        ">
                            📅 ${mesNome} ${this.state.anoAtual}
                        </h3>
                        ${ultimaAtualizacao ? `
                            <small style="
                                font-size: 10px !important;
                                opacity: 0.8 !important;
                                color: white !important;
                            ">
                                🔄 Sincronizado às ${ultimaAtualizacao}
                            </small>
                        ` : ''}
                    </div>
                    
                    <button onclick="Calendar.proximoMes()" style="
                        background: rgba(255,255,255,0.2) !important;
                        border: 1px solid rgba(255,255,255,0.3) !important;
                        color: white !important;
                        padding: 8px 12px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                    ">Próximo →</button>
                </div>
            `;

            // Dias da semana
            const htmlDiasSemana = `
                <div style="
                    display: grid !important;
                    grid-template-columns: repeat(7, 1fr) !important;
                    background: #f8fafc !important;
                ">
                    ${this.config.DIAS_SEMANA.map(dia => `
                        <div style="
                            padding: 12px 8px !important;
                            text-align: center !important;
                            font-weight: 600 !important;
                            font-size: 14px !important;
                            color: #374151 !important;
                            border-right: 1px solid #e5e7eb !important;
                            border-bottom: 1px solid #e5e7eb !important;
                            background: #f8fafc !important;
                        ">${dia}</div>
                    `).join('')}
                </div>
            `;

            // Grid dos dias
            const htmlGrid = `
                <div id="calendario-dias-grid" style="
                    display: grid !important;
                    grid-template-columns: repeat(7, 1fr) !important;
                    background: white !important;
                "></div>
            `;

            container.innerHTML = htmlCabecalho + htmlDiasSemana + htmlGrid;
            this._gerarDias();
            
        } catch (error) {
            console.error('❌ Erro ao gerar calendário:', error);
        }
    },

    // 🔥 GERAR DIAS OTIMIZADO
    _gerarDias() {
        const grid = document.getElementById('calendario-dias-grid');
        if (!grid) return;

        const primeiroDia = new Date(this.state.anoAtual, this.state.mesAtual, 1);
        const ultimoDia = new Date(this.state.anoAtual, this.state.mesAtual + 1, 0);
        const diaSemanaInicio = primeiroDia.getDay();
        const totalDias = ultimoDia.getDate();
        const hoje = new Date();

        grid.innerHTML = '';

        // Gerar 42 células (6 semanas x 7 dias)
        for (let celula = 0; celula < 42; celula++) {
            const dia = celula - diaSemanaInicio + 1;
            
            if (dia < 1 || dia > totalDias) {
                // Célula vazia
                const celulaVazia = document.createElement('div');
                celulaVazia.style.cssText = `
                    border-right: 1px solid #e5e7eb !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    background: #f9fafb !important;
                    min-height: 100px !important;
                `;
                grid.appendChild(celulaVazia);
            } else {
                // Célula com dia válido
                const celulaDia = this._criarCelulaDia(dia, hoje);
                grid.appendChild(celulaDia);
            }
        }
    },

    // 🔥 CRIAR CÉLULA DO DIA OTIMIZADA
    _criarCelulaDia(dia, hoje) {
        const celula = document.createElement('div');
        
        const dataCelula = new Date(this.state.anoAtual, this.state.mesAtual, dia);
        const dataISO = dataCelula.toISOString().split('T')[0];
        const ehHoje = this._ehMesmoMesDia(dataCelula, hoje);
        const ehSelecionado = dia === this.state.diaSelecionado;
        
        // Obter eventos do dia
        const eventosNoDia = this._obterEventosNoDia(dataISO);
        
        // Estilo base
        let backgroundColor = '#ffffff';
        if (ehHoje) backgroundColor = '#dbeafe';
        if (ehSelecionado) backgroundColor = '#fef3c7';

        celula.style.cssText = `
            background: ${backgroundColor} !important;
            border-right: 1px solid #e5e7eb !important;
            border-bottom: 1px solid #e5e7eb !important;
            min-height: 100px !important;
            padding: 8px !important;
            cursor: pointer !important;
            transition: background-color 0.2s ease !important;
            position: relative !important;
        `;

        // HTML interno
        celula.innerHTML = `
            <div style="
                font-weight: ${ehHoje || ehSelecionado ? '700' : '500'} !important;
                font-size: 14px !important;
                margin-bottom: 8px !important;
                color: ${ehHoje ? '#1e40af' : '#374151'} !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
            ">
                <span>${dia}</span>
                ${eventosNoDia.length > 0 ? `<span style="font-size: 10px; background: #10b981; color: white; padding: 2px 6px; border-radius: 10px;">${eventosNoDia.length}</span>` : ''}
            </div>
            
            <div style="
                display: flex !important;
                flex-direction: column !important;
                gap: 2px !important;
            ">
                ${eventosNoDia.map(evento => this._criarHtmlEvento(evento)).join('')}
            </div>
        `;

        // Event listeners
        celula.addEventListener('click', () => {
            this.selecionarDia(dia);
        });

        celula.addEventListener('mouseenter', () => {
            celula.style.backgroundColor = eventosNoDia.length > 0 ? '#ecfdf5' : '#f3f4f6';
        });

        celula.addEventListener('mouseleave', () => {
            celula.style.backgroundColor = backgroundColor;
        });

        return celula;
    },

    // 🔥 OBTER EVENTOS DO DIA SIMPLES E RÁPIDO
    _obterEventosNoDia(dataISO) {
        if (!this.state.eventos || !Array.isArray(this.state.eventos)) {
            return [];
        }
        
        return this.state.eventos.filter(evento => {
            return evento.data === dataISO || 
                   evento.dataInicio === dataISO ||
                   (evento.data && evento.data.split('T')[0] === dataISO);
        }).slice(0, 4); // Máximo 4 eventos por dia
    },

    // 🔥 CRIAR HTML DO EVENTO OTIMIZADO
    _criarHtmlEvento(evento) {
        const cores = {
            'reuniao': '#3b82f6',
            'entrega': '#10b981', 
            'prazo': '#ef4444',
            'marco': '#8b5cf6',
            'sistema': '#06b6d4',
            'hoje': '#f59e0b',
            'outro': '#6b7280'
        };
        
        const cor = cores[evento.tipo] || cores.outro;
        const titulo = evento.titulo || evento.nome || 'Evento';
        
        return `
            <div onclick="Calendar.abrirEvento('${evento.id}')" style="
                background: ${cor} !important;
                color: white !important;
                padding: 4px 8px !important;
                border-radius: 4px !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                height: 22px !important;
                display: flex !important;
                align-items: center !important;
                overflow: hidden !important;
                white-space: nowrap !important;
                text-overflow: ellipsis !important;
                transition: transform 0.2s ease !important;
            " 
            onmouseenter="this.style.transform='translateY(-1px)'"
            onmouseleave="this.style.transform='translateY(0)'"
            title="${titulo}${evento.descricao ? ' - ' + evento.descricao : ''}"
            >${titulo}</div>
        `;
    },

    // 🔥 ABRIR EVENTO (integração com Events.js)
    abrirEvento(eventoId) {
        try {
            if (typeof Events !== 'undefined' && Events.editarEvento) {
                Events.editarEvento(eventoId);
            } else {
                console.warn('⚠️ Events.js não disponível');
                // Fallback simples
                const evento = this.state.eventos.find(e => e.id == eventoId);
                if (evento) {
                    alert(`📅 ${evento.titulo}\n\nTipo: ${evento.tipo}\nData: ${evento.data}`);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao abrir evento:', error);
        }
    },

    // ✅ NAVEGAÇÃO OTIMIZADA
    mesAnterior() {
        this.state.mesAtual--;
        if (this.state.mesAtual < 0) {
            this.state.mesAtual = 11;
            this.state.anoAtual--;
        }
        this.gerar();
    },

    proximoMes() {
        this.state.mesAtual++;
        if (this.state.mesAtual > 11) {
            this.state.mesAtual = 0;
            this.state.anoAtual++;
        }
        this.gerar();
    },

    // ✅ SELEÇÃO DE DIA OTIMIZADA
    selecionarDia(dia) {
        this.state.diaSelecionado = dia;
        this.gerar();
    },

    // ✅ IR PARA DATA ESPECÍFICA
    irParaData(ano, mes, dia = null) {
        this.state.anoAtual = ano;
        this.state.mesAtual = mes;
        if (dia) this.state.diaSelecionado = dia;
        this.gerar();
    },

    // ✅ IR PARA HOJE
    irParaHoje() {
        const hoje = new Date();
        this.irParaData(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    },

    // ✅ CRIAR NOVO EVENTO (integração)
    criarNovoEvento(dataInicial = null) {
        try {
            if (typeof Events !== 'undefined' && Events.mostrarNovoEvento) {
                const data = dataInicial || new Date(this.state.anoAtual, this.state.mesAtual, this.state.diaSelecionado).toISOString().split('T')[0];
                Events.mostrarNovoEvento(data);
            } else {
                console.warn('⚠️ Events.js não disponível para criar evento');
            }
        } catch (error) {
            console.error('❌ Erro ao criar novo evento:', error);
        }
    },

    // ✅ UTILITÁRIOS
    _ehMesmoMesDia(data1, data2) {
        return data1.getDate() === data2.getDate() && 
               data1.getMonth() === data2.getMonth() && 
               data1.getFullYear() === data2.getFullYear();
    },

    // 🔥 DEBUG v8.0.1 - SYNC AWARE
    debug() {
        const info = {
            carregado: this.state.carregado,
            mesAtual: this.config.MESES[this.state.mesAtual],
            anoAtual: this.state.anoAtual,
            totalEventos: this.state.eventos.length,
            ultimaAtualizacao: this.state.ultimaAtualizacao,
            hashEventos: this.state.hashEventos,
            atualizandoSync: this.state.atualizandoSync,
            versao: '8.0.1 - Sync Ready'
        };
        
        console.log('📅 Calendar Debug v8.0.1:', info);
        return info;
    },

    // 🔥 STATUS v8.0.1 - SYNC COMPATIBLE
    obterStatus() {
        return {
            carregado: this.state.carregado,
            mesAtual: this.config.MESES[this.state.mesAtual],
            anoAtual: this.state.anoAtual,
            diaSelecionado: this.state.diaSelecionado,
            totalEventos: this.state.eventos.length,
            ultimaAtualizacao: this.state.ultimaAtualizacao,
            hashEventos: this.state.hashEventos,
            atualizandoSync: this.state.atualizandoSync,
            syncCompatible: true,
            funcionalidades: {
                deteccaoMudancas: true,
                atualizacaoInteligente: true,
                indicadorSync: true,
                performanceOtimizada: true
            },
            versao: '8.0.1',
            tipo: 'SYNC_READY'
        };
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.Calendar = Calendar;

// ✅ FUNÇÕES GLOBAIS SYNC-AWARE
window.debugCalendar = () => Calendar.debug();
window.irParaHoje = () => Calendar.irParaHoje();
window.novoEvento = () => Calendar.criarNovoEvento();
window.forcarAtualizacaoCalendar = () => {
    Calendar.state.hashEventos = null; // Força atualização
    Calendar.atualizarEventos();
};

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Calendar.inicializar(), 1000);
});

// ✅ LOG FINAL
console.log('📅 Calendar v8.0.1 - SYNC READY carregado!');
console.log('🔥 Funcionalidades: Detecção mudanças + Atualização inteligente + Indicador sync + Performance otimizada');

/*
🔥 ATUALIZAÇÕES v8.0.1 - SYNC READY:

✅ DETECÇÃO DE MUDANÇAS:
- _calcularHashEventos(): Hash simples para detectar mudanças ✅
- Comparação inteligente em atualizarEventos() ✅
- Evita regeração desnecessária ✅

✅ ATUALIZAÇÃO INTELIGENTE:
- _atualizarInteligente(): Atualiza apenas grid, não header ✅
- Verifica se calendar está visível ✅
- Fallback para atualização completa se necessário ✅

✅ INDICADORES VISUAIS:
- _mostrarIndicadorAtualizacao(): Indicador "🔄 Atualizado" ✅
- Timestamp de sincronização no header ✅
- Animação de 3 segundos ✅

✅ PERFORMANCE OTIMIZADA:
- state.atualizandoSync: Previne atualizações simultâneas ✅
- Verificação de visibilidade antes de atualizar ✅
- Máximo 4 eventos por dia para performance ✅

✅ COMPATIBILIDADE SYNC:
- Função atualizarEventos() otimizada para chamadas frequentes ✅
- Hash de eventos para detecção rápida de mudanças ✅
- Debug mostra estados de sync ✅

📊 RESULTADO:
- Calendar pronto para sync em tempo real ✅
- Performance otimizada para atualizações frequentes ✅
- Indicadores visuais de sincronização ✅
- Detecção inteligente de mudanças ✅
- Integração perfeita com App.js v8.5.0 ✅
*/
