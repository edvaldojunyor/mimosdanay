// ===============================
// FIREBASE
// ===============================
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================
// USUÁRIOS (LOGIN SIMPLES)
// ===============================
let usuarios = [
  { user: "Edvaldo", senha: "1234" },
  { user: "Neiara", senha: "1234" }
];

// ===============================
// LOGIN
// ===============================
function login() {
  const u = user.value.trim();
  const s = senha.value.trim();
  const erro = document.getElementById("erro");

  const ok = usuarios.find(x => x.user === u && x.senha === s);
  if (ok) {
    login.style.display = "none";
    home.style.display = "block";
  } else {
    erro.innerText = "Usuário ou senha inválidos";
  }
}

function logout() {
  home.style.display = "none";
  login.style.display = "block";
}

// ===============================
// ARTE SACRA (NUVEM)
// ===============================
async function salvarArte() {
  const nome = nomeArte.value.trim();
  const valor = parseFloat(valorArte.value);

  if (!nome || isNaN(valor)) {
    alert("Informe nome e valor");
    return;
  }

  let foto = null;
  const file = fotoArte.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async () => {
      await db.collection("artes").add({
        nome,
        valor,
        foto: reader.result
      });
      listarArte();
    };
    reader.readAsDataURL(file);
  } else {
    await db.collection("artes").add({ nome, valor, foto: null });
    listarArte();
  }
}

async function listarArte() {
  const lista = listaArte;
  lista.innerHTML = "";

  const snap = await db.collection("artes").get();
  snap.forEach(doc => {
    const a = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${a.nome}</strong><br>
      R$ ${a.valor.toFixed(2)}<br>
      ${a.foto ? `<img src="${a.foto}" width="100">` : ""}
    `;
    lista.appendChild(li);
  });
}

// ===============================
// PEDIDOS (NUVEM)
// ===============================
async function salvarPedido() {
  const arte = item.options[item.selectedIndex].text;

  await db.collection("pedidos").add({
    cliente: cliente.value,
    item: arte,
    pagamento: pagamento.value,
    status: status.value,
    data: new Date()
  });

  listarPedidos();
}

async function listarPedidos() {
  listaPedidos.innerHTML = "";
  const snap = await db.collection("pedidos").get();

  snap.forEach(doc => {
    const p = doc.data();
    const li = document.createElement("li");
    li.innerText = `${p.cliente} | ${p.item}`;
    listaPedidos.appendChild(li);
  });
}
