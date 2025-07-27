# FIAP Blog Backend

## Visão Geral

API RESTful para gerenciamento de blogs, desenvolvida em Node.js com TypeScript, Express e TypeORM. Suporta PostgreSQL (produção) e SQLite (testes). Inclui documentação Swagger e testes automatizados com Jest.

---

## Arquitetura da Aplicação

- **Node.js + TypeScript**: Backend principal
- **Express**: Framework HTTP
- **TypeORM**: ORM para PostgreSQL/SQLite
- **Swagger**: Documentação automática das rotas
- **Jest + Supertest**: Testes automatizados
- **Docker**: Containerização para ambiente de produção
- **Render.com**: Deploy automatizado via GitHub

### Estrutura de Pastas

```
src/
  index.ts           # Entry point da API
  data-source.ts     # Configuração do TypeORM
  entity/
    Blog.ts          # Entidade Blog
    Status.ts        # Entidade Status
  __tests__/
    blog-api.test.ts # Testes automatizados
Dockerfile
docker-compose.yml
package.json
tsconfig.json
```

---

## Setup Inicial

### Pré-requisitos

- Node.js 20+
- Docker
- PostgreSQL (produção)
- SQLite (testes)
- Git

### Instalação

```bash
git clone https://github.com/fredtamashiro/fiap-blog-backend.git
cd fiap-blog-backend
npm install
```

### Configuração de Ambiente

Crie um arquivo `.env` na raiz com as variáveis:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=blog
JWT_SECRET=sua_chave_secreta
```

No Render.com, configure as mesmas variáveis no painel do serviço.

---

## Execução e Testes

### Rodando Localmente

```bash
npm run build
npm start
```

### Rodando com Docker

```bash
docker-compose up --build
```

### Rodando Testes

```bash
npm test
```
Os testes usam SQLite em memória, sem necessidade de banco externo.

---


## APIs Disponíveis

### Documentação Interativa (Swagger)

Acesse a documentação interativa e realize testes diretamente pelo navegador em:

```
http://localhost:3000/api-docs
```

Se estiver rodando em produção (ex: Render.com), substitua `localhost:3000` pela URL do seu serviço.

Exemplo: `https://seu-app.onrender.com/api-docs`

---

### Principais Endpoints


### Lista Completa de Endpoints

| Método | Endpoint                        | Descrição                                                        |
|--------|----------------------------------|------------------------------------------------------------------|
| GET    | /                               | Status da API                                                    |
| GET    | /status                         | Lista todos os status                                            |
| POST   | /status                         | Criar novo status                                                |
| GET    | /blogs                          | Lista todos os blogs                                             |
| GET    | /blogs/:id                      | Detalha um blog pelo ID                                          |
| GET    | /blog-alunos                    | Lista apenas blogs publicados (statusId = 1)                     |
| GET    | /blog-alunos/busca              | Busca blogs publicados por título e/ou conteúdo                  |
| POST   | /blogs                          | Cria um novo blog                                                |
| PUT    | /blogs/:id                      | Atualiza um blog existente                                       |
| DELETE | /blogs/:id                      | Remove um blog pelo ID                                           |

> Para detalhes de payloads, parâmetros e respostas, consulte o Swagger em `/api-docs`.

---

## Exemplos de Uso das APIs

### Obter status da API

```http
GET / HTTP/1.1
```

### Listar blogs publicados

```http
GET /blog-alunos HTTP/1.1
```

### Buscar blogs por título

```http
GET /blog-alunos/busca?title=Teste HTTP/1.1
```

### Detalhar um blog

```http
GET /blogs/1 HTTP/1.1
```

---

## Deploy e CI/CD

- O deploy é feito automaticamente no Render.com a cada push na branch `main`.
- O workflow do GitHub Actions executa os testes automatizados antes do deploy.
- O build de produção utiliza PostgreSQL; os testes utilizam SQLite em memória.

---
