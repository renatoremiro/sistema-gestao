# sistema-gestao
Sistema de Gestão - Obra 292

## Estrutura do repositório

Versões antigas da interface e módulos obsoletos agora residem na pasta
`legacy/`. A raiz do projeto contém apenas os arquivos atualmente
utilizados.

## Testes

Para executar o teste de unidade do helper, rode:

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
