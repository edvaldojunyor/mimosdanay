let pedidoEditandoId = null;

// ===============================
// FIREBASE (CONFIG REAL)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyDoCKrLiZqg_9axMy9BN8nPh55pc4N5sIg",
  authDomain: "mimos-da-nay.firebaseapp.com",
  projectId: "mimos-da-nay",
  storageBucket: "mimos-da-nay.firebasestorage.app",
  messagingSenderId: "732309876023",
  appId: "1:732309876023:web:9ccf0d316adeaf170a3eb2",
  measurementId: "G-N61LNQ0JGF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================
// LOGIN LOCAL
// ===============================
const usuarios = [
  { user: "Edvaldo", senha: "1234" },
  { user: "Neiara", senha: "1234" }
];

function login() {
  const u = document.getElementById("user").value.trim();
  const s = document.getElementById("senha").value.trim();
  const erro = document.getElementById("erro");

  const ok = usuarios.find(x => x.user === u && x.senha === s);
  if (!ok) {
    erro.innerText = "Usuário ou senha inválidos";
    return;
  }

  document.getElementById("login").style.display = "none";
  document.getElementById("home").style.display = "block";
  erro.innerText = "";
}

function logout() {
  ["home", "arte", "pedidos", "relatorios"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  document.getElementById("login").style.display = "block";
}

// ===============================
// NAVEGAÇÃO
// ===============================
function voltarHome() {
  ["arte", "pedidos", "relatorios"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const resultado = document.getElementById("resultadoRelatorio");
  if (resultado) resultado.innerHTML = "";

  document.getElementById("home").style.display = "block";
}

function abrirArte() {
  document.getElementById("home").style.display = "none";
  document.getElementById("arte").style.display = "block";
  listarArte();
}

function abrirPedidos() {
  document.getElementById("home").style.display = "none";
  document.getElementById("pedidos").style.display = "block";
  carregarArtesNoSelect();
  listarPedidos();
}

function abrirRelatorios() {
  document.getElementById("home").style.display = "none";
  document.getElementById("relatorios").style.display = "block";
  document.getElementById("resultadoRelatorio").innerHTML = "";
}

// ===============================
// DOM READY (UNIFICADO)
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // Preview de imagem da arte
  const inputFoto = document.getElementById("fotoArte");
  const preview = document.getElementById("previewArte");

  if (inputFoto && preview) {
    inputFoto.addEventListener("change", () => {
      const file = inputFoto.files[0];
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
  }

  // Placeholder fake da data de entrega (Safari iOS)
  const dataEntrega = document.getElementById("dataEntrega");
  const placeholder = document.querySelector(".fake-placeholder");

  if (dataEntrega && placeholder) {
    dataEntrega.addEventListener("change", () => {
      placeholder.style.display = dataEntrega.value ? "none" : "block";
    });
  }
});

// ===============================
// ARTE SACRA (FIRESTORE)
// ===============================
async function salvarArte() {
  const nome = document.getElementById("nomeArte").value.trim();
  const valor = parseFloat(document.getElementById("valorArte").value);
  const preview = document.getElementById("previewArte");

  if (!nome || isNaN(valor)) {
    alert("Informe nome e valor");
    return;
  }

  await db.collection("artes").add({
    nome,
    valor,
    foto: preview.src || null
  });

  document.getElementById("nomeArte").value = "";
  document.getElementById("valorArte").value = "";
  document.getElementById("fotoArte").value = "";
  preview.style.display = "none";

  listarArte();
}

async function listarArte() {
  const lista = document.getElementById("listaArte");
  lista.innerHTML = "";

  const snap = await db.collection("artes").get();
  snap.forEach(doc => {
    const a = doc.data();
    const id = doc.id;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${a.nome}</strong><br>
      R$ ${a.valor.toFixed(2)}<br>

      ${
        a.foto
          ? `<img src="${a.foto}"><br>
             <button class="btn-excluir-imagem" onclick="excluirImagemArte('${id}')">
               Excluir imagem
             </button>`
          : "<em>Sem imagem</em>"
      }
      <br>

      <button class="btn-excluir-item" onclick="excluirArte('${id}')">
        Excluir item
      </button>
    `;

    lista.appendChild(li);
  });
}

async function excluirArte(id) {
  if (!confirm("Deseja excluir este item?")) return;
  await db.collection("artes").doc(id).delete();
  listarArte();
}

async function excluirImagemArte(id) {
  await db.collection("artes").doc(id).update({ foto: null });
  listarArte();
}

// ===============================
// PEDIDOS (FIRESTORE)
// ===============================
async function carregarArtesNoSelect() {
  const select = document.getElementById("item");
  select.innerHTML = "";

  const snap = await db.collection("artes").get();
  snap.forEach(doc => {
    const a = doc.data();

    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = `${a.nome} - R$ ${a.valor.toFixed(2)}`;
    opt.dataset.nome = a.nome;
    opt.dataset.valor = a.valor;

    select.appendChild(opt);
  });
}

async function salvarPedido() {
  const cliente = document.getElementById("cliente").value.trim();
  if (!cliente) {
    alert("Informe o nome do cliente");
    return;
  }

  const selectItem = document.getElementById("item");
  const opcao = selectItem.options[selectItem.selectedIndex];
  const dataEntregaInput = document.getElementById("dataEntrega").value;

  const dados = {
    cliente,
    itemId: selectItem.value,
    itemNome: opcao.dataset.nome,
    valor: parseFloat(opcao.dataset.valor),
    pagamento: document.getElementById("pagamento").value,
    status: document.getElementById("status").value,
    dataEntrega: dataEntregaInput ? new Date(dataEntregaInput) : null
  };

  if (pedidoEditandoId) {
    // 🔄 ATUALIZAR
    await db.collection("pedidos").doc(pedidoEditandoId).update(dados);
    pedidoEditandoId = null;
    document.querySelector("#pedidos button").innerText = "Salvar Pedido";
  } else {
    // ➕ NOVO
    dados.dataPedido = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection("pedidos").add(dados);
  }

  document.getElementById("cliente").value = "";
  document.getElementById("dataEntrega").value = "";

  listarPedidos();
}


  const selectItem = document.getElementById("item");
  const opcao = selectItem.options[selectItem.selectedIndex];
  const dataEntregaInput = document.getElementById("dataEntrega").value;

  await db.collection("pedidos").add({
    cliente,
    itemId: selectItem.value,
    itemNome: opcao.dataset.nome,
    valor: parseFloat(opcao.dataset.valor),
    pagamento: document.getElementById("pagamento").value,
    status: document.getElementById("status").value,
    dataPedido: firebase.firestore.FieldValue.serverTimestamp(),
    dataEntrega: dataEntregaInput ? new Date(dataEntregaInput) : null
  });

  document.getElementById("cliente").value = "";
  document.getElementById("dataEntrega").value = "";

  listarPedidos();
}

async function listarPedidos() {
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  const snap = await db.collection("pedidos")
    .orderBy("dataPedido", "desc")
    .get();

  snap.forEach(doc => {
    const p = doc.data();
    const id = doc.id;

    const dataPedido = p.dataPedido?.toDate()?.toLocaleDateString("pt-BR") || "-";
    const dataEntrega = p.dataEntrega
      ? p.dataEntrega.toDate?.().toLocaleDateString("pt-BR") ||
        new Date(p.dataEntrega).toLocaleDateString("pt-BR")
      : "—";

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.cliente}</strong><br>
      ${p.itemNome} – R$ ${p.valor.toFixed(2)}<br>
      Pedido: ${dataPedido}<br>
      Entrega: ${dataEntrega}<br>
      Status: ${p.status}<br>

      <button onclick="editarPedido('${id}')">Editar</button>
      <button class="btn-excluir-item" onclick="excluirPedido('${id}')">
        Excluir
      </button>
    `;

    lista.appendChild(li);
  });
}


// ===============================
// RELATÓRIO (ATUALIZADO)
// ===============================
async function gerarRelatorio() {
  const mesInput = document.getElementById("mesRelatorio").value;
  const resultado = document.getElementById("resultadoRelatorio");

  if (!mesInput) {
    alert("Selecione um mês");
    return;
  }

  const [ano, mes] = mesInput.split("-").map(Number);
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);

  let total = 0;
  let html = `<h3>Pedidos de ${mes}/${ano}</h3><ul>`;

  const snap = await db.collection("pedidos").get();

  snap.forEach(doc => {
    const p = doc.data();
    const dataPedido = p.dataPedido?.toDate?.();
    if (!dataPedido) return;

    if (dataPedido >= inicio && dataPedido <= fim) {
      total += p.valor;
      html += `<li>${p.cliente} – ${p.itemNome} – R$ ${p.valor.toFixed(2)}</li>`;
    }
  });

  html += `</ul><h3>Total do mês: R$ ${total.toFixed(2)}</h3>`;
  resultado.innerHTML = html;
}

async function editarPedido(id) {
  const doc = await db.collection("pedidos").doc(id).get();
  if (!doc.exists) return;

  const p = doc.data();

  document.getElementById("cliente").value = p.cliente;
  document.getElementById("pagamento").value = p.pagamento;
  document.getElementById("status").value = p.status;

  if (p.dataEntrega) {
    const data = p.dataEntrega.toDate
      ? p.dataEntrega.toDate()
      : new Date(p.dataEntrega);

    document.getElementById("dataEntrega").value =
      data.toISOString().split("T")[0];
  }

  document.getElementById("item").value = p.itemId;

  pedidoEditandoId = id;
  document.querySelector("#pedidos button").innerText = "Atualizar Pedido";
}

async function excluirPedido(id) {
  if (!confirm("Deseja excluir este pedido?")) return;
  await db.collection("pedidos").doc(id).delete();
  listarPedidos();
}


