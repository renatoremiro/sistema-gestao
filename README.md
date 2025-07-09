# sistema-gestao
Sistema de Gestão - Obra 292

## Estrutura do repositório

Versões antigas da interface e módulos obsoletos agora residem na pasta
`legacy/`. A raiz do projeto contém apenas os arquivos atualmente
utilizados.

## Testes

Execute a suíte completa utilizando o NPM:

```bash
npm test
```

Se preferir rodar um teste isolado basta chamar o arquivo diretamente com o
Node.js, por exemplo:

```bash
node tests/helpers.test.js
```

## Configuração do Firebase

O sistema busca as credenciais do Firebase a partir de variáveis de ambiente
ou de um arquivo `assets/js/config/firebaseConfig.json` (que é ignorado pelo
Git). As variáveis de ambiente reconhecidas são:

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
