(function () {
  "use strict";

  var BASE = window.PORTAL_DATA;
  var STORE_KEY = "portal-regulacao-goiana:v2";
  var UNIDADES = BASE.UNIDADES;
  var DIAS = [["segunda", "Seg"], ["terca", "Ter"], ["quarta", "Qua"], ["quinta", "Qui"], ["sexta", "Sex"]];
  var CATEGORIAS = { consulta: "Consultas especializadas", exame: "Exames" };

  // ---------- Estado ----------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baseState() {
    return { versaoBase: BASE.versao, atualizadoEm: null, servicos: clone(BASE.SERVICOS), historico: [] };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && Array.isArray(s.servicos)) return s;
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

  function getServ(id) {
    for (var i = 0; i < state.servicos.length; i++) if (state.servicos[i].id === id) return state.servicos[i];
    return null;
  }

  function byName(a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); }

  // Situação do serviço a partir da fila e do tempo médio para agendamento
  function status(s) {
    if (s.oferta == null && s.tempoMedio == null) return { id: "off", nome: "Atendimento suspenso" };
    if (!s.fila) return { id: "good", nome: "Sem fila de espera" };
    if (s.tempoMedio == null) return { id: "off", nome: "Tempo não informado" };
    if (s.tempoMedio <= 15) return { id: "good", nome: "Espera curta" };
    if (s.tempoMedio <= 60) return { id: "warn", nome: "Espera moderada" };
    return { id: "crit", nome: "Espera longa" };
  }

  // ---------- Utilidades ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(n) { return n == null ? "—" : Number(n).toLocaleString("pt-BR"); }
  function fmtDias(n) { return n == null ? "—" : fmt(n) + (n === 1 ? " dia" : " dias"); }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function meses(s) { return s.oferta ? s.fila / s.oferta : null; }
  function fmtMeses(s) {
    var m = meses(s);
    if (m == null) return "—";
    return m.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  }

  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3200);
  }

  // Confirmação dentro da página (sem depender de window.confirm)
  function confirmar(msg, rotulo, onOk) {
    var box = document.createElement("div");
    box.className = "modal-backdrop";
    box.innerHTML = '<div class="modal" role="alertdialog" aria-modal="true"><p>' + esc(msg) + "</p>" +
      '<div class="actions"><button class="btn danger" type="button" data-ok>' + esc(rotulo) + "</button>" +
      '<button class="btn secondary" type="button" data-cancel>Cancelar</button></div></div>';
    function fechar() { box.remove(); }
    box.querySelector("[data-ok]").addEventListener("click", function () { fechar(); onOk(); });
    box.querySelector("[data-cancel]").addEventListener("click", fechar);
    box.addEventListener("click", function (ev) { if (ev.target === box) fechar(); });
    document.body.appendChild(box);
    box.querySelector("[data-cancel]").focus();
  }

  var app = document.getElementById("app");

  function pill(st) { return '<span class="pill ' + st.id + '"><i class="dot ' + st.id + '"></i>' + esc(st.nome) + "</span>"; }
  function unidadeChips(locais) {
    return '<div class="chips">' + locais.map(function (u) {
      return '<span class="chip" title="' + esc(UNIDADES[u] || u) + '">' + esc(shortUnit(u)) + "</span>";
    }).join("") + "</div>";
  }
  function shortUnit(u) { return u === "PNSV" || u === "CSM" ? u : (UNIDADES[u] || u); }

  function kpi(label, value, sub, cls) {
    return '<div class="card kpi ' + (cls || "") + '"><div class="label">' + esc(label) + '</div><div class="value">' + value +
      '</div><div class="sub">' + (sub || "") + "</div></div>";
  }

  // Gráfico de barras horizontal (série única) com tooltip
  function hbar(rows) {
    if (!rows.length) return '<div class="empty">Nenhum serviço com fila de espera.</div>';
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([1]));
    return '<div class="hbar">' + rows.map(function (r, i) {
      return '<div class="name">' + (r.href ? '<a href="' + r.href + '">' + esc(r.label) + "</a>" : esc(r.label)) + "</div>" +
        '<div class="track" data-tip="' + i + '"><div class="fill" style="width:' + (r.value / max) * 100 + '%"></div></div>' +
        '<div class="val">' + fmt(r.value) + "</div>";
    }).join("") + "</div>";
  }

  var tipEl;
  function bindTooltips(container, rows) {
    if (!container) return;
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.className = "tooltip";
      document.body.appendChild(tipEl);
    }
    container.querySelectorAll("[data-tip]").forEach(function (el) {
      var r = rows[Number(el.getAttribute("data-tip"))];
      el.addEventListener("mousemove", function (ev) {
        tipEl.innerHTML = "<b>" + esc(r.label) + "</b>" + r.tip.map(function (t) {
          return '<div class="row"><span>' + t[0] + "</span><span>" + t[1] + "</span></div>";
        }).join("");
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

  function servRow(s) {
    var st = status(s);
    return {
      label: s.nome, value: s.fila, href: "#/servico/" + s.id,
      tip: [
        ["Fila de espera", fmt(s.fila)],
        ["Oferta média/mês", fmt(s.oferta)],
        ["Tempo médio", fmtDias(s.tempoMedio)],
        ["Situação", '<i class="dot ' + st.id + '"></i> ' + esc(st.nome)],
      ],
    };
  }

  // ---------- Navegação ----------
  function renderNav() {
    var nav = document.getElementById("navServicos");
    nav.innerHTML = Object.keys(CATEGORIAS).map(function (cat) {
      return '<div class="nav-title">' + CATEGORIAS[cat] + "</div>" +
        state.servicos.filter(function (s) { return s.categoria === cat; }).sort(byName).map(function (s) {
          return '<a href="#/servico/' + s.id + '" data-nav="serv-' + s.id + '"><span>' + esc(s.nome) + "</span>" +
            '<span class="count"><i class="dot ' + status(s).id + '"></i>' + fmt(s.fila) + "</span></a>";
        }).join("");
    }).join("");
    highlightNav();
  }

  function highlightNav() {
    var r = parseRoute();
    var key = r.name === "servico" ? "serv-" + r.id : r.name;
    document.querySelectorAll(".sidebar a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === key);
    });
  }

  function renderLastUpdate() {
    document.getElementById("lastUpdate").textContent =
      "Última atualização: " + (state.atualizadoEm ? fmtDate(state.atualizadoEm) : BASE.versao.split("-").reverse().join("/"));
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
    if (seg[0] === "servico") return { name: "servico", id: seg[1], q: q };
    if (seg[0] === "atualizar") return { name: "atualizar", q: q };
    if (seg[0] === "historico") return { name: "historico", q: q };
    return { name: "home", q: q };
  }

  // ---------- Painel geral ----------
  var filtro = { unidade: "", busca: "" };

  function pageHome() {
    var cons = state.servicos.filter(function (s) { return s.categoria === "consulta"; });
    var exam = state.servicos.filter(function (s) { return s.categoria === "exame"; });
    function soma(list, k) { return list.reduce(function (a, s) { return a + (s[k] || 0); }, 0); }
    var longas = state.servicos.filter(function (s) { return status(s).id === "crit"; }).length;

    app.innerHTML =
      '<div class="page-head"><div><h1>Painel geral da regulação</h1>' +
      "<p>Rede própria de especialidades médicas e exames do município de Goiana que podem ser agendados pelo SISREG.</p></div>" +
      '<a class="btn" href="#/atualizar">Atualizar cadastro</a></div>' +

      '<div class="grid kpis">' +
      kpi("Aguardando consulta", fmt(soma(cons, "fila")), fmt(soma(cons, "oferta")) + " consultas ofertadas/mês", "hero") +
      kpi("Aguardando exame", fmt(soma(exam, "fila")), fmt(soma(exam, "oferta")) + " exames ofertados/mês", "hero") +
      kpi("Serviços ofertados", fmt(state.servicos.length), cons.length + " especialidades · " + exam.length + " exames") +
      kpi("Com espera longa", fmt(longas), "tempo médio acima de 60 dias", longas ? "alert" : "") +
      "</div>" +

      '<div class="card filters"><div class="filter-row">' +
      '<label class="grow" for="busca">Buscar especialidade, exame ou médico<input id="busca" type="search" placeholder="Ex.: cardiologia, USG, Lindair" value="' + esc(filtro.busca) + '"></label>' +
      '<label for="fUnidade">Unidade de atendimento<select id="fUnidade"><option value="">Todas as unidades</option>' +
      Object.keys(UNIDADES).map(function (u) { return '<option value="' + u + '"' + (filtro.unidade === u ? " selected" : "") + ">" + esc(UNIDADES[u]) + "</option>"; }).join("") +
      "</select></label></div></div>" +
      '<div id="homeBody"></div>';

    document.getElementById("busca").addEventListener("input", function (ev) { filtro.busca = ev.target.value; renderHomeBody(); });
    document.getElementById("fUnidade").addEventListener("change", function (ev) { filtro.unidade = ev.target.value; renderHomeBody(); });
    renderHomeBody();
  }

  function renderHomeBody() {
    var b = norm(filtro.busca.trim());
    var list = state.servicos.filter(function (s) {
      if (filtro.unidade && s.locais.indexOf(filtro.unidade) < 0) return false;
      if (!b) return true;
      return norm(s.nome).indexOf(b) >= 0 || s.medicos.some(function (m) { return norm(m.nome).indexOf(b) >= 0; }) || norm(s.obs).indexOf(b) >= 0;
    });
    var body = document.getElementById("homeBody");
    if (!list.length) { body.innerHTML = '<div class="card empty">Nenhum serviço encontrado com esses filtros.</div>'; return; }

    var charts = [], html = '<div class="grid two-col">';
    Object.keys(CATEGORIAS).forEach(function (cat) {
      var rows = list.filter(function (s) { return s.categoria === cat && s.fila > 0; })
        .sort(function (a, b) { return b.fila - a.fila; }).map(servRow);
      charts.push(rows);
      html += '<section class="card"><h2>Fila de espera · ' + CATEGORIAS[cat].toLowerCase() + '</h2><div id="chart-' + cat + '">' + hbar(rows) + "</div></section>";
    });
    html += "</div>";

    Object.keys(CATEGORIAS).forEach(function (cat) {
      var items = list.filter(function (s) { return s.categoria === cat; }).sort(byName);
      if (!items.length) return;
      html += '<h2 class="section-title">' + CATEGORIAS[cat] + ' <small>' + items.length + "</small></h2>" +
        '<div class="grid spec-grid">' + items.map(card).join("") + "</div>";
    });
    html += legenda();
    body.innerHTML = html;
    Object.keys(CATEGORIAS).forEach(function (cat, i) { bindTooltips(document.getElementById("chart-" + cat), charts[i]); });
  }

  function card(s) {
    var st = status(s);
    return '<a class="card spec-card st-' + st.id + '" href="#/servico/' + s.id + '">' +
      '<div class="top"><h3>' + esc(s.nome) + "</h3></div>" + pill(st) +
      '<div class="total">' + fmt(s.fila) + " <small>na fila</small></div>" +
      '<dl class="facts"><div><dt>Tempo médio</dt><dd>' + fmtDias(s.tempoMedio) + "</dd></div>" +
      "<div><dt>Oferta/mês</dt><dd>" + fmt(s.oferta) + "</dd></div>" +
      "<div><dt>Médicos</dt><dd>" + s.medicos.length + "</dd></div></dl>" +
      unidadeChips(s.locais) + "</a>";
  }

  function legenda() {
    return '<div class="card legend-card"><h2>Legenda</h2><div class="legend-grid">' +
      "<div><strong>Situação da fila</strong><ul>" +
      "<li>" + pill({ id: "good", nome: "Sem fila / espera curta" }) + " até 15 dias</li>" +
      "<li>" + pill({ id: "warn", nome: "Espera moderada" }) + " de 16 a 60 dias</li>" +
      "<li>" + pill({ id: "crit", nome: "Espera longa" }) + " acima de 60 dias</li>" +
      "<li>" + pill({ id: "off", nome: "Atendimento suspenso" }) + " sem oferta no momento</li></ul></div>" +
      "<div><strong>Unidades</strong><ul>" + Object.keys(UNIDADES).map(function (u) { return "<li>" + esc(UNIDADES[u]) + "</li>"; }).join("") + "</ul></div>" +
      "</div></div>";
  }

  // ---------- Dashboard do serviço ----------
  function diasDoMedico(m) {
    var d = norm(m.dias);
    return DIAS.filter(function (x) { return d.indexOf(x[0]) >= 0; }).map(function (x) { return x[0]; });
  }

  function agendaSemanal(s) {
    var semDia = s.medicos.filter(function (m) { return !diasDoMedico(m).length; });
    return '<div class="week">' + DIAS.map(function (d) {
      var ms = s.medicos.filter(function (m) { return diasDoMedico(m).indexOf(d[0]) >= 0; });
      return '<div class="day' + (ms.length ? " on" : "") + '"><div class="dname">' + d[1] + "</div>" +
        (ms.length ? ms.map(function (m) { return '<div class="doc">' + esc(m.nome) + "</div>"; }).join("") : '<div class="none">—</div>') + "</div>";
    }).join("") + "</div>" +
      (semDia.length ? '<p class="preview">Sem dia fixo: ' + semDia.map(function (m) { return esc(m.nome) + (m.dias && m.dias !== "—" ? " (" + esc(m.dias) + ")" : ""); }).join(", ") + ".</p>" : "");
  }

  function pageServico(id) {
    var s = getServ(id);
    if (!s) { app.innerHTML = '<div class="card empty">Serviço não encontrado. <a href="#/">Voltar ao painel</a></div>'; return; }
    var st = status(s);
    var hist = state.historico.filter(function (h) { return h.servico === id; }).slice(0, 6);
    var m = meses(s);

    app.innerHTML =
      '<div class="page-head"><div><div class="eyebrow">' + CATEGORIAS[s.categoria] + "</div><h1>" + esc(s.nome) + "</h1>" +
      '<div class="head-meta">' + pill(st) + '<span class="badge">Idade: ' + esc(s.idade) + "</span></div></div>" +
      '<a class="btn" href="#/atualizar?serv=' + s.id + '">Atualizar este serviço</a></div>' +

      '<div class="grid kpis">' +
      kpi("Fila de espera", fmt(s.fila), "pacientes aguardando agendamento", "hero st-" + st.id) +
      kpi("Tempo médio para agendamento", fmtDias(s.tempoMedio), "desde a inserção no SISREG") +
      kpi("Oferta média por mês", fmt(s.oferta), s.categoria === "exame" ? "exames ofertados" : "consultas ofertadas") +
      kpi("Fila ÷ oferta mensal", m == null ? "—" : fmtMeses(s) + " <small>meses</small>", "tempo para atender a fila atual sem novas entradas") +
      "</div>" +

      '<div class="grid two-col">' +
      '<section class="card"><h2>Agenda semanal dos médicos</h2>' + agendaSemanal(s) + "</section>" +
      '<section class="card"><h2>Onde é atendido</h2><ul class="spec-list">' +
      s.locais.map(function (u) { return '<li><div class="who">' + esc(UNIDADES[u] || u) + "</div></li>"; }).join("") + "</ul></section>" +
      "</div>" +

      '<div class="grid two-col">' +
      '<section class="card"><h2>Médicos e dias de atendimento</h2><div class="table-wrap"><table><thead><tr><th>Médico(a)</th><th>Dia de atendimento</th><th>Observação</th></tr></thead><tbody>' +
      s.medicos.map(function (x) { return "<tr><td><strong>" + esc(x.nome) + "</strong></td><td>" + esc(x.dias || "—") + "</td><td>" + esc(x.obs || "") + "</td></tr>"; }).join("") +
      "</tbody></table></div>" +
      (s.obs ? '<p class="obs"><strong>Observação:</strong> ' + esc(s.obs) + "</p>" : "") + "</section>" +
      '<section class="card"><h2>Fila × oferta mensal</h2>' +
      hbar([
        { label: "Fila de espera", value: s.fila, tip: [["Pacientes", fmt(s.fila)]] },
        { label: "Oferta por mês", value: s.oferta || 0, tip: [["Vagas/mês", fmt(s.oferta)]] },
      ]).replace(/data-tip="\d"/g, "") +
      '<p class="preview">' + (s.oferta ? (s.fila > s.oferta
        ? "A fila é maior que a oferta de um mês."
        : "A oferta de um mês cobre a fila atual.") : "Sem oferta informada no momento.") + "</p></section>" +
      "</div>" +

      '<section class="card"><h2>Últimas atualizações</h2>' + histList(hist, false) +
      '<div class="actions"><a class="btn secondary small" href="#/historico?serv=' + s.id + '">Ver histórico completo</a></div></section>';
  }

  function histList(list, showServ) {
    if (!list.length) return '<div class="empty">Nenhuma atualização registrada.</div>';
    return '<div class="table-wrap"><table><thead><tr><th>Data</th>' + (showServ ? "<th>Serviço</th>" : "") +
      '<th class="num">Fila antes</th><th class="num">Variação</th><th class="num">Fila depois</th><th class="num">Tempo médio</th><th>Motivo</th><th>Responsável</th></tr></thead><tbody>' +
      list.map(function (h) {
        var s = getServ(h.servico);
        var cls = h.delta > 0 ? "delta-pos" : h.delta < 0 ? "delta-neg" : "";
        var tempo = h.tempoDepois !== undefined && h.tempoDepois !== h.tempoAntes
          ? fmtDias(h.tempoAntes) + " → " + fmtDias(h.tempoDepois) : "";
        return "<tr><td>" + fmtDate(h.data) + "</td>" +
          (showServ ? '<td><a href="#/servico/' + h.servico + '">' + esc(s ? s.nome : h.servico) + "</a></td>" : "") +
          '<td class="num">' + fmt(h.antes) + '</td><td class="num ' + cls + '">' + (h.delta > 0 ? "+" : "") + fmt(h.delta) + "</td>" +
          '<td class="num">' + fmt(h.depois) + '</td><td class="num">' + tempo + "</td><td>" + esc(h.motivo) + "</td><td>" + esc(h.responsavel || "—") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function pageHistorico(q) {
    var list = q.serv ? state.historico.filter(function (h) { return h.servico === q.serv; }) : state.historico;
    var s = q.serv ? getServ(q.serv) : null;
    app.innerHTML =
      '<div class="page-head"><div><h1>Histórico de atualizações</h1><p>' +
      (s ? "Serviço: <strong>" + esc(s.nome) + '</strong> · <a href="#/historico">ver todos</a>' : "Todas as alterações feitas na fila de espera.") +
      '</p></div><a class="btn" href="#/atualizar">Atualizar cadastro</a></div>' +
      '<section class="card">' + histList(list, !q.serv) + "</section>";
  }

  // ---------- Atualizar cadastro ----------
  var tabAtual = "fila";

  function servOptions(sel) {
    return Object.keys(CATEGORIAS).map(function (cat) {
      return '<optgroup label="' + CATEGORIAS[cat] + '">' +
        state.servicos.filter(function (s) { return s.categoria === cat; }).sort(byName).map(function (s) {
          return '<option value="' + s.id + '"' + (s.id === sel ? " selected" : "") + ">" + esc(s.nome) + "</option>";
        }).join("") + "</optgroup>";
    }).join("");
  }

  function pageAtualizar(q) {
    if (q.tab) tabAtual = q.tab;
    var tabs = [["fila", "Fila de espera"], ["servico", "Médicos, unidades e oferta"], ["dados", "Dados e backup"]];
    app.innerHTML =
      '<div class="page-head"><div><h1>Atualizar cadastro</h1>' +
      "<p>As alterações atualizam imediatamente a fila de espera e os dashboards.</p></div></div>" +
      '<div class="tabs" role="tablist">' + tabs.map(function (t) {
        return '<button role="tab" data-tab="' + t[0] + '" class="' + (tabAtual === t[0] ? "active" : "") + '">' + t[1] + "</button>";
      }).join("") + '</div><div id="tabBody"></div>';

    app.querySelectorAll("[data-tab]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sel = document.getElementById("selServ");
        tabAtual = b.getAttribute("data-tab");
        pageAtualizar({ serv: sel ? sel.value : q.serv });
      });
    });

    var body = document.getElementById("tabBody");
    if (tabAtual === "fila") tabFila(body, q);
    else if (tabAtual === "servico") tabServico(body, q);
    else tabDados(body);
  }

  function tabFila(body, q) {
    body.innerHTML =
      '<form class="card" id="formFila" autocomplete="off">' +
      '<div class="fields"><label for="selServ">Especialidade ou exame<select id="selServ" name="serv" required>' + servOptions(q.serv) + "</select></label></div>" +
      '<div id="resumo" class="resumo"></div>' +
      '<fieldset class="seg-wrap"><legend>Tipo de atualização</legend><div class="seg">' +
      '<label><input type="radio" name="op" value="add" checked> Aumentar (novos pacientes)</label>' +
      '<label><input type="radio" name="op" value="sub"> Diminuir (agendados / desistências)</label>' +
      '<label><input type="radio" name="op" value="set"> Definir valor exato</label>' +
      "</div></fieldset>" +
      '<div class="fields">' +
      '<label for="qtd">Quantidade de pacientes<input id="qtd" type="number" name="qtd" min="0" step="1" value="1" required></label>' +
      '<label for="tempo">Tempo médio para agendamento (dias)<input id="tempo" type="number" name="tempo" min="0" step="1" placeholder="Manter atual"></label>' +
      '<label for="motivo">Motivo<select id="motivo" name="motivo">' +
      "<option>Novos pacientes inseridos no SISREG</option><option>Pacientes agendados</option>" +
      "<option>Desistência / não localizado</option><option>Revisão / conferência da fila</option>" +
      "</select></label>" +
      '<label for="resp">Responsável<input id="resp" type="text" name="resp" maxlength="80" placeholder="Nome de quem atualiza"></label>' +
      "</div>" +
      '<div class="actions"><button class="btn" type="submit">Salvar atualização</button>' +
      '<span class="preview" id="preview"></span></div>' +
      "</form>";

    var form = document.getElementById("formFila");
    var motivoAuto = true;

    function current() {
      var s = getServ(form.serv.value);
      var qtd = Math.max(0, parseInt(form.qtd.value, 10) || 0);
      var op = form.op.value;
      var depois = op === "add" ? s.fila + qtd : op === "sub" ? Math.max(0, s.fila - qtd) : qtd;
      var t = form.tempo.value === "" ? s.tempoMedio : Math.max(0, parseInt(form.tempo.value, 10) || 0);
      return { s: s, antes: s.fila, depois: depois, qtd: qtd, op: op, tempo: t };
    }

    function update() {
      var c = current(), d = c.depois - c.antes;
      var st = status(c.s);
      document.getElementById("resumo").innerHTML =
        "<div><span>Fila atual</span><strong>" + fmt(c.s.fila) + "</strong></div>" +
        "<div><span>Tempo médio</span><strong>" + fmtDias(c.s.tempoMedio) + "</strong></div>" +
        "<div><span>Oferta/mês</span><strong>" + fmt(c.s.oferta) + "</strong></div>" +
        "<div><span>Situação</span>" + pill(st) + "</div>" +
        '<div><a class="btn secondary small" href="#/servico/' + c.s.id + '">Abrir dashboard</a></div>';
      document.getElementById("preview").innerHTML =
        "Fila: <strong>" + fmt(c.antes) + "</strong> → <strong>" + fmt(c.depois) + '</strong> <span class="' +
        (d > 0 ? "delta-pos" : d < 0 ? "delta-neg" : "") + '">(' + (d > 0 ? "+" : "") + fmt(d) + ")</span>" +
        (c.op === "sub" && c.qtd > c.antes ? " · limitado a zero" : "") +
        (c.tempo !== c.s.tempoMedio ? " · tempo médio: " + fmtDias(c.s.tempoMedio) + " → " + fmtDias(c.tempo) : "");
    }

    form.motivo.addEventListener("change", function () { motivoAuto = false; });
    form.addEventListener("change", function (ev) {
      if (ev.target.name === "op" && motivoAuto) {
        form.motivo.value = form.op.value === "add" ? "Novos pacientes inseridos no SISREG"
          : form.op.value === "sub" ? "Pacientes agendados" : "Revisão / conferência da fila";
      }
      update();
    });
    form.addEventListener("input", update);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var c = current();
      if (c.depois === c.antes && c.tempo === c.s.tempoMedio) { toast("Nada mudou: a fila continua em " + fmt(c.antes) + "."); return; }
      state.historico.unshift({
        data: new Date().toISOString(), servico: c.s.id,
        antes: c.antes, depois: c.depois, delta: c.depois - c.antes,
        tempoAntes: c.s.tempoMedio, tempoDepois: c.tempo,
        motivo: form.motivo.value, responsavel: form.resp.value.trim(),
      });
      c.s.fila = c.depois;
      c.s.tempoMedio = c.tempo;
      save();
      form.tempo.value = "";
      toast(c.s.nome + ": fila atualizada para " + fmt(c.depois) + ".");
      update();
    });
    update();
  }

  function tabServico(body, q) {
    var servId = q.serv || state.servicos.slice().sort(byName)[0].id;
    body.innerHTML =
      '<div class="card"><div class="fields"><label for="selServ">Especialidade ou exame<select id="selServ">' + servOptions(servId) + "</select></label></div></div>" +
      '<form class="card" id="formDados" style="margin-top:16px" autocomplete="off"><h2>Dados do serviço</h2>' +
      '<div class="fields">' +
      '<label for="dIdade">Faixa etária<input id="dIdade" name="idade" maxlength="40"></label>' +
      '<label for="dOferta">Oferta média por mês<input id="dOferta" name="oferta" type="number" min="0" placeholder="Não informada"></label>' +
      '<label for="dTempo">Tempo médio para agendamento (dias)<input id="dTempo" name="tempo" type="number" min="0" placeholder="Não informado"></label>' +
      "</div>" +
      '<fieldset class="seg-wrap"><legend>Unidades de atendimento</legend><div class="seg" id="dLocais">' +
      Object.keys(UNIDADES).map(function (u) { return '<label><input type="checkbox" name="locais" value="' + u + '"> ' + esc(UNIDADES[u]) + "</label>"; }).join("") +
      "</div></fieldset>" +
      '<label for="dObs">Observação<textarea id="dObs" name="obs" rows="2" maxlength="600"></textarea></label>' +
      '<div class="actions"><button class="btn" type="submit">Salvar dados do serviço</button></div></form>' +
      '<section class="card" style="margin-top:16px"><h2>Médicos cadastrados</h2><div id="listaMed"></div></section>' +
      '<form class="card" id="formMed" style="margin-top:16px" autocomplete="off"><h2 id="formMedTitle">Adicionar médico(a)</h2>' +
      '<input type="hidden" name="idx" value="">' +
      '<div class="fields">' +
      '<label for="mNome">Nome<input id="mNome" name="nome" required maxlength="100"></label>' +
      '<label for="mDias">Dia(s) de atendimento<input id="mDias" name="dias" required maxlength="60" placeholder="Ex.: Segunda e Quarta"></label>' +
      '<label for="mObs">Observação<input id="mObs" name="obs" maxlength="100" placeholder="Ex.: horário, unidade, afastamento"></label>' +
      "</div>" +
      '<div class="actions"><button class="btn" type="submit">Salvar médico(a)</button>' +
      '<button class="btn secondary" type="button" id="cancelEdit" hidden>Cancelar edição</button></div></form>' +
      '<form class="card" id="formNovo" style="margin-top:16px" autocomplete="off"><h2>Novo serviço</h2>' +
      '<div class="fields"><label for="nNome">Nome da especialidade ou exame<input id="nNome" name="nome" required maxlength="60"></label>' +
      '<label for="nCat">Tipo<select id="nCat" name="cat"><option value="consulta">Consulta especializada</option><option value="exame">Exame</option></select></label></div>' +
      '<div class="actions"><button class="btn secondary" type="submit">Criar serviço</button></div></form>';

    var sel = document.getElementById("selServ");
    var fd = document.getElementById("formDados");
    var fm = document.getElementById("formMed");
    var cancel = document.getElementById("cancelEdit");

    function fillDados() {
      var s = getServ(sel.value);
      fd.idade.value = s.idade || "";
      fd.oferta.value = s.oferta == null ? "" : s.oferta;
      fd.tempo.value = s.tempoMedio == null ? "" : s.tempoMedio;
      fd.obs.value = s.obs || "";
      fd.querySelectorAll('input[name="locais"]').forEach(function (c) { c.checked = s.locais.indexOf(c.value) >= 0; });
    }

    function resetMed() {
      fm.reset(); fm.idx.value = "";
      document.getElementById("formMedTitle").textContent = "Adicionar médico(a)";
      cancel.hidden = true;
    }

    function renderLista() {
      var s = getServ(sel.value);
      var box = document.getElementById("listaMed");
      if (!s.medicos.length) { box.innerHTML = '<div class="empty">Nenhum médico cadastrado.</div>'; return; }
      box.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Dia(s)</th><th>Observação</th><th></th></tr></thead><tbody>' +
        s.medicos.map(function (m, i) {
          return "<tr><td>" + esc(m.nome) + "</td><td>" + esc(m.dias) + "</td><td>" + esc(m.obs || "") + "</td>" +
            '<td style="white-space:nowrap"><button class="btn secondary small" type="button" data-edit="' + i + '">Editar</button> ' +
            '<button class="btn danger small" type="button" data-del="' + i + '">Remover</button></td></tr>';
        }).join("") + "</tbody></table></div>";
      box.querySelectorAll("[data-edit]").forEach(function (b) {
        b.addEventListener("click", function () {
          var i = Number(b.getAttribute("data-edit")), m = s.medicos[i];
          fm.idx.value = i; fm.nome.value = m.nome; fm.dias.value = m.dias || ""; fm.obs.value = m.obs || "";
          document.getElementById("formMedTitle").textContent = "Editar médico(a)";
          cancel.hidden = false;
          fm.nome.focus();
        });
      });
      box.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          var i = Number(b.getAttribute("data-del"));
          confirmar("Remover " + s.medicos[i].nome + " de " + s.nome + "?", "Remover", function () {
            s.medicos.splice(i, 1);
            save(); resetMed(); renderLista();
            toast("Médico(a) removido(a).");
          });
        });
      });
    }

    sel.addEventListener("change", function () { resetMed(); fillDados(); renderLista(); });
    cancel.addEventListener("click", resetMed);

    fd.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var s = getServ(sel.value);
      var locais = [].slice.call(fd.querySelectorAll('input[name="locais"]:checked')).map(function (c) { return c.value; });
      if (!locais.length) { toast("Marque pelo menos uma unidade de atendimento."); return; }
      s.idade = fd.idade.value.trim();
      s.oferta = fd.oferta.value === "" ? null : Math.max(0, parseInt(fd.oferta.value, 10) || 0);
      s.tempoMedio = fd.tempo.value === "" ? null : Math.max(0, parseInt(fd.tempo.value, 10) || 0);
      s.obs = fd.obs.value.trim();
      s.locais = locais;
      save();
      toast("Dados de " + s.nome + " salvos.");
    });

    fm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var s = getServ(sel.value);
      var m = { nome: fm.nome.value.trim(), dias: fm.dias.value.trim() };
      if (fm.obs.value.trim()) m.obs = fm.obs.value.trim();
      if (fm.idx.value !== "") s.medicos[Number(fm.idx.value)] = m;
      else s.medicos.push(m);
      save(); resetMed(); renderLista();
      toast("Médico(a) salvo(a) em " + s.nome + ".");
    });

    document.getElementById("formNovo").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nome = ev.target.nome.value.trim();
      var id = slug(nome);
      if (!id) return;
      if (getServ(id)) { toast("Esse serviço já existe."); return; }
      state.servicos.push({ id: id, nome: nome, categoria: ev.target.cat.value, locais: ["PNSV"], idade: "", medicos: [], oferta: null, fila: 0, tempoMedio: null });
      save();
      toast(nome + " criado. Complete os dados abaixo.");
      pageAtualizar({ serv: id, tab: "servico" });
    });

    fillDados();
    renderLista();
  }

  function tabDados(body) {
    body.innerHTML =
      '<section class="card"><h2>Backup e compartilhamento dos dados</h2>' +
      '<p class="preview">As atualizações ficam salvas neste navegador. Para levar os números atualizados a outros computadores, ' +
      "exporte o arquivo e importe-o nos demais, ou envie-o à equipe técnica para atualizar a base publicada.</p>" +
      '<div class="actions">' +
      '<button class="btn" id="btnExport" type="button">Exportar dados (JSON)</button>' +
      '<label class="btn secondary" for="fileImport">Importar dados<input type="file" id="fileImport" accept="application/json,.json" hidden></label>' +
      '<button class="btn secondary" id="btnCsv" type="button">Exportar planilha (CSV)</button>' +
      '<button class="btn danger" id="btnReset" type="button">Restaurar dados da lista oficial</button>' +
      "</div></section>";

    document.getElementById("btnExport").addEventListener("click", function () {
      download("portal-regulacao-goiana-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(state, null, 2), "application/json");
    });
    document.getElementById("btnCsv").addEventListener("click", function () {
      function cell(v) { v = v == null ? "" : String(v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
      var lines = [["Tipo", "Serviço", "Unidades", "Idade", "Médicos / dia de atendimento", "Oferta média/mês", "Fila de espera", "Tempo médio (dias)", "Situação"].join(";")];
      state.servicos.slice().sort(byName).forEach(function (s) {
        lines.push([
          s.categoria === "exame" ? "Exame" : "Consulta", s.nome, s.locais.map(shortUnit).join(", "), s.idade,
          s.medicos.map(function (m) { return m.nome + " (" + m.dias + ")"; }).join("; "),
          s.oferta, s.fila, s.tempoMedio, status(s).nome,
        ].map(cell).join(";"));
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
          if (!s || !Array.isArray(s.servicos)) throw new Error("formato");
          if (!Array.isArray(s.historico)) s.historico = [];
          state = s;
          save();
          toast("Dados importados.");
        } catch (e) {
          toast("Arquivo inválido: use um JSON exportado por este portal.");
        }
      };
      reader.readAsText(file);
    });
    document.getElementById("btnReset").addEventListener("click", function () {
      confirmar("Descartar todas as atualizações feitas neste navegador e voltar aos dados da lista oficial?", "Restaurar", function () {
        state = baseState();
        try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignora */ }
        renderNav(); renderLastUpdate();
        toast("Dados da lista oficial restaurados.");
      });
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
    if (r.name === "servico") pageServico(r.id);
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
