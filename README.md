# sistema-gestao
Sistema de Gestão - Obra 292

## Como executar

Com a modularização, todo o código está concentrado no arquivo
`index.html` e nos scripts dentro de `assets/`. Rode o sistema servindo
o diretório via um servidor estático. Com o Node.js instalado é possível
utilizar o `http-server`:

```bash
npx http-server -p 8080
```

Em seguida acesse `http://localhost:8080/index.html` pelo navegador.

## Configuração do Firebase

Antes de iniciar o servidor defina as credenciais do Firebase.
O sistema busca essas informações em variáveis de ambiente ou em um arquivo
`assets/js/config/firebaseConfig.json` (que é ignorado pelo Git). As variáveis
de ambiente reconhecidas são:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_DATABASE_URL
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID
```

Caso as variáveis não estejam definidas, crie o arquivo `firebaseConfig.json`
com o mesmo formato das credenciais fornecidas pelo Firebase e coloque-o em
`assets/js/config/`.

Se preferir, copie o arquivo de exemplo `assets/js/config/firebaseConfig.sample.json`,
preencha cada campo com as suas credenciais e salve como
`assets/js/config/firebaseConfig.json`. Sem esse arquivo ou variáveis de
ambiente válidas o objeto `auth` ficará indefinido e o login não funcionará.
