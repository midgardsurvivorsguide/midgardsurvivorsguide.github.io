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
    try { document.dispatchEvent(new CustomEvent("langchange", { detail: l })); } catch (e) {}
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

  /* home: difficulty tabs + class filter, one state kept in the URL as #<level> or #<level>/<class>.
     The level is remembered between visits; the class filter only lives in the URL and survives tab changes. */
  var lvtabs = document.querySelectorAll(".lvtab");
  if (lvtabs.length) {
    var hb = document.querySelector(".homebar"), chips = document.querySelectorAll(".clschip");
    var home = { lv: "beginner", cls: "" };
    var okLv = function (v) { return v === "beginner" || v === "intermediate" || v === "advanced" || v === "public"; };
    var okCls = function (v) { return !!v && !!document.querySelector('.clschip[data-cls="' + v + '"]'); };
    var render = function () {
      var lv = home.lv, cls = home.cls;
      lvtabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-lv") === lv ? "true" : "false"); });
      document.querySelectorAll(".lvpanel").forEach(function (p) {
        p.hidden = p.getAttribute("data-lv") !== lv;
        p.querySelectorAll(".card").forEach(function (c) {
          /* a class with no build here: its "coming soon" card gives way to the empty state below */
          c.classList.toggle("is-off", !!cls && (c.getAttribute("data-cls") !== cls || c.classList.contains("soon")));
        });
        p.querySelectorAll(".cls-empty").forEach(function (e) { e.hidden = e.getAttribute("data-cls") !== cls; });
      });
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-cls") === cls ? "true" : "false"); });
      /* phones: the class bar scrolls sideways, so bring the chosen chip into it */
      var on = cls && document.querySelector('.clschip[data-cls="' + cls + '"]'), cb = on && on.parentElement;
      if (cb && cb.scrollWidth > cb.clientWidth) cb.scrollLeft = on.offsetLeft - cb.offsetLeft - (cb.clientWidth - on.offsetWidth) / 2;
      if (hb) { hb.setAttribute("data-lv", lv); hb.classList.toggle("filtering", !!cls); }
      var bar = document.querySelector(".clsfilter");
      if (bar) {
        bar.hidden = !cls;
        var chip = cls && document.querySelector('.clschip[data-cls="' + cls + '"] span');
        bar.querySelector(".clsfilter-name").textContent = chip ? chip.textContent : "";
      }
    };
    var set = function (lv, cls, write) {
      home.lv = lv; home.cls = cls; render();
      if (write && history.replaceState) history.replaceState(null, "", "#" + lv + (cls ? "/" + cls : ""));
    };
    /* after a filter change, bring the top of the list back into view if the user had scrolled past it */
    var toTop = function () {
      var p = document.querySelector(".lvpanel:not([hidden])"); if (!p || !hb) return;
      var y = p.getBoundingClientRect().top - hb.getBoundingClientRect().bottom - 14;
      if (y < 0) window.scrollBy({ top: y, behavior: "smooth" });
    };
    var fromHash = function () {
      /* plain Home (no hash) always opens on Beginner with no class filter; the last tab is not remembered (user, 2026-11-24) */
      var parts = (location.hash || "").replace("#", "").split("/");
      set(okLv(parts[0]) ? parts[0] : "beginner", okCls(parts[1]) ? parts[1] : "", false);
    };
    lvtabs.forEach(function (t) { t.addEventListener("click", function () { set(t.getAttribute("data-lv"), home.cls, true); }); });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var id = c.getAttribute("data-cls");
        set(home.lv, home.cls === id ? "" : id, true); toTop();   /* clicking the active class again clears it */
      });
    });
    var clr = document.querySelector(".clsclear");
    if (clr) clr.addEventListener("click", function () { set(home.lv, "", true); });
    document.querySelectorAll("[data-golv]").forEach(function (b) {
      b.addEventListener("click", function () { set(b.getAttribute("data-golv"), home.cls, true); toTop(); });
    });
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

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

  /* guide build panel: copy the page link (without the hash) */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".gp-copy"); if (!b) return;
    var url = location.origin + location.pathname, old = b.innerHTML;
    var done = function () { b.textContent = "✓"; setTimeout(function () { b.innerHTML = old; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt("", url); }); else prompt("", url);
  });
})();
