DROP DATABASE IF EXISTS Inventario;

CREATE DATABASE Inventario;

USE Inventario;

CREATE TABLE Locais(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    definicao VARCHAR(100) NOT NULL
);

CREATE TABLE ItensExternos(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    etiqueta BOOLEAN NOT NULL DEFAULT 0,
    nome VARCHAR(50) NOT NULL,
    definicao VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE Itens(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    etiqueta BOOLEAN NOT NULL DEFAULT 0,
    nome VARCHAR(50) NOT NULL,
    definicao VARCHAR(100) NOT NULL,
    descricao TEXT,
    localizacao VARCHAR(10) NOT NULL,

    CONSTRAINT fk_localizacao
    FOREIGN KEY (localizacao)
    REFERENCES Locais(codigo)
);

CREATE TABLE Usuarios(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

INSERT INTO Locais (codigo, definicao) VALUES
("A1","Estoque principal"),
("B1","Armario laboratorio"),
("C1","Sala professores"),
("D1","Deposito ferramentas");

INSERT INTO Usuarios (nome_usuario,email,senha) VALUES
("admin","admin@email.com","teste123"),
("joao","joao@email.com","teste123"),
("maria","maria@email.com","teste123");

INSERT INTO ItensExternos
(codigo, etiqueta, nome, definicao, descricao)
VALUES
("I010",1,"HD Externo","Armazenamento","HD Seagate 1TB"),
("I011",0,"Fonte","Eletronico","Fonte ATX 500W"),
("I012",1,"Projetor","Equipamento","Projetor Epson HDMI"),
("I013",0,"Webcam","Periferico","Webcam Full HD");

INSERT INTO Itens
(codigo,etiqueta,nome,definicao,descricao,localizacao)
VALUES
("I001",1,"Mouse","Periferico","Mouse USB preto","A1"),
("I002",1,"Teclado","Periferico","Teclado mecanico","A1"),
("I003",0,"Monitor","Equipamento","Monitor 24 polegadas","B1");