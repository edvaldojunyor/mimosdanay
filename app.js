// ===== DADOS =====
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
  { user: "Edvaldo", senha: "1234" },
  { user: "Neiara", senha: "1234" }
];

let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let artes = JSON.parse(localStorage.getItem("artes")) || [];

// ===== ELEMENTOS =====
const loginDiv = document.getElementById("login");
const homeDiv = document.getElementById("home");
const pedidosDiv = document.getElementById("pedidos");
const arteDiv = document.getElementById("arte");
const relatoriosDiv = document.getElementById("relatorios");
const usuariosDiv = document.getElementById("usuarios");

const userInput = document.getElementById("user");
const senhaInput = document.getElementById("senha");
const erroMsg = document.getElementById("erro");

// ===== LOGIN =====
function login() {
  const u = userInput.value.trim();
  const s = senhaInput.value.trim();

  const ok = usuarios.find(x => x.user === u && x.senha === s);
  if (ok) {
    loginDiv.style.display = "none";
    homeDiv.style.display = "block";
    erroMsg.innerText = "";
  } else {
    erroMsg.innerText = "Usuário ou senha inválidos";
  }
}

function logout() {
  location.reload();
}

// ===== NAVEGAÇÃO =====
function voltarHome() {
  pedidosDiv.style.display = "none";
  arteDiv.style.display = "none";
  relatoriosDiv.style.display = "none";
  usuariosDiv.style.display = "none";
  homeDiv.style.display = "block";
}

function abrirPedidos() {
  homeDiv.style.display = "none";
  pedidosDiv.style.display = "block";
  atualizarSelectArte();
  listarPedidos();
}

function abrirArte() {
  homeDiv.style.display = "none";
  arteDiv.style.display = "block";
  listarArte();
}

function abrirRelatorios() {
  homeDiv.style.display = "none";
  relatoriosDiv.style.display = "block";
}

function abrirUsuarios() {
  homeDiv.style.display = "none";
  usuariosDiv.style.display = "block";
}

// ===== ARTE SACRA =====
function salvarArte() {
  const nome = document.getElementById("nomeArte").value.trim();
  if (!nome) return;

  artes.push(nome);
  localStorage.setItem("artes", JSON.stringify(artes));
  document.getElementById("nomeArte").value = "";
  listarArte();
}

function listarArte() {
  const lista = document.getElementById("listaArte");
  lista.innerHTML = "";
  artes.forEach(a => {
    const li = document.createElement("li");
    li.innerText = a;
    lista.appendChild(li);
  });
}

function atualizarSelectArte() {
  const select = document.getElementById("item");
  select.innerHTML = "";
  artes.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.innerText = a;
    select.appendChild(opt);
  });
}

// ===== PEDIDOS =====
function salvarPedido() {
  pedidos.push({
    cliente: document.getElementById("cliente").value,
    item: document.getElementById("item").value,
    valor: Number(document.getElementById("valor").value),
    pagamento: document.getElementById("pagamento").value,
    status: document.getElementById("status").value
  });

  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  listarPedidos();
}

function listarPedidos() {
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";
  pedidos.forEach(p => {
    const li = document.createElement("li");
    li.innerText = `${p.cliente} | ${p.item} | R$ ${p.valor.toFixed(2)}`;
    lista.appendChild(li);
  });
}

// ===== RELATÓRIOS =====
function gerarRelatorio() {
  let total = 0, pix = 0, prazo = 0, cartao = 0;

  pedidos.forEach(p => {
    if (p.status === "Entregue") {
      total += p.valor;
      if (p.pagamento === "Pix") pix += p.valor;
      if (p.pagamento === "A prazo") prazo += p.valor;
      if (p.pagamento === "Cartão") cartao += p.valor;
    }
  });

  document.getElementById("total").innerText = `Total: R$ ${total.toFixed(2)}`;
  document.getElementById("pix").innerText = `Pix: R$ ${pix.toFixed(2)}`;
  document.getElementById("prazo").innerText = `A prazo: R$ ${prazo.toFixed(2)}`;
  document.getElementById("cartao").innerText = `Cartão: R$ ${cartao.toFixed(2)}`;
}

// ===== USUÁRIOS =====
function addUsuario() {
  usuarios.push({
    user: document.getElementById("novoUser").value,
    senha: document.getElementById("novaSenha").value
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Usuário criado com sucesso!");
}
