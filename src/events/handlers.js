import { state } from './state.js';
import { openEditModal } from './ui.js';

export function editEvent(id) {
    state.eventoEditando = id;
    openEditModal();
}
