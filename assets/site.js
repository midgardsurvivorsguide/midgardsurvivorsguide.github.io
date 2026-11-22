/* Midgard Survivors Guide — theme, language, sidebar scrollspy, mobile menu. No dependencies. */
(function () {
  var root = document.documentElement;
  var LABEL = { en: ["Dark", "Light"], pt: ["Escuro", "Claro"], es: ["Oscuro", "Claro"], zh: ["深色", "淺色"] };
  var cur = root.getAttribute("data-lang-default") || "en";

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* theme */
  function paintTheme() {
    var b = document.getElementById("themebtn"); if (!b) return;
    var d = root.classList.contains("dark");
    b.setAttribute("aria-pressed", d ? "true" : "false");
    var t = b.querySelector(".t"); if (t) t.textContent = (LABEL[cur] || LABEL.en)[d ? 1 : 0];
  }
  window.toggleTheme = function () { var d = root.classList.toggle("dark"); store("theme", d ? "dark" : "light"); paintTheme(); };

  /* language (only on pages with .lang blocks) */
  /* language: site-wide (UI strings via html[data-ui]) + guide bodies (.lang blocks) */
  var blocks = document.querySelectorAll(".lang");
  var HTML_LANG = { en: "en", pt: "pt-BR", es: "es", zh: "zh-Hant" };
  window.setLang = function (l) {
    if (!HTML_LANG[l]) return;
    cur = l;
    root.setAttribute("data-ui", l);
    root.lang = HTML_LANG[l];
    blocks.forEach(function (e) { e.classList.toggle("on", e.id === "lang-" + l); });
    document.querySelectorAll("[data-l]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.l === l ? "true" : "false"); });
    store("lang", l); paintTheme(); spy();
    if (typeof closeAll === "function") closeAll();
  };
  (function () {
    var q = (location.search.match(/[?&]lang=(en|pt|es|zh)/) || location.hash.match(/^#(en|pt|es|zh)$/) || [])[1];
    var l = q || root.getAttribute("data-ui") || read("lang");
    if (!l) { var n = (navigator.language || "en").toLowerCase(); l = n.indexOf("pt") === 0 ? "pt" : n.indexOf("es") === 0 ? "es" : n.indexOf("zh") === 0 ? "zh" : "en"; }
    setTimeout(function () { setLang(l); }, 0);
  })();
  paintTheme();

  /* dropdowns: click to open (touch), Escape / outside click to close */
  function closeAll(except) {
    document.querySelectorAll(".sub.open").forEach(function (s) { s.classList.remove("open"); });
    document.querySelectorAll(".dd.open").forEach(function (d) {
      if (d === except) return; d.classList.remove("open"); var b = d.querySelector(":scope > .btn"); if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  document.querySelectorAll(".site-header .in .dd > .btn, .mpanel .lang-dd > .btn").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation(); var d = b.parentElement; var o = !d.classList.contains("open"); closeAll(d);
      d.classList.toggle("open", o); b.setAttribute("aria-expanded", o ? "true" : "false");
    });
  });
  /* Builds flyouts: click/tap opens one difficulty (hover does it on desktop) */
  document.querySelectorAll(".sub-btn").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation(); var s = b.parentElement; var o = !s.classList.contains("open");
      s.parentElement.querySelectorAll(".sub.open").forEach(function (x) { x.classList.remove("open"); x.firstElementChild.setAttribute("aria-expanded", "false"); });
      s.classList.toggle("open", o); b.setAttribute("aria-expanded", o ? "true" : "false");
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest || !e.target.closest(".dd")) closeAll(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });

  /* home: difficulty tabs (remembered; #beginner / #intermediate / #advanced also work) */
  var lvtabs = document.querySelectorAll(".lvtab");
  if (lvtabs.length) {
    var showLevel = function (lv, push) {
      lvtabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-lv") === lv ? "true" : "false"); });
      document.querySelectorAll(".lvpanel").forEach(function (p) { p.hidden = p.getAttribute("data-lv") !== lv; });
      var hb = document.querySelector(".homebar"); if (hb) hb.setAttribute("data-lv", lv);
      try { localStorage.setItem("homeLevel", lv); } catch (e) {}
      if (push && history.replaceState) history.replaceState(null, "", "#" + lv);
    };
    lvtabs.forEach(function (t) { t.addEventListener("click", function () { showLevel(t.getAttribute("data-lv"), true); }); });
    var h = (location.hash || "").replace("#", ""), saved = null;
    try { saved = localStorage.getItem("homeLevel"); } catch (e) {}
    var ok = function (v) { return v === "beginner" || v === "intermediate" || v === "advanced" || v === "public"; };
    showLevel(ok(h) ? h : ok(saved) ? saved : "beginner", false);
  }

  /* home: class bar scrolls to that class's card in the open difficulty */
  document.querySelectorAll(".clschip").forEach(function (c) {
    c.addEventListener("click", function () {
      var panel = document.querySelector(".lvpanel:not([hidden])"); if (!panel) return;
      var card = panel.querySelector('.card[data-cls="' + c.getAttribute("data-cls") + '"]'); if (!card) return;
      card.scrollIntoView({ behavior: "smooth", block: "start" });
      card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash");
    });
  });

  /* mobile menu */
  var mb = document.getElementById("menubtn");
  if (mb) mb.addEventListener("click", function () {
    var h = document.querySelector(".site-header"); var o = h.classList.toggle("open"); mb.setAttribute("aria-expanded", o ? "true" : "false");
  });

  /* sidebar scrollspy */
  var observer = null;
  function spy() {
    if (observer) observer.disconnect();
    var scope = document.querySelector(".lang.on") || document.querySelector(".guide");
    if (!scope || !("IntersectionObserver" in window)) return;
    var links = scope.querySelectorAll(".toc a[href^='#']");
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    if (links.length && !scope.querySelector(".toc a.active")) links[0].classList.add("active");
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); });
        var a = map[e.target.id]; if (!a) return;
        a.classList.add("active");
        var bar = a.parentElement; if (bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: a.offsetLeft - 40, behavior: "smooth" });
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) observer.observe(s); });
  }
  spy();

  /* collapsible sections: click the red title bar to fold a window */
  function setOpen(sec, open) {
    sec.classList.toggle("collapsed", !open);
    var h = sec.querySelector(":scope > h2"); if (h) h.setAttribute("aria-expanded", open ? "true" : "false");
  }
  document.querySelectorAll("section[id] > h2").forEach(function (h) {
    var sec = h.parentElement;
    h.classList.add("toggle"); h.setAttribute("role", "button"); h.setAttribute("tabindex", "0"); h.setAttribute("aria-expanded", "true");
    h.addEventListener("click", function () { setOpen(sec, sec.classList.contains("collapsed")); });
    h.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(sec, sec.classList.contains("collapsed")); }
    });
  });
  /* a menu link to a folded section opens it first */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".toc a[href^='#']"); if (!a) return;
    var s = document.getElementById(a.getAttribute("href").slice(1));
    if (s && s.classList.contains("collapsed")) setOpen(s, true);
  });
})();
