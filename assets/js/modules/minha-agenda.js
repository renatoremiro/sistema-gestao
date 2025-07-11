// Estado global da Minha Agenda
window.minhaAgendaState = {
    usuarioAtual: null, // { nome, email, permissao }
    usuarios: [],       // lista de usuários
    eventos: [],        // lista de eventos
    tarefas: [],        // lista de tarefas
    participantes: []   // lista de participantes ativos
};

// Inicialização principal da agenda
(function inicializarMinhaAgenda() {
    // Carregar dados do storage
    const dadosSalvos = MinhaAgendaStorage.carregar();
    if (dadosSalvos) {
        Object.assign(window.minhaAgendaState, dadosSalvos);
    }
    // Renderizar interface inicial
    MinhaAgendaUI.renderizarAgenda(window.minhaAgendaState);
    // Sincronizar módulos ao atualizar dados
    window.addEventListener('minhaAgendaAtualizada', function() {
        MinhaAgendaUI.renderizarAgenda(window.minhaAgendaState);
    });
})();

// Exemplo: ao criar evento/tarefa, atualizar estado, salvar e sincronizar
// MinhaAgendaEvents.criarEvento({ ... }); // dentro do método, atualizar window.minhaAgendaState.eventos, chamar MinhaAgendaStorage.salvar, MinhaAgendaStorage.sincronizar 