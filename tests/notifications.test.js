const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const code = fs.readFileSync('assets/js/utils/notifications.js', 'utf8');

const dom = new JSDOM('<!DOCTYPE html><body></body>', { runScripts: 'outside-only' });
const { window } = dom;
window.requestAnimationFrame = (cb) => cb();

const sandbox = {
  window,
  document: window.document,
  console,
  requestAnimationFrame: window.requestAnimationFrame,
  setTimeout: window.setTimeout,
};
vm.createContext(sandbox);

const script = new vm.Script(code);
script.runInContext(sandbox);

window.wasExecuted = false;
window.Notifications.success('<script>window.wasExecuted = true;</script>', 'Alerta');

const toast = window.document.querySelector('.toast');
assert.ok(toast);
assert.strictEqual(toast.querySelector('script'), null);
assert.strictEqual(window.wasExecuted, false);
assert.ok(toast.textContent.includes('<script>'));

console.log('✔ notifications.test.js passou');
