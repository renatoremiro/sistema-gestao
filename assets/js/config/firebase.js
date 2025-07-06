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
    return fetch('assets/js/config/firebaseConfig.json')
        .then(response => response.ok ? response.json() : null)
        .catch((e) => {
            console.error('Erro ao carregar firebaseConfig.json', e);
            return null;
        });
}

const firebaseConfigPromise = Promise
    .resolve(carregarConfigDeVariaveis())
    .then(cfg => cfg || carregarConfigDeArquivo());

// ✅ INICIALIZAR FIREBASE ASSINCRONAMENTE
let database = null;
let auth = null;

window.firebaseInitPromise = firebaseConfigPromise
    .then(async (cfg) => {
        if (!cfg) {
            console.error('Configuração do Firebase não encontrada.');
            const msg = 'Firebase não configurado. Consulte o README.md (seção "Configuração do Firebase")';
            if (typeof Notifications !== 'undefined') {
                Notifications.error(msg);
            } else if (typeof alert === 'function') {
                alert(msg);
            }
            return null;
        }

        firebase.initializeApp(cfg);
        database = firebase.database();
        auth = firebase.auth();

        const conectado = await verificarConectividade();
        if (conectado) {
            console.log('✅ Firebase conectado v7.3.0');
        } else {
            console.warn('⚠️ Firebase offline - modo limitado');
        }

        return cfg;
    })
    .catch((error) => {
        console.error('❌ Erro conectividade Firebase:', error);
        const msg = 'Falha ao inicializar o Firebase. Consulte o README.md (seção "Configuração do Firebase")';
        if (typeof Notifications !== 'undefined') {
            Notifications.error(msg);
        } else if (typeof alert === 'function') {
            alert(msg);
        }
        return null;
    })
    .finally(() => {
        window.firebase = firebase;
        window.database = database;
        if (auth) {
            window.auth = auth;
        }
        console.log('🔥 Firebase v7.3.0 LIMPO - exposições consolidadas');
    });

// ✅ CRIAR SERVIÇOS FIREBASE APENAS SE INICIALIZADO

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

