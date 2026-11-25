/* Midgard Survivors Guide — Build Lab (build planner, game import, DPS simulator).
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
    undo: ["Undo", "Desfazer", "Deshacer", "復原"],
    optimize: ["Optimize", "Otimizar", "Optimizar", "最佳化"],
    soon: ["soon", "em breve", "pronto", "即將推出"],
    clsLbl: ["Class", "Classe", "Clase", "職業"],
    character: ["Character", "Personagem", "Personaje", "角色"],
    switchAsk: ["Switching class starts a new build. The current one stays in Undo. Continue?", "Trocar de classe começa uma build nova. A atual fica no Desfazer. Continuar?", "Cambiar de clase empieza una build nueva. La actual queda en Deshacer. ¿Continuar?", "更換職業會開始新的配裝，目前的可用復原找回。繼續？"],
    slotHint: ["Click a slot to choose and edit it right here.", "Clique num slot para escolher e editar aqui mesmo.", "Haz clic en una ranura para elegir y editar aquí mismo.", "點選欄位即可在這裡選擇與編輯。"],
    cardsHint: ["Each slot shows its card sockets. Click one to set its cards.", "Cada slot mostra os encaixes de carta. Clique num para escolher as cartas.", "Cada ranura muestra sus engastes de carta. Haz clic en una para elegir las cartas.", "每個欄位顯示卡片插槽，點選即可設定卡片。"],
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
    element: ["Element (Narakusa)", "Elemento (Narakusa)", "Elemento (Narakusa)", "屬性（Narakusa）"],
    elOrig: ["Original", "Original", "Original", "原本"],
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
    from: ["from", "de", "de", "來自"],
    // ---- character + sheet (damage engine via Pyodide)
    chr: ["Character and account", "Personagem e conta", "Personaje y cuenta", "角色與帳號"],
    lv: ["Level", "Nível", "Nivel", "等級"],
    baseSt: ["Base stats (account)", "Atributos base (conta)", "Atributos base (cuenta)", "基礎能力值（帳號）"],
    runSt: ["Stat points in the run", "Pontos de atributo na run", "Puntos de atributo en la partida", "本場能力值點數"],
    sklLv: ["Skill levels", "Níveis das skills", "Niveles de habilidades", "技能等級"],
    sklNote: ["Only skills with a level count. Past level 5 the game's over-level rule applies.", "Só contam skills com nível. Acima do nível 5 vale a regra de over-level do jogo.", "Solo cuentan las habilidades con nivel. Pasado el nivel 5 se aplica la regla de sobrenivel del juego.", "只計算有等級的技能。5 級以上套用遊戲的超等級規則。"],
    marks: ["Hel marks", "Marcas de Hel", "Marcas de Hel", "Hel 印記"],
    boons: ["Hel's Pact boons", "Bênçãos do Hel's Pact", "Bendiciones del Hel's Pact", "Hel's Pact 祝福"],
    gods: ["God altars (how many of each)", "Altares de deuses (quantos de cada)", "Altares de dioses (cuántos de cada)", "神之祭壇（各幾個）"],
    upFull: ["Account upgrades (Kafra, Sage...) at max", "Upgrades da conta (Kafra, Sage...) no máximo", "Mejoras de cuenta (Kafra, Sage...) al máximo", "帳號強化（Kafra、Sage…）全滿"],
    stew: ["Extra HP from Immortal Stew", "HP extra do Immortal Stew", "HP extra de Immortal Stew", "Immortal Stew 額外 HP"],
    sheet: ["Character sheet", "Ficha do personagem", "Ficha del personaje", "角色數據"],
    pub: ["Publish build", "Publicar build", "Publicar build", "公開配裝"],
    pubHelp: ["Share this build in Public Builds. Everyone can open it in the Build Lab. Builds imported from the game, unchanged, get the Verified in game badge.",
      "Compartilhe esta build em Builds Públicas. Qualquer um pode abrir no Laboratório. Builds importadas do jogo, sem alteração, ganham o selo Verificada no jogo.",
      "Comparte esta build en Builds Públicas. Cualquiera puede abrirla en el Laboratorio. Las builds importadas del juego, sin cambios, reciben el sello Verificada en el juego.",
      "在玩家公開流派分享這個配裝，任何人都能在實驗室開啟。從遊戲匯入且未修改的配裝會獲得「遊戲驗證」標章。"],
    pubName: ["Build name", "Nome da build", "Nombre de la build", "配裝名稱"], pubAuthor: ["Your nickname", "Seu apelido", "Tu apodo", "你的暱稱"],
    pubGoal: ["Made for", "Feita para", "Hecha para", "用途"],
    pubOath: ["Oath it clears", "Oath que ela fecha", "Oath que supera", "可通過的誓約"], pubNoOath: ["No oath", "Sem oath", "Sin oath", "無誓約"], pubDesc: ["Short description (optional)", "Descrição curta (opcional)", "Descripción corta (opcional)", "簡短說明（選填）"],
    goal_hell15: ["Hell 15", "Hell 15", "Hell 15", "Hell 15"], goal_emperium: ["Emperium Festival", "Emperium Festival", "Emperium Festival", "Emperium 祭典"],
    goal_mvp: ["MVPs", "MVPs", "MVPs", "MVP"], goal_farm: ["Farming", "Farm", "Farmeo", "刷寶"], goal_other: ["Other", "Outro", "Otro", "其他"],
    pubVer: ["This build came from the game unchanged: it will get the Verified in game badge.", "Esta build veio do jogo sem alteração: vai ganhar o selo Verificada no jogo.",
      "Esta build vino del juego sin cambios: recibirá el sello Verificada en el juego.", "此配裝自遊戲匯入且未修改：將獲得「遊戲驗證」標章。"],
    pubGo: ["Publish", "Publicar", "Publicar", "公開"], pubSending: ["Publishing...", "Publicando...", "Publicando...", "公開中..."],
    pubDone: ["Published! It is in Public Builds now.", "Publicada! Ela já está em Builds Públicas.", "¡Publicada! Ya está en Builds Públicas.", "已公開！現在可在玩家公開流派看到。"],
    pubSee: ["See it in Public Builds", "Ver em Builds Públicas", "Ver en Builds Públicas", "前往玩家公開流派"],
    pubExists: ["This exact build is already public.", "Essa mesma build já está pública.", "Esta misma build ya es pública.", "這個配裝已經公開了。"],
    pubErr_wait: ["Wait 2 minutes between publications.", "Espere 2 minutos entre publicações.", "Espera 2 minutos entre publicaciones.", "兩次公開之間請等待 2 分鐘。"],
    pubErr_day: ["Daily limit reached (5 builds). Try again tomorrow.", "Limite do dia atingido (5 builds). Tente amanhã.", "Límite diario alcanzado (5 builds). Inténtalo mañana.", "已達每日上限（5 個配裝），請明天再試。"],
    pubErr_words: ["Please remove offensive words.", "Remova palavras ofensivas, por favor.", "Quita las palabras ofensivas, por favor.", "請移除冒犯性字詞。"],
    pubErr_links: ["At most one link, and only in the description.", "No máximo um link, e só na descrição.", "Como máximo un enlace, y solo en la descripción.", "最多一個連結，且只能放在說明。"],
    pubErr_short: ["Name needs 3+ letters and nickname 2+.", "O nome precisa de 3+ letras e o apelido de 2+.", "El nombre necesita 3+ letras y el apodo 2+.", "名稱至少 3 字、暱稱至少 2 字。"],
    pubErr_captcha: ["Please finish the check above.", "Complete a verificação acima, por favor.", "Completa la verificación de arriba, por favor.", "請完成上方的驗證。"],
    pubErr_banned: ["Publishing is blocked for you.", "A publicação está bloqueada para você.", "La publicación está bloqueada para ti.", "你已被禁止公開。"],
    pubErr_any: ["Could not publish. Try again later.", "Não deu para publicar. Tente mais tarde.", "No se pudo publicar. Inténtalo más tarde.", "無法公開，請稍後再試。"],
    imp: ["Import from game", "Importar do jogo", "Importar del juego", "從遊戲匯入"],
    impHelp: ["Paste the link from the game's Export build button (midgardsurvivors.com/build/#...), just the code, or the long MSB1 link. You can also drop the PDF.",
      "Cole o link do botão Exportar build do jogo (midgardsurvivors.com/build/#...), só o código, ou o link longo MSB1. Também dá para soltar o PDF.",
      "Pega el enlace del botón Exportar build del juego (midgardsurvivors.com/build/#...), solo el código o el enlace largo MSB1. También puedes soltar el PDF.",
      "貼上遊戲「匯出配裝」按鈕的連結（midgardsurvivors.com/build/#...）、只有代碼，或 MSB1 長連結。也可以拖入 PDF。"],
    impWhere: ["In the game: end-of-run screen, Export build; or Album, History tab, Export on any run.",
      "No jogo: tela de fim de run, Exportar build; ou Álbum, aba Historial, Exportar em qualquer run.",
      "En el juego: pantalla de fin de partida, Exportar build; o Álbum, pestaña Historial, Exportar en cualquier partida.",
      "遊戲中：結算畫面的「匯出配裝」，或圖鑑「歷史」分頁中任一場的「匯出」。"],
    impGo: ["Import", "Importar", "Importar", "匯入"], impPdf: ["Choose PDF", "Escolher PDF", "Elegir PDF", "選擇 PDF"],
    impLoading: ["Loading build...", "Carregando build...", "Cargando build...", "載入配裝中..."],
    impBad: ["That is not a build link, code or MSB1 text.", "Isso não é um link, código ou texto MSB1 de build.", "Eso no es un enlace, código o texto MSB1 de build.", "這不是配裝連結、代碼或 MSB1 文字。"],
    impMissing: ["The game's server did not find that build. Check the link.", "O servidor do jogo não achou essa build. Confira o link.", "El servidor del juego no encontró esa build. Revisa el enlace.", "遊戲伺服器找不到這個配裝，請檢查連結。"],
    impNet: ["Could not reach the game's server. Try the long MSB1 link.", "Não deu para falar com o servidor do jogo. Tente o link longo MSB1.", "No se pudo contactar el servidor del juego. Prueba el enlace largo MSB1.", "無法連線到遊戲伺服器，請改用 MSB1 長連結。"],
    impNoUrl: ["No build link inside this PDF (it was printed without headers and footers). Copy the link from the build page instead.",
      "Não há link da build neste PDF (foi impresso sem cabeçalho e rodapé). Copie o link da página da build.",
      "No hay enlace de la build en este PDF (se imprimió sin encabezado ni pie). Copia el enlace de la página de la build.",
      "此 PDF 內沒有配裝連結（列印時關閉了頁首頁尾）。請改從配裝頁面複製連結。"],
    impCount: ["%g gear pieces · %s skills · %p pacts · %a god altars · %r raids won · %m Hel Marks",
      "%g peças · %s skills · %p pactos · %a altares de deus · %r raids vencidas · %m Marcas de Hel",
      "%g piezas · %s habilidades · %p pactos · %a altares de dioses · %r incursiones ganadas · %m Marcas de Hel",
      "%g 件裝備 · %s 個技能 · %p 個契約 · %a 座神壇 · 勝利 %r 次襲擊 · %m 個 Hel 印記"],
    impDone: ["Imported", "Importado", "Importado", "已匯入"], impMiss: ["Not imported", "Não importado", "No importado", "未匯入"],
    impNote: ["Your current build was replaced (Undo brings it back). Simulate DPS now uses this run's bonuses.",
      "Sua build atual foi substituída (Desfazer traz de volta). O Simular DPS agora usa os bônus desta run.",
      "Tu build actual se reemplazó (Deshacer la recupera). Simular DPS ahora usa los bonos de esta partida.",
      "目前的配裝已被取代（復原可還原）。模擬 DPS 現在使用這場的加成。"],
    impVer: ["Exported from game version %s; the planner is on %s.", "Exportado da versão %s do jogo; o planner está na %s.", "Exportado de la versión %s del juego; el planificador está en la %s.", "匯出自遊戲版本 %s；規劃器為 %s。"],
    sim: ["Simulate DPS", "Simular DPS", "Simular DPS", "模擬 DPS"],
    simTarget: ["Target", "Alvo", "Objetivo", "目標"],
    simPath: ["Run path", "Caminho da run", "Ruta de la partida", "路線"],
    simDark: ["Niflheim (Hel): more damage", "Niflheim (Hel): mais dano", "Niflheim (Hel): más daño", "尼芙爾海姆（Hel）：更多傷害"],
    simLight: ["Valhalla: more life", "Valhalla: mais vida", "Valhalla: más vida", "英靈殿：更多生命"],
    simMin: ["Your run duration (minutes)", "Duração da sua run (minutos)", "Duración de tu partida (minutos)", "你的遊戲時長（分鐘）"],
    simAcct: ["Use the run bonuses from the Character and account tab (Hel marks, raids won, god altars) instead of the average",
      "Usar os bônus de run da aba Personagem e conta (Marcas de Hel, raids vencidas, altares de deuses) em vez da média",
      "Usar los bonos de partida de la pestaña Personaje y cuenta (Marcas de Hel, incursiones ganadas, altares de dioses) en vez del promedio",
      "使用「角色與帳號」分頁中的遊戲加成（Hel 印記、勝利的襲擊、神之祭壇），而非平均值"],
    simAcctShort: ["Your run bonuses (Character and account tab)", "Seus bônus de run (aba Personagem e conta)", "Tus bonos de partida (pestaña Personaje y cuenta)", "你的遊戲加成（角色與帳號分頁）"],
    simGo: ["Simulate", "Simular", "Simular", "模擬"],
    simEmp: ["Emperiums (60 s Festival)", "Emperiums (Festival de 60 s)", "Emperiums (Festival de 60 s)", "Emperium（60 秒祭典）"],
    simDps: ["DPS", "DPS", "DPS", "DPS"],
    simTotal: ["Damage in 60 s", "Dano em 60 s", "Daño en 60 s", "60 秒傷害"],
    simWeapon: ["Weapon element", "Elemento da arma", "Elemento del arma", "武器屬性"],
    simTgtEl: ["Target element", "Elemento do alvo", "Elemento del objetivo", "目標屬性"],
    simEst: ["Average for this run", "Média para esta run", "Promedio para esta partida", "此長度的平均"],
    simAltars: ["god altars (Valkyrie, Freyja)", "altares de deus (Valkyrie, Freyja)", "altares de dioses (Valkyrie, Freyja)", "神壇（Valkyrie、Freyja）"],
    simAltarsAll: ["god altars", "altares de deus", "altares de dioses", "神壇"],
    simKarma: ["Hel altars", "altares de Hel", "altares de Hel", "Hel 神壇"], simKarmaL: ["Baldur altars", "altares de Baldur", "altares de Baldur", "Baldur 神壇"],
    simMarks: ["Hel Marks", "Hel Marks", "Hel Marks", "Hel 印記"], simBoons: ["raids won", "raids vencidas", "incursiones ganadas", "勝利的襲擊"],
    simNote: ["Averages from the game's own timers: a god altar every 60–90 s (you pray at every one), a corrupt demon every 110–160 s (Hel Mark on Niflheim), a karma altar every 150–210 s. The first MVP comes at 8:00 (60 s earlier per Valkyrie altar), then one every 160 s in endless mode; every MVP you beat opens a path raid, and each path raid won is one boon. The run clock stops during raids. Real runs vary with luck and choices.",
      "Médias tiradas dos tempos do próprio jogo: um altar de deus a cada 60–90 s (você reza em todos), um demônio corrompido a cada 110–160 s (Hel Mark no Niflheim), um altar de karma a cada 150–210 s. O primeiro MVP vem aos 8:00 (60 s antes por altar de Valkyrie) e depois um a cada 160 s no modo infinito; cada MVP vencido abre uma raid de caminho, e cada raid de caminho vencida é uma bênção. O relógio da run para durante as raids. Runs reais variam com sorte e escolhas.",
      "Promedios de los tiempos del propio juego: un altar de dios cada 60–90 s (rezas en todos), un demonio corrupto cada 110–160 s (Hel Mark en Niflheim), un altar de karma cada 150–210 s. El primer MVP llega a las 8:00 (60 s antes por altar de Valkyrie) y luego uno cada 160 s en modo infinito; cada MVP vencido abre una incursión de ruta, y cada incursión ganada es una bendición. El reloj de la partida se detiene durante las incursiones. Las partidas reales varían con la suerte y las decisiones.",
      "依遊戲本身的計時取平均：每 60–90 秒一座神壇（每座都祈禱）、每 110–160 秒一個腐化惡魔（尼芙爾海姆的 Hel 印記）、每 150–210 秒一座業力神壇。第一隻 MVP 在 8:00 出現（每座 Valkyrie 神壇提前 60 秒），之後無盡模式每 160 秒一隻；每擊敗一隻 MVP 會開啟路線襲擊，每贏一次路線襲擊得一個祝福。襲擊期間遊戲計時會暫停。實際遊戲會因運氣與選擇而不同。"],
    simMvpNote: ["MVP: it stands still and uses no mechanics; you hit until it dies. Its health follows the game (mvp_raid.gd): at least your measured DPS × 1.3 × 45 s × the boss's own multiplier, so it lasts about 58 s of your damage on a neutral target and grows as your damage grows. From 40 s on, Ymir's Heart raises your damage. The element table applies per hit type (basic attack = weapon element, Heal and Holy Light = Holy, Envenom = Poison).",
      "MVP: fica parado e não usa mecânicas; você bate até ele morrer. A vida segue o jogo (mvp_raid.gd): no mínimo seu DPS medido × 1,3 × 45 s × o multiplicador do chefe, então dura uns 58 s do seu dano num alvo neutro e cresce junto com o seu dano. A partir dos 40 s o Coração de Ymir aumenta seu dano. A tabela de elementos vale por tipo de golpe (ataque básico = elemento da arma, Heal e Holy Light = Sagrado, Envenom = Veneno).",
      "MVP: se queda quieto y no usa mecánicas; golpeas hasta que muere. Su vida sigue al juego (mvp_raid.gd): como mínimo tu DPS medido × 1,3 × 45 s × el multiplicador del jefe, así que dura unos 58 s de tu daño en un objetivo neutro y crece con tu daño. Desde los 40 s el Corazón de Ymir sube tu daño. La tabla de elementos se aplica por tipo de golpe (ataque básico = elemento del arma, Heal y Holy Light = Sagrado, Envenom = Veneno).",
      "MVP：站著不動、不使用機制，你一直打到牠倒下。生命依照遊戲（mvp_raid.gd）：至少為你的實測 DPS × 1.3 × 45 秒 × 首領自身倍率，因此在中性目標上約撐你 58 秒的傷害，並隨你的傷害成長。40 秒後尤彌爾之心會提高你的傷害。屬性表依攻擊類型套用（普攻 = 武器屬性，治療與神聖之光 = 聖，Envenom = 毒）。"],
    mtTest: ["Test", "Testar", "Probar", "測試"], mtCont: ["Continue", "Continuar", "Continuar", "繼續"],
    mtRetest: ["Test again", "Testar de novo", "Probar de nuevo", "再測一次"],
    mtHp: ["HP", "Vida", "Vida", "HP"],
    mtDead: ["%s defeated in %t", "%s derrotado em %t", "%s derrotado en %t", "%s 於 %t 被擊敗"],
    mtAlive: ["%s still alive after %t", "%s ainda vivo depois de %t", "%s sigue vivo tras %t", "%s 在 %t 後仍存活"],
    mtYmir: ["Ymir: you x%s", "Ymir: você x%s", "Ymir: tú x%s", "尤彌爾：你 x%s"],
    simTotalAll: ["Total damage", "Dano total", "Daño total", "總傷害"],
    simBossHp: ["MVP health", "Vida do MVP", "Vida del MVP", "MVP 生命"], simKill: ["Time to kill", "Tempo para matar", "Tiempo para matar", "擊殺時間"],
    simUnsup: ["Simulated: basic attacks, procs (Heal, Envenom, Holy Light), Lex Aeterna and every damage over time from the game code (poison ticks and corrosion, bleed bursts, burn with heat). Active skills, Mirror Image, combos and summons are coming next.",
      "Simulado: ataques básicos, procs (Heal, Envenom, Holy Light), Lex Aeterna e todo dano ao longo do tempo do código do jogo (ticks e corrosão do veneno, estouros de sangramento, queimadura com calor). Skills ativas, Mirror Image, combos e invocações vêm em seguida.",
      "Simulado: ataques básicos, procs (Heal, Envenom, Holy Light), Lex Aeterna y todo daño en el tiempo del código del juego (ticks y corrosión del veneno, estallidos de sangrado, quemadura con calor). Habilidades activas, Mirror Image, combos e invocaciones vienen después.",
      "已模擬：普攻、觸發（Heal、Envenom、Holy Light）、Lex Aeterna，以及遊戲程式中的所有持續傷害（毒的跳傷與腐蝕、流血爆發、帶熱度的燃燒）。主動技能、Mirror Image、連擊與召喚之後推出。"],
    mtTitle: ["DPS", "DPS", "DPS", "DPS"],
    mtWait: ["No damage yet", "Sem dano ainda", "Sin daño todavía", "尚無傷害"],
    mtPlay: ["Play", "Reproduzir", "Reproducir", "播放"], mtPause: ["Pause", "Pausar", "Pausar", "暫停"],
    mtAgain: ["Restart", "Recomeçar", "Reiniciar", "重新開始"], mtEnd: ["Skip to end", "Pular pro fim", "Saltar al final", "跳到結尾"],
    mtSpeed: ["Speed", "Velocidade", "Velocidad", "速度"],
    mtEmp: ["Emperium", "Emperium", "Emperium", "Emperium"],
    mtAuto: ["%s (auto)", "%s (auto)", "%s (auto)", "%s（自動）"],
    mtAutoHit: ["%s (auto, when hit)", "%s (auto, ao ser atingido)", "%s (auto, al recibir)", "%s（自動，受擊時）"],
    mtNote: ["Same meter as the game: each row is its damage divided by the time since the first hit, refreshed every 0.25 s.",
      "Mesmo medidor do jogo: cada linha é o dano dela dividido pelo tempo desde o primeiro golpe, atualizado a cada 0,25 s.",
      "El mismo medidor del juego: cada fila es su daño dividido por el tiempo desde el primer golpe, actualizado cada 0,25 s.",
      "與遊戲相同的計量表：每一列為其傷害除以首次命中後的時間，每 0.25 秒更新。"],
    simParts: ["Damage by type", "Dano por tipo", "Daño por tipo", "依類型的傷害"],
    pt_basic: ["Basic attack", "Ataque básico", "Ataque básico", "普攻"],
    pt_heal_hit: ["Heal (when hit)", "Heal (ao ser tocado)", "Heal (al ser golpeado)", "Heal（被擊中時）"],
    pt_poison: ["Poison", "Veneno", "Veneno", "毒"], pt_bleed: ["Bleed", "Sangramento", "Sangrado", "流血"], pt_burn: ["Burn", "Queimadura", "Quemadura", "燃燒"],
    sheetBtn: ["Calculate with the damage engine", "Calcular com o motor de dano", "Calcular con el motor de daño", "用傷害引擎計算"],
    sheetLoad: ["Loading the engine (first time ~10 MB)…", "Carregando o motor (primeira vez ~10 MB)…", "Cargando el motor (primera vez ~10 MB)…", "載入引擎中（首次約 10 MB）…"],
    sheetErr: ["The engine failed: ", "O motor falhou: ", "El motor falló: ", "引擎錯誤："],
    sheetNote: ["Same Python engine as our calculator, using the game's own constants. Emperium estimates come next.", "Mesmo motor Python da nossa calculadora, com as constantes do próprio jogo. A estimativa de Emperiums vem a seguir.", "El mismo motor Python de nuestra calculadora, con las constantes del propio juego. La estimación de Emperiums viene después.", "與我們計算器相同的 Python 引擎，使用遊戲本身的常數。Emperium 估算之後推出。"],
    sEff: ["Effective stats", "Atributos efetivos", "Atributos efectivos", "有效能力值"],
    sDmg: ["Damage multiplier", "Multiplicador de dano", "Multiplicador de daño", "傷害倍率"],
    sCrit: ["Crit chance", "Chance de crítico", "Prob. de crítico", "暴擊率"],
    sCritD: ["Crit damage", "Dano crítico", "Daño crítico", "暴擊傷害"],
    sCritF: ["Average crit factor", "Fator médio de crítico", "Factor medio de crítico", "平均暴擊係數"],
    sVs: ["vs boss / MVP / Doom", "vs boss / MVP / Doom", "vs jefe / MVP / Doom", "對首領 / MVP / Doom"],
    sAtk: ["Attacks per second", "Ataques por segundo", "Ataques por segundo", "每秒攻擊"],
    sHits: ["Hits per attack (power)", "Golpes por ataque (poder)", "Golpes por ataque (poder)", "每次攻擊段數（威力）"],
    sBasic: ["Basic attack (ATK × basic mult)", "Ataque básico (ATK × mult. básico)", "Ataque básico (ATK × mult. básico)", "普攻（ATK × 普攻倍率）"],
    sHaste: ["Cooldown speed", "Velocidade de recarga", "Velocidad de recarga", "冷卻速度"],
    sDur: ["Duration", "Duração", "Duración", "持續時間"],
    sArea: ["Area (overflow → skill damage)", "Área (excesso → dano de skill)", "Área (exceso → daño de habilidad)", "範圍（溢出→技能傷害）"],
    sAmp: ["Skill damage amp", "Amplificação de dano de skill", "Amplificación de daño de habilidad", "技能傷害增幅"],
    sSup: ["Support (DEX)", "Suporte (DEX)", "Soporte (DEX)", "輔助（DEX）"],
    sHp: ["Max HP", "HP máximo", "HP máximo", "最大 HP"],
    sSurv: ["Hits to die (Hell 15 / Oath 20, estimate)", "Golpes para morrer (Hell 15 / Juramento 20, estimativa)", "Golpes para morir (Hell 15 / Juramento 20, estimación)", "致死次數（Hell 15 / 誓約 20，估算）"],
    sProc: ["Procs (chance × proc bonus)", "Procs (chance × bônus de proc)", "Procs (prob. × bono de proc)", "觸發（機率 × 觸發加成）"],
    sSig: ["Signum Crucis frailty", "Fragilidade do Signum Crucis", "Fragilidad de Signum Crucis", "Signum Crucis 脆弱"],
    sSteel: ["Steel Body proc power", "Poder de proc do Steel Body", "Poder de proc de Steel Body", "Steel Body 觸發威力"]
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
      if (it.s === "weapon" && c.dual) return offhandOk(it) && weaponAllowed(c, it);
      return false;
    }
    if (slot === "soul") {
      if (it.s !== "soul") return false;
      var src = D.items[it.of];
      if (src && src.s === "weapon") return weaponAllowed(c, src) || (c.dual && offhandOk(src) && weaponAllowed(c, src));
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
  function natSlots(g) { var it = D.items[g.id]; return it.fs !== undefined ? it.fs : (slotless(it) || noRoll(it) ? 0 : D.rules.naturalSlots); }   // Epic: always 3 (user rule)
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
  /* equipment.gd::card_kind: an upper-face piece takes headgear cards, a lower-face piece takes none */
  function cardFits(it, cid) { var c = D.cards[cid]; if (!c) return false; if (it.wings) return !!c.mvp; if (it.face) return it.s === "mid" && c.t === "head"; return c.t === slotKind(it.s === "acc" ? "acc" : it.s); }
  /* equipment.gd::offhand_fits: a "dagger" weapon_type (Kamaitachi, Kagekiri) or an OFFHAND_KINDS kind */
  function offhandOk(it) { return !!it.dg || D.rules.offhandKinds.indexOf(it.wk) >= 0; }

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
  function fresh(c) { return { v: 1, cls: c, name: "", reborn: true, towerTop: 100, gear: {}, pacts: [], dishes: [], chef: D.rules.chefMax, pet: "", album: [], albumLv: D.rules.albumUpgrades, plag: [], prio: [], banish: [], favs: [], holy: D.rules.holyMax, fill: true, lv: 100, base: {}, run: {}, skl: {}, acct: { marks: 0, boons: 0, gods: {}, upFull: true, stew: 0 } }; }
  var GODS = ["odin", "freyja", "thor", "loki", "niflheim", "valkyrie", "emperium", "yggdrasil", "baldur", "hel", "hypnotist"];
  function num(v, lo, hi) { v = Math.round(+v || 0); return Math.max(lo, Math.min(hi, v)); }
  function cleanChar(o) {
    var st = function (x) { var out = {}; STATS.forEach(function (k) { var v = num((x || {})[k], 0, 9999); if (v) out[k] = v; }); return out; };
    var skl = {}; for (var k in o.skl || {}) if (upInfo(k) && STATS.indexOf(k) < 0) { var v = num(o.skl[k], 0, 9999); if (v) skl[k] = v; }
    var a = o.acct || {}, gods = {}; GODS.forEach(function (gd) { var n = num((a.gods || {})[gd], 0, 99); if (n) gods[gd] = n; });
    return { lv: num(o.lv === undefined ? 100 : o.lv, 1, 9999), base: st(o.base), run: st(o.run), skl: skl,
      acct: { marks: num(a.marks, 0, 999), boons: num(a.boons, 0, 99), gods: gods, upFull: a.upFull === undefined ? true : !!a.upFull, stew: num(a.stew, 0, 9999999),
        ups: (function () { var u = {}; for (var k in a.ups || {}) { var v = num(a.ups[k], 0, 999); if (v && /^[a-z_]+$/.test(k)) u[k] = v; } return u; })() } };
  }
  /* undo: every persist() pushes the state that was there before (up to 60 steps) */
  var UNDO = [], LASTJ = null;
  function persist() {
    var j = JSON.stringify(S);
    if (LASTJ !== null && LASTJ !== j) { UNDO.push(LASTJ); if (UNDO.length > 60) UNDO.shift(); }
    LASTJ = j;
    try { localStorage.setItem(LS_CUR, j); } catch (e) {}
    var u = root.querySelector('[data-act="undo"]'); if (u) u.disabled = !UNDO.length;
  }
  function undo() {
    if (!UNDO.length) return;
    var j = UNDO.pop(); S = clean(JSON.parse(j)); LASTJ = JSON.stringify(S);
    try { localStorage.setItem(LS_CUR, LASTJ); } catch (e) {}
    editSlot = null; render();
  }
  function savedList() { try { return JSON.parse(localStorage.getItem(LS_SAVED) || "[]"); } catch (e) { return []; } }
  function setSaved(a) { try { localStorage.setItem(LS_SAVED, JSON.stringify(a)); } catch (e) {} }
  function encode(o) { var s = JSON.stringify(o); return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function decode(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return JSON.parse(decodeURIComponent(escape(atob(s)))); }
  /* short share links (#z=): the state without its default values, deflated, base64url. #b= links keep working. */
  var KEEP_DEF = { chef: function () { return D.rules.chefMax; }, albumLv: function () { return D.rules.albumUpgrades; }, holy: function () { return D.rules.holyMax; },
    fill: function () { return true; }, upFull: function () { return true; }, lv: function () { return 100; } };
  function slim(o, top) {
    if (Array.isArray(o)) return o.map(function (x) { return slim(x, false); });
    if (!o || typeof o !== "object") return o;
    var out = {};
    for (var k in o) {
      var v = o[k];
      if (KEEP_DEF[k]) { if (v !== KEEP_DEF[k]()) out[k] = v; continue; }   // a value whose default is not "empty": drop it only when it is the default
      if (top && k === "v") continue;
      if (v === null || v === undefined || v === "" || v === false || v === 0) continue;
      if (Array.isArray(v) && !v.length) continue;
      v = slim(v, false);
      if (v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
      out[k] = v;
    }
    return out;
  }
  function unslim(o) {   // put back the gear fields the editor expects to find
    for (var k in o.gear || {}) { var g = o.gear[k]; if (!g) continue;
      ["refine", "slots", "extra", "grade"].forEach(function (f) { if (g[f] === undefined) g[f] = 0; });
      if (!g.cards) g.cards = []; if (!g.pot) g.pot = []; if (g.trait === undefined) g.trait = null; }
    return o;
  }
  function b64u(u8) { var s = ""; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64u(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function pipe(u8, stream) { return new Response(new Blob([u8]).stream().pipeThrough(stream)).arrayBuffer().then(function (b) { return new Uint8Array(b); }); }
  /* short links #s=CODE: the #z= payload is stored by our Worker (builds/model/share-worker, Cloudflare KV);
     if the Worker does not answer in time, the long #z= link is used, so sharing never breaks */
  var SHORT = "https://msg-builds.f-medeirs.workers.dev/b";
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (_, no) { setTimeout(function () { no(new Error("timeout")); }, ms); })]); }
  function shareLink(o) {
    var base = location.origin + location.pathname;
    if (!window.CompressionStream) return Promise.resolve(base + "#b=" + encode(o));
    return pipe(new TextEncoder().encode(JSON.stringify(slim(o, true))), new CompressionStream("deflate-raw")).then(function (z) {
      var long = base + "#z=" + b64u(z);
      return withTimeout(fetch(SHORT, { method: "POST", headers: { "Content-Type": "text/plain" }, body: "z1." + b64u(z) })
        .then(function (r) { return r.ok ? r.json() : null; }), 4000)
        .then(function (j) { return j && /^[2-9A-HJ-NP-Z]{8}$/.test(j.code) ? base + "#s=" + j.code : long; }, function () { return long; });
    });
  }
  function readShort(code) {
    return fetch(SHORT + "/" + code).then(function (r) { if (!r.ok) throw new Error("missing"); return r.text(); })
      .then(function (t) { t = t.trim(); if (t.indexOf("z1.") !== 0) throw new Error("bad"); return readLink(t.slice(3)); });
  }
  function readLink(z) {
    return pipe(unb64u(z), new DecompressionStream("deflate-raw")).then(function (u8) { return unslim(JSON.parse(new TextDecoder().decode(u8))); });
  }
  function valid(o) { return o && typeof o === "object" && D.classes.some(function (c) { return c.id === o.cls; }) && typeof o.gear === "object"; }
  function clean(o) {
    var g = {};
    for (var k in o.gear || {}) if (SLOT_ORDER.indexOf(k) >= 0 && o.gear[k] && D.items[o.gear[k].id]) g[k] = o.gear[k];
    var uniq = function (a, src, n) { var out = []; (a || []).forEach(function (x) { if (src[x] && out.indexOf(x) < 0 && out.length < n) out.push(x); }); return out; };
    var chef = Math.max(1, Math.min(D.rules.chefMax, +o.chef || D.rules.chefMax));
    return Object.assign(cleanChar(o), { v: 1, cls: o.cls, name: String(o.name || "").slice(0, 60), reborn: !!o.reborn, towerTop: Math.max(0, Math.min(D.rules.towerGearTop, o.towerTop !== undefined ? +o.towerTop || 0 : Math.max.apply(null, [0].concat(o.tower || [])))), gear: g,
      pacts: uniq(o.pacts, D.pacts, D.rules.maxPacts), dishes: uniq(o.dishes, D.dishes, D.rules.chefMax), chef: chef, pet: D.pets[o.pet] ? o.pet : "",
      albumLv: Math.max(0, Math.min(D.rules.albumUpgrades, o.albumLv === undefined ? D.rules.albumUpgrades : +o.albumLv)),
      album: uniq(o.album, D.cards, D.rules.albumBase + D.rules.albumUpgrades), plag: uniq(o.plag, D.plag, D.rules.plagRogue),
      prio: (o.prio || []).filter(function (x, i, a) { return x && upInfo(x.id) && a.map(function (y) { return y && y.id; }).indexOf(x.id) === i; }).map(function (x) { return { id: x.id, lim: Math.max(0, Math.min(999, +x.lim || 0)), ban: !!x.ban }; }),
      banish: (o.banish || []).filter(function (x, i, a) { return upInfo(x) && a.indexOf(x) === i; }).slice(0, D.rules.holyMax),
      favs: (o.favs || []).filter(function (x, i, a) { return upInfo(x) && a.indexOf(x) === i; }).slice(0, D.rules.favMax),
      holy: Math.max(0, Math.min(D.rules.holyMax, o.holy === undefined ? D.rules.holyMax : +o.holy)), fill: o.fill === undefined ? true : !!o.fill,
      gameCode: /^[0-9A-Z]{8}([0-9A-Z]{4})?$/.test(o.gameCode || "") ? o.gameCode : "", gameSig: typeof o.gameSig === "string" ? o.gameSig.slice(0, 16) : "",
      noEvo: (o.noEvo || []).filter(function (x, i, a) { return typeof x === "string" && D.skills[x] && a.indexOf(x) === i; }),   // skills the player did not evolve into EX
      sim: (o.sim && typeof o.sim === "object") ? { target: String(o.sim.target || "emperium"), path: o.sim.path === "light" ? "light" : "dark", minutes: Math.max(1, Math.min(120, +o.sim.minutes || 40)), acct: !!o.sim.acct } : {} });
  }

  /* ---------------- rendering ---------------- */
  var RAR = { n: "rN", p: "rP", l: "rL", u: "rU", s: "rS" };
  function ico(file, cls2) { return file ? '<img class="pl-ic ' + (cls2 || "") + '" src="' + BASE + "icons/" + file + '.png" alt="" loading="lazy">' : '<span class="pl-ic pl-ic-none ' + (cls2 || "") + '"></span>'; }
  function slotName(slot) { return slot === "shield" && cls().dual ? t("leftHand") + " / " + L(D.slotNames.shield) : L(D.slotNames[slot] || D.slotNames[slotKind(slot)]); }

  /* full-screen class art (planner/art/<id>.jpg); classes without art keep the neutral page background */
  var ART = { champion: 1, kagerou: 1, high_priest: 1, creator: 1, lord_knight: 1, paladin: 1, high_wizard: 1, professor: 1, sniper: 1,
    clown: 1, assassin_cross: 1, stalker: 1, whitesmith: 1, rebellion: 1, star_gladiator: 1, soul_linker: 1, spirit_handler: 1, super_novice: 1 };
  function setArt(id) {
    var el = document.getElementById("pl-art");
    if (!el) { el = document.createElement("div"); el.id = "pl-art"; el.className = "pl-art"; el.setAttribute("aria-hidden", "true"); document.body.appendChild(el); }
    document.body.classList.toggle("pl-on", !!id);
    if (!id) { el.hidden = true; return; }
    el.hidden = false; el.classList.toggle("noart", !ART[id]);
    el.style.backgroundImage = ART[id] ? "url(" + BASE + "art/" + id + ".jpg)" : "";
  }

  function renderPicker() {
    setArt(); editSlot = null;
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
      if (g.endow && D.elements && D.elements[g.endow]) bits.push(L(D.elements[g.endow]));
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

  /* layout (wireframe v2): tabs on top, class art behind, left = what you pick (changes with the tab) + the inline editor,
     middle = character panel, right = totals and the engine sheet (same on every tab) */
  var TAB = "gear";
  var TABS = [["gear", "equipment"], ["cards", "cards"], ["ppd", "ppd"], ["ap", "ap"], ["sk", "sk"], ["chr", "chr"]];
  function countersHtml() {
    var n = counts(), cap = legendCap();
    return '<div class="pl-counters"><span class="' + (n.l > cap ? "bad" : "") + '">' + t("legend") + " <b>" + n.l + "/" + cap + '</b></span><span>' + t("unique") + " <b>" + n.u + "/" + D.rules.uniqueMax + '</b></span><span>' + t("soul") + " <b>" + (S.gear.soul ? 1 : 0) + "/1</b></span></div>";
  }
  function leftHtml() {
    var c = cls();
    if (TAB === "gear" || TAB === "cards") {
      var slots = SLOT_ORDER.filter(function (s) { return s !== "shield" || c.shield || c.dual; });
      if (TAB === "cards") slots = slots.filter(function (s) { var g = S.gear[s]; return g && sockets(g) > 0; });
      var doll = slots.map(slotCard).join("");
      return '<section class="pl-box"><h2>' + t(TAB === "gear" ? "equipment" : "cards") + '</h2>' +
        (doll ? '<div class="pl-doll' + (TAB === "cards" ? " pl-cardsmode" : "") + '">' + doll + "</div>" : '<p class="muted">' + t("empty") + "</p>") +
        '<p class="pl-note muted">' + t(TAB === "gear" ? "slotHint" : "cardsHint") + "</p>" +
        (TAB === "gear" ? countersHtml() + (c.dual ? '<p class="pl-note muted">' + t("leftHalf") + "</p>" : "") : "") + "</section>";
    }
    return TAB === "ppd" ? ppdHtml() : TAB === "ap" ? apHtml() : TAB === "sk" ? skHtml() : charHtml();
  }
  function midHtml() {
    var c = cls(), cap = legendCap();
    var tops = ""; for (var fl = 0; fl <= D.rules.towerGearTop; fl += 10) tops += '<option value="' + fl + '"' + (fl === (S.towerTop || 0) ? " selected" : "") + ">" + fl + "</option>";
    var clsOpts = D.classes.map(function (x) { return '<option value="' + x.id + '"' + (x.id === c.id ? " selected" : "") + ">" + esc(D.classNames[x.id] || x.name) + "</option>"; }).join("");
    return '<section class="pl-box pl-charbox"><h2>' + t("character") + "</h2>" +
      '<div class="pl-clshead"><img class="pl-sprite" src="' + BASE + "sprites/" + c.id + '.png" alt="' + esc(D.classNames[c.id] || c.name) + '">' +
      '<label class="pl-clsrow"><img src="' + BASE + "../assets/icons/job_" + c.id + '.png" alt=""><select data-act="cls" aria-label="' + esc(t("clsLbl")) + '">' + clsOpts + "</select></label></div>" +
      '<input class="pl-name" type="text" maxlength="60" placeholder="' + esc(t("untitled")) + '" value="' + esc(S.name) + '" aria-label="' + esc(t("namePrompt")) + '">' +
      '<h3 title="' + esc(t("base") + ": " + D.rules.legendBase + ". " + t("towerNote")) + '">' + t("sockets") + ' <b class="pl-cap">' + cap + "</b></h3>" +
      '<div class="pl-setrow">' + (c.no_rebirth ? '<span class="muted">' + t("noReborn") + "</span>" : '<label class="pl-chk"><input type="checkbox" data-act="reborn"' + (S.reborn ? " checked" : "") + "> " + t("reborn") + " (+" + D.rules.legendRebirth + ")</label>") +
      '<label class="pl-chef" title="' + esc(t("towerNote")) + '">' + t("tower") + ' <select data-act="tower">' + tops + "</select></label></div>" +
      '<button class="btn pl-wide pl-allopen" type="button" data-act="allopen">' + t("allOpen") + "</button>" + countersHtml() + "</section>";
  }
  function render() {
    if (!S) return renderPicker();
    var c = cls();
    setArt(c.id);
    if (LASTJ === null) LASTJ = JSON.stringify(S);
    var tabs = TABS.map(function (x) { return '<button class="pl-tab" type="button" role="tab" data-tab="' + x[0] + '" aria-selected="' + (TAB === x[0]) + '">' + t(x[1]) + "</button>"; }).join("");
    var acts = '<div class="pl-acts"><button class="btn" type="button" data-act="undo"' + (UNDO.length ? "" : " disabled") + '>↶ ' + t("undo") + "</button>" +
      '<button class="btn" type="button" data-act="share">' + t("share") + '</button><button class="btn" type="button" data-act="save">' + t("save") + "</button>" +
      '<button class="btn" type="button" data-act="dup">' + t("dup") + '</button><button class="btn" type="button" data-act="image">' + t("img") + "</button>" +
      '<button class="btn" type="button" data-act="reset">' + t("reset") + '</button><button class="btn pl-primary" type="button" disabled title="' + esc(t("soon")) + '">' + t("optimize") + " <small>(" + t("soon") + ")</small></button></div>";
    var impdd = '<div class="pl-impwrap"><button class="btn pl-impbtn" type="button" data-impdd aria-expanded="' + IMPOPEN + '">' + t("imp") +
      ' <span aria-hidden="true">' + (IMPOPEN ? "▴" : "▾") + '</span></button><div class="pl-simdd pl-impdd"' + (IMPOPEN ? "" : " hidden") + ">" + impBox() + "</div></div>";
    var pubdd = '<div class="pl-pubwrap"><button class="btn pl-impbtn" type="button" data-pubdd aria-expanded="' + PUBOPEN + '">' + t("pub") +
      ' <span aria-hidden="true">' + (PUBOPEN ? "▴" : "▾") + '</span></button><div class="pl-simdd pl-pubdd"' + (PUBOPEN ? "" : " hidden") + '><div class="pl-imp" id="pl-pub-body"></div></div></div>';
    var simdd = '<div class="pl-simwrap"><button class="btn pl-primary pl-simbtn" type="button" data-simdd aria-expanded="' + SIMOPEN + '">' + t("sim") +
      ' <span aria-hidden="true">' + (SIMOPEN ? "▴" : "▾") + '</span></button><div class="pl-simdd"' + (SIMOPEN ? "" : " hidden") + '>' + sheetBox() + "</div></div>";
    root.innerHTML = '<div class="pl-top"><div class="pl-tabs" role="tablist">' + tabs + "</div>" + acts + impdd + pubdd + simdd + "</div>" +
      '<div class="pl-stage"><div class="gp pl-left">' + leftHtml() + '<div id="pl-edit"></div></div>' +
      '<div class="pl-midcol"><div class="gp pl-mid">' + midHtml() + '</div><div class="gp">' + savedHtml() + "</div></div>" +
      '<div class="gp pl-right">' + rightHtml() + "</div></div>";
    wire(); wireChar(); wireSimDd(); drawSheet();
    if (editSlot) drawEditor();
  }
  function rightHtml() {
    var tot = buildTotals();
    var rows = Object.keys(D.labels).filter(function (k) { return tot.all[k] && Math.abs(tot.all[k]) > 1e-9; })
      .map(function (k) { return "<tr><td>" + esc(labelOf(k)) + '</td><td class="n">' + fmt(k, tot.all[k]) + "</td></tr>"; }).join("");
    var extra = "";
    var jbx = tot.jb;
    if (jbx && jbx.more && jbx.more !== 1) extra += "<tr><td>" + t("dmgMore") + '</td><td class="n">×' + jbx.more + "</td></tr>";
    extra += "<tr><td>" + t("statCap") + '</td><td class="n">' + (D.rules.maxStat + (tot.raw.wing_stat_cap || 0)) + "</td></tr>";
    if (tot.harmony) extra += "<tr><td>" + t("harmony") + '</td><td class="n">' + D.weaponGrades[tot.harmony] + "</td></tr>";
    var specials = tot.specials.map(function (x) { return "<li>" + ico(x.ic, "pl-mini") + "<span><b>" + esc(x.n) + "</b> " + esc(x.d) + "</span></li>"; }).join("");
    return '<section class="pl-box" data-box="totals"><h2>' + t("totals") + "</h2>" +
      (rows || extra ? '<div class="tw"><table><tbody>' + rows + extra + "</tbody></table></div>" : '<p class="muted">' + t("empty") + "</p>") +
      (jbx ? '<p class="pl-note">' + t("classBonus") + ": +" + Math.round(jbx.dmg * 100) + "% " + esc(labelOf("dmg")) + ", +" + Math.round(jbx.hp * 100) + "% " + esc(labelOf("max_hp_pct")) + (jbx.more !== 1 ? ", ×" + jbx.more : "") + "</p>" : "") +
      (S.gear.soul && !soulOpen() ? '<p class="pl-note bad-note">' + t("soulOff") + "</p>" : "") +
      (specials ? "<h3>" + t("effects") + '</h3><ul class="pl-specials">' + specials + "</ul>" : "") +
      '<p class="pl-note muted">' + t("totalsNote") + "</p></section>";
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
    return '<section class="pl-box" data-box="ap"><h2>' + t("ap") + "</h2>" +
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
    return '<section class="pl-box" data-box="sk"><h2>' + t("sk") + '</h2><div class="two prio pl-sk"><div>' +
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
    return '<section class="pl-box" data-box="ppd"><h2>' + t("ppd") + "</h2>" +
      "<h3>" + t("pacts") + ' <b class="pl-cap">' + (S.pacts || []).length + "/" + mp + '</b></h3><div class="pl-chips">' + pacts + '</div><p class="pl-note muted">' + t("pactNote") + "</p>" +
      "<h3>" + t("dishes") + ' <b class="pl-cap">' + Math.min((S.dishes || []).length, chef) + "/" + chef + '</b></h3>' +
      '<label class="pl-chef">' + t("chef") + ' <select data-act="chef">' + opts(1, D.rules.chefMax, chef) + '</select></label><div class="pl-chips">' + dishes + '</div><p class="pl-note muted">' + t("chefNote") + "</p>" +
      "<h3>" + t("pet") + '</h3><div class="pl-chips">' + pet + "</div></section>";
  }
  /* ---------------- character, account and the engine sheet (calc/ via Pyodide) ---------------- */
  function numIn(key, val, w) { return '<input class="pl-lim pl-num" type="number" min="0" step="1" data-ch="' + key + '" value="' + (val || 0) + '"' + (w ? ' style="width:' + w + 'px"' : "") + ">"; }
  function charHtml() {
    var stRow = function (grp) {
      return '<div class="pl-st6">' + STATS.map(function (k) { return "<label><small>" + k.toUpperCase() + "</small>" + numIn(grp + "." + k, (S[grp] || {})[k]) + "</label>"; }).join("") + "</div>";
    };
    var sk = upPool().filter(function (id) { return STATS.indexOf(id) < 0; });
    var skRows = sk.map(function (id) { var x = upInfo(id); return '<label class="pl-sklv">' + upIcon(id) + "<span>" + esc(x.n) + "</span>" + numIn("skl." + id, (S.skl || {})[id]) + "</label>"; }).join("");
    var a = S.acct || {};
    var gods = GODS.map(function (gd) { return "<label><small>" + gd.charAt(0).toUpperCase() + gd.slice(1) + "</small>" + numIn("god." + gd, (a.gods || {})[gd]) + "</label>"; }).join("");
    return '<section class="pl-box" data-box="chr"><h2>' + t("chr") + "</h2>" +
      '<label class="pl-chef">' + t("lv") + " " + numIn("lv", S.lv, 90) + "</label>" +
      "<h3>" + t("baseSt") + "</h3>" + stRow("base") + "<h3>" + t("runSt") + "</h3>" + stRow("run") +
      "<h3>" + t("sklLv") + '</h3><div class="pl-sklvs">' + skRows + '</div><p class="pl-note muted">' + t("sklNote") + "</p>" +
      '<div class="pl-st6 pl-acct"><label><small>' + t("marks") + "</small>" + numIn("acct.marks", a.marks) + "</label><label><small>" + t("boons") + "</small>" + numIn("acct.boons", a.boons) +
      "</label><label><small>" + t("stew") + "</small>" + numIn("acct.stew", a.stew, 110) + "</label></div>" +
      "<h3>" + t("gods") + '</h3><div class="pl-st6">' + gods + "</div>" +
      '<label class="pl-chk"><input type="checkbox" data-ch="acct.upFull"' + (a.upFull !== false ? " checked" : "") + "> " + t("upFull") + "</label></section>";
  }

  var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  var PY = null, PYLOAD = null, PYERR = null, CALCV = "";
  function loadEngine() {
    if (PYLOAD) return PYLOAD;
    PYLOAD = new Promise(function (res, rej) { var s = document.createElement("script"); s.src = PYODIDE + "pyodide.js"; s.onload = res; s.onerror = function () { rej(new Error("pyodide.js")); }; document.head.appendChild(s); })
      .then(function () { return window.loadPyodide({ indexURL: PYODIDE }); })
      .then(function (py) {
        return fetch(BASE + "calc.json?v=" + (root.getAttribute("data-v") || "")).then(function (r) { return r.json(); }).then(function (b) {
          var home = "/home/pyodide/msg/";
          Object.keys(b.files).forEach(function (p) { var dir = (home + p).replace(/\/[^\/]*$/, ""); py.FS.mkdirTree(dir); py.FS.writeFile(home + p, b.files[p]); });
          py.runPython("import sys\nsys.path.insert(0, '" + home + "')\nfrom calc import web");
          CALCV = b.version; PY = py;
        });
      });
    PYLOAD.catch(function (e) { PYERR = String(e && e.message || e); PYLOAD = null; drawSheet(); });
    return PYLOAD;
  }
  function engineState() {
    var o = JSON.parse(JSON.stringify(S)), gear = {};
    SLOT_ORDER.forEach(function (slot) {
      var g = S.gear[slot]; if (!g || !D.items[g.id]) return;
      var it = D.items[g.id];
      if (slot === "soul" && !soulOpen()) return;
      gear[slot] = { id: g.id, slots: natSlots(g), refine: refinable(it) ? (g.refine || 0) : 0, grade: gradable(it) ? (g.grade || 0) : 0,
        cards: (g.cards || []).filter(function (x) { return x; }).slice(0, sockets(g)), trait: g.trait && canTrait(g) ? g.trait : null, pot: (g.pot || []).filter(function (l) { return l && l.k; }) };
      if (g.endow && it.s === "weapon") gear[slot].endow = g.endow;
    });
    o.gear = gear; o.album = (S.album || []).slice(0, albumCap());
    return o;
  }
  /* ---------------- import from the game's build export (core/build_card.gd) ----------------
     link midgardsurvivors.com/build/#CODE -> GET relay.midgardsurvivors.com/b/CODE -> "MSB1." + base64url(gzip(JSON)) */
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
  var RELAY = "https://relay.midgardsurvivors.com/b/", IMPOPEN = false, IMPMSG = "", IMPREP = null, HOWOPEN = false;
  function impParse(txt) {
    txt = String(txt || "").trim();
    var m = txt.match(/MSB1\.[A-Za-z0-9_-]+/); if (m) return { packed: m[0] };
    m = txt.match(/midgardsurvivors\.com\/build\/?#([0-9A-Za-z]{8}(?:[0-9A-Za-z]{4})?)\b/); if (m) return { code: m[1].toUpperCase() };
    if (/^[0-9A-Za-z]{8}([0-9A-Za-z]{4})?$/.test(txt)) return { code: txt.toUpperCase() };
    return null;
  }
  function impUnpack(packed) {
    return pipe(unb64u(packed.slice(5)), new DecompressionStream("gzip")).then(function (u8) { return JSON.parse(new TextDecoder().decode(u8)); });
  }
  function impFetch(src) {
    if (src.packed) return impUnpack(src.packed);
    return fetch(RELAY + src.code).then(function (r) {
      if (r.status === 404) throw new Error("missing");
      if (!r.ok) throw new Error("net");
      return r.text();
    }, function () { throw new Error("net"); }).then(function (t) { t = t.trim(); if (t.indexOf("MSB1.") !== 0) throw new Error("bad"); return impUnpack(t); });
  }
  function impPdf(file) {          // the official PDF is the page printed by the browser: its footer carries the page URL
    var V = "3.11.174", base = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/" + V + "/";
    var ready = window.pdfjsLib ? Promise.resolve() : new Promise(function (ok, no) {
      var sc = document.createElement("script"); sc.src = base + "pdf.min.js"; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc);
    });
    return ready.then(function () {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + "pdf.worker.min.js";
      return file.arrayBuffer();
    }).then(function (buf) { return window.pdfjsLib.getDocument({ data: buf }).promise; }).then(function (pdf) {
      var all = [];
      for (var i = 1; i <= pdf.numPages; i++) all.push(pdf.getPage(i).then(function (pg) {
        return Promise.all([pg.getTextContent(), pg.getAnnotations()]).then(function (x) {
          return x[0].items.map(function (it) { return it.str; }).join(" ") + " " + x[1].map(function (a) { return a.url || ""; }).join(" ");
        });
      }));
      return Promise.all(all);
    }).then(function (pages) {                  // text items keep their spaces, so the code does not glue to the page number ("1/35")
      var txt = pages.join(" "), m = txt.match(/midgardsurvivors\.com\/build\/?#\s*(MSB1\.[A-Za-z0-9_-]+|[0-9A-Za-z]{12}(?![0-9A-Za-z])|[0-9A-Za-z]{8}(?![0-9A-Za-z]))/);
      return m ? impParse(m[1]) : impParse(txt);
    });
  }
  function impTpl(tpl) { return new RegExp("^" + tpl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("%s", "([0-9]+(?:[.,][0-9]+)?)").replace(/%%/g, "%") + "$", "i"); }
  function impLines(g) { return ((g.item && g.item.foot) || []).map(function (x) { return String(x[0] || ""); }); }
  function impPot(lines, lg, miss, where) {
    var out = [];
    lines.forEach(function (ln) {
      if (ln.indexOf("  ") !== 0 || ln.indexOf("   ") === 0) return;           // 2 spaces = potential line, 3 = proc detail
      var perfect = /★\s*$/.test(ln), txt = ln.replace(/★/g, "").trim(), hit = null;
      Object.keys(D.pot).some(function (k) {
        return [lg, "en", "pt", "es", "zh"].some(function (l) {
          var tp = D.pot[k].txt && D.pot[k].txt[l]; if (!tp) return false;
          var m = txt.match(impTpl(tp)); if (!m) return false;
          var v = parseFloat(m[1].replace(",", ".")) / 100, vs = D.pot[k].v, best = 0;
          vs.forEach(function (x, i) { if (Math.abs(x - v) < Math.abs(vs[best] - v)) best = i; });
          hit = { k: k, t: perfect ? vs.length : Math.min(best + 1, vs.length - 1) }; return true;
        });
      });
      if (hit) out.push(hit); else miss.push(where + ": " + txt);
    });
    return out.slice(0, 3);
  }
  function impTrait(lines) {
    var ln = lines.filter(function (x) { return x.indexOf("◆") === 0; })[0]; if (!ln) return null;
    var nm = ln.replace(/^◆\s*/, "").split(/[:：]/)[0].trim().toLowerCase();
    return Object.keys(D.traits).filter(function (k) { var n = D.traits[k].n; return Object.keys(n).some(function (l) { return String(n[l]).toLowerCase() === nm; }); })[0] || null;
  }
  function impGrade(lines) {
    for (var i = 0; i < lines.length; i++) { var m = lines[i].match(/^\S+\s+([DCBAS])\s*[:：]/); if (m) return D.weaponGrades.indexOf(m[1]); }
    return 0;
  }
  function impIcon(path) { return String(path || "").split("/").pop(); }
  function impFirstInt(s) { var m = String(s || "").match(/(\d+)/); return m ? +m[1] : 0; }
  function impBuild(doc) {
    var h = doc.hero || {}, run = doc.run || {}, lg = (doc.lang || "en").slice(0, 2), ok = [], miss = [];
    var c = D.classes.filter(function (x) { return x.id === h.job; })[0] || D.classes.filter(function (x) { return x.id === h.class; })[0];
    if (!c) throw new Error("class " + (h.job || h.class));
    var o = fresh(c.id), GI = D.gameIcons || {}; o.noEvo = [];
    o.name = (h.name ? h.name + " · " : "") + (h.title || c.name); o.reborn = !!h.reborn; o.lv = +h.level || 1;
    // gear
    (doc.gear || []).forEach(function (g) {
      if (SLOT_ORDER.indexOf(g.slot) < 0) return;
      var title = (g.item && g.item.title) || g.id, id = g.id;
      if (g.slot === "wings" && /\bHel\b/.test(title) && D.items.hel_wings) id = "hel_wings";
      if (!D.items[id]) { miss.push(g.slot + ": " + title); return; }
      var it = D.items[id], lines = impLines(g), item = { id: id, cards: [], refine: +g.refine || 0, grade: 0, trait: null, pot: [], extra: 0, slots: 0 };
      item.slots = natSlots(item);
      item.extra = Math.max(0, Math.min(extraCap(it), (+g.sockets || 0) - item.slots));
      (g.cards || []).forEach(function (cd) { var cid = impIcon(cd.icon); if (D.cards[cid]) item.cards.push(cid); else miss.push(g.slot + ": " + (cd.title || cid)); });
      item.grade = Math.max(0, impGrade(lines));
      item.trait = impTrait(lines);
      item.pot = impPot(lines, lg, miss, title);
      o.gear[g.slot] = item;
    });
    // stats, skills, album, plagiarism
    (doc.stats || []).forEach(function (st) { if (STATS.indexOf(st.id) >= 0) { o.base[st.id] = +st.base || 0; o.run[st.id] = Math.max(0, (+st.value || 0) - (+st.base || 0)); } });
    (doc.skills || []).forEach(function (sk) {
      var id = sk.id, lv = +sk.lv || 0;
      if (/_x$/.test(id) && sk.evolved) { id = id.slice(0, -2); lv = 5 + lv - 1; }   // evolve(): EX level = 1 + (level - MAX_SKILL_LEVEL)
      if (upInfo(id) && STATS.indexOf(id) < 0) { o.skl[id] = lv; if (!sk.evolved && lv >= 5) o.noEvo.push(id); } else miss.push(sk.id);
    });
    o.album = (doc.album || []).map(function (a) { return a.id; }).filter(function (x) { return D.cards[x]; });
    o.plag = (doc.copies || []).map(function (cp) { return (GI.plag || {})[impIcon(cp.icon)]; }).filter(function (x) { return x && D.plag[x]; });
    // pet (extra row with the tame item icon), pacts, dishes, altars, marks and boons (the run's buff row)
    (doc.extra || []).forEach(function (e) { var pid = (GI.pets || {})[impIcon(e.icon)]; if (pid && D.pets[pid]) o.pet = pid; });
    var godNames = {}; for (var gd in GI.gods || {}) godNames[gd] = String(GI.gods[gd]).replace(/^(El|La)\s+/, "");
    (doc.buffs || []).forEach(function (b) {
      var ic = impIcon(b.icon), title = String(b.title || "");
      if ((GI.pacts || {})[ic] && D.pacts[GI.pacts[ic]]) { if (o.pacts.length < D.rules.maxPacts) o.pacts.push(GI.pacts[ic]); return; }
      if ((GI.dishes || {})[ic] && D.dishes[GI.dishes[ic]]) { if (o.dishes.length < D.rules.chefMax) o.dishes.push(GI.dishes[ic]); return; }
      if (ic === "over_thrust") { o.acct.marks = impFirstInt(b.tag); return; }                           // Mark of Hel (hud.gd)
      if (ic === "soul_drain" || ic === "assumptio") { o.acct.boons = impFirstInt(b.tag); return; }       // Pact of Hel / Blessing of Valhalla
      var x = String(b.tag || "").match(/[x×]\s*(\d+)/);
      if (x) for (var gid in godNames) if (godNames[gid] && new RegExp("\\b" + godNames[gid] + "\\b", "i").test(title)) { o.acct.gods[gid] = (o.acct.gods[gid] || 0) + (+x[1]); break; }
    });
    o.acct.upFull = true;
    o.sim = { target: "emperium", path: run.route === "light" ? "light" : "dark", minutes: 40, acct: true };
    var gods = 0; for (var k in o.acct.gods) gods += o.acct.gods[k];
    ok.push(t("impCount").replace("%g", Object.keys(o.gear).length).replace("%s", Object.keys(o.skl).length).replace("%p", o.pacts.length)
      .replace("%a", gods).replace("%r", o.acct.boons).replace("%m", o.acct.marks));
    return { state: o, ok: ok, miss: miss, ver: doc.ver, who: (h.name || "") + " · " + (h.title || c.name) + " Lv " + (h.level || "?") };
  }
  function impRun(src) {
    if (!src) { IMPMSG = t("impBad"); IMPREP = null; drawImp(); return; }
    IMPMSG = t("impLoading"); IMPREP = null; drawImp();
    impFetch(src).then(function (doc) {
      var r = impBuild(doc);
      S = clean(r.state);
      if (src.code) { S.gameCode = src.code; S.gameSig = pubSig(S); }   // unchanged since import = verifiable on the game's server
      persist(); IMPMSG = ""; IMPREP = r; editSlot = null; SIMRES = null; render();
    }).catch(function (e) {
      var k = String(e && e.message); IMPREP = null; IMPMSG = k === "missing" ? t("impMissing") : k === "net" ? t("impNet") : t("impBad") + (k && k !== "bad" ? " (" + k + ")" : ""); drawImp();
    });
  }
  function impBox() {
    return '<div class="pl-imp" id="pl-imp-body"></div>';
  }
  function drawImp() {
    var el = document.getElementById("pl-imp-body"); if (!el) return;
    var rep = "";
    if (IMPREP) {
      rep = '<div class="pl-imp-rep"><p><b>' + t("impDone") + ":</b> " + esc(IMPREP.who) + "</p><p>" + IMPREP.ok.map(esc).join(" · ") + "</p>" +
        (IMPREP.miss.length ? "<p><b>" + t("impMiss") + ":</b> " + IMPREP.miss.map(esc).join(", ") + "</p>" : "") +
        (IMPREP.ver && IMPREP.ver !== D.v ? '<p class="muted">' + esc(t("impVer").replace("%s", IMPREP.ver).replace("%s", D.v)) + "</p>" : "") +
        '<p class="muted">' + t("impNote") + "</p></div>";
    }
    el.innerHTML = '<p class="pl-note">' + t("impHelp") + '</p><textarea data-imp="txt" rows="2" spellcheck="false" placeholder="https://midgardsurvivors.com/build/#..."></textarea>' +
      '<div class="pl-imp-row"><button class="btn pl-primary" type="button" data-imp="go">' + t("impGo") + '</button><label class="btn pl-imp-file">' + t("impPdf") +
      '<input type="file" accept="application/pdf,.pdf" data-imp="pdf" hidden></label></div>' +
      (IMPMSG ? '<p class="pl-note">' + esc(IMPMSG) + "</p>" : "") + rep + '<p class="pl-note muted">' + t("impWhere") + "</p>" +
      '<div class="howto">' + howtoHtml(HOWOPEN) + "</div>";
    var hb = el.querySelector("[data-howto]"); if (hb) hb.onclick = function () { HOWOPEN = !HOWOPEN; el.querySelector(".howto").innerHTML = howtoHtml(HOWOPEN); el.querySelector("[data-howto]").onclick = hb.onclick; };
    var ta = el.querySelector('[data-imp="txt"]');
    el.querySelector('[data-imp="go"]').onclick = function () { impRun(impParse(ta.value)); };
    ta.onkeydown = function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); impRun(impParse(ta.value)); } };
    var file = function (f) {
      if (!f) return; IMPMSG = t("impLoading"); IMPREP = null; drawImp();
      impPdf(f).then(function (src) { if (src) impRun(src); else { IMPMSG = t("impNoUrl"); drawImp(); } }, function () { IMPMSG = t("impNoUrl"); drawImp(); });
    };
    el.querySelector('[data-imp="pdf"]').onchange = function (e) { file(e.target.files[0]); };
    el.ondragover = function (e) { e.preventDefault(); };
    el.ondrop = function (e) { e.preventDefault(); var f = e.dataTransfer.files[0]; if (f && /pdf$/i.test(f.name)) file(f); else if (e.dataTransfer.getData("text")) impRun(impParse(e.dataTransfer.getData("text"))); };
  }
  function impToggle(open) {
    IMPOPEN = open;
    var dd = root.querySelector(".pl-impdd"), b = root.querySelector("[data-impdd]"); if (!dd || !b) return;
    dd.hidden = !open; b.setAttribute("aria-expanded", open); b.querySelector("span").textContent = open ? "▴" : "▾";
    if (open) { if (SIMOPEN) simToggle(false); if (PUBOPEN) pubToggle(false); drawImp(); var ta = dd.querySelector("textarea"); if (ta) ta.focus(); }
  }
  /* ---------------- Publish to Public Builds (Worker /p, D1) ---------------- */
  var PUB = SHORT.replace(/\/b$/, "/p"), PUBOPEN = false, PUBMSG = "", PUBRES = null;
  var TS_SITEKEY = "0x4AAAAAAGRmAtBmn1kf1k5s";   // Cloudflare Turnstile site key (public; widget "Midgard Survivors Guide", hostnames midgardsurvivorsguide.github.io + localhost)
  function pubSig(o) {   // FNV-1a of the build without the import marks
    var x = JSON.parse(JSON.stringify(o)); delete x.gameCode; delete x.gameSig; delete x.sim; delete x.name;
    var t = JSON.stringify(slim(x, true)), h = 2166136261;
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(36);
  }
  function pubDefaultName() {   // imported builds are named "<character> · <title>": keep the title, not the character name
    var nm = String(S.name || ""); return nm.indexOf(" · ") >= 0 ? nm.split(" · ").slice(1).join(" · ") : (nm || cls().name || "");
  }
  function pubVerified() { return !!(S.gameCode && S.gameSig && S.gameSig === pubSig(S)); }
  function pubKeys() { try { return JSON.parse(localStorage.getItem("msg-pub-keys") || "{}"); } catch (e) { return {}; } }
  function drawPub() {
    var el = document.getElementById("pl-pub-body"); if (!el) return;
    var who = ""; try { who = localStorage.getItem("msg-pub-author") || ""; } catch (e) {}
    var goals = ["hell15", "emperium", "mvp", "farm", "other"].map(function (g) { return '<option value="' + g + '">' + t("goal_" + g) + "</option>"; }).join("");
    var done = PUBRES ? '<div class="pl-imp-rep"><p><b>' + (PUBRES.existing ? t("pubExists") : t("pubDone")) + '</b></p><p><a class="btn pl-primary" href="../?pb=' + PUBRES.id + '#public">' + t("pubSee") + "</a></p></div>" : "";
    el.innerHTML = '<p class="pl-note">' + t("pubHelp") + "</p>" +
      '<div class="pl-simf"><label>' + t("pubName") + '<input type="text" maxlength="60" data-pub="name" value="' + esc(pubDefaultName()) + '"></label>' +
      "<label>" + t("pubAuthor") + '<input type="text" maxlength="24" data-pub="author" value="' + esc(who) + '"></label>' +
      "<label>" + t("pubGoal") + '<select data-pub="goal">' + goals + "</select></label>" +
      '<label class="pub-oath">' + t("pubOath") + '<select data-pub="oath"><option value="0">' + t("pubNoOath") + "</option>" +
        Array.apply(null, Array(40)).map(function (_, i) { return '<option value="' + (i + 1) + '">Oath ' + (i + 1) + "</option>"; }).join("") + "</select></label>" +
      "<label>" + t("pubDesc") + '<textarea data-pub="descr" maxlength="500" rows="3"></textarea></label></div>' +
      (pubVerified() ? '<p class="pl-note pub-ver">✔ ' + t("pubVer") + "</p>" : "") +
      (TS_SITEKEY ? '<div class="cf-turnstile" data-sitekey="' + TS_SITEKEY + '"></div>' : "") +
      '<div class="pl-imp-row"><button class="btn pl-primary" type="button" data-pub="go">' + t("pubGo") + "</button></div>" +
      (PUBMSG ? '<p class="pl-note">' + esc(PUBMSG) + "</p>" : "") + done;
    if (TS_SITEKEY && !window.turnstile) { var sc = document.createElement("script"); sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"; sc.async = true; document.head.appendChild(sc); }
    else if (TS_SITEKEY && window.turnstile) { try { window.turnstile.render(el.querySelector(".cf-turnstile")); } catch (e) {} }
    var gsel = el.querySelector('[data-pub="goal"]'), olab = el.querySelector(".pub-oath");
    var oathShow = function () { olab.hidden = gsel.value !== "hell15"; }; gsel.onchange = oathShow; oathShow();
    el.querySelector('[data-pub="go"]').onclick = function () {
      var v = function (k) { return (el.querySelector('[data-pub="' + k + '"]') || {}).value || ""; };
      var tok = el.querySelector('[name="cf-turnstile-response"]'); tok = tok ? tok.value : "";
      try { localStorage.setItem("msg-pub-author", v("author")); } catch (e) {}
      PUBMSG = t("pubSending"); PUBRES = null; drawPubMsg(el);
      var ver = pubVerified(), body = JSON.parse(JSON.stringify(S)); delete body.gameCode; delete body.gameSig; delete body.sim;
      pipe(new TextEncoder().encode(JSON.stringify(slim(body, true))), new CompressionStream("deflate-raw")).then(function (z) {
        return fetch(PUB, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload: "z1." + b64u(z), name: v("name"), author: v("author"),
          goal: v("goal"), oath: v("goal") === "hell15" ? +v("oath") || 0 : 0, descr: v("descr"), game_code: ver ? S.gameCode : "", turnstile: tok }) });
      }).then(function (r) { return r.json().catch(function () { return {}; }); }).then(function (j) {
        if (j && j.id) { if (j.key) { var k = pubKeys(); k[j.id] = j.key; try { localStorage.setItem("msg-pub-keys", JSON.stringify(k)); } catch (e) {} } PUBRES = j; PUBMSG = ""; drawPub(); return; }
        PUBMSG = T["pubErr_" + (j && j.error)] ? t("pubErr_" + j.error) : t("pubErr_any"); drawPubMsg(el);
      }, function () { PUBMSG = t("pubErr_any"); drawPubMsg(el); });
    };
  }
  function drawPubMsg(el) { var p = el.querySelector(".pub-msg"); if (!p) { p = document.createElement("p"); p.className = "pl-note pub-msg"; el.appendChild(p); } p.textContent = PUBMSG; }
  function pubToggle(open) {
    PUBOPEN = open;
    var dd = root.querySelector(".pl-pubdd"), b = root.querySelector("[data-pubdd]"); if (!dd || !b) return;
    dd.hidden = !open; b.setAttribute("aria-expanded", open); b.querySelector("span").textContent = open ? "▴" : "▾";
    if (open) { if (SIMOPEN) simToggle(false); if (IMPOPEN) impToggle(false); PUBMSG = ""; PUBRES = null; drawPub(); }
  }
  var SIMOPEN = false, SIMDOC = false;
  function simToggle(open) {
    SIMOPEN = open;
    var dd = root.querySelector(".pl-simwrap .pl-simdd"), b = root.querySelector("[data-simdd]"); if (!dd || !b) return;
    dd.hidden = !open; b.setAttribute("aria-expanded", open); b.querySelector("span").textContent = open ? "▴" : "▾";
    if (open) { if (IMPOPEN) impToggle(false); if (PUBOPEN) pubToggle(false); drawSim(); }
  }
  function wireSimDd() {
    var b = root.querySelector("[data-simdd]"); if (b) b.onclick = function () { simToggle(!SIMOPEN); };
    var bi = root.querySelector("[data-impdd]"); if (bi) bi.onclick = function () { impToggle(!IMPOPEN); };
    var bp = root.querySelector("[data-pubdd]"); if (bp) bp.onclick = function () { pubToggle(!PUBOPEN); };
    if (IMPOPEN) drawImp();
    if (SIMDOC) return; SIMDOC = true;                     // fecha ao clicar fora ou com Esc
    document.addEventListener("mousedown", function (e) {
      if (SIMOPEN && !e.target.closest(".pl-simwrap")) simToggle(false);
      if (IMPOPEN && !e.target.closest(".pl-impwrap")) impToggle(false);
      if (PUBOPEN && !e.target.closest(".pl-pubwrap")) pubToggle(false);
    });
    document.addEventListener("keydown", function (e) { if (e.key !== "Escape") return; if (SIMOPEN) simToggle(false); if (IMPOPEN) impToggle(false); if (PUBOPEN) pubToggle(false); });
  }
  function sheetBox() { return '<div class="pl-sim" id="pl-sim-body"></div>'; }
  function f2(v, d) { return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toLocaleString(); }
  function big(v) { return v >= 1e6 ? v.toExponential(2).replace("e+", "e") : f2(v, v < 10 ? 3 : v < 100 ? 2 : 0); }
  var SIMRES = null, SIMBUSY = false;
  function simOpts() { var o = S.sim || {}; return { target: o.target || "emperium", path: o.path === "light" ? "light" : "dark", minutes: Math.max(1, Math.min(40, +o.minutes || 40)), estimate: o.acct ? false : true }; }
  function runSim() {
    if (!PY) return;
    try { SIMRES = JSON.parse(PY.globals.get("web").simulate(JSON.stringify(engineState()), JSON.stringify(simOpts()))); } catch (e) { SIMRES = { ok: false, error: String(e) }; }
  }
  function elName(e) { return D.elements && D.elements[e] ? L(D.elements[e]) : (e || ""); }
  // ---- live DPS meter: plays back the engine timeline like the game's damage_meter.gd (DPS mode)
  var MT = { raf: 0, tau: 0, last: 0, speed: 1, play: false, shown: -1 };
  var MT_EL = { neutral: "#9eadcc", water: "#73adfa", earth: "#b89461", fire: "#fa8c52", wind: "#a8d966", poison: "#9ec759",
    holy: "#fae073", shadow: "#9e7ad1", ghost: "#c7b8f2", undead: "#8c8c99" };
  var MT_UNITS = [[1e33, "Dc"], [1e30, "No"], [1e27, "Oc"], [1e24, "Sp"], [1e21, "Sx"], [1e18, "Qi"], [1e15, "Q"], [1e12, "T"], [1e9, "B"], [1e6, "M"]];
  function mtShort(v) {                                   // damage_meter.gd::short
    if (v >= 9.9995e35) { var e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e); if (m >= 9.95) { m /= 10; e += 1; } return m.toFixed(1) + "e" + e; }
    for (var i = 0; i < MT_UNITS.length; i++) if (v >= MT_UNITS[i][0] * 0.99995) return (v / MT_UNITS[i][0]).toFixed(1) + MT_UNITS[i][1];
    if (v >= 10000) return Math.round(v / 1000) + "k";
    if (v >= 1000) return (v / 1000).toFixed(1) + "k";
    return String(Math.round(v));
  }
  function mtName(k) {
    var sk = { heal: "Heal", heal_hit: "Heal", envenom: "Envenom", holy_light: "Holy Light" };
    if (k === "heal_hit") return t("mtAutoHit").replace("%s", sk[k]);
    if (sk[k]) return t("mtAuto").replace("%s", sk[k]);
    if (k === "lex") return "Lex Aeterna";
    return t("pt_" + k);
  }
  function mtIcon(k) {
    if (k === "basic") { var w = S.gear && S.gear.weapon, it = w && D.items[w.id]; return ico(it && it.ic, "pl-mt-ic"); }
    return ico(D.meterIcons && D.meterIcons[k], "pl-mt-ic");
  }
  function mtClock(x) { x = Math.max(0, Math.floor(x)); return Math.floor(x / 60) + ":" + ("0" + (x % 60)).slice(-2); }
  function mtStop() { if (MT.raf) cancelAnimationFrame(MT.raf); MT.raf = 0; }
  function mtFrame() {
    var tl = SIMRES && SIMRES.timeline, box = document.getElementById("pl-mt"); if (!tl || !box) return;
    var T = tl.frames[tl.frames.length - 1][0], lo = 0, hi = tl.frames.length - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (tl.frames[mid][0] <= MT.tau + 1e-9) lo = mid; else hi = mid - 1; }
    var i = lo;
    if (i === MT.shown) return; MT.shown = i;
    var f = tl.frames[i], now = f[0], mt = Math.max(1, now), rows = [], tot = 0;      // main.gd::meter_time = max(1, elapsed)
    tl.keys.forEach(function (k, j) { var v = f[2 + j]; if (v > 0) { rows.push([k, v]); tot += v; } });
    rows.sort(function (a, b) { return b[1] - a[1]; });
    var top = rows.length ? rows[0][1] : 1, els = SIMRES.row_el || {};
    box.querySelector(".pl-mt-dps").textContent = t("mtTitle") + " · " + mtShort(tot / mt) + "/s";
    box.querySelector(".pl-mt-clock").textContent = mtClock(now) + " / " + mtClock(T) + (SIMRES.emperiums !== undefined ? " · " + t("mtEmp") + " " + (f[1] + 1) : "");
    box.querySelector(".pl-mt-rows").innerHTML = rows.length ? rows.slice(0, 6).map(function (r, n) {
      var c = MT_EL[els[r[0]]] || MT_EL.neutral;
      return '<div class="pl-mt-row"><i style="width:' + (100 * r[1] / top).toFixed(2) + "%;background:" + c + '"></i>' + mtIcon(r[0]) +
        '<span class="pl-mt-n">' + (n + 1) + ". " + esc(mtName(r[0])) + '</span><b>' + mtShort(r[1] / mt) + "/s</b></div>";
    }).join("") : '<p class="pl-mt-empty">' + t("mtWait") + "</p>";
    box.querySelector(".pl-mt-bar i").style.width = (100 * now / T).toFixed(2) + "%";
    if (SIMRES.boss_hp) {
      var left = Math.max(0, SIMRES.boss_hp - tot), hb = box.querySelector(".pl-mt-hp");
      hb.querySelector("i").style.width = (100 * left / SIMRES.boss_hp).toFixed(2) + "%";
      hb.querySelector("span").textContent = t("mtHp") + " " + mtShort(left) + " / " + mtShort(SIMRES.boss_hp);
      var ym = mtYmir(now), msg = box.querySelector(".pl-mt-msg"), done = MT.tau >= T - 1e-9;
      box.querySelector(".pl-mt-clock").textContent = mtClock(now) + (ym > 1.001 ? " · " + t("mtYmir").replace("%s", ym.toFixed(1)) : "");
      msg.textContent = done ? (SIMRES.killed != null ? t("mtDead") : t("mtAlive")).replace("%s", mtBoss()).replace("%t", mtClock(SIMRES.killed != null ? SIMRES.killed : T)) : "";
      msg.className = "pl-mt-msg" + (done ? (SIMRES.killed != null ? " ok" : " bad") : "");
      var res = document.getElementById("pl-sim-res"); if (res) res.hidden = !done;
    }
  }
  function mtBoss() { var m = (D.mvps || []).filter(function (x) { return x.id === simOpts().target; })[0]; return m ? m.n : "MVP"; }
  function mtYmir(x) {                                          // mvp_raid.gd::_tick_ymir (RAID_YMIR_* 0.2.8 = 0.2.10)
    if (x <= 40) return 1; x -= 40;
    var y = x <= 60 ? x + x * x / 120 : 90 + 2 * (x - 60);
    return 1 + 0.08 * y;
  }
  function mtTick(ts) {
    var tl = SIMRES && SIMRES.timeline; if (!tl) return mtStop();
    var T = tl.frames[tl.frames.length - 1][0];
    if (MT.last) MT.tau = Math.min(T, MT.tau + (ts - MT.last) / 1000 * MT.speed);
    MT.last = ts; mtFrame();
    if (MT.tau >= T) { MT.play = false; mtButtons(); MT.raf = 0; return; }
    MT.raf = requestAnimationFrame(mtTick);
  }
  function mtStart() { mtStop(); MT.play = true; MT.last = 0; mtButtons(); MT.raf = requestAnimationFrame(mtTick); }
  function mtButtons() {
    var b = document.querySelector('#pl-mt [data-mt="play"]'); if (!b) return;
    var tl = SIMRES && SIMRES.timeline, T = tl ? tl.frames[tl.frames.length - 1][0] : 0, mvp = !!(SIMRES && SIMRES.boss_hp);
    b.textContent = MT.play ? t("mtPause") : !mvp ? t("mtPlay") : MT.tau <= 0 ? t("mtTest") : MT.tau >= T - 1e-9 ? t("mtRetest") : t("mtCont");
    b.classList.toggle("pl-primary", mvp && !MT.play);
  }
  function mtWire() {
    var box = document.getElementById("pl-mt"); if (!box) return;
    box.querySelectorAll("[data-mt]").forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute("data-mt"), tl = SIMRES.timeline, T = tl.frames[tl.frames.length - 1][0];
        if (a === "play") { if (MT.play) { MT.play = false; mtStop(); mtButtons(); } else { if (MT.tau >= T) { MT.tau = 0; MT.shown = -1; } mtStart(); } }
        else if (a === "again") { MT.tau = 0; MT.shown = -1; mtStart(); }
        else if (a === "end") { mtStop(); MT.play = false; MT.tau = T; MT.shown = -1; mtFrame(); mtButtons(); }
        else { MT.speed = +a; box.querySelectorAll("[data-mt]").forEach(function (x) { if (/^\d+$/.test(x.getAttribute("data-mt"))) x.classList.toggle("on", +x.getAttribute("data-mt") === MT.speed); }); }
      };
    });
  }
  function mtBox() {
    var sp = [1, 5, 20].map(function (v) { return '<button type="button" class="btn pl-mt-sp' + (MT.speed === v ? " on" : "") + '" data-mt="' + v + '">' + v + "×</button>"; }).join("");
    var hp = SIMRES && SIMRES.boss_hp ? '<div class="pl-mt-hp"><i></i><span></span></div>' : "";
    return '<div class="pl-mt" id="pl-mt"><div class="pl-mt-head"><b class="pl-mt-dps"></b><span class="pl-mt-clock"></span></div>' + hp + '<p class="pl-mt-msg"></p>' +
      '<div class="pl-mt-rows"></div><div class="pl-mt-bar"><i></i></div>' +
      '<div class="pl-mt-ctl"><button type="button" class="btn" data-mt="play"></button><button type="button" class="btn" data-mt="again">' + t("mtAgain") +
      '</button><button type="button" class="btn" data-mt="end">' + t("mtEnd") + '</button><span class="pl-mt-spl">' + t("mtSpeed") + "</span>" + sp + "</div></div>";
  }
  function drawSim() {
    mtStop();
    var el = document.getElementById("pl-sim-body"); if (!el) return;
    var o = simOpts(), tg = '<option value="emperium"' + (o.target === "emperium" ? " selected" : "") + ">Emperium Festival</option>" +
      (D.mvps || []).map(function (m) { return '<option value="' + m.id + '"' + (o.target === m.id ? " selected" : "") + ">" + esc(m.n) + " · " + esc(elName(m.el)) + "</option>"; }).join("");
    var form = '<div class="pl-simf"><label>' + t("simTarget") + '<select data-sim="target">' + tg + "</select></label>" +
      '<label>' + t("simPath") + '<select data-sim="path"' + (S.sim && S.sim.acct ? " disabled" : "") + '><option value="dark"' + (o.path === "dark" ? " selected" : "") + ">" + t("simDark") + '</option><option value="light"' + (o.path === "light" ? " selected" : "") + ">" + t("simLight") + "</option></select></label>" +
      '<label>' + t("simMin") + '<input type="number" min="1" max="40" step="5" data-sim="minutes" value="' + o.minutes + '"' + (S.sim && S.sim.acct ? " disabled" : "") + "></label>" +
      '<label class="pl-chk"><input type="checkbox" data-sim="acct"' + (S.sim && S.sim.acct ? " checked" : "") + "> " + t("simAcct") + "</label></div>";
    var body = "";
    if (PYERR) body += '<p class="pl-note bad-note">' + t("sheetErr") + esc(PYERR) + "</p>";
    if (!PY) body += PYLOAD ? '<p class="muted">' + t("sheetLoad") + "</p>" : '<button class="btn pl-wide pl-primary" type="button" data-act="sim">' + t("simGo") + "</button>";
    else if (SIMRES && !SIMRES.ok) body += '<p class="pl-note bad-note">' + t("sheetErr") + esc(SIMRES.error) + "</p>";
    else if (SIMRES) {
      var r = SIMRES, row = function (k, v) { return "<tr><td>" + k + '</td><td class="n">' + v + "</td></tr>"; };
      if (r.timeline) body += mtBox() + '<p class="pl-note muted">' + t("mtNote") + "</p>";
      body += '<div class="tw" id="pl-sim-res"' + (r.boss_hp ? " hidden" : "") + '><table><tbody>' +
        (r.emperiums !== undefined ? row(t("simEmp"), "<b>" + f2(r.emperiums, 2) + "</b>") : "") +
        (r.boss_hp ? row(t("simKill"), "<b>" + (r.killed != null ? mtClock(r.killed) : "&gt; " + mtClock(r.cap)) + "</b>") + row(t("simBossHp"), mtShort(r.boss_hp)) : "") +
        row(t("simDps"), "<b>" + big(r.dps) + "</b>") + row(t(r.boss_hp ? "simTotalAll" : "simTotal"), big(r.total)) +
        row(t("simWeapon"), esc(elName(r.weapon_el))) + (r.el ? row(t("simTgtEl"), esc(elName(r.el))) : "") + "</tbody></table></div>";
      var a = r.acct || {}, ga = (a.gods || []).length, ka = (a.karma_altars || []).length;
      body += '<p class="pl-row"><b>' + (r.estimate ? t("simEst") + " (" + o.minutes + " min)" : t("simAcctShort")) + ":</b> ~" + ga + " " + t("simAltarsAll") + " · ~" + ka + " " + t(a.path === "light" ? "simKarmaL" : "simKarma") +
        (a.path === "light" ? "" : " · ~" + a.marks + " " + t("simMarks")) + " · ~" + a.boons + " " + t("simBoons") + "</p>";
      body += '<p class="pl-note muted">' + (r.estimate ? t("simNote") + " " : "") + (r.el ? t("simMvpNote") + " " : "") + t("simUnsup") + ' <span class="muted">engine ' + esc(r.version || CALCV) + "</span></p>";
    }
    el.innerHTML = form + body;
    el.querySelectorAll("[data-sim]").forEach(function (inp) {
      inp.onchange = function () {
        S.sim = S.sim || {}; var k = inp.getAttribute("data-sim");
        S.sim[k] = inp.type === "checkbox" ? inp.checked : (k === "minutes" ? Math.max(1, Math.min(40, +inp.value || 40)) : inp.value);
        persist(); if (PY) runSim(); drawSim();
      };
    });
    var b = el.querySelector('[data-act="sim"]'); if (b) b.onclick = function () { PYERR = null; loadEngine().then(function () { runSim(); drawSim(); }); drawSim(); };
    if (SIMRES && SIMRES.timeline && document.getElementById("pl-mt")) {
      mtWire(); MT.shown = -1;
      if (SIMRES !== MT.res) { MT.res = SIMRES; MT.tau = 0; MT.play = false; if (SIMRES.boss_hp) { mtFrame(); mtButtons(); } else mtStart(); }
      else { mtFrame(); if (MT.play) mtStart(); else mtButtons(); }
    }
  }
  function drawSheet() { if (PY) runSim(); drawSim(); return; }
  function drawSheetOld() {
    var el = document.getElementById("pl-sheet-body"); if (!el) return;
    if (!PY) {
      el.innerHTML = (PYERR ? '<p class="pl-note bad-note">' + t("sheetErr") + esc(PYERR) + "</p>" : "") +
        (PYLOAD ? '<p class="muted">' + t("sheetLoad") + "</p>" : '<button class="btn pl-wide pl-primary" type="button" data-act="sheet">' + t("sheetBtn") + "</button>");
      var b = el.querySelector('[data-act="sheet"]'); if (b) b.onclick = function () { PYERR = null; loadEngine().then(drawSheet); drawSheet(); };
      return;
    }
    var r;
    try { r = JSON.parse(PY.globals.get("web").sheet(JSON.stringify(engineState()))); } catch (e) { r = { ok: false, error: String(e) }; }
    if (!r.ok) { el.innerHTML = '<p class="pl-note bad-note">' + t("sheetErr") + esc(r.error) + "</p>"; return; }
    var s = r.sheet, row = function (k, v) { return "<tr><td>" + t(k) + '</td><td class="n">' + v + "</td></tr>"; };
    var eff = STATS.map(function (k) { return k.toUpperCase() + " " + Math.round(s.eff[k]); }).join(" · ");
    var procs = s.procs.map(function (p) { return esc(p.skill) + " " + f2(p.chance * s.proc_more * 100, 1) + "%"; }).join(", ");
    el.innerHTML = '<p class="pl-row"><b>' + t("sEff") + "</b><br>" + eff + '</p><div class="tw"><table><tbody>' +
      row("sDmg", "×" + big(s.dmg_mult)) + row("sCrit", f2(s.crit * 100, 1) + "%") +
      row("sCritD", "×" + f2(s.crit_dmg, 2) + (s.lethal ? " (ultra + lethal)" : s.ultra ? " (ultra)" : "")) + row("sCritF", "×" + f2(s.critf, 2)) +
      row("sVs", "×" + f2(s.vs, 3)) + row("sBasic", big(s.basic_atk * s.basic_mult)) + row("sAtk", f2(s.attacks_per_s, 2)) +
      row("sHits", f2(s.flow, 2) + (s.power > 1 ? " (×" + f2(s.power, 2) + ")" : "")) + row("sHaste", "+" + f2(s.haste_pct * 100, 1) + "%") +
      row("sDur", "×" + f2(s.duration_mult, 2)) + row("sArea", "+" + f2(s.area * 100, 0) + "%" + (s.area_over > 0 ? " (+" + f2(s.area_over * 100, 0) + "%)" : "")) +
      row("sAmp", "×" + f2(s.skill_amp, 2)) + row("sSup", "×" + f2(s.support, 2)) + row("sHp", big(s.max_hp)) + row("sSurv", f2(s.hits_to_die, 1)) +
      (s.signum ? row("sSig", "+" + f2(s.signum * 100, 0) + "%") : "") + (s.steel ? row("sSteel", "+" + f2(s.steel * 100, 0) + "%") : "") +
      (procs ? row("sProc", procs) : "") + "</tbody></table></div>" + '<p class="pl-note muted">engine ' + esc(CALCV) + "</p>";
  }
  var sheetTimer = null;
  function sheetSoon() { clearTimeout(sheetTimer); sheetTimer = setTimeout(drawSheet, 150); }
  function wireChar() {
    root.querySelectorAll("[data-ch]").forEach(function (inp) {
      inp.onchange = inp.oninput = function () {
        var k = inp.getAttribute("data-ch"), v = inp.type === "checkbox" ? inp.checked : Math.max(0, Math.round(+inp.value || 0)), p = k.split(".");
        if (p[0] === "lv") S.lv = Math.max(1, v);
        else if (p[0] === "god") { S.acct.gods = S.acct.gods || {}; if (v) S.acct.gods[p[1]] = v; else delete S.acct.gods[p[1]]; }
        else { var grp = p[0]; S[grp] = S[grp] || {}; S[grp][p[1]] = v; }
        persist(); sheetSoon();
      };
    });
  }

  function savedHtml() {
    var a = savedList();
    var list = a.length ? a.map(function (b, i) {
      var c = D.classes.filter(function (x) { return x.id === b.data.cls; })[0];
      return '<li><img src="' + BASE + "../assets/icons/job_" + b.data.cls + '.png" alt=""><span><b>' + esc(b.name || t("untitled")) + "</b><small>" + esc(c ? (D.classNames[c.id] || c.name) : "") + "</small></span>" +
        '<button class="btn" type="button" data-load="' + i + '">' + t("load") + '</button><button class="btn" type="button" data-dup="' + i + '" title="' + t("dup") + '">' + t("dupShort") + '</button><button class="btn" type="button" data-del="' + i + '" aria-label="' + t("del") + '">×</button></li>';
    }).join("") : '<li class="muted">' + t("noSaved") + "</li>";
    return '<section class="pl-box" data-box="saved"><h2>' + t("saved") + '</h2><ul class="pl-saved">' + list + "</ul></section>";
  }

  /* collapsible boxes: click a box title to fold it; remembered per box in this browser */
  var LS_FOLD = "msg-planner-folded";
  function folded() { try { return JSON.parse(localStorage.getItem(LS_FOLD) || "[]"); } catch (e) { return []; } }
  function wireFold() {
    var f = folded();
    root.querySelectorAll("section[data-box]").forEach(function (sec) {
      var h = sec.querySelector(":scope > h2"), key = sec.getAttribute("data-box");
      if (!h) return;
      h.classList.add("toggle"); h.setAttribute("role", "button"); h.setAttribute("tabindex", "0");
      var set = function (on) { sec.classList.toggle("collapsed", on); h.setAttribute("aria-expanded", on ? "false" : "true"); };
      set(f.indexOf(key) >= 0);
      var flip = function () {
        var cur = folded().filter(function (x) { return x !== key; }), on = !sec.classList.contains("collapsed");
        if (on) cur.push(key); set(on);
        try { localStorage.setItem(LS_FOLD, JSON.stringify(cur)); } catch (e) {}
      };
      h.onclick = flip;
      h.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } };
    });
  }
  function wire() {
    wireFold();
    root.querySelectorAll(".pl-slot").forEach(function (b) { b.onclick = function () { openEditor(b.getAttribute("data-slot")); }; });
    var q = function (sel) { return root.querySelector(sel); };
    root.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { TAB = b.getAttribute("data-tab"); editSlot = null; render(); }; });
    q('[data-act="undo"]').onclick = undo;
    q('[data-act="cls"]').onchange = function (e) {
      var v = e.target.value;
      if (Object.keys(S.gear).length && !confirm(t("switchAsk"))) { e.target.value = S.cls; return; }
      S = fresh(v); editSlot = null; persist(); render();
    };
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
      var btn = e.currentTarget;
      var ok = function () { flash(btn, t("copied")); };
      shareLink(S).then(function (url) {
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, function () { prompt(t("share"), url); });
        else prompt(t("share"), url);
      });
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
  /* the editor now opens inline, under the slots in the left column (#pl-edit); `modal` points at that container */
  var modal = null, filt = { q: "", r: "" }, editSlot = null;
  function closeEditor() { editSlot = null; modal = null; render(); }
  function openEditor(slot) {
    editSlot = slot; filt = { q: "", r: "" };
    render();
    var el = document.getElementById("pl-edit");
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.7) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.addEventListener("keydown", function (e) { if (e.key !== "Escape") return; var m = document.querySelector(".pl-modal"); if (m) { m.remove(); document.body.classList.remove("pl-lock"); } else if (editSlot) closeEditor(); });

  function drawEditor() {
    modal = document.getElementById("pl-edit");
    if (!modal || !editSlot) return;
    root.querySelectorAll(".pl-slot").forEach(function (b) { b.classList.toggle("sel", b.getAttribute("data-slot") === editSlot); });
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
        if (kind === "prio") render(); else closeEditor();
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
        S.gear[slot] = { id: id, refine: refinable(it) ? D.rules.maxRefine : 0, slots: it.fs !== undefined ? it.fs : (slotless(it) || noRoll(it) ? 0 : D.rules.naturalSlots), extra: !slotless(it) ? extraCap(it) : 0, cards: [], pot: [] };
        if (slot === "weapon" && it.th && S.gear.shield) delete S.gear.shield;
        persist(); render();
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
    if (it.s === "weapon" && D.endow) {   // Narakusa endow: equipment.gd weapon_element (the item's "endow" overrides its element)
      var elOpts = '<option value="">' + esc(t("elOrig") + " (" + L(D.elements[it.el || "neutral"])) + ")</option>" +
        ["neutral"].concat(D.endow).filter(function (e) { return e !== (it.el || "neutral"); }).map(function (e) { return '<option value="' + e + '"' + (g.endow === e ? " selected" : "") + ">" + esc(L(D.elements[e])) + "</option>"; }).join("");
      grid += '<label>' + t("element") + '<select data-f="endow">' + elOpts + "</select></label>";
    }
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
    var redraw = function () { persist(); render(); };
    modal.querySelectorAll("[data-f]").forEach(function (sel) {
      sel.onchange = function () {
        var f = sel.getAttribute("data-f");
        g[f] = (f === "trait" || f === "endow") ? sel.value : +sel.value;
        if (f === "endow" && !g.endow) delete g.endow;
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
    modal.querySelector('[data-act="remove"]').onclick = function () { delete S.gear[slot]; persist(); render(); };
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
    c.font = "12px " + FU; c.fillStyle = IC.muted; c.fillText(("Midgard Survivors Guide · Build Lab · Patch " + D.v).toUpperCase(), PAD + 6, 130);
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
      if (g.endow && D.elements && D.elements[g.endow]) bits.push(L(D.elements[g.endow]));
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
    var modal; function closeImg() { if (modal) { modal.remove(); modal = null; document.body.classList.remove("pl-lock"); } }
    modal = document.createElement("div"); modal.className = "pl-modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal); document.body.classList.add("pl-lock");
    modal.addEventListener("click", function (e) { if (e.target === modal) closeImg(); });
    modal.innerHTML = '<div class="pl-mbox pl-imgbox"><div class="pl-mhead"><h2>' + t("imgTitle") + '</h2><button class="btn icon" type="button" data-x aria-label="' + t("done") + '">×</button></div><div class="pl-mbody"><p class="muted">' + t("making") + "</p></div></div>";
    modal.querySelector("[data-x]").onclick = closeImg;
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

  if (/[?&]test/.test(location.search)) window.__plEngineState = function () { return engineState(); };
  if (/[?&]test/.test(location.search)) document.addEventListener("pl-test", function (e) {
    var cases = JSON.parse(document.documentElement.getAttribute("data-pltest-in") || "[]"), o = S, out = [];
    cases.forEach(function (st) { S = clean(st); out.push(buildTotals().all); }); S = o;
    document.documentElement.setAttribute("data-pltest-out", JSON.stringify(out));
  });
  /* ?test=guides: open every guide build (planner/_guides_audit.json, written by guide_audit.py) and check it with the
     planner's own rules; the result goes to <html data-plguides-out> for the audit script to read */
  function guideCheck(c) {
    var bad = [], o = c.state;
    S = clean(JSON.parse(JSON.stringify(o)));
    var same = function (what, a, b) { if (JSON.stringify(a) !== JSON.stringify(b)) bad.push(what + " changed when opened: " + JSON.stringify(a) + " -> " + JSON.stringify(b)); };
    SLOT_ORDER.forEach(function (slot) {
      var g = o.gear[slot], k = S.gear[slot];
      if (!g) return;
      if (!k) { bad.push(slot + ": " + g.id + " dropped"); return; }
      var it = D.items[g.id];
      if (!fitsSlot(slot, g.id)) bad.push(slot + ": " + g.id + " does not fit this slot for " + S.cls);
      var why = blockReason(slot, g.id); if (why) bad.push(slot + ": " + g.id + " blocked (" + why + ")");
      var n = (g.cards || []).length, cap = sockets(k);
      if (n > cap) bad.push(slot + ": " + n + " cards, " + cap + " sockets");
      if (natSlots(k) + (k.extra || 0) > natSlots(k) + extraCap(it)) bad.push(slot + ": " + k.extra + " extra sockets, cap " + extraCap(it));
      (g.cards || []).forEach(function (cid) { if (!cardFits(it, cid)) bad.push(slot + ": card " + cid + " does not fit " + g.id); });
      if (g.trait && !canTrait(k)) bad.push(slot + ": trait " + g.trait + " not allowed on " + g.id);
      if (g.trait && !D.traits[g.trait]) bad.push(slot + ": unknown trait " + g.trait);
      if ((g.pot || []).length > 3) bad.push(slot + ": " + g.pot.length + " Star Potential lines");
      (g.pot || []).forEach(function (l) { if (!D.pot[l.k] || l.t < 1 || l.t > 4) bad.push(slot + ": bad Star Potential " + JSON.stringify(l)); });
      if ((g.refine || 0) > D.rules.maxRefine || ((g.refine || 0) && !refinable(it))) bad.push(slot + ": refine " + g.refine);
      if ((g.grade || 0) && (!gradable(it) || (g.refine || 0) < D.rules.gradeMinRefine)) bad.push(slot + ": grade " + g.grade + " needs +" + D.rules.gradeMinRefine);
      if (slot === "soul" && !soulOpen()) bad.push("soul slot closed");
      same(slot, { id: g.id, cards: g.cards || [], trait: g.trait || null, pot: g.pot || [], refine: g.refine || 0, grade: g.grade || 0 },
           { id: k.id, cards: k.cards || [], trait: k.trait || null, pot: k.pot || [], refine: k.refine || 0, grade: k.grade || 0 });
    });
    ["album", "pacts", "dishes", "plag", "banish", "prio"].forEach(function (f) { same(f, o[f] || [], S[f] || []); });
    same("pet", o.pet || "", S.pet || "");
    if ((S.album || []).length > albumCap()) bad.push("album: " + S.album.length + " cards, cap " + albumCap());
    if ((S.plag || []).length > plagCap()) bad.push("plagiarism: " + S.plag.length + ", cap " + plagCap());
    if ((S.dishes || []).length > S.chef) bad.push("dishes: " + S.dishes.length + ", chef " + S.chef);
    var pool = upPool();
    (S.prio || []).forEach(function (p) { if (pool.indexOf(p.id) < 0) bad.push("priority: " + p.id + " is not offered to " + S.cls + " (hidden in the planner)"); });
    (S.banish || []).forEach(function (b) { if (pool.indexOf(b) < 0) bad.push("banish: " + b + " is not offered to " + S.cls); });
    if ((S.banish || []).length > S.holy) bad.push("banish: " + S.banish.length + " > Holy Water " + S.holy);
    var got = buildTotals().all, want = c.expect, keys = {};
    Object.keys(got).concat(Object.keys(want)).forEach(function (k) { keys[k] = 1; });
    Object.keys(keys).forEach(function (k) {
      var a = got[k] || 0, b = want[k] || 0;
      if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b))) bad.push("total " + k + ": planner " + a + ", reference " + b);
    });
    return { id: c.id, problems: bad, totals: Object.keys(got).length };
  }
  if (/[?&]test=guides/.test(location.search)) (function wait() {
    if (!D || !root.querySelector("*")) return setTimeout(wait, 50);
    fetch(BASE + "_guides_audit.json?" + Date.now()).then(function (r) { return r.json(); }).then(function (cases) {
      var keep = S, out = cases.map(function (c) { try { return guideCheck(c); } catch (e) { return { id: c.id, problems: ["error: " + e] }; } });
      S = keep;
      document.documentElement.setAttribute("data-plguides-out", JSON.stringify(out));
    });
  })();

  /* ---------------- boot ---------------- */
  document.addEventListener("langchange", function () { if (!D) return; render(); });
  fetch(BASE + "data.json?v=" + (root.getAttribute("data-v") || "")).then(function (r) { return r.json(); }).then(function (data) {
    D = data;
    D.classNames = {};
    D.classes.forEach(function (c) { D.classNames[c.id] = c.id === "kagerou" ? "Kagerou / Oboro" : c.id === "clown" ? "Clown / Gypsy" : c.name; });
    var cur = null;
    try { var c = JSON.parse(localStorage.getItem(LS_CUR) || "null"); if (valid(c)) cur = clean(c); } catch (e) {}
    /* a link opens a build: #s=CODE (short, from our Worker), #z= (self-contained), #b= (old long links) or #g=<guide>[:<kit>] (a guide's "Open in planner") */
    var mp = location.hash.match(/#p=([2-9A-HJ-NP-Z]{8})(?![0-9A-Za-z])/);
    var h = location.hash, ms = h.match(/#s=([2-9A-HJ-NP-Z]{8})(?![0-9A-Za-z])/), mz = h.match(/#z=([\w-]+)/), mb = h.match(/#b=([\w-]+)/), mg = h.match(/#g=([\w-]+)(?::([\w-]+))?/);
    var incoming = mp ? fetch(PUB + "/" + mp[1]).then(function (r) { if (!r.ok) throw new Error("missing"); return r.json(); })
        .then(function (j) { var p = String(j.payload || ""); if (p.indexOf("z1.") !== 0) throw new Error("bad"); return readLink(p.slice(3)).then(function (o) { o.name = j.name; return o; }); })
      : ms ? readShort(ms[1]) : mz ? readLink(mz[1]) : mb ? Promise.resolve().then(function () { return decode(mb[1]); })
      : mg ? fetch(BASE + "guides.json?v=" + (root.getAttribute("data-v") || "")).then(function (r) { return r.json(); }).then(function (all) {
          var list = all[mg[1]] || [], e = list.filter(function (x) { return x.key === mg[2]; })[0] || list[0];
          return e && e.state;
        })
      : Promise.resolve(null);
    if (mp || ms || mz || mb || mg) history.replaceState(null, "", location.pathname);
    incoming.catch(function () { return null; }).then(function (o) {
      if (o && valid(o)) {
        /* keep the build that was open: it goes to "Saved builds" unless it is already there */
        if (cur && Object.keys(cur.gear || {}).length && !savedList().some(function (x) { return JSON.stringify(x.data) === JSON.stringify(cur); })) {
          var a = savedList(); a.unshift({ name: cur.name || t("untitled"), data: cur, at: Date.now() }); setSaved(a.slice(0, 50));
        }
        S = clean(o); persist();
      } else S = cur;
      render();
    });
  }).catch(function () { root.innerHTML = '<p class="muted">Could not load the planner data.</p>'; });
})();
