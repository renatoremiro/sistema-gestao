const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/js/modules/auth.js', 'utf8');

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  console,
  Validation: { isValidEmail: () => true }
};
vm.createContext(sandbox);

const script = new vm.Script(code + ';Auth');
const Auth = script.runInContext(sandbox);

let res = Auth._validarCamposLogin('user@example.com', '123456');
assert.strictEqual(res.valido, true);
assert.strictEqual(res.erro, '');
assert.ok(Array.isArray(res.campos) && res.campos.length === 0);

res = Auth._validarCamposLogin('bad-email', '123');
assert.strictEqual(res.valido, false);
assert.ok(res.erro);
assert.ok(res.campos.includes('loginPassword'));

const status = Auth.obterStatus();
assert.strictEqual(status.autenticado, false);

console.log('✔ auth.test.js passou');
