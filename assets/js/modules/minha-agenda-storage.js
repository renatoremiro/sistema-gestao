// Módulo de Persistência/Sincronização da Minha Agenda
const MinhaAgendaStorage = {
    salvar: function(dados) {
        localStorage.setItem('minha_agenda_dados', JSON.stringify(dados));
    },
    carregar: function() {
        const dados = localStorage.getItem('minha_agenda_dados');
        return dados ? JSON.parse(dados) : null;
    },
    sincronizar: function() {
        // Sincroniza dados entre módulos e dispara eventos customizados
        const evento = new CustomEvent('minhaAgendaAtualizada');
        window.dispatchEvent(evento);
    }
}; 