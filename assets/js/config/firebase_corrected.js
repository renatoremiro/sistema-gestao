/* ========== 🔥 FIREBASE CORRIGIDO v7.4.0 - BYPASS FETCH ========== */

// 🔥 CONFIGURAÇÃO EMBUTIDA (fallback para quando fetch falha)
const FIREBASE_CONFIG_FALLBACK = {
    apiKey: "AIzaSyCT0UXyU6AeurlaZdgM4_MKhzJWIdYxWg4",
    authDomain: "sistema-gestao-obra.firebaseapp.com",
    databaseURL: "https://sistema-gestao-obra-default-rtdb.firebaseio.com",
    projectId: "sistema-gestao-obra",
    storageBucket: "sistema-gestao-obra.firebasestorage.app",
    messagingSenderId: "686804029278",
    appId: "1:686804029278:web:758190822a19ef935e89cf",
    measurementId: "G-RE86WX5KY2"
};

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
        .then(response => {
            if (!response.ok) {
                console.warn('⚠️ Fetch fallido, usando configuração embutida');
                return FIREBASE_CONFIG_FALLBACK;
            }
            return response.json();
        })
        .catch((e) => {
            console.warn('⚠️ Erro ao carregar firebaseConfig.json, usando fallback:', e.message);
            return FIREBASE_CONFIG_FALLBACK;
        });
}

// 🔥 SEMPRE GARANTIR CONFIGURAÇÃO
const firebaseConfigPromise = Promise
    .resolve(carregarConfigDeVariaveis())
    .then(cfg => cfg || carregarConfigDeArquivo())
    .then(cfg => {
        if (!cfg) {
            console.warn('⚠️ Nenhuma configuração encontrada, usando fallback');
            return FIREBASE_CONFIG_FALLBACK;
        }
        return cfg;
    });

// ✅ INICIALIZAR FIREBASE ASSINCRONAMENTE
let database = null;
let auth = null;
let firebaseInicializado = false;

window.firebaseInitPromise = firebaseConfigPromise
    .then(async (cfg) => {
        try {
            console.log('🔥 Inicializando Firebase com configuração:', cfg ? 'encontrada' : 'fallback');
            
            firebase.initializeApp(cfg);
            database = firebase.database();
            auth = firebase.auth();
            firebaseInicializado = true;

            // Testar conectividade
            const conectado = await verificarConectividade();
            if (conectado) {
                console.log('✅ Firebase conectado v7.4.0');
            } else {
                console.warn('⚠️ Firebase inicializado mas offline - modo limitado');
            }

            return cfg;
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            console.log('🔄 Continuando em modo offline...');
            return cfg;
        }
    })
    .catch((error) => {
        console.error('❌ Erro crítico Firebase:', error);
        console.log('🔄 Sistema continuará em modo offline');
        return FIREBASE_CONFIG_FALLBACK;
    })
    .finally(() => {
        // Sempre expor, mesmo se offline
        window.firebase = firebase;
        window.database = database;
        window.auth = auth;
        window.firebaseInicializado = firebaseInicializado;
        console.log('🔥 Firebase v7.4.0 CORRIGIDO - exposições consolidadas');
    });

// ✅ FUNÇÃO DE CONECTIVIDADE ROBUSTA
function verificarConectividade() {
    return new Promise((resolve) => {
        if (!database) {
            resolve(false);
            return;
        }
        
        const timeout = setTimeout(() => resolve(false), 5000);
        
        database.ref('.info/connected').once('value', (snapshot) => {
            clearTimeout(timeout);
            resolve(snapshot.val() === true);
        }).catch(() => {
            clearTimeout(timeout);
            resolve(false);
        });
    });
}

// 🔥 GARANTIR INICIALIZAÇÃO MESMO EM MODO OFFLINE
if (typeof window !== 'undefined') {
    window.garantirFirebase = function() {
        if (!window.firebase) {
            console.warn('⚠️ Firebase não disponível, criando mock básico');
            window.firebase = {
                database: () => null,
                auth: () => null
            };
        }
        
        if (!window.database && window.firebase) {
            try {
                window.database = window.firebase.database ? window.firebase.database() : null;
            } catch (e) {
                console.warn('⚠️ Database não disponível:', e.message);
                window.database = null;
            }
        }
        
        if (!window.auth && window.firebase) {
            try {
                window.auth = window.firebase.auth ? window.firebase.auth() : null;
            } catch (e) {
                console.warn('⚠️ Auth não disponível:', e.message);
                window.auth = null;
            }
        }
        
        return {
            firebase: !!window.firebase,
            database: !!window.database,
            auth: !!window.auth,
            inicializado: window.firebaseInicializado || false
        };
    };
}

console.log('🔥 Firebase CORRIGIDO v7.4.0 carregado - com bypass de fetch!');
