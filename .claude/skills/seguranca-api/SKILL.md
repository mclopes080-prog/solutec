---
name: seguranca-api
description: Checklist de segurança da API Solutec — autenticação JWT, ownership de recursos, validação de entrada, mensagens de erro sem vazamento e proteção de segredos. Use ao criar/alterar rotas, antes de entregar uma sprint ou quando pedirem revisão de segurança.
---

# Checklist de segurança da API

Revise o diff (ou o arquivo pedido) contra cada item. Para cada falha, aponte `arquivo:linha`, o risco concreto e a correção. **Nunca abra `.env` para "conferir" segredos.** Use `.env.example` e `backend/src/config/env.ts`.

## 1. Autenticação
- [ ] Toda rota de CRUD passa por `autenticar` (`criarRotasCrud` aplica `router.use(autenticar)`); rotas públicas são só `health`, `auth/login`, `usuarios/cadastro` e `catalogo` (somente leitura).
- [ ] `jwt.verify` restringe `algorithms: ["HS256"]` (impede `alg: none`/troca de algoritmo).
- [ ] O token tem `sub` (id do usuário) e `expiresIn`; nada sensível no payload (sem e-mail, CPF ou hash).
- [ ] `JWT_SECRET` é obrigatório e tem ≥ 32 caracteres (validação no `env.ts`); nunca tem valor padrão no código.
- [ ] Login: e-mail inexistente e senha errada → **mesma** resposta 401 e tempo parecido (bcrypt contra hash fictício).
- [ ] Senhas só com bcrypt (`BCRYPT_ROUNDS` ≥ 10); hash nunca aparece em resposta ou log.

## 2. Autorização / ownership
- [ ] O id do usuário vem **só** de `req.usuarioId` (token), nunca de body, query ou params.
- [ ] Endereços e pedidos: filtro `usuarioId` **no WHERE** do repositório (`escopo`), em buscar, listar, editar e excluir.
- [ ] Recurso de outro dono responde **404** (não 403), para não confirmar a existência.
- [ ] Referências cruzadas também conferem o dono (ex.: `enderecoId` de um pedido precisa ser do mesmo usuário).
- [ ] Schemas `.strict()`: o cliente não consegue injetar `usuarioId`, `status` inicial, `precoUnitario` ou `total`.

## 3. Validação de entrada
- [ ] Todo body/params/query passa por Zod antes do serviço; limites de tamanho (`max`) em todos os textos.
- [ ] Paginação com `limit` máximo (100) e `page ≥ 1`.
- [ ] Números: `int()`, `positive()`, `min(0)` quando aplicável; dinheiro calculado em centavos.
- [ ] Entidade revalida as invariantes (defesa em profundidade).
- [ ] `express.json({ limit: "32kb" })` mantido; JSON malformado → 400.

## 4. Erros sem vazamento
- [ ] Erros esperados usam subclasses de `AppError`; o `errorHandler` devolve só `code`, `message` e `fields`.
- [ ] Erro inesperado → 500 com mensagem genérica; detalhes apenas no `console.error` do servidor.
- [ ] Erros do Prisma (P2002/P2003/P2025) viram 409/404 genéricos, sem nome de tabela, constraint ou SQL.
- [ ] `x-powered-by` desativado; CORS restrito a `FRONTEND_URL`.

## 5. Segredos e arquivos sensíveis
- [ ] Nenhum `.env` versionado (`git ls-files | grep -E "\.env($|\.)"` só pode listar `.env.example`).
- [ ] `.claude/settings.json` mantém o `permissions.deny` de `.env`; Codex segue a mesma regra (ver `AGENTS.md`).
- [ ] Nenhum segredo real em código, testes (`vitest.config.ts` usa valores fictícios) ou docs.
- [ ] Credenciais de demonstração do seed são fictícias e documentadas como tal.

## 6. Frontend
- [ ] Token só no `localStorage` (decisão do projeto) e removido no logout e em qualquer 401.
- [ ] Interceptor não redireciona no 401 do próprio login (para mostrar "E-mail ou senha incorretos.").
- [ ] Nada de `dangerouslySetInnerHTML` com dados da API.

## Saída
Lista "Crítico / Importante / Melhoria", cada item com `arquivo:linha` e correção sugerida. Se nada falhar, diga quais itens foram verificados.
