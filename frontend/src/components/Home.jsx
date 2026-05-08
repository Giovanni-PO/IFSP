  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import '../App.css';

  const Home = () => {
    const [locais, setLocais] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [busca, setBusca] = useState('');
    const [menuAberto, setMenuAberto] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      carregarLocais();
    }, []);

    const carregarLocais = async () => {
      try {
        setCarregando(true);
        setErro('');

        const response = await fetch('http://localhost:3000/locais');
        if (!response.ok) throw new Error('Backend offline');

        const data = await response.json();
        setLocais(data);
      } catch (error) {
        setErro('Backend offline. Inicie: node server.js');
        console.error('Erro:', error);
      } finally {
        setCarregando(false);
      }
    };

    const irParaEstoqueGeral = () => {
      navigate('/estoque');
      setMenuAberto(false);
    };

    const irParaEstoqueLocal = (codigo) => {
      navigate(`/estoque/${codigo}`);
    };

    const locaisFiltrados = locais.filter((local) =>
      `${local.codigo} ${local.definicao}`
        .toLowerCase()
        .includes(busca.toLowerCase())
    );

    if (carregando) {
      return (
        <div className="loading">
          <h1>Carregando Dashboard IFSP...</h1>
          <p>Conectando com backend...</p>
        </div>
      );
    }

    return (
      <div className="home-container">

        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <img src="/LogoIFSP.jpg" alt="Logo IFSP"/>
            <h1>IFSP</h1>
          </div>

          <div className="header-center">
            <input
              type="text"
              placeholder="🔍 Buscar sala ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="header-right">
            <button className="menu-btn" onClick={() => setMenuAberto(true)}>☰</button>
          </div>
        </header>

        {/* MENU LATERAL COM ANIMAÇÃO */}
        <div className={`side-menu-overlay ${menuAberto ? 'active' : ''}`} onClick={() => setMenuAberto(false)}>
          <div className={`side-menu ${menuAberto ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setMenuAberto(false)}>×</button>
            <h3>Menu</h3>
            <button onClick={irParaEstoqueGeral}>📦 Estoque Geral</button>
            <button onClick={carregarLocais}>🔄 Atualizar Locais</button>
          </div>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="erro">
            <p>{erro}</p>
            <p>Inicie: node server.js (porta 3000)</p>
          </div>
        )}

        {/* CONTEÚDO */}
        {!erro && (
          <div className="locais-container">
            <h2>{locaisFiltrados.length} Localizações Cadastradas</h2>
            
            {locais.length > 0 ? (
              <div className="grid-locais">
                {locaisFiltrados.map((local) => (
                  <div className="card-local" key={local.id}>
                    <h3>{local.codigo}</h3>
                    <p>{local.definicao}</p>
                    <button className="estoque-btn" onClick={() => irParaEstoqueLocal(local.codigo)}>
                      Ver Estoque
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vazio">
                <p>Nenhum local cadastrado</p>
                <p>Backend deve estar rodando em localhost:3000</p>
              </div>
            )}
          </div>
        )}

      </div>
    );
  };

  export default Home;