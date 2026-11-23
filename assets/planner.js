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
    tower: ["Endless Tower: highest floor", "Endless Tower: andar mais alto", "Endless Tower: piso más alto", "無盡之塔：最高樓層"],
    towerNote: ["Legend floors (20, 40, 60, 80, 100) give legendary sockets; power floors (10, 30…) +10% damage and HP each.", "Andares de lenda (20, 40, 60, 80, 100) dão slots lendários; andares de poder (10, 30…) +10% de dano e vida cada.", "Los pisos de leyenda (20, 40, 60, 80, 100) dan ranuras legendarias; los de poder (10, 30…) +10% de daño y vida cada uno.", "傳說樓層（20、40、60、80、100）給傳說欄位；力量樓層（10、30…）每層 +10% 傷害與生命。"],
    classBonus: ["Class bonus", "Bônus da classe", "Bono de clase", "職業加成"],
    dmgMore: ["Class damage multiplier", "Multiplicador de dano da classe", "Multiplicador de daño de clase", "職業傷害倍率"],
    statCap: ["Stat cap (full value)", "Limite de atributo (valor cheio)", "Límite de atributo (valor completo)", "能力值上限（全額）"],
    sets: ["Active sets", "Conjuntos ativos", "Conjuntos activos", "啟動的套裝"],
    sk: ["Upgrade priority and banishes", "Prioridade de upgrades e banidos", "Prioridad de mejoras y destierros", "強化優先順序與放逐"],
    prio: ["Upgrade priority", "Prioridade de upgrades", "Prioridad de mejoras", "強化優先順序"],
    upgrade: ["Upgrade", "Upgrade", "Mejora", "強化"],
    limit: ["Level limit", "Limite", "Límite", "上限"],
    banLimit: ["Banish at limit", "Banir no limite", "Desterrar al límite", "達上限放逐"],
    noLimit: ["no limit", "sem limite", "sin límite", "無上限"],
    fill: ["Slots and evolutions first", "Slots e evoluções primeiro", "Ranuras y evoluciones primero", "優先欄位與進化"],
    prioNote: ["The game takes the highest upgrade on this list that it offers you. Past level 10 each level is worth half, past 150 a quarter.", "O jogo pega o upgrade mais alto desta lista que aparecer. Depois do nível 10 cada nível vale metade, depois do 150 um quarto.", "El juego toma la mejora más alta de esta lista que te ofrezca. Pasado el nivel 10 cada nivel vale la mitad, pasado 150 un cuarto.", "遊戲會選擇此清單中最上方出現的強化。10 級後每級效果減半，150 級後剩四分之一。"],
    banish: ["Banish (Holy Water)", "Banir (Holy Water)", "Desterrar (Holy Water)", "放逐（聖水）"],
    holy: ["Holy Water upgrade", "Upgrade Holy Water", "Mejora Holy Water", "聖水強化"],
    favs: ["Favourites", "Favoritos", "Favoritos", "最愛"],
    favNote: ["Favourites show up twice as often.", "Favoritos aparecem duas vezes mais.", "Los favoritos aparecen el doble.", "最愛出現機率加倍。"],
    pickUp: ["Add to priority", "Adicionar à prioridade", "Agregar a la prioridad", "加入優先順序"],
    pickBan: ["Banish", "Banir", "Desterrar", "放逐"],
    pickFav: ["Favourite", "Favorito", "Favorito", "最愛"],
    banned: ["Banished", "Banido", "Desterrado", "已放逐"],
    up: ["Move up", "Subir", "Subir", "上移"], down: ["Move down", "Descer", "Bajar", "下移"],
    stat: ["Attribute", "Atributo", "Atributo", "能力值"], passive: ["Passive", "Passiva", "Pasiva", "被動"], active: ["Skill", "Skill", "Habilidad", "主動"],
    img: ["Export as image", "Exportar imagem", "Exportar imagen", "匯出圖片"],
    imgTitle: ["Build image", "Imagem da build", "Imagen de la build", "配裝圖片"],
    download: ["Download PNG", "Baixar PNG", "Descargar PNG", "下載 PNG"],
    copyImg: ["Copy image", "Copiar imagem", "Copiar imagen", "複製圖片"],
    imgCopied: ["Image copied: paste it on Discord", "Imagem copiada: cole no Discord", "Imagen copiada: pégala en Discord", "已複製圖片，可貼到 Discord"],
    making: ["Drawing…", "Desenhando…", "Dibujando…", "繪製中…"],
    dup: ["Duplicate build", "Duplicar build", "Duplicar build", "複製配裝"],
    dupDone: ["Copy created and saved", "Cópia criada e salva", "Copia creada y guardada", "已建立並儲存副本"],
    copyOf: ["copy", "cópia", "copia", "副本"],
    dupShort: ["Copy", "Copiar", "Copiar", "複製"],
    harmony: ["Refine harmony", "Harmonia de grade", "Armonía de grado", "等級和諧"],
    harmonyTxt: ["5+ graded armour pieces: every grade bonus counts", "5+ peças de armadura com grade: cada bônus de grade conta", "5+ piezas de armadura con grado: cada bono de grado cuenta", "5 件以上有等級的防具：等級加成額外計算"],
    soulOff: ["Soul slot opens on a reborn class (or a class that does not rebirth): this soul is not active yet.", "O slot de alma abre na classe renascida (ou que não renasce): esta alma ainda não está ativa.", "La ranura de alma se abre con la clase renacida (o que no renace): esta alma aún no está activa.", "靈魂欄位在職業轉生後開啟（或不轉生的職業）：此靈魂尚未生效。"],
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
    skill: ["Skill", "Skill", "Habilidad", "技能"],
    ap: ["Album and Plagiarism", "Álbum e Plagiarism", "Álbum y Plagiarism", "卡冊與剽竊"],
    album: ["Album", "Álbum", "Álbum", "卡冊"],
    albumLv: ["Card Album upgrade", "Upgrade Card Album", "Mejora Card Album", "Card Album 強化"],
    albumNote: ["Album cards work in every run, whatever the slot. 1 slot, +1 per Card Album level (Sage).", "As cartas do álbum valem em toda run, de qualquer tipo. 1 slot, +1 por nível do Card Album (Sage).", "Las cartas del álbum valen en cada partida, de cualquier tipo. 1 ranura, +1 por nivel de Card Album (Sage).", "卡冊卡片每場遊戲都有效，不限部位。1 格，Card Album（賢者）每級 +1。"],
    pickCard: ["Choose a card", "Escolha uma carta", "Elige una carta", "選擇卡片"],
    plag: ["Plagiarism", "Plagiarism", "Plagiarism", "剽竊"],
    plagAny: ["1 copied skill shared with every class. Copy it by defeating the MVP with a Thief, Rogue or Assassin.", "1 skill copiada, compartilhada com todas as classes. Copie derrotando o MVP com um Thief, Rogue ou Assassin.", "1 habilidad copiada, compartida con todas las clases. Cópiala derrotando al MVP con un Thief, Rogue o Assassin.", "1 個複製技能，所有職業共用。用 Thief、Rogue 或 Assassin 打倒 MVP 複製。"],
    plagRogue: ["Rogue / Stalker: up to 3 copied skills.", "Rogue / Stalker: até 3 skills copiadas.", "Rogue / Stalker: hasta 3 habilidades copiadas.", "Rogue / Stalker：最多 3 個複製技能。"],
    pickPlag: ["Choose a copied skill", "Escolha uma skill copiada", "Elige una habilidad copiada", "選擇複製技能"],
    from: ["from", "de", "de", "來自"]
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
    return r.legendBase + ((S.reborn || c.no_rebirth) ? r.legendRebirth : 0) + towerCount("legend");
  }
  function towerCount(kind) { return D.rules.towerRewards.filter(function (x) { return x[1] === kind && x[0] <= (S.towerTop || 0); }).length; }
  function soulOpen() { return !!(S.reborn || cls().no_rebirth); }
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
  function noRoll(it) { return it.r === "l" || it.r === "u" || !!it.wings; }   // legendaries, uniques and Tower wings drop with 0 slots (Equipment.make(id, 0))
  function natSlots(g) { var it = D.items[g.id]; return it.fs !== undefined ? it.fs : (slotless(it) || noRoll(it) ? 0 : (g.slots || 0)); }
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
    var mult = D.itemTiers[Math.max(0, Math.min(3, natSlots(g)))], grow = it.rg ? 1 + D.rules.refineStep * r : 1;
    var k;
    for (k in it.m || {}) { var v = it.m[k] * mult; if (it.hel && v > 0 && D.rules.helKeep.indexOf(k) < 0) v *= D.rules.helMult; add(m, k, v > 0 ? v * grow : v); }
    for (k in it.rf || {}) add(m, k, it.rf[k] * r);
    if (it.s === "weapon" && r > (it.safe || 0)) add(m, "dmg", D.rules.overDmg * (r - it.safe));
    (g.pot || []).forEach(function (l) {
      if (!l || !l.k) return; var p = D.pot[l.k]; if (!p) return;
      var val = p.v[Math.min(p.v.length - 1, Math.max(0, (l.t || 1) - 1))];
      if (p.mod) add(m, p.mod, val);
      (p.fx || []).forEach(function (e) { add(fx, e, val * (it.th ? 1 + D.rules.twoHandBonus : 1)); });
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
    if (it.s !== "soul" || soulOpen()) for (k in it.fx || {}) add(fx, k, it.fx[k]);
    if (it.wings) { var wf = wingFx(r); for (k in wf) add(fx, k, wf[k]);
      if (wf.wing_card) (g.cards || []).forEach(function (cid) { var c = D.cards[cid]; if (c) for (var kk in c.fx || {}) if (c.fx[kk] > 0) add(fx, kk, c.fx[kk] * wf.wing_card); }); }
    if (g.trait && canTrait(g)) {
      var tr = D.traits[g.trait];
      if (tr) for (k in tr.fx) add(fx, k, tr.fx[k][traitTier(g) - 1]);
    }
    if (slot === "shield" && it.s === "weapon") for (k in m) m[k] *= D.rules.offhandShare;
    return { m: m, fx: fx };
  }
  function wingFx(r) {
    var f = {}, cap = (r >= 1 ? 2 : 0) + (r >= 4 ? 2 : 0) + (r >= 10 ? 5 : 0);
    if (cap) f.wing_stat_cap = cap;
    if (r >= 2) f.wing_stun = 1; if (r >= 3) f.wing_card = r >= 8 ? 0.3 : 0.15; if (r >= 5) f.wing_ymir = 0.5;
    if (r >= 6) f.wing_break_cd = 0.3; if (r >= 7) f.wing_fill = 0.25; if (r >= 9) f.wing_broken = 0.2;
    return f;
  }
  function harmony() {
    var n = 0, low = 99;
    D.rules.harmonySlots.forEach(function (k) {
      var g = S.gear[k]; if (!g) return; var it = D.items[g.id];
      if (!it || it.s === "weapon" || !D.gearGrades[it.s] || (it.s === "low" && it.face)) return;
      n++; var gr = (g.refine || 0) >= D.rules.gradeMinRefine ? (g.grade || 0) : 0; if (gr < low) low = gr;
    });
    var lv = n >= D.rules.harmonyMin && low < 99 ? low : 0, out = {};
    if (lv > 0) {
      var share = D.rules.harmonyShare[Math.min(lv, D.rules.harmonyShare.length - 1)];
      D.rules.harmonySlots.forEach(function (k) {
        var g = S.gear[k]; if (!g) return; var it = D.items[g.id], gr = (g.refine || 0) >= D.rules.gradeMinRefine ? (g.grade || 0) : 0;
        if (!it || it.s === "weapon" || !D.gearGrades[it.s] || gr <= 0) return;
        var gg = D.gearGrades[it.s]; gg.keys.forEach(function (kk) { add(out, kk, gg.vals[gr] * share); });
      });
    }
    return { lv: lv, m: out };
  }
  function activeSets() {
    var have = {}, cards = (S.album || []).slice(0, albumCap()).slice();
    for (var k in S.gear) { var g = S.gear[k]; if (!g) continue; have[g.id] = 1; if (D.items[g.id] && D.items[g.id].base) have[D.items[g.id].base] = 1; (g.cards || []).forEach(function (c) { if (c) cards.push(c); }); }
    var out = [];
    for (var id in D.sets) {
      var st = D.sets[id];
      if (st.more) {
        var worn = st.items.concat(st.more).filter(function (i) { return have[i]; }).length;
        if (worn >= 2) out.push({ id: id, full: false });
        if (worn >= 4) out.push({ id: id, full: true });
        continue;
      }
      var ok = st.items.every(function (i) { return have[i]; }) && (st.cards || []).every(function (c) { return cards.indexOf(c) >= 0; });
      if (ok) out.push({ id: id, full: false });
    }
    return out;
  }
  function jobBonus() { var c = cls(); return (S.reborn && c.jbT) || c.jb || null; }
  function buildTotals() {
    var all = {}, raw = {}, specials = [], seen = {};
    function special(key, ic, n, d) { if (!seen[key] && d) { seen[key] = 1; specials.push({ ic: ic, n: n, d: d }); } }
    function take(src, key, ic, n, d, always) {
      var k, odd = false;
      for (k in src.m || {}) { add(raw, k, src.m[k]); if (D.labels[k]) add(all, k, src.m[k]); else odd = true; }
      for (k in src.fx || {}) { add(raw, k, src.fx[k]); if (/^(lg_|u_)/.test(k)) odd = true; else if (D.labels[k]) add(all, k, src.fx[k]); else if (!/^wing_/.test(k)) odd = true; }
      if (odd || always) special(key, ic, n, d);
    }
    SLOT_ORDER.forEach(function (slot) {
      var g = S.gear[slot]; if (!g) return;
      var it = D.items[g.id], r = itemTotals(slot, g);
      take({ m: r.m, fx: r.fx }, "i" + g.id, it.ic, it.n, L(it.d));
    });
    var hm = harmony(); for (var hk in hm.m) add(all, hk, hm.m[hk]);
    var sets = activeSets();
    sets.forEach(function (x) { var st = D.sets[x.id]; take({ m: x.full ? st.fm : st.m, fx: x.full ? st.ffx : st.fx }, "set" + x.id + x.full, null, L(st.n) + (x.full ? " (4)" : ""), L(x.full ? st.fd : st.d), true); });
    var jb = jobBonus(); if (jb) { add(all, "dmg", jb.dmg); add(all, "max_hp_pct", jb.hp); }
    var pw = towerCount("power") * D.rules.towerPower; if (pw) { add(all, "dmg", pw); add(all, "max_hp_pct", pw); }
    var tens = Math.min(S.towerTop || 0, D.rules.towerGearTop) / D.rules.towerTier;
    if (raw.tower_dmg) add(all, "dmg", raw.tower_dmg * tens); if (raw.tower_hp) add(all, "max_hp_pct", raw.tower_hp * tens);
    (S.album || []).slice(0, albumCap()).forEach(function (cid) { var c = D.cards[cid]; if (c) take(c, "c" + cid, c.ic, c.n, L(c.d)); });
    (S.pacts || []).forEach(function (k) { var p = D.pacts[k]; if (p) take(p, "p" + k, p.ic, pactName(k), L(p.d), !p.m && !p.fx); });
    (S.dishes || []).slice(0, S.chef || 1).forEach(function (k) { var d = D.dishes[k]; if (d) take(d, "d" + k, d.ic, d.n, L(d.d), true); });
    if (S.pet && D.pets[S.pet]) { var pt = D.pets[S.pet]; take(pt, "pet" + S.pet, pt.ic, pt.n, L(pt.d), !!pt.mvp); }
    if (raw.status_dmg) ["poison_dmg", "bleed_dmg", "burn_power"].forEach(function (k) { add(all, k, raw.status_dmg); });
    return { all: all, raw: raw, specials: specials, sets: sets, harmony: hm.lv, jb: jb };
  }
  var STATS = ["str", "agi", "vit", "int", "dex", "luk"];
  function upInfo(id) {
    if (STATS.indexOf(id) >= 0) return { n: id.toUpperCase(), ic: null, kind: "stat" };
    var x = D.skills[id] || D.plag[id];
    return x ? { n: x.n, ic: x.ic, kind: x.pas ? "passive" : "active", d: x.d } : null;
  }
  function upPool() {
    var c = cls(), ids = (c.own || []).slice();
    (S.plag || []).forEach(function (k) { if (ids.indexOf(k) < 0) ids.push(k); });
    return ids.concat(STATS);
  }
  function albumCap() { return D.rules.albumBase + (S.albumLv || 0); }
  function plagCap() { return cls().rogue ? D.rules.plagRogue : D.rules.plagAny; }
  function plagOptions() { var own = cls().own || []; return Object.keys(D.plag).filter(function (k) { return own.indexOf(k) < 0; }); }
  function pactName(k) { var n = D.pacts[k].n; if (!n) return k; var en = n.en.replace(/^Pact of (the )?/i, "").replace(/ Pact$/, ""); en = en.charAt(0).toUpperCase() + en.slice(1); return lang() === "en" ? en : en + " (" + L(n) + ")"; }
  function fmt(k, v) {
    var lab = D.labels[k], pct = lab ? lab.pct : Math.abs(v) < 5;
    if (pct) { var p = Math.round(v * 1000) / 10; return (p > 0 ? "+" : "") + p + "%"; }
    var n = Math.round(v * 100) / 100; return (n > 0 ? "+" : "") + n;
  }
  function labelOf(k) { return D.labels[k] ? L(D.labels[k].n) : k.replace(/_/g, " "); }

  /* ---------------- state ---------------- */
  function fresh(c) { return { v: 1, cls: c, name: "", reborn: true, towerTop: 100, gear: {}, pacts: [], dishes: [], chef: D.rules.chefMax, pet: "", album: [], albumLv: D.rules.albumUpgrades, plag: [], prio: [], banish: [], favs: [], holy: D.rules.holyMax, fill: true }; }
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
    return { v: 1, cls: o.cls, name: String(o.name || "").slice(0, 60), reborn: !!o.reborn, towerTop: Math.max(0, Math.min(D.rules.towerGearTop, o.towerTop !== undefined ? +o.towerTop || 0 : Math.max.apply(null, [0].concat(o.tower || [])))), gear: g,
      pacts: uniq(o.pacts, D.pacts, D.rules.maxPacts), dishes: uniq(o.dishes, D.dishes, D.rules.chefMax), chef: chef, pet: D.pets[o.pet] ? o.pet : "",
      albumLv: Math.max(0, Math.min(D.rules.albumUpgrades, o.albumLv === undefined ? D.rules.albumUpgrades : +o.albumLv)),
      album: uniq(o.album, D.cards, D.rules.albumBase + D.rules.albumUpgrades), plag: uniq(o.plag, D.plag, D.rules.plagRogue),
      prio: (o.prio || []).filter(function (x, i, a) { return x && upInfo(x.id) && a.map(function (y) { return y && y.id; }).indexOf(x.id) === i; }).map(function (x) { return { id: x.id, lim: Math.max(0, Math.min(999, +x.lim || 0)), ban: !!x.ban }; }),
      banish: (o.banish || []).filter(function (x, i, a) { return upInfo(x) && a.indexOf(x) === i; }).slice(0, D.rules.holyMax),
      favs: (o.favs || []).filter(function (x, i, a) { return upInfo(x) && a.indexOf(x) === i; }).slice(0, D.rules.favMax),
      holy: Math.max(0, Math.min(D.rules.holyMax, o.holy === undefined ? D.rules.holyMax : +o.holy)), fill: o.fill === undefined ? true : !!o.fill };
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
    var tops = ""; for (var fl = 0; fl <= D.rules.towerGearTop; fl += 10) tops += '<option value="' + fl + '"' + (fl === (S.towerTop || 0) ? " selected" : "") + ">" + fl + "</option>";
    var towers = '<select data-act="tower">' + tops + "</select>";
    var left = '<div class="pl-col"><section class="pl-box"><h2>' + t("setup") + '</h2>' +
      '<div class="pl-cur" style="background-image:url(' + BASE + "../assets/banners/class-" + c.id + '.png)"><span><img src="' + BASE + "../assets/icons/job_" + c.id + '.png" alt="">' + esc(D.classNames[c.id] || c.name) + '</span></div>' +
      '<button class="btn pl-wide" type="button" data-act="change">' + t("change") + '</button>' +
      '<input class="pl-name" type="text" maxlength="60" placeholder="' + esc(t("untitled")) + '" value="' + esc(S.name) + '" aria-label="' + esc(t("namePrompt")) + '">' +
      '<h3>' + t("sockets") + ' <b class="pl-cap">' + cap + "</b></h3>" +
      '<p class="pl-row muted">' + t("base") + ": " + D.rules.legendBase + "</p>" +
      (c.no_rebirth ? '<p class="pl-row muted">' + t("noReborn") + "</p>" : '<label class="pl-chk"><input type="checkbox" data-act="reborn"' + (S.reborn ? " checked" : "") + "> " + t("reborn") + " (+" + D.rules.legendRebirth + ")</label>") +
      '<label class="pl-chef">' + t("tower") + " " + towers + '</label><p class="pl-note muted">' + t("towerNote") + "</p>" +
      '<button class="btn pl-wide pl-allopen" type="button" data-act="allopen">' + t("allOpen") + "</button>" +
      '<div class="pl-counters"><span class="' + (n.l > cap ? "bad" : "") + '">' + t("legend") + " <b>" + n.l + "/" + cap + '</b></span><span>' + t("unique") + " <b>" + n.u + "/" + D.rules.uniqueMax + '</b></span><span>' + t("soul") + " <b>" + (S.gear.soul ? 1 : 0) + "/1</b></span></div>" +
      '<p class="pl-note muted">' + t("countNote") + "</p></section>" + savedHtml() + "</div>";
    var doll = SLOT_ORDER.filter(function (s) { return s !== "shield" || c.shield || c.dual; }).map(slotCard).join("");
    var center = '<div class="pl-col pl-center"><section class="pl-box"><h2>' + t("equipment") + '</h2><div class="pl-doll">' + doll + "</div>" +
      (c.dual ? '<p class="pl-note muted">' + t("leftHalf") + "</p>" : "") + "</section>" + apHtml() + ppdHtml() + skHtml() + "</div>";
    var rows = Object.keys(D.labels).filter(function (k) { return tot.all[k] && Math.abs(tot.all[k]) > 1e-9; })
      .map(function (k) { return "<tr><td>" + esc(labelOf(k)) + '</td><td class="n">' + fmt(k, tot.all[k]) + "</td></tr>"; }).join("");
    var extra = "";
    var jbx = tot.jb;
    if (jbx && jbx.more && jbx.more !== 1) extra += "<tr><td>" + t("dmgMore") + '</td><td class="n">×' + jbx.more + "</td></tr>";
    extra += "<tr><td>" + t("statCap") + '</td><td class="n">' + (D.rules.maxStat + (tot.raw.wing_stat_cap || 0)) + "</td></tr>";
    if (tot.harmony) extra += "<tr><td>" + t("harmony") + '</td><td class="n">' + D.weaponGrades[tot.harmony] + "</td></tr>";
    var specials = tot.specials.map(function (x) { return "<li>" + ico(x.ic, "pl-mini") + "<span><b>" + esc(x.n) + "</b> " + esc(x.d) + "</span></li>"; }).join("");
    var right = '<div class="pl-col pl-right"><section class="pl-box pl-sticky"><h2>' + t("totals") + "</h2>" +
      (rows || extra ? '<div class="tw"><table><tbody>' + rows + extra + "</tbody></table></div>" : '<p class="muted">' + t("empty") + "</p>") +
      (jbx ? '<p class="pl-note">' + t("classBonus") + ": +" + Math.round(jbx.dmg * 100) + "% " + esc(labelOf("dmg")) + ", +" + Math.round(jbx.hp * 100) + "% " + esc(labelOf("max_hp_pct")) + (jbx.more !== 1 ? ", ×" + jbx.more : "") + "</p>" : "") +
      (S.gear.soul && !soulOpen() ? '<p class="pl-note bad-note">' + t("soulOff") + "</p>" : "") +
      (specials ? "<h3>" + t("effects") + '</h3><ul class="pl-specials">' + specials + "</ul>" : "") +
      '<p class="pl-note muted">' + t("totalsNote") + "</p>" +
      '<button class="btn pl-wide pl-primary" type="button" data-act="save">' + t("save") + '</button>' +
      '<button class="btn pl-wide" type="button" data-act="share">' + t("share") + '</button>' +
      '<button class="btn pl-wide" type="button" data-act="dup">' + t("dup") + '</button>' +
      '<button class="btn pl-wide" type="button" data-act="image">' + t("img") + '</button>' +
      '<button class="btn pl-wide" type="button" data-act="reset">' + t("reset") + "</button></section></div>";
    root.innerHTML = '<div class="pl-grid">' + left + center + right + "</div>";
    wire();
  }

  function chip(kind, key, ic, n, sub) {
    return '<button class="pl-chip" type="button" data-' + kind + '="' + key + '">' + ico(ic, "pl-chip-ic") + '<span><b>' + esc(n) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + '</span><i aria-hidden="true">×</i></button>';
  }
  function addBtn(kind) { return '<button class="pl-chip pl-add" type="button" data-add="' + kind + '">+ ' + t("add") + "</button>"; }
  function apHtml() {
    var cap = albumCap(), pc = plagCap();
    var cards = (S.album || []).slice(0, cap).map(function (cid) { var c = D.cards[cid]; return chip("album", cid, c.ic, c.n, c.mvp ? "MVP" : ""); }).join("");
    if ((S.album || []).length < cap) cards += addBtn("album");
    var plags = (S.plag || []).filter(function (k) { return plagOptions().indexOf(k) >= 0; }).slice(0, pc)
      .map(function (k) { var x = D.plag[k]; return chip("plag", k, x.ic, x.n, t("from") + " " + x.boss); }).join("");
    if ((S.plag || []).length < pc) plags += addBtn("plag");
    var lv = ""; for (var i = 0; i <= D.rules.albumUpgrades; i++) lv += '<option value="' + i + '"' + (i === (S.albumLv || 0) ? " selected" : "") + ">" + i + " (" + (D.rules.albumBase + i) + ")</option>";
    return '<section class="pl-box"><h2>' + t("ap") + "</h2>" +
      "<h3>" + t("album") + ' <b class="pl-cap">' + Math.min((S.album || []).length, cap) + "/" + cap + "</b></h3>" +
      '<label class="pl-chef">' + t("albumLv") + ' <select data-act="albumlv">' + lv + '</select></label><div class="pl-chips">' + cards + '</div><p class="pl-note muted">' + t("albumNote") + "</p>" +
      "<h3>" + t("plag") + ' <b class="pl-cap">' + Math.min((S.plag || []).length, pc) + "/" + pc + '</b></h3><div class="pl-chips">' + plags + '</div><p class="pl-note muted">' + (cls().rogue ? t("plagRogue") : t("plagAny")) + "</p></section>";
  }
  function upIcon(id) { var x = upInfo(id); return x && x.ic ? ico(x.ic, "pl-mini pl-skic") : '<span class="pl-stat" aria-hidden="true">◆</span>'; }
  function skHtml() {
    var pool = upPool(), prio = (S.prio || []).filter(function (p) { return pool.indexOf(p.id) >= 0; });
    var rows = prio.map(function (p, i) {
      var x = upInfo(p.id), bad = (S.banish || []).indexOf(p.id) >= 0;
      return '<tr' + (bad ? ' class="pl-bad"' : "") + '><td class="n">' + (i + 1) + "</td><td>" + upIcon(p.id) + " <b>" + esc(x.n) + "</b>" + (bad ? ' <small class="muted">(' + t("banned") + ")</small>" : "") + "</td>" +
        '<td><input class="pl-lim" type="number" min="0" max="999" placeholder="' + esc(t("noLimit")) + '" value="' + (p.lim || "") + '" data-lim="' + i + '"></td>' +
        '<td class="n"><input type="checkbox" data-ban="' + i + '"' + (p.ban ? " checked" : "") + (p.lim ? "" : " disabled") + "></td>" +
        '<td class="pl-move"><button type="button" class="btn" data-mv="' + i + ':-1" aria-label="' + t("up") + '"' + (i ? "" : " disabled") + '>▲</button><button type="button" class="btn" data-mv="' + i + ':1" aria-label="' + t("down") + '"' + (i < prio.length - 1 ? "" : " disabled") + '>▼</button><button type="button" class="btn" data-rm="' + i + '" aria-label="' + t("del") + '">×</button></td></tr>';
    }).join("");
    var left = prio.length < pool.length ? '<button class="pl-chip pl-add" type="button" data-add="prio">+ ' + t("pickUp") + "</button>" : "";
    var bans = (S.banish || []).filter(function (k) { return pool.indexOf(k) >= 0; }).map(function (k) { var x = upInfo(k); return '<button class="pill x pl-banpill" type="button" data-unban="' + k + '">' + esc(x.n) + "</button>"; }).join("");
    var hv = ""; for (var i = 0; i <= D.rules.holyMax; i++) hv += '<option value="' + i + '"' + (i === (S.holy || 0) ? " selected" : "") + ">" + i + "</option>";
    var favs = (S.favs || []).map(function (k) { var x = upInfo(k); return chip("fav", k, x.ic, x.n, ""); }).join("");
    if ((S.favs || []).length < D.rules.favMax) favs += addBtn("fav");
    return '<section class="pl-box"><h2>' + t("sk") + '</h2><div class="two prio pl-sk"><div>' +
      "<h3>" + t("prio") + '</h3><label class="pl-chk"><input type="checkbox" data-act="fill"' + (S.fill ? " checked" : "") + "> " + t("fill") + "</label>" +
      '<div class="tw"><table class="pl-prio"><thead><tr><th>#</th><th>' + t("upgrade") + "</th><th>" + t("limit") + "</th><th>" + t("banLimit") + "</th><th></th></tr></thead><tbody>" + rows + "</tbody></table></div>" + left +
      '<p class="pl-note muted">' + t("prioNote") + "</p></div><div>" +
      "<h3>" + t("banish") + ' <b class="pl-cap">' + (S.banish || []).length + "/" + (S.holy || 0) + '</b></h3><label class="pl-chef">' + t("holy") + ' <select data-act="holy">' + hv + "</select></label>" +
      '<div class="pills">' + bans + ((S.banish || []).length < (S.holy || 0) ? '<button class="pill pl-add-pill" type="button" data-add="ban">+ ' + t("pickBan") + "</button>" : "") + "</div>" +
      "<h3>" + t("favs") + ' <b class="pl-cap">' + (S.favs || []).length + "/" + D.rules.favMax + '</b></h3><div class="pl-chips">' + favs + '</div><p class="pl-note muted">' + t("favNote") + "</p></div></div></section>";
  }
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
        '<button class="btn" type="button" data-load="' + i + '">' + t("load") + '</button><button class="btn" type="button" data-dup="' + i + '" title="' + t("dup") + '">' + t("dupShort") + '</button><button class="btn" type="button" data-del="' + i + '" aria-label="' + t("del") + '">×</button></li>';
    }).join("") : '<li class="muted">' + t("noSaved") + "</li>";
    return '<section class="pl-box"><h2>' + t("saved") + '</h2><ul class="pl-saved">' + list + "</ul></section>";
  }

  function wire() {
    root.querySelectorAll(".pl-slot").forEach(function (b) { b.onclick = function () { openEditor(b.getAttribute("data-slot")); }; });
    var q = function (sel) { return root.querySelector(sel); };
    q('[data-act="change"]').onclick = function () { S = null; render(); };
    q(".pl-name").oninput = function (e) { S.name = e.target.value; persist(); };
    var rb = q('[data-act="reborn"]'); if (rb) rb.onchange = function (e) { S.reborn = e.target.checked; persist(); render(); };
    var tw = q('[data-act="tower"]'); if (tw) tw.onchange = function () { S.towerTop = +tw.value; persist(); render(); };
    q('[data-act="allopen"]').onclick = function () { S.reborn = true; S.towerTop = Math.max(S.towerTop || 0, 100); persist(); render(); };
    function uniqueName(base) {
      var names = savedList().map(function (b) { return b.name; }), root2 = String(base || t("untitled")).replace(/ \((?:copy|cópia|copia|副本)(?: \d+)?\)$/, "");
      var n = root2 + " (" + t("copyOf") + ")", k = 2;
      while (names.indexOf(n) >= 0) n = root2 + " (" + t("copyOf") + " " + (k++) + ")";
      return n;
    }
    function saveEntry(state) {
      var a = savedList(), i = a.map(function (b) { return b.name; }).indexOf(state.name);
      var e = { name: state.name, data: JSON.parse(JSON.stringify(state)), at: Date.now() };
      if (i >= 0) a[i] = e; else a.unshift(e); setSaved(a.slice(0, 50));
    }
    q('[data-act="dup"]').onclick = function () {
      if (!S.name) S.name = t("untitled");
      saveEntry(S);
      var copy = JSON.parse(JSON.stringify(S)); copy.name = uniqueName(S.name);
      saveEntry(copy); S = clean(copy); persist(); render(); window.scrollTo(0, 0);
      flash(root.querySelector('[data-act="dup"]'), t("dupDone"));
    };
    root.querySelectorAll("[data-dup]").forEach(function (b) { b.onclick = function () {
      var x = savedList()[+b.getAttribute("data-dup")]; if (!x || !valid(x.data)) return;
      var copy = clean(x.data); copy.name = uniqueName(x.name); saveEntry(copy); S = copy; persist(); render(); window.scrollTo(0, 0);
    }; });
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
    q('[data-act="image"]').onclick = openImage;
    root.querySelectorAll("[data-pact]").forEach(function (b) { b.onclick = function () { S.pacts = S.pacts.filter(function (x) { return x !== b.getAttribute("data-pact"); }); persist(); render(); }; });
    root.querySelectorAll("[data-dish]").forEach(function (b) { b.onclick = function () { S.dishes = S.dishes.filter(function (x) { return x !== b.getAttribute("data-dish"); }); persist(); render(); }; });
    root.querySelectorAll("[data-pet]").forEach(function (b) { b.onclick = function () { S.pet = ""; persist(); render(); }; });
    root.querySelectorAll("[data-add]").forEach(function (b) { b.onclick = function () { openEditor("@" + b.getAttribute("data-add")); }; });
    root.querySelectorAll("[data-album]").forEach(function (b) { b.onclick = function () { S.album = S.album.filter(function (x) { return x !== b.getAttribute("data-album"); }); persist(); render(); }; });
    root.querySelectorAll("[data-plag]").forEach(function (b) { b.onclick = function () { S.plag = S.plag.filter(function (x) { return x !== b.getAttribute("data-plag"); }); persist(); render(); }; });
    var al = q('[data-act="albumlv"]'); if (al) al.onchange = function () { S.albumLv = +al.value; S.album = S.album.slice(0, albumCap()); persist(); render(); };
    var fillB = q('[data-act="fill"]'); if (fillB) fillB.onchange = function () { S.fill = fillB.checked; persist(); };
    var hol = q('[data-act="holy"]'); if (hol) hol.onchange = function () { S.holy = +hol.value; S.banish = S.banish.slice(0, S.holy); persist(); render(); };
    var visible = function () { var pool = upPool(); return S.prio.filter(function (p) { return pool.indexOf(p.id) >= 0; }); };
    root.querySelectorAll("[data-lim]").forEach(function (inp) { inp.onchange = function () { var p = visible()[+inp.getAttribute("data-lim")]; p.lim = Math.max(0, Math.min(999, +inp.value || 0)); if (!p.lim) p.ban = false; persist(); render(); }; });
    root.querySelectorAll("[data-ban]").forEach(function (cb) { cb.onchange = function () { visible()[+cb.getAttribute("data-ban")].ban = cb.checked; persist(); }; });
    root.querySelectorAll("[data-mv]").forEach(function (b) { b.onclick = function () {
      var v = visible(), a = b.getAttribute("data-mv").split(":"), i = +a[0], j = i + (+a[1]); if (j < 0 || j >= v.length) return;
      var ia = S.prio.indexOf(v[i]), ib = S.prio.indexOf(v[j]), tmp = S.prio[ia]; S.prio[ia] = S.prio[ib]; S.prio[ib] = tmp; persist(); render(); }; });
    root.querySelectorAll("[data-rm]").forEach(function (b) { b.onclick = function () { var p = visible()[+b.getAttribute("data-rm")]; S.prio.splice(S.prio.indexOf(p), 1); persist(); render(); }; });
    root.querySelectorAll("[data-unban]").forEach(function (b) { b.onclick = function () { S.banish = S.banish.filter(function (x) { return x !== b.getAttribute("data-unban"); }); persist(); render(); }; });
    root.querySelectorAll("[data-fav]").forEach(function (b) { b.onclick = function () { S.favs = S.favs.filter(function (x) { return x !== b.getAttribute("data-fav"); }); persist(); render(); }; });
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

  function drawUpPick(kind) {
    var pool = upPool(), title = t(kind === "prio" ? "pickUp" : kind === "ban" ? "pickBan" : "pickFav");
    var taken = kind === "prio" ? S.prio.map(function (p) { return p.id; }) : kind === "ban" ? S.banish : S.favs;
    var row = function (id) {
      var x = upInfo(id), off = taken.indexOf(id) >= 0 || (kind === "fav" && S.banish.indexOf(id) >= 0) || (kind === "ban" && S.favs.indexOf(id) >= 0);
      return '<button type="button" class="pl-opt' + (off ? " blocked" : "") + '" data-k="' + id + '">' + (x.ic ? ico(x.ic) : '<span class="pl-ic pl-stat">' + esc(x.n) + "</span>") +
        "<span><b>" + esc(x.n) + "</b><small>" + t(x.kind === "stat" ? "stat" : x.kind) + (off ? " · " + t("taken") : "") + "</small>" + (x.d ? "<em>" + esc(L(x.d)) + "</em>" : "") + "</span></button>";
    };
    var groups = [["active", pool.filter(function (k) { return upInfo(k).kind === "active"; })], ["passive", pool.filter(function (k) { return upInfo(k).kind === "passive"; })], ["stat", STATS]];
    var list = groups.map(function (g) { return g[1].length ? '<h3 class="pl-group">' + t(g[0]) + "</h3>" + g[1].map(row).join("") : ""; }).join("");
    modal.innerHTML = '<div class="pl-mbox"><div class="pl-mhead"><h2>' + esc(title) + '</h2><button class="btn icon" type="button" data-x aria-label="' + t("done") + '">×</button></div><div class="pl-mbody"><div class="pl-opts">' + list + "</div></div></div>";
    modal.querySelector("[data-x]").onclick = closeEditor;
    modal.querySelectorAll(".pl-opt").forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains("blocked")) return;
        var id = b.getAttribute("data-k");
        if (kind === "prio") S.prio.push({ id: id, lim: 0, ban: false });
        else if (kind === "ban" && S.banish.length < S.holy) S.banish.push(id);
        else if (kind === "fav" && S.favs.length < D.rules.favMax) S.favs.push(id);
        persist();
        if (kind === "prio") drawUpPick(kind); else closeEditor();
      };
    });
  }
  function drawPick(kind) {
    if (kind === "prio" || kind === "ban" || kind === "fav") return drawUpPick(kind);
    var src = kind === "pact" ? D.pacts : kind === "dish" ? D.dishes : kind === "album" ? D.cards : kind === "plag" ? D.plag : D.pets;
    var chosen = kind === "pact" ? S.pacts : kind === "dish" ? S.dishes : kind === "album" ? S.album : kind === "plag" ? S.plag : (S.pet ? [S.pet] : []);
    var title = t(kind === "pact" ? "pickPact" : kind === "dish" ? "pickDish" : kind === "album" ? "pickCard" : kind === "plag" ? "pickPlag" : "pickPet");
    var q = filt.q.toLowerCase();
    var pool = kind === "plag" ? plagOptions() : Object.keys(src);
    var keys = pool.filter(function (k) { var n = kind === "pact" ? pactName(k) : src[k].n; return !q || n.toLowerCase().indexOf(q) >= 0 || L(src[k].d).toLowerCase().indexOf(q) >= 0; });
    var row = function (k) {
      var x = src[k], taken = chosen.indexOf(k) >= 0, n = kind === "pact" ? pactName(k) : x.n;
      var sub = kind === "pet" && x.mvp ? t("mvpPet") + (x.sk ? " · " + t("skill") + ": " + L(x.sk) : "") :
        kind === "album" ? L(D.slotNames[x.t]) + (x.mvp ? " · MVP" : "") : kind === "plag" ? t("from") + " " + x.boss : "";
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
    } else if (kind === "album") {
      ["weapon", "head", "armor", "garment", "shoes", "acc", "shield"].forEach(function (ty) {
        var ks = keys.filter(function (k) { return src[k].t === ty; }).sort(function (a, b) { return ((src[b].mvp || 0) - (src[a].mvp || 0)) || src[a].n.localeCompare(src[b].n); });
        if (ks.length) list += '<h3 class="pl-group">' + esc(L(D.slotNames[ty])) + "</h3>" + ks.map(row).join("");
      });
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
        else if (kind === "album" && S.album.length < albumCap()) S.album.push(k);
        else if (kind === "plag" && S.plag.length < plagCap()) S.plag.push(k);
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
        S.gear[slot] = { id: id, refine: refinable(it) ? D.rules.maxRefine : 0, slots: it.fs !== undefined ? it.fs : (slotless(it) || noRoll(it) ? 0 : D.rules.naturalSlots), extra: noRoll(it) && !slotless(it) ? extraCap(it) : 0, cards: [], pot: [] };
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
    if (!slotless(it) && it.fs === undefined && !noRoll(it)) grid += '<label>' + t("slotsNat") + '<select data-f="slots">' + opts(0, D.rules.naturalSlots, g.slots || 0) + "</select></label>";
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

  /* ---------------- export as image (canvas, same-origin icons, always dark for Discord) ---------------- */
  var IC = { bg: "#1c1b19", panel: "#2a2926", panel2: "#33312d", border: "#0e0d0c", ink: "#ede7db", muted: "#a59d8b", red: "#c8333a",
    gold: "#e2b33c", r: { n: "#8b5cf6", p: "#8b5cf6", l: "#e0a526", u: "#22b8c8", s: "#d94f7a" } };
  var FP = '"Press Start 2P", monospace', FU = '"Silkscreen", monospace', FB = '"Inter", "Noto Sans TC", system-ui, sans-serif';
  function loadImg(src) { return new Promise(function (res) { if (!src) return res(null); var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = src; }); }
  function iconSrc(file) { return file ? BASE + "icons/" + file + ".png" : null; }
  function rr(c, x, y, w, h, rad, fill, stroke) {
    c.beginPath(); c.moveTo(x + rad, y); c.arcTo(x + w, y, x + w, y + h, rad); c.arcTo(x + w, y + h, x, y + h, rad); c.arcTo(x, y + h, x, y, rad); c.arcTo(x, y, x + w, y, rad); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.lineWidth = 2; c.strokeStyle = stroke; c.stroke(); }
  }
  function fit(c, txt, w) { if (c.measureText(txt).width <= w) return txt; while (txt.length > 1 && c.measureText(txt + "…").width > w) txt = txt.slice(0, -1); return txt + "…"; }
  function drawIcon(c, im, x, y, size, cover) {
    if (!im) return;
    var k = cover ? Math.max(size / im.width, size / im.height) : Math.min(size / im.width, size / im.height);
    var w = im.width * k, h = im.height * k;
    c.save(); c.beginPath(); c.rect(x, y, size, size); c.clip(); c.imageSmoothingEnabled = !(im.width <= 40);
    c.drawImage(im, x + (size - w) / 2, y + (size - h) / 2, w, h); c.restore();
  }
  function box(c, x, y, w, h, title) {
    rr(c, x, y, w, h, 8, IC.panel, IC.border);
    if (title) { c.fillStyle = IC.red; rr(c, x + 2, y + 2, w - 4, 26, 6, IC.red); c.fillStyle = "#fff7ec"; c.font = "11px " + FP; c.textBaseline = "middle"; c.fillText(title, x + 12, y + 16); }
  }
  async function makeImage() {
    try { if (document.fonts) { await Promise.all([document.fonts.load("16px " + FP), document.fonts.load("12px " + FU), document.fonts.load("bold 14px Inter"), document.fonts.load("14px Inter")]); } } catch (e) {}
    var c0 = cls(), tot = buildTotals(), W = 1200, PAD = 20;
    var gearSlots = SLOT_ORDER.filter(function (sl) { return sl !== "shield" || c0.shield || c0.dual; });
    var need = [iconSrc(null)], urls = {};
    function want(file) { if (file && !urls[file]) urls[file] = loadImg(iconSrc(file)); }
    gearSlots.forEach(function (sl) { var g = S.gear[sl]; if (!g) return; want(D.items[g.id].ic); (g.cards || []).forEach(function (cid) { if (D.cards[cid]) want(D.cards[cid].ic); }); });
    (S.pacts || []).forEach(function (k) { want(D.pacts[k].ic); }); (S.dishes || []).forEach(function (k) { want(D.dishes[k].ic); });
    if (S.pet) want(D.pets[S.pet].ic); (S.album || []).forEach(function (k) { want(D.cards[k].ic); }); (S.plag || []).forEach(function (k) { want(D.plag[k].ic); });
    (S.prio || []).forEach(function (p) { var x = upInfo(p.id); if (x && x.ic) want(x.ic); });
    var banner = await loadImg(BASE + "../assets/banners/class-" + c0.id + ".png"), job = await loadImg(BASE + "../assets/icons/job_" + c0.id + ".png"), logo = await loadImg(BASE + "../assets/icons/brand_angeling.png");
    var IM = {}; for (var f in urls) IM[f] = await urls[f];
    // layout heights
    var rowsG = Math.ceil(gearSlots.length / 2), gearH = 40 + rowsG * 64;
    var keys = Object.keys(D.labels).filter(function (k) { return tot.all[k] && Math.abs(tot.all[k]) > 1e-9; }).slice(0, 18);
    var totH = 40 + Math.max(keys.length, 1) * 24 + (tot.jb ? 28 : 0);
    var topH = Math.max(gearH, totH);
    var prio = (S.prio || []).filter(function (p) { return upPool().indexOf(p.id) >= 0; });
    var prioRows = Math.ceil(prio.length / 2), prioH = prio.length ? 40 + prioRows * 26 + (S.banish.length ? 44 : 0) : (S.banish.length ? 84 : 0);
    var H = 150 + PAD + topH + PAD + 150 + PAD + (prioH ? prioH + PAD : 0) + 34;
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H; var c = cv.getContext("2d");
    c.fillStyle = IC.bg; c.fillRect(0, 0, W, H);
    // header
    if (banner) { c.save(); c.imageSmoothingEnabled = false; var bk = 150 / banner.height, bw = banner.width * bk; c.drawImage(banner, W - bw, 0, bw, 150); c.restore(); }
    var gr = c.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, "rgba(16,10,12,.96)"); gr.addColorStop(.55, "rgba(16,10,12,.75)"); gr.addColorStop(1, "rgba(16,10,12,0)");
    c.fillStyle = gr; c.fillRect(0, 0, W, 150);
    c.fillStyle = IC.red; c.fillRect(0, 146, W, 4);
    c.textBaseline = "alphabetic"; c.fillStyle = "#fff7ec"; c.font = "24px " + FP; c.fillText(fit(c, S.name || t("untitled"), 760), PAD + 6, 56);
    if (job) { c.save(); c.imageSmoothingEnabled = false; c.drawImage(job, PAD + 6, 76, 28, 28); c.restore(); }
    c.font = "bold 20px " + FB; c.fillStyle = IC.ink; c.fillText(D.classNames[c0.id] || c0.name, PAD + 44, 98);
    c.font = "12px " + FU; c.fillStyle = IC.muted; c.fillText(("Midgard Survivors Guide · Build Planner · Patch " + D.v).toUpperCase(), PAD + 6, 130);
    // equipment
    var y0 = 150 + PAD, gw = 760, tw = W - PAD * 3 - gw;
    box(c, PAD, y0, gw, topH, t("equipment").toUpperCase());
    var cw = (gw - 36) / 2;
    gearSlots.forEach(function (sl, i) {
      var cx = PAD + 12 + (i % 2) * (cw + 12), cy = y0 + 38 + Math.floor(i / 2) * 64, g = S.gear[sl];
      rr(c, cx, cy, cw, 56, 7, IC.panel2, g ? IC.r[D.items[g.id].r] : IC.border);
      rr(c, cx + 8, cy + 8, 40, 40, 5, "#1f1e1b", IC.border);
      c.textBaseline = "alphabetic"; c.font = "10px " + FU; c.fillStyle = IC.muted; c.fillText(slotName(sl).toUpperCase(), cx + 58, cy + 17);
      if (!g) { c.font = "bold 14px " + FB; c.fillStyle = "#6f685b"; c.fillText(t("empty"), cx + 58, cy + 37); return; }
      var it = D.items[g.id]; drawIcon(c, IM[it.ic], cx + 12, cy + 12, 32, false);
      var cards = (g.cards || []).filter(function (x) { return D.cards[x]; }), cardsW = cards.length * 19;
      c.font = "bold 14px " + FB; c.fillStyle = IC.ink; c.fillText(fit(c, it.n, cw - 66 - cardsW), cx + 58, cy + 35);
      var bits = []; if (refinable(it) && g.refine) bits.push("+" + g.refine); if (gradable(it) && g.grade && (g.refine || 0) >= D.rules.gradeMinRefine) bits.push(D.weaponGrades[g.grade]);
      if (g.trait && canTrait(g)) bits.push(L(D.traits[g.trait].n)); var pl = (g.pot || []).filter(function (l) { return l && l.k; }).length; if (pl) bits.push("SP " + pl + "/3");
      c.font = "12px " + FB; c.fillStyle = IC.muted; c.fillText(fit(c, bits.join(" · "), cw - 66 - cardsW), cx + 58, cy + 50);
      cards.forEach(function (cid, k) { var x = cx + cw - 8 - (cards.length - k) * 19; rr(c, x, cy + 14, 17, 24, 3, "#111", IC.border); drawIcon(c, IM[D.cards[cid].ic], x + 1, cy + 15, 22, true); });
    });
    // totals
    var tx0 = PAD * 2 + gw; box(c, tx0, y0, tw, topH, t("totals").toUpperCase());
    keys.forEach(function (k, i) {
      var yy = y0 + 52 + i * 24; c.font = "13px " + FB; c.fillStyle = IC.ink; c.textBaseline = "alphabetic";
      c.fillText(fit(c, labelOf(k), tw - 100), tx0 + 12, yy); c.font = "11px " + FU; c.fillStyle = IC.gold; var v = fmt(k, tot.all[k]); c.fillText(v, tx0 + tw - 12 - c.measureText(v).width, yy);
      if (i < keys.length - 1) { c.fillStyle = "rgba(255,255,255,.05)"; c.fillRect(tx0 + 10, yy + 8, tw - 20, 1); }
    });
    if (tot.jb) { c.font = "12px " + FB; c.fillStyle = IC.muted; c.fillText(fit(c, t("classBonus") + ": +" + Math.round(tot.jb.dmg * 100) + "% / +" + Math.round(tot.jb.hp * 100) + "%" + (tot.jb.more !== 1 ? " · ×" + tot.jb.more : ""), tw - 24), tx0 + 12, y0 + topH - 14); }
    // build pieces row
    var y1 = y0 + topH + PAD, cols = [
      [t("pacts"), (S.pacts || []).map(function (k) { return [D.pacts[k].ic, pactName(k)]; })],
      [t("dishes"), (S.dishes || []).slice(0, S.chef || 1).map(function (k) { return [D.dishes[k].ic, D.dishes[k].n]; })],
      [t("pet"), S.pet ? [[D.pets[S.pet].ic, D.pets[S.pet].n]] : []],
      [t("album"), (S.album || []).slice(0, albumCap()).map(function (k) { return [D.cards[k].ic, D.cards[k].n, 1]; })],
      [t("plag"), (S.plag || []).slice(0, plagCap()).map(function (k) { return [D.plag[k].ic, D.plag[k].n]; })]];
    var bw2 = (W - PAD * 2 - 4 * 12) / 5;
    cols.forEach(function (col, i) {
      var bx = PAD + i * (bw2 + 12); box(c, bx, y1, bw2, 150, col[0].toUpperCase());
      col[1].slice(0, 4).forEach(function (e, j) {
        var yy = y1 + 38 + j * 27; rr(c, bx + 10, yy, 22, 22, 4, "#1f1e1b", IC.border); drawIcon(c, IM[e[0]], bx + 11, yy + 1, 20, !!e[2]);
        c.font = "12.5px " + FB; c.fillStyle = IC.ink; c.textBaseline = "middle"; c.fillText(fit(c, e[1], bw2 - 50), bx + 38, yy + 12);
      });
      if (!col[1].length) { c.font = "12px " + FB; c.fillStyle = "#6f685b"; c.textBaseline = "middle"; c.fillText("—", bx + 12, y1 + 50); }
    });
    // priority + banishes
    var y2 = y1 + 150 + PAD;
    if (prioH) {
      box(c, PAD, y2, W - PAD * 2, prioH, t("prio").toUpperCase());
      var colW = (W - PAD * 2 - 36) / 2;
      prio.forEach(function (pp, i) {
        var col = i < prioRows ? 0 : 1, row = i < prioRows ? i : i - prioRows, xx = PAD + 12 + col * (colW + 12), yy = y2 + 38 + row * 26, x = upInfo(pp.id);
        c.font = "11px " + FU; c.fillStyle = IC.muted; c.textBaseline = "middle"; c.fillText(String(i + 1), xx, yy + 10);
        if (x.ic) { drawIcon(c, IM[x.ic], xx + 22, yy, 20, false); }
        c.font = "bold 13px " + FB; c.fillStyle = IC.ink; c.fillText(fit(c, x.n, colW - 190), xx + 48, yy + 10);
        var lim = pp.lim ? String(pp.lim) + (pp.ban ? "  ✕" : "") : t("noLimit"); c.font = "12px " + FB; c.fillStyle = pp.lim ? IC.gold : IC.muted;
        c.fillText(lim, xx + colW - 12 - c.measureText(lim).width, yy + 10);
      });
      if (S.banish.length) {
        var by = y2 + prioH - 34, bx2 = PAD + 12; c.font = "10px " + FU; c.fillStyle = IC.muted; c.textBaseline = "middle"; c.fillText(t("banish").toUpperCase(), bx2, by + 11); bx2 += c.measureText(t("banish").toUpperCase()).width + 12;
        S.banish.forEach(function (k) {
          var n = upInfo(k).n; c.font = "12px " + FB; var w = c.measureText(n).width + 30; if (bx2 + w > W - PAD - 12) return;
          rr(c, bx2, by, w, 22, 5, IC.panel2, IC.red); c.fillStyle = IC.red; rr(c, bx2 + 1, by + 1, 18, 20, 4, IC.red); c.fillStyle = "#fff7ec"; c.font = "bold 12px " + FB; c.fillText("×", bx2 + 6, by + 11);
          c.fillStyle = IC.ink; c.font = "12px " + FB; c.fillText(n, bx2 + 24, by + 11); bx2 += w + 6;
        });
      }
    }
    // footer
    c.textBaseline = "middle"; c.font = "11px " + FU; c.fillStyle = IC.muted;
    if (logo) { c.save(); c.imageSmoothingEnabled = false; c.drawImage(logo, PAD, H - 28, 30, 21); c.restore(); }
    c.fillText("MIDGARDSURVIVORSGUIDE.GITHUB.IO/PLANNER", PAD + 38, H - 17);
    return cv;
  }
  function openImage() {
    modal = document.createElement("div"); modal.className = "pl-modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal); document.body.classList.add("pl-lock");
    modal.addEventListener("click", function (e) { if (e.target === modal) closeEditor(); });
    modal.innerHTML = '<div class="pl-mbox pl-imgbox"><div class="pl-mhead"><h2>' + t("imgTitle") + '</h2><button class="btn icon" type="button" data-x aria-label="' + t("done") + '">×</button></div><div class="pl-mbody"><p class="muted">' + t("making") + "</p></div></div>";
    modal.querySelector("[data-x]").onclick = closeEditor;
    makeImage().then(function (cv) {
      if (!modal) return;
      var url = cv.toDataURL("image/png"), name = (S.name || (D.classNames[S.cls] || S.cls)).replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "build";
      var body = modal.querySelector(".pl-mbody");
      body.innerHTML = '<img class="pl-imgprev" src="' + url + '" alt=""><div class="pl-mfoot"><button class="btn" type="button" data-copy>' + t("copyImg") + '</button><a class="btn pl-primary" download="' + esc(name) + '.png" href="' + url + '">' + t("download") + "</a></div>";
      var cb = body.querySelector("[data-copy]");
      if (!(navigator.clipboard && window.ClipboardItem)) cb.style.display = "none";
      cb.onclick = function () { cv.toBlob(function (b) { navigator.clipboard.write([new ClipboardItem({ "image/png": b })]).then(function () { flash(cb, t("imgCopied")); }, function () {}); }); };
    });
  }

  if (/[?&]test/.test(location.search)) document.addEventListener("pl-test", function (e) {
    var cases = JSON.parse(document.documentElement.getAttribute("data-pltest-in") || "[]"), o = S, out = [];
    cases.forEach(function (st) { S = clean(st); out.push(buildTotals().all); }); S = o;
    document.documentElement.setAttribute("data-pltest-out", JSON.stringify(out));
  });

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
