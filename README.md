# Solutec — Sprint 1

Plataforma acadêmica de comércio eletrônico voltada a câmeras de segurança, monitoramento e produtos relacionados. Esta entrega implementa somente a primeira sprint: cadastro de usuário, interface institucional inicial, testes de API e análise estatística demonstrativa.

> Os produtos, CPFs de teste e dados estatísticos deste repositório são fictícios e usados exclusivamente para demonstração. O projeto não apresenta preços, fornecedores, resultados comerciais ou identidade visual oficial da empresa.

## Entregas desta sprint

- API REST com `GET /api/health` e `POST /api/usuarios/cadastro`.
- Validação com Zod de nome, e-mail, CPF e força da senha.
- CPF com algoritmo dos dígitos verificadores, rejeição de sequências repetidas e normalização.
- Senha protegida exclusivamente com bcrypt (12 rounds por padrão).
- Verificação de e-mail/CPF duplicado, incluindo proteção por índices únicos no MySQL.
- Arquitetura modular com entidade de domínio encapsulada, serviço, controller e repositório.
- Frontend React responsivo com home, cadastro integrado à API, produtos futuros e login visual não funcional.
- Coleção Bruno com oito cenários e ambiente local.
- Testes unitários das validações e regras de cadastro.
- Análise estatística com dados 100% simulados, CSV e gráficos SVG acessíveis.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 18, Vite, TypeScript strict, React Router, Axios, CSS Modules |
| Backend | Node.js, Express 5, TypeScript strict, Prisma ORM, MySQL, Zod, bcrypt |
| Testes | Vitest e Bruno API Client |

## Estrutura

```text
solutec/
├── backend/
│   ├── prisma/          # schema e migração inicial
│   ├── src/             # config, entidade, erros, repositório, serviço, controller, rotas
│   └── tests/           # testes unitários
├── frontend/
│   └── src/             # componentes, páginas, hook, rotas, serviços, tipos e estilos
├── bruno/               # coleção HTTP e ambiente local
├── docs/                # análise, base simulada e gráficos
├── .env.example
└── package.json         # workspaces e comandos do monorepositório
```

## Pré-requisitos

- Node.js 20 ou superior e npm 10 ou superior.
- MySQL 8 disponível em `localhost:3306` (ou outra URL configurada).
- Bruno Desktop ou Bruno CLI para executar a coleção HTTP.

## Instalação e configuração

No PowerShell, a partir de `C:\projetos\solutec`:

```powershell
npm install
Copy-Item .env.example backend/.env
```

Crie um banco e um usuário MySQL locais. Exemplo a ser executado em um cliente MySQL com uma conta administrativa; escolha uma senha própria e repita-a apenas no `DATABASE_URL` de `backend/.env`:

```sql
CREATE DATABASE solutec CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'solutec_app'@'localhost' IDENTIFIED BY 'uma_senha_local_forte';
GRANT ALL PRIVILEGES ON solutec.* TO 'solutec_app'@'localhost';
FLUSH PRIVILEGES;
```

Edite `backend/.env`:

```dotenv
DATABASE_URL="mysql://solutec_app:uma_senha_local_forte@localhost:3306/solutec"
```

O valor presente em `.env.example` é apenas um marcador local e não é uma credencial válida para produção.

Gere o Prisma Client e aplique a migração versionada:

```powershell
npm run prisma:generate -w backend
npm run prisma:deploy -w backend
```

## Execução

Para iniciar frontend e backend juntos:

```powershell
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

Também é possível iniciar separadamente:

```powershell
npm run dev -w backend
npm run dev -w frontend
```

## Verificações

```powershell
npm run test
npm run typecheck
npm run build
```

Os testes unitários não dependem de um banco ativo. A validação manual/Bruno da persistência exige MySQL configurado e a migração aplicada.

## Coleção Bruno

1. Abra o Bruno.
2. Escolha **Open Collection**.
3. Selecione a pasta `C:\projetos\solutec\bruno`.
4. Selecione o ambiente **local**.
5. Inicie a API e execute as requisições pela numeração.

As requisições `01` e `03` a `06` não dependem de estado prévio. A requisição `02` cria a pessoa fictícia base. As requisições `07` (e-mail duplicado) e `08` (CPF duplicado) dependem do sucesso da `02`. Em uma segunda execução completa, a `02` retornará `409`; para repetir o cenário de `201`, remova somente esse registro do banco de desenvolvimento ou recrie o banco local. Essa dependência também está documentada dentro dos arquivos `.bru`.

Pela CLI do Bruno, quando instalada:

```powershell
bru run bruno --env local --sequential
```

## Contrato resumido da API

### `POST /api/usuarios/cadastro`

```json
{
  "nome": "Pessoa Fictícia de Teste",
  "email": "pessoa.sprint1@example.test",
  "senha": "Camera@2026",
  "cpf": "529.982.247-25"
}
```

- `201`: cadastro persistido; resposta contém somente dados públicos.
- `400`: dados inválidos; `error.fields` associa mensagens aos campos.
- `409`: e-mail ou CPF já cadastrado.
- `500`: mensagem segura e genérica, sem detalhes do banco.

## Segurança

- O hash bcrypt nunca é retornado pela API.
- O CPF é armazenado apenas com 11 dígitos.
- O e-mail é normalizado para letras minúsculas.
- O Express limita o corpo JSON e desativa o cabeçalho `x-powered-by`.
- Erros internos são registrados no servidor, mas não expostos ao cliente.
- `.env`, dependências, builds, logs e temporários são ignorados pelo Git.

## Fora do escopo da Sprint 1

Login funcional, JWT, rotas protegidas, edição de usuários, CRUDs de produtos/categorias/endereços/pedidos, carrinho, checkout, pagamentos, Docker Compose, Nginx e agentes/skills serão tratados em sprints futuras. A separação atual entre domínio, serviço, repositório, API e interface foi mantida para permitir essa evolução sem acoplamento desnecessário.

## Análise acadêmica

A análise descritiva está em [`docs/analise-estatistica.md`](docs/analise-estatistica.md). Os gráficos são SVGs versionáveis e incluem descrições de acessibilidade.
