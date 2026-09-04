const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/usuarios", async (req, res) => {
  try {
    const { nome_usuario, email, senha } = req.body;

    const hash = await bcrypt.hash(senha, 10);

    await db.execute(
      "INSERT INTO Usuarios (nome_usuario, email, senha) VALUES (?, ?, ?)",
      [nome_usuario, email, hash]
    );

    res.json({ mensagem: "usuario criado" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "erro criar usuario" });
  }
});

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

    const valido = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!valido) {
      return res.status(401).json({
        erro: "senha incorreta"
      });
    }

    res.json({
      mensagem: "login realizado",
      usuario: usuario.nome_usuario
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "erro login" });
  }
});

app.get("/locais", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM Locais ORDER BY id"
    );

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "erro locais" });
  }
});

app.get("/itens-externos/:codigo", async (req, res) => {
  try {
    const codigo = decodeURIComponent(req.params.codigo)
      .trim()
      .toUpperCase();

    const [rows] = await db.execute(
      "SELECT * FROM ItensExternos WHERE UPPER(TRIM(codigo))=?",
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        erro: "item externo nao encontrado"
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "erro item externo" });
  }
});

app.get("/itens", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT *
      FROM Itens
      ORDER BY id
    `);

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      erro: "erro listar itens"
    });
  }
});

app.get("/locais/:codigo/itens", async (req, res) => {
  try {
    const codigo = decodeURIComponent(req.params.codigo)
      .trim()
      .toUpperCase();

    const [rows] = await db.execute(`
      SELECT *
      FROM Itens
      WHERE UPPER(TRIM(sala)) = ?
      OR UPPER(TRIM(sala)) LIKE CONCAT(?, ' %')
      ORDER BY id
    `, [codigo, codigo]);

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      erro: "erro buscar sala"
    });
  }
});

app.get("/itens/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM Itens WHERE id=?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        erro: "item nao encontrado"
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      erro: "erro buscar item"
    });
  }
});

app.post("/itens", async (req, res) => {
  try {
    const dados = req.body;

    if (!dados.numero && !dados.codigo) {
      return res.status(400).json({
        erro: "numero ou codigo obrigatorio"
      });
    }

    if (!dados.sala) {
      return res.status(400).json({
        erro: "sala obrigatoria"
      });
    }

    const sala = String(dados.sala)
      .trim()
      .toUpperCase();

    if (dados.numero) {
      const [existe] = await db.execute(
        "SELECT id FROM Itens WHERE numero=?",
        [dados.numero]
      );

      if (existe.length > 0) {
        return res.status(400).json({
          erro: "numero ja cadastrado"
        });
      }
    }

    const [locais] = await db.execute(
      "SELECT codigo FROM Locais WHERE UPPER(TRIM(codigo))=?",
      [sala]
    );

    if (locais.length === 0) {
      return res.status(400).json({
        erro: "sala nao cadastrada"
      });
    }

    const salaBanco = locais[0].codigo;

    await db.execute(`
      INSERT INTO Itens (
        codigo,
        etiqueta,
        descricao,
        numero,
        status,
        ed,
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      dados.codigo || null,
      dados.etiqueta || 0,
      dados.descricao || null,
      dados.numero || null,
      dados.status || "ativo",
      dados.ed || null,
      dados.rotulos || null,
      dados.carga_atual || null,
      dados.setor_responsavel || null,
      dados.campus_responsavel || null,
      dados.campus_carga || null,
      dados.valor || null,
      dados.numero_nota_fiscal || null,
      dados.data_entrada || null,
      dados.data_carga || null,
      dados.fornecedor || null,
      salaBanco,
      dados.estado_conservacao || null,
      dados.numero_serie || null
    ]);

    res.json({
      mensagem: "item criado",
      sala: salaBanco
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      erro: "erro criar item"
    });
  }
});

app.put("/itens/:id", async (req, res) => {
  try {
    const d = req.body;

    if (!d.sala) {
      return res.status(400).json({
        erro: "sala obrigatoria"
      });
    }

    const sala = String(d.sala)
      .trim()
      .toUpperCase();

    const [locais] = await db.execute(
      "SELECT codigo FROM Locais WHERE UPPER(TRIM(codigo))=?",
      [sala]
    );

    if (locais.length === 0) {
      return res.status(400).json({
        erro: "sala nao cadastrada"
      });
    }

    await db.execute(`
      UPDATE Itens
      SET
        numero=?,
        status=?,
        descricao=?,
        rotulos=?,
        carga_atual=?,
        sala=?,
        estado_conservacao=?,
        numero_serie=?
      WHERE id=?
    `, [
      d.numero,
      d.status,
      d.descricao,
      d.rotulos,
      d.carga_atual,
      locais[0].codigo,
      d.estado_conservacao,
      d.numero_serie,
      req.params.id
    ]);

    res.json({
      mensagem: "item atualizado",
      sala: locais[0].codigo
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      erro: "erro atualizar"
    });
  }
});

app.delete("/itens/:id", async (req, res) => {
  try {
    const [resultado] = await db.execute(
      "DELETE FROM Itens WHERE id=?",
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: "item nao encontrado"
      });
    }

    res.json({
      mensagem: "item removido"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      erro: "erro deletar"
    });
  }
});

app.listen(3000, () => {
  console.log(`
====================================
Servidor rodando
http://localhost:3000
====================================
`);
});