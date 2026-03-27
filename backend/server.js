const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const cors = require("cors");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


/* ================= USUÁRIOS ================= */

// criar usuario
app.post("/usuarios", async (req, res) => {
  try {
    const schema = Joi.object({
      nome_usuario: Joi.string().required(),
      email: Joi.string().email().required(),
      senha: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);

    if (error)
      return res.status(400).json({ erro: error.details[0].message });

    const { nome_usuario, email, senha } = req.body;

    const hash = await bcrypt.hash(senha, 10);

    await db.execute(
      "INSERT INTO Usuarios (nome_usuario,email,senha) VALUES (?,?,?)",
      [nome_usuario, email, hash]
    );

    res.json({ mensagem: "usuario criado" });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        erro: "email ou nome de usuario já existe"
      });
    }

    console.error(err);
    res.status(500).json({ erro: "erro interno no servidor" });
  }
});

// login
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM Usuarios WHERE email=?",
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ erro: "usuario nao encontrado" });

    const usuario = rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida)
      return res.status(401).json({ erro: "senha incorreta" });

    res.json({
      mensagem: "login realizado",
      usuario: usuario.nome_usuario
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "erro no login" });
  }
});

/* ================= LOCAIS ================= */

// listar locais
app.get("/locais", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM Locais");
  res.json(rows);
});

// itens de um local (por CODIGO)
app.get("/locais/:codigo/itens", async (req, res) => {
  try {
    const codigo = req.params.codigo;

    const [rows] = await db.execute(
      "SELECT * FROM Itens WHERE localizacao = ? ORDER BY id",
      [codigo]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "erro ao buscar itens" });
  }
});

/* ================= ITENS ================= */

// criar item
app.post("/itens", async (req, res) => {
  try {
    const { etiqueta, nome, definicao, descricao, localizacao } = req.body;

    if (!nome || !localizacao) {
      return res.status(400).json({ erro: "dados inválidos" });
    }

    await db.execute(
      `INSERT INTO Itens 
      (etiqueta,nome,definicao,descricao,localizacao)
      VALUES (?,?,?,?,?)`,
      [etiqueta, nome, definicao, descricao, localizacao]
    );

    res.json({ mensagem: "item criado" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "erro ao criar item" });
  }
});

// listar itens com JOIN correto
app.get("/itens", async (req, res) => {
  const [rows] = await db.execute(`
    SELECT Itens.*, Locais.definicao as local
    FROM Itens
    JOIN Locais ON Itens.localizacao = Locais.codigo
  `);

  res.json(rows);
});

// atualizar item
app.put("/itens/:id", async (req, res) => {
  const { nome, descricao } = req.body;

  await db.execute(
    "UPDATE Itens SET nome=?,descricao=? WHERE id=?",
    [nome, descricao, req.params.id]
  );

  res.json({ mensagem: "item atualizado" });
});

// deletar item
app.delete("/itens/:id", async (req, res) => {
  await db.execute(
    "DELETE FROM Itens WHERE id=?",
    [req.params.id]
  );

  res.json({ mensagem: "item removido" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});