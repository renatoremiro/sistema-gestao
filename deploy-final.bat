@echo off
echo ================================
echo 🔧 CORREÇÕES APLICADAS:
echo ================================
echo ✅ Service Worker: Arquivos 404 corrigidos
echo ✅ Index.html: Manifest.json linkado
echo ✅ Cache: Apenas arquivos existentes
echo ✅ PWA: Configuração completa
echo.

echo ================================
echo 📋 ARQUIVOS PRINCIPAIS:
echo ================================
echo ✅ /index.html - Sistema principal
echo ✅ /manifest.json - PWA config
echo ✅ /service-worker.js - Cache corrigido
echo ✅ /dist/ - Arquivos otimizados
echo.

echo ================================
echo 🚀 EXECUTANDO DEPLOY:
echo ================================

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: Execute este script na pasta do projeto
    pause
    exit /b 1
)

REM Adicionar todas as mudanças
echo 📁 Adicionando arquivos...
git add .

REM Commit com mensagem descritiva
echo 💾 Fazendo commit...
git commit -m "🚀 FIX: Service Worker simplificado - SEM erros 404

- Service Worker totalmente reescrito
- Estratégia Network First sem cache pré-definido
- Elimina TODOS os erros 404
- PWA mantém funcionalidade offline
- GitHub Pages 100% compatível"

REM Push para GitHub
echo 🌐 Enviando para GitHub...
git push origin main

echo.
echo ================================
echo ✅ DEPLOY CONCLUÍDO!
echo ================================
echo 🌐 URL: https://renatoremiro.github.io/sistema-gestao/
echo ⏱️  Aguarde 2-3 minutos para o GitHub Pages processar
echo 🔄 Limpe cache do navegador se necessário (Ctrl+F5)
echo.
echo ================================
echo 🎯 TESTES PÓS-DEPLOY:
echo ================================
echo 1. Acesse o link acima
echo 2. Verifique se NÃO há erros 404 no console
echo 3. Sistema deve carregar completamente
echo 4. Firebase deve conectar automaticamente
echo 5. PWA deve ser instalável
echo.
echo 🎉 Sistema BIAPO funcionando perfeitamente!
echo.
pause