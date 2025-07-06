 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/modules/chat-module.js b/modules/chat-module.js
index 50b38ec2d5e4e4b9c80bf5696ec52a03aab923b8..0b5b66c6deeeaa6b9608485cdbc3f7906f4b1c2c 100644
--- a/modules/chat-module.js
+++ b/modules/chat-module.js
@@ -1,42 +1,43 @@
 // ============================================
 // 🎯 CHAT EMPRESARIAL PROFESSIONAL v4.2 LEAN
 // Focado em PRODUTIVIDADE e CONFIABILIDADE
 // ============================================
 
 class ChatEmpresarialPro {
     constructor() {
         this.version = '4.2.0';
         this.isOpen = false;
         this.chatAtivo = 'geral';
         this.usuario = null;
         this.funcionarioAtual = null;
         this.mensagens = new Map();
         this.usuariosOnline = new Set();
         this.chatRef = null;
         this.listeners = [];
-        
+        this.keydownHandler = null;
+
         // Limites de performance
         this.MAX_MENSAGENS = 100;
         this.MAX_MESSAGE_LENGTH = 1000;
         this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
         
         console.log('🚀 Iniciando Chat Professional v4.2...');
         this.inicializar();
     }
 
     // ✨ INICIALIZAÇÃO SIMPLIFICADA
     async inicializar() {
         try {
             await this.configurarUsuario();
             this.criarInterface();
             await this.conectarFirebase();
             this.configurarEventos();
             console.log('✅ Chat v4.2 inicializado');
         } catch (error) {
             console.error('❌ Erro na inicialização:', error);
             this.showToast('Erro ao inicializar chat', 'error');
         }
     }
 
     // 👤 CONFIGURAR USUÁRIO
     async configurarUsuario() {
diff --git a/modules/chat-module.js b/modules/chat-module.js
index 50b38ec2d5e4e4b9c80bf5696ec52a03aab923b8..0b5b66c6deeeaa6b9608485cdbc3f7906f4b1c2c 100644
--- a/modules/chat-module.js
+++ b/modules/chat-module.js
@@ -192,59 +193,60 @@ class ChatEmpresarialPro {
             if (mensagem && !this.mensagens.has(mensagem.id)) {
                 this.adicionarMensagem(mensagem);
             }
         });
         this.listeners.push({ ref: msgRef, listener: msgListener });
 
         // Usuários online
         const usersRef = this.chatRef.child('usuarios_online');
         const usersListener = usersRef.on('value', (snapshot) => {
             const usuarios = snapshot.val() || {};
             this.usuariosOnline.clear();
             Object.values(usuarios).forEach(user => {
                 this.usuariosOnline.add(user);
             });
             this.atualizarUsuariosOnline();
         });
         this.listeners.push({ ref: usersRef, listener: usersListener });
     }
 
     // 🎮 CONFIGURAR EVENTOS
     configurarEventos() {
         // Toggle chat
         document.getElementById('chatTogglePro').onclick = () => this.toggle();
 
         // Atalhos
-        document.addEventListener('keydown', (e) => {
+        this.keydownHandler = (e) => {
             if (e.ctrlKey && e.key === '/') {
                 e.preventDefault();
                 this.toggle();
             }
             if (e.key === 'Escape' && this.isOpen) {
                 this.fechar();
             }
-        });
+        };
+        document.addEventListener('keydown', this.keydownHandler);
 
         // Contador de caracteres
         const input = document.getElementById('messageInput');
         input.oninput = () => {
             document.getElementById('charCount').textContent = input.value.length;
         };
     }
 
     // 💬 ENVIAR MENSAGEM
     async enviarMensagem() {
         const input = document.getElementById('messageInput');
         const texto = input.value.trim();
         
         if (!texto) return;
 
         if (texto.length > this.MAX_MESSAGE_LENGTH) {
             this.showToast('Mensagem muito longa', 'error');
             return;
         }
 
         try {
             const mensagem = {
                 id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                 autor: this.usuario.email,
                 nomeAutor: this.funcionarioAtual.nome,
diff --git a/modules/chat-module.js b/modules/chat-module.js
index 50b38ec2d5e4e4b9c80bf5696ec52a03aab923b8..0b5b66c6deeeaa6b9608485cdbc3f7906f4b1c2c 100644
--- a/modules/chat-module.js
+++ b/modules/chat-module.js
@@ -564,50 +566,54 @@ class ChatEmpresarialPro {
     }
 
     limparListeners() {
         this.listeners.forEach(({ ref, listener }) => {
             ref.off('value', listener);
             ref.off('child_added', listener);
         });
         this.listeners = [];
     }
 
     removerInterfaceExistente() {
         const elementos = [
             'chatTogglePro', 'chatPanelPro', 'toastContainer',
             'chatTogglePremium', 'chatPanelPremium', 'chatToggleCorrigido'
         ];
         elementos.forEach(id => {
             const el = document.getElementById(id);
             if (el) el.remove();
         });
     }
 
     // 🧹 DESTRUIR
     destruir() {
         try {
             this.limparListeners();
+            if (this.keydownHandler) {
+                document.removeEventListener('keydown', this.keydownHandler);
+                this.keydownHandler = null;
+            }
             if (this.chatRef && this.usuario) {
                 this.chatRef.child(`usuarios_online/${this.usuario.uid}`).remove();
             }
             this.removerInterfaceExistente();
             console.log('🧹 Chat destruído');
         } catch (error) {
             console.error('Erro ao destruir:', error);
         }
     }
 }
 
 // 📊 DADOS DO SISTEMA
 const FUNCIONARIOS_OBRA = {
     'bruabritto@biapo.com.br': {
         nome: 'Bruna Britto',
         cargo: 'Arquiteta Trainee',
         iniciais: 'BB',
         cor: '#8b5cf6'
     },
     'isabella@biapo.com.br': {
         nome: 'Isabella Rocha',
         cargo: 'Coordenadora Geral',
         iniciais: 'IR',
         cor: '#06b6d4'
     },
 
EOF
)
