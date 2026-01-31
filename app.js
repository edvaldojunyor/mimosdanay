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
    document.getElementById(id).style.display = "none";
  });
  document.getElementById("login").style.display = "block";
}

// ===============================
// NAVEGAÇÃO
// ===============================
function voltarHome() {
  ["arte", "pedidos", "relatorios"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
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
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const inputFoto = document.getElementById("fotoArte");
  const preview = document.getElementById("previewArte");

  if (inputFoto) {
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
});

// ===============================
// ARTES
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
    lista.innerHTML += `
      <li>
        <strong>${a.nome}</strong>
        <div>R$ ${a.valor.toFixed(2)}</div>
        ${a.foto ? `<img src="${a.foto}">` : "<em>Sem imagem</em>"}
        <button class="btn-excluir-item" onclick="excluirArte('${doc.id}')">
          Excluir
        </button>
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
    alert("Informe o cliente");
    return;
  }

  const select = document.getElementById("item");
  const opt = select.options[select.selectedIndex];
  const dataEntregaValor = document.getElementById("dataEntrega").value;

  const dados = {
    cliente,
    itemId: select.value,
    itemNome: opt.dataset.nome,
    valor: Number(opt.dataset.valor),
    pagamento: document.getElementById("pagamento").value,
    status: document.getElementById("status").value,
    dataEntrega: dataEntregaValor ? new Date(dataEntregaValor) : null
  };

  if (pedidoEditandoId) {
    await db.collection("pedidos").doc(pedidoEditandoId).update(dados);
    pedidoEditandoId = null;
  } else {
    dados.dataPedido = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection("pedidos").add(dados);
  }

  document.getElementById("cliente").value = "";
  document.getElementById("dataEntrega").value = "";

  listarPedidos();
}

async function listarPedidos() {
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  const hoje = new Date();

  const snap = await db.collection("pedidos")
    .orderBy("dataPedido", "desc")
    .get();

  snap.forEach(doc => {
    const p = doc.data();
    const id = doc.id;

    const entrega = p.dataEntrega?.toDate?.() || p.dataEntrega;
    const atrasado =
      entrega && entrega < hoje && p.status !== "Entregue";

    const li = document.createElement("li");

    if (p.status === "Entregue") li.classList.add("entregue");
    if (atrasado) li.classList.add("atrasado");

    li.innerHTML = `
      <strong>${p.cliente}</strong>

      <div class="pedido-item">
        ${p.itemNome} – R$ ${p.valor.toFixed(2)}
      </div>

      <div class="pedido-meta">
        Entrega: ${entrega ? entrega.toLocaleDateString("pt-BR") : "—"}<br>
        Status: ${p.status}
      </div>

      <div class="pedido-acoes">
        <button class="btn-editar" onclick="editarPedido('${id}')">Editar</button>
        <button class="btn-excluir-item" onclick="excluirPedido('${id}')">Excluir</button>
      </div>
    `;

    lista.appendChild(li);
  });
}

async function editarPedido(id) {
  const ref = await db.collection("pedidos").doc(id).get();
  if (!ref.exists) return;

  const p = ref.data();

  document.getElementById("cliente").value = p.cliente;
  document.getElementById("pagamento").value = p.pagamento;
  document.getElementById("status").value = p.status;
  document.getElementById("item").value = p.itemId;

  if (p.dataEntrega) {
    const d = p.dataEntrega.toDate?.() || p.dataEntrega;
    document.getElementById("dataEntrega").value =
      d.toISOString().split("T")[0];
  }

  pedidoEditandoId = id;
}

async function excluirPedido(id) {
  if (!confirm("Excluir pedido?")) return;
  await db.collection("pedidos").doc(id).delete();
  listarPedidos();
}
