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

  document.getElementById("tipoPedido").value = "";
  document.getElementById("item").innerHTML =
    `<option value="">Selecione o item</option>`;

  listarPedidos();
}

function abrirRelatorios() {
  document.getElementById("home").style.display = "none";
  document.getElementById("relatorios").style.display = "block";
  document.getElementById("resultadoRelatorio").innerHTML = "";
}

// ===============================
// DOM READY (preview imagem)
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
  const tipo = document.getElementById("tipoArte").value;
  const preview = document.getElementById("previewArte");

  if (!nome || isNaN(valor) || !tipo) {
    alert("Informe nome, valor e tipo do artesanato");
    return;
  }

  await db.collection("artes").add({
    nome,
    valor,
    tipo,
    foto: preview.src || null
  });

  document.getElementById("nomeArte").value = "";
  document.getElementById("valorArte").value = "";
  document.getElementById("tipoArte").value = "";
  document.getElementById("fotoArte").value = "";
  preview.style.display = "none";

  listarArte();
}

async function listarArte() {
  const lista = document.getElementById("listaArte");
  lista.innerHTML = "";

  const snap = await db.collection("artes").orderBy("tipo").orderBy("nome").get();
  snap.forEach(doc => {
    const a = doc.data();
    lista.innerHTML += `
      <li>
        <strong>${a.nome}</strong>
        <div>${a.tipo}</div>
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
async function carregarItensPorTipo() {
  const tipo = document.getElementById("tipoPedido").value;
  const select = document.getElementById("item");

  select.innerHTML = `<option value="">Selecione o item</option>`;
  if (!tipo) return;

  const snap = await db.collection("artes")
    .where("tipo", "==", tipo)
    .orderBy("nome")
    .get();

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
  if (!select.value) {
    alert("Selecione um item do artesanato");
    return;
  }

  const opt = select.options[select.selectedIndex];
  const dataEntregaValor = document.getElementById("dataEntrega").value;

  let dataEntrega = null;
  if (dataEntregaValor) {
    const [ano, mes, dia] = dataEntregaValor.split("-");
    dataEntrega = new Date(ano, mes - 1, dia);
  }

  const dados = {
    cliente,
    itemId: select.value,
    itemNome: opt.dataset.nome,
    valor: Number(opt.dataset.valor),
    pagamento: document.getElementById("pagamento").value,
    status: document.getElementById("status").value,
    dataEntrega
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
  hoje.setHours(0, 0, 0, 0);

  let encontrou = false;

  const snap = await db.collection("pedidos")
    .orderBy("dataEntrega", "asc")
    .orderBy("dataPedido", "desc")
    .get();

  snap.forEach(doc => {
    const p = doc.data();
    const id = doc.id;

    if (p.status === "Entregue") return;

    encontrou = true;

    let entrega = p.dataEntrega?.toDate?.() || p.dataEntrega || null;
    if (entrega) entrega.setHours(0, 0, 0, 0);

    let textoData = "—";
    let classeData = "data-sem";
    let avisoHoje = "";

    if (entrega) {
      textoData = entrega.toLocaleDateString("pt-BR");

      if (entrega.getTime() === hoje.getTime()) {
        classeData = "data-hoje";
        avisoHoje = `<span class="entrega-hoje">ENTREGA HOJE</span>`;
      } else {
        classeData = entrega < hoje ? "data-atrasada" : "data-prazo";
      }
    }

    const li = document.createElement("li");
    if (entrega && entrega < hoje) li.classList.add("atrasado");

    li.innerHTML = `
      <strong>${p.cliente}</strong>
      <div class="pedido-item">${p.itemNome} – R$ ${p.valor.toFixed(2)}</div>
      <div class="pedido-meta">
        Entrega:
        <span class="data-entrega ${classeData}">${textoData}</span>
        ${avisoHoje}<br>
        Status: ${p.status}
      </div>
      <div class="pedido-acoes">
        <button class="btn-entregue" onclick="marcarEntregue('${id}')">✓</button>
        <button class="btn-editar" onclick="editarPedido('${id}')">Editar</button>
        <button class="btn-excluir-item" onclick="excluirPedido('${id}')">Excluir</button>
      </div>
    `;

    lista.appendChild(li);
  });

  if (!encontrou) {
    lista.innerHTML = `<li><em>Nenhum pedido pendente 🎉</em></li>`;
  }
}


async function editarPedido(id) {
  const ref = await db.collection("pedidos").doc(id).get();
  if (!ref.exists) return;

  const p = ref.data();

  document.getElementById("cliente").value = p.cliente;
  document.getElementById("pagamento").value = p.pagamento;
  document.getElementById("status").value = p.status;

  const arteRef = await db.collection("artes").doc(p.itemId).get();
  if (arteRef.exists) {
    const arte = arteRef.data();
    document.getElementById("tipoPedido").value = arte.tipo;
    await carregarItensPorTipo();
    document.getElementById("item").value = p.itemId;
  }

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

async function marcarEntregue(id) {
  if (!confirm("Marcar este pedido como entregue?")) return;
  await db.collection("pedidos").doc(id).update({ status: "Entregue" });
  listarPedidos();
}

async function gerarPortfolio() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const larguraPagina = pdf.internal.pageSize.getWidth();

  // 👉 COLE AQUI O BASE64 DO LOGO (tudo em uma linha)
  const logoBase64 = "data:image/jpeg;base64,data:image/jpeg;base64,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8MTI+888eNrIm2iqtc88FiZu938888888+RnQ8888M9nupRu8uOsH6rtVF9+888889A7cp888/Zevdtc888tOsLQ5888888884cotPc888WOn888888u0IaYH+88888888jb1G988sRqP8888885oT8Br88888888ss5C58886QR88888";

  let y = 20;

  // ===============================
  // LOGO CENTRALIZADO
  // ===============================
  try {
    const logoLargura = 40;
    const logoX = (larguraPagina - logoLargura) / 2;
    pdf.addImage(logoBase64, "JPEG", logoX, y, logoLargura, 40);
    y += 48;
  } catch (e) {
    y += 10;
  }

  // ===============================
  // TÍTULOS CENTRALIZADOS
  // ===============================
  pdf.setFontSize(20);
  pdf.setTextColor(142, 106, 201); // roxo da marca
  pdf.text("Mimos da Nay", larguraPagina / 2, y, { align: "center" });
  y += 10;

  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Portfólio de Artesanato", larguraPagina / 2, y, { align: "center" });
  y += 14;

  // ===============================
  // BUSCA NO FIRESTORE
  // ===============================
  const snap = await db.collection("artes")
    .orderBy("tipo")
    .orderBy("nome")
    .get();

  let tipoAtual = "";

  for (const doc of snap.docs) {
    const a = doc.data();

    // Nova página
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    // Cabeçalho do tipo
    if (a.tipo !== tipoAtual) {
      tipoAtual = a.tipo;
      y += 6;
      pdf.setFontSize(15);
      pdf.setTextColor(142, 106, 201);
      pdf.text(tipoAtual, 14, y);
      y += 8;
    }

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(`• ${a.nome}`, 18, y);
    y += 6;

    pdf.setFontSize(11);
    pdf.text(`Valor: R$ ${a.valor.toFixed(2)}`, 22, y);
    y += 6;

    // Imagem do item
    if (a.foto) {
      try {
        pdf.addImage(a.foto, "JPEG", 22, y, 45, 45);
        y += 50;
      } catch (e) {
        y += 4;
      }
    } else {
      y += 4;
    }
  }

  pdf.save("portfolio-mimos-da-nay.pdf");
}





