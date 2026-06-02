# eFood — Sistema de Delivery
## Relatório Técnico — A3 SDM

---

## 1. Visão Geral

O **eFood** é um sistema de delivery desenvolvido como projeto acadêmico para a disciplina de Software Design and Modeling (SDM). O sistema permite o cadastro de clientes e produtos, realização de pedidos e acompanhamento do status de entrega em tempo real.

A aplicação é dividida em duas partes independentes:

- **Backend**: API REST desenvolvida com Spring Boot, responsável por toda a lógica de negócio e persistência de dados.
- **Frontend**: Interface web estática (HTML/CSS/JS puro) que consome a API via `fetch`.

---

## 2. Arquitetura

O backend segue a arquitetura em **camadas** (Layered Architecture), padrão amplamente adotado em aplicações Spring Boot:

```
Frontend (HTML/CSS/JS)
        │
        │  HTTP (JSON)
        ▼
┌─────────────────────────────┐
│       Controllers           │  Recebe as requisições HTTP e delega à camada de serviço
├─────────────────────────────┤
│        Services             │  Contém a lógica de negócio
├─────────────────────────────┤
│      Repositories           │  Acesso ao banco de dados via Spring Data JPA
├─────────────────────────────┤
│    Entidades JPA            │  Mapeiam as tabelas do banco de dados
└─────────────────────────────┘
        │
        ▼
  PostgreSQL (banco de dados)
```

### Padrões aplicados

| Padrão | Onde é usado |
|---|---|
| **DTO (Data Transfer Object)** | Separa a representação da API das entidades JPA. Há DTOs de Request (entrada) e Response (saída) para cada recurso. |
| **Repository** | Spring Data JPA provê implementação automática das operações de banco de dados. |
| **Exception Handler centralizado** | `GlobalExceptionHandler` intercepta exceções de toda a aplicação e retorna respostas padronizadas. |
| **Validação declarativa** | Bean Validation com anotações (`@NotBlank`, `@NotNull`, `@Positive`, `@Email`) nos DTOs de entrada. |

---

## 3. Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Função |
|---|---|---|
| **Java** | 21 | Linguagem de programação |
| **Spring Boot** | 3.3.0 | Framework principal da aplicação |
| **Spring Web** | — | Criação dos endpoints REST |
| **Spring Data JPA** | — | Persistência e acesso ao banco de dados |
| **Spring Validation** | — | Validação dos dados de entrada |
| **Hibernate** | — | Implementação do JPA (ORM) |
| **PostgreSQL** | — | Banco de dados relacional |
| **springdoc-openapi** | 2.5.0 | Documentação automática da API (Swagger UI) |
| **Maven** | — | Gerenciamento de dependências e build |

### Frontend

| Tecnologia | Função |
|---|---|
| **HTML5** | Estrutura das páginas |
| **CSS3** | Estilização e layout responsivo |
| **JavaScript (ES2022)** | Lógica da interface e consumo da API via `fetch` |
| **Google Fonts (Roboto)** | Tipografia |

---

## 4. Modelo de Dados

O banco de dados possui 4 tabelas:

```
clientes
├── id (PK)
├── nome
├── email (UNIQUE)
├── telefone
└── endereco

produtos
├── id (PK)
├── nome
├── descricao
├── preco
├── categoria
└── disponivel

pedidos
├── id (PK)
├── cliente_id (FK → clientes)
├── valor_total
├── status (enum)
├── endereco_entrega
└── data_pedido

itens_pedido
├── id (PK)
├── pedido_id (FK → pedidos)
├── produto_id (FK → produtos)
├── quantidade
└── preco_unitario
```

### Ciclo de vida do pedido (StatusPedido)

```
PENDENTE → CONFIRMADO → PREPARANDO → PRONTO → EM_ENTREGA → ENTREGUE
                                                              (final)
CANCELADO  (estado terminal, pode ser atribuído a qualquer momento)
```

O schema é gerado automaticamente pelo Hibernate com a configuração `ddl-auto=update`, que cria as tabelas na primeira execução e aplica apenas alterações incrementais nas seguintes.

---

## 5. Funcionamento da API

A API é RESTful, retorna JSON e opera na porta **8080**.  
A documentação interativa está disponível em: `http://localhost:8080/swagger-ui.html`

### 5.1 Recursos disponíveis

#### Clientes — `/clientes`

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/clientes` | Lista todos os clientes |
| `GET` | `/clientes/{id}` | Retorna um cliente pelo ID |
| `GET` | `/clientes/buscar?email=` | Busca um cliente pelo email |
| `POST` | `/clientes` | Cadastra um novo cliente |
| `PUT` | `/clientes/{id}` | Atualiza os dados de um cliente |
| `DELETE` | `/clientes/{id}` | Remove um cliente |

#### Produtos — `/produtos`

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/produtos` | Lista produtos (aceita `?categoria=` e `?disponivel=true`) |
| `GET` | `/produtos/categorias` | Lista todas as categorias distintas |
| `GET` | `/produtos/{id}` | Retorna um produto pelo ID |
| `POST` | `/produtos` | Cadastra um novo produto |
| `PUT` | `/produtos/{id}` | Atualiza os dados de um produto |
| `DELETE` | `/produtos/{id}` | Remove um produto |

#### Pedidos — `/pedidos`

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/pedidos` | Lista pedidos (aceita `?status=` e `?clienteId=`) |
| `GET` | `/pedidos/{id}` | Retorna um pedido pelo ID |
| `GET` | `/pedidos/cliente/{clienteId}` | Lista todos os pedidos de um cliente |
| `POST` | `/pedidos` | Cria um novo pedido |
| `PATCH` | `/pedidos/{id}/status` | Atualiza o status de um pedido |
| `DELETE` | `/pedidos/{id}` | Remove um pedido |

### 5.2 Fluxo de criação de pedido

1. O cliente é cadastrado via `POST /clientes`.
2. Os produtos são cadastrados via `POST /produtos`.
3. O pedido é criado via `POST /pedidos` com o seguinte corpo:

```json
{
  "clienteId": 1,
  "enderecoEntrega": "Rua das Flores, 123",
  "itens": [
    { "produtoId": 2, "quantidade": 2 },
    { "produtoId": 5, "quantidade": 1 }
  ]
}
```

4. O backend valida o cliente e os produtos no banco, busca os preços atuais de cada produto, calcula o valor total e persiste o pedido com status `PENDENTE`.
5. O status é avançado via `PATCH /pedidos/{id}/status`:

```json
{ "status": "CONFIRMADO" }
```

### 5.3 Tratamento de erros

Todos os erros seguem o formato padronizado:

```json
{
  "status": 404,
  "mensagem": "Cliente não encontrado com o ID: 5",
  "timestamp": "2026-06-01T14:30:00",
  "erros": null
}
```

Erros de validação retornam `400` com o mapa de campos inválidos:

```json
{
  "status": 400,
  "mensagem": "Erro de validação",
  "timestamp": "2026-06-01T14:30:00",
  "erros": {
    "email": "não deve estar em branco",
    "preco": "deve ser maior que 0"
  }
}
```

---

## 6. Frontend

A interface web possui quatro seções principais:

| Aba | Funcionalidade |
|---|---|
| **Cardápio** | Exibe os produtos com filtro por categoria e disponibilidade. Permite adicionar/remover itens no carrinho. |
| **Fazer Pedido** | Exibe o carrinho, busca o cliente por email e envia o pedido para o backend. |
| **Acompanhamento** | Busca um pedido pelo ID e exibe seus detalhes. Permite avançar o status de entrega. |
| **Gestão** | Painel administrativo para listar/filtrar pedidos, cadastrar clientes e gerenciar produtos (incluindo ativar/desativar disponibilidade). |

---

## 7. Como executar

### Pré-requisitos
- Java 21
- Maven
- PostgreSQL com banco `efood` criado

### Passos

```bash
# 1. Criar o banco de dados no PostgreSQL
CREATE DATABASE efood;

# 2. Configurar credenciais em:
# backend/src/main/resources/application.properties

# 3. Iniciar o backend
cd backend
mvn spring-boot:run

# 4. Abrir o frontend
# Abrir frontend/index.html no navegador
# (ou usar um servidor estático como Live Server do VSCode)
```

A API estará disponível em `http://localhost:8080`  
O Swagger UI estará em `http://localhost:8080/swagger-ui.html`

---

*Projeto desenvolvido para a disciplina de Software Design and Modeling (SDM) — A3.*
