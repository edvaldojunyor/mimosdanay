// ===============================
// DADOS FIXOS DO SISTEMA
// ===============================
let usuarios = [
  { user: "Edvaldo", senha: "1234" },
  { user: "Neiara", senha: "1234" }
];

let artes = JSON.parse(localStorage.getItem("artes")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let indiceArteEditando = null;

// ===============================
// LOGIN
// ===============================
function login() {
  const u = document.getElementById("user").value.trim();
  const s = document.getElementById("senha").value.trim();
  const erro = document.getElementById("erro");

  const valido = usuarios.find(us => us.user === u && us.senha === s);

  if (valido) {
    document.getElementById("login").style.display = "none";
    document.getElementById("home").style.display = "block";
    erro.innerText = "";
  } else {
    erro.innerText = "Usuário ou senha inválidos";
  }
}

function logout() {
  document.getElementById("home").style.display = "none";
  document.getElementById("pedidos").style.display = "none";
  document.getElementById("arte").style.display = "none";
  document.getElementById("relatorios").style.display = "none";
  document.getElementById("usuarios").style.display = "none";

  document.getElementById("user").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("erro").innerText = "";

  document.getElementById("login").style.display = "block";
}

// ===============================
// NAVEGAÇÃO
// ===============================
function voltarHome() {
  document.getElementById("pedidos").style.display = "none";
  document.getElementById("arte").style.display = "none";
  document.getElementById("relatorios").style.display = "none";
  document.getElementById("usuarios").style.display = "none";
  document.getElementById("home").style.display = "block";
}

function abrirPedidos() {
  document.getElementById("home").style.display = "none";
  document.getElementById("pedidos").style.display = "block";
  atualizarSelectArte();
  listarPedidos();
}

function abrirArte() {
  document.getElementById("home").style.display = "none";
  document.getElementById("arte").style.display = "block";
  listarArte();
}

function abrirRelatorios() {
  document.getElementById("home").style.display = "none";
  document.getElementById("relatorios").style.display = "block";
}

function abrirUsuarios() {
  document.getElementById("home").style.display = "none";
  document.getElementById("usuarios").style.display = "block";
}

// ===============================
// PREVIEW DA IMAGEM
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const foto = document.getElementById("fotoArte");
  if (!foto) return;

  foto.addEventListener("change", () => {
    const file = foto.files[0];
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

// ===============================
// ARTE SACRA
// ===============================
function salvarArte() {
  const nome = document.getElementById("nomeArte").value.trim();
  const valor = parseFloat(document.getElementById("valorArte").value);
  const fotoFile = document.getElementById("fotoArte").files[0];

  if (!nome || isNaN(valor)) {
    alert("Informe nome e valor");
    return;
  }

  let fotoFinal = null;
  if (indiceArteEditando !== null && artes[indiceArteEditando].foto) {
    fotoFinal = artes[indiceArteEditando].foto;
  }

  if (fotoFile) {
    const reader = new FileReader();
    reader.onload = () => {
      salvarArteFinal(nome, valor, reader.result);
    };
    reader.readAsDataURL(fotoFile);
  } else {
    salvarArteFinal(nome, valor, fotoFinal);
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
      ${a.foto ? `<img src="${a.foto}" style="max-width:100px">` : "<em>Sem imagem</em>"}
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

// ===============================
// PEDIDOS
// ===============================
function atualizarSelectArte() {
  const select = document.getElementById("item");
  select.innerHTML = "";

  artes.forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${a.nome} - R$ ${a.valor.toFixed(2)}`;
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
    li.textContent = `${p.cliente} | ${p.item} | R$ ${p.valor.toFixed(2)}`;
    lista.appendChild(li);
  });
}

// ===============================
// RELATÓRIOS
// ===============================
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

// ===============================
// BACKUP
// ===============================
function gerarBackup() {
  const backup = {
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
  a.download = `backup-mimos-da-nay.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("Backup gerado com sucesso!");
}
