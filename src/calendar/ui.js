import { config, state } from './state.js';

export function renderCalendar() {
    const container = document.getElementById('calendario');
    if (!container) return;

    container.innerHTML = `<h3>${config.MESES[state.mesAtual]} ${state.anoAtual}</h3>`;
}
