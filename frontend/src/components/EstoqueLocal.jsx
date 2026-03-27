import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css'; // mesmo CSS do Home

const EstoqueLocal = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [itens, setItens] = useState([]);
  const [localizacao, setLocalizacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);

  const [novoItem, setNovoItem] = useState({
    codigo: '',
    etiqueta: false,
    nome: '',
    definicao: '',
    descricao: ''
  });

  useEffect(() => {
    if (codigo) {
      carregarEstoqueLocal();
    }
  }, [codigo]);

  const carregarEstoqueLocal = async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await fetch(`http://localhost:3000/locais/${codigo}/itens`);
      if (!response.ok) throw new Error('Erro ao carregar itens');

      const itensData = await response.json();
      setItens(itensData);

      const localResp = await fetch('http://localhost:3000/locais');
      const locaisData = await localResp.json();
      const localEncontrado = locaisData.find(l => l.codigo === codigo);
      setLocalizacao(localEncontrado);

    } catch (error) {
      setErro('Erro ao carregar estoque. Backend rodando?');
      console.error('Erro:', error);
    } finally {
      setCarregando(false);
    }
  };

  const voltarHome = () => navigate('/');
  const voltarGeral = () => navigate('/estoque');

  if (carregando) {
    return (
      <div className="loading">
        <h1>Carregando Estoque...</h1>
        <p>Localização: {codigo}</p>
      </div>
    );
  }

  const adicionarItem = async () => {
    if (!novoItem.nome) {
      alert('Preencha nome');
      return;
    }

    await fetch('http://localhost:3000/itens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...novoItem,
        localizacao: codigo
      })
    });

    carregarEstoqueLocal();
  };


  const deletarItem = async (id) => {
    if (!window.confirm('Deseja realmente deletar este item?')) return;

    try {
      await fetch(`http://localhost:3000/itens/${id}`, {
        method: 'DELETE'
      });

      carregarEstoqueLocal();
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
          <h2>Estoque Local - {codigo}</h2>
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
          <button onClick={voltarHome}>🏠 Home</button>
          <button onClick={voltarGeral}>📦 Estoque Geral</button>
          <button onClick={carregarEstoqueLocal}>🔄 Atualizar</button>
        </div>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="erro">
          <p>{erro}</p>
        </div>
      )}

      {/* INFORMAÇÕES DA LOCALIZAÇÃO */}
      {localizacao && (
        <div className="locais-container">
          <div style={{ padding: '20px', background: '#f5f5f5' }}>
            <h3>Adicionar Item neste Local ({codigo})</h3>

            <input
              placeholder="Código"
              value={novoItem.codigo}
              onChange={(e) => setNovoItem({ ...novoItem, codigo: e.target.value })}
            />

            <input
              placeholder="Nome"
              value={novoItem.nome}
              onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
            />

            <input
              placeholder="Categoria / Definição"
              value={novoItem.definicao}
              onChange={(e) => setNovoItem({ ...novoItem, definicao: e.target.value })}
            />

            <input
              placeholder="Descrição"
              value={novoItem.descricao}
              onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
            />

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
          <h2>{localizacao.definicao}</h2>
          <p>Total de itens: {itens.length}</p>
        </div>
      )}

      {/* GRID DE ITENS */}
      <div style={{ marginTop: '20px', padding: '20px' }}>

        {itens.length === 0 ? (
          <p>Nenhum item nesta localização</p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
            borderRadius: '10px'
          }}>
            <thead style={{ background: '#0b7a3e', color: '#fff' }}>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Etiqueta</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {itens.map(item => (
                <tr key={item.id} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                  <td>{item.id}</td>
                  <td>{item.nome}</td>
                  <td>{item.etiqueta ? '✔' : '✖'}</td>
                  <td>{item.definicao}</td>
                  <td>{item.descricao || '-'}</td>

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

export default EstoqueLocal;