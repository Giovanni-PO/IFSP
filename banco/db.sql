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
    descricao TEXT
);


CREATE TABLE Itens(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,

    -- Campos antigos
    codigo VARCHAR(10) UNIQUE,
    etiqueta BOOLEAN NOT NULL DEFAULT 0,
    descricao TEXT,
    localizacao VARCHAR(10),

    -- Campos novos do inventário
    numero INT UNIQUE,
    status VARCHAR(20),
    ed BIGINT,
    rotulos VARCHAR(100),
    carga_atual VARCHAR(150),
    setor_responsavel VARCHAR(100),
    campus_responsavel VARCHAR(50),
    campus_carga VARCHAR(50),
    valor DECIMAL(12,2),
    numero_nota_fiscal VARCHAR(50),
    data_entrada DATETIME,
    data_carga VARCHAR(20),
    fornecedor VARCHAR(200),
    sala VARCHAR(50),
    estado_conservacao VARCHAR(100),
    numero_serie VARCHAR(150),

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



INSERT INTO Usuarios(nome_usuario,email,senha) VALUES
("admin","admin@email.com","teste123"),
("joao","joao@email.com","teste123"),
("maria","maria@email.com","teste123");



INSERT INTO ItensExternos
(codigo, etiqueta, descricao)
VALUES
("I010",1,"HD Seagate 1TB"),
("I011",0,"Fonte ATX 500W"),
("I012",1,"Projetor Epson HDMI"),
("I013",0,"Webcam Full HD");


-- NOVOS INSERTS DO INVENTÁRIO


INSERT INTO Itens
(
numero,
status,
ed,
descricao,
rotulos,
carga_atual,
setor_responsavel,
campus_responsavel,
campus_carga,
valor,
numero_nota_fiscal,
data_entrada,
data_carga,
fornecedor,
sala,
estado_conservacao,
numero_serie
)
VALUES
(
445,
'ativo',
123110303,
'EM ACO C/4 GAVETAS NA COR VERDE OLIVA.
 [Tipo de Ingresso:Doacao]
 [ARQUIVO- Antigo Classificador:14212426403]
 [Arquivo - Novo Classificador:12311-0303-0004]',
'SCL-CTI',
'Andre Luis Tardelli Magalhaes',
'CTI-SCL',
'SCL',
'SCL',
0.01,
NULL,
'1998-06-19 00:00:00',
'26/04/2016',
NULL,
NULL,
'Não aplicar',
NULL
);



INSERT INTO Itens
(
numero,
status,
ed,
descricao,
rotulos,
carga_atual,
setor_responsavel,
campus_responsavel,
campus_carga,
valor,
numero_nota_fiscal,
data_entrada,
data_carga,
fornecedor,
sala,
estado_conservacao,
numero_serie
)
VALUES
(
454,
'ativo',
123110303,
'EM ACO C/4 GAVETAS NA COR VERDE OLIVA. FORNECIDO POR: IGPECOGRAPH - MAQ.DEENDERECAR LTDA.
 [Marca/Modelo:IGPECO]
 [Tipo de Ingresso:Doacao]
 [ARQUIVO- Antigo Classificador:14212426403]
 [Arquivo - Novo Classificador:12311-0303-0004]',
'SCL-DRG',
'Danilo Augusto Moschetto',
'CTADS-SCL',
'SCL',
'SCL',
0.01,
NULL,
'1998-06-19 00:00:00',
'26/04/2016',
NULL,
'B103',
'Não aplicar',
NULL
);
