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
  ["home","arte","pedidos"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  document.getElementById("login").style.display = "block";
}

// ===============================
// NAVEGAÇÃO
// ===============================
function voltarHome() {
  ["arte","pedidos"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
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

// ===============================
// PREVIEW DE IMAGEM
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("fotoArte");
  const preview = document.getElementById("previewArte");

  if (!input) return;

  input.addEventListener("change", () => {
    const file = input.files[0];
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
      ${a.foto ? `<img src="${a.foto}" style="max-width:100px"><br>
      <button onclick="excluirImagemArte('${id}')">Excluir imagem</button>` : "<em>Sem imagem</em>"}
      <br>
      <button onclick="excluirArte('${id}')">Excluir item</button>
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
    opt.textContent = `${a.nome} - R$ ${a.valor.toFixed(2)}`;
    select.appendChild(opt);
  });
}

async function salvarPedido() {
  await db.collection("pedidos").add({
    cliente: document.getElementById("cliente").value,
    item: document.getElementById("item").value,
    pagamento: document.getElementById("pagamento").value,
    status: document.getElementById("status").value,
    data: new Date()
  });
  listarPedidos();
}

async function listarPedidos() {
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  const snap = await db.collection("pedidos").get();
  snap.forEach(doc => {
    const p = doc.data();
    const li = document.createElement("li");
    li.textContent = `${p.cliente} | ${p.item}`;
    lista.appendChild(li);
  });
}
