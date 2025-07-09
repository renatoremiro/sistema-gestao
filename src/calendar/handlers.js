import { config, state } from './state.js';
import { renderCalendar } from './ui.js';

export function init() {
    renderCalendar();
    state.carregado = true;
}

export function previousMonth() {
    state.mesAtual = (state.mesAtual === 0) ? 11 : state.mesAtual - 1;
    if (state.mesAtual === 11) state.anoAtual--;
    renderCalendar();
}

export function nextMonth() {
    state.mesAtual = (state.mesAtual === 11) ? 0 : state.mesAtual + 1;
    if (state.mesAtual === 0) state.anoAtual++;
    renderCalendar();
}

export function selectDay(dia) {
    state.diaSelecionado = dia;
    renderCalendar();
}
