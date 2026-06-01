const API_URL = "http://localhost:8080/pedidos";

// Tabs
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// POST
document.querySelector("#novo .form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const produto = document.getElementById("produto").value;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, produto }),
    });
    const data = await res.json();
    exibirResultado("resultado-novo", data);
  } catch (err) {
    exibirResultado("resultado-novo", { erro: "Erro ao criar pedido" });
  }
});

// GET
document
  .querySelector("#buscar .form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("buscar-id").value;
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
      const res = await fetch(url);
      const data = await res.json();
      exibirResultado("resultado-buscar", data);
    } catch (err) {
      exibirResultado("resultado-buscar", { erro: "Erro ao buscar pedido" });
    }
  });

// PUT
document
  .querySelector("#atualizar .form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("atualizar-id").value;
    const nome = document.getElementById("atualizar-nome").value;
    const produto = document.getElementById("atualizar-produto").value;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, produto }),
      });
      const data = await res.json();
      exibirResultado("resultado-atualizar", data);
    } catch (err) {
      exibirResultado("resultado-atualizar", {
        erro: "Erro ao atualizar pedido",
      });
    }
  });

// DELETE
document
  .querySelector("#deletar .form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("deletar-id").value;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (res.ok) {
        exibirResultado("resultado-deletar", { status: "Sucesso", mensagem: `Pedido nº ${id} foi deletado corretamente!` });
        document.getElementById("deletar-id").value = "";
      } else if (res.status === 404) {
        exibirResultado("resultado-deletar", { erro: `Pedido nº ${id} não foi encontrado.` });
      } else {
        exibirResultado("resultado-deletar", { erro: "Não foi possível deletar o pedido." });
      }

    } catch (err) {
      exibirResultado("resultado-deletar", { erro: "Erro de conexão ao tentar deletar o pedido" });
    }
  });
// Exibir resultado
function exibirResultado(elementId, data) {
  const el = document.getElementById(elementId);
  el.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  setTimeout(() => {
    el.innerHTML = "";
  }, 5000);
}
