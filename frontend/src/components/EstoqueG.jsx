import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EstoqueG = () => {
  const [itens, setItens] = useState([]);
  const [locais, setLocais] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
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
    return <div>Carregando estoque...</div>;
  }

  return (
    <div>
      <h1>Controle de Estoque Geral IFSP</h1>
      
      <div>
        <input
          type="text"
          placeholder="Filtrar por nome do item"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        
        <select 
          value={filtroLocal} 
          onChange={(e) => setFiltroLocal(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          <option value="">Todas as localizações</option>
          {locais.map(local => (
            <option key={local.codigo} value={local.codigo}>
              {local.codigo} - {local.definicao}
            </option>
          ))}
        </select>

        <button onClick={carregarDados} style={{ padding: '5px 10px' }}>
          Atualizar
        </button>

        <button onClick={voltarInicio} style={{ padding: '5px 10px', marginLeft: '10px' }}>
          Voltar ao Início
        </button>
      </div>

      <div>
        <h2>Estoque Completo</h2>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Etiqueta</th>
              <th>Nome</th>
              <th>Definição</th>
              <th>Descrição</th>
              <th>Localização</th>
            </tr>
          </thead>
          <tbody>
            {itensFiltrados.map(item => (
              <tr key={item.id}>
                <td>{item.codigo}</td>
                <td>{item.etiqueta ? 'Sim' : 'Não'}</td>
                <td>{item.nome}</td>
                <td>{item.definicao}</td>
                <td>{item.descricao}</td>
                <td>{item.localizacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstoqueG;
