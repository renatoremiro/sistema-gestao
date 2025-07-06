const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/js/modules/tasks.js', 'utf8');

const sandbox = {
  window: {},
  document: {
    readyState: 'loading',
    addEventListener: () => {},
    getElementById: () => null
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
};
vm.createContext(sandbox);

const script = new vm.Script(code + ';Tasks');
const Tasks = script.runInContext(sandbox);

const id = Tasks._gerarId();
assert.ok(id.startsWith('task_'));

Tasks.state.tarefas.set('1', { id: '1', titulo: 'T1', dataFim: '2099-01-01', dataInicio: '2099-01-01', prioridade: 'alta', status: 'pendente', responsavel: 'A' });

const lista = Tasks.obterTarefasParaCalendario('2099-01-01');
assert.strictEqual(lista.length, 1);
assert.strictEqual(lista[0].id, '1');

console.log('✔ tasks.test.js passou');
