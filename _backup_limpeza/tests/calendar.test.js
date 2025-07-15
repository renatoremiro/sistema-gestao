const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/js/modules/calendar.js', 'utf8');

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  console,
  App: { dados: {} },
};
vm.createContext(sandbox);

const script = new vm.Script(code + ';Calendar');
const Calendar = script.runInContext(sandbox);

Calendar.gerar = () => {}; // evitar DOM

Calendar.config.mesAtual = 11;
Calendar.config.anoAtual = 2021;
Calendar.mudarMes(1);
assert.strictEqual(Calendar.config.mesAtual, 0);
assert.strictEqual(Calendar.config.anoAtual, 2022);

sandbox.App.dados = { foo: 'bar' };
assert.deepStrictEqual(Calendar._verificarDependencias(), sandbox.App.dados);

console.log('✔ calendar.test.js passou');
