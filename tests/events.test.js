const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/js/modules/events.js', 'utf8');

const sandbox = {
  window: {},
  document: { addEventListener: () => {} },
  console,
  App: { dados: { eventos: [] } },
};
vm.createContext(sandbox);

const script = new vm.Script(code + ';Events');
const Events = script.runInContext(sandbox);

sandbox.App.dados.eventos = [
  { id: 1, titulo: 'Reuniao', data: '2099-01-01', tipo: 'reuniao', pessoas: ['A'] },
  { id: 2, titulo: 'Entrega', data: '2099-01-02', tipo: 'entrega', pessoas: ['B'] }
];

let encontrados = Events.buscarEventos('Reuniao');
assert.strictEqual(encontrados.length, 1);
assert.strictEqual(encontrados[0].id, 1);

const proximos = Events.obterProximosEventos(1);
assert.strictEqual(proximos.length, 1);
assert.strictEqual(proximos[0].id, 1);

console.log('✔ events.test.js passou');
