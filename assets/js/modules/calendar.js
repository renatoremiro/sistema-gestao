/**
 * 📅 Sistema de Calendário v7.4.9 - VERSÃO LIMPA SEM CONFLITOS
 * 
 * 🔥 CORRIGIDO: Remove completamente qualquer layout anterior
 * ✅ LIMPO: CSS inline para evitar conflitos
 * ✅ SUBSTITUI: Todo o conteúdo do container #calendario
 * ✅ FORMATO: Exatamente como na imagem original
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
            console.log('📅 Inicializando calendário limpo v7.4.9...');
            
            const hoje = new Date();
            this.state.mesAtual = hoje.getMonth();
            this.state.anoAtual = hoje.getFullYear();
            this.state.diaSelecionado = hoje.getDate();
            
            this.carregarEventos();
            this.gerar();
            
            this.state.carregado = true;
            console.log('✅ Calendário limpo inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar calendário:', error);
        }
    },

    // 🔥 GERAR CALENDÁRIO COMPLETAMENTE LIMPO
    gerar() {
        try {
            const container = document.getElementById('calendario');
            if (!container) {
                console.warn('⚠️ Container do calendário não encontrado');
                return;
            }

            // 🔥 LIMPAR COMPLETAMENTE - REMOVER TUDO
            container.innerHTML = '';
            container.className = '';
            container.style.cssText = '';

            // 🔥 APLICAR ESTILO ZERO CONFLITOS
            container.style.cssText = `
                background: white !important;
                border-radius: 8px !important;
                overflow: hidden !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: none !important;
                display: block !important;
                position: relative !important;
            `;

            // 🔥 HTML COMPLETAMENTE NOVO E LIMPO
            const htmlLimpo = `
                <div style="
                    background: linear-gradient(135deg, #C53030 0%, #9B2C2C 100%) !important;
                    color: white !important;
                    padding: 16px 20px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    margin: 0 !important;
                    border: none !important;
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
                        margin: 0 !important;
                    ">← Anterior</button>
                    
                    <h3 style="
                        margin: 0 !important;
                        padding: 0 !important;
                        font-size: 18px !important;
                        font-weight: 600 !important;
                        color: white !important;
                        text-align: center !important;
                        display: flex !important;
                        align-items: center !important;
                        gap: 8px !important;
                    ">
                        📅 ${this.config.MESES[this.state.mesAtual]} ${this.state.anoAtual}
                    </h3>
                    
                    <button onclick="Calendar.proximoMes()" style="
                        background: rgba(255,255,255,0.2) !important;
                        border: 1px solid rgba(255,255,255,0.3) !important;
                        color: white !important;
                        padding: 8px 12px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                        margin: 0 !important;
                    ">Próximo →</button>
                </div>
                
                <div style="
                    display: grid !important;
                    grid-template-columns: repeat(7, 1fr) !important;
                    background: #f8fafc !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
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
                            margin: 0 !important;
                            background: #f8fafc !important;
                        ">${dia}</div>
                    `).join('')}
                </div>
                
                <div id="calendario-dias-grid" style="
                    display: grid !important;
                    grid-template-columns: repeat(7, 1fr) !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    background: white !important;
                ">
                    <!-- Dias serão inseridos aqui -->
                </div>
            `;

            // 🔥 INSERIR HTML LIMPO
            container.innerHTML = htmlLimpo;

            // 🔥 GERAR DIAS
            this._gerarDiasLimpos();
            
        } catch (error) {
            console.error('❌ Erro ao gerar calendário limpo:', error);
        }
    },

    // 🔥 GERAR DIAS COMPLETAMENTE LIMPOS
    _gerarDiasLimpos() {
        const grid = document.getElementById('calendario-dias-grid');
        if (!grid) return;

        // Calcular dias do mês
        const primeiroDia = new Date(this.state.anoAtual, this.state.mesAtual, 1);
        const ultimoDia = new Date(this.state.anoAtual, this.state.mesAtual + 1, 0);
        const diaSemanaInicio = primeiroDia.getDay();
        const totalDias = ultimoDia.getDate();
        const hoje = new Date();

        // 🔥 LIMPAR GRID COMPLETAMENTE
        grid.innerHTML = '';
        grid.style.cssText = `
            display: grid !important;
            grid-template-columns: repeat(7, 1fr) !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: white !important;
        `;

        // 🔥 GERAR EXATAMENTE 42 CÉLULAS (6 semanas x 7 dias)
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
                    margin: 0 !important;
                    padding: 0 !important;
                `;
                grid.appendChild(celulaVazia);
            } else {
                // Célula com dia válido
                const celulaDia = this._criarCelulaDiaLimpa(dia, hoje);
                grid.appendChild(celulaDia);
            }
        }
    },

    // 🔥 CRIAR CÉLULA DO DIA LIMPA
    _criarCelulaDiaLimpa(dia, hoje) {
        const celula = document.createElement('div');
        
        const dataCelula = new Date(this.state.anoAtual, this.state.mesAtual, dia);
        const dataISO = dataCelula.toISOString().split('T')[0];
        const ehHoje = this._ehMesmoMesDia(dataCelula, hoje);
        
        // 🔥 ESTILO LIMPO SEM CONFLITOS
        let backgroundColor = '#ffffff';
        if (ehHoje) backgroundColor = '#dbeafe';

        celula.style.cssText = `
            background: ${backgroundColor} !important;
            border-right: 1px solid #e5e7eb !important;
            border-bottom: 1px solid #e5e7eb !important;
            min-height: 100px !important;
            padding: 8px !important;
            cursor: pointer !important;
            transition: background-color 0.2s ease !important;
            position: relative !important;
            margin: 0 !important;
            display: block !important;
        `;

        // 🔥 HTML INTERNO LIMPO
        celula.innerHTML = `
            <div style="
                font-weight: ${ehHoje ? '700' : '500'} !important;
                font-size: 14px !important;
                margin-bottom: 8px !important;
                color: ${ehHoje ? '#1e40af' : '#374151'} !important;
                padding: 0 !important;
            ">${dia}</div>
            
            <div id="eventos-dia-${dia}" style="
                display: flex !important;
                flex-direction: column !important;
                gap: 2px !important;
                margin: 0 !important;
                padding: 0 !important;
            ">
                <!-- Eventos serão inseridos aqui -->
            </div>
        `;

        // 🔥 ADICIONAR EVENTOS DO DIA
        const eventosHoje = this._obterEventosNoDia(dataISO);
        const containerEventos = celula.querySelector(`#eventos-dia-${dia}`);
        
        eventosHoje.forEach(evento => {
            const eventoElement = this._criarElementoEventoLimpo(evento);
            containerEventos.appendChild(eventoElement);
        });

        // 🔥 EVENT LISTENERS LIMPOS
        celula.addEventListener('click', () => {
            this.selecionarDia(dia);
        });

        celula.addEventListener('mouseenter', () => {
            celula.style.backgroundColor = '#f3f4f6';
        });

        celula.addEventListener('mouseleave', () => {
            celula.style.backgroundColor = backgroundColor;
        });

        return celula;
    },

    // 🔥 CRIAR ELEMENTO DO EVENTO LIMPO
    _criarElementoEventoLimpo(evento) {
        const eventoDiv = document.createElement('div');
        
        // 🔥 CORES LIMPAS
        const cores = {
            'reuniao': '#6b7280',
            'entrega': '#10b981',
            'prazo': '#ef4444',
            'marco': '#8b5cf6',
            'outro': '#6b7280'
        };
        
        const cor = cores[evento.tipo] || cores.outro;
        
        // 🔥 ESTILO LIMPO DO EVENTO
        eventoDiv.style.cssText = `
            background: ${cor} !important;
            color: white !important;
            padding: 3px 8px !important;
            border-radius: 3px !important;
            font-size: 11px !important;
            font-weight: 500 !important;
            text-overflow: ellipsis !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            cursor: pointer !important;
            margin-bottom: 2px !important;
            height: 20px !important;
            display: flex !important;
            align-items: center !important;
            border: none !important;
        `;
        
        eventoDiv.textContent = evento.titulo;
        eventoDiv.title = evento.titulo;
        
        // Click para editar
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
            .slice(0, 3); // Máximo 3 eventos por dia
    },

    // ✅ VERIFICAR SE É O MESMO DIA
    _ehMesmoMesDia(data1, data2) {
        return data1.getDate() === data2.getDate() && 
               data1.getMonth() === data2.getMonth() && 
               data1.getFullYear() === data2.getFullYear();
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
            versao: '7.4.9',
            formato: 'LIMPO_SEM_CONFLITOS',
            layoutCorreto: true
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
console.log('📅 Calendar v7.4.9 - VERSÃO LIMPA SEM CONFLITOS!');

/*
🔥 CORREÇÕES v7.4.9:
- ✅ Remove COMPLETAMENTE qualquer layout anterior
- ✅ CSS com !important para evitar conflitos
- ✅ HTML completamente novo e limpo
- ✅ Sem sobreposições ou layouts duplos
- ✅ Layout único e correto
- ✅ Navegação funcionando
- ✅ Eventos coloridos nos dias

🎯 RESULTADO:
- Calendário limpo e único ✅
- Sem conflitos de CSS ✅
- Layout correto como na imagem ✅
- Navegação funcionando ✅
*/
