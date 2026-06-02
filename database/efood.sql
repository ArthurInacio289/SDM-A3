-- Criação do banco de dados
-- CREATE DATABASE efood;

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    endereco VARCHAR(500)
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
    categoria VARCHAR(100),
    disponivel BOOLEAN DEFAULT TRUE
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    valor_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    endereco_entrega VARCHAR(500) NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id),
    produto_id BIGINT NOT NULL REFERENCES produtos(id),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10, 2) NOT NULL
);

-- Dados de exemplo

INSERT INTO clientes (nome, email, telefone, endereco) VALUES
('João Silva', 'joao@email.com', '11999990000', 'Rua das Flores, 123'),
('Maria Souza', 'maria@email.com', '11988880000', 'Av. Brasil, 456');

INSERT INTO produtos (nome, descricao, preco, categoria, disponivel) VALUES
('Pizza Margherita', 'Pizza com molho de tomate, mussarela e manjericão', 39.90, 'Pizzas', TRUE),
('Pizza Calabresa', 'Pizza com calabresa e cebola', 42.90, 'Pizzas', TRUE),
('Hambúrguer Clássico', 'Pão, carne, queijo, alface e tomate', 29.90, 'Lanches', TRUE),
('Refrigerante 600ml', 'Refrigerante gelado', 8.90, 'Bebidas', TRUE),
('Suco Natural', 'Suco de laranja natural 500ml', 12.90, 'Bebidas', TRUE);
