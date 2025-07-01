/* ========== 🔥 CONFIGURAÇÃO FIREBASE v6.2 ========== */

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

// ✅ EXPORTAR SERVIÇOS FIREBASE
const database = firebase.database();
const auth = firebase.auth();

// ✅ VERIFICAÇÃO DE CONECTIVIDADE
function verificarConectividade() {
    return new Promise((resolve) => {
        database.ref('.info/connected').once('value', (snapshot) => {
            resolve(snapshot.val() === true);
        });
    });
}

// ✅ CONSTANTES FIREBASE
const FIREBASE_CONFIG = {
    VERSAO_DB: 6,
    TIMEOUT_OPERACAO: 10000, // 10 segundos
    MAX_TENTATIVAS: 3,
    INTERVALO_RETRY: 1000, // 1 segundo
};

// ✅ LOG DE INICIALIZAÇÃO
console.log('🔥 Firebase configurado v6.2');

// ✅ VERIFICAÇÃO INICIAL DE CONECTIVIDADE
verificarConectividade().then(conectado => {
    if (conectado) {
        console.log('✅ Firebase conectado na inicialização');
    } else {
        console.warn('⚠️ Firebase desconectado na inicialização');
    }
});
