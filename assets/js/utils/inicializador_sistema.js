/**
 * 🚀 INICIALIZADOR CENTRAL DO SISTEMA v1.0
 * 
 * Garante que todos os módulos sejam inicializados corretamente
 * sem interferir nas funcionalidades existentes
 */

const InicializadorSistema = {
    modulos: {
        calendar: false,
        app: false,
        auth: false,
        events: false
    },
    
    tentativas: 0,
    maxTentativas: 10,
    
    // 🔧 Inicializar sistema
    iniciar() {
        console.log('🚀 Inicializador Sistema BIAPO v1.0');
        
        // Verificar e inicializar módulos
        this.verificarModulos();
        
        // Verificar a cada 500ms até tudo estar pronto
        this.intervalId = setInterval(() => {
            this.verificarModulos();
            
            this.tentativas++;
            if (this.tentativas >= this.maxTentativas) {
                console.warn('⚠️ Timeout na inicialização - forçando módulos');
                this.forcarInicializacao();
                clearInterval(this.intervalId);
            }
            
            // Se tudo estiver OK, parar
            if (this.tudoPronto()) {
                console.log('✅ Sistema totalmente inicializado!');
                clearInterval(this.intervalId);
            }
        }, 500);
    },
    
    // 🔍 Verificar módulos
    verificarModulos() {
        // App.js
        if (!this.modulos.app && typeof App !== 'undefined' && App.estadoSistema?.inicializado) {
            this.modulos.app = true;
            console.log('✅ App.js inicializado');
        }
        
        // Auth.js
        if (!this.modulos.auth && typeof Auth !== 'undefined' && Auth.state) {
            this.modulos.auth = true;
            console.log('✅ Auth.js inicializado');
        }
        
        // Events.js
        if (!this.modulos.events && typeof Events !== 'undefined') {
            this.modulos.events = true;
            console.log('✅ Events.js inicializado');
        }
        
        // Calendar.js - INICIALIZAR SE DISPONÍVEL
        if (!this.modulos.calendar && typeof Calendar !== 'undefined') {
            const paginaIndex = window.location.pathname.includes('index.html') || 
                              window.location.pathname === '/' ||
                              window.location.pathname.endsWith('/');
            
            if (paginaIndex) {
                console.log('📅 Inicializando Calendar.js...');
                
                // Verificar se já está inicializado
                if (Calendar.state?.carregado) {
                    this.modulos.calendar = true;
                    console.log('✅ Calendar.js já estava inicializado');
                } else if (Calendar.inicializar) {
                    try {
                        Calendar.inicializar();
                        this.modulos.calendar = true;
                        console.log('✅ Calendar.js inicializado com sucesso');
                    } catch (error) {
                        console.warn('⚠️ Erro ao inicializar Calendar:', error);
                    }
                }
            } else {
                // Não é página do calendário, marcar como OK
                this.modulos.calendar = true;
            }
        }
        
        // Verificar Agenda (se estiver na página agenda.html)
        if (window.location.pathname.includes('agenda.html')) {
            this.verificarAgenda();
        }
    },
    
    // 🔍 Verificar Agenda
    verificarAgenda() {
        if (typeof agendaFase4 !== 'undefined') {
            console.log('✅ Agenda Fase 4 inicializada');
        } else if (typeof AgendaFase4 !== 'undefined') {
            // Tentar inicializar se a classe existir mas não a instância
            try {
                window.agendaFase4 = new AgendaFase4();
                console.log('✅ Agenda Fase 4 criada e inicializada');
            } catch (error) {
                console.warn('⚠️ Erro ao criar Agenda:', error);
            }
        }
    },
    
    // 🔧 Forçar inicialização
    forcarInicializacao() {
        console.log('🔧 Forçando inicialização de módulos pendentes...');
        
        // Forçar Calendar se estiver na index
        if (!this.modulos.calendar && window.location.pathname.includes('index')) {
            if (typeof Calendar !== 'undefined' && Calendar.inicializar) {
                try {
                    Calendar.inicializar();
                    console.log('✅ Calendar forçado a inicializar');
                } catch (error) {
                    console.error('❌ Erro ao forçar Calendar:', error);
                }
            }
        }
        
        // Forçar Agenda se necessário
        if (window.location.pathname.includes('agenda.html')) {
            if (typeof AgendaFase4 !== 'undefined' && typeof agendaFase4 === 'undefined') {
                try {
                    window.agendaFase4 = new AgendaFase4();
                    console.log('✅ Agenda forçada a inicializar');
                } catch (error) {
                    console.error('❌ Erro ao forçar Agenda:', error);
                }
            }
        }
    },
    
    // ✅ Verificar se tudo está pronto
    tudoPronto() {
        const prontos = Object.values(this.modulos).filter(Boolean).length;
        const total = Object.keys(this.modulos).length;
        return prontos === total;
    },
    
    // 📊 Status
    status() {
        console.log('📊 STATUS DO SISTEMA:');
        console.log('App.js:', this.modulos.app ? '✅' : '❌');
        console.log('Auth.js:', this.modulos.auth ? '✅' : '❌');
        console.log('Events.js:', this.modulos.events ? '✅' : '❌');
        console.log('Calendar.js:', this.modulos.calendar ? '✅' : '❌');
        console.log('Tentativas:', this.tentativas + '/' + this.maxTentativas);
    }
};

// 🚀 INICIAR AUTOMATICAMENTE
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => InicializadorSistema.iniciar(), 100);
    });
} else {
    // DOM já carregado
    setTimeout(() => InicializadorSistema.iniciar(), 100);
}

// 🎯 Comandos globais
window.statusSistema = () => InicializadorSistema.status();
window.reiniciarSistema = () => {
    InicializadorSistema.tentativas = 0;
    InicializadorSistema.iniciar();
};

console.log('🚀 Inicializador Sistema carregado - aguardando módulos...');
