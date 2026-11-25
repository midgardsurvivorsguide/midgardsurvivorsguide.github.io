/* Midgard Survivors Guide: Public Builds (home tab "Public Builds") and the admin queue (/admin/).
   Data: Worker msg-builds /p (Cloudflare D1). Builds open in the Build Lab with planner/#p=ID. */
(function () {
  "use strict";
  var API = "https://msg-builds.f-medeirs.workers.dev";
  var LI = { en: 0, pt: 1, es: 2, zh: 3 };
  function lang() { var l = document.documentElement.getAttribute("data-ui"); return LI[l] !== undefined ? l : "en"; }
  var T = {
    title: ["Public Builds", "Builds Públicas", "Builds Públicas", "玩家公開流派"],
    intro: ["Builds shared by players. Open any of them in the Build Lab to simulate and change it. Builds with the Verified in game badge came straight from the game's own export.",
      "Builds compartilhadas pelos jogadores. Abra qualquer uma no Laboratório para simular e mudar. Builds com o selo Verificada no jogo vieram direto do export do próprio jogo.",
      "Builds compartidas por los jugadores. Abre cualquiera en el Laboratorio para simularla y cambiarla. Las builds con el sello Verificada en el juego vienen directo del export del juego.",
      "玩家分享的配裝。任何一個都能在實驗室開啟、模擬與修改。有「遊戲驗證」標章的配裝直接來自遊戲匯出。"],
    publish: ["Publish your build", "Publique a sua build", "Publica tu build", "公開你的配裝"],
    goal: ["Made for", "Feita para", "Hecha para", "用途"], all: ["All", "Todas", "Todas", "全部"],
    g_hell15: ["Hell 15", "Hell 15", "Hell 15", "Hell 15"], g_emperium: ["Emperium Festival", "Emperium Festival", "Emperium Festival", "Emperium 祭典"],
    g_mvp: ["MVPs", "MVPs", "MVPs", "MVP"], g_farm: ["Farming", "Farm", "Farmeo", "刷寶"], g_other: ["Other", "Outro", "Otro", "其他"],
    verified: ["Verified in game", "Verificada no jogo", "Verificada en el juego", "遊戲驗證"],
    by: ["by", "por", "por", "作者"], open: ["Open in Build Lab", "Abrir no Laboratório", "Abrir en el Laboratorio", "在配裝實驗室開啟"],
    copy: ["Copy link", "Copiar link", "Copiar enlace", "複製連結"], copied: ["Copied", "Copiado", "Copiado", "已複製"],
    report: ["Report", "Denunciar", "Denunciar", "檢舉"], reported: ["Reported, thanks", "Denunciada, obrigado", "Denunciada, gracias", "已檢舉，謝謝"],
    reportAsk: ["Why are you reporting this build? (spam, offensive, fake...)", "Por que você está denunciando esta build? (spam, ofensiva, falsa...)",
      "¿Por qué denuncias esta build? (spam, ofensiva, falsa...)", "為什麼檢舉這個配裝？（垃圾訊息、冒犯、造假…）"],
    del: ["Delete", "Apagar", "Borrar", "刪除"], delAsk: ["Delete your build from Public Builds? This cannot be undone.", "Apagar a sua build de Builds Públicas? Não dá para desfazer.",
      "¿Borrar tu build de Builds Públicas? No se puede deshacer.", "從玩家公開流派刪除你的配裝？此動作無法復原。"],
    more: ["Load more", "Carregar mais", "Cargar más", "載入更多"], loading: ["Loading...", "Carregando...", "Cargando...", "載入中..."],
    none: ["No public builds here yet.", "Ainda não há builds públicas aqui.", "Aún no hay builds públicas aquí.", "這裡還沒有公開配裝。"],
    noneSub: ["Be the first: open your build in the Build Lab and press Publish build.", "Seja o primeiro: abra a sua build no Laboratório e aperte Publicar build.",
      "Sé el primero: abre tu build en el Laboratorio y pulsa Publicar build.", "成為第一個：在配裝實驗室開啟你的配裝並按「公開配裝」。"],
    fail: ["Could not load Public Builds. Try again later.", "Não deu para carregar as Builds Públicas. Tente mais tarde.", "No se pudieron cargar las Builds Públicas. Inténtalo más tarde.", "無法載入玩家公開流派，請稍後再試。"],
    win: ["cleared", "vencida", "superada", "通關"], lv: ["Lv", "Nv", "Nv", "Lv"],
  };
  function t(k) { return T[k][LI[lang()]]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clock(s) { s = Math.max(0, Math.round(+s || 0)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function keys() { try { return JSON.parse(localStorage.getItem("msg-pub-keys") || "{}"); } catch (e) { return {}; } }
  function clsName(c) { var s = document.querySelector('.clschip[data-cls="' + c + '"] span'); return s ? s.textContent : c; }
  function when(ms) { try { return new Date(ms).toLocaleDateString(document.documentElement.lang || undefined, { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; } }
  function runLine(r) {
    if (!r) return "";
    var bits = [r.danger, r.oath ? "Oath " + r.oath : "", r.time ? clock(r.time) : "", r.level ? t("lv") + " " + r.level : "", r.stage, r.victory ? "✔ " + t("win") : ""];
    return bits.filter(Boolean).map(esc).join(" · ");
  }
  function card(b, base) {
    var mine = !!keys()[b.id];
    return '<article class="pubcard" id="pb-' + b.id + '" data-id="' + b.id + '">' +
      '<div class="pubhead"><img src="' + base + "planner/sprites/" + esc(b.cls) + '.png" alt="" loading="lazy"><div><b class="pubname">' + esc(b.name) + "</b>" +
      "<small>" + esc(clsName(b.cls)) + " · " + t("by") + " " + esc(b.author) + " · " + esc(when(b.created)) + "</small></div></div>" +
      '<div class="pubtags"><span class="tag pubgoal">' + t("g_" + b.goal) + "</span>" + (b.verified ? '<span class="tag pubver">✔ ' + t("verified") + "</span>" : "") + "</div>" +
      (b.verified && b.run ? '<p class="pubrun">' + runLine(b.run) + "</p>" : "") +
      (b.descr ? '<p class="pubdesc">' + esc(b.descr) + "</p>" : "") +
      '<div class="pubacts"><a class="btn pl-primary" href="' + base + "planner/#p=" + b.id + '">' + t("open") + "</a>" +
      '<button class="btn" type="button" data-pa="copy">' + t("copy") + "</button>" +
      (mine ? '<button class="btn" type="button" data-pa="del">' + t("del") + "</button>" : '<button class="btn pubrep" type="button" data-pa="report">' + t("report") + "</button>") +
      "</div></article>";
  }

  /* ---------------- home tab ---------------- */
  var panel = document.getElementById("lv-public");
  if (panel) {
    var st = { cls: "", goal: "", page: 0, items: [], more: false, busy: false, loaded: null };
    var want = (location.search.match(/[?&]pb=([2-9A-HJ-NP-Z]{8})/) || location.hash.match(/^#public-([2-9A-HJ-NP-Z]{8})$/) || [])[1];
    var base = "";
    var shell = function () {
      var goals = ["", "hell15", "emperium", "mvp", "farm", "other"].map(function (g) {
        return '<option value="' + g + '"' + (st.goal === g ? " selected" : "") + ">" + (g ? t("g_" + g) : t("all")) + "</option>";
      }).join("");
      panel.innerHTML = '<div class="pubtop"><div><h2>' + t("title") + '</h2><p class="muted">' + t("intro") + "</p></div>" +
        '<div class="pubtools"><label>' + t("goal") + ' <select data-pf="goal">' + goals + '</select></label><a class="btn pl-primary" href="planner/">' + t("publish") + "</a></div></div>" +
        '<div class="pubgrid"></div><div class="pubfoot"></div>';
      panel.querySelector('[data-pf="goal"]').onchange = function (e) { st.goal = e.target.value; load(true); };
    };
    var paint = function () {
      var g = panel.querySelector(".pubgrid"), f = panel.querySelector(".pubfoot"); if (!g) return;
      g.innerHTML = st.items.length ? st.items.map(function (b) { return card(b, base); }).join("")
        : (st.busy ? '<p class="muted">' + t("loading") + "</p>" : '<div class="pub-empty"><h2>' + t("none") + '</h2><p class="muted">' + t("noneSub") + "</p></div>");
      f.innerHTML = st.more ? '<button class="btn" type="button" data-pa="more">' + (st.busy ? t("loading") : t("more")) + "</button>" : "";
      if (want) { var el = document.getElementById("pb-" + want); if (el) { el.classList.add("pubhi"); el.scrollIntoView({ block: "center" }); want = null; } }
    };
    var load = function (reset) {
      if (st.busy) return;
      if (reset) { st.page = 0; st.items = []; }
      st.busy = true; paint();
      var q = API + "/p?page=" + st.page + (st.cls ? "&cls=" + st.cls : "") + (st.goal ? "&goal=" + st.goal : "");
      fetch(q).then(function (r) { return r.json(); }).then(function (j) {
        st.items = st.items.concat(j.items || []); st.more = !!j.more; st.page++; st.busy = false;
        if (want && !st.items.some(function (b) { return b.id === want; })) {
          return fetch(API + "/p/" + want).then(function (r) { return r.ok ? r.json() : null; }).then(function (b) { if (b && b.id) st.items.unshift(b); paint(); });
        }
        paint();
      }, function () { st.busy = false; panel.querySelector(".pubgrid").innerHTML = '<p class="muted">' + t("fail") + "</p>"; });
    };
    document.addEventListener("msg-home", function (e) {
      var d = e.detail || {};
      if (d.lv !== "public") return;
      if (st.loaded === null) { shell(); st.cls = d.cls || ""; st.loaded = st.cls; load(true); return; }
      if ((d.cls || "") !== st.cls) { st.cls = d.cls || ""; load(true); }
    });
    /* site.js may have opened the tab before this script loaded */
    if (document.querySelector('.lvtab[data-lv="public"][aria-selected="true"]')) {
      var hp = (location.hash || "").replace("#", "").split("/");
      document.dispatchEvent(new CustomEvent("msg-home", { detail: { lv: "public", cls: document.querySelector('.clschip[data-cls="' + (hp[1] || "") + '"]') ? hp[1] : "" } }));
    }
    panel.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-pa]"); if (!b) return;
      var a = b.getAttribute("data-pa");
      if (a === "more") { load(false); return; }
      var c = b.closest(".pubcard"), id = c && c.getAttribute("data-id"); if (!id) return;
      if (a === "copy") {
        var url = location.origin + location.pathname + "?pb=" + id + "#public";
        var ok = function () { b.textContent = t("copied"); setTimeout(function () { b.textContent = t("copy"); }, 1400); };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, function () { prompt("", url); }); else prompt("", url);
      } else if (a === "report") {
        var why = prompt(t("reportAsk")); if (why === null) return;
        fetch(API + "/p/" + id + "/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: why.slice(0, 200) }) })
          .then(function () { b.textContent = t("reported"); b.disabled = true; });
      } else if (a === "del") {
        if (!confirm(t("delAsk"))) return;
        fetch(API + "/p/" + id, { method: "DELETE", headers: { "X-Edit-Key": keys()[id] || "" } }).then(function (r) {
          if (!r.ok) return;
          var k = keys(); delete k[id]; try { localStorage.setItem("msg-pub-keys", JSON.stringify(k)); } catch (x) {}
          st.items = st.items.filter(function (x) { return x.id !== id; }); paint();
        });
      }
    });
  }

  /* ---------------- admin queue (/admin/) ---------------- */
  var adm = document.getElementById("pub-admin");
  if (adm) {
    var key = ""; try { key = sessionStorage.getItem("msg-admin") || ""; } catch (e) {}
    var call = function (method, path) { return fetch(API + path, { method: method, headers: { "X-Admin-Key": key } }).then(function (r) { return r.json(); }); };
    var draw = function (msg) {
      if (!key) {
        adm.innerHTML = '<p>Admin key</p><input type="password" class="admkey" autocomplete="off"> <button class="btn pl-primary" type="button" data-ad="login">Enter</button>' + (msg ? '<p class="muted">' + esc(msg) + "</p>" : "");
        return;
      }
      adm.innerHTML = '<p class="muted">Loading...</p>';
      call("GET", "/admin/queue").then(function (j) {
        if (j.error) { key = ""; try { sessionStorage.removeItem("msg-admin"); } catch (e) {} draw("Wrong key."); return; }
        var items = j.items || [];
        adm.innerHTML = '<p><b>' + items.length + '</b> reported or hidden builds. <button class="btn" type="button" data-ad="logout">Log out</button></p>' +
          items.map(function (b) {
            return '<article class="pubcard" data-id="' + b.id + '"><b class="pubname">' + esc(b.name) + "</b><small>" + esc(b.cls) + " · by " + esc(b.author) + " · " + esc(when(b.created)) +
              " · " + (b.hidden ? "<b>HIDDEN</b>" : "visible") + " · " + b.reports + " reports</small>" + (b.descr ? '<p class="pubdesc">' + esc(b.descr) + "</p>" : "") +
              (b.reasons.length ? "<p class=\"muted\">Reasons: " + b.reasons.map(esc).join(" | ") + "</p>" : "") +
              '<div class="pubacts"><a class="btn" href="../planner/#p=' + b.id + '" target="_blank" rel="noopener">Open</a><button class="btn" type="button" data-ad="restore">Restore</button>' +
              '<button class="btn" type="button" data-ad="delete">Delete</button><button class="btn" type="button" data-ad="ban">Ban author</button></div></article>';
          }).join("");
      }, function () { adm.innerHTML = '<p class="muted">Could not reach the server.</p>'; });
    };
    adm.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-ad]"); if (!b) return;
      var a = b.getAttribute("data-ad"), c = b.closest(".pubcard"), id = c && c.getAttribute("data-id");
      if (a === "login") { key = adm.querySelector(".admkey").value.trim(); try { sessionStorage.setItem("msg-admin", key); } catch (x) {} draw(); return; }
      if (a === "logout") { key = ""; try { sessionStorage.removeItem("msg-admin"); } catch (x) {} draw(); return; }
      if (a === "restore") call("POST", "/admin/restore/" + id).then(function () { draw(); });
      if (a === "delete" && confirm("Delete this build for good?")) call("DELETE", "/p/" + id).then(function () { draw(); });
      if (a === "ban" && confirm("Ban this author (hides all their builds and blocks new ones)?")) call("POST", "/admin/ban/" + id).then(function () { draw(); });
    });
    draw();
  }
})();
