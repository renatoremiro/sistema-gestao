const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/js/modules/auth.js', 'utf8');

const messages = [];
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  console,
  Notifications: { error: (msg) => messages.push(msg), warning: () => {}, info: () => {} },
  Persistence: { state: {} },
  App: {},
  Helpers: { storage: { set: () => {}, get: () => null } },
  setTimeout,
  setInterval
};
vm.createContext(sandbox);

const script = new vm.Script(code + ';Auth');
const Auth = script.runInContext(sandbox);

Auth.init();

assert.ok(messages.some(m => m.includes('Firebase não configurado')));

console.log('✔ auth-missing-config.test.js passou');
