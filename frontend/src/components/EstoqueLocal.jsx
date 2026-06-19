import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

const EstoqueLocal = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [itens, setItens] = useState([]);
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [localizacao, setLocalizacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);

  const [novoItem, setNovoItem] = useState({
    codigo: '',
    etiqueta: false,
    descricao: ''
  });

  useEffect(() => {
    if (codigo) {
      carregarEstoqueLocal();
    }
  }, [codigo]);

  useEffect(() => {
    filtrarItens();
  }, [itens, filtroNome]);

  const carregarEstoqueLocal = async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await fetch(
        `http://localhost:3000/locais/${codigo}/itens`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setItens(data);
      setItensFiltrados(data);

      const localResp = await fetch(
        'http://localhost:3000/locais'
      );

      const locaisData = await localResp.json();

      const local = locaisData.find(
        l => l.codigo === codigo
      );

      setLocalizacao(local);

    } catch {
      setErro('Erro ao carregar estoque.');
    } finally {
      setCarregando(false);
    }
  };

  const filtrarItens = () => {
    const filtro = filtroNome.trim().toUpperCase();

    if (!filtro) {
      setItensFiltrados(itens);
      return;
    }

    const resultado = itens.filter(item =>
      item.codigo.toUpperCase().includes(filtro)
    );

    setItensFiltrados(resultado);
  };

  const buscarItemExterno = async () => {
    if (!novoItem.codigo) {
      alert('Digite um código');
      return;
    }

    try {
      const resp = await fetch(
        `http://localhost:3000/itens-externos/${novoItem.codigo}`
      );

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.erro);
        return;
      }

      setNovoItem({
        codigo: data.codigo,
        etiqueta: data.etiqueta,
        descricao: data.descricao
      });

    } catch {
      alert('Erro ao buscar item');
    }
  };

  const adicionarItem = async () => {
    try {
      const resp = await fetch(
        'http://localhost:3000/itens',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...novoItem,
            localizacao: codigo
          })
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.erro);
        return;
      }

      setNovoItem({
        codigo: '',
        etiqueta: false,
        descricao: ''
      });

      setMostrarFormulario(false);

      carregarEstoqueLocal();

    } catch {
      alert('Erro ao adicionar item');
    }
  };

  const deletarItem = async (id) => {
    const confirmar = window.confirm(
      'Deseja deletar este item?'
    );

    if (!confirmar) {
      return;
    }

    try {
      await fetch(
        `http://localhost:3000/itens/${id}`,
        {
          method: 'DELETE'
        }
      );

      carregarEstoqueLocal();

    } catch {
      alert('Erro ao deletar item');
    }
  };

  if (carregando) {
    return (
      <div className="loading">
        <h1>Carregando...</h1>
      </div>
    );
  }

  return (
    <div className="home-container">

      <header className="header">
        <div className="header-left">
          <img src="/LogoIFSP.jpg" alt="Logo" />
          <h1>IFSP</h1>
        </div>

        <div className="header-center">
          <h2>Estoque Local - {codigo}</h2>
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

      <div className={`side-menu-overlay ${menuAberto ? 'active' : ''}`} onClick={() => setMenuAberto(false)}>
        <div className={`side-menu ${menuAberto ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setMenuAberto(false)}>×</button>
          <h3>Menu</h3>
          <button onClick={() => navigate('/')}>
            Home
          </button>

          <button onClick={() => navigate('/estoque')}>
            Estoque Geral
          </button>

          <button onClick={() => navigate('/comissao')}>
            Comissão de Inventário
          </button>
        </div>
      </div>

      {localizacao && (
        <div className="form-box">

          <h3 className="form-title">
            {localizacao.definicao}
          </h3>

          <p>
            Total de itens: {itensFiltrados.length}
          </p>

          <button
            className="btn-primary"
            onClick={() =>
              setMostrarFormulario(!mostrarFormulario)
            }
          >
            {mostrarFormulario
              ? 'Cancelar'
              : 'Adicionar Item'}
          </button>

          {mostrarFormulario && (
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

                <button
                  className="btn-primary"
                  onClick={buscarItemExterno}
                >
                  Buscar
                </button>

                <textarea
                  className="escrita"
                  value={novoItem.descricao}
                  placeholder="Descrição"
                  disabled
                />

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

                <button
                  className="btn-primary"
                  onClick={adicionarItem}
                >
                  Adicionar
                </button>

              </div>

            </div>
          )}

        </div>
      )}

      {erro && (
        <div className="erro">
          {erro}
        </div>
      )}

      <div className="filters">
        <input
          placeholder="Buscar código..."
          value={filtroNome}
          onChange={(e) =>
            setFiltroNome(e.target.value)
          }
        />
      </div>

      <div className="table-container">

        {itensFiltrados.length === 0 ? (
          <div className="vazio">
            Nenhum item encontrado
          </div>
        ) : (
          <table className="inventory-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Etiqueta</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {itensFiltrados.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.codigo}</td>
                  <td>
                    {item.etiqueta ? 'Sim' : 'Não'}
                  </td>
                  <td>{item.descricao}</td>
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
        )}

      </div>

    </div>
  );
};

export default EstoqueLocal;