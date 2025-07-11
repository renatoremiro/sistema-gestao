// Módulo de Eventos e Participantes da Minha Agenda
const MinhaAgendaEvents = {
    criarEvento: function(evento) {
        // Adiciona evento ao estado global
        window.minhaAgendaState.eventos.push(evento);
        MinhaAgendaStorage.salvar(window.minhaAgendaState);
        MinhaAgendaStorage.sincronizar();
    },
    editarEvento: function(id, novosDados) {
        const idx = window.minhaAgendaState.eventos.findIndex(e => e.id === id);
        if (idx !== -1) {
            window.minhaAgendaState.eventos[idx] = { ...window.minhaAgendaState.eventos[idx], ...novosDados };
            MinhaAgendaStorage.salvar(window.minhaAgendaState);
            MinhaAgendaStorage.sincronizar();
        }
    },
    excluirEvento: function(id) {
        window.minhaAgendaState.eventos = window.minhaAgendaState.eventos.filter(e => e.id !== id);
        MinhaAgendaStorage.salvar(window.minhaAgendaState);
        MinhaAgendaStorage.sincronizar();
    },
    criarTarefa: function(tarefa) {
        window.minhaAgendaState.tarefas.push(tarefa);
        MinhaAgendaStorage.salvar(window.minhaAgendaState);
        MinhaAgendaStorage.sincronizar();
    },
    editarTarefa: function(id, novosDados) {
        const idx = window.minhaAgendaState.tarefas.findIndex(t => t.id === id);
        if (idx !== -1) {
            window.minhaAgendaState.tarefas[idx] = { ...window.minhaAgendaState.tarefas[idx], ...novosDados };
            MinhaAgendaStorage.salvar(window.minhaAgendaState);
            MinhaAgendaStorage.sincronizar();
        }
    },
    excluirTarefa: function(id) {
        window.minhaAgendaState.tarefas = window.minhaAgendaState.tarefas.filter(t => t.id !== id);
        MinhaAgendaStorage.salvar(window.minhaAgendaState);
        MinhaAgendaStorage.sincronizar();
    },
    adicionarParticipante: function(eventoOuTarefaId, participante) {
        // Procura em eventos e tarefas
        let item = window.minhaAgendaState.eventos.find(e => e.id === eventoOuTarefaId) ||
                   window.minhaAgendaState.tarefas.find(t => t.id === eventoOuTarefaId);
        if (item) {
            if (!item.participantes) item.participantes = [];
            if (!item.participantes.includes(participante)) {
                item.participantes.push(participante);
                MinhaAgendaStorage.salvar(window.minhaAgendaState);
                MinhaAgendaStorage.sincronizar();
            }
        }
    },
    removerParticipante: function(eventoOuTarefaId, participante) {
        let item = window.minhaAgendaState.eventos.find(e => e.id === eventoOuTarefaId) ||
                   window.minhaAgendaState.tarefas.find(t => t.id === eventoOuTarefaId);
        if (item && item.participantes) {
            item.participantes = item.participantes.filter(p => p !== participante);
            MinhaAgendaStorage.salvar(window.minhaAgendaState);
            MinhaAgendaStorage.sincronizar();
        }
    }
};

function abrirModalEventoOuTarefa(tipo, dados = {}) {
    // tipo: 'evento' ou 'tarefa'
    // dados: objeto com dados para edição (opcional)
    // Preencher campos do modal conforme tipo/contexto
    // Exemplo:
    document.getElementById('modalTipo').value = tipo;
    document.getElementById('modalTitulo').value = dados.titulo || '';
    document.getElementById('modalData').value = dados.data || '';
    // ... outros campos
    // Mostrar/ocultar campos de participantes conforme tipo/contexto
    // Exibir modal
    document.getElementById('modalEventoTarefa').style.display = 'block';
} 