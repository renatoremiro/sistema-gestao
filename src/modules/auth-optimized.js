import { debounce } from '../utils/debounce.js';

export class OptimizedAuth {
  constructor() {
    this.config = {
      versao: '8.12.1-optimized',
      autoLogin: true,
      lembrarUsuario: true,
      sistemaEmails: true,
      sistemaAdmin: true,
      debug: false,
      
      carregarDoFirebase: true,
      pathsFirebase: ['dados/auth_equipe', 'auth/equipe'],
      timeoutCarregamento: 3000,
      maxTentativasCarregamento: 2,
      cacheCarregamento: 300000,
      
      performance: {
        cacheEnabled: true,
        cacheTTL: 600000,
        debounceDelay: 1000,
        maxRetries: 3
      }
    };

    this.equipe = new Map([
      ['renato', {
        nome: 'Renato Remiro',
        email: 'renatoremiro@biapo.com.br',
        cargo: 'Coordenador Geral',
        departamento: 'Documentação & Arquivo',
        admin: true,
        ativo: true,
        telefone: '',
        dataIngresso: '2024-01-01'
      }],
      ['bruna', {
        nome: 'Bruna Britto',
        email: 'brunabritto@biapo.com.br',
        cargo: 'Arquiteta',
        departamento: 'Documentação & Arquivo',
        admin: false,
        ativo: true,
        telefone: '',
        dataIngresso: '2024-01-01'
      }],
      ['alex', {
        nome: 'Alex',
        email: 'alex@biapo.com.br',
        cargo: 'Comprador',
        departamento: 'Suprimentos',
        admin: false,
        ativo: true,
        telefone: '',
        dataIngresso: '2024-01-01'
      }]
    ]);

    this.departamentos = [
      'Planejamento & Controle',
      'Documentação & Arquivo',
      'Suprimentos',
      'Qualidade & Produção',
      'Recursos Humanos'
    ];

    this.state = {
      usuario: null,
      logado: false,
      tentativasLogin: 0,
      ultimoLogin: null,
      sessaoIniciada: null,
      
      equipeCarregadaDoFirebase: false,
      ultimoCarregamentoFirebase: null,
      fonteEquipeAtual: 'hardcoded_optimized',
      departamentosCarregadosDoFirebase: false,
      fonteDepartamentosAtual: 'hardcoded_optimized',
      
      firebaseDisponivel: null,
      ultimaVerificacaoFirebase: null,
      cacheCarregamento: null,
      
      performanceMetrics: {
        loginTimes: [],
        avgLoginTime: 0,
        cacheHits: 0,
        cacheMisses: 0
      }
    };

    this.cache = new Map();
    this.debouncedVerifyFirebase = debounce(() => this._verificarFirebaseReal(), this.config.performance.debounceDelay);
  }

  async init() {
    try {
      performance.mark('auth-init-start');
      
      this._setupCache();
      
      if (this.config.carregarDoFirebase) {
        await this._carregarEquipeDoFirebase();
      }
      
      if (!this.autoLogin()) {
        this.mostrarLogin();
      }
      
      performance.mark('auth-init-end');
      performance.measure('auth-init', 'auth-init-start', 'auth-init-end');
      
    } catch (error) {
      console.error('❌ Erro na inicialização do Auth:', error);
      this.mostrarLogin();
    }
  }

  login(identificador, senha) {
    const startTime = performance.now();
    
    try {
      const nomeKey = this._normalizarIdentificador(identificador);
      const dadosUsuario = this.equipe.get(nomeKey);
      
      if (!dadosUsuario) {
        this.mostrarMensagem('Usuário não encontrado na equipe BIAPO', 'error');
        this.state.tentativasLogin++;
        return false;
      }

      if (!dadosUsuario.ativo) {
        this.mostrarMensagem('Usuário inativo no sistema', 'error');
        return false;
      }

      this.state.usuario = {
        email: dadosUsuario.email,
        displayName: dadosUsuario.nome,
        nome: dadosUsuario.nome,
        primeiroNome: nomeKey,
        cargo: dadosUsuario.cargo,
        departamento: dadosUsuario.departamento,
        admin: dadosUsuario.admin,
        ativo: dadosUsuario.ativo,
        telefone: dadosUsuario.telefone,
        dataIngresso: dadosUsuario.dataIngresso,
        uid: 'biapo_' + nomeKey,
        loginTimestamp: new Date().toISOString()
      };
      
      this.state.logado = true;
      this.state.tentativasLogin = 0;
      this.state.ultimoLogin = new Date().toISOString();
      this.state.sessaoIniciada = new Date().toISOString();

      const loginTime = performance.now() - startTime;
      this.state.performanceMetrics.loginTimes.push(loginTime);
      this.state.performanceMetrics.avgLoginTime = 
        this.state.performanceMetrics.loginTimes.reduce((a, b) => a + b, 0) / 
        this.state.performanceMetrics.loginTimes.length;

      this._integrarComApp();
      this._salvarPreferencias();
      this.mostrarSistema();
      
      this.mostrarMensagem('Bem-vindo, ' + dadosUsuario.nome + '!', 'success');
      this._executarCallbacksLogin();
      
      return true;

    } catch (error) {
      console.error('❌ Erro no login:', error);
      this.mostrarMensagem('Erro interno no login', 'error');
      return false;
    }
  }

  logout() {
    try {
      const nomeAnterior = this.state.usuario ? this.state.usuario.displayName : 'Usuário';
      
      this.state.usuario = null;
      this.state.logado = false;
      this.state.sessaoIniciada = null;
      
      this._limparIntegracaoApp();
      this.esconderSistema();
      this.mostrarLogin();
      
      this.mostrarMensagem('Até logo, ' + nomeAnterior + '!', 'info');
      this._executarCallbacksLogout();
      
      return true;

    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return false;
    }
  }

  estaLogado() {
    return this.state.logado && this.state.usuario !== null;
  }

  ehAdmin() {
    return this.state.usuario && this.state.usuario.admin === true;
  }

  obterUsuario() {
    return this.state.usuario;
  }

  listarUsuarios(filtros) {
    const usuarios = [];
    
    for (const [key, usuario] of this.equipe.entries()) {
      if (!filtros || this._aplicarFiltros(usuario, filtros)) {
        usuarios.push({
          id: key,
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo,
          departamento: usuario.departamento,
          admin: usuario.admin,
          ativo: usuario.ativo
        });
      }
    }
    
    return usuarios;
  }

  _normalizarIdentificador(identificador) {
    if (!identificador) return '';
    
    if (identificador.includes('@')) {
      identificador = identificador.split('@')[0];
    }
    
    return identificador.toLowerCase().trim();
  }

  _integrarComApp() {
    if (window.App) {
      App.usuarioAtual = this.state.usuario;
      if (App.estadoSistema) {
        App.estadoSistema.usuarioAutenticado = true;
        App.estadoSistema.usuarioEmail = this.state.usuario.email;
        App.estadoSistema.usuarioNome = this.state.usuario.displayName;
        App.estadoSistema.modoAnonimo = false;
      }
    }
  }

  _executarCallbacksLogin() {
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('biapo-login', {
        detail: { usuario: this.state.usuario }
      }));
    }
  }

  mostrarMensagem(mensagem, tipo) {
    if (window.Notifications) {
      switch (tipo) {
        case 'success':
          if (Notifications.success) Notifications.success(mensagem);
          break;
        case 'error':
          if (Notifications.error) Notifications.error(mensagem);
          break;
        case 'warning':
          if (Notifications.warning) Notifications.warning(mensagem);
          break;
        default:
          if (Notifications.info) Notifications.info(mensagem);
      }
    } else {
      console.log(tipo.toUpperCase() + ':', mensagem);
    }
  }

  mostrarSistema() {
    try {
      this._esconderTodasTelasLogin();
      
      const mainContainer = document.getElementById('mainContainer');
      if (mainContainer) {
        mainContainer.style.display = 'block';
        mainContainer.classList.remove('hidden');
      }

      this._atualizarInterfaceUsuario();

    } catch (error) {
      console.error('❌ Erro ao mostrar sistema:', error);
    }
  }

  esconderSistema() {
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) {
      mainContainer.style.display = 'none';
      mainContainer.classList.add('hidden');
    }
  }

  mostrarLogin() {
    this.esconderSistema();
    console.log('Login screen should appear');
  }

  _esconderTodasTelasLogin() {
    const logins = document.querySelectorAll('[id*="login"], .auth-login-screen');
    logins.forEach(login => login.remove());
  }

  _atualizarInterfaceUsuario() {
    if (!this.state.usuario) return;
    
    const usuarioElement = document.getElementById('usuarioLogado');
    if (usuarioElement) {
      usuarioElement.textContent = '👤 ' + this.state.usuario.displayName;
    }
  }

  _salvarPreferencias() {
    if (this.config.lembrarUsuario) {
      localStorage.setItem('ultimoUsuarioBiapo', this.state.usuario.primeiroNome);
      localStorage.setItem('lembrarUsuarioBiapo', 'true');
    }
  }

  _limparIntegracaoApp() {
    if (window.App) {
      App.usuarioAtual = null;
      if (App.estadoSistema) {
        App.estadoSistema.usuarioAutenticado = false;
        App.estadoSistema.usuarioEmail = null;
        App.estadoSistema.usuarioNome = null;
        App.estadoSistema.modoAnonimo = true;
      }
    }
  }

  _executarCallbacksLogout() {
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('biapo-logout'));
    }
  }

  _aplicarFiltros(usuario, filtros) {
    if (filtros.ativo !== undefined && usuario.ativo !== filtros.ativo) {
      return false;
    }
    if (filtros.admin !== undefined && usuario.admin !== filtros.admin) {
      return false;
    }
    if (filtros.departamento && usuario.departamento !== filtros.departamento) {
      return false;
    }
    return true;
  }

  autoLogin() {
    try {
      if (!this.config.autoLogin || this.state.logado) {
        return false;
      }

      const ultimoUsuario = localStorage.getItem('ultimoUsuarioBiapo');
      const lembrarUsuario = localStorage.getItem('lembrarUsuarioBiapo') === 'true';
      
      if (ultimoUsuario && lembrarUsuario && this.equipe.has(ultimoUsuario)) {
        return this.login(ultimoUsuario);
      }

      return false;

    } catch (error) {
      console.error('❌ Erro no auto-login:', error);
      return false;
    }
  }
}

export default OptimizedAuth;
