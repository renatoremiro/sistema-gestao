/**
 * 📅 Sistema de Calendário v7.4.8 - FORMATO EXATO DA IMAGEM
 * 
 * 🔥 FORMATO: Exatamente igual à imagem enviada pelo usuário
 * ✅ HEADER: Vermelho com "Calendário da Equipe - Sincronização Automática"
 * ✅ NAVEGAÇÃO: Botões ← Anterior | Próximo → visíveis
 * ✅ LAYOUT: Grid limpa com eventos como barrinhas coloridas
 * ✅ EVENTOS: Dentro dos dias, coloridos e organizados
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

    // ✅ ESTADO
    state: {
        mesAtual: new Date().getMonth(),
        anoAtual: new Date().getFullYear(),
        diaSelecionado: new Date().getDate(),
        eventos: [],
        carregado: false
    },

    // ✅ INICIALIZAR
    inicializar() {
        try {
            console.log('📅 Inicializando calendário formato imagem...');
            
            const hoje = new Date();
            this.state.mesAtual = hoje.getMonth();
            this.state.anoAtual = hoje.getFullYear();
            this.state.diaSelecionado = hoje.getDate();
            
            this.carregarEventos();
            this.gerar();
            
            this.state.carregado = true;
            console.log('✅ Calendário inicializado no formato da imagem');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar calendário:', error);
        }
    },

    // ✅ GERAR CALENDÁRIO - FORMATO EXATO DA IMAGEM
    gerar() {
        try {
            const container = document.getElementById('calendario');
            if (!container) {
                console.warn('⚠️ Container do calendário não encontrado');
                return;
            }

            // Limpar container
            container.innerHTML = '';
            
            // Aplicar estilo do container principal
            container.style.cssText = `
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin: 0;
                padding: 0;
            `;

            // Criar estrutura completa
            const estrutura = document.createElement('div');
            estrutura.innerHTML = `
                <!-- Header Vermelho -->
                <div style="
                    background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%);
                    color: white;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <button onclick="Calendar.mesAnterior()" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">← Anterior</button>
                    
                    <h3 style="
                        margin: 0;
                        font-size: 18px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        📅 Calendário da Equipe - Sincronização Automática
                    </h3>
                    
                    <button onclick="Calendar.proximoMes()" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">Próximo →</button>
                </div>
                
                <!-- Header dos Dias da Semana -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background: #f8fafc;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    ${this.config.DIAS_SEMANA.map(dia => `
                        <div style="
                            padding: 12px 8px;
                            text-align: center;
                            font-weight: 600;
                            font-size: 14px;
                            color: #374151;
                            border-right: 1px solid #e5e7eb;
                        ">${dia}</div>
                    `).join('')}
                </div>
                
                <!-- Grid dos Dias -->
                <div id="calendario-grid" style="
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                ">
                    <!-- Dias serão inseridos aqui -->
                </div>
            `;

            container.appendChild(estrutura);

            // Gerar dias do mês
            this._gerarDiasDoMes();
            
            // Atualizar header principal
            this._atualizarHeaderPrincipal();
            
        } catch (error) {
            console.error('❌ Erro ao gerar calendário:', error);
        }
    },

    // ✅ GERAR DIAS DO MÊS - FORMATO EXATO
    _gerarDiasDoMes() {
        const grid = document.getElementById('calendario-grid');
        if (!grid) return;

        // Calcular dias do mês
        const primeiroDia = new Date(this.state.anoAtual, this.state.mesAtual, 1);
        const ultimoDia = new Date(this.state.anoAtual, this.state.mesAtual + 1, 0);
        const diaSemanaInicio = primeiroDia.getDay();
        const totalDias = ultimoDia.getDate();
        const hoje = new Date();

        // Limpar grid
        grid.innerHTML = '';

        // Células vazias do mês anterior
        for (let i = 0; i < diaSemanaInicio; i++) {
            const celulaVazia = document.createElement('div');
            celulaVazia.style.cssText = `
                border-right: 1px solid #e5e7eb;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
                min-height: 120px;
            `;
            grid.appendChild(celulaVazia);
        }

        // Dias do mês atual
        for (let dia = 1; dia <= totalDias; dia++) {
            const celulaDia = this._criarCelulaDia(dia, hoje);
            grid.appendChild(celulaDia);
        }

        // Completar grade (6 semanas x 7 dias = 42 células)
        const totalCelulas = diaSemanaInicio + totalDias;
        const celulasRestantes = 42 - totalCelulas;
        
        for (let i = 0; i < celulasRestantes; i++) {
            const celulaVazia = document.createElement('div');
            celulaVazia.style.cssText = `
                border-right: 1px solid #e5e7eb;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
                min-height: 120px;
            `;
            grid.appendChild(celulaVazia);
        }
    },

    // ✅ CRIAR CÉLULA DO DIA - FORMATO IMAGEM
    _criarCelulaDia(dia, hoje) {
        const celula = document.createElement('div');
        
        const dataCelula = new Date(this.state.anoAtual, this.state.mesAtual, dia);
        const dataISO = dataCelula.toISOString().split('T')[0];
        const ehHoje = this._ehMesmoMesDia(dataCelula, hoje);
        const ehSelecionado = this.state.diaSelecionado === dia;
        
        // Estilo da célula
        let backgroundColor = '#ffffff';
        if (ehHoje) backgroundColor = '#dbeafe';
        if (ehSelecionado) backgroundColor = '#f3f4f6';

        celula.style.cssText = `
            background: ${backgroundColor};
            border-right: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            min-height: 120px;
            padding: 8px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            position: relative;
        `;

        // Número do dia
        const numeroDia = document.createElement('div');
        numeroDia.textContent = dia;
        numeroDia.style.cssText = `
            font-weight: ${ehHoje ? '700' : '500'};
            font-size: 14px;
            margin-bottom: 8px;
            color: ${ehHoje ? '#1e40af' : '#374151'};
        `;
        celula.appendChild(numeroDia);

        // Container dos eventos
        const containerEventos = document.createElement('div');
        containerEventos.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 2px;
        `;

        // Obter e adicionar eventos do dia
        const eventosHoje = this._obterEventosNoDia(dataISO);
        eventosHoje.forEach(evento => {
            const eventoElement = this._criarElementoEvento(evento);
            containerEventos.appendChild(eventoElement);
        });

        celula.appendChild(containerEventos);

        // Event listeners
        celula.addEventListener('click', () => {
            this.selecionarDia(dia);
        });

        celula.addEventListener('mouseenter', () => {
            if (!ehSelecionado) {
                celula.style.backgroundColor = '#f3f4f6';
            }
        });

        celula.addEventListener('mouseleave', () => {
            if (!ehSelecionado) {
                celula.style.backgroundColor = backgroundColor;
            }
        });

        return celula;
    },

    // ✅ CRIAR ELEMENTO DO EVENTO - BARRINHA COLORIDA
    _criarElementoEvento(evento) {
        const eventoDiv = document.createElement('div');
        
        // Cores por tipo (como na imagem)
        const cores = {
            'reuniao': '#6b7280',    // Cinza como "teste"
            'entrega': '#10b981',    // Verde como "Relatório fotográfico"
            'prazo': '#ef4444',      // Vermelho
            'marco': '#8b5cf6',      // Roxo
            'outro': '#6b7280'       // Cinza padrão
        };
        
        const cor = cores[evento.tipo] || cores.outro;
        
        eventoDiv.style.cssText = `
            background: ${cor};
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 500;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            cursor: pointer;
            margin-bottom: 2px;
            height: 20px;
            display: flex;
            align-items: center;
        `;
        
        eventoDiv.textContent = evento.titulo;
        eventoDiv.title = `${evento.titulo}${evento.descricao ? ' - ' + evento.descricao : ''}`;
        
        // Click para editar evento
        eventoDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof Events !== 'undefined' && Events.editarEvento) {
                Events.editarEvento(evento.id);
            }
        });

        return eventoDiv;
    },

    // ✅ NAVEGAÇÃO
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

    // ✅ SELEÇÃO DE DIA
    selecionarDia(dia) {
        try {
            this.state.diaSelecionado = dia;
            
            const dataSelecionada = new Date(this.state.anoAtual, this.state.mesAtual, dia);
            const diaSemana = this.config.DIAS_SEMANA[dataSelecionada.getDay()];
            const mesNome = this.config.MESES[this.state.mesAtual];
            
            console.log(`📅 Dia selecionado: ${dia} de ${mesNome} ${this.state.anoAtual} (${diaSemana})`);
            
            // Regenerar calendário
            this.gerar();
            
            // Dados para agenda do dia
            const dataForAgenda = {
                dia: dia,
                mes: this.state.mesAtual,
                ano: this.state.anoAtual,
                diaSemana: diaSemana,
                mesNome: mesNome,
                dataISO: dataSelecionada.toISOString().split('T')[0],
                dataFormatada: `${diaSemana.toLowerCase()}-feira, ${dia} de ${mesNome.toLowerCase()} de ${this.state.anoAtual}`
            };
            
            // Notificar agenda do dia
            if (typeof PersonalAgenda !== 'undefined' && PersonalAgenda.atualizarAgendaDoDia) {
                PersonalAgenda.atualizarAgendaDoDia(dataForAgenda);
            }
            
        } catch (error) {
            console.error('❌ Erro ao selecionar dia:', error);
        }
    },

    // ✅ CARREGAR EVENTOS
    carregarEventos() {
        try {
            if (typeof App !== 'undefined' && App.dados && App.dados.eventos) {
                this.state.eventos = App.dados.eventos;
                console.log(`📅 ${this.state.eventos.length} eventos carregados`);
            } else {
                this.state.eventos = [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar eventos:', error);
            this.state.eventos = [];
        }
    },

    // ✅ OBTER EVENTOS DO DIA
    _obterEventosNoDia(dataISO) {
        if (!this.state.eventos || !Array.isArray(this.state.eventos)) {
            return [];
        }
        
        return this.state.eventos
            .filter(evento => evento.data === dataISO)
            .slice(0, 4); // Máximo 4 eventos por dia
    },

    // ✅ VERIFICAR SE É O MESMO DIA
    _ehMesmoMesDia(data1, data2) {
        return data1.getDate() === data2.getDate() && 
               data1.getMonth() === data2.getMonth() && 
               data1.getFullYear() === data2.getFullYear();
    },

    // ✅ ATUALIZAR HEADER PRINCIPAL
    _atualizarHeaderPrincipal() {
        try {
            const mesAnoElement = document.getElementById('mesAno');
            if (mesAnoElement) {
                mesAnoElement.textContent = `${this.config.MESES[this.state.mesAtual]} ${this.state.anoAtual}`;
            }
        } catch (error) {
            console.warn('⚠️ Erro ao atualizar header principal:', error);
        }
    },

    // ✅ EXPORTAR PDF
    exportarPDF() {
        if (typeof Notifications !== 'undefined') {
            Notifications.importante('Funcionalidade de exportação PDF em desenvolvimento', 'info');
        } else {
            alert('Funcionalidade de exportação PDF em desenvolvimento');
        }
    },

    // ✅ OBTER STATUS
    obterStatus() {
        return {
            carregado: this.state.carregado,
            mesAtual: this.config.MESES[this.state.mesAtual],
            anoAtual: this.state.anoAtual,
            diaSelecionado: this.state.diaSelecionado,
            totalEventos: this.state.eventos.length,
            versao: '7.4.8',
            formato: 'EXATO_DA_IMAGEM',
            layoutLimpo: true,
            eventosColoridos: true
        };
    }
};

// ✅ EXPOSIÇÃO GLOBAL
window.Calendar = Calendar;

// ✅ INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        Calendar.inicializar();
    }, 1000);
});

// ✅ LOG FINAL
console.log('📅 Calendar v7.4.8 - FORMATO EXATO DA IMAGEM!');

/*
🔥 IMPLEMENTAÇÃO v7.4.8:
- ✅ Layout EXATO da imagem enviada
- ✅ Header vermelho: "Calendário da Equipe - Sincronização Automática"
- ✅ Botões ← Anterior | Próximo → visíveis e funcionais
- ✅ Grid limpa com 7 colunas (Dom-Sáb)
- ✅ Eventos como barrinhas coloridas dentro dos dias
- ✅ Cores: cinza para "teste", verde para "Relatório fotográfico"
- ✅ Layout profissional e limpo como na imagem

🎯 RESULTADO:
- Calendário idêntico à imagem ✅
- Eventos coloridos nos dias ✅
- Navegação funcionando ✅
- Layout limpo e profissional ✅
*/
