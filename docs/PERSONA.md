# Persona — Solutec

> Persona fictícia, construída para orientar as decisões do projeto acadêmico. Nome, números e falas são ilustrativos.

## Ricardo Almeida, 46 anos — dono e gestor da Solutec

| | |
|---|---|
| **Negócio** | Loja de segurança eletrônica em Peabiru (PR): câmeras, alarmes, controle de acesso e monitoramento. Vende no balcão e instala em residências e comércios da região. |
| **Equipe** | Ele, um técnico instalador e uma pessoa no atendimento/financeiro. |
| **Rotina** | Atende cliente de manhã, acompanha instalações à tarde e, à noite, confere estoque e pedidos numa planilha. |
| **Tecnologia** | Usa WhatsApp, planilha e o sistema do banco com tranquilidade. Não tem tempo para ferramentas complicadas. Acessa pelo notebook da loja e, às vezes, pelo celular. |
| **Objetivo** | Saber o que tem em estoque, quanto vale cada pedido e quais produtos realmente dão receita, sem depender da memória nem de planilhas espalhadas. |

### O que ele diz

> "Já perdi venda de kit com DVR porque achei que tinha gravador no estoque e não tinha."

> "O cliente pede orçamento, eu mudo o preço da câmera na semana seguinte e depois não sei mais quanto cobrei."

> "Cada instalação é num endereço diferente. Já mandei técnico para o lugar errado."

> "Vendo muito acessório, mas no fim do mês não parece que entrou dinheiro."

### Dores principais

1. **Estoque sem visibilidade**: descobre que um item acabou só na hora da venda.
2. **Catálogo desorganizado**: produtos de linhas diferentes misturados; difícil mostrar ao cliente.
3. **Preço do pedido muda depois**: sem registro do preço praticado no dia.
4. **Endereços de instalação perdidos**: anotados em papel ou mensagem.
5. **Pedidos sem status claro**: não sabe o que já foi pago, enviado ou cancelado.
6. **Acesso e dados da conta**: quer que só a equipe acesse e poder corrigir os próprios dados (o CPF, por exemplo) sem risco de trocar o e-mail de login.
7. **Decisão no "achômetro"**: não sabe que categoria traz mais receita.

## Dor → funcionalidade

| # | Dor do Ricardo | Funcionalidade no sistema | Onde está |
|---|---|---|---|
| 1 | Estoque sem visibilidade | **CRUD de Produtos** com estoque inteiro ≥ 0 e selo "baixo" (≤ 5 un.) ou "Esgotado" na listagem | `/app/produtos` · `pages/produtos/ProdutosListPage.tsx` (`SituacaoEstoque`) · `entities/Produto.ts` (`set estoque`) |
| 2 | Catálogo desorganizado | **CRUD de Categorias** (nome único) + produto N:1 categoria + **catálogo público** com cards, preço em R$ e paginação | `/app/categorias`, `/produtos` · `pages/catalogo/CatalogoPage.tsx` · `GET /api/catalogo` |
| 3 | Preço do pedido muda depois | **CRUD de Pedidos** com **preço unitário congelado** no item e total calculado pelo servidor | `/app/pedidos` · `services/PedidoService.ts` (`#montarItens`) · `entities/Pedido.ts` (`get total`) |
| 4 | Endereços perdidos | **CRUD de Endereços** por usuário (CEP, UF validados); pedido sempre aponta para um endereço do próprio usuário | `/app/enderecos` · `services/EnderecoService.ts` (`escopo`) |
| 5 | Pedidos sem status claro | Status `PENDENTE → PAGO → ENVIADO` / `CANCELADO` com transições controladas e selo colorido | `services/pedido/transicoesStatus.ts` (`REGRAS_STATUS`) · `pages/pedidos/components/StatusBadge.tsx` |
| 6a | Só a equipe acessa | **Login com JWT**, rotas `/app/*` protegidas, sessão expira em 2h | `/login` · `contexts/AuthContext.tsx` · `components/ProtectedRoute.tsx` · `middlewares/autenticar.ts` |
| 6b | Corrigir dados sem trocar o login | **Minha conta**: edita nome, CPF e senha; e-mail somente leitura | `/app/conta` · `PUT /api/usuarios/me` |
| 6c | Novo funcionário entrar no sistema | **Cadastro** com CPF validado, senha forte e confirmação | `/cadastro` · `POST /api/usuarios/cadastro` |
| 7 | Decisão no "achômetro" | **Análise descritiva** com receita por categoria, ticket médio e variação mensal ligadas a decisões de estoque, promoção e mix | `docs/analise-estatistica.md` (seção "Métricas de negócio") |

## Como a persona guiou decisões técnicas

- **Excluir produto vendido é bloqueado (409)**: Ricardo precisa do histórico de pedidos; a orientação é desativar o produto ([D11](DECISOES.md)).
- **O pedido não baixa estoque**: sem pagamento/checkout no escopo, baixar estoque criaria divergência com a loja física ([D8](DECISOES.md)).
- **Endereço de outro usuário responde 404**: os dados de clientes e instalações não podem vazar ([D12](DECISOES.md)).
- **Mensagens de erro em português claro** ("E-mail ou senha incorretos.", "Não foi possível conectar ao servidor."): ele não é técnico.
- **Layout responsivo**: ele consulta pedidos pelo celular durante as instalações.
