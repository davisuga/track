# ReceiptIQ

Aplicação para captura, extração e auditoria de recibos com:

- app web em TanStack Start + React
- GraphQL local via Hasura DDN v3
- PostgreSQL como fonte de dados
- Cloudflare R2 para armazenar as imagens dos recibos
- extração OCR/LLM via Google AI ou OpenAI

## Stack local

- app web: `http://localhost:3000`
- GraphQL local (DDN engine): `http://localhost:3280/graphql`
- subscriptions: derivadas automaticamente de `GRAPHQL_URL`
- conector Postgres do DDN: exposto pelo compose do `graphql-api`

## Pré-requisitos

- Bun
  - neste repo o binário usado é `/Users/davi/.nvm/versions/node/v22.15.1/bin/bun`
- Docker
- Hasura DDN CLI v3 em `/usr/local/bin/ddn`
- acesso a um banco PostgreSQL
- bucket R2 já criado
- uma chave de IA:
  - `GOOGLE_AI_KEY` ou `GOOGLE_GENERATIVE_AI_API_KEY`
  - ou `OPENAI_API_KEY`

## Autenticação do DDN

O script local do DDN usa credenciais da sua sessão autenticada:

```bash
/usr/local/bin/ddn auth login
```

Sem isso, `ddn run docker-start` não consegue resolver o token exigido pelo compose local.

## Variáveis de ambiente

Há duas envs importantes:

- `./.env`: usada pela app web
- `./graphql-api/.env`: usada pelo build local do supergraph e pelo compose do DDN

### 1. App web: `./.env`

Crie ou ajuste `./.env` com algo neste formato:

```dotenv
GRAPHQL_URL=http://localhost:3280/graphql
GRAPHQL_AUTH_TOKEN=

APP_MY_PG_CONNECTION_URI=postgres://USER:PASSWORD@HOST:5432/DBNAME

R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# escolha Google OU OpenAI
GOOGLE_AI_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
GOOGLE_AI_MODEL=gemini-2.5-flash
GOOGLE_AI_VISION_MODEL=gemini-2.5-flash

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Observações:

- `GRAPHQL_URL` deve apontar para o engine local do DDN.
- `GRAPHQL_AUTH_TOKEN` é opcional no código. Se seu engine local exigir token, preencha.
- `APP_MY_PG_CONNECTION_URI` também é usada no fluxo de atualização de schema.
- para parsing de recibos, basta Google ou OpenAI. Não precisa configurar os dois.

### 2. DDN local: `./graphql-api/.env`

Crie ou ajuste `./graphql-api/.env`:

```dotenv
APP_MY_PG_AUTHORIZATION_HEADER=
APP_MY_PG_CONNECTION_URI=postgres://USER:PASSWORD@HOST:5432/DBNAME
APP_MY_PG_HASURA_CONNECTOR_PORT=8080
APP_MY_PG_HASURA_SERVICE_TOKEN_SECRET=dev-secret
APP_MY_PG_OTEL_EXPORTER_OTLP_ENDPOINT=http://local.hasura.dev:4317
APP_MY_PG_OTEL_SERVICE_NAME=app_my_pg
APP_MY_PG_READ_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME
APP_MY_PG_WRITE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME
```

Observações:

- `APP_MY_PG_CONNECTION_URI`, `APP_MY_PG_READ_URL` e `APP_MY_PG_WRITE_URL` normalmente apontam para o mesmo banco no ambiente local.
- `APP_MY_PG_HASURA_SERVICE_TOKEN_SECRET` pode ser qualquer segredo estável no desenvolvimento local.
- o repo já contém `graphql-api/.env.cloud`, mas para rodar localmente o arquivo relevante é `graphql-api/.env`.

## Banco de dados

Este repo não provisiona do zero o schema-base inteiro da aplicação. Ele assume um Postgres já existente com as tabelas principais, como:

- `companies`
- `users`
- `receipts`
- `receipt_items`

Além disso, o repo inclui SQLs idempotentes com as expansões usadas pelo MVP atual:

- [graphql-api/sql/20260314_receiptiq_policy_and_vendor_tax.sql](/Users/davi/gits/b2bnotes/graphql-api/sql/20260314_receiptiq_policy_and_vendor_tax.sql)
- [graphql-api/sql/20260315_receiptiq_schema_expansion.sql](/Users/davi/gits/b2bnotes/graphql-api/sql/20260315_receiptiq_schema_expansion.sql)
- [graphql-api/sql/20260315_dashboard_views.sql](/Users/davi/gits/b2bnotes/graphql-api/sql/20260315_dashboard_views.sql)

Para aplicar essas mudanças no banco local:

```bash
psql "$APP_MY_PG_CONNECTION_URI" -f graphql-api/sql/20260314_receiptiq_policy_and_vendor_tax.sql
psql "$APP_MY_PG_CONNECTION_URI" -f graphql-api/sql/20260315_receiptiq_schema_expansion.sql
psql "$APP_MY_PG_CONNECTION_URI" -f graphql-api/sql/20260315_dashboard_views.sql
```

## Primeira execução local

### 1. Instalar dependências

```bash
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun install
```

### 2. Aplicar os SQLs no Postgres

```bash
psql "$APP_MY_PG_CONNECTION_URI" -f graphql-api/sql/20260314_receiptiq_policy_and_vendor_tax.sql
psql "$APP_MY_PG_CONNECTION_URI" -f graphql-api/sql/20260315_receiptiq_schema_expansion.sql
psql "$APP_MY_PG_CONNECTION_URI" -f graphql-api/sql/20260315_dashboard_views.sql
```

### 3. Construir o supergraph local

```bash
cd graphql-api
/usr/local/bin/ddn supergraph build local --env-file ./.env
cd ..
```

### 4. Subir o engine local do DDN

```bash
cd graphql-api
/usr/local/bin/ddn run docker-start -- -d
cd ..
```

### 5. Gerar tipos GraphQL

```bash
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun x graphql-codegen --config codegen.ts
```

### 6. Subir a app web

```bash
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun run dev
```

Abra:

- app: `http://localhost:3000`
- GraphQL: `http://localhost:3280/graphql`

## Fluxo diário

Depois do setup inicial, o fluxo normal costuma ser:

```bash
cd graphql-api
/usr/local/bin/ddn supergraph build local --env-file ./.env
/usr/local/bin/ddn run docker-start -- -d
cd ..
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun x graphql-codegen --config codegen.ts
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun run dev
```

## Parar os containers do DDN

O contexto do repo define apenas o script `docker-start`. Para derrubar os containers:

```bash
docker compose -f graphql-api/compose.yaml --env-file graphql-api/.env down
```

## Testes e validação

### Typecheck

```bash
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun run typecheck
```

### Testes

```bash
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun run test
```

Observações importantes sobre os testes:

- a suíte usa integrações reais com GraphQL local
- parte dos testes também usa o armazenamento R2
- sem `GRAPHQL_URL` apontando para o engine local e sem as envs de R2 configuradas, a suíte falha
- hoje o Vitest ainda pode exibir um aviso de processo pendurado depois do sucesso; isso não invalida os testes que passaram

## Quando mudar schema, metadata ou SQL

Sempre que você alterar algo em `graphql-api/sql` ou `graphql-api/app/metadata`:

1. aplique os SQLs no banco
2. reconstrua o supergraph local
3. reinicie ou suba o compose local do DDN
4. regenere os tipos GraphQL
5. rode typecheck e testes

Comandos:

```bash
psql "$APP_MY_PG_CONNECTION_URI" -f graphql-api/sql/<arquivo>.sql

cd graphql-api
/usr/local/bin/ddn supergraph build local --env-file ./.env
/usr/local/bin/ddn run docker-start -- -d
cd ..

/Users/davi/.nvm/versions/node/v22.15.1/bin/bun x graphql-codegen --config codegen.ts
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun run typecheck
/Users/davi/.nvm/versions/node/v22.15.1/bin/bun run test
```

## Estrutura útil do repo

- [src/routes/index.tsx](/Users/davi/gits/b2bnotes/src/routes/index.tsx): dashboard
- [src/routes/scan.tsx](/Users/davi/gits/b2bnotes/src/routes/scan.tsx): captura e revisão de recibos
- [src/features/scan/server.ts](/Users/davi/gits/b2bnotes/src/features/scan/server.ts): upload, parsing e persistência de recibos
- [src/features/dashboard/server.ts](/Users/davi/gits/b2bnotes/src/features/dashboard/server.ts): consumo GraphQL das views do dashboard
- [src/graphql/execute.ts](/Users/davi/gits/b2bnotes/src/graphql/execute.ts): helper de queries/mutations
- [src/graphql/subscribe.ts](/Users/davi/gits/b2bnotes/src/graphql/subscribe.ts): helper de subscriptions
- [graphql-api/app/metadata](/Users/davi/gits/b2bnotes/graphql-api/app/metadata): metadata do DDN
- [graphql-api/sql](/Users/davi/gits/b2bnotes/graphql-api/sql): SQL de schema e views

## Troubleshooting

### `GRAPHQL_URL está ausente`

Preencha `GRAPHQL_URL` em `./.env` com:

```dotenv
GRAPHQL_URL=http://localhost:3280/graphql
```

### `O armazenamento R2 não está configurado`

Preencha todas as envs `R2_*` em `./.env`.

### `Defina GOOGLE_AI_KEY ou OPENAI_API_KEY antes de analisar recibos`

Configure pelo menos uma destas opções em `./.env`:

- `GOOGLE_AI_KEY` ou `GOOGLE_GENERATIVE_AI_API_KEY`
- `OPENAI_API_KEY`

### `ddn run docker-start` falha

Verifique:

- `ddn auth login` foi executado
- Docker está rodando
- `graphql-api/.env` existe e tem `APP_MY_PG_CONNECTION_URI`
- o banco configurado está acessível

### O dashboard abre, mas não mostra dados

Cheque:

- se o banco já tem dados nas tabelas-base
- se os SQLs em `graphql-api/sql` foram aplicados
- se o supergraph local foi rebuildado depois das últimas mudanças
