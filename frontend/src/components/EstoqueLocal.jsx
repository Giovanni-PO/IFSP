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
    nome: '',
    definicao: '',
    descricao: ''
  });

  useEffect(() => {
    if (codigo) carregarEstoqueLocal();
  }, [codigo]);

  useEffect(() => {
    filtrarItens();
  }, [itens, filtroNome]);

  const carregarEstoqueLocal = async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await fetch(`http://localhost:3000/locais/${codigo}/itens`);
      if (!response.ok) throw new Error();

      const data = await response.json();
      setItens(data);
      setItensFiltrados(data);

      const localResp = await fetch('http://localhost:3000/locais');
      const locaisData = await localResp.json();
      const local = locaisData.find(l => l.codigo === codigo);
      setLocalizacao(local);

    } catch {
      setErro('Erro ao carregar estoque.');
    } finally {
      setCarregando(false);
    }
  };

  const filtrarItens = () => {
    if (!filtroNome) return setItensFiltrados(itens);

    const filtrados = itens.filter(item =>
      item.nome.toLowerCase().includes(filtroNome.toLowerCase())
    );

    setItensFiltrados(filtrados);
  };

  const adicionarItem = async () => {
    if (!novoItem.nome) return alert('Preencha nome');

    await fetch('http://localhost:3000/itens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...novoItem, localizacao: codigo })
    });

    setNovoItem({
      codigo: '',
      etiqueta: false,
      nome: '',
      definicao: '',
      descricao: ''
    });

    setMostrarFormulario(false);
    carregarEstoqueLocal();
  };

  const deletarItem = async (id) => {
    if (!window.confirm('Deseja deletar?')) return;

    await fetch(`http://localhost:3000/itens/${id}`, { method: 'DELETE' });
    carregarEstoqueLocal();
  };

  if (carregando) {
    return <div className="loading"><h1>Carregando...</h1></div>;
  }

  return (
    <div className="home-container">

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <img src="/LogoIFSP.jpg" alt="Logo" />
          <h1>IFSP</h1>
        </div>

        <div className="header-center">
          <h2>Estoque Local - {codigo}</h2>
        </div>

        <div className="header-right">
          <button className="menu-btn" onClick={() => setMenuAberto(true)}>☰</button>
        </div>
      </header>

      {/* MENU */}
      <div className={`side-menu-overlay ${menuAberto ? 'active' : ''}`} onClick={() => setMenuAberto(false)}>
        <div className={`side-menu ${menuAberto ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenuAberto(false)}>×</button>
          <button onClick={() => navigate('/')}>🏠 Home</button>
          <button onClick={() => navigate('/estoque')}>📦 Geral</button>
          <button onClick={carregarEstoqueLocal}>🔄 Atualizar</button>
        </div>
      </div>

      {/* INFO LOCAL */}
      {localizacao && (
        <div className="locais-container">

          <h2>{localizacao.definicao}</h2>
          <p>Total de itens: {itensFiltrados.length}</p>

          {/* BOTÃO */}
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            style={{
              marginBottom: '15px',
              padding: '10px',
              background: '#0b7a3e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            {mostrarFormulario ? '❌ Cancelar' : '➕ Adicionar Item'}
          </button>

          {/* FORM */}
          {mostrarFormulario && (
            <div style={{ padding: '20px', background: '#f5f5f5' }}>

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
                placeholder="Categoria"
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
                ✔ Salvar
              </button>

            </div>
          )}
        </div>
      )}

      {/* BUSCA */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Buscar item..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #ccc'
          }}
        />
      </div>

      {/* TABELA */}
      <div style={{ padding: '20px' }}>

        {itensFiltrados.length === 0 ? (
          <p>Nenhum item encontrado</p>
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
              {itensFiltrados.map(item => (
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