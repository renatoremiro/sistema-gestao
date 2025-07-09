import Events from '../../src/events/index.js';

if (typeof window !== 'undefined') {
    window.Events = Events;
}

export default Events;
