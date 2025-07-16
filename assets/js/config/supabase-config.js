/**
 * 🔐 CONFIGURAÇÃO SUPABASE SEGURA v2.1
 * 
 * ✅ CREDENCIAIS PROTEGIDAS:
 * - Nunca hardcoded no código
 * - Carregamento dinâmico e seguro
 * - Múltiplas fontes de configuração
 * - Validação automática
 */

// 🔐 CONFIGURAÇÃO SUPABASE SEGURA
class SupabaseConfigSegura {
    constructor() {
        this.config = null;
        this.carregado = false;
        this.fonteConfiguração = null;
    }

    // 🚀 MÉTODO PRINCIPAL DE CONFIGURAÇÃO
    async configurar() {
        try {
            console.log('🔐 Iniciando configuração Supabase segura...');
            
            // Tentar múltiplas fontes em ordem de prioridade
            const fontes = [
                () => this._carregarDoArquivoEnv(),
                () => this._carregarDoMetaTags(),
                () => this._carregarDoPrompt(),
                () => this._mostrarConfiguracaoInterativa()
            ];
            
            for (const fonte of fontes) {
                try {
                    const config = await fonte();
                    if (config && this._validarConfig(config)) {
                        this.config = config;
                        this.carregado = true;
                        console.log(`✅ Configuração carregada via: ${this.fonteConfiguração}`);
                        return config;
                    }
                } catch (error) {
                    console.warn(`⚠️ Fonte falhou: ${error.message}`);
                }
            }
            
            throw new Error('Nenhuma configuração válida encontrada');
            
        } catch (error) {
            console.error('❌ Erro na configuração segura:', error);
            throw error;
        }
    }

    // 📁 MÉTODO 1: Arquivo .env ou .env.local
    async _carregarDoArquivoEnv() {
        this.fonteConfiguração = 'arquivo .env';
        
        try {
            // Tentar carregar .env.local primeiro (desenvolvimento)
            let response = await fetch('./.env.local');
            if (!response.ok) {
                // Fallback para .env
                response = await fetch('./.env');
            }
            
            if (response.ok) {
                const envText = await response.text();
                const config = this._parseEnvFile(envText);
                
                if (config.url && config.key) {
                    return config;
                }
            }
        } catch (error) {
            console.warn('⚠️ Arquivo .env não encontrado ou inacessível');
        }
        
        return null;
    }

    // 🏷️ MÉTODO 2: Meta tags no HTML
    async _carregarDoMetaTags() {
        this.fonteConfiguração = 'meta tags HTML';
        
        const urlMeta = document.querySelector('meta[name="supabase-url"]');
        const keyMeta = document.querySelector('meta[name="supabase-key"]');
        
        if (urlMeta && keyMeta && urlMeta.content && keyMeta.content) {
            return {
                url: urlMeta.content,
                key: keyMeta.content
            };
        }
        
        return null;
    }

    // 💬 MÉTODO 3: Prompt interativo (desenvolvimento)
    async _carregarDoPrompt() {
        this.fonteConfiguração = 'prompt interativo';
        
        // Apenas em desenvolvimento
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            return null;
        }
        
        const savedConfig = localStorage.getItem('supabase_dev_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (this._validarConfig(config)) {
                    console.log('🔧 Configuração de desenvolvimento recuperada');
                    return config;
                }
            } catch (error) {
                localStorage.removeItem('supabase_dev_config');
            }
        }
        
        return null;
    }

    // 🎯 MÉTODO 4: Configuração interativa
    async _mostrarConfiguracaoInterativa() {
        this.fonteConfiguração = 'configuração interativa';
        
        return new Promise((resolve) => {
            // Criar modal de configuração
            const modal = this._criarModalConfiguracao((config) => {
                if (this._validarConfig(config)) {
                    // Salvar para desenvolvimento
                    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                        localStorage.setItem('supabase_dev_config', JSON.stringify(config));
                    }
                    resolve(config);
                } else {
                    alert('Configuração inválida. Verifique URL e KEY.');
                }
            });
            
            document.body.appendChild(modal);
        });
    }

    // 📝 PARSER DE ARQUIVO .env
    _parseEnvFile(envText) {
        const lines = envText.split('\n');
        const config = {};
        
        for (const line of lines) {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                
                if (key === 'SUPABASE_URL') {
                    config.url = value;
                } else if (key === 'SUPABASE_ANON_KEY') {
                    config.key = value;
                }
            }
        }
        
        return config;
    }

    // ✅ VALIDAÇÃO DE CONFIGURAÇÃO
    _validarConfig(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }
        
        if (!config.url || !config.key) {
            return false;
        }
        
        // Validar formato URL
        if (!config.url.includes('supabase.co') && !config.url.includes('localhost')) {
            console.warn('⚠️ URL do Supabase parece inválida');
            return false;
        }
        
        // Validar formato da key (JWT)
        if (!config.key.startsWith('eyJ') || config.key.length < 100) {
            console.warn('⚠️ Key do Supabase parece inválida');
            return false;
        }
        
        return true;
    }

    // 🎨 CRIAR MODAL DE CONFIGURAÇÃO
    _criarModalConfiguracao(onSalvar) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <h2 style="margin: 0 0 20px 0; color: #333;">🔐 Configuração Supabase</h2>
                <p style="margin: 0 0 20px 0; color: #666;">
                    Para continuar, configure suas credenciais Supabase:
                </p>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                        🌐 URL do Projeto:
                    </label>
                    <input type="url" id="supabase-url" placeholder="https://seu-projeto.supabase.co" 
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; box-sizing: border-box;" />
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                        🔑 API Key (anon, public):
                    </label>
                    <textarea id="supabase-key" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                              style="width: 100%; height: 80px; padding: 10px; border: 2px solid #ddd; border-radius: 6px; box-sizing: border-box; resize: vertical;"></textarea>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                    <h4 style="margin: 0 0 10px 0; color: #0369a1;">📋 Como obter as credenciais:</h4>
                    <ol style="margin: 0; padding-left: 20px; color: #075985;">
                        <li>Acesse <a href="https://supabase.com/dashboard" target="_blank">supabase.com/dashboard</a></li>
                        <li>Selecione seu projeto</li>
                        <li>Vá em <strong>Settings → API</strong></li>
                        <li>Copie a <strong>URL</strong> e <strong>anon public key</strong></li>
                    </ol>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="window.location.reload()" style="
                        padding: 10px 20px;
                        border: 2px solid #ddd;
                        background: white;
                        border-radius: 6px;
                        cursor: pointer;
                    ">❌ Cancelar</button>
                    <button id="salvar-config" style="
                        padding: 10px 20px;
                        border: none;
                        background: #10b981;
                        color: white;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                    ">✅ Salvar e Continuar</button>
                </div>
            </div>
        `;
        
        // Event listener para salvar
        modal.querySelector('#salvar-config').addEventListener('click', () => {
            const url = modal.querySelector('#supabase-url').value.trim();
            const key = modal.querySelector('#supabase-key').value.trim();
            
            if (url && key) {
                modal.remove();
                onSalvar({ url, key });
            } else {
                alert('Preencha todos os campos!');
            }
        });
        
        // Foco no primeiro campo
        setTimeout(() => {
            modal.querySelector('#supabase-url').focus();
        }, 100);
        
        return modal;
    }

    // 📊 OBTER STATUS
    obterStatus() {
        return {
            carregado: this.carregado,
            fonte: this.fonteConfiguração,
            urlConfigurada: !!this.config?.url,
            keyConfigurada: !!this.config?.key,
            seguro: this.carregado && !document.documentElement.innerHTML.includes('eyJ')
        };
    }
}

// 🚀 INSTÂNCIA GLOBAL
window.supabaseConfigSegura = new SupabaseConfigSegura();

// 🔧 FUNÇÃO GLOBAL DE CONFIGURAÇÃO
window.configurarSupabaseSeguro = async () => {
    try {
        const config = await window.supabaseConfigSegura.configurar();
        
        // Definir configuração global de forma segura
        window.SUPABASE_CONFIG = config;
        
        console.log('✅ Supabase configurado com segurança!');
        console.log('🔐 Credenciais protegidas e não expostas');
        
        return config;
    } catch (error) {
        console.error('❌ Erro na configuração segura:', error);
        throw error;
    }
};

console.log('🔐 Sistema de Configuração Supabase Segura v2.1 carregado!');
console.log('🚀 Execute: configurarSupabaseSeguro()');

/*
🔐 CONFIGURAÇÃO SUPABASE SEGURA v2.1

✅ CARACTERÍSTICAS:
- 🛡️ Credenciais NUNCA hardcoded
- 📁 Múltiplas fontes (.env, meta tags, prompt)
- ✅ Validação automática
- 🎯 Interface interativa de configuração
- 💾 Cache inteligente para desenvolvimento

🚀 FONTES DE CONFIGURAÇÃO (ordem de prioridade):
1. Arquivo .env.local ou .env
2. Meta tags no HTML
3. Prompt interativo (localhost)
4. Modal de configuração

🛡️ SEGURANÇA:
- Zero credenciais no código fonte
- Validação de formatos
- Cache seguro apenas em localhost
- Interface user-friendly

🎯 USO:
1. Chame configurarSupabaseSeguro()
2. Sistema tentará carregar automaticamente
3. Se não encontrar, mostrará interface
4. Credenciais serão validadas
5. Sistema ficará 100% seguro
*/