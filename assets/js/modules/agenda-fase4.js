// Classe principal da Agenda Pessoal Fase 4 extraída de agenda.html
class AgendaFase4 {
    constructor() {
        this.visualizacaoAtiva = 'grid';
        this.semanaAtual = new Date();
        this.usuarioAtual = null;
        this.tarefas = [];
        this.eventos = [];
        this.eventosEquipe = [];
        this.participantesTemp = [];
        this.subtarefasTemp = [];
        this.tarefaEditando = null;
        this.filtros = {
            tipo: 'todos',
            status: 'todos',
            prioridade: 'todos',
            escopo: 'todos',
            horario: 'todos'
        };
        this.configFase4 = {
            syncAutomatico: true,
            mostrarEventosEquipe: true,
            notificarMudancas: true,
            atualizarCalendario: true,
            suporteHorarios: true,
            deepLinksAtivo: true,
            navegacaoFluida: true,
            feedbackVisual: true
        };
        this.errosConsecutivos = 0;
        this.maxTentativas = 30;
        this.init();
    }
    // ... (todos os métodos da classe AgendaFase4, igual ao agenda.html) ...
}

// Instanciação global para compatibilidade
window.agendaFase4 = new AgendaFase4(); 