(function () {
  "use strict";

  var BASE = window.PORTAL_DATA;
  var STORE_KEY = "portal-regulacao-goiana:v1";
  var PRI = BASE.PRIORIDADES;
  var LOCS = BASE.LOCALIDADES;

  // ---------- Estado ----------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baseState() {
    return {
      versaoBase: BASE.versao,
      atualizadoEm: null,
      especialidades: clone(BASE.ESPECIALIDADES),
      historico: [],
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && Array.isArray(s.especialidades)) return s;
      }
    } catch (e) { /* armazenamento indisponível: usa base */ }
    return baseState();
  }

  var state = load();

  function save() {
    state.atualizadoEm = new Date().toISOString();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { toast("Não foi possível salvar neste navegador."); }
    renderNav();
    renderLastUpdate();
  }

  function getEsp(id) {
    for (var i = 0; i < state.especialidades.length; i++) {
      if (state.especialidades[i].id === id) return state.especialidades[i];
    }
    return null;
  }

  function filaLoc(esp, loc) {
    if (!esp.fila[loc]) esp.fila[loc] = [0, 0, 0];
    return esp.fila[loc];
  }

  function totals(esp) {
    var t = { urgente: 0, prioritario: 0, eletivo: 0, total: 0 };
    Object.keys(esp.fila).forEach(function (loc) {
      var f = esp.fila[loc];
      t.urgente += f[0]; t.prioritario += f[1]; t.eletivo += f[2];
    });
    t.total = t.urgente + t.prioritario + t.eletivo;
    return t;
  }

  function sum(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }

  // ---------- Utilidades ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(n) { return Number(n).toLocaleString("pt-BR"); }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  function slug(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3200);
  }

  var app = document.getElementById("app");

  function notice() {
    return BASE.exemplo
      ? '<div class="notice"><strong>Atenção:</strong> sistema carregado com <strong>dados de exemplo</strong>. ' +
        "Substitua pela Lista de Especialidades oficial (Ofício 432) em <code>js/data.js</code>.</div>"
      : "";
  }

  function priLegend(t) {
    return '<div class="legend-inline">' + PRI.map(function (p) {
      return '<span><i class="dot ' + p.id + '"></i>' + p.nome + ": " + fmt(t[p.id]) + "</span>";
    }).join("") + "</div>";
  }

  function stackbar(t) {
    if (!t.total) return '<div class="stackbar"></div>';
    return '<div class="stackbar" aria-hidden="true">' + PRI.map(function (p) {
      return t[p.id] ? '<span class="' + p.id + '" style="flex:' + t[p.id] + '"></span>' : "";
    }).join("") + "</div>";
  }

  // Gráfico de barras horizontal (série única) com tooltip
  function hbar(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([1]));
    return '<div class="hbar">' + rows.map(function (r, i) {
      var pct = (r.value / max) * 100;
      return '<div class="name">' + (r.href ? '<a href="' + r.href + '">' + esc(r.label) + "</a>" : esc(r.label)) + "</div>" +
        '<div class="track" data-tip="' + i + '"><div class="fill" style="width:' + pct + '%"></div></div>' +
        '<div class="val">' + fmt(r.value) + "</div>";
    }).join("") + "</div>";
  }

  var tipEl;
  function bindTooltips(container, rows) {
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.className = "tooltip";
      document.body.appendChild(tipEl);
    }
    container.querySelectorAll("[data-tip]").forEach(function (el) {
      var r = rows[Number(el.getAttribute("data-tip"))];
      el.addEventListener("mousemove", function (ev) {
        tipEl.innerHTML = "<b>" + esc(r.label) + "</b>" +
          PRI.map(function (p) {
            return '<div class="row"><span><i class="dot ' + p.id + '"></i>' + p.nome + "</span><span>" + fmt(r.parts[p.id]) + "</span></div>";
          }).join("") +
          '<div class="row" style="margin-top:4px;font-weight:700"><span>Total</span><span>' + fmt(r.value) + "</span></div>";
        tipEl.style.display = "block";
        var x = ev.clientX + 14, y = ev.clientY + 14;
        var w = tipEl.offsetWidth, h = tipEl.offsetHeight;
        if (x + w > window.innerWidth - 8) x = ev.clientX - w - 14;
        if (y + h > window.innerHeight - 8) y = ev.clientY - h - 14;
        tipEl.style.left = x + "px";
        tipEl.style.top = y + "px";
      });
      el.addEventListener("mouseleave", function () { tipEl.style.display = "none"; });
    });
  }

  // ---------- Navegação ----------
  function renderNav() {
    var nav = document.getElementById("navEspecialidades");
    nav.innerHTML = state.especialidades.slice().sort(function (a, b) {
      return a.nome.localeCompare(b.nome, "pt-BR");
    }).map(function (e) {
      return '<a href="#/especialidade/' + e.id + '" data-nav="esp-' + e.id + '">' +
        "<span>" + esc(e.nome) + '</span><span class="count">' + fmt(totals(e).total) + "</span></a>";
    }).join("");
    highlightNav();
  }

  function highlightNav() {
    var r = parseRoute();
    var key = r.name === "especialidade" ? "esp-" + r.id : r.name;
    document.querySelectorAll(".sidebar a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === key);
    });
  }

  function renderLastUpdate() {
    document.getElementById("lastUpdate").textContent =
      "Última atualização: " + (state.atualizadoEm ? fmtDate(state.atualizadoEm) : "dados base " + BASE.versao.split("-").reverse().join("/"));
  }

  function parseRoute() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("?");
    var seg = parts[0].split("/");
    var q = {};
    (parts[1] || "").split("&").forEach(function (kv) {
      if (!kv) return;
      var p = kv.split("=");
      q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || "");
    });
    if (seg[0] === "especialidade") return { name: "especialidade", id: seg[1], q: q };
    if (seg[0] === "atualizar") return { name: "atualizar", q: q };
    if (seg[0] === "historico") return { name: "historico", q: q };
    return { name: "home", q: q };
  }

  // ---------- Páginas ----------
  function pageHome() {
    var all = { urgente: 0, prioritario: 0, eletivo: 0, total: 0 };
    var specs = state.especialidades.map(function (e) {
      var t = totals(e);
      PRI.forEach(function (p) { all[p.id] += t[p.id]; });
      all.total += t.total;
      return { esp: e, t: t };
    });
    var nEsp = state.especialidades.reduce(function (a, e) { return a + e.especialistas.length; }, 0);

    var byName = specs.slice().sort(function (a, b) { return a.esp.nome.localeCompare(b.esp.nome, "pt-BR"); });
    var byTotal = specs.slice().sort(function (a, b) { return b.t.total - a.t.total; });

    var locTotals = LOCS.map(function (loc) {
      var parts = { urgente: 0, prioritario: 0, eletivo: 0 };
      state.especialidades.forEach(function (e) {
        var f = e.fila[loc] || [0, 0, 0];
        parts.urgente += f[0]; parts.prioritario += f[1]; parts.eletivo += f[2];
      });
      return { label: loc, value: parts.urgente + parts.prioritario + parts.eletivo, parts: parts };
    }).sort(function (a, b) { return b.value - a.value; });

    var specRows = byTotal.map(function (s) {
      return { label: s.esp.nome, value: s.t.total, parts: s.t, href: "#/especialidade/" + s.esp.id };
    });

    app.innerHTML = notice() +
      '<div class="page-head"><div><h1>Painel geral da regulação</h1>' +
      "<p>Fila de espera por especialidade na rede municipal de saúde de Goiana.</p></div>" +
      '<a class="btn" href="#/atualizar">Atualizar cadastro</a></div>' +

      '<div class="grid kpis">' +
      kpi("Pacientes na fila", all.total, "em " + state.especialidades.length + " especialidades", "hero") +
      PRI.map(function (p) { return kpi(p.nome, all[p.id], pct(all[p.id], all.total) + " da fila", "", p.id); }).join("") +
      kpi("Especialistas", nEsp, "profissionais cadastrados") +
      "</div>" +

      '<div class="grid two-col">' +
      '<section class="card"><h2>Fila por especialidade</h2><div id="chartEsp">' + hbar(specRows) + "</div></section>" +
      '<section class="card"><h2>Fila por localidade</h2><div id="chartLoc">' + hbar(locTotals) + "</div></section>" +
      "</div>" +

      '<h2 style="margin:8px 0 12px">Especialidades</h2>' +
      '<div class="grid spec-grid">' + byName.map(function (s) {
        return '<a class="card spec-card" href="#/especialidade/' + s.esp.id + '">' +
          '<div class="top"><span class="spec-icon" aria-hidden="true">' + esc(s.esp.icone || "✚") + "</span><h3>" + esc(s.esp.nome) + "</h3></div>" +
          '<div class="total">' + fmt(s.t.total) + " <small>pacientes aguardando</small></div>" +
          stackbar(s.t) + priLegend(s.t) +
          "</a>";
      }).join("") + "</div>";

    bindTooltips(document.getElementById("chartEsp"), specRows);
    bindTooltips(document.getElementById("chartLoc"), locTotals);
  }

  function pct(a, b) { return b ? Math.round((a / b) * 100) + "%" : "0%"; }

  function kpi(label, value, sub, cls, dot) {
    return '<div class="card kpi ' + (cls || "") + '"><div class="label">' +
      (dot ? '<i class="dot ' + dot + '"></i>' : "") + esc(label) + '</div><div class="value">' + fmt(value) +
      '</div><div class="sub">' + esc(sub || "") + "</div></div>";
  }

  function pageEspecialidade(id) {
    var esp = getEsp(id);
    if (!esp) { app.innerHTML = '<div class="card empty">Especialidade não encontrada. <a href="#/">Voltar ao painel</a></div>'; return; }
    var t = totals(esp);

    var rows = LOCS.map(function (loc) {
      var f = esp.fila[loc] || [0, 0, 0];
      return { label: loc, value: sum(f), parts: { urgente: f[0], prioritario: f[1], eletivo: f[2] } };
    }).sort(function (a, b) { return b.value - a.value; });
    var comFila = rows.filter(function (r) { return r.value > 0; }).length;

    var hist = state.historico.filter(function (h) { return h.especialidade === id; }).slice(0, 5);

    app.innerHTML = notice() +
      '<div class="page-head"><div><h1><span class="spec-icon" style="display:inline-grid;vertical-align:middle;margin-right:8px" aria-hidden="true">' +
      esc(esp.icone || "✚") + "</span>" + esc(esp.nome) + "</h1>" +
      "<p>Dashboard da fila de espera, localidades, especialistas e horários de atendimento.</p></div>" +
      '<a class="btn" href="#/atualizar?esp=' + esp.id + '">Atualizar esta fila</a></div>' +

      '<div class="grid kpis">' +
      kpi("Pacientes na fila", t.total, comFila + " localidades com demanda", "hero") +
      PRI.map(function (p) { return kpi(p.nome, t[p.id], pct(t[p.id], t.total) + " da fila", "", p.id); }).join("") +
      kpi("Especialistas", esp.especialistas.length, "atendendo esta especialidade") +
      "</div>" +

      '<div class="grid two-col">' +
      '<section class="card"><h2>Fila por localidade</h2><div id="chartLoc">' + hbar(rows) + "</div></section>" +
      '<section class="card"><h2>Especialistas e horários</h2>' + especialistasList(esp) + "</section>" +
      "</div>" +

      '<div class="grid two-col">' +
      '<section class="card"><h2>Detalhamento por localidade</h2><div class="table-wrap"><table><thead><tr><th>Localidade</th>' +
      PRI.map(function (p) { return '<th class="num">' + p.nome + "</th>"; }).join("") +
      '<th class="num">Total</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return "<tr><td>" + esc(r.label) + "</td>" + PRI.map(function (p) { return '<td class="num">' + fmt(r.parts[p.id]) + "</td>"; }).join("") +
          '<td class="num"><strong>' + fmt(r.value) + "</strong></td></tr>";
      }).join("") +
      "</tbody><tfoot><tr><td>Total</td>" + PRI.map(function (p) { return '<td class="num">' + fmt(t[p.id]) + "</td>"; }).join("") +
      '<td class="num">' + fmt(t.total) + "</td></tr></tfoot></table></div></section>" +
      '<section class="card"><h2>Últimas atualizações</h2>' + histList(hist, false) +
      '<div class="actions"><a class="btn secondary small" href="#/historico?esp=' + esp.id + '">Ver histórico completo</a></div></section>' +
      "</div>";

    bindTooltips(document.getElementById("chartLoc"), rows);
  }

  function especialistasList(esp) {
    if (!esp.especialistas.length) return '<div class="empty">Nenhum especialista cadastrado.</div>';
    return '<ul class="spec-list">' + esp.especialistas.map(function (s) {
      return '<li><div class="who">' + esc(s.nome) + "</div>" +
        '<div class="meta">' + esc(s.local) + "</div>" +
        '<div class="meta"><span class="badge">' + esc(s.dias) + "</span> " + esc(s.horario) + "</div></li>";
    }).join("") + "</ul>";
  }

  function histList(list, showEsp) {
    if (!list.length) return '<div class="empty">Nenhuma atualização registrada.</div>';
    return '<div class="table-wrap"><table><thead><tr><th>Data</th>' + (showEsp ? "<th>Especialidade</th>" : "") +
      '<th>Localidade</th><th>Prioridade</th><th class="num">Variação</th><th class="num">Fila após</th><th>Motivo</th><th>Responsável</th></tr></thead><tbody>' +
      list.map(function (h) {
        var e = getEsp(h.especialidade);
        var cls = h.delta > 0 ? "delta-pos" : h.delta < 0 ? "delta-neg" : "";
        return "<tr><td>" + fmtDate(h.data) + "</td>" +
          (showEsp ? "<td>" + esc(e ? e.nome : h.especialidade) + "</td>" : "") +
          "<td>" + esc(h.localidade) + '</td><td><i class="dot ' + h.prioridade + '"></i> ' + esc(priNome(h.prioridade)) + "</td>" +
          '<td class="num ' + cls + '">' + (h.delta > 0 ? "+" : "") + fmt(h.delta) + "</td>" +
          '<td class="num">' + fmt(h.depois) + "</td><td>" + esc(h.motivo) + "</td><td>" + esc(h.responsavel || "—") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function priNome(id) {
    for (var i = 0; i < PRI.length; i++) if (PRI[i].id === id) return PRI[i].nome;
    return id;
  }
  function priIdx(id) {
    for (var i = 0; i < PRI.length; i++) if (PRI[i].id === id) return i;
    return -1;
  }

  function pageHistorico(q) {
    var list = q.esp ? state.historico.filter(function (h) { return h.especialidade === q.esp; }) : state.historico;
    var e = q.esp ? getEsp(q.esp) : null;
    app.innerHTML =
      '<div class="page-head"><div><h1>Histórico de atualizações</h1><p>' +
      (e ? "Especialidade: <strong>" + esc(e.nome) + '</strong> · <a href="#/historico">ver todas</a>' : "Todas as alterações feitas na fila de espera.") +
      '</p></div><a class="btn" href="#/atualizar">Atualizar cadastro</a></div>' +
      '<section class="card">' + histList(list, !q.esp) + "</section>";
  }

  // ---------- Atualizar cadastro ----------
  var tabAtual = "fila";

  function pageAtualizar(q) {
    if (q.tab) tabAtual = q.tab;
    var tabs = [["fila", "Fila de espera"], ["especialistas", "Especialistas e horários"], ["dados", "Dados e backup"]];
    app.innerHTML =
      '<div class="page-head"><div><h1>Atualizar cadastro</h1>' +
      "<p>As alterações atualizam imediatamente os números da fila de espera e os dashboards.</p></div></div>" +
      '<div class="tabs" role="tablist">' + tabs.map(function (t) {
        return '<button role="tab" data-tab="' + t[0] + '" class="' + (tabAtual === t[0] ? "active" : "") + '">' + t[1] + "</button>";
      }).join("") + '</div><div id="tabBody"></div>';

    app.querySelectorAll("[data-tab]").forEach(function (b) {
      b.addEventListener("click", function () { tabAtual = b.getAttribute("data-tab"); pageAtualizar({ esp: q.esp }); });
    });

    var body = document.getElementById("tabBody");
    if (tabAtual === "fila") tabFila(body, q);
    else if (tabAtual === "especialistas") tabEspecialistas(body, q);
    else tabDados(body);
  }

  function espOptions(sel) {
    return state.especialidades.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); })
      .map(function (e) { return '<option value="' + e.id + '"' + (e.id === sel ? " selected" : "") + ">" + esc(e.nome) + "</option>"; }).join("");
  }

  function tabFila(body, q) {
    body.innerHTML =
      '<form class="card" id="formFila" autocomplete="off">' +
      '<div class="fields">' +
      '<label>Especialidade<select name="esp" required>' + espOptions(q.esp) + "</select></label>" +
      '<label>Localidade<select name="loc" required>' + LOCS.map(function (l) { return "<option>" + esc(l) + "</option>"; }).join("") + "</select></label>" +
      '<label>Prioridade<select name="pri">' + PRI.map(function (p) { return '<option value="' + p.id + '">' + p.nome + "</option>"; }).join("") + "</select></label>" +
      "</div>" +
      '<div style="margin-top:14px"><label>Tipo de atualização</label><div class="seg" style="margin-top:6px">' +
      '<label><input type="radio" name="op" value="add" checked> Aumentar (novos pacientes)</label>' +
      '<label><input type="radio" name="op" value="sub"> Diminuir (atendidos / desistências)</label>' +
      '<label><input type="radio" name="op" value="set"> Definir valor exato</label>' +
      "</div></div>" +
      '<div class="fields" style="margin-top:14px">' +
      '<label>Quantidade<input type="number" name="qtd" min="0" step="1" value="1" required></label>' +
      '<label>Motivo<select name="motivo">' +
      "<option>Inclusão de novos encaminhamentos</option><option>Pacientes atendidos</option>" +
      "<option>Desistência / não localizado</option><option>Transferência de fila</option><option>Revisão / conferência de cadastro</option>" +
      "</select></label>" +
      '<label>Responsável<input type="text" name="resp" maxlength="80" placeholder="Nome de quem atualiza"></label>' +
      "</div>" +
      '<div class="actions"><button class="btn" type="submit">Salvar atualização</button>' +
      '<span class="preview" id="preview"></span></div>' +
      "</form>" +
      '<section class="card" style="margin-top:16px"><h2>Fila atual da especialidade</h2><div id="filaAtual"></div></section>';

    var form = document.getElementById("formFila");
    var lastMotivoAuto = true;

    function current() {
      var esp = getEsp(form.esp.value);
      var f = esp.fila[form.loc.value] || [0, 0, 0];
      var i = priIdx(form.pri.value);
      var qtd = Math.max(0, parseInt(form.qtd.value, 10) || 0);
      var op = form.op.value;
      var antes = f[i];
      var depois = op === "add" ? antes + qtd : op === "sub" ? Math.max(0, antes - qtd) : qtd;
      return { esp: esp, i: i, antes: antes, depois: depois, qtd: qtd, op: op };
    }

    function update() {
      var c = current();
      var d = c.depois - c.antes;
      document.getElementById("preview").innerHTML =
        "Fila " + esc(priNome(form.pri.value).toLowerCase()) + " em " + esc(form.loc.value) + ": <strong>" + fmt(c.antes) +
        "</strong> → <strong>" + fmt(c.depois) + '</strong> <span class="' + (d > 0 ? "delta-pos" : d < 0 ? "delta-neg" : "") + '">(' +
        (d > 0 ? "+" : "") + fmt(d) + ")</span>" +
        (c.op === "sub" && c.qtd > c.antes ? " · limitado a zero" : "");
      renderFilaAtual(c.esp);
    }

    function renderFilaAtual(esp) {
      var t = totals(esp);
      document.getElementById("filaAtual").innerHTML =
        '<div class="table-wrap"><table><thead><tr><th>Localidade</th>' +
        PRI.map(function (p) { return '<th class="num">' + p.nome + "</th>"; }).join("") + '<th class="num">Total</th></tr></thead><tbody>' +
        LOCS.map(function (loc) {
          var f = esp.fila[loc] || [0, 0, 0];
          var hl = loc === form.loc.value ? ' style="background:var(--brand-soft)"' : "";
          return "<tr" + hl + "><td>" + esc(loc) + "</td>" + f.map(function (v) { return '<td class="num">' + fmt(v) + "</td>"; }).join("") +
            '<td class="num"><strong>' + fmt(sum(f)) + "</strong></td></tr>";
        }).join("") +
        "</tbody><tfoot><tr><td>Total</td>" + PRI.map(function (p) { return '<td class="num">' + fmt(t[p.id]) + "</td>"; }).join("") +
        '<td class="num">' + fmt(t.total) + "</td></tr></tfoot></table></div>" +
        '<div class="actions"><a class="btn secondary small" href="#/especialidade/' + esp.id + '">Abrir dashboard de ' + esc(esp.nome) + "</a></div>";
    }

    form.motivo.addEventListener("change", function () { lastMotivoAuto = false; });
    form.addEventListener("change", function (ev) {
      if (ev.target.name === "op" && lastMotivoAuto) {
        form.motivo.value = form.op.value === "add" ? "Inclusão de novos encaminhamentos"
          : form.op.value === "sub" ? "Pacientes atendidos" : "Revisão / conferência de cadastro";
      }
      update();
    });
    form.addEventListener("input", update);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var c = current();
      if (c.depois === c.antes) { toast("Nenhuma alteração: o valor permanece " + fmt(c.antes) + "."); return; }
      var f = filaLoc(c.esp, form.loc.value);
      f[c.i] = c.depois;
      state.historico.unshift({
        data: new Date().toISOString(),
        especialidade: c.esp.id,
        localidade: form.loc.value,
        prioridade: form.pri.value,
        antes: c.antes,
        depois: c.depois,
        delta: c.depois - c.antes,
        motivo: form.motivo.value,
        responsavel: form.resp.value.trim(),
      });
      save();
      toast(c.esp.nome + " · " + form.loc.value + ": fila atualizada para " + fmt(c.depois) + ".");
      update();
    });
    update();
  }

  function tabEspecialistas(body, q) {
    var espId = q.esp || state.especialidades[0].id;
    body.innerHTML =
      '<div class="card"><div class="fields"><label>Especialidade<select id="selEsp">' + espOptions(espId) + "</select></label></div></div>" +
      '<section class="card" style="margin-top:16px"><h2>Especialistas cadastrados</h2><div id="listaEsp"></div></section>' +
      '<form class="card" id="formEsp" style="margin-top:16px" autocomplete="off"><h2 id="formEspTitle">Adicionar especialista</h2>' +
      '<input type="hidden" name="idx" value="">' +
      '<div class="fields">' +
      '<label>Nome do especialista<input name="nome" required maxlength="100" placeholder="Dr(a). Nome Sobrenome"></label>' +
      '<label>Local de atendimento<input name="local" required maxlength="100" placeholder="Ex.: Policlínica Municipal"></label>' +
      '<label>Dias de atendimento<input name="dias" required maxlength="60" placeholder="Ex.: Seg e Qua"></label>' +
      '<label>Horário<input name="horario" required maxlength="40" placeholder="Ex.: 07:00 – 11:00"></label>' +
      "</div>" +
      '<div class="actions"><button class="btn" type="submit">Salvar especialista</button>' +
      '<button class="btn secondary" type="button" id="cancelEdit" hidden>Cancelar edição</button></div></form>' +
      '<form class="card" id="formNovaEsp" style="margin-top:16px" autocomplete="off"><h2>Nova especialidade</h2>' +
      '<div class="fields"><label>Nome da especialidade<input name="nome" required maxlength="60"></label></div>' +
      '<div class="actions"><button class="btn secondary" type="submit">Criar especialidade</button></div></form>';

    var sel = document.getElementById("selEsp");
    var form = document.getElementById("formEsp");
    var cancel = document.getElementById("cancelEdit");

    function resetForm() {
      form.reset(); form.idx.value = "";
      document.getElementById("formEspTitle").textContent = "Adicionar especialista";
      cancel.hidden = true;
    }

    function renderLista() {
      var esp = getEsp(sel.value);
      var box = document.getElementById("listaEsp");
      if (!esp.especialistas.length) { box.innerHTML = '<div class="empty">Nenhum especialista cadastrado.</div>'; return; }
      box.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Local</th><th>Dias</th><th>Horário</th><th></th></tr></thead><tbody>' +
        esp.especialistas.map(function (s, i) {
          return "<tr><td>" + esc(s.nome) + "</td><td>" + esc(s.local) + "</td><td>" + esc(s.dias) + "</td><td>" + esc(s.horario) + "</td>" +
            '<td style="white-space:nowrap"><button class="btn secondary small" data-edit="' + i + '">Editar</button> ' +
            '<button class="btn danger small" data-del="' + i + '">Remover</button></td></tr>';
        }).join("") + "</tbody></table></div>";
      box.querySelectorAll("[data-edit]").forEach(function (b) {
        b.addEventListener("click", function () {
          var i = Number(b.getAttribute("data-edit")), s = esp.especialistas[i];
          form.idx.value = i; form.nome.value = s.nome; form.local.value = s.local; form.dias.value = s.dias; form.horario.value = s.horario;
          document.getElementById("formEspTitle").textContent = "Editar especialista";
          cancel.hidden = false;
          form.nome.focus();
        });
      });
      box.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          var i = Number(b.getAttribute("data-del"));
          if (!confirm("Remover " + esp.especialistas[i].nome + " de " + esp.nome + "?")) return;
          esp.especialistas.splice(i, 1);
          save(); resetForm(); renderLista();
          toast("Especialista removido.");
        });
      });
    }

    sel.addEventListener("change", function () { resetForm(); renderLista(); });
    cancel.addEventListener("click", resetForm);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var esp = getEsp(sel.value);
      var s = { nome: form.nome.value.trim(), local: form.local.value.trim(), dias: form.dias.value.trim(), horario: form.horario.value.trim() };
      if (form.idx.value !== "") esp.especialistas[Number(form.idx.value)] = s;
      else esp.especialistas.push(s);
      save(); resetForm(); renderLista();
      toast("Especialista salvo em " + esp.nome + ".");
    });

    document.getElementById("formNovaEsp").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nome = ev.target.nome.value.trim();
      var id = slug(nome);
      if (!id) return;
      if (getEsp(id)) { toast("Essa especialidade já existe."); return; }
      var fila = {};
      LOCS.forEach(function (l) { fila[l] = [0, 0, 0]; });
      state.especialidades.push({ id: id, nome: nome, icone: "✚", especialistas: [], fila: fila });
      save();
      toast("Especialidade " + nome + " criada.");
      pageAtualizar({ esp: id, tab: "especialistas" });
    });

    renderLista();
  }

  function tabDados(body) {
    body.innerHTML =
      '<section class="card"><h2>Backup e publicação dos dados</h2>' +
      '<p class="preview">As atualizações ficam salvas neste navegador. Para compartilhar os números atualizados com outros computadores, ' +
      "exporte o arquivo e importe-o nos demais, ou envie-o à equipe técnica para atualizar a base publicada.</p>" +
      '<div class="actions">' +
      '<button class="btn" id="btnExport" type="button">Exportar dados (JSON)</button>' +
      '<label class="btn secondary" style="flex-direction:row;font-weight:600">Importar dados<input type="file" id="fileImport" accept="application/json,.json" hidden></label>' +
      '<button class="btn secondary" id="btnCsv" type="button">Exportar fila (CSV)</button>' +
      '<button class="btn danger" id="btnReset" type="button">Restaurar dados base</button>' +
      "</div></section>";

    document.getElementById("btnExport").addEventListener("click", function () {
      download("portal-regulacao-goiana-" + new Date().toISOString().slice(0, 10) + ".json",
        JSON.stringify(state, null, 2), "application/json");
    });
    document.getElementById("btnCsv").addEventListener("click", function () {
      var lines = [["Especialidade", "Localidade"].concat(PRI.map(function (p) { return p.nome; })).concat(["Total"]).join(";")];
      state.especialidades.forEach(function (e) {
        LOCS.forEach(function (loc) {
          var f = e.fila[loc] || [0, 0, 0];
          lines.push([e.nome, loc].concat(f).concat([sum(f)]).join(";"));
        });
      });
      download("fila-regulacao-goiana-" + new Date().toISOString().slice(0, 10) + ".csv", "﻿" + lines.join("\n"), "text/csv");
    });
    document.getElementById("fileImport").addEventListener("change", function (ev) {
      var file = ev.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var s = JSON.parse(reader.result);
          if (!s || !Array.isArray(s.especialidades)) throw new Error("formato");
          if (!Array.isArray(s.historico)) s.historico = [];
          state = s;
          save();
          toast("Dados importados com sucesso.");
        } catch (e) {
          toast("Arquivo inválido.");
        }
      };
      reader.readAsText(file);
    });
    document.getElementById("btnReset").addEventListener("click", function () {
      if (!confirm("Descartar todas as atualizações feitas neste navegador e voltar aos dados base?")) return;
      state = baseState();
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignora */ }
      renderNav(); renderLastUpdate();
      toast("Dados base restaurados.");
    });
  }

  function download(name, content, type) {
    var blob = new Blob([content], { type: type });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  // ---------- Roteador ----------
  function route() {
    var r = parseRoute();
    if (tipEl) tipEl.style.display = "none";
    if (r.name === "especialidade") pageEspecialidade(r.id);
    else if (r.name === "atualizar") pageAtualizar(r.q);
    else if (r.name === "historico") pageHistorico(r.q);
    else pageHome();
    highlightNav();
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
  }

  document.getElementById("menuToggle").addEventListener("click", function () {
    var sb = document.getElementById("sidebar");
    var open = sb.classList.toggle("open");
    this.setAttribute("aria-expanded", String(open));
  });

  window.addEventListener("hashchange", route);
  renderNav();
  renderLastUpdate();
  route();
})();
