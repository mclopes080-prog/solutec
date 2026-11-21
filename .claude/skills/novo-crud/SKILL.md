---
name: novo-crud
description: Passo a passo para criar um recurso CRUD completo na Solutec (entidade → repositório → serviço → controller → rotas → testes → Bruno → telas), seguindo as camadas e a POO do projeto. Use quando pedirem um novo cadastro/entidade/recurso.
---

# Novo CRUD na Solutec

Use `Categoria` como modelo mais simples e `Endereco` como modelo de recurso **com dono**. Troque `Recurso`/`recurso` pelo nome real (PascalCase para classes, camelCase para variáveis, plural kebab/minúsculo na URL).

## 0. Antes de começar
- Leia `AGENTS.md` (convenções e guardrails) e confira se a regra de negócio tem dúvida; se tiver, decida pelo mais simples e registre em `docs/DECISOES.md`.
- **Nunca** edite migrations existentes nem leia `.env`.

## 1. Banco (Prisma)
1. Copie o schema atual para fora do repositório: `cp backend/prisma/schema.prisma <tmp>/schema-anterior.prisma`.
2. Adicione o `model Recurso` em `backend/prisma/schema.prisma` com `id String @id @default(cuid())`, `criadoEm`/`atualizadoEm` (`@map("criado_em")`, `@updatedAt @map("atualizado_em")`), `@@map("recursos")` e as relações (`onDelete: Restrict` por padrão).
3. Gere a migration nova sem banco:
   ```bash
   cd backend
   DATABASE_URL="mysql://x:x@localhost:3306/x" npx prisma migrate diff \
     --from-schema-datamodel <tmp>/schema-anterior.prisma \
     --to-schema-datamodel prisma/schema.prisma --script \
     > prisma/migrations/<AAAAMMDDhhmmss>_<nome>/migration.sql
   npm run prisma:generate
   ```
4. Se fizer sentido, inclua dados em `backend/prisma/seed.ts` (idempotente: `upsert`/`findFirst`).

## 2. Entidade — `backend/src/entities/Recurso.ts`
- `export interface RecursoProps extends DadosEntidade { ... }`
- DTO com utility types: `export type DadosRecurso = Omit<RecursoProps, keyof DadosEntidade | "usuarioId">`.
- `export interface RecursoResposta { id; ...; criadoEm; atualizadoEm }`.
- `export class Recurso extends Entidade<RecursoResposta>`:
  - estado em `#campos`; construtor chama `super(props)` e valida tudo (use `textoObrigatorio`, `textoOpcional`, `erroDeCampo` de `validacoes.ts`);
  - getters de leitura; **setter só com regra** (ex.: valor > 0); método `atualizar(dados)` como porta única de alteração;
  - `paraPersistencia()` e `paraResposta()` (usa `this.metadados()`).

## 3. Repositório
1. Interface em `backend/src/repositories/interfaces.ts`: `export interface IRecursoRepository extends IRepositorio<Recurso> { /* consultas extras */ }`.
2. Implementação `backend/src/repositories/PrismaRecursoRepository.ts` com `toDomain`, `skipTake`, `exigirId` e `prisma.$transaction([findMany, count])` na listagem.
3. Recurso com dono: aceite `escopo?: Escopo` em `buscarPorId`/`listar` e filtre `{ usuarioId }` **no WHERE**.

## 4. Serviço — `backend/src/services/RecursoService.ts`
- `export class RecursoService extends CrudService<Recurso, DadosRecurso, DadosRecurso, RecursoResposta>`.
- Construtor recebe **interfaces** e chama `super(repo, "Recurso não encontrado.")`.
- Implemente `construir` e `aplicarAtualizacao`. Sobrescreva com `override` só os ganchos necessários: `validarCriacao` (unicidade → `ConflictError`), `validarRemocao` (vínculos → `ConflictError`), `escopo` (ownership).
- Regra de transição/estado: use tabela/mapa (ver `services/pedido/transicoesStatus.ts`), nunca `if/else` encadeado.

## 5. Validação HTTP — `backend/src/validators/recurso.validator.ts`
- Schema Zod `.strict()` usando `texto()`/`textoOpcional()` de `comum.validator.ts`, terminando em `satisfies z.ZodType<DadosRecurso>`.
- Nunca aceite `usuarioId`, preço calculado ou total no body.

## 6. Controller, rotas e container
- `backend/src/controllers/RecursoController.ts`: `export class RecursoController extends CrudController<DadosRecurso, DadosRecurso, RecursoResposta>`, cujo construtor recebe o `RecursoService` e chama `super(servico, { criar: schema, atualizar: schema }, { criado: "...", atualizado: "..." })`.
- Em `backend/src/container.ts`: instancie `PrismaRecursoRepository`, `RecursoService` e `export const recursoController = new RecursoController(service)`.
- `backend/src/routes/recurso.routes.ts`: `export const recursoRoutes = criarRotasCrud(recursoController, autenticar);` e, em `app.ts`, `app.use("/api/recursos", recursoRoutes)`.

## 7. Testes — `backend/tests/`
- Entidade: construtor válido, cada validação, setters com regra.
- Serviço: 404 em editar/excluir inexistente, conflitos, ownership (escopo enviado ao repositório). Use repositório em memória (`tests/helpers/RepositorioMemoria.ts`).
- Rode `npm run prisma:generate -w backend && npm run typecheck && npm test && npm run build`.

## 8. Bruno — `bruno/`
Arquivos numerados em sequência: listar (paginado), criar (salva `recursoId` com `bru.setVar` no `script:post-response`), editar, 404 e deletar. Todos com `auth: bearer` / `token: {{token}}`.

## 9. Frontend
1. Tipos em `frontend/src/types/recursos.ts` (`Recurso`, `RecursoPayload`).
2. `frontend/src/pages/recursos/RecursosListPage.tsx`: `usePaginatedList<Recurso>("/recursos")` + `DataTable<Recurso>` + `Pagination` + `ConfirmDialog` para excluir.
3. `frontend/src/pages/recursos/RecursoFormPage.tsx`: `useResourceForm` com `validar` (campos obrigatórios no cliente), `FormField`, erros da API por campo.
4. Rotas em `frontend/src/routes/AppRoutes.tsx` (`/app/recursos`, `/app/recursos/novo`, `/app/recursos/:id/editar`) e link no menu de `pages/app/AppLayout.tsx`.
5. Componentes exclusivos da tela ficam como funções separadas no mesmo arquivo ou em `pages/recursos/components/`.

## 10. Fechamento
- Atualize `docs/COBERTURA-RUBRICA.md` e `docs/DECISOES.md`.
- Commit em português no imperativo, sem assinatura de IA.
