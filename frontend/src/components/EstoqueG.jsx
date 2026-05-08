import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const EstoqueG = () => {

  const navigate = useNavigate();

  const [itens, setItens] = useState([]);
  const [locais, setLocais] = useState([]);

  const [menuAberto, setMenuAberto] = useState(false);

  const [novoItem, setNovoItem] = useState({
    codigo: '',
    etiqueta: false,
    nome: '',
    definicao: '',
    descricao: '',
    localizacao: ''
  });

  const [filtroNome, setFiltroNome] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const respItens = await fetch('http://localhost:3000/itens');
    const itensData = await respItens.json();
    setItens(itensData);

    const respLocais = await fetch('http://localhost:3000/locais');
    const locaisData = await respLocais.json();
    setLocais(locaisData);
  };

  const buscarItemExterno = async () => {
    const resp = await fetch(
      `http://localhost:3000/itens-externos/${novoItem.codigo}`
    );

    const data = await resp.json();

    if (!resp.ok) {
      alert(data.erro);
      return;
    }

    setNovoItem({
      ...novoItem,
      codigo: data.codigo,
      etiqueta: data.etiqueta,
      nome: data.nome,
      definicao: data.definicao,
      descricao: data.descricao
    });
  };

  const adicionarItem = async () => {
    const resp = await fetch('http://localhost:3000/itens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoItem)
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data.erro);
      return;
    }

    alert('Item criado');
    carregarDados();
  };

  const deletarItem = async (id) => {
    await fetch(`http://localhost:3000/itens/${id}`, {
      method: 'DELETE'
    });

    carregarDados();
  };

  const itensFiltrados = itens.filter(item =>
    item.codigo.toLowerCase().includes(filtroNome.toLowerCase()) ||
    item.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  return (
    <div className="home-container">

      {/* ======================================================
          NAVBAR IGUAL HOME / ESTOQUE LOCAL
      ====================================================== */}

      <header className="header">

        <div className="header-left">
          <img src="/LogoIFSP.jpg" alt="Logo" />
          <h1>IFSP</h1>
        </div>

        <div className="header-center">
          <h2>Estoque Geral</h2>
        </div>

        <div className="header-right">
          <button
            className="menu-btn"
            onClick={() => setMenuAberto(true)}
          >
            ☰
          </button>
        </div>

      </header>

      {/* MENU LATERAL IGUAL OUTRAS PÁGINAS */}
      <div
        className={`side-menu-overlay ${menuAberto ? 'active' : ''}`}
        onClick={() => setMenuAberto(false)}
      >

        <div
          className={`side-menu ${menuAberto ? 'active' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >

          <button
            className="close-btn"
            onClick={() => setMenuAberto(false)}
          >
            ×
          </button>

          <button onClick={() => navigate('/')}>
            🏠 Home
          </button>

          <button onClick={carregarDados}>
            🔄 Atualizar
          </button>

        </div>

      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      <div className="form-box">

        <h3 className="form-title">
          Adicionar Item
        </h3>

        <div className="form-grid">

          <input
            placeholder="Código"
            value={novoItem.codigo}
            onChange={(e) =>
              setNovoItem({
                ...novoItem,
                codigo: e.target.value
              })
            }
          />

          <button className="btn-primary" onClick={buscarItemExterno}>
            🔍 Buscar
          </button>

          <input value={novoItem.nome} placeholder="Nome" disabled />
          <input value={novoItem.definicao} placeholder="Definição" disabled />

          <textarea value={novoItem.descricao} placeholder="Descrição" disabled />

          <select
            value={novoItem.localizacao}
            onChange={(e) =>
              setNovoItem({
                ...novoItem,
                localizacao: e.target.value
              })
            }
          >
            <option value="">Selecione Local</option>

            {locais.map(local => (
              <option key={local.codigo} value={local.codigo}>
                {local.codigo} - {local.definicao}
              </option>
            ))}
          </select>

          {/* CHECKBOX PADRÃO IGUAL OUTRAS PÁGINAS */}
          <div className="checkbox-modern">
            <input
              type="checkbox"
              checked={novoItem.etiqueta}
              onChange={(e) =>
                setNovoItem({
                  ...novoItem,
                  etiqueta: e.target.checked
                })
              }
            />
            <span>Possui etiqueta</span>
          </div>

          <button className="btn-primary" onClick={adicionarItem}>
            ➕ Adicionar
          </button>

        </div>

      </div>

      {/* ======================================================
          BUSCA
      ====================================================== */}

      <div className="filters">
        <input
          placeholder="Buscar item..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
      </div>

      {/* ======================================================
          TABELA
      ====================================================== */}

      <div className="table-container">

        <table className="inventory-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nome</th>
              <th>Definição</th>
              <th>Descrição</th>
              <th>Etiqueta</th>
              <th>Local</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {itensFiltrados.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.codigo}</td>
                <td>{item.nome}</td>
                <td>{item.definicao}</td>
                <td>{item.descricao}</td>
                <td>{item.etiqueta ? '✔' : '✖'}</td>
                <td>{item.local}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deletarItem(item.id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default EstoqueG;