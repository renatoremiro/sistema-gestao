const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const notifCode = fs.readFileSync('assets/js/utils/notifications.js', 'utf8');
const tasksCode = fs.readFileSync('assets/js/modules/tasks.js', 'utf8');

const sandbox = {
  window: {},
  document: {
    readyState: 'loading',
    addEventListener: () => {},
    getElementById: () => ({
      addEventListener: () => {},
      appendChild: () => {},
      innerHTML: '',
      style: {},
    }),
    querySelector: () => null,
    createElement: () => ({
      className: '',
      style: {},
      addEventListener: () => {},
      remove: () => {},
      appendChild: () => {},
    }),
    body: { appendChild: () => {} },
  },
  requestAnimationFrame: (cb) => cb(),
  setTimeout: setTimeout,
  setInterval: () => {},
  localStorage: { getItem: () => null, setItem: () => {} },
  console,
};
vm.createContext(sandbox);

// Carrega Notifications e cria o objeto global
vm.runInContext(notifCode, sandbox);
assert.ok(sandbox.window.Notifications, 'Notifications nao definido');

const script = new vm.Script(tasksCode + ';Tasks');
const Tasks = script.runInContext(sandbox);

const id = Tasks._gerarId();
assert.ok(id.startsWith('task_'));

console.log('✔ notifications-dependency.test.js passou');
process.exit(0);

