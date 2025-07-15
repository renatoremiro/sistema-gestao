const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/js/modules/persistence.js', 'utf8');

const createStore = () => {
  return {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = String(val); },
    removeItem(key) { delete this._data[key]; }
  };
};

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({ style: {}, appendChild: () => {}, remove: () => {} }),
    body: { appendChild: () => {} },
    getElementById: () => null,
    hidden: false
  },
  sessionStorage: createStore(),
  localStorage: createStore(),
  console,
  App: {
    estadoSistema: { usuarioEmail: 'tester@example.com' },
    dados: { foo: 'bar' }
  },
  Helpers: { storage: { set: () => {}, get: () => null } }
};
vm.createContext(sandbox);

const script = new vm.Script(code + ';Persistence');
const Persistence = script.runInContext(sandbox);

const checksum1 = Persistence._calcularChecksum({a:1});
const checksum2 = Persistence._calcularChecksum({a:1});
assert.strictEqual(checksum1, checksum2);

const backup = {
  dados: {foo:'bar'},
  timestamp: new Date().toISOString(),
  versao: '7.4',
  usuario: 'tester@example.com',
  checksum: Persistence._calcularChecksum({foo:'bar'})
};
assert.ok(Persistence._validarBackup(backup));

sandbox.sessionStorage.setItem(Persistence.config.BACKUP_LOCAL_KEY, JSON.stringify(backup));
const rec = Persistence.recuperarBackupLocal();
assert.strictEqual(JSON.stringify(rec), JSON.stringify(backup.dados));

console.log('✔ persistence.test.js passou');
