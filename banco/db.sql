drop database if exists Inventario;
create database Inventario;
use Inventario;

create table Locais(
	id int not null primary key auto_increment,
    codigo varchar(10) not null unique,
    definicao varchar(100) not null
);

create table Itens(
	id int not null primary key auto_increment,
    codigo varchar(10) not null unique,
    etiqueta boolean not null default 0,
    nome varchar(50) not null,
    definicao varchar(100) not null,
    descricao text,
    localizacao varchar(10) not null,
    
    constraint fk_localizacao
    foreign key (localizacao) references Locais(codigo)
);

create table Usuarios(
	id int not null primary key auto_increment,
    nome_usuario varchar(20) not null unique,
    email varchar(100) not null unique,
    senha varchar(255) not null
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

INSERT INTO Itens (codigo,etiqueta,nome,definicao,descricao,localizacao) VALUES
("I001",1,"Mouse","Periferico","Mouse USB preto","A1"),
("I002",1,"Teclado","Periferico","Teclado mecanico","A1"),
("I003",0,"Monitor","Equipamento","Monitor 24 polegadas","B1"),
("I004",0,"Multimetro","Ferramenta","Medidor eletrico","D1"),
("I005",1,"Notebook","Computador","Notebook para professores","C1");