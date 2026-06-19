import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ComissaoInventario = () => {

  const navigate = useNavigate();

  const [itens, setItens] = useState([]);
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [comissao, setComissao] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  const [filtros, setFiltros] = useState({
    codigo: '',
    descricao: '',
    local: '',
    etiqueta: ''
  });

  // GOVERNO FIXO
  const listaGoverno = [
    { codigo: "I001", descricao: "Impressora" },
    { codigo: "I002", descricao: "Computador" },
    { codigo: "I003", descricao: "Projetor" }
  ];

  useEffect(() => {
    carregarItens();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [itens, filtros]);

  const carregarItens = async () => {
    const resp = await fetch('http://localhost:3000/itens');
    const data = await resp.json();
    setItens(data);
    setItensFiltrados(data);
  };

  const aplicarFiltros = () => {
    let resultado = [...itens];

    if (filtros.codigo) {
      resultado = resultado.filter(i =>
        i.codigo.toUpperCase().includes(filtros.codigo.toUpperCase())
      );
    }

    if (filtros.descricao) {
      resultado = resultado.filter(i =>
        (i.descricao || '').toUpperCase().includes(filtros.descricao.toUpperCase())
      );
    }

    if (filtros.local) {
      resultado = resultado.filter(i =>
        (i.local || '').toUpperCase().includes(filtros.local.toUpperCase())
      );
    }

    if (filtros.etiqueta !== '') {
      resultado = resultado.filter(i =>
        String(i.etiqueta) === filtros.etiqueta
      );
    }

    setItensFiltrados(resultado);
  };

  const adicionarComissao = (item) => {
    if (comissao.some(i => i.codigo === item.codigo)) return;
    setComissao([...comissao, item]);
  };

  const removerComissao = (codigo) => {
    setComissao(comissao.filter(i => i.codigo !== codigo));
  };

  // códigos na comissão
  const codigosComissao = comissao.map(i => i.codigo);

  // faltantes do governo
  const faltantes = listaGoverno.filter(
    g => !codigosComissao.includes(g.codigo)
  );

  const statusItem = (codigo) => {
    return codigosComissao.includes(codigo) ? 'OK' : 'FALTANTE';
  };

  const gerarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('RELATÓRIO COMISSÃO INVENTÁRIO', 14, 15);

    const tabela = comissao.map(i => [
      i.codigo,
      i.descricao,
      i.local,
      i.etiqueta ? 'Sim' : 'Não'
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Código', 'Descrição', 'Local', 'Etiqueta']],
      body: tabela
    });

    doc.save('comissao.pdf');
  };

  return (
    <div className="home-container">

      <header className="header">
        <div className="header-left">
          <img src="/LogoIFSP.jpg" alt="Logo" />
          <h1>IFSP</h1>
        </div>

        <div className="header-center">
          <h2>Comissão de Inventário</h2>
        </div>

        <div className="header-right">
          <button className="menu-btn" onClick={() => setMenuAberto(true)}>
            ☰
          </button>
        </div>
      </header>

      {/* GOVERN0 */}
      <div className="form-box gov-top">
        <h3 className="form-title">Requisição do Governo</h3>
        <p>Faltantes: {faltantes.length}</p>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {listaGoverno.map(g => (
              <tr key={g.codigo}>
                <td>{g.codigo}</td>
                <td>{g.descricao}</td>
                <td>{statusItem(g.codigo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FILTROS */}
      <div className="form-box">
        <h3 className="form-title">Filtros</h3>

        <div className="form-grid-clean">
          <input placeholder="Código"
            value={filtros.codigo}
            onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })}
          />

          <input placeholder="Descrição"
            value={filtros.descricao}
            onChange={(e) => setFiltros({ ...filtros, descricao: e.target.value })}
          />

          <input placeholder="Local"
            value={filtros.local}
            onChange={(e) => setFiltros({ ...filtros, local: e.target.value })}
          />
        </div>
      </div>

      {/* DUAS TABELAS */}
      <div className="linhas-baixo">

        {/* ESTOQUE */}
        <div className="table-container">
          <h3>Estoque Geral</h3>

          <table className="inventory-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Local</th>
                <th>Etiqueta</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {itensFiltrados.map(item => (
                <tr key={item.id}>
                  <td>{item.codigo}</td>
                  <td>{item.descricao}</td>
                  <td>{item.local}</td>
                  <td>{item.etiqueta ? 'Sim' : 'Não'}</td>
                  <td>
                    <button className="btn-primary"
                      onClick={() => adicionarComissao(item)}>
                      Adicionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COMISSÃO */}
        <div className="table-container">
          <h3>Comissão</h3>

          <table className="inventory-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Local</th>
                <th>Etiqueta</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {comissao.map(item => (
                <tr key={item.id}>
                  <td>{item.codigo}</td>
                  <td>{item.descricao}</td>
                  <td>{item.local}</td>
                  <td>{item.etiqueta ? 'Sim' : 'Não'}</td>
                  <td>
                    <button className="delete-btn"
                      onClick={() => removerComissao(item.codigo)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* PDF */}
      <div className="form-box">
        <button className="btn-primary" onClick={gerarPDF}>
          Gerar PDF
        </button>
      </div>

    </div>
  );
};

export default ComissaoInventario;