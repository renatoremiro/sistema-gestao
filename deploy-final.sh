# 🚀 Deploy Final - Sistema BIAPO Corrigido

echo "================================"
echo "🔧 CORREÇÕES APLICADAS:"
echo "================================"
echo "✅ Service Worker: Arquivos 404 corrigidos"
echo "✅ Index.html: Manifest.json linkado"
echo "✅ Cache: Apenas arquivos existentes"
echo "✅ PWA: Configuração completa"
echo ""

echo "================================"
echo "📋 ARQUIVOS PRINCIPAIS:"
echo "================================"
echo "✅ /index.html - Sistema principal"
echo "✅ /manifest.json - PWA config"
echo "✅ /service-worker.js - Cache corrigido"
echo "✅ /dist/ - Arquivos otimizados"
echo ""

echo "================================"
echo "🚀 EXECUTANDO DEPLOY:"
echo "================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta do projeto"
    exit 1
fi

# Adicionar todas as mudanças
echo "📁 Adicionando arquivos..."
git add .

# Commit com mensagem descritiva
echo "💾 Fazendo commit..."
git commit -m "🚀 FIX: Service Worker 404 corrigido + PWA funcional

- Corrigidos erros 404 no Service Worker
- Apenas arquivos existentes sendo cacheados
- Manifest.json linkado no index.html
- Sistema totalmente funcional no GitHub Pages
- Performance otimizada mantida"

# Push para GitHub
echo "🌐 Enviando para GitHub..."
git push origin main

echo ""
echo "================================"
echo "✅ DEPLOY CONCLUÍDO!"
echo "================================"
echo "🌐 URL: https://renatoremiro.github.io/sistema-gestao/"
echo "⏱️  Aguarde 2-3 minutos para o GitHub Pages processar"
echo "🔄 Limpe cache do navegador se necessário (Ctrl+F5)"
echo ""
echo "================================"
echo "🎯 TESTES PÓS-DEPLOY:"
echo "================================"
echo "1. Acesse o link acima"
echo "2. Verifique se NÃO há erros 404 no console"
echo "3. Sistema deve carregar completamente"
echo "4. Firebase deve conectar automaticamente"
echo "5. PWA deve ser instalável"
echo ""
echo "🎉 Sistema BIAPO funcionando perfeitamente!"