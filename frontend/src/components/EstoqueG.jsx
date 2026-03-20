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
      <div className="grid-locais" style={{ marginTop: '20px' }}>
        {itensFiltrados.length === 0 && (
          <div className="vazio">
            <p>Nenhum item encontrado</p>
          </div>
        )}
        {itensFiltrados.map(item => (
          <div className="card-local" key={item.id}>
            <h3>{item.nome}</h3>
            <p><strong>Código:</strong> {item.codigo}</p>
            <p><strong>Etiqueta:</strong> {item.etiqueta ? 'Sim' : 'Não'}</p>
            <p><strong>Definição:</strong> {item.definicao}</p>
            <p><strong>Descrição:</strong> {item.descricao}</p>
            <p><strong>Localização:</strong> {item.localizacao}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstoqueG;