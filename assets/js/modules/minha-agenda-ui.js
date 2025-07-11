// Módulo de Interface da Minha Agenda
const MinhaAgendaUI = {
    renderizarAgenda: function(dados) {
        // Exemplo: atualizar lista de eventos
        const eventosContainer = document.getElementById('eventosLista');
        if (eventosContainer) {
            eventosContainer.innerHTML = dados.eventos.map(ev => `
                <div class="evento-item">
                    <strong>${ev.titulo}</strong> - ${ev.data}
                    <span>Participantes: ${(ev.participantes||[]).join(', ')}</span>
                    <button onclick="MinhaAgendaEvents.excluirEvento(${ev.id})">Excluir</button>
                </div>
            `).join('');
        }
        // Exemplo: atualizar lista de tarefas
        const tarefasContainer = document.getElementById('tarefasLista');
        if (tarefasContainer) {
            tarefasContainer.innerHTML = dados.tarefas.map(t => `
                <div class="tarefa-item">
                    <strong>${t.titulo}</strong> - ${t.data}
                    <span>Participantes: ${(t.participantes||[]).join(', ')}</span>
                    <button onclick="MinhaAgendaEvents.excluirTarefa(${t.id})">Excluir</button>
                </div>
            `).join('');
        }
    },
    atualizarEventos: function(eventos) {
        this.renderizarAgenda(window.minhaAgendaState);
    },
    atualizarTarefas: function(tarefas) {
        this.renderizarAgenda(window.minhaAgendaState);
    },
    mostrarNotificacao: function(msg, tipo = 'info') {
        if (typeof Notifications !== 'undefined') {
            Notifications[tipo](msg);
        } else {
            alert(msg);
        }
    },
    atualizarParticipantes: function(participantes) {
        // Atualiza a lista de participantes na interface
    }
}; 