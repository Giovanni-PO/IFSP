import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EstoqueLocal = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  
  const [itens, setItens] = useState([]);
  const [localizacao, setLocalizacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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

  const voltarHome = () => {
    navigate('/');
  };

  const voltarGeral = () => {
    navigate('/estoque');
  };

  if (carregando) {
    return (
      <div>
        <h1>Carregando Estoque...</h1>
        <p>Localizacao: {codigo}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Estoque - {codigo}</h1>
      
      <div>
        <button onClick={voltarHome}>Voltar Home</button>
        <button onClick={voltarGeral}>Estoque Geral</button>
        <button onClick={carregarEstoqueLocal}>Atualizar</button>
      </div>

      {erro && (
        <div>
          <p>{erro}</p>
        </div>
      )}

      {localizacao && (
        <div>
          <h2>{localizacao.definicao}</h2>
          <p>Total de itens: {itens.length}</p>
        </div>
      )}

      <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Etiqueta</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Descricao</th>
          </tr>
        </thead>
        <tbody>
          {itens.length > 0 ? (
            itens.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.codigo}</strong></td>
                <td>{item.etiqueta ? 'Sim' : 'Nao'}</td>
                <td><strong>{item.nome}</strong></td>
                <td>{item.definicao}</td>
                <td>{item.descricao || '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>
                Nenhum item nesta localizacao
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EstoqueLocal;
