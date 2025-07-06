/* ========== 🔥 CONFIGURAÇÃO FIREBASE v7.3.0 - LIMPO ========== */

// ✅ CARREGAR CONFIGURAÇÃO
function carregarConfigDeVariaveis() {
    if (typeof process !== 'undefined' && process.env && process.env.FIREBASE_API_KEY) {
        return {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID
        };
    }

    if (typeof window !== 'undefined' && window.firebaseConfig) {
        return window.firebaseConfig;
    }

    return null;
}

function carregarConfigDeArquivo() {
    try {
        var request = new XMLHttpRequest();
        request.open('GET', 'assets/js/config/firebaseConfig.json', false); // sincronamente
        request.send(null);
        if (request.status === 200) {
            return JSON.parse(request.responseText);
        }
    } catch (e) {
        console.error('Erro ao carregar firebaseConfig.json', e);
    }
    return null;
}

const firebaseConfig = carregarConfigDeVariaveis() || carregarConfigDeArquivo();

// ✅ INICIALIZAR FIREBASE
let database = null;
let auth = null;

if (firebaseConfig) {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    auth = firebase.auth();
} else {
    console.error('Configuração do Firebase não encontrada.');
}

// ✅ CRIAR SERVIÇOS FIREBASE APENAS SE INICIALIZADO

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
        console.log('✅ Firebase conectado v7.3.0');
    } else {
        console.warn('⚠️ Firebase offline - modo limitado');
    }
}).catch(error => {
    console.error('❌ Erro conectividade Firebase:', error);
});

console.log('🔥 Firebase v7.3.0 LIMPO - exposições consolidadas');
