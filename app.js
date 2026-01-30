let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let itensArte = JSON.parse(localStorage.getItem("itensArte")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
  { user: "Edvaldo", senha: "1234", tipo: "admin" },
  { user: "Neiara", senha: "1234", tipo: "admin" }
];
localStorage.setItem("pedidos", JSON.stringify(pedidos));
localStorage.setItem("itensArte", JSON.stringify(itensArte));
localStorage.setItem("usuarios", JSON.stringify(usuarios));


// Usuários iniciais (simples por enquanto)
const usuarios = [
  { usuario: "edvaldo", senha: "1234", perfil: "ADM" },
  { usuario: "neiara", senha: "1234", perfil: "ADM" }
];

function login() {
  const user = document.getElementById("usuario").value;
  const pass = document.getElementById("senha").value;

  const encontrado = usuarios.find(u =>
    u.usuario === user && u.senha === pass
  );

  if (encontrado) {
    document.getElementById("login").style.display = "none";
    document.getElementById("home").style.display = "block";
  } else {
    document.getElementById("erro").innerText = "Usuário ou senha inválidos";
  }
}

// Lista de Arte Sacra (temporária)
let itensArteSacra = [];

// Abrir tela Arte Sacra
function abrirArteSacra() {
  document.getElementById("home").style.display = "none";
  document.getElementById("arteSacra").style.display = "block";
  atualizarLista();
}

// Voltar para Home
function voltarHome() {
  document.getElementById("arteSacra").style.display = "none";
  document.getElementById("home").style.display = "block";
}

// Salvar item
function salvarItem() {
  const nome = document.getElementById("nomeItem").value;
  const descricao = document.getElementById("descricaoItem").value;
  const valor = document.getElementById("valorItem").value;

  if (nome === "") {
    alert("Informe o nome do item");
    return;
  }

  itensArteSacra.push({
    nome: nome,
    descricao: descricao,
    valor: valor
  });

  document.getElementById("nomeItem").value = "";
  document.getElementById("descricaoItem").value = "";
  document.getElementById("valorItem").value = "";

  atualizarLista();
}

// Atualizar lista na tela
function atualizarLista() {
  const lista = document.getElementById("listaItens");
  lista.innerHTML = "";

  itensArteSacra.forEach(item => {
    const li = document.createElement("li");
    li.innerText = `${item.nome} - R$ ${item.valor || "0,00"}`;
    lista.appendChild(li);
  });
}

// Lista de pedidos
let pedidos = [];

// Abrir Novo Pedido
function abrirNovoPedido() {
  document.getElementById("home").style.display = "none";
  document.getElementById("novoPedido").style.display = "block";

  carregarItensPedido();
}

// Carregar itens de Arte Sacra no select
function carregarItensPedido() {
  const select = document.getElementById("itemPedido");
  select.innerHTML = "";

  itensArteSacra.forEach(item => {
    const option = document.createElement("option");
    option.value = item.nome;
    option.text = item.nome;
    select.appendChild(option);
  });
}

// Salvar pedido
function salvarPedido() {
  const cliente = document.getElementById("clientePedido").value;
  const item = document.getElementById("itemPedido").value;
  const entrega = document.getElementById("dataEntrega").value;
  const valor = document.getElementById("valorPedido").value;
  const pagamento = document.getElementById("pagamentoPedido").value;
  const status = document.getElementById("statusPedido").value;

  if (cliente === "" || entrega === "" || valor === "") {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

  pedidos.push({
    cliente: cliente,
    item: item,
    entrega: entrega,
    valor: parseFloat(valor),
    pagamento: pagamento,
    status: status
  });

  document.getElementById("clientePedido").value = "";
  document.getElementById("dataEntrega").value = "";
  document.getElementById("valorPedido").value = "";

  alert("Pedido salvo com sucesso!");
  voltarHome();
}

// Abrir lista de pedidos
function abrirListaPedidos() {
  document.getElementById("home").style.display = "none";
  document.getElementById("listaPedidos").style.display = "block";
  atualizarPedidos();
}

// Atualizar lista de pedidos
function atualizarPedidos() {
  const lista = document.getElementById("listaPedidosUl");
  lista.innerHTML = "";

  pedidos.forEach(p => {
    const li = document.createElement("li");
    li.innerText =
      `${p.cliente} | ${p.item} | ${p.entrega} | R$ ${p.valor.toFixed(2)} | ${p.status}`;
    lista.appendChild(li);
  });
}

// Abrir Relatórios
function abrirRelatorios() {
  document.getElementById("home").style.display = "none";
  document.getElementById("relatorios").style.display = "block";
}

// Gerar relatório
function gerarRelatorio() {
  const inicio = document.getElementById("dataInicio").value;
  const fim = document.getElementById("dataFim").value;

  let total = 0;
  let pix = 0;
  let prazo = 0;
  let cartao = 0;

  const lista = document.getElementById("listaRelatorio");
  lista.innerHTML = "";

  pedidos.forEach(p => {
    if (p.entrega >= inicio && p.entrega <= fim) {
      const li = document.createElement("li");

      li.innerText =
        `${p.cliente} | ${p.item} | ${p.entrega} | R$ ${p.valor.toFixed(2)} | ${p.status}`;

      lista.appendChild(li);

      if (p.status === "Entregue") {
        total += p.valor;

        if (p.pagamento === "Pix") pix += p.valor;
        if (p.pagamento === "A prazo") prazo += p.valor;
        if (p.pagamento === "Cartão") cartao += p.valor;
      }
    }
  });

  document.getElementById("totalVendas").innerText =
    `Total de vendas: R$ ${total.toFixed(2)}`;

  document.getElementById("totalPix").innerText =
    `Pix: R$ ${pix.toFixed(2)}`;

  document.getElementById("totalPrazo").innerText =
    `A prazo: R$ ${prazo.toFixed(2)}`;

  document.getElementById("totalCartao").innerText =
    `Cartão: R$ ${cartao.toFixed(2)}`;
}
