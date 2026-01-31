let pedidoEditandoId = null;

// ===============================
// FIREBASE
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyDoCKrLiZqg_9axMy9BN8nPh55pc4N5sIg",
  authDomain: "mimos-da-nay.firebaseapp.com",
  projectId: "mimos-da-nay",
  storageBucket: "mimos-da-nay.firebasestorage.app",
  messagingSenderId: "732309876023",
  appId: "1:732309876023:web:9ccf0d316adeaf170a3eb2"
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
  document.getElementById("home").style.display = "block";
}

function abrirArte() {
  home.style.display = "none";
  arte.style.display = "block";
  listarArte();
}

function abrirPedidos() {
  home.style.display = "none";
  pedidos.style.display = "block";
  carregarArtesNoSelect();
  listarPedidos();
}

function abrirRelatorios() {
  home.style.display = "none";
  relatorios.style.display = "block";
  resultadoRelatorio.innerHTML = "";
}

// ===============================
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const inputFoto = document.getElementById("fotoArte");
  const preview = document.getElementById("previewArte");

  if (inputFoto && preview) {
    inputFoto.addEventListener("change", () => {
      const file = inputFoto.files[0];
      if (!file) return preview.style.display = "none";

      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }
});

// ===============================
// ARTE
// ===============================
async function salvarArte() {
  const nome = nomeArte.value.trim();
  const valor = parseFloat(valorArte.value);
  if (!nome || isNaN(valor)) return alert("Informe nome e valor");

  await db.collection("artes").add({ nome, valor, foto: previewArte.src || null });

  nomeArte.value = "";
  valorArte.value = "";
  fotoArte.value = "";
  previewArte.style.display = "none";

  listarArte();
}

async function listarArte() {
  listaArte.innerHTML = "";
  const snap = await db.collection("artes").get();

  snap.forEach(doc => {
    const a = doc.data();
    listaArte.innerHTML += `
      <li>
        <strong>${a.nome}</strong><br>
        R$ ${a.valor.toFixed(2)}<br>
        ${a.foto ? `<img src="${a.foto}"><br>` : "<em>Sem imagem</em><br>"}
        <button class="btn-excluir-item" onclick="excluirArte('${doc.id}')">Excluir</button>
      </li>
    `;
  });
}

async function excluirArte(id) {
  if (!confirm("Excluir item?")) return;
  await db.collection("artes").doc(id).delete();
  listarArte();
}

// ===============================
// PEDIDOS
// ===============================
async function carregarArtesNoSelect() {
  item.innerHTML = "";
  const snap = await db.collection("artes").get();
  snap.forEach(doc => {
    const a = doc.data();
    item.innerHTML += `
      <option value="${doc.id}" data-nome="${a.nome}" data-valor="${a.valor}">
        ${a.nome} - R$ ${a.valor.toFixed(2)}
      </option>
    `;
  });
}

async function salvarPedido() {
  if (!cliente.value.trim()) return alert("Informe o cliente");

  const opt = item.options[item.selectedIndex];
  const dados = {
    cliente: cliente.value,
    itemId: item.value,
    itemNome: opt.dataset.nome,
    valor: Number(opt.dataset.valor),
    pagamento: pagamento.value,
    status: status.value,
    dataEntrega: dataEntrega.value ? new Date(dataEntrega.value) : null
  };

  if (pedidoEditandoId) {
    await db.collection("pedidos").doc(pedidoEditandoId).update(dados);
    pedidoEditandoId = null;
  } else {
    dados.dataPedido = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection("pedidos").add(dados);
  }

  cliente.value = "";
  dataEntrega.value = "";
  listarPedidos();
}

async function listarPedidos() {
  listaPedidos.innerHTML = "";
  const hoje = new Date();

  const snap = await db.collection("pedidos").orderBy("dataPedido", "desc").get();
  snap.forEach(doc => {
    const p = doc.data();
    const entrega = p.dataEntrega?.toDate?.() || p.dataEntrega;
    const atrasado = entrega && entrega < hoje && p.status !== "Entregue";

    listaPedidos.innerHTML += `
      <li style="border-left:5px solid ${atrasado ? "red" : "green"}">
        <strong>${p.cliente}</strong><br>
        ${p.itemNome} – R$ ${p.valor.toFixed(2)}<br>
        Entrega: ${entrega ? entrega.toLocaleDateString("pt-BR") : "—"}<br>
        Status: ${p.status}<br>
        <button onclick="editarPedido('${doc.id}')">Editar</button>
        <button class="btn-excluir-item" onclick="excluirPedido('${doc.id}')">Excluir</button>
      </li>
    `;
  });
}

async function editarPedido(id) {
  const doc = await db.collection("pedidos").doc(id).get();
  const p = doc.data();

  cliente.value = p.cliente;
  pagamento.value = p.pagamento;
  status.value = p.status;
  item.value = p.itemId;

  if (p.dataEntrega) {
    const d = p.dataEntrega.toDate?.() || p.dataEntrega;
    dataEntrega.value = d.toISOString().split("T")[0];
  }

  pedidoEditandoId = id;
}

async function excluirPedido(id) {
  if (!confirm("Excluir pedido?")) return;
  await db.collection("pedidos").doc(id).delete();
  listarPedidos();
}
