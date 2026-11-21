# Solutec — Sprint 2

Plataforma acadêmica da **Solutec**, loja de segurança eletrônica (câmeras, alarmes, controle de acesso e monitoramento). A Sprint 2 entrega autenticação JWT, edição do próprio usuário, quatro CRUDs completos (categorias, produtos, endereços e pedidos), catálogo público, configuração de agentes de IA e a documentação de persona, decisões e defesa técnica.

> Os produtos, preços, CPFs de teste e dados estatísticos deste repositório são **fictícios** e usados só para demonstração. O projeto não apresenta resultados comerciais nem a identidade visual oficial da empresa.

## Escopo entregue

**Backend (API REST)**
- `POST /api/auth/login`: JWT HS256 (`sub` = id do usuário, validade `JWT_EXPIRES_IN`), bcrypt, regex de e-mail e o mesmo 401 genérico para e-mail inexistente ou senha errada.
- `POST /api/usuarios/cadastro`, `GET /api/usuarios/me` e `PUT /api/usuarios/me`: edição só do próprio usuário, com todos os campos obrigatórios, CPF e senha forte validados; o e-mail não pode ser alterado.
- CRUDs autenticados e paginados de `categorias`, `produtos`, `enderecos` e `pedidos` (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`), com 404, ownership, 409 para vínculos e 422 para regras de negócio.
- `GET /api/catalogo`: vitrine pública, somente leitura, com os produtos ativos.
- POO: `Entidade` e `CrudService` abstratas, `IRepositorio<T>`, tabela de transições de status, exceções customizadas e composição em `container.ts`.
- Seed com 4 categorias, os 8 produtos da Solutec e um usuário de demonstração.

**Frontend (React)**
- Login real, cadastro com confirmação de senha, `AuthContext` com o nome do usuário no cabeçalho e rotas `/app/*` protegidas.
- Minha conta (`/app/conta`) com e-mail somente leitura.
- Listagem paginada e formulário separado para cada CRUD, com exclusão confirmada e validação no cliente.
- Catálogo público em `/produtos`.
- Componentes genéricos (`DataTable<T>`, `Pagination`, `FormField`, `Button`, `ConfirmDialog`, `Alert`, `PageHeader`, `ProtectedRoute`) e hooks `usePaginatedList<T>` e `useCrud<T>`.

**Qualidade e documentação**
- 119 testes (Vitest), sem banco: unitários e um teste de contrato HTTP (`backend/tests/http.contrato.test.ts`).
- `AGENTS.md`, 3 skills em `.claude/skills/` e bloqueio de `.env` em `.claude/settings.json`.
- Em `docs/`: análise estatística com métricas de negócio, persona, decisões, defesa técnica e cobertura da rubrica.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 18, Vite, TypeScript strict, React Router, Axios, CSS Modules |
| Backend | Node.js 20+, Express 5, TypeScript strict, Prisma ORM, MySQL, Zod, bcrypt, jsonwebtoken |
| Testes | Vitest (unitários e contrato HTTP sem banco) |

## Estrutura

```text
solutec/
├── backend/
│   ├── prisma/          # schema, migrations versionadas e seed.ts
│   ├── src/             # config, entities, repositories, services, controllers, routes, middlewares, errors, validators, types, container.ts
│   └── tests/           # testes unitários + helpers (repositório em memória)
├── frontend/
│   ├── public/img/produtos/   # imagens dos produtos (ver LEIAME.md) + placeholder.svg
│   └── src/             # components, contexts, hooks, pages/<recurso>, routes, services, types, utils, styles
├── docs/                # análise, persona, decisões, defesa técnica, cobertura da rubrica
├── .claude/             # skills do projeto e permissões (bloqueio de .env)
├── AGENTS.md            # guia e guardrails para agentes de código
├── .env.example
└── package.json         # workspaces e comandos do monorepositório
```

## Pré-requisitos

- Node.js 20 ou superior e npm 10 ou superior.
- MySQL 8 em `localhost:3306` (por exemplo, o do **XAMPP**).

## Instalação e configuração

No PowerShell, a partir da pasta do projeto:

```powershell
npm install
Copy-Item .env.example backend/.env
```

Crie o banco e um usuário MySQL locais (no phpMyAdmin do XAMPP ou em outro cliente, com uma conta administrativa). Escolha uma senha própria:

```sql
CREATE DATABASE solutec CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'solutec_app'@'localhost' IDENTIFIED BY 'uma_senha_local_forte';
GRANT ALL PRIVILEGES ON solutec.* TO 'solutec_app'@'localhost';
FLUSH PRIVILEGES;
```

Edite `backend/.env`:

| Variável | Obrigatória | Exemplo / padrão | Descrição |
|---|---|---|---|
| `DATABASE_URL` | sim | `mysql://solutec_app:uma_senha_local_forte@localhost:3306/solutec` | Conexão MySQL |
| `JWT_SECRET` | sim | (gere um valor próprio) | Segredo do JWT, **mínimo de 32 caracteres** |
| `JWT_EXPIRES_IN` | não | `2h` | Validade do token: segundos (`3600`) ou `s/m/h/d` (`30m`, `2h`, `7d`) |
| `PORT` | não | `3000` | Porta da API |
| `FRONTEND_URL` | não | `http://localhost:5173` | Origem liberada no CORS |
| `BCRYPT_ROUNDS` | não | `12` | Custo do bcrypt (10 a 14) |
| `NODE_ENV` | não | `development` | Ambiente |

Para gerar um `JWT_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Os valores de `.env.example` são apenas marcadores. Opcionalmente, crie `frontend/.env` com `VITE_API_URL` se a API não estiver em `http://localhost:3000/api`.

Gere o Prisma Client, aplique as migrations versionadas e popule o banco:

```powershell
npm run prisma:generate -w backend
npm run prisma:deploy -w backend
npm run prisma:seed -w backend
```

O seed é idempotente (pode rodar mais de uma vez) e cria:
- as categorias **Câmeras**, **Alarmes**, **Controle de Acesso** e **Monitoramento**;
- os **8 produtos** da Solutec, com preço, estoque fictício e `imagemUrl` em `/img/produtos/…`;
- o **usuário de demonstração**, com o endereço "Loja Centro".

### Usuário de demonstração (fictício)

| Campo | Valor |
|---|---|
| E-mail | `demo@solutec.test` |
| Senha | `Solutec@2026` |
| CPF | `111.444.777-35` |

## Execução

```powershell
npm run dev
```

- Frontend: `http://localhost:5173` (catálogo em `/produtos`, painel em `/app`)
- API: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

Também é possível iniciar separadamente: `npm run dev -w backend` e `npm run dev -w frontend`.

## Verificações

```powershell
npm run prisma:generate -w backend   # necessário antes do typecheck
npm run typecheck
npm test
npm run build
```

Os testes unitários não dependem de banco nem de `.env`: as variáveis de teste estão em `backend/vitest.config.ts`, e os serviços são testados com repositórios em memória.

## Contrato resumido da API

Respostas de sucesso: `{ success: true, data }`. Listagens: `{ success: true, data: [...], meta: { page, limit, total, totalPages } }`. Erros: `{ success: false, error: { code, message, fields? } }`.

| Método e rota | Auth | Descrição |
|---|---|---|
| `GET /api/health` | — | Status da API |
| `POST /api/usuarios/cadastro` | — | Cadastro (`nome`, `email`, `senha`, `cpf`) |
| `POST /api/auth/login` | — | `{ email, senha }` → `data: { token, usuario }` |
| `GET /api/usuarios/me` | Bearer | Dados do usuário logado |
| `PUT /api/usuarios/me` | Bearer | `{ nome, cpf, senha, confirmacaoSenha }` (enviar `email` → 400) |
| `GET/POST /api/categorias` · `GET/PUT/DELETE /api/categorias/:id` | Bearer | CRUD de categorias |
| `GET/POST /api/produtos` · `GET/PUT/DELETE /api/produtos/:id` | Bearer | CRUD de produtos |
| `GET/POST /api/enderecos` · `GET/PUT/DELETE /api/enderecos/:id` | Bearer | CRUD dos endereços do usuário |
| `GET/POST /api/pedidos` · `GET/PUT/DELETE /api/pedidos/:id` | Bearer | CRUD dos pedidos do usuário |
| `GET /api/catalogo` | — | Produtos ativos (vitrine) |

Códigos usados: `200`, `201`, `204`, `400` (validação), `401` (sem token, token inválido ou credenciais incorretas), `404` (inexistente ou de outro dono), `409` (duplicado ou vínculo), `422` (regra de negócio) e `500` (mensagem genérica).

## Segurança

- Senhas só com bcrypt. O hash nunca é retornado e nem sai da entidade `Usuario`.
- JWT HS256 com algoritmo fixado na verificação, validade configurável e segredo obrigatório com no mínimo 32 caracteres.
- Ownership no `WHERE` do repositório: recurso de outro usuário responde 404.
- Schemas Zod `.strict()`: o cliente não consegue enviar `usuarioId`, preço do item nem total.
- Erros internos e do banco são registrados no servidor, mas não expostos ao cliente.
- `.env` ignorado pelo Git e bloqueado para agentes (`.claude/settings.json` + `AGENTS.md`).

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/analise-estatistica.md`](docs/analise-estatistica.md) | 5 gráficos SVG acessíveis + métricas de negócio (receita, ticket médio, participação, variação mensal) |
| [`docs/PERSONA.md`](docs/PERSONA.md) | Persona e tabela dor → funcionalidade |
| [`docs/DECISOES.md`](docs/DECISOES.md) | Decisões de regra de negócio |
| [`docs/DEFESA-TECNICA.md`](docs/DEFESA-TECNICA.md) | Roteiro de apresentação, diagramas e perguntas da banca |
| [`docs/COBERTURA-RUBRICA.md`](docs/COBERTURA-RUBRICA.md) | Tabela de cobertura da rubrica e "como testar" |
| [`AGENTS.md`](AGENTS.md) | Convenções e guardrails para agentes de código |
