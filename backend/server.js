const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Joi = require("joi");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* =====================================================
   USUARIOS
===================================================== */

// criar usuario
app.post("/usuarios", async (req, res) => {

  try {

    const schema = Joi.object({
      nome_usuario: Joi.string().required(),
      email: Joi.string().email().required(),
      senha: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {

      return res.status(400).json({
        erro: error.details[0].message
      });
    }

    const {
      nome_usuario,
      email,
      senha
    } = req.body;

    const hash = await bcrypt.hash(senha, 10);

    await db.execute(
      "INSERT INTO Usuarios (nome_usuario,email,senha) VALUES (?,?,?)",
      [nome_usuario, email, hash]
    );

    res.json({
      mensagem: "usuario criado"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro interno"
    });
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

    if (rows.length === 0) {

      return res.status(401).json({
        erro: "usuario nao encontrado"
      });
    }

    const usuario = rows[0];

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {

      return res.status(401).json({
        erro: "senha incorreta"
      });
    }

    res.json({
      mensagem: "login realizado",
      usuario: usuario.nome_usuario
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro login"
    });
  }
});

/* =====================================================
   LOCAIS
===================================================== */

// listar locais
app.get("/locais", async (req, res) => {

  try {

    const [rows] = await db.execute(
      "SELECT * FROM Locais"
    );

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro locais"
    });
  }
});

// listar itens de um local
app.get("/locais/:codigo/itens", async (req, res) => {

  try {

    const codigo = req.params.codigo.toUpperCase();

    const [rows] = await db.execute(`
      SELECT *
      FROM Itens
      WHERE localizacao = ?
      ORDER BY id
    `, [codigo]);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro ao buscar itens do local"
    });
  }
});

/* =====================================================
   ITENS EXTERNOS
===================================================== */

// buscar item externo pelo codigo
app.get("/itens-externos/:codigo", async (req, res) => {

  try {

    const codigo = req.params.codigo.toUpperCase();

    const [rows] = await db.execute(
      "SELECT * FROM ItensExternos WHERE codigo=?",
      [codigo]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        erro: "item nao encontrado"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro item externo"
    });
  }
});

/* =====================================================
   ITENS
===================================================== */

// listar todos itens
app.get("/itens", async (req, res) => {

  try {

    const [rows] = await db.execute(`
      SELECT 
        Itens.*,
        Locais.definicao AS local
      FROM Itens
      JOIN Locais
      ON Itens.localizacao = Locais.codigo
      ORDER BY Itens.id
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro itens"
    });
  }
});

// criar item
app.post("/itens", async (req, res) => {

  try {

    const {
      codigo,
      etiqueta,
      descricao,
      localizacao
    } = req.body;

    // validacao
    if (
      !codigo ||
      !localizacao
    ) {

      return res.status(400).json({
        erro: "dados invalidos"
      });
    }

    // verifica codigo duplicado
    const [existe] = await db.execute(
      "SELECT * FROM Itens WHERE codigo=?",
      [codigo]
    );

    if (existe.length > 0) {

      return res.status(400).json({
        erro: "codigo ja cadastrado"
      });
    }

    // inserir item
    await db.execute(
      `INSERT INTO Itens
      (
        codigo,
        etiqueta,
        descricao,
        localizacao
      )
      VALUES (?,?,?,?)`,
      [
        codigo,
        etiqueta,
        descricao,
        localizacao
      ]
    );

    res.json({
      mensagem: "item criado"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro criar item"
    });
  }
});

// atualizar item
app.put("/itens/:id", async (req, res) => {

  try {

    const {
      descricao
    } = req.body;

    await db.execute(
      `UPDATE Itens
      SET
        descricao=?
      WHERE id=?`,
      [
        descricao,
        req.params.id
      ]
    );

    res.json({
      mensagem: "item atualizado"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro atualizar"
    });
  }
});

// deletar item
app.delete("/itens/:id", async (req, res) => {

  try {

    await db.execute(
      "DELETE FROM Itens WHERE id=?",
      [req.params.id]
    );

    res.json({
      mensagem: "item removido"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "erro deletar"
    });
  }
});

/* =====================================================
   SERVIDOR
===================================================== */

app.listen(3000, () => {

  console.log(`
========================================
Servidor rodando:
http://localhost:3000
========================================
  `);
});