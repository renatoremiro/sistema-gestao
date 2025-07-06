(function () {
  const DURATION = 4000;

  function getContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function createToast(message, type, title) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = title ? `<strong>${title}</strong> ${message}` : message;
    toast.addEventListener('click', () => toast.remove());
    return toast;
  }

  function mostrarToast(message, tipo = 'info', title = '') {
    const map = {
      sucesso: 'success',
      erro: 'error',
      aviso: 'warning',
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    const type = map[tipo] || 'info';
    const container = getContainer();
    const toast = createToast(message, type, title);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      toast.remove();
    }, DURATION);
  }

  function mostrarConfirmacao(titulo, mensagem, callback) {
    const result = window.confirm(`${titulo}\n\n${mensagem}`);
    if (typeof callback === 'function') callback(result);
    return result;
  }

  window.Notifications = {
    success(msg, title) {
      mostrarToast(msg, 'success', title);
    },
    error(msg, title) {
      mostrarToast(msg, 'error', title);
    },
    warning(msg, title) {
      mostrarToast(msg, 'warning', title);
    },
    info(msg, title) {
      mostrarToast(msg, 'info', title);
    },
    mostrarToast,
    mostrarConfirmacao,
  };
})();
