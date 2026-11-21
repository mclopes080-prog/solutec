---
name: revisar-rubrica
description: Percorre a tabela de cobertura da rubrica "Entrega Projeto e Sprints" (docs/COBERTURA-RUBRICA.md) item por item e aponta o que falta ou está fraco, sempre com evidência (arquivo:linha, rota ou teste). Use antes de entregar ou quando perguntarem se a rubrica está coberta.
---

# Revisar a rubrica

Objetivo: dizer, com evidência verificável, se cada linha da rubrica está atendida. **Não confie no ✅ já marcado**: abra o arquivo citado e confirme.

## Procedimento

1. Rode a verificação base e anote o resultado (o que falhar já conta como pendência):
   ```bash
   npm run prisma:generate -w backend && npm run typecheck && npm test && npm run build
   find backend/src frontend/src -name "*.js" -o -name "*.jsx"     # deve sair vazio
   grep -rnE ":\s*any\b|as any|<any>" backend/src frontend/src     # deve sair vazio
   ```
2. Abra `docs/COBERTURA-RUBRICA.md`. Para **cada linha**, confira os critérios abaixo e localize a evidência com `grep -n`/leitura do arquivo.
3. Responda numa tabela `Item | Situação (OK / Parcial / Falta) | Evidência (arquivo:linha) | O que fazer`.
4. Só proponha mudanças **dentro do escopo da rubrica** (sem Docker, CI, deploy, carrinho/checkout/pagamento).

## Critérios por linha

| Linha | O que procurar |
|---|---|
| Back — Autenticação | `POST /api/auth/login`; regex de e-mail no Zod (`validators/email.ts`, `auth.validator.ts`); `bcrypt.compare` (`passwordHasher.ts`); JWT HS256 com `sub` e `expiresIn` (`JwtTokenService.ts`); 401 idêntico para e-mail inexistente e senha errada; middleware `autenticar` + `types/express.d.ts`; `JWT_SECRET`/`JWT_EXPIRES_IN` em `env.ts` e `.env.example`. |
| Back — Cadastro | Campos obrigatórios nome/email/senha/CPF; CPF com dígito verificador; força da senha; regex de e-mail; 409 duplicado. |
| Back — Edição | `GET/PUT /api/usuarios/me` com `autenticar`; id vem de `req.usuarioId`; todos os campos obrigatórios; CPF + unicidade contra outros (409); senha forte + confirmação; `email` no body → 400 "O e-mail não pode ser alterado."; `Usuario.alterarCpf`. |
| Back — 4 CRUDs | categorias, produtos, enderecos, pedidos com GET (paginado `{data, meta}`), GET/:id, POST, PUT/:id, DELETE/:id; todas autenticadas; 404 em inexistente; ownership (endereços/pedidos); 409 nos vínculos; relações no `schema.prisma`; seed; Bruno cobrindo listar/criar/editar/404/deletar. |
| Back — Agentes | `AGENTS.md` (stack, comandos, estrutura, convenções, pronto, guardrails); 3 skills em `.claude/skills/*/SKILL.md` com frontmatter; `.claude/settings.json` com `permissions.deny` para `.env`. |
| Front — Autenticação | Login com regex, token em `localStorage`, mensagens 401/rede, redirect `/app`; interceptor Axios (Authorization + 401 → logout); `ProtectedRoute` em `/app/*`. |
| Front — Cadastro | Confirmação de senha, CPF, e-mail, força, erros da API por campo, redirect `/login`. |
| Front — Edição | `AuthContext` (`usuario`, `login`, `logout`, `atualizarUsuario`), nome no header, `/app/conta` com e-mail desabilitado e fora do PUT. |
| Front — CRUDs | 4 listagens paginadas + 4 formulários em rota separada; validação de obrigatórios no cliente; exclusão com confirmação; catálogo público `/produtos`. |
| Front — Componentização | `components/` genéricos (`DataTable<T>`, `Pagination`, `FormField`, `Button`, `ConfirmDialog`, `Alert`, `ProtectedRoute`, `PageHeader`); `pages/<recurso>/`; funções separadas por tela; `usePaginatedList<T>`/`useCrud<T>`. |
| Análise | 4 gráficos + seção "Métricas de negócio" (receita, ticket médio, participação, variação mensal) ligada a decisões; aviso de dados fictícios. |
| Defesa técnica | `docs/DEFESA-TECNICA.md` com Mermaid, fluxo JWT, POO/SOLID com arquivo:linha, perguntas da banca. **Confira se as linhas citadas ainda batem.** |
| POO — Encapsulamento | `#campos` + construtor validando em todas as entidades. |
| POO — Getters/setters | `set preco`, `set estoque` com regra; `get total` sem setter; nenhum setter que só repassa valor (`grep -n "set " backend/src/entities`). |
| POO — Modelagem | `abstract class Entidade`, `abstract class CrudService`, `override` nos serviços, `IRepositorio<T, TId>` implementada. |
| POO — TS avançado | interfaces, `type` (DTOs, `StatusPedido`), `Omit`/`Partial`/`Pick`, generics (`Paginado<T>`, `IRepositorio<T>`, `DataTable<T>`), zero `any`. |
| POO — SOLID | S (camadas), O (`REGRAS_STATUS`), L (teste usando `CrudService` pelo tipo abstrato), D (`container.ts`). |
| POO — Exceções | `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `BusinessRuleError` + `errorHandler` sem vazamento. |
| Projeto — Persona | `docs/PERSONA.md` com tabela dor → funcionalidade. |
| Projeto — Só TS | sem `.js/.jsx` em `src/`, sem `vite.config.js`/`.d.ts` gerados. |

## Saída esperada
Tabela final + lista curta "Pendências em ordem de impacto". Se tudo estiver OK, diga explicitamente e cite o resultado da verificação base.
