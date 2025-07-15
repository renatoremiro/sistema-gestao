const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// Carrega o arquivo Helpers.js
const code = fs.readFileSync('assets/js/utils/helpers.js', 'utf8');

// Ambiente mínimo para executar o script
const sandbox = {
  window: {},
  document: {
    createElement: () => ({ style: {}, href: '', download: '' }),
    body: { appendChild: () => {}, removeChild: () => {} },
    execCommand: () => {},
    addEventListener: () => {}
  },
  navigator: {
    clipboard: { writeText: async () => {} },
    userAgent: '',
    onLine: true,
    language: 'en',
    platform: 'test'
  },
  console
};
vm.createContext(sandbox);

// Executa o script e obtém o objeto Helpers
const script = new vm.Script(code + ';Helpers');
const Helpers = script.runInContext(sandbox);

// Teste da função formatarTelefone
const resultado = Helpers.formatarTelefone('11987654321');
assert.strictEqual(resultado, '(11) 98765-4321');

console.log('✔ helpers.test.js passou');
