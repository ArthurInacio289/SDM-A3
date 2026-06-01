const BASE = 'http://localhost:8080';

// ── State ─────────────────────────────────────────────────────────────────
let carrinho = [];         // [{ produto: ProdutoResponseDTO, quantidade: number }]
let produtosCache = {};    // id -> ProdutoResponseDTO
let pedidoTracked = null;  // PedidoResponseDTO being tracked in acompanhamento

// ── Utils ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtData = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR') : '—';

const STATUS_LABEL = {
  PENDENTE:   'Pendente',
  CONFIRMADO: 'Confirmado',
  PREPARANDO: 'Preparando',
  PRONTO:     'Pronto',
  EM_ENTREGA: 'Em Entrega',
  ENTREGUE:   'Entregue',
  CANCELADO:  'Cancelado',
};

const PROXIMO_STATUS = {
  PENDENTE:   'CONFIRMADO',
  CONFIRMADO: 'PREPARANDO',
  PREPARANDO: 'PRONTO',
  PRONTO:     'EM_ENTREGA',
  EM_ENTREGA: 'ENTREGUE',
};

function showToast(msg, tipo = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast toast-${tipo} visible`;
  setTimeout(() => t.classList.remove('visible'), 3500);
}

function exibirResultado(id, data, tipo = 'info') {
  const el = document.getElementById(id);
  el.className = `resultado resultado-${tipo}`;
  el.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  setTimeout(() => { el.innerHTML = ''; }, 7000);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensagem || `Erro ${res.status}`);
  return data;
}

// ── Tabs ───────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');

    if (tab.dataset.tab === 'pedido') renderizarCarrinho();
    if (tab.dataset.tab === 'gestao') {
      carregarPedidos();
      carregarProdutosGestao();
    }
  });
});

document.querySelectorAll('.sub-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sub-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.sub-tab-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.subtab).classList.add('active');
  });
});

function irParaPedido() {
  document.querySelector('.tab[data-tab="pedido"]').click();
}

// ── Cardápio ───────────────────────────────────────────────────────────────
async function carregarCategorias() {
  try {
    const cats = await apiFetch('/produtos/categorias');
    const sel = document.getElementById('filtro-categoria');
    cats.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  } catch (_) { /* silently ignore — backend may be offline */ }
}

async function carregarCardapio() {
  const cat = document.getElementById('filtro-categoria').value;
  const disp = document.getElementById('filtro-disponivel').checked;
  const params = new URLSearchParams();
  if (cat) params.set('categoria', cat);
  if (disp) params.set('disponivel', 'true');

  const grid = document.getElementById('produto-grid');
  grid.innerHTML = '<p class="empty-msg">Carregando...</p>';

  try {
    const produtos = await apiFetch(`/produtos?${params}`);
    if (!produtos.length) {
      grid.innerHTML = '<p class="empty-msg">Nenhum produto encontrado.</p>';
      return;
    }

    produtos.forEach((p) => { produtosCache[p.id] = p; });

    grid.innerHTML = '';
    produtos.forEach((p) => {
      const item = carrinho.find((i) => i.produto.id === p.id);
      const qtd = item ? item.quantidade : 0;

      const card = document.createElement('div');
      card.className = `card${!p.disponivel ? ' indisponivel' : ''}`;
      card.id = `card-${p.id}`;
      card.innerHTML = `
        <span class="card-category">${p.categoria}</span>
        <p class="card-name">${p.nome}</p>
        <p class="card-desc">${p.descricao || ''}</p>
        <p class="card-price">${fmt(p.preco)}</p>
        <div class="card-footer">
          ${p.disponivel
            ? `<div class="qty-controls">
                <button class="qty-btn secondary-button" onclick="alterarQtd(${p.id}, -1)">−</button>
                <span id="qtd-${p.id}" class="qty-value">${qtd}</span>
                <button class="qty-btn primary-button" onclick="alterarQtd(${p.id}, 1)">+</button>
               </div>`
            : '<span class="indisponivel-badge">Indisponível</span>'}
        </div>`;
      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = `<p class="empty-msg error">Erro ao carregar: ${e.message}</p>`;
  }
}

// ── Carrinho ───────────────────────────────────────────────────────────────
function alterarQtd(produtoId, delta) {
  const produto = produtosCache[produtoId];
  const idx = carrinho.findIndex((i) => i.produto.id === produtoId);

  if (idx === -1) {
    if (delta > 0 && produto) carrinho.push({ produto, quantidade: 1 });
  } else {
    carrinho[idx].quantidade += delta;
    if (carrinho[idx].quantidade <= 0) carrinho.splice(idx, 1);
  }

  const qtdEl = document.getElementById(`qtd-${produtoId}`);
  if (qtdEl) {
    const found = carrinho.find((i) => i.produto.id === produtoId);
    qtdEl.textContent = found ? found.quantidade : 0;
  }

  atualizarCarrinhoUI();
}

function atualizarCarrinhoUI() {
  const count = carrinho.reduce((s, i) => s + i.quantidade, 0);
  const cartBtn = document.getElementById('cart-btn');
  document.getElementById('cart-count').textContent = count;
  cartBtn.style.display = count > 0 ? 'flex' : 'none';
}

function renderizarCarrinho() {
  const lista = document.getElementById('carrinho-lista');
  const totalDiv = document.getElementById('carrinho-total');

  if (!carrinho.length) {
    lista.innerHTML = '<p class="empty-msg">Adicione itens no Cardápio.</p>';
    totalDiv.style.display = 'none';
    return;
  }

  let total = 0;
  lista.innerHTML = carrinho.map((item) => {
    const sub = item.produto.preco * item.quantidade;
    total += sub;
    return `<div class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.produto.nome}</span>
        <span class="cart-item-unit">${fmt(item.produto.preco)} cada</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn secondary-button" onclick="alterarQtd(${item.produto.id}, -1)">−</button>
        <span class="qty-value">${item.quantidade}</span>
        <button class="qty-btn primary-button" onclick="alterarQtd(${item.produto.id}, 1)">+</button>
        <span class="cart-item-sub">${fmt(sub)}</span>
      </div>
    </div>`;
  }).join('');

  document.getElementById('total-valor').textContent = fmt(total);
  totalDiv.style.display = 'flex';
}

// ── Fazer Pedido ───────────────────────────────────────────────────────────
async function buscarClientePedido() {
  const email = document.getElementById('pedido-email').value.trim();
  if (!email) { showToast('Informe o email do cliente.', 'error'); return; }
  try {
    const cliente = await apiFetch(`/clientes/buscar?email=${encodeURIComponent(email)}`);
    document.getElementById('pedido-cliente-id').value = cliente.id;
    const info = document.getElementById('cliente-info');
    info.innerHTML = `<strong>${cliente.nome}</strong><br>${cliente.email} · ${cliente.telefone}`;
    info.style.display = 'block';
    showToast(`Cliente ${cliente.nome} selecionado.`);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

document.getElementById('form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();
  const clienteId = Number(document.getElementById('pedido-cliente-id').value);
  const enderecoEntrega = document.getElementById('pedido-endereco').value.trim();

  if (!clienteId) { showToast('Busque e selecione um cliente primeiro.', 'error'); return; }
  if (!enderecoEntrega) { showToast('Informe o endereço de entrega.', 'error'); return; }
  if (!carrinho.length) { showToast('O carrinho está vazio.', 'error'); return; }

  const body = {
    clienteId,
    enderecoEntrega,
    itens: carrinho.map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade })),
  };

  try {
    const pedido = await apiFetch('/pedidos', { method: 'POST', body: JSON.stringify(body) });
    showToast(`Pedido #${pedido.id} criado com sucesso!`);
    exibirResultado('resultado-pedido', pedido, 'success');

    carrinho = [];
    atualizarCarrinhoUI();
    renderizarCarrinho();
    document.getElementById('form-pedido').reset();
    document.getElementById('cliente-info').style.display = 'none';
    document.getElementById('pedido-cliente-id').value = '';

    // Update qty displays in cardápio if visible
    document.querySelectorAll('[id^="qtd-"]').forEach((el) => { el.textContent = '0'; });
  } catch (e) {
    showToast(e.message, 'error');
    exibirResultado('resultado-pedido', { erro: e.message }, 'error');
  }
});

// ── Acompanhamento ─────────────────────────────────────────────────────────
document.getElementById('form-rastreio').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('rastreio-id').value;
  if (!id) return;

  try {
    const pedido = await apiFetch(`/pedidos/${id}`);
    pedidoTracked = pedido;
    exibirPedidoDetalhe(pedido);
    document.getElementById('resultado-rastreio').innerHTML = '';
  } catch (e) {
    document.getElementById('pedido-detalhe').style.display = 'none';
    exibirResultado('resultado-rastreio', { erro: e.message }, 'error');
  }
});

function exibirPedidoDetalhe(pedido) {
  document.getElementById('pedido-detalhe').style.display = 'block';
  document.getElementById('det-id').textContent = pedido.id;

  const statusBadge = document.getElementById('det-status');
  statusBadge.textContent = STATUS_LABEL[pedido.status] || pedido.status;
  statusBadge.className = `status-badge status-${pedido.status}`;

  document.getElementById('det-cliente').textContent = pedido.cliente
    ? `${pedido.cliente.nome} (${pedido.cliente.email})`
    : '—';
  document.getElementById('det-endereco').textContent = pedido.enderecoEntrega;
  document.getElementById('det-data').textContent = fmtData(pedido.dataPedido);

  document.getElementById('det-itens').innerHTML = (pedido.itens || []).map((item) => `
    <tr>
      <td>${item.produto.nome}</td>
      <td>${item.quantidade}</td>
      <td>${fmt(item.precoUnitario)}</td>
      <td>${fmt(item.subtotal)}</td>
    </tr>`).join('');

  document.getElementById('det-total').textContent = fmt(pedido.valorTotal);

  const btn = document.getElementById('btn-avancar');
  const proximo = PROXIMO_STATUS[pedido.status];
  btn.style.display = proximo ? 'block' : 'none';
  if (proximo) btn.textContent = `→ ${STATUS_LABEL[proximo]}`;
}

async function avancarStatus() {
  if (!pedidoTracked) return;
  const novoStatus = PROXIMO_STATUS[pedidoTracked.status];
  if (!novoStatus) return;
  try {
    const pedido = await apiFetch(`/pedidos/${pedidoTracked.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: novoStatus }),
    });
    pedidoTracked = pedido;
    exibirPedidoDetalhe(pedido);
    showToast(`Status atualizado: ${STATUS_LABEL[novoStatus]}`);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ── Gestão: Pedidos ────────────────────────────────────────────────────────
async function carregarPedidos() {
  const status = document.getElementById('filtro-status').value;
  const params = status ? `?status=${status}` : '';
  const lista = document.getElementById('lista-pedidos');
  lista.innerHTML = '<p class="empty-msg">Carregando...</p>';

  try {
    const pedidos = await apiFetch(`/pedidos${params}`);
    if (!pedidos.length) {
      lista.innerHTML = '<p class="empty-msg">Nenhum pedido encontrado.</p>';
      return;
    }
    lista.innerHTML = pedidos.map((p) => {
      const proximo = PROXIMO_STATUS[p.status];
      return `<div class="list-item">
        <div class="list-item-info">
          <span class="list-item-title">Pedido #${p.id} — ${p.cliente?.nome || '—'}</span>
          <span class="list-item-sub">${fmtData(p.dataPedido)} · ${fmt(p.valorTotal)}</span>
          <span class="list-item-sub">${p.enderecoEntrega}</span>
        </div>
        <div class="list-item-actions">
          <span class="status-badge status-${p.status}">${STATUS_LABEL[p.status]}</span>
          ${proximo
            ? `<button class="secondary-button small"
                onclick="avancarStatusGestao(${p.id}, '${proximo}', this)">
                → ${STATUS_LABEL[proximo]}
               </button>`
            : ''}
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    lista.innerHTML = `<p class="empty-msg error">Erro: ${e.message}</p>`;
  }
}

async function avancarStatusGestao(id, novoStatus, btn) {
  btn.disabled = true;
  try {
    await apiFetch(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: novoStatus }),
    });
    showToast(`Pedido #${id}: ${STATUS_LABEL[novoStatus]}`);
    carregarPedidos();
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false;
  }
}

// ── Gestão: Clientes ───────────────────────────────────────────────────────
async function carregarClientes() {
  const lista = document.getElementById('lista-clientes');
  lista.innerHTML = '<p class="empty-msg">Carregando...</p>';
  try {
    const clientes = await apiFetch('/clientes');
    renderizarClientes(clientes, lista);
  } catch (e) {
    lista.innerHTML = `<p class="empty-msg error">Erro: ${e.message}</p>`;
  }
}

async function buscarClienteEmail() {
  const email = document.getElementById('buscar-email').value.trim();
  if (!email) { showToast('Informe o email.', 'error'); return; }
  const lista = document.getElementById('lista-clientes');
  try {
    const cliente = await apiFetch(`/clientes/buscar?email=${encodeURIComponent(email)}`);
    renderizarClientes([cliente], lista);
  } catch (e) {
    lista.innerHTML = `<p class="empty-msg error">${e.message}</p>`;
  }
}

function renderizarClientes(clientes, el) {
  if (!clientes.length) {
    el.innerHTML = '<p class="empty-msg">Nenhum cliente encontrado.</p>';
    return;
  }
  el.innerHTML = clientes.map((c) => `
    <div class="list-item">
      <div class="list-item-info">
        <span class="list-item-title">${c.nome}</span>
        <span class="list-item-sub">${c.email} · ${c.telefone}</span>
        <span class="list-item-sub">${c.endereco}</span>
      </div>
      <span class="id-badge">#${c.id}</span>
    </div>`).join('');
}

document.getElementById('form-cliente').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    nome:      document.getElementById('c-nome').value.trim(),
    email:     document.getElementById('c-email').value.trim(),
    telefone:  document.getElementById('c-telefone').value.trim(),
    endereco:  document.getElementById('c-endereco').value.trim(),
  };
  try {
    const c = await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(body) });
    showToast(`Cliente ${c.nome} cadastrado!`);
    exibirResultado('resultado-cliente', c, 'success');
    document.getElementById('form-cliente').reset();
    carregarClientes();
  } catch (e) {
    showToast(e.message, 'error');
    exibirResultado('resultado-cliente', { erro: e.message }, 'error');
  }
});

// ── Gestão: Produtos ───────────────────────────────────────────────────────
async function carregarProdutosGestao() {
  const lista = document.getElementById('lista-produtos');
  lista.innerHTML = '<p class="empty-msg">Carregando...</p>';
  try {
    const produtos = await apiFetch('/produtos');
    if (!produtos.length) {
      lista.innerHTML = '<p class="empty-msg">Nenhum produto cadastrado.</p>';
      return;
    }
    lista.innerHTML = produtos.map((p) => `
      <div class="list-item">
        <div class="list-item-info">
          <span class="list-item-title">
            ${p.nome}
            <span class="card-category">${p.categoria}</span>
          </span>
          <span class="list-item-sub">${fmt(p.preco)}${p.descricao ? ` · ${p.descricao}` : ''}</span>
        </div>
        <div class="list-item-actions">
          <label class="toggle-label">
            <input type="checkbox" ${p.disponivel ? 'checked' : ''}
              onchange="toggleDisponibilidade(${p.id}, this.checked)" />
            Disponível
          </label>
        </div>
      </div>`).join('');
  } catch (e) {
    lista.innerHTML = `<p class="empty-msg error">Erro: ${e.message}</p>`;
  }
}

async function toggleDisponibilidade(id, disponivel) {
  try {
    const p = await apiFetch(`/produtos/${id}`);
    await apiFetch(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco,
        categoria: p.categoria,
        disponivel,
      }),
    });
    showToast(`Produto ${disponivel ? 'ativado' : 'desativado'}.`);
    produtosCache[id] = { ...produtosCache[id], disponivel };
    carregarCardapio();
  } catch (e) {
    showToast(e.message, 'error');
    carregarProdutosGestao();
  }
}

document.getElementById('form-produto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    nome:       document.getElementById('p-nome').value.trim(),
    descricao:  document.getElementById('p-descricao').value.trim() || null,
    preco:      parseFloat(document.getElementById('p-preco').value),
    categoria:  document.getElementById('p-categoria').value.trim(),
    disponivel: document.getElementById('p-disponivel').checked,
  };
  try {
    const p = await apiFetch('/produtos', { method: 'POST', body: JSON.stringify(body) });
    showToast(`Produto "${p.nome}" cadastrado!`);
    exibirResultado('resultado-produto', p, 'success');
    document.getElementById('form-produto').reset();
    document.getElementById('p-disponivel').checked = true;
    carregarProdutosGestao();
    // Refresh categories dropdown
    const sel = document.getElementById('filtro-categoria');
    const exists = Array.from(sel.options).some((o) => o.value === p.categoria);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = p.categoria;
      opt.textContent = p.categoria;
      sel.appendChild(opt);
    }
    carregarCardapio();
  } catch (e) {
    showToast(e.message, 'error');
    exibirResultado('resultado-produto', { erro: e.message }, 'error');
  }
});

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarCategorias();
  carregarCardapio();
  carregarPedidos();
  carregarProdutosGestao();
});
