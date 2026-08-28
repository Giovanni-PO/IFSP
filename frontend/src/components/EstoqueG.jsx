import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const EstoqueG = () => {

  const navigate = useNavigate();

  const [itens, setItens] = useState([]);

  const [menuAberto, setMenuAberto] = useState(false);

  const [novoItem, setNovoItem] = useState({
    numero: '',
    status: 'ativo',
    descricao: '',
    valor: '',
    sala: '',
    etiqueta: '',
    data_entrada: '',
    data_saida: ''
  });

  const [filtroNome, setFiltroNome] = useState('');


  // ==========================================================
  // CARREGAR ITENS
  // ==========================================================

  useEffect(() => {
    carregarDados();
  }, []);


  const carregarDados = async () => {

    try {

      const respItens = await fetch(
        'http://localhost:3000/itens'
      );

      const itensData = await respItens.json();

      if (!respItens.ok) {
        alert(
          itensData.erro ||
          'Erro ao carregar itens.'
        );

        return;
      }

      setItens(itensData);

    } catch (erro) {

      console.error(erro);

      alert(
        'Não foi possível conectar ao servidor.'
      );
    }
  };


  // ==========================================================
  // ADICIONAR ITEM
  // ==========================================================

  const adicionarItem = async () => {

    if (!novoItem.numero) {

      alert(
        'Informe o número do item.'
      );

      return;
    }

    if (!novoItem.descricao) {

      alert(
        'Informe a descrição.'
      );

      return;
    }


    try {

      const resp = await fetch(
        'http://localhost:3000/itens',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            numero: Number(novoItem.numero),
            status: novoItem.status,
            descricao: novoItem.descricao,
            valor: novoItem.valor
              ? Number(novoItem.valor)
              : null,
            sala: novoItem.sala,
            etiqueta: novoItem.etiqueta || null,
            data_entrada: novoItem.data_entrada || null,
            data_saida: novoItem.data_saida || null
          })
        }
      );


      const data = await resp.json();


      if (!resp.ok) {

        alert(
          data.erro ||
          'Erro ao criar item.'
        );

        return;
      }


      alert(
        'Item criado com sucesso!'
      );


      // Limpa formulário

      setNovoItem({
        numero: '',
        status: 'ativo',
        descricao: '',
        valor: '',
        sala: '',
        etiqueta: '',
        data_entrada: '',
        data_saida: ''
      });


      carregarDados();

    } catch (erro) {

      console.error(erro);

      alert(
        'Erro de comunicação com o servidor.'
      );
    }
  };


  // ==========================================================
  // DELETAR ITEM
  // ==========================================================

  const deletarItem = async (id) => {

    const confirmar = window.confirm(
      'Deseja realmente excluir este item?'
    );

    if (!confirmar) {
      return;
    }


    try {

      const resp = await fetch(
        `http://localhost:3000/itens/${id}`,
        {
          method: 'DELETE'
        }
      );


      const data = await resp.json();


      if (!resp.ok) {

        alert(
          data.erro ||
          'Erro ao excluir item.'
        );

        return;
      }


      carregarDados();

    } catch (erro) {

      console.error(erro);

      alert(
        'Erro de comunicação com o servidor.'
      );
    }
  };


  // ==========================================================
  // FILTRO
  // ==========================================================

  const itensFiltrados = itens.filter(item => {

    const numero = String(
      item.numero || ''
    ).toLowerCase();

    const descricao = String(
      item.descricao || ''
    ).toLowerCase();

    const status = String(
      item.status || ''
    ).toLowerCase();

    const sala = String(
      item.sala || ''
    ).toLowerCase();

    const filtro = filtroNome.toLowerCase();


    return (
      numero.includes(filtro) ||
      descricao.includes(filtro) ||
      status.includes(filtro) ||
      sala.includes(filtro)
    );
  });


  // ==========================================================
  // FORMATA VALOR
  // ==========================================================

  const formatarValor = (valor) => {

    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return '-';
    }

    return Number(valor).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );
  };


  // ==========================================================
  // FORMATA DATA
  // ==========================================================

  const formatarData = (data) => {

    if (!data) {
      return '-';
    }

    // Caso venha do MySQL:
    //
    // 2019-06-13T00:00:00.000Z
    //

    if (
      typeof data === 'string' &&
      data.includes('T')
    ) {

      const somenteData =
        data.substring(0, 10);

      const partes =
        somenteData.split('-');

      if (partes.length === 3) {

        return (
          partes[2] +
          '/' +
          partes[1] +
          '/' +
          partes[0]
        );
      }
    }


    // Caso já venha:
    //
    // 13/06/2019
    //

    return data;
  };


  return (

    <div className="home-container">


      {/* ====================================================
          NAVBAR
      ==================================================== */}

      <header className="header">

        <div className="header-left">

          <img
            src="/LogoIFSP.jpg"
            alt="Logo"
          />

          <h1>IFSP</h1>

        </div>


        <div className="header-center">

          <h2>
            Estoque Geral
          </h2>

        </div>


        <div className="header-right">

          <button
            className="menu-btn"
            onClick={() =>
              setMenuAberto(true)
            }
          >
            ☰
          </button>

        </div>

      </header>


      {/* ====================================================
          MENU LATERAL
      ==================================================== */}

      <div
        className={`side-menu-overlay ${
          menuAberto ? 'active' : ''
        }`}
        onClick={() =>
          setMenuAberto(false)
        }
      >

        <div
          className={`side-menu ${
            menuAberto ? 'active' : ''
          }`}
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          <button
            className="close-btn"
            onClick={() =>
              setMenuAberto(false)
            }
          >
            ×
          </button>


          <h3>
            Menu
          </h3>


          <button
            onClick={() =>
              navigate('/')
            }
          >
            Home
          </button>


          <button
            onClick={() =>
              navigate('/comissao')
            }
          >
            Comissão de Inventário
          </button>

        </div>

      </div>


      {/* ====================================================
          FORMULÁRIO
      ==================================================== */}

      <div className="form-box">

        <h3 className="form-title">
          Adicionar Item
        </h3>


        <div className="form-grid">


          {/* NÚMERO */}

          <input
            type="number"
            placeholder="Número"
            value={novoItem.numero}
            onChange={(e) =>
              setNovoItem({
                ...novoItem,
                numero: e.target.value
              })
            }
          />


          {/* STATUS */}

          <select
            value={novoItem.status}
            onChange={(e) =>
              setNovoItem({
                ...novoItem,
                status: e.target.value
              })
            }
          >

            <option value="ativo">
              Ativo
            </option>

            <option value="inativo">
              Inativo
            </option>

          </select>


          {/* DESCRIÇÃO */}

          <textarea
            placeholder="Descrição"
            value={novoItem.descricao}
            onChange={(e) =>
              setNovoItem({
                ...novoItem,
                descricao: e.target.value
              })
            }
          />


          {/* VALOR */}

          <input
            type="number"
            step="0.01"
            placeholder="Valor"
            value={novoItem.valor}
            onChange={(e) =>
              setNovoItem({
                ...novoItem,
                valor: e.target.value
              })
            }
          />


          {/* SALA */}

          <input
            type="text"
            placeholder="Sala"
            value={novoItem.sala}
            onChange={(e) =>
              setNovoItem({
                ...novoItem,
                sala: e.target.value
              })
            }
          />


          {/* ETIQUETA */}

          <input
            type="text"
            placeholder="Etiqueta"
            value={novoItem.etiqueta}
            onChange={(e) =>
              setNovoItem({
                ...novoItem,
                etiqueta: e.target.value
              })
            }
          />


          {/* DATA ENTRADA */}

          <div>

            <label>
              Data de entrada
            </label>

            <input
              type="datetime-local"
              value={novoItem.data_entrada}
              onChange={(e) =>
                setNovoItem({
                  ...novoItem,
                  data_entrada: e.target.value
                })
              }
            />

          </div>


          {/* DATA SAÍDA */}

          <div>

            <label>
              Data de saída
            </label>

            <input
              type="datetime-local"
              value={novoItem.data_saida}
              onChange={(e) =>
                setNovoItem({
                  ...novoItem,
                  data_saida: e.target.value
                })
              }
            />

          </div>


          {/* BOTÃO */}

          <button
            className="btn-primary"
            onClick={adicionarItem}
          >
            ➕ Adicionar
          </button>


        </div>

      </div>


      {/* ====================================================
          BUSCA
      ==================================================== */}

      <div className="filters">

        <input
          placeholder="Buscar por número, descrição, status ou sala..."
          value={filtroNome}
          onChange={(e) =>
            setFiltroNome(e.target.value)
          }
        />

      </div>


      {/* ====================================================
          TABELA
      ==================================================== */}

      <div className="table-container">

        <table className="inventory-table">


          <thead>

            <tr>

              <th>#</th>

              <th>Status</th>

              <th>Descrição</th>

              <th>Valor</th>

              <th>Sala</th>

              <th>Etiqueta</th>

              <th>Data de entrada</th>

              <th>Data de saída</th>

              <th>Ações</th>

            </tr>

          </thead>


          <tbody>

            {itensFiltrados.map(item => (

              <tr
                key={item.id}
              >


                {/* NÚMERO */}

                <td>
                  {item.numero}
                </td>


                {/* STATUS */}

                <td>
                  {item.status || '-'}
                </td>


                {/* DESCRIÇÃO */}

                <td>
                  {item.descricao || '-'}
                </td>


                {/* VALOR */}

                <td>
                  {formatarValor(
                    item.valor
                  )}
                </td>


                {/* SALA */}

                <td>
                  {item.sala || '-'}
                </td>


                {/* ETIQUETA */}

                <td>
                  {item.etiqueta || '-'}
                </td>


                {/* DATA ENTRADA */}

                <td>
                  {formatarData(
                    item.data_entrada
                  )}
                </td>


                {/* DATA SAÍDA */}

                <td>
                  {formatarData(
                    item.data_saida
                  )}
                </td>


                {/* AÇÕES */}

                <td>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deletarItem(item.id)
                    }
                  >
                    🗑
                  </button>

                </td>


              </tr>

            ))}


            {itensFiltrados.length === 0 && (

              <tr>

                <td
                  colSpan="9"
                  style={{
                    textAlign: 'center'
                  }}
                >
                  Nenhum item encontrado.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};


export default EstoqueG;