// ===== DADOS =====
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
  { user: "Edvaldo", senha: "1234" },
  { user: "Neiara", senha: "1234" }
];

let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let artes = JSON.parse(localStorage.getItem("artes")) || [];
let indiceArteEditando = null;

// ===== GARANTIA EXTRA DE CARGA DO STORAGE =====
document.addEventListener("DOMContentLoaded", () => {
  artes = JSON.parse(localStorage.getItem("artes")) || [];
  pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  usuarios = JSON.parse(localStorage.getItem("usuarios")) || usuarios;
});

// ===== LOGIN =====
function login() {
  const u = document.getElementById("user").value.trim();
  const s = document.getElementById("senha").value.trim();
  const erro = document.getElementById("erro");

  const ok = usuarios.find(x => x.user === u && x.senha === s);
  if (ok) {
    document.getElementById("login").style.display = "none";
    document.getElementById("home").style.display = "block";
    erro.innerText = "";
  } else {
    erro.innerText = "Usuário ou senha inválidos";
  }
  
function logout() {
  // Esconde todas as telas
  ["home", "pedidos", "arte", "relatorios", "usuarios"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });

  // Limpa campos de login
  document.getElementById("user").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("erro").innerText = "";

  // Volta para login SEM recarregar a página
  document.getElementById("login").style.display = "block";
}


// ===== NAVEGAÇÃO =====
function voltarHome() {
  ["pedidos", "arte", "relatorios", "usuarios"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
  document.getElementById("home").style.display = "block";
}

function abrirPedidos() {
  voltarHome();
  document.getElementById("home").style.display = "none";
  document.getElementById("pedidos").style.display = "block";
  atualizarSelectArte();
  listarPedidos();
}

function abrirArte() {
  voltarHome();
  document.getElementById("home").style.display = "none";
  document.getElementById("arte").style.display = "block";
  listarArte();
}

function abrirRelatorios() {
  voltarHome();
  document.getElementById("home").style.display = "none";
  document.getElementById("relatorios").style.display = "block";
}

function abrirUsuarios() {
  voltarHome();
  document.getElementById("home").style.display = "none";
  document.getElementById("usuarios").style.display = "block";
}

// ===== PREVIEW IMAGEM =====
document.addEventListener("DOMContentLoaded", () => {
  const fotoInput = document.getElementById("fotoArte");
  if (!fotoInput) return;

  fotoInput.addEventListener("change", function () {
    const file = this.files[0];
    const preview = document.getElementById("previewArte");

    if (!file) {
      preview.style.display = "none";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });
});

// ===== ARTE SACRA =====
function salvarArte() {
  const nome = document.getElementById("nomeArte").value.trim();
  const valor = parseFloat(document.getElementById("valorArte").value);
  const fotoInput = document.getElementById("fotoArte").files[0];

  if (!nome || isNaN(valor)) {
    alert("Informe nome e valor");
    return;
  }

  let fotoExistente = null;
  if (indiceArteEditando !== null && artes[indiceArteEditando].foto) {
    fotoExistente = artes[indiceArteEditando].foto;
  }

  if (fotoInput) {
    const reader = new FileReader();
    reader.onload = () => salvarArteFinal(nome, valor, reader.result);
    reader.readAsDataURL(fotoInput);
  } else {
    salvarArteFinal(nome, valor, fotoExistente);
  }
}

function salvarArteFinal(nome, valor, foto) {
  const item = { nome, valor, foto };

  if (indiceArteEditando !== null) {
    artes[indiceArteEditando] = item;
    indiceArteEditando = null;
  } else {
    artes.push(item);
  }

  localStorage.setItem("artes", JSON.stringify(artes));

  document.getElementById("nomeArte").value = "";
  document.getElementById("valorArte").value = "";
  document.getElementById("fotoArte").value = "";
  document.getElementById("previewArte").style.display = "none";

  listarArte();
}

function listarArte() {
  const lista = document.getElementById("listaArte");
  lista.innerHTML = "";

  artes.forEach((a, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${a.nome}</strong><br>
      Valor: R$ ${a.valor.toFixed(2)}<br>
      ${a.foto ? `<img src="${a.foto}" style="max-width:100px;">` : "<em>Sem imagem</em>"}
      <br>
      <button onclick="editarArte(${i})">Editar</button>
      <button onclick="excluirArte(${i})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

function editarArte(i) {
  document.getElementById("nomeArte").value = artes[i].nome;
  document.getElementById("valorArte").value = artes[i].valor;
  indiceArteEditando = i;
}

function excluirArte(i) {
  if (!confirm("Deseja excluir este item?")) return;
  artes.splice(i, 1);
  localStorage.setItem("artes", JSON.stringify(artes));
  listarArte();
}

// ===== PEDIDOS =====
function atualizarSelectArte() {
  const select = document.getElementById("item");
  select.innerHTML = "";
  artes.forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.innerText = `${a.nome} - R$ ${a.valor.toFixed(2)}`;
    select.appendChild(opt);
  });
}

function salvarPedido() {
  const arte = artes[document.getElementById("item").value];

  pedidos.push({
    cliente: document.getElementById("cliente").value,
    item: arte.nome,
    valor: arte.valor,
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

// ===== BACKUP =====
function gerarBackup() {
  const backup = {
    usuarios,
    artes,
    pedidos,
    data: new Date().toLocaleString("pt-BR")
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-mimos-da-nay-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("Backup gerado com sucesso!\nEnvie o arquivo para seu email ou Drive.");
}

// ===== USUÁRIOS =====
function addUsuario() {
  usuarios.push({
    user: document.getElementById("novoUser").value,
    senha: document.getElementById("novaSenha").value
  });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Usuário criado!");
}

