import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [locais, setLocais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
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
  };

  const irParaEstoqueLocal = (codigo) => {
    navigate(`/estoque/${codigo}`);
  };

  if (carregando) {
    return (
      <div>
        <h1>Carregando Dashboard IFSP...</h1>
        <p>Conectando com backend...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Instituto Federal - IFSP</h1>
      <p>Sistema de Controle de Inventario e Patrimonio</p>

      <div>
        <button onClick={irParaEstoqueGeral}>
          Estoque Geral Completo
        </button>
        
        <button onClick={carregarLocais}>
          Atualizar Locais
        </button>
      </div>

      {erro && (
        <div>
          <p>{erro}</p>
          <p>Inicie: node server.js (porta 3000)</p>
        </div>
      )}

      {!erro && (
        <div>
          <h2>{locais.length} Localizacoes Cadastradas</h2>
          
          {locais.length > 0 ? (
            <div>
              {locais.map((local) => (
                <div key={local.id}>
                  <h3>{local.codigo} - {local.definicao}</h3>
                  <button onClick={() => irParaEstoqueLocal(local.codigo)}>
                    Ver Estoque desta Localizacao
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div>
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
