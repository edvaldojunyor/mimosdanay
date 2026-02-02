async function editarPedido(id) {
  const ref = await db.collection("pedidos").doc(id).get();
  if (!ref.exists) return;

  const p = ref.data();

  document.getElementById("cliente").value = p.cliente;
  document.getElementById("pagamento").value = p.pagamento;
  document.getElementById("status").value = p.status;

  // 🔹 buscar o tipo do item
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
