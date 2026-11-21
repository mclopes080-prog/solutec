# AGENTS.md — Solutec

Guia para agentes de código (Claude Code, Codex e outros) que trabalharem neste repositório. Vale também para pessoas.

## 1. O que é o projeto

Plataforma acadêmica da **Solutec**, loja de segurança eletrônica (câmeras, alarmes, controle de acesso e monitoramento). Monorepo com npm workspaces:

| Pasta | Stack |
|---|---|
| `backend/` | Node 20+, Express 5, TypeScript strict, Prisma 6 + MySQL 8, Zod 4, bcrypt, jsonwebtoken, Vitest |
| `frontend/` | React 18, Vite 6, TypeScript strict, React Router 7, Axios, CSS Modules |
| `docs/` | Análise estatística, persona, decisões, defesa técnica e cobertura da rubrica |

Ambiente do dono do repositório: **Windows + XAMPP (MySQL em `localhost:3306`)**. **Não introduza Docker**, Nginx, CI ou deploy.

## 2. Comandos

```powershell
npm install                          # instala os dois workspaces
npm run prisma:generate -w backend   # OBRIGATÓRIO antes do typecheck (gera os tipos do @prisma/client)
npm run typecheck                    # tsc nos dois workspaces
npm test                             # Vitest (backend), sem banco e sem .env
npm run build                        # build de produção dos dois workspaces
npm run dev                          # API :3000 + Web :5173
npm run prisma:deploy -w backend     # aplica as migrations versionadas
npm run prisma:seed -w backend       # categorias, 8 produtos e usuário de demonstração
```

## 3. Estrutura

```text
backend/src/
  config/        env (Zod) e Prisma Client
  entities/      domínio: Entidade (abstrata), Usuario, Categoria, Produto, Endereco, Pedido, ItemPedido, StatusPedido (type)
  repositories/  IRepositorio<T>, interfaces específicas e implementações Prisma*Repository
  services/      CrudService (abstrato, template method), serviços concretos, AutenticarUsuario, Obter/EditarUsuario, JwtTokenService, hash
  services/pedido/transicoesStatus.ts  tabela de transições de status (Open/Closed)
  controllers/   CrudController (base genérica) + Categoria/Produto/Endereco/PedidoController, Auth, Usuario, Catalogo (só HTTP)
  routes/        um arquivo por recurso (auth, usuario, categoria, produto, endereco, pedido, catalogo) via criarRotasCrud
  middlewares/   autenticar, errorHandler, notFound
  errors/        AppError e subclasses (400, 401, 403, 404, 409, 422)
  validators/    schemas Zod (entrada HTTP), CPF, senha, e-mail
  types/         Paginado<T>, declaration merging do Express
  container.ts   composição: único lugar que instancia implementações concretas
backend/tests/   testes unitários (mocks em memória; nada de banco)
backend/prisma/  schema, migrations versionadas e seed.ts

frontend/src/
  components/    genéricos e reutilizáveis (DataTable<T>, Pagination, FormField, Button, ConfirmDialog, Alert, PageHeader, ProtectedRoute…)
  contexts/      AuthContext (usuario, login, logout, atualizarUsuario)
  hooks/         usePaginatedList<T>, useCrud<T>, useResourceForm, useCadastroForm
  pages/         LoginPage, CadastroPage, PainelPage + pages/<recurso>/ (listagem e formulário separados)
  services/      api (Axios + interceptores), authStorage (localStorage)
  types/ utils/ styles/
```

## 4. Convenções

- **Camadas (SRP):** controller só faz HTTP (lê a requisição, chama o Zod, escolhe o status code). O service guarda a regra de negócio. O repository só persiste. A entidade valida o próprio estado.
- **Dependências (DIP):** services recebem interfaces (`IRepositorio`, `PasswordHasher`, `ITokenService`) no construtor; a montagem fica em `src/container.ts`.
- **Novo CRUD:** estenda `CrudService` e sobrescreva os ganchos (`construir`, `aplicarAtualizacao`, `validar*`, `escopo`). Siga a skill `novo-crud`.
- **Nomes:** classes, interfaces e componentes em PascalCase (interfaces de contrato com prefixo `I`); funções, variáveis e arquivos de utilitário em camelCase; código e mensagens em **português**.
- **TypeScript:** strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. **Proibido `any`**: use `unknown` + narrowing. Nenhum `.js`/`.jsx` em `src/`.
- **Entidades:** estado em `#campos` privados. O construtor valida tudo. Getters para leitura. Setter só quando há regra (ex.: `set preco`). Valores calculados são getters sem setter (ex.: `Pedido.total`).
- **Erros:** lance subclasses de `AppError` (`ValidationError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409, `BusinessRuleError` 422). O `errorHandler` traduz tudo; erro inesperado vira 500 genérico, sem stack nem detalhe do banco.
- **Ownership:** recursos com dono (endereços, pedidos) filtram pelo `usuarioId` do token no `WHERE`. Outro dono responde 404.
- **Respostas:** `{ success, data }`, `{ success, data, meta }` (listas), `{ success: false, error: { code, message, fields? } }`.
- **Testes:** Vitest com mocks/repositórios em memória. As envs de teste ficam em `backend/vitest.config.ts` (`test.env`). Toda regra nova ganha teste.
- **Commits:** mensagem em português no imperativo ("Adiciona…", "Corrige…"). **Sem assinatura de IA** (sem `Co-Authored-By`, sem "Generated with").
- **Decisões de negócio:** em caso de dúvida, escolha o mais simples e registre em `docs/DECISOES.md`.

## 5. Definição de pronto

Uma tarefa só está pronta quando:

1. `npm run prisma:generate -w backend && npm run typecheck && npm test && npm run build` passam sem erro.
2. Não existe `.js`/`.jsx` em `backend/src` nem em `frontend/src`, nem `any`.
3. Regra nova tem teste unitário; rota nova tem caso em `backend/tests/http.contrato.test.ts`.
4. Mudança de banco veio por **nova** migration versionada.
5. `docs/DECISOES.md` e `docs/COBERTURA-RUBRICA.md` foram atualizados quando a tarefa afeta a rubrica.

## 6. Guardrails (obrigatórios)

- **Não execute** `prisma migrate reset`, `DROP`/`TRUNCATE`, `rm -rf`, `git push --force` ou `git reset --hard` sem pedido explícito da pessoa responsável.
- **Não altere migrations existentes** em `backend/prisma/migrations/`. Mudança de schema = nova pasta de migration. Sem banco disponível, gere com:
  `npx prisma migrate diff --from-schema-datamodel <schema-anterior> --to-schema-datamodel prisma/schema.prisma --script`
- **Não instale dependência** sem justificar na descrição do PR/entrega (por que é necessária e por que a stack atual não resolve).
- **Segredos:** **nunca leia, imprima, copie ou commite `.env` nem credenciais** (`backend/.env`, `frontend/.env`, `.env.local` etc.). Use apenas `.env.example`, que contém só marcadores. Não coloque segredos em código, testes, logs ou docs.
- Não introduza Docker, Nginx, CI, deploy, carrinho, checkout ou pagamento: estão fora do escopo.

### Proteção de `.env` aplicada de fato

- **Claude Code:** `.claude/settings.json` tem `permissions.deny` para `Read`/`Edit` de `.env` e variantes (`.env.local`, `.env.development`, `.env.production`, `.env.test`…) e para comandos de shell que exibem esses arquivos (`cat`, `type`, `more`, `less`, `head`, `tail`, `Get-Content`, `printenv`). O `.env.example` continua legível porque não está na lista de bloqueio (as regras de permissão não aceitam exceção, então as variantes foram listadas uma a uma).
- **Codex e outros agentes:** sigam a **mesma regra**. Não abram, não listem o conteúdo e não passem `.env*` (exceto `.env.example`) como contexto, mesmo que o sandbox permita. Se precisar saber quais variáveis existem, leia `.env.example` e `backend/src/config/env.ts`.
- O `.gitignore` já ignora `.env` e `.env.*` (exceto `.env.example`).

## 7. Skills do projeto

Ficam em `.claude/skills/` (o Codex pode ler os mesmos arquivos como instruções):

| Skill | Quando usar |
|---|---|
| `novo-crud` | Criar um recurso novo de ponta a ponta (entidade → repositório → serviço → controller → rotas → testes → telas). |
| `revisar-rubrica` | Conferir a tabela de `docs/COBERTURA-RUBRICA.md` e apontar o que falta, com arquivo e linha. |
| `seguranca-api` | Revisar auth, ownership, validação, mensagens de erro e segredos antes de entregar. |
