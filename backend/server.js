const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const cors = require("cors");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


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

    res.status(500).json({
      erro: "erro interno no servidor"
    });

  }

});


// listar usuarios
app.get("/usuarios", async (req, res) => {

  const [rows] = await db.execute(
    "SELECT id,nome_usuario,email FROM Usuarios"
  );

  res.json(rows);
});


// usuario por id
app.get("/usuarios/:id", async (req, res) => {

  const [rows] = await db.execute(
    "SELECT id,nome_usuario,email FROM Usuarios WHERE id=?",
    [req.params.id]
  );

  res.json(rows);
});


// deletar usuario
// app.delete("/usuarios/:id", async (req,res)=>{

//     await db.execute(
//         "DELETE FROM Usuarios WHERE id=?",
//         [req.params.id]
//     );

//     res.json({mensagem:"usuario removido"});
// });


//login
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

    let senhaBanco = usuario.senha;
    let senhaValida = false;


    
    if (senhaBanco.startsWith("$2")) {

      senhaValida = await bcrypt.compare(senha, senhaBanco);

    } else {

     
      senhaValida = senha === senhaBanco;

  
      if (senhaValida) {

        const hash = await bcrypt.hash(senha, 10);

        await db.execute(
          "UPDATE Usuarios SET senha=? WHERE id=?",
          [hash, usuario.id]
        );

      }

    }

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


// criar local
// app.post("/locais", async (req,res)=>{

//     const {codigo,definicao} = req.body;

//     await db.execute(
//         "INSERT INTO Locais (codigo,definicao) VALUES (?,?)",
//         [codigo,definicao]
//     );

//     res.json({mensagem:"local criado"});
// });


// listar locais
app.get("/locais", async (req, res) => {

  const [rows] = await db.execute(
    "SELECT * FROM Locais"
  );

  res.json(rows);
});


// local por codigo
// app.get("/locais/:codigo", async (req,res)=>{

//     const [rows] = await db.execute(
//         "SELECT * FROM Locais WHERE codigo=?",
//         [req.params.codigo]
//     );

//     res.json(rows);
// });


// atualizar local
// app.put("/locais/:codigo", async (req,res)=>{

//     const {definicao} = req.body;

//     await db.execute(
//         "UPDATE Locais SET definicao=? WHERE codigo=?",
//         [definicao,req.params.codigo]
//     );

//     res.json({mensagem:"local atualizado"});
// });


// deletar local
// app.delete("/locais/:codigo", async (req,res)=>{

//     await db.execute(
//         "DELETE FROM Locais WHERE codigo=?",
//         [req.params.codigo]
//     );

//     res.json({mensagem:"local removido"});
// });


// criar item
app.post("/itens", async (req, res) => {

  const { codigo, etiqueta, nome, definicao, descricao, localizacao } = req.body;

  await db.execute(
    `INSERT INTO Itens 
        (codigo,etiqueta,nome,definicao,descricao,localizacao)
        VALUES (?,?,?,?,?,?)`,
    [codigo, etiqueta, nome, definicao, descricao, localizacao]
  );

  res.json({ mensagem: "item criado" });
});


// listar itens
app.get("/itens", async (req, res) => {

  const [rows] = await db.execute(`
        SELECT Itens.*,Locais.definicao as local
        FROM Itens
        JOIN Locais
        ON Itens.localizacao = Locais.codigo
    `);

  res.json(rows);
});


// item por id
// app.get("/itens/:id", async (req,res)=>{

//     const [rows] = await db.execute(
//         "SELECT * FROM Itens WHERE id=?",
//         [req.params.id]
//     );

//     res.json(rows);
// });

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


//itens de um local
app.get("/locais/:codigo/itens", async (req, res) => {

  const [rows] = await db.execute(
    "SELECT * FROM Itens WHERE localizacao=?",
    [req.params.codigo]
  );

  res.json(rows);
});


app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
