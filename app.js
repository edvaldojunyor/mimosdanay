let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
  { user: "Edvaldo", senha: "1234" },
  { user: "Neiara", senha: "1234" }
];

let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

function login() {
  const u = user.value;
  const s = senha.value;

  const ok = usuarios.find(x => x.user === u && x.senha === s);
  if (ok) {
    loginDiv(false);
  } else {
    erro.innerText = "Usuário ou senha inválidos";
  }
}

function loginDiv(logado) {
  login.style.display = logado ? "block" : "none";
  home.style.display = logado ? "none" : "block";
}

function logout() {
  location.reload();
}

function abrirPedidos() {
  home.style.display = "none";
  pedidosDiv(true);
  listarPedidos();
}

function pedidosDiv(v) {
  pedidos.style.display = v ? "block" : "none";
}

function voltarHome() {
  pedidos.style.display = "none";
  relatorios.style.display = "none";
  usuarios.style.display = "none";
  home.style.display = "block";
}

function salvarPedido() {
  pedidos.push({
    cliente: cliente.value,
    item: item.value,
    entrega: dataEntrega.value,
    valor: Number(valor.value),
    pagamento: pagamento.value,
    status: status.value
  });

  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  listarPedidos();
}

function listarPedidos() {
  listaPedidos.innerHTML = "";
  pedidos.forEach(p => {
    const li = document.createElement("li");
    li.innerText = `${p.cliente} | ${p.item} | R$ ${p.valor}`;
    listaPedidos.appendChild(li);
  });
}

function abrirRelatorios() {
  home.style.display = "none";
  relatorios.style.display = "block";
}

function gerarRelatorio() {
  let total = pixV = prazoV = cartaoV = 0;
  resultado.innerHTML = "";

  pedidos.forEach(p => {
    if (p.status === "Entregue") {
      total += p.valor;
      if (p.pagamento === "Pix") pixV += p.valor;
      if (p.pagamento === "A prazo") prazoV += p.valor;
      if (p.pagamento === "Cartão") cartaoV += p.valor;
    }
  });

  total.innerText = "Total: R$ " + total.toFixed(2);
  pix.innerText = "Pix: R$ " + pixV.toFixed(2);
  prazo.innerText = "A prazo: R$ " + prazoV.toFixed(2);
  cartao.innerText = "Cartão: R$ " + cartaoV.toFixed(2);
}

function abrirUsuarios() {
  home.style.display = "none";
  usuariosDiv(true);
}

function usuariosDiv(v) {
  usuarios.style.display = v ? "block" : "none";
}

function addUsuario() {
  usuarios.push({
    user: novoUser.value,
    senha: novaSenha.value
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Usuário criado!");
}
