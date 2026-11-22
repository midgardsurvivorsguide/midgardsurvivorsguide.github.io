/* Midgard Survivors Guide — Build Planner (character creation, no damage simulation yet).
   Data: planner/data.json, exported from the game (0.2.7) by make_planner_data.py. Rules follow the game's code:
   loadout legendary cap = 1 base + 1 rebirth + 1 per Endless Tower legend floor; 1 unique; 1 soul; item and its own soul exclude each other. */
(function () {
  "use strict";
  var root = document.getElementById("planner");
  if (!root) return;
  var BASE = root.getAttribute("data-base") || "./";
  var D = null;                 // game data
  var S = null;                 // current build state
  var LS_CUR = "msg-planner-current", LS_SAVED = "msg-planner-saved";

  /* ---------------- i18n ---------------- */
  var T = {
    pick: ["Choose your class", "Escolha sua classe", "Elige tu clase", "選擇職業"],
    pickSub: ["Pick a class to start a build. Everything is saved in this browser.", "Escolha uma classe para começar a build. Tudo fica salvo neste navegador.", "Elige una clase para empezar la build. Todo se guarda en este navegador.", "選擇職業開始配裝，所有資料都會存在這個瀏覽器。"],
    setup: ["Setup", "Configuração", "Configuración", "設定"],
    change: ["Change class", "Trocar classe", "Cambiar clase", "更換職業"],
    sockets: ["Legendary sockets", "Slots lendários", "Ranuras legendarias", "傳說欄位"],
    base: ["Base", "Base", "Base", "基礎"],
    reborn: ["Class reborn (Valkyrie)", "Classe renascida (Valkyrie)", "Clase renacida (Valkyrie)", "職業已轉生（Valkyrie）"],
    noReborn: ["This class does not rebirth: +1 already included", "Esta classe não renasce: +1 já incluso", "Esta clase no renace: +1 ya incluido", "此職業不轉生：已含 +1"],
    tower: ["Endless Tower floors", "Andares da Endless Tower", "Pisos de la Endless Tower", "無盡之塔樓層"],
    allOpen: ["All legendary sockets unlocked", "Todos os slots lendários liberados", "Todas las ranuras legendarias liberadas", "全部傳說欄位已解鎖"],
    legend: ["Legendary", "Lendários", "Legendarios", "傳說"],
    unique: ["Unique", "Únicos", "Únicos", "唯一"],
    soul: ["Soul", "Alma", "Alma", "靈魂"],
    equipment: ["Equipment", "Equipamento", "Equipo", "裝備"],
    totals: ["Build totals", "Totais da build", "Totales de la build", "配裝總計"],
    totalsNote: ["Sum of gear, cards, traits, grades and Star Potential. No skills, pacts or stats yet.", "Soma de equipamento, cartas, traits, grades e Star Potential. Ainda sem skills, pactos e atributos.", "Suma de equipo, cartas, traits, grados y Star Potential. Aún sin habilidades, pactos ni atributos.", "裝備、卡片、特性、等級與星之潛能的總和，尚未包含技能、契約與能力值。"],
    effects: ["Special effects", "Efeitos especiais", "Efectos especiales", "特殊效果"],
    empty: ["Empty", "Vazio", "Vacío", "空"],
    none: ["None", "Nenhum", "Ninguno", "無"],
    save: ["Save build", "Salvar build", "Guardar build", "儲存配裝"],
    share: ["Copy share link", "Copiar link", "Copiar enlace", "複製分享連結"],
    copied: ["Link copied", "Link copiado", "Enlace copiado", "已複製連結"],
    reset: ["Clear gear", "Limpar equipamento", "Vaciar equipo", "清空裝備"],
    saved: ["My builds", "Minhas builds", "Mis builds", "我的配裝"],
    noSaved: ["No saved builds yet.", "Nenhuma build salva ainda.", "Aún no hay builds guardadas.", "還沒有儲存的配裝。"],
    namePrompt: ["Build name", "Nome da build", "Nombre de la build", "配裝名稱"],
    load: ["Load", "Abrir", "Abrir", "載入"],
    del: ["Delete", "Apagar", "Borrar", "刪除"],
    search: ["Search…", "Buscar…", "Buscar…", "搜尋…"],
    all: ["All", "Todos", "Todos", "全部"],
    rN: ["Epic", "Épico", "Épico", "史詩"], rP: ["Purple", "Roxo", "Morado", "紫色"], rL: ["Legendary", "Lendário", "Legendario", "傳說"],
    rU: ["Unique", "Único", "Único", "唯一"], rS: ["Soul", "Alma", "Alma", "靈魂"],
    remove: ["Remove item", "Remover item", "Quitar objeto", "移除裝備"],
    done: ["Done", "Pronto", "Listo", "完成"],
    refine: ["Refine", "Refino", "Refinado", "精煉"],
    slotsNat: ["Card slots (dropped with)", "Slots de carta (veio com)", "Ranuras de carta (de origen)", "卡槽（掉落時）"],
    slotsExtra: ["Extra sockets (Socket NPC)", "Sockets extras (NPC)", "Ranuras extra (NPC)", "額外卡槽（NPC）"],
    wingSlot: ["+1 slot from refine +5", "+1 slot pelo refino +5", "+1 ranura por refinado +5", "精煉 +5 額外 +1 卡槽"],
    cards: ["Cards", "Cartas", "Cartas", "卡片"],
    mvpOnly: ["Wings take MVP cards only", "Asas só aceitam cartas de MVP", "Las alas solo aceptan cartas de MVP", "翅膀只能插 MVP 卡"],
    trait: ["Trait", "Trait", "Trait", "特性"],
    traitTier: ["Trait strength follows the card slots it dropped with (1–3)", "A força do trait segue os slots com que veio (1–3)", "La fuerza del trait sigue las ranuras de origen (1–3)", "特性強度取決於掉落時的卡槽數（1–3）"],
    grade: ["Grade", "Grade", "Grado", "等級"],
    gradeNeed: ["Needs refine +10", "Precisa de refino +10", "Requiere refinado +10", "需要精煉 +10"],
    pot: ["Star Potential", "Star Potential", "Star Potential", "星之潛能"],
    line: ["Line", "Linha", "Línea", "詞條"],
    stats: ["Stats", "Atributos", "Atributos", "屬性"],
    desc: ["Effect", "Efeito", "Efecto", "效果"],
    capLegend: ["Legendary limit reached", "Limite de lendários atingido", "Límite de legendarios alcanzado", "已達傳說上限"],
    capUnique: ["Only 1 unique", "Só 1 único", "Solo 1 único", "只能 1 件唯一"],
    pairSoul: ["This piece and its soul can't be worn together", "Esta peça e a alma dela não vão juntas", "Esta pieza y su alma no van juntas", "裝備與其靈魂不能同時穿戴"],
    twoHand: ["Two-handed weapon: no left hand", "Arma de duas mãos: sem mão esquerda", "Arma a dos manos: sin mano izquierda", "雙手武器：無法使用左手"],
    leftHalf: ["Left-hand weapon counts 50% (more with Left Hand Mastery)", "Arma da mão esquerda conta 50% (mais com Left Hand Mastery)", "El arma de la mano izquierda cuenta 50% (más con Left Hand Mastery)", "左手武器計算 50%（Left Hand Mastery 會提高）"],
    leftHand: ["Left hand", "Mão esquerda", "Mano izquierda", "左手"],
    countNote: ["Souls are legendary too and count toward the limit, as in the game.", "Almas também são lendárias e contam no limite, como no jogo.", "Las almas también son legendarias y cuentan en el límite, como en el juego.", "靈魂也算傳說裝備並計入上限，與遊戲相同。"],
    noResults: ["Nothing fits this slot for this class.", "Nada serve neste slot para esta classe.", "Nada sirve en esta ranura para esta clase.", "此職業沒有適合這個欄位的裝備。"],
    untitled: ["Untitled build", "Build sem nome", "Build sin nombre", "未命名配裝"],
    ppd: ["Pacts, dishes and pet", "Pactos, pratos e pet", "Pactos, platos y mascota", "契約、料理與寵物"],
    pacts: ["Pacts", "Pactos", "Pactos", "契約"],
    dishes: ["Dishes", "Pratos", "Platos", "料理"],
    pet: ["Pet", "Pet", "Mascota", "寵物"],
    chef: ["Chef level", "Nível do Chef", "Nivel del Chef", "廚師等級"],
    chefNote: ["Each Chef level (Prontera) lets you bring one more dish.", "Cada nível do Chef (Prontera) libera mais um prato.", "Cada nivel del Chef (Prontera) permite un plato más.", "廚師（普隆德拉）每升一級可多帶一道料理。"],
    pactNote: ["Up to 3 pacts, valid in every run of the class.", "Até 3 pactos, valem em todas as runs da classe.", "Hasta 3 pactos, valen en todas las partidas de la clase.", "最多 3 個契約，該職業每場遊戲都有效。"],
    add: ["Add", "Adicionar", "Agregar", "新增"],
    pickPact: ["Choose a pact", "Escolha um pacto", "Elige un pacto", "選擇契約"],
    pickDish: ["Choose a dish", "Escolha um prato", "Elige un plato", "選擇料理"],
    pickPet: ["Choose a pet", "Escolha um pet", "Elige una mascota", "選擇寵物"],
    taken: ["Already chosen", "Já escolhido", "Ya elegido", "已選擇"],
    full: ["All slots used", "Todos os espaços usados", "Todos los espacios usados", "已滿"],
    mvpPet: ["MVP pet", "Pet de MVP", "Mascota MVP", "MVP 寵物"],
    skill: ["Skill", "Skill", "Habilidad", "技能"]
  };
  var LI = { en: 0, pt: 1, es: 2, zh: 3 };
  function lang() { var l = document.documentElement.getAttribute("data-ui"); return LI[l] !== undefined ? l : "en"; }
  function t(k) { return T[k][LI[lang()]]; }
  function L(o) { if (!o) return ""; if (typeof o === "string") return o; return o[lang()] || o.en || ""; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------------- class & slot rules ---------------- */
  var SLOT_ORDER = ["head", "mid", "low", "armor", "weapon", "shield", "garment", "shoes", "acc1", "acc2", "wings", "soul"];
  function cls() { return D.classes.filter(function (c) { return c.id === S.cls; })[0]; }
  function slotKind(slot) { return slot === "acc1" || slot === "acc2" ? "acc" : slot; }
  function weaponAllowed(c, it) {
    if (it.job && it.job.indexOf(c.job) < 0) return false;
    if (it.nj && it.nj.indexOf(c.job) >= 0) return false;
    if (it.cls === c.base || (it.also && it.also.indexOf(c.base) >= 0)) return true;
    return c.kinds.indexOf(it.wk) >= 0;
  }
  function classAllowed(c, it) {
    if (it.job && c.job && it.job.indexOf(c.job) < 0) return false;
    if (it.cls && it.cls !== c.base && !(it.also && it.also.indexOf(c.base) >= 0)) return false;
    return true;
  }
  function fitsSlot(slot, id) {
    var it = D.items[id], c = cls(), kind = slotKind(slot);
    if (!it) return false;
    if (slot === "weapon") return it.s === "weapon" && !it.lo && weaponAllowed(c, it);
    if (slot === "shield") {
      var w = S.gear.weapon && D.items[S.gear.weapon.id];
      if (w && (w.th || w.wk === "katar" || w.wk === "huuma")) return false;
      if (it.s === "shield") return c.shield && classAllowed(c, it);
      if (it.s === "weapon" && c.dual) return D.rules.offhandKinds.indexOf(it.wk) >= 0 && weaponAllowed(c, it);
      return false;
    }
    if (slot === "soul") {
      if (it.s !== "soul") return false;
      var src = D.items[it.of];
      if (src && src.s === "weapon") return weaponAllowed(c, src) || (c.dual && D.rules.offhandKinds.indexOf(src.wk) >= 0 && weaponAllowed(c, src));
      return classAllowed(c, it);
    }
    return it.s === kind && classAllowed(c, it);
  }
  function isLegend(it) { return it.r === "l" || (it.r === "s" && !it.u); }
  function isUnique(it) { return it.r === "u" || (it.r === "s" && it.u); }
  function legendCap() {
    var c = cls(), r = D.rules;
    return r.legendBase + ((S.reborn || c.no_rebirth) ? r.legendRebirth : 0) + S.tower.length;
  }
  function counts(skip) {
    var n = { l: 0, u: 0 };
    SLOT_ORDER.forEach(function (k) {
      if (k === skip || !S.gear[k]) return;
      var it = D.items[S.gear[k].id];
      if (isUnique(it)) n.u++; else if (isLegend(it)) n.l++;
    });
    return n;
  }
  function blockReason(slot, id) {
    var it = D.items[id], n = counts(slot);
    if (isUnique(it) && n.u >= D.rules.uniqueMax) return t("capUnique");
    if (!isUnique(it) && isLegend(it) && n.l >= legendCap()) return t("capLegend");
    for (var k in S.gear) {
      if (k === slot || !S.gear[k]) continue;
      var o = D.items[S.gear[k].id];
      if (o && (o.of === id || it.of === S.gear[k].id)) return t("pairSoul");
    }
    return "";
  }

  /* ---------------- per-item rules ---------------- */
  function slotless(it) { return it.s === "soul" || (it.s === "low" && it.face); }
  function natSlots(g) { var it = D.items[g.id]; return it.fs !== undefined ? it.fs : (slotless(it) ? 0 : (g.slots || 0)); }
  function sockets(g) {
    var it = D.items[g.id];
    if (slotless(it)) return 0;
    var wing = it.wings && (g.refine || 0) >= 5 ? 1 : 0;
    return natSlots(g) + (g.extra || 0) + wing;
  }
  function extraCap(it) { return slotless(it) ? 0 : (isLegend(it) || isUnique(it) ? D.rules.socketExtraLegend : D.rules.socketExtra); }
  function canTrait(g) { var it = D.items[g.id]; return natSlots(g) >= 1 && !it.fixed && it.r !== "l" && it.r !== "u" && it.r !== "s" && !it.wings; }
  function traitTier(g) { return Math.max(1, Math.min(3, natSlots(g))); }
  function gradable(it) { return it.s === "weapon" || !!D.gearGrades[it.s]; }
  function refinable(it) { return it.s !== "soul" && !it.fixed; }
  function cardFits(it, cid) { var c = D.cards[cid]; if (!c) return false; if (it.wings) return !!c.mvp; return c.t === slotKind(it.s === "acc" ? "acc" : it.s); }

  /* ---------------- totals (Equipment.item_mods in the game) ---------------- */
  function add(o, k, v) { o[k] = (o[k] || 0) + v; }
  function itemTotals(slot, g) {
    var it = D.items[g.id], r = refinable(it) ? (g.refine || 0) : 0, m = {}, fx = {};
    var mult = D.itemTiers[Math.max(0, Math.min(3, natSlots(g)))], grow = it.rf ? 1 + D.rules.refineStep * r : 1;
    var k;
    for (k in it.m || {}) { var v = it.m[k] * mult; add(m, k, v > 0 ? v * grow : v); }
    for (k in it.rf || {}) add(m, k, it.rf[k] * r);
    if (it.s === "weapon" && r > (it.safe || 0)) add(m, "dmg", D.rules.overDmg * (r - it.safe));
    (g.pot || []).forEach(function (l) {
      if (!l || !l.k) return; var p = D.pot[l.k]; if (!p) return;
      var val = p.v[Math.min(p.v.length - 1, Math.max(0, (l.t || 1) - 1))];
      if (p.mod) add(m, p.mod, val);
      (p.fx || []).forEach(function (e) { add(fx, e, val); });
    });
    if (it.th) for (k in m) if (m[k] > 0) m[k] *= 1 + D.rules.twoHandBonus;
    var gr = gradable(it) && r >= D.rules.gradeMinRefine ? (g.grade || 0) : 0;
    if (gr > 0 && it.s === "weapon") add(m, "grade_mult", D.weaponGradeDmg[gr]);
    else if (gr > 0) { var gg = D.gearGrades[it.s]; gg.keys.forEach(function (kk) { add(m, kk, gg.vals[gr]); }); }
    var ck = 1 + (it.wings ? (r >= 8 ? 0.3 : r >= 3 ? 0.15 : 0) : 0);
    (g.cards || []).forEach(function (cid) {
      var c = D.cards[cid]; if (!c) return;
      for (var kk in c.m || {}) add(m, kk, c.m[kk] > 0 ? c.m[kk] * ck : c.m[kk]);
      for (kk in c.fx || {}) add(fx, kk, c.fx[kk]);
    });
    for (k in it.fx || {}) add(fx, k, it.fx[k]);
    if (g.trait && canTrait(g)) {
      var tr = D.traits[g.trait];
      if (tr) for (k in tr.fx) add(fx, k, tr.fx[k][traitTier(g) - 1]);
    }
    if (slot === "shield" && it.s === "weapon") for (k in m) m[k] *= D.rules.offhandShare;
    return { m: m, fx: fx };
  }
  function buildTotals() {
    var all = {}, specials = [], seen = {};
    function special(key, ic, n, d) { if (!seen[key] && d) { seen[key] = 1; specials.push({ ic: ic, n: n, d: d }); } }
    function take(src, key, ic, n, d, always) {
      var k, odd = false;
      for (k in src.m || {}) { if (D.labels[k]) add(all, k, src.m[k]); else odd = true; }
      for (k in src.fx || {}) { if (/^(lg_|u_)/.test(k) || !D.labels[k]) odd = true; else add(all, k, src.fx[k]); }
      if (odd || always) special(key, ic, n, d);
    }
    SLOT_ORDER.forEach(function (slot) {
      var g = S.gear[slot]; if (!g) return;
      var it = D.items[g.id], r = itemTotals(slot, g);
      take({ m: r.m, fx: r.fx }, "i" + g.id, it.ic, it.n, L(it.d));
    });
    (S.pacts || []).forEach(function (k) { var p = D.pacts[k]; if (p) take(p, "p" + k, p.ic, pactName(k), L(p.d), !p.m && !p.fx); });
    (S.dishes || []).slice(0, S.chef || 1).forEach(function (k) { var d = D.dishes[k]; if (d) take(d, "d" + k, d.ic, d.n, L(d.d), true); });
    if (S.pet && D.pets[S.pet]) { var pt = D.pets[S.pet]; take(pt, "pet" + S.pet, pt.ic, pt.n, L(pt.d), !!pt.mvp); }
    return { all: all, specials: specials };
  }
  function pactName(k) { var n = D.pacts[k].n; if (!n) return k; var en = n.en.replace(/^Pact of (the )?/i, "").replace(/ Pact$/, ""); en = en.charAt(0).toUpperCase() + en.slice(1); return lang() === "en" ? en : en + " (" + L(n) + ")"; }
  function fmt(k, v) {
    var lab = D.labels[k], pct = lab ? lab.pct : Math.abs(v) < 5;
    if (pct) { var p = Math.round(v * 1000) / 10; return (p > 0 ? "+" : "") + p + "%"; }
    var n = Math.round(v * 100) / 100; return (n > 0 ? "+" : "") + n;
  }
  function labelOf(k) { return D.labels[k] ? L(D.labels[k].n) : k.replace(/_/g, " "); }

  /* ---------------- state ---------------- */
  function fresh(c) { return { v: 1, cls: c, name: "", reborn: true, tower: D.rules.towerFloors.slice(), gear: {}, pacts: [], dishes: [], chef: D.rules.chefMax, pet: "" }; }
  function persist() { try { localStorage.setItem(LS_CUR, JSON.stringify(S)); } catch (e) {} }
  function savedList() { try { return JSON.parse(localStorage.getItem(LS_SAVED) || "[]"); } catch (e) { return []; } }
  function setSaved(a) { try { localStorage.setItem(LS_SAVED, JSON.stringify(a)); } catch (e) {} }
  function encode(o) { var s = JSON.stringify(o); return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function decode(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return JSON.parse(decodeURIComponent(escape(atob(s)))); }
  function valid(o) { return o && typeof o === "object" && D.classes.some(function (c) { return c.id === o.cls; }) && typeof o.gear === "object"; }
  function clean(o) {
    var g = {};
    for (var k in o.gear || {}) if (SLOT_ORDER.indexOf(k) >= 0 && o.gear[k] && D.items[o.gear[k].id]) g[k] = o.gear[k];
    var uniq = function (a, src, n) { var out = []; (a || []).forEach(function (x) { if (src[x] && out.indexOf(x) < 0 && out.length < n) out.push(x); }); return out; };
    var chef = Math.max(1, Math.min(D.rules.chefMax, +o.chef || D.rules.chefMax));
    return { v: 1, cls: o.cls, name: String(o.name || "").slice(0, 60), reborn: !!o.reborn, tower: (o.tower || []).filter(function (f) { return D.rules.towerFloors.indexOf(f) >= 0; }), gear: g,
      pacts: uniq(o.pacts, D.pacts, D.rules.maxPacts), dishes: uniq(o.dishes, D.dishes, D.rules.chefMax), chef: chef, pet: D.pets[o.pet] ? o.pet : "" };
  }

  /* ---------------- rendering ---------------- */
  var RAR = { n: "rN", p: "rP", l: "rL", u: "rU", s: "rS" };
  function ico(file, cls2) { return file ? '<img class="pl-ic ' + (cls2 || "") + '" src="' + BASE + "icons/" + file + '.png" alt="" loading="lazy">' : '<span class="pl-ic pl-ic-none ' + (cls2 || "") + '"></span>'; }
  function slotName(slot) { return slot === "shield" && cls().dual ? t("leftHand") + " / " + L(D.slotNames.shield) : L(D.slotNames[slot] || D.slotNames[slotKind(slot)]); }

  function renderPicker() {
    var cards = D.classes.map(function (c) {
      return '<button class="pl-class" type="button" data-cls="' + c.id + '" style="background-image:linear-gradient(180deg,rgba(10,6,8,0) 45%,rgba(10,6,8,.75)),url(' + BASE + "../assets/banners/class-" + c.id + '.png)">' +
        '<span class="pl-class-n"><img src="' + BASE + "../assets/icons/job_" + c.id + '.png" alt="">' + esc(D.classNames[c.id] || c.name) + "</span></button>";
    }).join("");
    root.innerHTML = '<section class="pl-pick"><h2>' + t("pick") + '</h2><p class="muted">' + t("pickSub") + '</p><div class="pl-classes">' + cards + "</div></section>";
    root.querySelectorAll(".pl-class").forEach(function (b) { b.onclick = function () { S = fresh(b.getAttribute("data-cls")); persist(); render(); }; });
  }

  function slotCard(slot) {
    var g = S.gear[slot], body;
    if (!g) body = '<span class="pl-ic pl-ic-none"></span><span class="pl-slot-t"><small>' + esc(slotName(slot)) + "</small><b class=\"muted\">" + t("empty") + "</b></span>";
    else {
      var it = D.items[g.id], bits = [];
      if (refinable(it) && g.refine) bits.push("+" + g.refine);
      if (gradable(it) && g.grade && (g.refine || 0) >= D.rules.gradeMinRefine) bits.push(D.weaponGrades[g.grade]);
      if (g.trait && canTrait(g)) bits.push(L(D.traits[g.trait].n));
      var cardsHtml = (g.cards || []).map(function (c) { return D.cards[c] ? ico(D.cards[c].ic, "pl-mini") : ""; }).join("");
      var n = sockets(g), free = Math.max(0, n - (g.cards || []).length);
      for (var i = 0; i < free; i++) cardsHtml += '<span class="pl-mini pl-socket"></span>';
      body = ico(it.ic) + '<span class="pl-slot-t"><small>' + esc(slotName(slot)) + '</small><b>' + esc(it.n) + "</b><em>" + esc(bits.join(" · ")) + "</em>" +
        (cardsHtml ? '<span class="pl-cards">' + cardsHtml + "</span>" : "") + "</span>";
    }
    var rar = g ? " r-" + D.items[g.id].r : "";
    return '<button class="pl-slot' + rar + '" type="button" data-slot="' + slot + '">' + body + "</button>";
  }

  function render() {
    if (!S) return renderPicker();
    var c = cls(), n = counts(), cap = legendCap(), tot = buildTotals();
    var towers = D.rules.towerFloors.map(function (f) {
      return '<label class="pl-chk"><input type="checkbox" data-floor="' + f + '"' + (S.tower.indexOf(f) >= 0 ? " checked" : "") + "> " + f + "</label>";
    }).join("");
    var left = '<div class="pl-col"><section class="pl-box"><h2>' + t("setup") + '</h2>' +
      '<div class="pl-cur" style="background-image:url(' + BASE + "../assets/banners/class-" + c.id + '.png)"><span><img src="' + BASE + "../assets/icons/job_" + c.id + '.png" alt="">' + esc(D.classNames[c.id] || c.name) + '</span></div>' +
      '<button class="btn pl-wide" type="button" data-act="change">' + t("change") + '</button>' +
      '<input class="pl-name" type="text" maxlength="60" placeholder="' + esc(t("untitled")) + '" value="' + esc(S.name) + '" aria-label="' + esc(t("namePrompt")) + '">' +
      '<h3>' + t("sockets") + ' <b class="pl-cap">' + cap + "</b></h3>" +
      '<p class="pl-row muted">' + t("base") + ": " + D.rules.legendBase + "</p>" +
      (c.no_rebirth ? '<p class="pl-row muted">' + t("noReborn") + "</p>" : '<label class="pl-chk"><input type="checkbox" data-act="reborn"' + (S.reborn ? " checked" : "") + "> " + t("reborn") + " (+" + D.rules.legendRebirth + ")</label>") +
      '<p class="pl-row">' + t("tower") + ':</p><div class="pl-towers">' + towers + "</div>" +
      '<button class="btn pl-wide pl-allopen" type="button" data-act="allopen">' + t("allOpen") + "</button>" +
      '<div class="pl-counters"><span class="' + (n.l > cap ? "bad" : "") + '">' + t("legend") + " <b>" + n.l + "/" + cap + '</b></span><span>' + t("unique") + " <b>" + n.u + "/" + D.rules.uniqueMax + '</b></span><span>' + t("soul") + " <b>" + (S.gear.soul ? 1 : 0) + "/1</b></span></div>" +
      '<p class="pl-note muted">' + t("countNote") + "</p></section>" + savedHtml() + "</div>";
    var doll = SLOT_ORDER.filter(function (s) { return s !== "shield" || c.shield || c.dual; }).map(slotCard).join("");
    var center = '<div class="pl-col pl-center"><section class="pl-box"><h2>' + t("equipment") + '</h2><div class="pl-doll">' + doll + "</div>" +
      (c.dual ? '<p class="pl-note muted">' + t("leftHalf") + "</p>" : "") + "</section>" + ppdHtml() + "</div>";
    var rows = Object.keys(D.labels).filter(function (k) { return tot.all[k] && Math.abs(tot.all[k]) > 1e-9; })
      .map(function (k) { return "<tr><td>" + esc(labelOf(k)) + '</td><td class="n">' + fmt(k, tot.all[k]) + "</td></tr>"; }).join("");
    var extra = "";
    var specials = tot.specials.map(function (x) { return "<li>" + ico(x.ic, "pl-mini") + "<span><b>" + esc(x.n) + "</b> " + esc(x.d) + "</span></li>"; }).join("");
    var right = '<div class="pl-col pl-right"><section class="pl-box pl-sticky"><h2>' + t("totals") + "</h2>" +
      (rows || extra ? '<div class="tw"><table><tbody>' + rows + extra + "</tbody></table></div>" : '<p class="muted">' + t("empty") + "</p>") +
      (specials ? "<h3>" + t("effects") + '</h3><ul class="pl-specials">' + specials + "</ul>" : "") +
      '<p class="pl-note muted">' + t("totalsNote") + "</p>" +
      '<button class="btn pl-wide pl-primary" type="button" data-act="save">' + t("save") + '</button>' +
      '<button class="btn pl-wide" type="button" data-act="share">' + t("share") + '</button>' +
      '<button class="btn pl-wide" type="button" data-act="reset">' + t("reset") + "</button></section></div>";
    root.innerHTML = '<div class="pl-grid">' + left + center + right + "</div>";
    wire();
  }

  function chip(kind, key, ic, n, sub) {
    return '<button class="pl-chip" type="button" data-' + kind + '="' + key + '">' + ico(ic, "pl-chip-ic") + '<span><b>' + esc(n) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + '</span><i aria-hidden="true">×</i></button>';
  }
  function addBtn(kind) { return '<button class="pl-chip pl-add" type="button" data-add="' + kind + '">+ ' + t("add") + "</button>"; }
  function ppdHtml() {
    var mp = D.rules.maxPacts, chef = S.chef || 1;
    var pacts = (S.pacts || []).map(function (k) { var tab = D.pactTabs.filter(function (x) { return x.id === D.pacts[k].tab; })[0]; return chip("pact", k, D.pacts[k].ic, pactName(k), tab ? L(tab.n) : ""); }).join("");
    if ((S.pacts || []).length < mp) pacts += addBtn("pact");
    var dishes = (S.dishes || []).slice(0, chef).map(function (k) { return chip("dish", k, D.dishes[k].ic, D.dishes[k].n, ""); }).join("");
    if ((S.dishes || []).length < chef) dishes += addBtn("dish");
    var pet = S.pet ? chip("pet", S.pet, D.pets[S.pet].ic, D.pets[S.pet].n, D.pets[S.pet].mvp ? t("mvpPet") : "") : addBtn("pet");
    return '<section class="pl-box"><h2>' + t("ppd") + "</h2>" +
      "<h3>" + t("pacts") + ' <b class="pl-cap">' + (S.pacts || []).length + "/" + mp + '</b></h3><div class="pl-chips">' + pacts + '</div><p class="pl-note muted">' + t("pactNote") + "</p>" +
      "<h3>" + t("dishes") + ' <b class="pl-cap">' + Math.min((S.dishes || []).length, chef) + "/" + chef + '</b></h3>' +
      '<label class="pl-chef">' + t("chef") + ' <select data-act="chef">' + opts(1, D.rules.chefMax, chef) + '</select></label><div class="pl-chips">' + dishes + '</div><p class="pl-note muted">' + t("chefNote") + "</p>" +
      "<h3>" + t("pet") + '</h3><div class="pl-chips">' + pet + "</div></section>";
  }
  function savedHtml() {
    var a = savedList();
    var list = a.length ? a.map(function (b, i) {
      var c = D.classes.filter(function (x) { return x.id === b.data.cls; })[0];
      return '<li><img src="' + BASE + "../assets/icons/job_" + b.data.cls + '.png" alt=""><span><b>' + esc(b.name || t("untitled")) + "</b><small>" + esc(c ? (D.classNames[c.id] || c.name) : "") + "</small></span>" +
        '<button class="btn" type="button" data-load="' + i + '">' + t("load") + '</button><button class="btn" type="button" data-del="' + i + '" aria-label="' + t("del") + '">×</button></li>';
    }).join("") : '<li class="muted">' + t("noSaved") + "</li>";
    return '<section class="pl-box"><h2>' + t("saved") + '</h2><ul class="pl-saved">' + list + "</ul></section>";
  }

  function wire() {
    root.querySelectorAll(".pl-slot").forEach(function (b) { b.onclick = function () { openEditor(b.getAttribute("data-slot")); }; });
    var q = function (sel) { return root.querySelector(sel); };
    q('[data-act="change"]').onclick = function () { S = null; render(); };
    q(".pl-name").oninput = function (e) { S.name = e.target.value; persist(); };
    var rb = q('[data-act="reborn"]'); if (rb) rb.onchange = function (e) { S.reborn = e.target.checked; persist(); render(); };
    root.querySelectorAll("[data-floor]").forEach(function (cb) {
      cb.onchange = function () { var f = +cb.getAttribute("data-floor"); S.tower = S.tower.filter(function (x) { return x !== f; }); if (cb.checked) S.tower.push(f); S.tower.sort(function (a, b) { return a - b; }); persist(); render(); };
    });
    q('[data-act="allopen"]').onclick = function () { S.reborn = true; S.tower = D.rules.towerFloors.slice(); persist(); render(); };
    q('[data-act="save"]').onclick = function () {
      var a = savedList(), name = S.name || t("untitled"), i = a.map(function (b) { return b.name; }).indexOf(name);
      var entry = { name: name, data: JSON.parse(JSON.stringify(S)), at: Date.now() };
      if (i >= 0) a[i] = entry; else a.unshift(entry);
      setSaved(a.slice(0, 50)); render(); flash(q('[data-act="save"]'), "✓");
    };
    q('[data-act="share"]').onclick = function (e) {
      var url = location.origin + location.pathname + "#b=" + encode(S);
      var btn = e.currentTarget;
      var ok = function () { flash(btn, t("copied")); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, function () { prompt(t("share"), url); });
      else prompt(t("share"), url);
    };
    q('[data-act="reset"]').onclick = function () { S.gear = {}; persist(); render(); };
    root.querySelectorAll("[data-pact]").forEach(function (b) { b.onclick = function () { S.pacts = S.pacts.filter(function (x) { return x !== b.getAttribute("data-pact"); }); persist(); render(); }; });
    root.querySelectorAll("[data-dish]").forEach(function (b) { b.onclick = function () { S.dishes = S.dishes.filter(function (x) { return x !== b.getAttribute("data-dish"); }); persist(); render(); }; });
    root.querySelectorAll("[data-pet]").forEach(function (b) { b.onclick = function () { S.pet = ""; persist(); render(); }; });
    root.querySelectorAll("[data-add]").forEach(function (b) { b.onclick = function () { openEditor("@" + b.getAttribute("data-add")); }; });
    var ch = q('[data-act="chef"]'); if (ch) ch.onchange = function () { S.chef = +ch.value; S.dishes = S.dishes.slice(0, S.chef); persist(); render(); };
    root.querySelectorAll("[data-load]").forEach(function (b) { b.onclick = function () { var x = savedList()[+b.getAttribute("data-load")]; if (x && valid(x.data)) { S = clean(x.data); persist(); render(); window.scrollTo(0, 0); } }; });
    root.querySelectorAll("[data-del]").forEach(function (b) { b.onclick = function () { var a = savedList(); a.splice(+b.getAttribute("data-del"), 1); setSaved(a); render(); }; });
  }
  function flash(btn, txt) { var old = btn.innerHTML; btn.innerHTML = esc(txt); setTimeout(function () { btn.innerHTML = old; }, 1400); }

  /* ---------------- slot editor (modal) ---------------- */
  var modal = null, filt = { q: "", r: "" }, editSlot = null;
  function closeEditor() { if (modal) { modal.remove(); modal = null; document.body.classList.remove("pl-lock"); render(); } }
  function openEditor(slot) {
    editSlot = slot; filt = { q: "", r: "" };
    modal = document.createElement("div");
    modal.className = "pl-modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal); document.body.classList.add("pl-lock");
    modal.addEventListener("click", function (e) { if (e.target === modal) closeEditor(); });
    drawEditor();
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal) closeEditor(); });

  function drawEditor() {
    var slot = editSlot;
    if (slot.charAt(0) === "@") return drawPick(slot.slice(1));
    var g = S.gear[slot];
    var head = '<div class="pl-mhead"><h2>' + esc(slotName(slot)) + '</h2><button class="btn icon" type="button" data-x aria-label="' + t("done") + '">×</button></div>';
    var body = g ? editItemHtml(slot, g) : listHtml(slot);
    modal.innerHTML = '<div class="pl-mbox">' + head + '<div class="pl-mbody">' + body + "</div></div>";
    modal.querySelector("[data-x]").onclick = closeEditor;
    if (g) wireItem(slot, g); else wireList(slot);
  }

  function drawPick(kind) {
    var src = kind === "pact" ? D.pacts : kind === "dish" ? D.dishes : D.pets;
    var chosen = kind === "pact" ? S.pacts : kind === "dish" ? S.dishes : (S.pet ? [S.pet] : []);
    var title = t(kind === "pact" ? "pickPact" : kind === "dish" ? "pickDish" : "pickPet");
    var q = filt.q.toLowerCase();
    var keys = Object.keys(src).filter(function (k) { var n = kind === "pact" ? pactName(k) : src[k].n; return !q || n.toLowerCase().indexOf(q) >= 0 || L(src[k].d).toLowerCase().indexOf(q) >= 0; });
    var row = function (k) {
      var x = src[k], taken = chosen.indexOf(k) >= 0, n = kind === "pact" ? pactName(k) : x.n;
      var sub = kind === "pet" && x.mvp ? t("mvpPet") + (x.sk ? " · " + t("skill") + ": " + L(x.sk) : "") : "";
      return '<button type="button" class="pl-opt' + (taken ? " blocked" : "") + (x.mvp ? " r-l" : "") + '" data-k="' + k + '"' + (taken ? ' aria-disabled="true"' : "") + ">" + ico(x.ic) +
        "<span><b>" + esc(n) + "</b>" + (sub || taken ? "<small>" + esc(sub) + (taken ? (sub ? " · " : "") + t("taken") : "") + "</small>" : "") + (x.d ? "<em>" + esc(L(x.d)) + "</em>" : "") + "</span></button>";
    };
    var list = "";
    if (kind === "pact") {
      D.pactTabs.forEach(function (tab) {
        var ks = keys.filter(function (k) { return src[k].tab === tab.id; }); if (!ks.length) return;
        list += '<h3 class="pl-group">' + esc(L(tab.n)) + "</h3>" + ks.map(row).join("");
      });
      var rest = keys.filter(function (k) { return !D.pactTabs.some(function (tb) { return tb.id === src[k].tab; }); });
      if (rest.length) list += '<h3 class="pl-group">—</h3>' + rest.map(row).join("");
    } else {
      keys.sort(function (a, b) { return ((src[b].mvp || 0) - (src[a].mvp || 0)) || src[a].n.localeCompare(src[b].n); });
      list = keys.map(row).join("");
    }
    modal.innerHTML = '<div class="pl-mbox"><div class="pl-mhead"><h2>' + esc(title) + '</h2><button class="btn icon" type="button" data-x aria-label="' + t("done") + '">×</button></div>' +
      '<div class="pl-mbody"><div class="pl-filter"><input type="search" placeholder="' + esc(t("search")) + '" value="' + esc(filt.q) + '"></div><div class="pl-opts">' + list + "</div></div></div>";
    modal.querySelector("[data-x]").onclick = closeEditor;
    var inp = modal.querySelector(".pl-filter input");
    inp.oninput = function () { filt.q = inp.value; var pos = inp.selectionStart; drawPick(kind); var n2 = modal.querySelector(".pl-filter input"); n2.focus(); n2.setSelectionRange(pos, pos); };
    modal.querySelectorAll(".pl-opt").forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains("blocked")) return;
        var k = b.getAttribute("data-k");
        if (kind === "pact" && S.pacts.length < D.rules.maxPacts) S.pacts.push(k);
        else if (kind === "dish" && S.dishes.length < (S.chef || 1)) S.dishes.push(k);
        else if (kind === "pet") S.pet = k;
        persist(); closeEditor();
      };
    });
    setTimeout(function () { inp.focus(); }, 0);
  }
  function listHtml(slot) {
    var ids = Object.keys(D.items).filter(function (id) { return fitsSlot(slot, id); });
    var rarOrder = { n: 0, p: 1, l: 2, u: 3, s: 4 };
    var present = {}; ids.forEach(function (id) { present[D.items[id].r] = 1; });
    var chips = '<button type="button" class="pill' + (filt.r === "" ? " on" : "") + '" data-r="">' + t("all") + "</button>" +
      ["n", "p", "l", "u", "s"].filter(function (r) { return present[r]; }).map(function (r) {
        return '<button type="button" class="pill r-' + r + (filt.r === r ? " on" : "") + '" data-r="' + r + '">' + t(RAR[r]) + "</button>";
      }).join("");
    var q = filt.q.toLowerCase();
    var rows = ids.filter(function (id) { var it = D.items[id]; return (!filt.r || it.r === filt.r) && (!q || it.n.toLowerCase().indexOf(q) >= 0 || L(it.d).toLowerCase().indexOf(q) >= 0); })
      .sort(function (a, b) { var A = D.items[a], B = D.items[b]; return (rarOrder[B.r] - rarOrder[A.r]) || ((B.rk || 0) - (A.rk || 0)) || A.n.localeCompare(B.n); })
      .map(function (id) {
        var it = D.items[id], why = blockReason(slot, id);
        return '<button type="button" class="pl-opt r-' + it.r + (why ? " blocked" : "") + '" data-id="' + id + '"' + (why ? ' aria-disabled="true" title="' + esc(why) + '"' : "") + ">" +
          ico(it.ic) + '<span><b>' + esc(it.n) + '</b><small>' + t(RAR[it.r]) + (why ? " · " + esc(why) : "") + "</small>" +
          (it.d ? '<em>' + esc(L(it.d)) + "</em>" : statLine(it.m)) + "</span></button>";
      }).join("");
    return '<div class="pl-filter"><input type="search" placeholder="' + esc(t("search")) + '" value="' + esc(filt.q) + '"><div class="pills">' + chips + "</div></div>" +
      '<div class="pl-opts">' + (rows || '<p class="muted">' + t("noResults") + "</p>") + "</div>";
  }
  function statLine(m) { if (!m) return ""; return "<em>" + Object.keys(m).map(function (k) { return esc(labelOf(k)) + " " + fmt(k, m[k]); }).join(" · ") + "</em>"; }
  function wireList(slot) {
    var inp = modal.querySelector(".pl-filter input");
    inp.oninput = function () { filt.q = inp.value; var pos = inp.selectionStart; drawEditor(); var n = modal.querySelector(".pl-filter input"); n.focus(); n.setSelectionRange(pos, pos); };
    modal.querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { filt.r = b.getAttribute("data-r"); drawEditor(); }; });
    modal.querySelectorAll(".pl-opt").forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains("blocked")) return;
        var id = b.getAttribute("data-id"), it = D.items[id];
        S.gear[slot] = { id: id, refine: refinable(it) ? D.rules.maxRefine : 0, slots: it.fs !== undefined ? it.fs : (slotless(it) ? 0 : D.rules.naturalSlots), extra: 0, cards: [], pot: [] };
        if (slot === "weapon" && it.th && S.gear.shield) delete S.gear.shield;
        persist(); drawEditor();
      };
    });
    setTimeout(function () { inp.focus(); }, 0);
  }

  function opts(n0, n1, cur, fmtf) { var s = ""; for (var i = n0; i <= n1; i++) s += '<option value="' + i + '"' + (i === cur ? " selected" : "") + ">" + (fmtf ? fmtf(i) : i) + "</option>"; return s; }
  function editItemHtml(slot, g) {
    var it = D.items[g.id], h = "";
    h += '<div class="pl-ihead r-' + it.r + '">' + ico(it.ic, "pl-big") + '<div><b>' + esc(it.n) + '</b><small>' + t(RAR[it.r]) + "</small>" + (it.d ? "<p>" + esc(L(it.d)) + "</p>" : "") + "</div></div>";
    var own = itemTotals(slot, g), statRows = Object.keys(own.m).filter(function (k) { return Math.abs(own.m[k]) > 1e-9; })
      .map(function (k) { return "<span>" + esc(labelOf(k)) + " <b>" + fmt(k, own.m[k]) + "</b></span>"; }).join("");
    if (statRows) h += '<div class="pl-istats">' + statRows + "</div>";
    if (slot === "shield" && it.s === "weapon") h += '<p class="pl-note muted">' + t("leftHalf") + "</p>";
    var grid = "";
    if (refinable(it)) grid += '<label>' + t("refine") + '<select data-f="refine">' + opts(0, D.rules.maxRefine, g.refine || 0, function (i) { return "+" + i; }) + "</select></label>";
    if (!slotless(it) && it.fs === undefined) grid += '<label>' + t("slotsNat") + '<select data-f="slots">' + opts(0, D.rules.naturalSlots, g.slots || 0) + "</select></label>";
    if (extraCap(it)) grid += '<label>' + t("slotsExtra") + '<select data-f="extra">' + opts(0, extraCap(it), g.extra || 0, function (i) { return "+" + i; }) + "</select></label>";
    if (gradable(it)) {
      var gnames = it.s === "weapon" ? D.weaponGrades : ["—", "D", "C", "B", "A", "S"];
      var okg = (g.refine || 0) >= D.rules.gradeMinRefine;
      grid += '<label>' + t("grade") + '<select data-f="grade"' + (okg ? "" : " disabled") + ">" + opts(0, gnames.length - 1, okg ? (g.grade || 0) : 0, function (i) { return gnames[i] || "—"; }) + "</select>" + (okg ? "" : '<small class="muted">' + t("gradeNeed") + "</small>") + "</label>";
    }
    if (grid) h += '<div class="pl-fields">' + grid + "</div>";
    var n = sockets(g);
    if (n > 0) {
      g.cards = (g.cards || []).slice(0, n);
      var cardOpts = Object.keys(D.cards).filter(function (cid) { return cardFits(it, cid); }).sort(function (a, b) { return (D.cards[b].mvp || 0) - (D.cards[a].mvp || 0) || D.cards[a].n.localeCompare(D.cards[b].n); });
      h += "<h3>" + t("cards") + " (" + (g.cards.length) + "/" + n + ")" + (it.wings && (g.refine || 0) >= 5 ? ' <small class="muted">' + t("wingSlot") + "</small>" : "") + "</h3>" + (it.wings ? '<p class="pl-note muted">' + t("mvpOnly") + "</p>" : "");
      h += '<div class="pl-cardslots">';
      for (var i = 0; i < n; i++) {
        var cur = g.cards[i] || "";
        h += '<div class="pl-cardslot">' + (cur ? ico(D.cards[cur].ic, "pl-cardart") : '<span class="pl-cardart pl-socket"></span>') +
          '<select data-card="' + i + '"><option value="">' + t("none") + "</option>" + cardOpts.map(function (cid) { return '<option value="' + cid + '"' + (cid === cur ? " selected" : "") + ">" + esc(D.cards[cid].n) + (D.cards[cid].mvp ? " (MVP)" : "") + "</option>"; }).join("") + "</select>" +
          (cur && D.cards[cur].d ? "<small>" + esc(L(D.cards[cur].d)) + "</small>" : "") + "</div>";
      }
      h += "</div>";
    }
    if (canTrait(g)) {
      h += "<h3>" + t("trait") + ' <small class="muted">' + t("traitTier") + "</small></h3>";
      var tt = traitTier(g);
      h += '<select data-f="trait" class="pl-full"><option value="">' + t("none") + "</option>" + Object.keys(D.traits).map(function (k) {
        return '<option value="' + k + '"' + (g.trait === k ? " selected" : "") + ">" + esc(L(D.traits[k].n)) + "</option>"; }).join("") + "</select>";
      if (g.trait && D.traits[g.trait]) {
        var tr = D.traits[g.trait], vals = Object.keys(tr.fx).map(function (k) { var v = tr.fx[k][tt - 1]; return k === "poison_stack" ? String(v) : Math.round(v * 1000) / 10 + "%"; });
        var txt = L(tr.txt); vals.forEach(function (v) { txt = txt.replace("%s", v); });
        h += '<p class="pl-note">' + esc(txt) + "</p>";
      }
    }
    if (it.s !== "soul") {
      g.pot = g.pot || [];
      h += "<h3>" + t("pot") + '</h3><div class="pl-pot">';
      for (var p = 0; p < D.potLines; p++) {
        var l = g.pot[p] || {};
        h += '<div class="pl-potline"><span>' + t("line") + " " + (p + 1) + '</span><select data-pk="' + p + '"><option value="">' + t("none") + "</option>" +
          Object.keys(D.pot).map(function (k) { return '<option value="' + k + '"' + (l.k === k ? " selected" : "") + ">" + esc(L(D.pot[k].txt).replace(/%s%%/g, "X%").replace(/%s/g, "X")) + "</option>"; }).join("") +
          '</select><select data-pt="' + p + '"' + (l.k ? "" : " disabled") + ">" + D.potTiers.map(function (tn, ti) { return '<option value="' + (ti + 1) + '"' + ((l.t || 1) === ti + 1 ? " selected" : "") + ">" + esc(L(tn)) + (l.k ? " (" + Math.round(D.pot[l.k].v[ti] * 1000) / 10 + "%)" : "") + "</option>"; }).join("") + "</select></div>";
      }
      h += "</div>";
    }
    h += '<div class="pl-mfoot"><button class="btn" type="button" data-act="remove">' + t("remove") + '</button><button class="btn pl-primary" type="button" data-x2>' + t("done") + "</button></div>";
    return h;
  }
  function wireItem(slot, g) {
    var redraw = function () { persist(); drawEditor(); };
    modal.querySelectorAll("[data-f]").forEach(function (sel) {
      sel.onchange = function () {
        var f = sel.getAttribute("data-f");
        g[f] = f === "trait" ? sel.value : +sel.value;
        if (f === "refine" && g.refine < D.rules.gradeMinRefine) g.grade = 0;
        if (!canTrait(g)) delete g.trait;
        redraw();
      };
    });
    modal.querySelectorAll("[data-card]").forEach(function (sel) {
      sel.onchange = function () { var i = +sel.getAttribute("data-card"); g.cards = g.cards || []; g.cards[i] = sel.value; g.cards = g.cards.map(function (x) { return x || ""; }); while (g.cards.length && !g.cards[g.cards.length - 1]) g.cards.pop(); redraw(); };
    });
    modal.querySelectorAll("[data-pk]").forEach(function (sel) {
      sel.onchange = function () { var i = +sel.getAttribute("data-pk"); g.pot[i] = sel.value ? { k: sel.value, t: (g.pot[i] && g.pot[i].t) || 1 } : null; redraw(); };
    });
    modal.querySelectorAll("[data-pt]").forEach(function (sel) {
      sel.onchange = function () { var i = +sel.getAttribute("data-pt"); if (g.pot[i]) g.pot[i].t = +sel.value; redraw(); };
    });
    modal.querySelector('[data-act="remove"]').onclick = function () { delete S.gear[slot]; persist(); drawEditor(); };
    modal.querySelector("[data-x2]").onclick = closeEditor;
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("langchange", function () { if (!D) return; if (modal) drawEditor(); else render(); });
  fetch(BASE + "data.json?v=" + (root.getAttribute("data-v") || "")).then(function (r) { return r.json(); }).then(function (data) {
    D = data;
    D.classNames = {};
    D.classes.forEach(function (c) { D.classNames[c.id] = c.id === "kagerou" ? "Kagerou / Oboro" : c.id === "clown" ? "Clown / Gypsy" : c.name; });
    var m = location.hash.match(/#b=([\w-]+)/);
    if (m) { try { var o = decode(m[1]); if (valid(o)) { S = clean(o); persist(); } } catch (e) {} history.replaceState(null, "", location.pathname); }
    if (!S) { try { var c = JSON.parse(localStorage.getItem(LS_CUR) || "null"); if (valid(c)) S = clean(c); } catch (e) {} }
    render();
  }).catch(function () { root.innerHTML = '<p class="muted">Could not load the planner data.</p>'; });
})();
