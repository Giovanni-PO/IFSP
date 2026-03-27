import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // usa o mesmo CSS do Home

const EstoqueG = () => {
  const [itens, setItens] = useState([]);
  const [locais, setLocais] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const [novoItem, setNovoItem] = useState({
    id: '',
    etiqueta: false,
    nome: '',
    definicao: '',
    descricao: '',
    localizacao: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarItens();
  }, [itens, filtroNome, filtroLocal]);

  const carregarDados = async () => {
    try {
      setCarregando(true);

      const respLocais = await fetch('http://localhost:3000/locais');
      const locaisData = await respLocais.json();
      setLocais(locaisData);

      const respItens = await fetch('http://localhost:3000/itens');
      const itensData = await respItens.json();
      setItens(itensData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do servidor');
    } finally {
      setCarregando(false);
    }
  };

  const filtrarItens = () => {
    let filtrados = itens;
    if (filtroNome) {
      filtrados = filtrados.filter(item =>
        item.nome.toLowerCase().includes(filtroNome.toLowerCase())
      );
    }
    if (filtroLocal) {
      filtrados = filtrados.filter(item => item.localizacao === filtroLocal);
    }
    setItensFiltrados(filtrados);
  };

  const voltarInicio = () => {
    navigate('/');
  };

  if (carregando) {
    return (
      <div className="loading">
        <h1>Carregando Estoque Geral...</h1>
        <p>Conectando com backend...</p>
      </div>
    );
  }


  const adicionarItem = async () => {
    if (!novoItem.nome || !novoItem.localizacao) {
      alert('Preencha nome e localização');
      return;
    }

    try {
      const resp = await fetch('http://localhost:3000/itens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoItem)
      });

      if (!resp.ok) throw new Error();

      alert('Item criado!');

      setNovoItem({
        etiqueta: false,
        nome: '',
        definicao: '',
        descricao: '',
        localizacao: ''
      });

      carregarDados();

    } catch {
      alert('Erro ao criar item');
    }
  };


  const deletarItem = async (id) => {
    if (!window.confirm('Deseja realmente deletar este item?')) return;

    try {
      await fetch(`http://localhost:3000/itens/${id}`, {
        method: 'DELETE'
      });

      carregarDados();
    } catch (err) {
      alert('Erro ao deletar item');
    }
  };

  return (
    <div className="home-container">

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <img src="/LogoIFSP.jpg" alt="Logo IFSP" />
          <h1>IFSP</h1>
        </div>

        <div className="header-center">
          <input
            type="text"
            placeholder="🔍 Buscar item do estoque..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </div>

        <div className="header-right">
          <button className="menu-btn" onClick={() => setMenuAberto(true)}>☰</button>
        </div>
      </header>

      {/* MENU LATERAL */}
      <div className={`side-menu-overlay ${menuAberto ? 'active' : ''}`} onClick={() => setMenuAberto(false)}>
        <div className={`side-menu ${menuAberto ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setMenuAberto(false)}>×</button>
          <h3>Menu</h3>
          <button onClick={voltarInicio}>🏠 Início</button>
          <button onClick={carregarDados}>🔄 Atualizar Estoque</button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="top-bar">
        <div style={{ padding: '20px', background: '#f5f5f5' }}>
          <h3>Adicionar Item</h3>

          <input
            placeholder="Código (ex: I010)"
            value={novoItem.id}
            onChange={(e) => setNovoItem({ ...novoItem, id: e.target.value })}
          />

          <input
            placeholder="Nome"
            value={novoItem.nome}
            onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
          />

          <input
            placeholder="Definição"
            value={novoItem.definicao}
            onChange={(e) => setNovoItem({ ...novoItem, definicao: e.target.value })}
          />

          <input
            placeholder="Descrição"
            value={novoItem.descricao}
            onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
          />

          {/* SELECT DOS LOCAIS (FK CORRETA) */}
          <select
            value={novoItem.localizacao}
            onChange={(e) => setNovoItem({ ...novoItem, localizacao: e.target.value })}
          >
            <option value="">Selecione o local</option>
            {locais.map(local => (
              <option key={local.id} value={local.id}>
                {local.id} - {local.definicao}
              </option>
            ))}
          </select>

          <label>
            <input
              type="checkbox"
              checked={novoItem.etiqueta}
              onChange={(e) => setNovoItem({ ...novoItem, etiqueta: e.target.checked })}
            />
            Possui etiqueta
          </label>

          <br />

          <button onClick={adicionarItem}>
            ➕ Adicionar Item
          </button>
        </div>
        <select
          value={filtroLocal}
          onChange={(e) => setFiltroLocal(e.target.value)}
          style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ccc' }}
        >
          <option value="">Todas as localizações</option>
          {locais.map(local => (
            <option key={local.codigo} value={local.codigo}>
              {local.codigo} - {local.definicao}
            </option>
          ))}
        </select>
      </div>

      {/* GRID DE ITENS */}
      <div style={{ marginTop: '20px', padding: '20px' }}>

        {itensFiltrados.length === 0 ? (
          <p>Nenhum item encontrado</p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <thead style={{ background: '#0b7a3e', color: '#fff' }}>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Etiqueta</th>
                <th>Definição</th>
                <th>Descrição</th>
                <th>Local</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {itensFiltrados.map(item => (
                <tr key={item.id} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                  <td>{item.id}</td>
                  <td>{item.nome}</td>
                  <td>{item.etiqueta ? '✔' : '✖'}</td>
                  <td>{item.definicao}</td>
                  <td>{item.descricao || '-'}</td>
                  <td>{item.local}</td>

                  <td>
                    <button
                      style={{
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
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

export default EstoqueG;