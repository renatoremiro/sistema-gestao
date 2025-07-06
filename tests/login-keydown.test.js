const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const authCode = fs.readFileSync('assets/js/modules/auth.js', 'utf8');
const loginInitCode = fs.readFileSync('assets/js/modules/login-init.js', 'utf8');

const events = {};
const sandbox = {
  window: {},
  document: {
    addEventListener: (type, cb) => { events[type] = cb; },
    getElementById: (id) => {
      if (id === 'loginScreen') {
        return { classList: { contains: () => false } };
      }
      return { classList: { contains: () => false } };
    },
    querySelector: () => null,
    querySelectorAll: () => []
  },
  console,
  Notifications: { warning: () => {}, error: () => {}, info: () => {} },
  Persistence: { state: {} },
  App: {},
  PersonalAgenda: {},
  DataStructure: {},
  HybridSync: {},
  HybridSync_Debug: {},
  setTimeout: setTimeout,
  setInterval: setInterval,
  alert: () => {}
};
vm.createContext(sandbox);

const authScript = new vm.Script(authCode + ';Auth');
const Auth = authScript.runInContext(sandbox);

let callCount = 0;
Auth.fazerLogin = () => { callCount++; };

Auth._configurarEventosTeclado();
const handlerBefore = events['keydown'];

// Executar login-init.js e verificar que nao adiciona outro listener
const loginScript = new vm.Script(loginInitCode);
loginScript.runInContext(sandbox);
const handlerAfter = events['keydown'];
assert.strictEqual(handlerAfter, handlerBefore, 'login-init nao deve registrar outro keydown');

// Simular pressionar Enter
handlerAfter({ key: 'Enter' });
assert.strictEqual(callCount, 1);

console.log('✔ login-keydown.test.js passou');

