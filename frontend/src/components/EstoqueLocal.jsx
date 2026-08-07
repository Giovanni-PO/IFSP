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

    codigo:'',
    etiqueta:false,

    numero:'',
    status:'ativo',
    ed:'',

    descricao:'',

    rotulos:'',
    carga_atual:'',

    setor_responsavel:'',
    campus_responsavel:'',
    campus_carga:'',

    valor:'',
    numero_nota_fiscal:'',

    data_entrada:'',
    data_carga:'',

    fornecedor:'',
    sala:'',

    estado_conservacao:'',
    numero_serie:''

  });



  useEffect(()=>{

    if(codigo){
      carregarEstoqueLocal();
    }

  },[codigo]);



  useEffect(()=>{

    filtrarItens();

  },[itens,filtroNome]);





  const carregarEstoqueLocal = async()=>{

    try{

      setCarregando(true);
      setErro('');

      const response = await fetch(
        `http://localhost:3000/locais/${codigo}/itens`
      );


      const data = await response.json();


      setItens(data);
      setItensFiltrados(data);



      const locaisResp = await fetch(
        'http://localhost:3000/locais'
      );


      const locais = await locaisResp.json();


      const local = locais.find(
        item => item.codigo === codigo
      );


      setLocalizacao(local);



    }catch(err){

      console.log(err);

      setErro(
        'Erro ao carregar estoque'
      );


    }finally{

      setCarregando(false);

    }

  };





  const filtrarItens = ()=>{


    const filtro =
      filtroNome
      .trim()
      .toUpperCase();



    if(!filtro){

      setItensFiltrados(itens);
      return;

    }



    const resultado = itens.filter(item=>{


      return (

        String(item.codigo || '')
        .toUpperCase()
        .includes(filtro)


        ||

        String(item.numero || '')
        .includes(filtro)


        ||

        String(item.descricao || '')
        .toUpperCase()
        .includes(filtro)

      );


    });


    setItensFiltrados(resultado);


  };





  const buscarItemExterno = async()=>{


    if(!novoItem.codigo){

      alert(
        "Digite um código"
      );

      return;

    }


    try{


      const resp = await fetch(

        `http://localhost:3000/itens-externos/${novoItem.codigo}`

      );


      const data = await resp.json();



      if(!resp.ok){

        alert(data.erro);
        return;

      }



      setNovoItem({

        ...novoItem,

        descricao:data.descricao,

        etiqueta:data.etiqueta

      });



    }catch{


      alert(
        "Erro ao buscar item"
      );

    }


  };






  const adicionarItem = async()=>{


    try{


      const resp = await fetch(

        "http://localhost:3000/itens",

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },


          body:JSON.stringify({

            ...novoItem,

            localizacao:codigo

          })

        }

      );



      const data = await resp.json();



      if(!resp.ok){

        alert(data.erro);
        return;

      }



      limparFormulario();

      setMostrarFormulario(false);

      carregarEstoqueLocal();



    }catch{


      alert(
        "Erro ao adicionar item"
      );

    }


  };





  const limparFormulario = ()=>{


    setNovoItem({

      codigo:'',
      etiqueta:false,

      numero:'',
      status:'ativo',
      ed:'',

      descricao:'',

      rotulos:'',
      carga_atual:'',

      setor_responsavel:'',
      campus_responsavel:'',
      campus_carga:'',

      valor:'',
      numero_nota_fiscal:'',

      data_entrada:'',
      data_carga:'',

      fornecedor:'',
      sala:'',

      estado_conservacao:'',
      numero_serie:''

    });


  };





  const deletarItem = async(id)=>{


    const confirmar = window.confirm(
      "Deseja deletar este item?"
    );


    if(!confirmar){
      return;
    }



    await fetch(

      `http://localhost:3000/itens/${id}`,

      {
        method:"DELETE"
      }

    );


    carregarEstoqueLocal();


  };





  if(carregando){

    return(

      <div className="loading">

        <h1>
          Carregando...
        </h1>

      </div>

    );

  }





  return (

<div className="home-container">


<header className="header">

<div className="header-left">

<img src="/LogoIFSP.jpg" alt="Logo"/>

<h1>IFSP</h1>

</div>



<div className="header-center">

<h2>
Estoque Local - {codigo}
</h2>

</div>



<div className="header-right">

<button
className="menu-btn"
onClick={()=>setMenuAberto(true)}
>

☰

</button>

</div>


</header>





<div
className={`side-menu-overlay ${menuAberto?'active':''}`}
onClick={()=>setMenuAberto(false)}
>


<div
className={`side-menu ${menuAberto?'active':''}`}
onClick={(e)=>e.stopPropagation()}
>


<button
className="close-btn"
onClick={()=>setMenuAberto(false)}
>
×
</button>


<h3>
Menu
</h3>


<button onClick={()=>navigate('/')}>
Home
</button>


<button onClick={()=>navigate('/estoque')}>
Estoque Geral
</button>


<button onClick={()=>navigate('/comissao')}>
Comissão
</button>


</div>

</div>





{localizacao &&

<div className="form-box">


<h3 className="form-title">

{localizacao.definicao}

</h3>


<p>
Total de itens: {itensFiltrados.length}
</p>



<button
className="btn-primary"
onClick={()=>setMostrarFormulario(!mostrarFormulario)}
>

{
mostrarFormulario
?
"Cancelar"
:
"Adicionar Item"
}

</button>





{mostrarFormulario &&

<div className="form-box">


<h3>
Novo Item
</h3>



<input
placeholder="Número patrimônio"
value={novoItem.numero}
onChange={e=>setNovoItem({
...novoItem,
numero:e.target.value
})}
/>



<input
placeholder="Código antigo"
value={novoItem.codigo}
onChange={e=>setNovoItem({
...novoItem,
codigo:e.target.value
})}
/>



<button
className="btn-primary"
onClick={buscarItemExterno}
>
Buscar externo
</button>




<textarea

className="escrita"

placeholder="Descrição"

value={novoItem.descricao}

onChange={e=>setNovoItem({
...novoItem,
descricao:e.target.value
})}

/>




<input
placeholder="Responsável"
value={novoItem.carga_atual}
onChange={e=>setNovoItem({
...novoItem,
carga_atual:e.target.value
})}
/>




<input
placeholder="Sala"
value={novoItem.sala}
onChange={e=>setNovoItem({
...novoItem,
sala:e.target.value
})}
/>




<input
placeholder="Valor"
type="number"
value={novoItem.valor}
onChange={e=>setNovoItem({
...novoItem,
valor:e.target.value
})}
/>




<button
className="btn-primary"
onClick={adicionarItem}
>

Adicionar

</button>


</div>

}


</div>

}





{erro &&

<div className="erro">

{erro}

</div>

}






<div className="filters">

<input

placeholder="Buscar número, código ou descrição"

value={filtroNome}

onChange={e=>setFiltroNome(e.target.value)}

/>

</div>







<div className="table-container">


<table className="inventory-table">


<thead>

<tr>

<th>ID</th>

<th>Número</th>

<th>Status</th>

<th>Descrição</th>

<th>Responsável</th>

<th>Sala</th>

<th>Valor</th>

<th>Ação</th>


</tr>

</thead>




<tbody>


{

itensFiltrados.map(item=>(

<tr key={item.id}>


<td>
{item.id}
</td>


<td>
{item.numero || item.codigo}
</td>


<td>
{item.status || '-'}
</td>


<td>
{item.descricao}
</td>


<td>
{item.carga_atual || '-'}
</td>


<td>
{item.sala || '-'}
</td>


<td>
R$ {item.valor || '0'}
</td>


<td>

<button

className="delete-btn"

onClick={()=>deletarItem(item.id)}

>

🗑

</button>


</td>


</tr>

))

}


</tbody>



</table>


</div>



</div>


  );

};


export default EstoqueLocal;
