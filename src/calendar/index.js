import { config, state } from './state.js';
import { renderCalendar } from './ui.js';
import { init, previousMonth, nextMonth, selectDay } from './handlers.js';

export { config, state, renderCalendar, init, previousMonth, nextMonth, selectDay };

export default {
    config,
    state,
    renderCalendar,
    init,
    previousMonth,
    nextMonth,
    selectDay
};
