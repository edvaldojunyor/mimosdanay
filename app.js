// USUÁRIOS
const usuarios = [
  { user: "Edvaldo", pass: "1234" },
  { user: "Neiara", pass: "1234" }
];

let artes = JSON.parse(localStorage.getItem("artes")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let arteEditando = null;

// LOGIN
function login() {
  const u = usuario.value;
  const s = senha.value;
  const valido = usuarios.find(x => x.user === u && x.pass === s);

  if (valido) {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    listarArte();
    carregarSelectArte();
  } else {
    alert("Usuário ou senha inválidos");
  }
}

// ARTE SACRA
function salvarArte() {
  const nome = nomeArte.value.trim();
  const valor = parseFloat(valorArte.value);
  const foto = fotoArte.files[0];

  if (!nome || isNaN(valor)) {
    alert("Informe nome e valor");
    return;
  }

  if (foto) {
    const reader = new FileReader();
    reader.onload = () => salvarArteFinal(nome, valor, reader.result);
    reader.readAsDataURL(foto);
  } else {
    salvarArteFinal(nome, valor, null);
  }
}

function salvarArteFinal(nome, valor, foto) {
  const item = { nome, valor, foto };

  if (arteEditando !== null) {
    artes[arteEditando] = item;
    arteEditando = null;
  } else {
    artes.push(item);
  }

  localStorage.setItem("artes", JSON.stringify(artes));
  nomeArte.value = "";
  valorArte.value = "";
  fotoArte.value = "";

  listarArte();
  carregarSelectArte();
}

function listarArte() {
  listaArte.innerHTML = "";
  artes.forEach((a, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${a.nome}</strong><br>
      Valor: R$ ${a.valor.toFixed(2)}
      ${a.foto ? `<img src="${a.foto}">` : ""}
      <br>
      <button onclick="editarArte(${i})">Editar</button>
    `;
    listaArte.appendChild(li);
  });
}

function editarArte(i) {
  nomeArte.value = artes[i].nome;
  valorArte.value = artes[i].valor;
  arteEditando = i;
}

// PEDIDOS
function carregarSelectArte() {
  artePedido.innerHTML = "";
  artes.forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = `${a.nome} - R$ ${a.valor.toFixed(2)}`;
    artePedido.appendChild(opt);
  });
}

function salvarPedido() {
  const arte = artes[artePedido.value];

  pedidos.push({
    dataPedido: dataPedido.value,
    cliente: clientePedido.value,
    arte: arte.nome,
    valor: arte.valor,
    entrega: dataEntrega.value,
    pagamento: pagamento.value
  });

  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  alert("Pedido salvo com sucesso");
}

// RELATÓRIO
function gerarRelatorio() {
  relatorio.innerHTML = "";
  let total = 0;

  pedidos.forEach(p => {
    total += p.valor;
    relatorio.innerHTML += `
      <p>
        ${p.cliente} | ${p.arte} | 
        R$ ${p.valor.toFixed(2)} | ${p.pagamento}
      </p>
    `;
  });

  relatorio.innerHTML += `<h3>Total Geral: R$ ${total.toFixed(2)}</h3>`;
}
