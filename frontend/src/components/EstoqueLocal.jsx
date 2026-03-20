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
          <h2>{localizacao.definicao}</h2>
          <p>Total de itens: {itens.length}</p>
        </div>
      )}

      {/* GRID DE ITENS */}
      <div className="grid-locais" style={{ marginTop: '20px' }}>
        {itens.length === 0 && (
          <div className="vazio">
            <p>Nenhum item nesta localização</p>
          </div>
        )}
        {itens.map(item => (
          <div className="card-local" key={item.id}>
            <h3>{item.nome}</h3>
            <p><strong>Código:</strong> {item.codigo}</p>
            <p><strong>Etiqueta:</strong> {item.etiqueta ? 'Sim' : 'Não'}</p>
            <p><strong>Categoria:</strong> {item.definicao}</p>
            <p><strong>Descrição:</strong> {item.descricao || '-'}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default EstoqueLocal;