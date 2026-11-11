(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmt = (n) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------------- API helpers ----------------
  async function apiGet(name) {
    const res = await fetch("/api/collections/" + name);
    if (res.status === 401) { window.location.href = "/login"; throw new Error("No autenticado"); }
    if (!res.ok) throw new Error("Error al cargar " + name);
    return res.json();
  }
  async function apiAdd(name, fields) {
    const res = await fetch("/api/collections/" + name, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (res.status === 401) { window.location.href = "/login"; throw new Error("No autenticado"); }
    if (!res.ok) throw new Error("Error al agregar");
    return res.json();
  }
  async function apiUpdate(name, id, patch) {
    const res = await fetch("/api/collections/" + name + "/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.status === 401) { window.location.href = "/login"; throw new Error("No autenticado"); }
    if (!res.ok) throw new Error("Error al actualizar");
    return res.json();
  }
  async function apiDelete(name, id) {
    const res = await fetch("/api/collections/" + name + "/" + id, { method: "DELETE" });
    if (res.status === 401) { window.location.href = "/login"; throw new Error("No autenticado"); }
    if (!res.ok) throw new Error("Error al eliminar");
    return res.json();
  }

  // ---------------- Logout ----------------
  $("#logoutBtn").addEventListener("click", async () => {
    try { await fetch("/api/logout", { method: "POST" }); } catch (e) {}
    window.location.href = "/login";
  });

  // ---------------- Navigation ----------------
  const views = ["resumen", "pedidos", "clientes", "recetas", "catalogo", "cursos", "calendario", "huerto", "contabilidad", "ajustes"];
  function setView(name) {
    views.forEach((v) => { $("#view-" + v).hidden = v !== name; });
    $$(".navbtn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  }
  $$(".navbtn").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  const statusBanner = $("#statusBanner");
  function showBanner(msg) { statusBanner.textContent = msg; statusBanner.classList.add("show"); }

  // ================= generic CRUD table engine (REST-backed) =================
  const crudTables = {}; // name -> { rows, render, reload }

  function makeCrud(opts) {
    const { name, columns, renderExtra, sort } = opts;
    const state = { rows: [] };

    function fieldHtml(col, value) {
      if (col.type === "select") {
        return (
          '<select data-k="' + col.key + '">' +
          col.options.map((o) => '<option value="' + esc(o) + '"' + (o === value ? " selected" : "") + '">' + esc(o) + "</option>").join("") +
          "</select>"
        );
      }
      if (col.type === "number") {
        return '<input class="mono" data-k="' + col.key + '" type="number" step="0.01" value="' + esc(value == null ? "" : value) + '" />';
      }
      return '<input data-k="' + col.key + '" type="text" value="' + esc(value == null ? "" : value) + '" />';
    }

    function mount(containerEl) {
      function renderAddRow() {
        const wrap = document.createElement("div");
        wrap.className = "add-row";
        wrap.style.setProperty("--cols", columns.length);
        columns.forEach((col) => {
          if (col.type === "select") {
            const sel = document.createElement("select");
            sel.dataset.addk = col.key;
            col.options.forEach((o) => { const op = document.createElement("option"); op.value = o; op.textContent = o; sel.appendChild(op); });
            wrap.appendChild(sel);
          } else {
            const inp = document.createElement("input");
            inp.dataset.addk = col.key;
            inp.type = col.type === "number" ? "number" : "text";
            if (col.type === "number") inp.step = "0.01";
            inp.placeholder = col.label;
            wrap.appendChild(inp);
          }
        });
        const btn = document.createElement("button");
        btn.className = "primary";
        btn.textContent = "Agregar";
        btn.addEventListener("click", async () => {
          const doc = {};
          let hasAny = false;
          columns.forEach((col) => {
            const el = wrap.querySelector('[data-addk="' + col.key + '"]');
            let v = el.value;
            if (col.type === "number") v = parseFloat(v) || 0; else v = (v || "").trim();
            if (v) hasAny = true;
            doc[col.key] = v;
          });
          if (!hasAny) return;
          try {
            await apiAdd(name, doc);
            columns.forEach((col) => { const el = wrap.querySelector('[data-addk="' + col.key + '"]'); if (col.type !== "select") el.value = ""; });
            await reload();
          } catch (e) { showBanner("No se pudo agregar la fila."); }
        });
        wrap.appendChild(btn);
        return wrap;
      }

      function render() {
        containerEl.innerHTML = "";
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        thead.innerHTML = "<tr>" + columns.map((c) => "<th" + (c.type === "number" ? ' class="num"' : "") + ">" + esc(c.label) + "</th>").join("") + "<th></th></tr>";
        table.appendChild(thead);
        const tbody = document.createElement("tbody");

        if (!state.rows.length) {
          const tr = document.createElement("tr");
          tr.innerHTML = '<td colspan="' + (columns.length + 1) + '" class="empty-note">Todavía no hay filas. Agrega la primera abajo.</td>';
          tbody.appendChild(tr);
        }

        state.rows.forEach((row) => {
          const tr = document.createElement("tr");
          columns.forEach((col) => {
            const td = document.createElement("td");
            if (col.type === "number") td.className = "num";
            td.innerHTML = fieldHtml(col, row[col.key]);
            const field = td.querySelector("[data-k]");
            field.addEventListener("change", async () => {
              let v = field.value;
              if (col.type === "number") v = parseFloat(v) || 0;
              const patch = {}; patch[col.key] = v;
              try { await apiUpdate(name, row.id, patch); await reload(); } catch (e) { showBanner("No se pudo guardar el cambio."); }
            });
            if (col.money) td.innerHTML += ' <span class="mono" style="color:var(--ink-soft); font-size:.78rem;">$</span>';
            tr.appendChild(td);
          });
          const delTd = document.createElement("td");
          const delBtn = document.createElement("button");
          delBtn.className = "icon danger-step";
          delBtn.textContent = "Eliminar";
          let armed = false;
          delBtn.addEventListener("click", async () => {
            if (!armed) {
              armed = true; delBtn.classList.add("armed"); delBtn.textContent = "Confirmar";
              setTimeout(() => { armed = false; delBtn.classList.remove("armed"); delBtn.textContent = "Eliminar"; }, 3000);
            } else {
              try { await apiDelete(name, row.id); await reload(); } catch (e) { showBanner("No se pudo eliminar la fila."); }
            }
          });
          delTd.appendChild(delBtn);
          if (row.sample) {
            const tag = document.createElement("span");
            tag.className = "pill sample"; tag.style.marginRight = "6px"; tag.textContent = "Ejemplo";
            delTd.prepend(tag);
          }
          tr.appendChild(delTd);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        const wrap = document.createElement("div");
        wrap.className = "table-wrap";
        wrap.appendChild(table);
        containerEl.appendChild(wrap);
        containerEl.appendChild(renderAddRow());
        if (renderExtra) renderExtra(state.rows);
      }

      async function reload() {
        try {
          state.rows = await apiGet(name);
          if (sort) state.rows.sort(sort);
        } catch (e) { /* keep previous rows on transient errors */ }
        render();
        recomputeMetrics();
      }

      crudTables[name] = { get rows() { return state.rows; }, render, reload };
      reload();
    }

    return { mount };
  }

  // ---------------- Pedidos ----------------
  const pedidosCols = [
    { key: "cliente", label: "Cliente", type: "text" },
    { key: "producto", label: "Producto", type: "text" },
    { key: "monto", label: "Monto", type: "number", money: true },
    { key: "pago", label: "Pago", type: "select", options: ["Transferencia", "Pago móvil", "Efectivo"] },
    { key: "estado", label: "Estado", type: "select", options: ["Por aprobar", "Pagado", "Atendido por Mafe"] },
  ];
  const pedidosCrud = makeCrud({ name: "pedidos", columns: pedidosCols });

  // ---------------- Clientes ----------------
  const clientesCols = [
    { key: "nombre", label: "Cliente", type: "text" },
    { key: "contacto", label: "Contacto (tel./IG)", type: "text" },
    { key: "interes", label: "Por qué escribió / interés", type: "text" },
    { key: "producto", label: "Producto que preguntó", type: "text" },
  ];
  const clientesCrud = makeCrud({ name: "clientes", columns: clientesCols });

  // ---------------- Catálogo ----------------
  const catalogoCols = [
    { key: "nombre", label: "Producto", type: "text" },
    { key: "linea", label: "Línea", type: "text" },
    { key: "precio", label: "Precio", type: "number", money: true },
    { key: "etiqueta", label: "Etiqueta", type: "select", options: ["Libre de gluten", "Sin confirmar", "Ninguna"] },
  ];
  const catalogoGrid = $("#catalogoGrid");
  const catalogoCrud = makeCrud({
    name: "catalogo", columns: catalogoCols,
    renderExtra: function (rows) {
      catalogoGrid.innerHTML = "";
      rows.forEach((p) => {
        const kind = p.etiqueta === "Libre de gluten" ? "good" : p.etiqueta === "Sin confirmar" ? "warn" : "neutral";
        const div = document.createElement("div");
        div.className = "cat-card";
        div.innerHTML =
          '<div class="top"><h3 style="font-size:1rem;">' + esc(p.nombre) + "</h3>" + (p.sample ? '<span class="pill sample">Ejemplo</span>' : "") + "</div>" +
          '<div style="color:var(--ink-soft); font-size:.78rem; margin-bottom:8px;">' + esc(p.linea || "") + "</div>" +
          '<div class="mono" style="margin-bottom:8px; color:var(--honey); font-weight:600;">$' + fmt(p.precio || 0) + "</div>" +
          '<span class="pill ' + kind + '">' + esc(p.etiqueta || "Ninguna") + "</span>";
        catalogoGrid.appendChild(div);
      });
    },
  });

  // ---------------- Cursos / reservas ----------------
  const cursosCols = [
    { key: "quien", label: "Quién", type: "text" },
    { key: "curso", label: "Curso / asesoría", type: "text" },
    { key: "estado", label: "Estado", type: "select", options: ["Por confirmar", "Confirmado", "Agendada"] },
  ];
  const cursosCrud = makeCrud({ name: "reservas", columns: cursosCols });

  // ---------------- Calendario ----------------
  const eventosCols = [
    { key: "fecha", label: "Fecha (AAAA-MM-DD)", type: "text" },
    { key: "nombre", label: "Evento / curso", type: "text" },
    { key: "cupo", label: "Cupo", type: "number" },
    { key: "estado", label: "Estado", type: "select", options: ["Abierto", "Agotado", "Cerrado"] },
  ];
  const eventosSort = (a, b) => (a.fecha || "").localeCompare(b.fecha || "");
  const proximoEventoCard = $("#proximoEventoCard");
  const eventosCrud = makeCrud({
    name: "eventos", columns: eventosCols, sort: eventosSort,
    renderExtra: function (rows) {
      const hoy = new Date().toISOString().slice(0, 10);
      const proximo = rows.find((e) => e.estado === "Abierto" && e.fecha >= hoy) || rows.find((e) => e.estado === "Abierto");
      if (!proximo) {
        proximoEventoCard.innerHTML = '<div class="section-head"><h2>Próximo evento abierto</h2></div><p class="empty-note">No hay eventos abiertos en este momento.</p>';
        return;
      }
      proximoEventoCard.innerHTML =
        '<div class="section-head"><h2>Próximo evento abierto</h2><span class="pill good">Abierto</span></div>' +
        '<p style="margin:0 0 4px; font-weight:600;">' + esc(proximo.nombre) + "</p>" +
        '<p style="margin:0; color:var(--ink-soft); font-size:.88rem;">' + esc(proximo.fecha) + " · cupo: " + esc(proximo.cupo) + "</p>";
    },
  });

  // ---------------- Contabilidad ----------------
  const acctCols = [
    { key: "fecha", label: "Fecha", type: "text" },
    { key: "tipo", label: "Tipo", type: "select", options: ["Ingreso", "Gasto operativo", "Gasto de curso", "Gasto de taller", "Otro gasto"] },
    { key: "descripcion", label: "Descripción", type: "text" },
    { key: "monto", label: "Monto", type: "number", money: true },
  ];
  const acctKpisEl = $("#acctKpis");
  const contabilidadCrud = makeCrud({
    name: "contabilidad", columns: acctCols,
    renderExtra: function (rows) {
      let ingresos = 0, gastos = 0;
      rows.forEach((r) => { const m = r.monto || 0; if (r.tipo === "Ingreso") ingresos += m; else gastos += m; });
      const neto = ingresos - gastos;
      acctKpisEl.innerHTML =
        '<div class="card kpi"><div class="label">Ingresos</div><div class="value pos">$' + fmt(ingresos) + "</div></div>" +
        '<div class="card kpi"><div class="label">Gastos</div><div class="value neg">$' + fmt(gastos) + "</div></div>" +
        '<div class="card kpi"><div class="label">Neto</div><div class="value ' + (neto >= 0 ? "pos" : "neg") + '">$' + fmt(neto) + "</div></div>";
    },
  });

  // ---------------- Pendientes ----------------
  const pendientesCols = [{ key: "texto", label: "Pendiente", type: "text" }];
  const pendientesCrud = makeCrud({ name: "pendientes", columns: pendientesCols });

  // ================= Resumen + Clientes metrics (computed) =================
  function recomputeMetrics() {
    const pedidos = (crudTables.pedidos && crudTables.pedidos.rows) || [];
    const clientes = (crudTables.clientes && crudTables.clientes.rows) || [];
    const reservas = (crudTables.reservas && crudTables.reservas.rows) || [];
    const acct = (crudTables.contabilidad && crudTables.contabilidad.rows) || [];

    const ingresos = acct.filter((r) => r.tipo === "Ingreso").reduce((s, r) => s + (r.monto || 0), 0);
    const abiertos = pedidos.filter((p) => p.estado !== "Pagado").length;
    const topProductoCount = {};
    pedidos.forEach((p) => { if (p.producto) topProductoCount[p.producto] = (topProductoCount[p.producto] || 0) + 1; });
    let topProducto = "—", topN = 0;
    Object.entries(topProductoCount).forEach(([k, v]) => { if (v > topN) { topN = v; topProducto = k; } });

    const resumenKpis = $("#resumenKpis");
    if (resumenKpis)
      resumenKpis.innerHTML =
        '<div class="card kpi"><div class="label">Ingresos registrados</div><div class="value">$' + fmt(ingresos) + '</div><div class="delta">según Contabilidad</div></div>' +
        '<div class="card kpi"><div class="label">Pedidos abiertos</div><div class="value">' + abiertos + '</div><div class="delta">de ' + pedidos.length + ' pedidos totales</div></div>' +
        '<div class="card kpi"><div class="label">Reservas</div><div class="value">' + reservas.length + '</div><div class="delta">cursos y asesorías</div></div>' +
        '<div class="card kpi"><div class="label">Producto más vendido</div><div class="value" style="font-size:1rem; font-family:var(--font-body); font-weight:700;">' + esc(topProducto) + "</div></div>";

    const resumenPedidosEl = $("#resumenPedidos");
    if (resumenPedidosEl) {
      resumenPedidosEl.innerHTML = "";
      pedidos.slice(0, 5).forEach((p) => {
        const row = document.createElement("div");
        row.className = "list-row";
        row.innerHTML = '<div><div class="who">' + esc(p.cliente || "—") + '</div><div class="meta">' + esc(p.producto || "") + " · " + esc(p.estado || "") + '</div></div><div class="mono">$' + fmt(p.monto || 0) + "</div>";
        resumenPedidosEl.appendChild(row);
      });
      if (!pedidos.length) resumenPedidosEl.innerHTML = '<p class="empty-note">Todavía no hay pedidos.</p>';
    }

    const productoPreguntadoCount = {};
    clientes.forEach((c) => { if (c.producto) productoPreguntadoCount[c.producto] = (productoPreguntadoCount[c.producto] || 0) + 1; });
    let topPreguntado = "—", topPN = 0;
    Object.entries(productoPreguntadoCount).forEach(([k, v]) => { if (v > topPN) { topPN = v; topPreguntado = k; } });
    const ticketProm = pedidos.length ? pedidos.reduce((s, p) => s + (p.monto || 0), 0) / pedidos.length : 0;

    const clientesKpis = $("#clientesKpis");
    if (clientesKpis)
      clientesKpis.innerHTML =
        '<div class="card kpi"><div class="label">Producto más preguntado</div><div class="value" style="font-size:1rem; font-family:var(--font-body); font-weight:700;">' + esc(topPreguntado) + "</div></div>" +
        '<div class="card kpi"><div class="label">Producto más vendido</div><div class="value" style="font-size:1rem; font-family:var(--font-body); font-weight:700;">' + esc(topProducto) + "</div></div>" +
        '<div class="card kpi"><div class="label">Ticket promedio</div><div class="value">$' + fmt(ticketProm) + "</div></div>";
  }

  // ================= Recetas y costeo =================
  let ingredients = [];
  let recipes = [];
  const ingredientsBody = $("#ingredientsBody");
  const ingCount = $("#ingCount");
  const recipesList = $("#recipesList");

  function ingredientById(id) { return ingredients.find((i) => i.id === id); }

  async function reloadIngredients() { ingredients = await apiGet("ingredients"); renderIngredients(); renderRecipes(); }
  async function reloadRecipes() { recipes = await apiGet("recipes"); renderRecipes(); }

  function renderIngredients() {
    if (ingredients.length) { ingCount.style.display = "inline-block"; ingCount.textContent = ingredients.length + " insumos"; }
    else { ingCount.style.display = "none"; }
    ingredientsBody.innerHTML = "";
    if (!ingredients.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = '<td colspan="4" class="empty-note">Todavía no hay insumos. Agrega el primero abajo.</td>';
      ingredientsBody.appendChild(tr);
      return;
    }
    ingredients.forEach((ing) => {
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      const nameInput = document.createElement("input");
      nameInput.value = ing.name;
      nameInput.addEventListener("change", () => updateIngredient(ing.id, { name: nameInput.value }));
      nameTd.appendChild(nameInput);
      if (ing.sample) {
        const tag = document.createElement("span");
        tag.className = "pill sample"; tag.style.marginLeft = "6px"; tag.textContent = "Ejemplo";
        nameTd.appendChild(tag);
      }

      const unitTd = document.createElement("td");
      unitTd.className = "num";
      const unitSelect = document.createElement("select");
      ["g", "kg", "ml", "unidad"].forEach((u) => {
        const opt = document.createElement("option");
        opt.value = u; opt.textContent = u;
        if (u === ing.unit) opt.selected = true;
        unitSelect.appendChild(opt);
      });
      unitSelect.addEventListener("change", () => updateIngredient(ing.id, { unit: unitSelect.value }));
      unitTd.appendChild(unitSelect);

      const costTd = document.createElement("td");
      costTd.className = "num";
      const costInput = document.createElement("input");
      costInput.className = "mono"; costInput.type = "number"; costInput.step = "0.001";
      costInput.value = ing.costPerUnit;
      costInput.addEventListener("change", () => updateIngredient(ing.id, { costPerUnit: parseFloat(costInput.value) || 0 }));
      costTd.appendChild(costInput);

      const delTd = document.createElement("td");
      const delBtn = document.createElement("button");
      delBtn.className = "icon danger-step";
      delBtn.textContent = "Eliminar";
      let armed = false;
      delBtn.addEventListener("click", () => {
        if (!armed) { armed = true; delBtn.classList.add("armed"); delBtn.textContent = "Confirmar"; setTimeout(() => { armed = false; delBtn.classList.remove("armed"); delBtn.textContent = "Eliminar"; }, 3000); }
        else deleteIngredient(ing.id);
      });
      delTd.appendChild(delBtn);

      tr.append(nameTd, unitTd, costTd, delTd);
      ingredientsBody.appendChild(tr);
    });
  }

  function computeRecipe(recipe) {
    let total = 0;
    (recipe.items || []).forEach((it) => { const ing = ingredientById(it.ingredientId); if (ing) total += (ing.costPerUnit || 0) * (it.qty || 0); });
    const yieldUnits = recipe.yieldUnits > 0 ? recipe.yieldUnits : 1;
    const perUnit = total / yieldUnits;
    const margin = recipe.marginPercent || 0;
    const price = perUnit * (1 + margin / 100);
    return { total, perUnit, price };
  }

  function renderRecipes() {
    recipesList.innerHTML = "";
    if (!recipes.length) { recipesList.innerHTML = '<p class="empty-note">Todavía no hay recetas. Crea la primera con “+ Nueva receta”.</p>'; return; }
    recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "recipe-card";

      const top = document.createElement("div");
      top.className = "recipe-top";
      const left = document.createElement("div");
      left.style.flex = "1"; left.style.minWidth = "180px";
      const nameInput = document.createElement("input");
      nameInput.className = "recipe-name-field";
      nameInput.value = recipe.name;
      nameInput.addEventListener("change", () => updateRecipe(recipe.id, { name: nameInput.value }));
      left.appendChild(nameInput);
      if (recipe.sample) {
        const tag = document.createElement("span");
        tag.className = "pill sample"; tag.style.marginLeft = "6px"; tag.textContent = "Ejemplo";
        left.appendChild(tag);
      }

      const meta = document.createElement("div");
      meta.className = "recipe-meta";
      const yieldField = document.createElement("div");
      yieldField.className = "field-sm";
      yieldField.innerHTML = "<label>Rinde (unidades)</label>";
      const yieldInput = document.createElement("input");
      yieldInput.type = "number"; yieldInput.min = "1"; yieldInput.value = recipe.yieldUnits || 1;
      yieldInput.addEventListener("change", () => updateRecipe(recipe.id, { yieldUnits: parseFloat(yieldInput.value) || 1 }));
      yieldField.appendChild(yieldInput);

      const marginField = document.createElement("div");
      marginField.className = "field-sm";
      marginField.innerHTML = "<label>Margen %</label>";
      const marginInput = document.createElement("input");
      marginInput.type = "number"; marginInput.min = "0"; marginInput.value = recipe.marginPercent || 0;
      marginInput.addEventListener("change", () => updateRecipe(recipe.id, { marginPercent: parseFloat(marginInput.value) || 0 }));
      marginField.appendChild(marginInput);

      meta.append(yieldField, marginField);
      left.appendChild(meta);
      top.appendChild(left);

      const delBtnWrap = document.createElement("div");
      const delBtn = document.createElement("button");
      delBtn.className = "icon danger-step";
      delBtn.textContent = "Eliminar receta";
      let armed = false;
      delBtn.addEventListener("click", () => {
        if (!armed) { armed = true; delBtn.classList.add("armed"); delBtn.textContent = "Confirmar"; setTimeout(() => { armed = false; delBtn.classList.remove("armed"); delBtn.textContent = "Eliminar receta"; }, 3000); }
        else deleteRecipe(recipe.id);
      });
      delBtnWrap.appendChild(delBtn);
      top.appendChild(delBtnWrap);
      card.appendChild(top);

      const itemsTable = document.createElement("table");
      itemsTable.innerHTML = '<thead><tr><th>Insumo</th><th class="num">Cantidad</th><th></th></tr></thead>';
      const tbody = document.createElement("tbody");

      (recipe.items || []).forEach((it, idx) => {
        const tr = document.createElement("tr");
        const ingTd = document.createElement("td");
        const sel = document.createElement("select");
        const noneOpt = document.createElement("option");
        noneOpt.value = ""; noneOpt.textContent = "— elegir insumo —";
        sel.appendChild(noneOpt);
        ingredients.forEach((ing) => {
          const opt = document.createElement("option");
          opt.value = ing.id; opt.textContent = ing.name + " (" + ing.unit + ")";
          if (ing.id === it.ingredientId) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener("change", () => {
          const newItems = (recipe.items || []).slice();
          newItems[idx] = Object.assign({}, newItems[idx], { ingredientId: sel.value });
          updateRecipe(recipe.id, { items: newItems });
        });
        ingTd.appendChild(sel);

        const qtyTd = document.createElement("td");
        qtyTd.className = "num";
        const qtyInput = document.createElement("input");
        qtyInput.type = "number"; qtyInput.className = "mono"; qtyInput.step = "0.01";
        qtyInput.value = it.qty || 0;
        qtyInput.addEventListener("change", () => {
          const newItems = (recipe.items || []).slice();
          newItems[idx] = Object.assign({}, newItems[idx], { qty: parseFloat(qtyInput.value) || 0 });
          updateRecipe(recipe.id, { items: newItems });
        });
        qtyTd.appendChild(qtyInput);

        const rmTd = document.createElement("td");
        const rmBtn = document.createElement("button");
        rmBtn.className = "icon ghost";
        rmBtn.textContent = "×";
        rmBtn.addEventListener("click", () => {
          const newItems = (recipe.items || []).slice();
          newItems.splice(idx, 1);
          updateRecipe(recipe.id, { items: newItems });
        });
        rmTd.appendChild(rmBtn);

        tr.append(ingTd, qtyTd, rmTd);
        tbody.appendChild(tr);
      });
      itemsTable.appendChild(tbody);
      card.appendChild(itemsTable);

      const addLineBtn = document.createElement("button");
      addLineBtn.className = "ghost icon";
      addLineBtn.style.marginTop = "8px";
      addLineBtn.textContent = "+ Agregar insumo a la receta";
      addLineBtn.disabled = !ingredients.length;
      addLineBtn.addEventListener("click", () => {
        const newItems = (recipe.items || []).slice();
        newItems.push({ ingredientId: ingredients[0] ? ingredients[0].id : "", qty: 0 });
        updateRecipe(recipe.id, { items: newItems });
      });
      card.appendChild(addLineBtn);

      const { total, perUnit, price } = computeRecipe(recipe);
      const summary = document.createElement("div");
      summary.className = "cost-summary";
      summary.innerHTML =
        '<div class="stat"><div class="label">Costo total</div><div class="value">$' + fmt(total) + "</div></div>" +
        '<div class="stat"><div class="label">Costo / unidad</div><div class="value">$' + fmt(perUnit) + "</div></div>" +
        '<div class="stat"><div class="label">Precio sugerido</div><div class="value price">$' + fmt(price) + "</div></div>";
      card.appendChild(summary);

      recipesList.appendChild(card);
    });
  }

  async function updateIngredient(id, patch) { try { await apiUpdate("ingredients", id, patch); await reloadIngredients(); } catch (e) { showBanner("No se pudo guardar el insumo."); } }
  async function deleteIngredient(id) { try { await apiDelete("ingredients", id); await reloadIngredients(); } catch (e) { showBanner("No se pudo eliminar el insumo."); } }
  async function updateRecipe(id, patch) { try { await apiUpdate("recipes", id, patch); await reloadRecipes(); } catch (e) { showBanner("No se pudo guardar la receta."); } }
  async function deleteRecipe(id) { try { await apiDelete("recipes", id); await reloadRecipes(); } catch (e) { showBanner("No se pudo eliminar la receta."); } }

  async function addIngredient() {
    const name = $("#newIngName").value.trim();
    const unit = $("#newIngUnit").value;
    const cost = parseFloat($("#newIngCost").value) || 0;
    if (!name) return;
    try {
      await apiAdd("ingredients", { name, unit, costPerUnit: cost });
      $("#newIngName").value = ""; $("#newIngCost").value = "";
      await reloadIngredients();
    } catch (e) { showBanner("No se pudo agregar el insumo."); }
  }
  async function addRecipe() {
    try { await apiAdd("recipes", { name: "Nueva receta", yieldUnits: 1, marginPercent: 40, items: [] }); await reloadRecipes(); }
    catch (e) { showBanner("No se pudo crear la receta."); }
  }

  // ================= Huerto (plantas con foto + mapa por piso) =================
  function resizeImageToDataUrl(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > h) { if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; } }
          else { if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; } }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  let huertoRows = [];
  const huertoGrid = $("#huertoGrid");
  const huertoAddCard = $("#huertoAddCard");
  const huertoMap = $("#huertoMap");

  async function reloadHuerto() { huertoRows = await apiGet("huerto"); renderHuerto(); renderHuertoMap(); }
  async function updateHuerto(id, patch) { try { await apiUpdate("huerto", id, patch); await reloadHuerto(); } catch (e) { showBanner("No se pudo guardar la planta."); } }
  async function deleteHuerto(id) { try { await apiDelete("huerto", id); await reloadHuerto(); } catch (e) { showBanner("No se pudo eliminar la planta."); } }

  const FLOOR_NAMES = {
    1: "Piso 1 — entrada / nivel de suelo",
    2: "Piso 2",
    3: "Piso 3",
    4: "Piso 4",
    5: "Piso 5",
    6: "Piso 6",
    7: "Piso 7 — mirador",
  };

  function renderHuertoMap() {
    huertoMap.innerHTML = "";
    for (let piso = 1; piso <= 7; piso++) {
      const rows = huertoRows.filter((p) => Number(p.piso) === piso);
      const floor = document.createElement("div");
      floor.className = "huerto-floor";
      const head = document.createElement("div");
      head.className = "huerto-floor-head";
      head.innerHTML =
        '<span class="floor-num">' + piso + "</span>" +
        '<span class="floor-title">' + esc(FLOOR_NAMES[piso] || "Piso " + piso) + "</span>" +
        '<span class="floor-count">' + rows.length + (rows.length === 1 ? " planta" : " plantas") + "</span>";
      floor.appendChild(head);
      const body = document.createElement("div");
      body.className = "huerto-floor-body";
      if (!rows.length) {
        body.innerHTML = '<div class="huerto-floor-empty">Sin plantas asignadas a este piso todavía.</div>';
      } else {
        rows.forEach((p) => {
          const chip = document.createElement("div");
          chip.className = "huerto-chip";
          chip.innerHTML =
            (p.foto ? '<img src="' + p.foto + '" alt="" />' : '<div class="chip-ph">Sin foto</div>') +
            '<div class="chip-name">' + esc(p.nombre || "Sin nombre") + "</div>" +
            (p.matero ? '<div class="chip-matero">' + esc(p.matero) + "</div>" : "");
          body.appendChild(chip);
        });
      }
      floor.appendChild(body);
      huertoMap.appendChild(floor);
    }
  }

  function renderHuerto() {
    huertoGrid.innerHTML = "";
    if (!huertoRows.length) { huertoGrid.innerHTML = '<p class="empty-note">Todavía no hay flores ni plantas. Agrega la primera arriba.</p>'; return; }
    huertoRows.forEach((p) => {
      const card = document.createElement("div");
      card.className = "cat-card";

      const top = document.createElement("div");
      top.className = "top";
      top.innerHTML = '<h3 style="font-size:1rem;">&nbsp;</h3>' + (p.sample ? '<span class="pill sample">Ejemplo</span>' : "");

      if (p.foto) {
        const img = document.createElement("img");
        img.className = "plant-photo";
        img.src = p.foto;
        img.alt = p.nombre || "Planta del huerto";
        card.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "plant-photo-placeholder";
        ph.textContent = "Sin foto todavía";
        card.appendChild(ph);
      }

      const fields = document.createElement("div");
      fields.className = "plant-fields";

      const nameInput = document.createElement("input");
      nameInput.value = p.nombre || "";
      nameInput.placeholder = "Nombre de la flor o planta";
      nameInput.addEventListener("change", () => updateHuerto(p.id, { nombre: nameInput.value }));
      fields.appendChild(nameInput);

      const descInput = document.createElement("textarea");
      descInput.value = p.descripcion || "";
      descInput.placeholder = "Descripción (científica / culinaria)";
      descInput.addEventListener("change", () => updateHuerto(p.id, { descripcion: descInput.value }));
      fields.appendChild(descInput);

      const metaRow = document.createElement("div");
      metaRow.className = "plant-meta-row";
      const pisoInput = document.createElement("input");
      pisoInput.type = "number"; pisoInput.min = "1"; pisoInput.max = "7";
      pisoInput.value = p.piso || "";
      pisoInput.placeholder = "Piso (1-7)";
      pisoInput.addEventListener("change", () => updateHuerto(p.id, { piso: parseInt(pisoInput.value) || null }));
      const materoInput = document.createElement("input");
      materoInput.value = p.matero || "";
      materoInput.placeholder = "Matero / código QR";
      materoInput.addEventListener("change", () => updateHuerto(p.id, { matero: materoInput.value }));
      metaRow.append(pisoInput, materoInput);
      fields.appendChild(metaRow);

      card.appendChild(top);
      card.appendChild(fields);

      const actionsRow = document.createElement("div");
      actionsRow.style.display = "flex";
      actionsRow.style.justifyContent = "space-between";
      actionsRow.style.gap = "6px";

      const fileLabel = document.createElement("label");
      fileLabel.className = "file-btn ghost icon";
      fileLabel.style.border = "1px solid var(--line)";
      fileLabel.style.borderRadius = "8px";
      fileLabel.style.padding = "5px 8px";
      fileLabel.textContent = p.foto ? "Cambiar foto" : "Subir foto";
      const fileInput = document.createElement("input");
      fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.style.display = "none";
      fileInput.addEventListener("change", async () => {
        const f = fileInput.files && fileInput.files[0];
        if (!f) return;
        try { const dataUrl = await resizeImageToDataUrl(f, 480, 0.72); updateHuerto(p.id, { foto: dataUrl }); } catch (e) {}
      });
      fileLabel.appendChild(fileInput);

      const delBtn = document.createElement("button");
      delBtn.className = "icon danger-step";
      delBtn.textContent = "Eliminar";
      let armed = false;
      delBtn.addEventListener("click", () => {
        if (!armed) { armed = true; delBtn.classList.add("armed"); delBtn.textContent = "Confirmar"; setTimeout(() => { armed = false; delBtn.classList.remove("armed"); delBtn.textContent = "Eliminar"; }, 3000); }
        else deleteHuerto(p.id);
      });

      actionsRow.append(fileLabel, delBtn);
      card.appendChild(actionsRow);
      huertoGrid.appendChild(card);
    });
  }

  function renderHuertoAddForm() {
    huertoAddCard.innerHTML = "";
    const head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = "<h2>Agregar flor o planta</h2>";
    huertoAddCard.appendChild(head);

    const grid = document.createElement("div");
    grid.className = "add-plant-grid";

    let pendingPhoto = null;
    const photoPreview = document.createElement("div");
    photoPreview.className = "plant-photo-placeholder";
    photoPreview.style.width = "140px";
    photoPreview.textContent = "Sin foto";

    const fileLabel = document.createElement("label");
    fileLabel.className = "file-btn";
    fileLabel.textContent = "📷 Elegir foto";
    fileLabel.style.display = "block";
    fileLabel.style.marginTop = "6px";
    const fileInput = document.createElement("input");
    fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.style.display = "none";
    fileInput.addEventListener("change", async () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      try {
        pendingPhoto = await resizeImageToDataUrl(f, 480, 0.72);
        photoPreview.innerHTML = "";
        const img = document.createElement("img");
        img.className = "plant-photo";
        img.style.width = "140px";
        img.src = pendingPhoto;
        photoPreview.appendChild(img);
        photoPreview.className = "";
      } catch (e) {}
    });
    fileLabel.appendChild(fileInput);

    const photoCol = document.createElement("div");
    photoCol.append(photoPreview, fileLabel);

    const formCol = document.createElement("div");
    const nameInput = document.createElement("input");
    nameInput.placeholder = "Nombre de la flor o planta";
    nameInput.style.marginBottom = "6px";
    const descInput = document.createElement("textarea");
    descInput.placeholder = "Descripción (científica / culinaria)";
    descInput.style.marginBottom = "6px";
    const metaRow = document.createElement("div");
    metaRow.className = "plant-meta-row";
    metaRow.style.marginBottom = "8px";
    const pisoInput = document.createElement("input");
    pisoInput.type = "number"; pisoInput.min = "1"; pisoInput.max = "7"; pisoInput.placeholder = "Piso (1-7)";
    const materoInput = document.createElement("input");
    materoInput.placeholder = "Matero / código QR";
    metaRow.append(pisoInput, materoInput);

    const addBtn = document.createElement("button");
    addBtn.className = "primary";
    addBtn.textContent = "Agregar al huerto";
    addBtn.addEventListener("click", async () => {
      const nombre = nameInput.value.trim();
      if (!nombre) return;
      try {
        await apiAdd("huerto", {
          nombre,
          descripcion: descInput.value.trim(),
          piso: parseInt(pisoInput.value) || null,
          matero: materoInput.value.trim(),
          foto: pendingPhoto || null,
        });
        nameInput.value = ""; descInput.value = ""; pisoInput.value = ""; materoInput.value = "";
        pendingPhoto = null;
        photoPreview.innerHTML = "Sin foto";
        photoPreview.className = "plant-photo-placeholder";
        photoPreview.style.width = "140px";
        await reloadHuerto();
      } catch (e) { showBanner("No se pudo agregar la planta."); }
    });

    formCol.append(nameInput, descInput, metaRow, addBtn);
    grid.append(photoCol, formCol);
    huertoAddCard.appendChild(grid);
  }

  // ================= bootstrap =================
  async function init() {
    renderIngredients(); renderRecipes(); renderHuerto(); renderHuertoMap();

    try { await reloadIngredients(); } catch (e) {}
    try { await reloadRecipes(); } catch (e) {}
    try { await reloadHuerto(); } catch (e) {}

    $("#addIngBtn").addEventListener("click", addIngredient);
    $("#addRecipeBtn").addEventListener("click", addRecipe);
    renderHuertoAddForm();

    pedidosCrud.mount($("#pedidosPanel"));
    clientesCrud.mount($("#clientesPanel"));
    catalogoCrud.mount($("#catalogoTable"));
    cursosCrud.mount($("#cursosPanel"));
    eventosCrud.mount($("#calendarioPanel"));
    contabilidadCrud.mount($("#contabilidadPanel"));
    pendientesCrud.mount($("#pendientesPanel"));
  }

  init();
})();
