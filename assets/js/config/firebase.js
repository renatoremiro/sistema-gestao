/* ========== 🔥 CONFIGURAÇÃO FIREBASE v6.2.1 - CORRIGIDO ========== */

// ✅ CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCT0UXyU6AeurlaZdgM4_MKhzJWIdYxWg4",
    authDomain: "sistema-gestao-obra.firebaseapp.com",
    databaseURL: "https://sistema-gestao-obra-default-rtdb.firebaseio.com",
    projectId: "sistema-gestao-obra",
    storageBucket: "sistema-gestao-obra.firebasestorage.app",
    messagingSenderId: "686804029278",
    appId: "1:686804029278:web:758190822a19ef935e89cf",
    measurementId: "G-RE86WX5KY2"
};

// ✅ INICIALIZAR FIREBASE
firebase.initializeApp(firebaseConfig);

// ✅ CRIAR SERVIÇOS FIREBASE
const database = firebase.database();
const auth = firebase.auth();

// 🔧 CORREÇÃO CRÍTICA: EXPOR NO WINDOW GLOBAL
window.database = database;
window.auth = auth;
window.firebase = firebase; // Garantir que firebase também está no window

// ✅ VERIFICAÇÃO DE CONECTIVIDADE
function verificarConectividade() {
    return new Promise((resolve) => {
        database.ref('.info/connected').once('value', (snapshot) => {
            resolve(snapshot.val() === true);
        });
    });
}

// ✅ EXPOR FUNÇÃO NO WINDOW
window.verificarConectividade = verificarConectividade;

// ✅ CONSTANTES FIREBASE
const FIREBASE_CONFIG = {
    VERSAO_DB: 6,
    TIMEOUT_OPERACAO: 10000, // 10 segundos
    MAX_TENTATIVAS: 3,
    INTERVALO_RETRY: 1000, // 1 segundo
};

// 🔧 EXPOR CONFIGURAÇÕES NO WINDOW
window.FIREBASE_CONFIG = FIREBASE_CONFIG;

// ✅ LOG DE INICIALIZAÇÃO
console.log('🔥 Firebase configurado v6.2.1 - CORRIGIDO');

// 🔧 VERIFICAÇÃO DA CORREÇÃO
console.log('🧪 Verificando exposições no window:');
console.log('  window.database:', typeof window.database);
console.log('  window.auth:', typeof window.auth);
console.log('  window.firebase:', typeof window.firebase);

// ✅ VERIFICAÇÃO INICIAL DE CONECTIVIDADE
verificarConectividade().then(conectado => {
    if (conectado) {
        console.log('✅ Firebase conectado na inicialização');
    } else {
        console.warn('⚠️ Firebase desconectado na inicialização');
    }
}).catch(error => {
    console.error('❌ Erro na verificação de conectividade:', error);
});
