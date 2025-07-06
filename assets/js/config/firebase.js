/* ========== 🔥 CONFIGURAÇÃO FIREBASE v7.3.0 - LIMPO ========== */
const vLog = window.vLog || function(){};

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

// ✅ EXPOSIÇÃO CONSOLIDADA NO WINDOW (uma única vez)
window.firebase = firebase;
window.database = database;
window.auth = auth;

// ✅ CONSTANTES FIREBASE
const FIREBASE_CONFIG = {
    VERSAO_DB: 7,
    TIMEOUT_OPERACAO: 10000,
    MAX_TENTATIVAS: 3,
    INTERVALO_RETRY: 1000
};

// ✅ FUNÇÃO DE CONECTIVIDADE (sem exposição redundante)
function verificarConectividade() {
    return new Promise((resolve) => {
        database.ref('.info/connected').once('value', (snapshot) => {
            resolve(snapshot.val() === true);
        });
    });
}

// ✅ VERIFICAÇÃO INICIAL SIMPLIFICADA
verificarConectividade().then(conectado => {
    if (conectado) {
        vLog('✅ Firebase conectado v7.3.0');
    } else {
        console.warn('⚠️ Firebase offline - modo limitado');
    }
}).catch(error => {
    console.error('❌ Erro conectividade Firebase:', error);
});

vLog('🔥 Firebase v7.3.0 LIMPO - exposições consolidadas');
