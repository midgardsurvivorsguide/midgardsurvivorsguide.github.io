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
    oathMin: ["Oath", "Oath", "Oath", "誓約"], anyOath: ["Any", "Qualquer", "Cualquiera", "不限"],
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
    like: ["Like", "Curtir", "Me gusta", "讚"], dislike: ["Dislike", "Não curtir", "No me gusta", "倒讚"],
    sort: ["Sort", "Ordenar", "Ordenar", "排序"], s_def: ["Verified first", "Verificadas primeiro", "Verificadas primero", "驗證優先"],
    s_top: ["Most liked", "Mais curtidas", "Más gustadas", "最多讚"], s_new: ["Newest", "Mais novas", "Más nuevas", "最新"],
    fbTitle: ["Community Feedback", "Feedback da comunidade", "Feedback de la comunidad", "社群回饋"],
    fbIntro: ["Ideas, bugs and wishes for the site and the Build Lab. Like the ones you agree with; the most liked go first.",
      "Ideias, bugs e pedidos para o site e o Laboratório. Curta os que você concorda; os mais curtidos ficam no topo.",
      "Ideas, errores y pedidos para el sitio y el Laboratorio. Dale me gusta a los que apoyas; los más votados van primero.",
      "對網站與配裝實驗室的點子、錯誤與需求。按讚支持你同意的，最多讚的排在前面。"],
    fbNew: ["Send feedback", "Enviar feedback", "Enviar feedback", "送出回饋"], fbAuthor: ["Your nickname", "Seu apelido", "Tu apodo", "你的暱稱"],
    fbCat: ["Type", "Tipo", "Tipo", "類型"], c_idea: ["Idea", "Ideia", "Idea", "點子"], c_bug: ["Bug", "Bug", "Error", "錯誤"], c_other: ["Other", "Outro", "Otro", "其他"],
    fbBody: ["What would you like to tell us? (10 to 500 characters)", "O que você quer dizer? (10 a 500 caracteres)", "¿Qué quieres decirnos? (10 a 500 caracteres)", "想說什麼？（10 到 500 字）"],
    fbSend: ["Send", "Enviar", "Enviar", "送出"], fbSending: ["Sending...", "Enviando...", "Enviando...", "送出中..."], fbSent: ["Thanks! Your feedback is up.", "Valeu! Seu feedback está no ar.", "¡Gracias! Tu feedback ya está publicado.", "感謝！你的回饋已發布。"],
    fbNone: ["No feedback yet. Be the first.", "Ainda não há feedback. Seja o primeiro.", "Aún no hay feedback. Sé el primero.", "還沒有回饋，成為第一個吧。"],
    e_wait: ["Wait 2 minutes between posts.", "Espere 2 minutos entre envios.", "Espera 2 minutos entre envíos.", "兩次送出之間請等待 2 分鐘。"],
    e_day: ["Daily limit reached (5). Try again tomorrow.", "Limite do dia atingido (5). Tente amanhã.", "Límite diario alcanzado (5). Inténtalo mañana.", "已達每日上限（5），請明天再試。"],
    e_words: ["Please remove offensive words.", "Remova palavras ofensivas, por favor.", "Quita las palabras ofensivas, por favor.", "請移除冒犯性字詞。"],
    e_links: ["At most one link, and only in the text.", "No máximo um link, e só no texto.", "Como máximo un enlace, y solo en el texto.", "最多一個連結，且只能放在內文。"],
    e_short: ["Nickname 2+ letters and text 10+.", "Apelido com 2+ letras e texto com 10+.", "Apodo 2+ letras y texto 10+.", "暱稱至少 2 字、內文至少 10 字。"],
    e_captcha: ["Please finish the check above.", "Complete a verificação acima, por favor.", "Completa la verificación de arriba, por favor.", "請完成上方的驗證。"],
    e_banned: ["Posting is blocked for you.", "O envio está bloqueado para você.", "El envío está bloqueado para ti.", "你已被禁止發文。"],
    e_any: ["Could not send. Try again later.", "Não deu para enviar. Tente mais tarde.", "No se pudo enviar. Inténtalo más tarde.", "無法送出，請稍後再試。"],
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
  /* likes / dislikes: one vote per visitor per item (the Worker keys it by IP hash); this browser remembers its own vote */
  function myVotes() { try { return JSON.parse(localStorage.getItem("msg-votes") || "{}"); } catch (e) { return {}; } }
  function voteHtml(kind, it) {
    var v = myVotes()[kind + ":" + it.id] || 0;
    return '<span class="votes" data-kind="' + kind + '" data-vid="' + it.id + '">' +
      '<button type="button" class="btn vbtn' + (v === 1 ? " on" : "") + '" data-vote="1" title="' + t("like") + '" aria-pressed="' + (v === 1) + '">▲ <b>' + (it.likes || 0) + "</b></button>" +
      '<button type="button" class="btn vbtn' + (v === -1 ? " on" : "") + '" data-vote="-1" title="' + t("dislike") + '" aria-pressed="' + (v === -1) + '">▼ <b>' + (it.dislikes || 0) + "</b></button></span>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".votes [data-vote]"); if (!b) return;
    var box = b.closest(".votes"), kind = box.getAttribute("data-kind"), id = box.getAttribute("data-vid"), want = +b.getAttribute("data-vote");
    var all = myVotes(), cur = all[kind + ":" + id] || 0, val = cur === want ? 0 : want;
    box.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
    fetch(API + "/v", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: kind, id: id, value: val }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (j.likes === undefined) throw 0;
        if (val) all[kind + ":" + id] = val; else delete all[kind + ":" + id];
        try { localStorage.setItem("msg-votes", JSON.stringify(all)); } catch (x) {}
        box.outerHTML = voteHtml(kind, { id: id, likes: j.likes, dislikes: j.dislikes });
      }).catch(function () { box.querySelectorAll("button").forEach(function (x) { x.disabled = false; }); });
  });

  function card(b, base) {
    var mine = !!keys()[b.id];
    return '<article class="pubcard" id="pb-' + b.id + '" data-id="' + b.id + '">' +
      '<div class="pubhead"><img src="' + base + "planner/sprites/" + esc(b.cls) + '.png" alt="" loading="lazy"><div><b class="pubname">' + esc(b.name) + "</b>" +
      "<small>" + esc(clsName(b.cls)) + " · " + t("by") + " " + esc(b.author) + " · " + esc(when(b.created)) + "</small></div></div>" +
      '<div class="pubtags"><span class="tag pubgoal">' + t("g_" + b.goal) + (b.goal === "hell15" && b.oath ? " · Oath " + b.oath : "") + "</span>" + (b.verified ? '<span class="tag pubver">✔ ' + t("verified") + "</span>" : "") + "</div>" +
      (b.verified && b.run ? '<p class="pubrun">' + runLine(b.run) + "</p>" : "") +
      (b.descr ? '<p class="pubdesc">' + esc(b.descr) + "</p>" : "") +
      '<div class="pubacts">' + voteHtml("b", b) + '<a class="btn pl-primary" href="' + base + "planner/#p=" + b.id + '">' + t("open") + "</a>" +
      '<button class="btn" type="button" data-pa="copy">' + t("copy") + "</button>" +
      (mine ? '<button class="btn" type="button" data-pa="del">' + t("del") + "</button>" : '<button class="btn pubrep" type="button" data-pa="report">' + t("report") + "</button>") +
      "</div></article>";
  }

  /* "How to export your build" video (YouTube wm-57jIaiJU): a button that opens the player with chapter buttons (site.js .vjump) */
  var HOWTO = { id: "wm-57jIaiJU", ch: [[0,["The site","O site","El sitio","網站"]],[9,["In game: Album → History → Export","No jogo: Álbum → Historial → Exportar","En el juego: Álbum → Historial → Exportar","遊戲中：圖鑑 → 歷史 → 匯出"]],[24,["Import in the Build Lab","Importar no Laboratório","Importar en el Laboratorio","在實驗室匯入"]],[33,["Publish","Publicar","Publicar","公開"]]] };
  function howtoHtml(open) {
    var li = { en: 0, pt: 1, es: 2, zh: 3 }[document.documentElement.getAttribute("data-ui")] || 0;
    var clk = function (s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); };
    var lab = ["Watch how (1 min)", "Veja como (1 min)", "Mira cómo (1 min)", "觀看教學（1 分鐘）"][li], jump = ["Jump to", "Pular para", "Saltar a", "跳到"][li];
    return '<button type="button" class="btn howto-btn" data-howto>▶ ' + lab + "</button>" + (open ? '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + HOWTO.id +
      '?enablejsapi=1&amp;rel=0" title="How to export your build" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' +
      '<div class="vchap"><small>' + jump + "</small>" + HOWTO.ch.map(function (c) { return '<button type="button" class="btn vjump" data-t="' + c[0] + '"><b>' + clk(c[0]) + "</b> " + c[1][li] + "</button>"; }).join("") + "</div>" : "");
  }

  /* ---------------- home tab ---------------- */
  var panel = document.getElementById("lv-public");
  if (panel) {
    var st = { cls: "", goal: "", oath: 0, sort: "", page: 0, items: [], more: false, busy: false, loaded: null };
    var want = (location.search.match(/[?&]pb=([2-9A-HJ-NP-Z]{8})/) || location.hash.match(/^#public-([2-9A-HJ-NP-Z]{8})$/) || [])[1];
    var base = "";
    var shell = function () {
      var goals = ["", "hell15", "emperium", "mvp", "farm", "other"].map(function (g) {
        return '<option value="' + g + '"' + (st.goal === g ? " selected" : "") + ">" + (g ? t("g_" + g) : t("all")) + "</option>";
      }).join("");
      panel.innerHTML = '<div class="pubtop"><div><h2>' + t("title") + '</h2><p class="muted">' + t("intro") + "</p></div>" +
        '<div class="pubtools"><label>' + t("goal") + ' <select data-pf="goal">' + goals + "</select></label>" +
        '<label class="pf-oath"' + (st.goal === "hell15" ? "" : " hidden") + ">" + t("oathMin") + ' <select data-pf="oath">' +
          [0, 10, 20, 30, 35, 40].map(function (o) { return '<option value="' + o + '"' + (st.oath === o ? " selected" : "") + ">" + (o ? o + (o < 40 ? "+" : "") : t("anyOath")) + "</option>"; }).join("") +
        "</select></label><label>" + t("sort") + ' <select data-pf="sort">' + [["", "s_def"], ["top", "s_top"], ["new", "s_new"]].map(function (o) {
          return '<option value="' + o[0] + '"' + (st.sort === o[0] ? " selected" : "") + ">" + t(o[1]) + "</option>"; }).join("") +
        '</select></label><a class="btn pl-primary" href="planner/">' + t("publish") + "</a></div></div>" +
        '<div class="howto pub-howto">' + howtoHtml(false) + '</div><div class="pubgrid"></div><div class="pubfoot"></div>';
      var hw = panel.querySelector(".pub-howto"), open = false;
      hw.addEventListener("click", function (e) { if (!e.target.closest("[data-howto]")) return; open = !open; hw.innerHTML = howtoHtml(open); });
      panel.querySelector('[data-pf="goal"]').onchange = function (e) {
        st.goal = e.target.value; if (st.goal !== "hell15") st.oath = 0;
        panel.querySelector(".pf-oath").hidden = st.goal !== "hell15"; panel.querySelector('[data-pf="oath"]').value = String(st.oath); load(true);
      };
      panel.querySelector('[data-pf="oath"]').onchange = function (e) { st.oath = +e.target.value || 0; load(true); };
      panel.querySelector('[data-pf="sort"]').onchange = function (e) { st.sort = e.target.value; load(true); };
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
      var q = API + "/p?page=" + st.page + (st.cls ? "&cls=" + st.cls : "") + (st.goal ? "&goal=" + st.goal : "") + (st.goal === "hell15" && st.oath ? "&oath=" + st.oath : "") + (st.sort ? "&sort=" + st.sort : "");
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
        var url = location.origin + location.pathname.replace(/[^/]*$/, "") + "planner/#p=" + id;   // opens the build straight in the Build Lab
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

  /* ---------------- Community Feedback (home tab) ---------------- */
  var TS_SITEKEY = "0x4AAAAAAGRmAtBmn1kf1k5s";   // Cloudflare Turnstile (public site key)
  var fbp = document.getElementById("lv-feedback");
  if (fbp) {
    var fs = { cat: "", sort: "", page: 0, items: [], more: false, busy: false, loaded: false, ts: null, msg: "" };
    var fkeys = function () { try { return JSON.parse(localStorage.getItem("msg-fb-keys") || "{}"); } catch (e) { return {}; } };
    var fitem = function (f) {
      var mine = !!fkeys()[f.id];
      return '<article class="pubcard fbcard" data-id="' + f.id + '"><div class="fbhead"><span class="tag fbcat-' + esc(f.cat) + '">' + t("c_" + f.cat) + "</span>" +
        "<small>" + t("by") + " " + esc(f.author) + " · " + esc(when(f.created)) + "</small></div>" +
        '<p class="pubdesc">' + esc(f.body) + '</p><div class="pubacts">' + voteHtml("f", f) +
        (mine ? '<button class="btn" type="button" data-fa="del">' + t("del") + "</button>" : '<button class="btn pubrep" type="button" data-fa="report">' + t("report") + "</button>") +
        "</div></article>";
    };
    var fshell = function () {
      var who = ""; try { who = localStorage.getItem("msg-pub-author") || ""; } catch (e) {}
      var cats = ["idea", "bug", "other"].map(function (c) { return '<option value="' + c + '">' + t("c_" + c) + "</option>"; }).join("");
      fbp.innerHTML = '<div class="pubtop"><div><h2>' + t("fbTitle") + '</h2><p class="muted">' + t("fbIntro") + "</p></div>" +
        '<div class="pubtools"><label>' + t("fbCat") + ' <select data-ff="cat"><option value="">' + t("all") + "</option>" + cats + "</select></label>" +
        "<label>" + t("sort") + ' <select data-ff="sort"><option value="">' + t("s_top") + '</option><option value="new">' + t("s_new") + "</option></select></label></div></div>" +
        '<form class="fbform pubcard"><b class="pubname">' + t("fbNew") + "</b>" +
        '<div class="fbrow"><label>' + t("fbAuthor") + '<input type="text" maxlength="24" name="author" value="' + esc(who) + '"></label>' +
        "<label>" + t("fbCat") + '<select name="cat">' + cats + "</select></label></div>" +
        '<textarea name="body" maxlength="500" rows="3" placeholder="' + esc(t("fbBody")) + '"></textarea>' +
        '<div class="fbts"></div><div class="pubacts"><button class="btn pl-primary" type="submit">' + t("fbSend") + '</button><span class="fbmsg muted"></span></div></form>' +
        '<div class="pubgrid fbgrid"></div><div class="pubfoot"></div>';
      fbp.querySelector('[data-ff="cat"]').onchange = function (e) { fs.cat = e.target.value; fload(true); };
      fbp.querySelector('[data-ff="sort"]').onchange = function (e) { fs.sort = e.target.value; fload(true); };
      var holder = fbp.querySelector(".fbts");
      var render = function () { try { fs.ts = window.turnstile.render(holder, { sitekey: TS_SITEKEY }); } catch (e) {} };
      if (window.turnstile) render();
      else { var sc = document.createElement("script"); sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.async = true; sc.onload = render; document.head.appendChild(sc); }
      fbp.querySelector(".fbform").onsubmit = function (e) {
        e.preventDefault();
        var f = e.target, msg = fbp.querySelector(".fbmsg"), tok = "";
        try { tok = window.turnstile && fs.ts !== null ? window.turnstile.getResponse(fs.ts) || "" : ""; } catch (x) {}
        try { localStorage.setItem("msg-pub-author", f.author.value); } catch (x) {}
        msg.textContent = t("fbSending");
        fetch(API + "/f", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author: f.author.value, cat: f.cat.value, body: f.body.value, turnstile: tok }) })
          .then(function (r) { return r.json().catch(function () { return {}; }); }).then(function (j) {
            if (j && j.id) {
              var k = fkeys(); k[j.id] = j.key; try { localStorage.setItem("msg-fb-keys", JSON.stringify(k)); } catch (x) {}
              f.body.value = ""; msg.textContent = t("fbSent"); fs.sort = "new"; fbp.querySelector('[data-ff="sort"]').value = "new"; fload(true);
            } else msg.textContent = T["e_" + (j && j.error)] ? t("e_" + j.error) : t("e_any");
            try { window.turnstile.reset(fs.ts); } catch (x) {}
          }, function () { msg.textContent = t("e_any"); });
      };
    };
    var fpaint = function () {
      var g = fbp.querySelector(".fbgrid"), f = fbp.querySelector(".pubfoot"); if (!g) return;
      g.innerHTML = fs.items.length ? fs.items.map(fitem).join("") : '<p class="muted">' + (fs.busy ? t("loading") : t("fbNone")) + "</p>";
      f.innerHTML = fs.more ? '<button class="btn" type="button" data-fa="more">' + t("more") + "</button>" : "";
    };
    var fload = function (reset) {
      if (fs.busy) return;
      if (reset) { fs.page = 0; fs.items = []; }
      fs.busy = true; fpaint();
      fetch(API + "/f?page=" + fs.page + (fs.cat ? "&cat=" + fs.cat : "") + (fs.sort ? "&sort=" + fs.sort : "")).then(function (r) { return r.json(); }).then(function (j) {
        fs.items = fs.items.concat(j.items || []); fs.more = !!j.more; fs.page++; fs.busy = false; fpaint();
      }, function () { fs.busy = false; fbp.querySelector(".fbgrid").innerHTML = '<p class="muted">' + t("fail") + "</p>"; });
    };
    var fopen = function () { if (fs.loaded) return; fs.loaded = true; fshell(); fload(true); };
    document.addEventListener("msg-home", function (e) { if ((e.detail || {}).lv === "feedback") fopen(); });
    if (document.querySelector('.lvtab[data-lv="feedback"][aria-selected="true"]')) fopen();
    fbp.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-fa]"); if (!b) return;
      var a = b.getAttribute("data-fa");
      if (a === "more") { fload(false); return; }
      var c = b.closest(".fbcard"), id = c && c.getAttribute("data-id"); if (!id) return;
      if (a === "report") {
        var why = prompt(t("reportAsk")); if (why === null) return;
        fetch(API + "/f/" + id + "/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: why.slice(0, 200) }) })
          .then(function () { b.textContent = t("reported"); b.disabled = true; });
      } else if (a === "del") {
        if (!confirm(t("delAsk"))) return;
        fetch(API + "/f/" + id, { method: "DELETE", headers: { "X-Edit-Key": fkeys()[id] || "" } }).then(function (r) {
          if (!r.ok) return;
          var k = fkeys(); delete k[id]; try { localStorage.setItem("msg-fb-keys", JSON.stringify(k)); } catch (x) {}
          fs.items = fs.items.filter(function (x) { return x.id !== id; }); fpaint();
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
        adm.innerHTML = '<p><b>' + items.length + '</b> reported or hidden builds and feedback. <button class="btn" type="button" data-ad="logout">Log out</button></p>' +
          items.map(function (b) {
            if (b.kind === "f") return '<article class="pubcard" data-id="' + b.id + '" data-kind="f"><b class="pubname">Feedback (' + esc(b.cat) + ")</b><small>by " + esc(b.author) + " · " +
              esc(when(b.created)) + " · " + (b.hidden ? "<b>HIDDEN</b>" : "visible") + " · " + b.reports + ' reports</small><p class="pubdesc">' + esc(b.body) + "</p>" +
              (b.reasons.length ? "<p class=\"muted\">Reasons: " + b.reasons.map(esc).join(" | ") + "</p>" : "") +
              '<div class="pubacts"><button class="btn" type="button" data-ad="restore">Restore</button><button class="btn" type="button" data-ad="delete">Delete</button>' +
              '<button class="btn" type="button" data-ad="ban">Ban author</button></div></article>';
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
      var fb = c && c.getAttribute("data-kind") === "f";
      if (a === "restore") call("POST", "/admin/restore/" + (fb ? "f/" : "") + id).then(function () { draw(); });
      if (a === "delete" && confirm("Delete this for good?")) call("DELETE", (fb ? "/f/" : "/p/") + id).then(function () { draw(); });
      if (a === "ban" && confirm("Ban this author (hides everything they posted and blocks new posts)?")) call("POST", "/admin/ban/" + (fb ? "f/" : "") + id).then(function () { draw(); });
    });
    draw();
  }
})();
