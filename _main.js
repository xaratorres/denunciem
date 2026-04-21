
  'use strict';

  // ─── VISTA (grid / llista) ─────────────────────────
  const VISTA_KEY = 'denunciem-vista';
  function getVista() {
    return localStorage.getItem(VISTA_KEY) || 'llista';
  }
  function setVista(v) {
    localStorage.setItem(VISTA_KEY, v);
    document.body.classList.toggle('vista-grid', v === 'grid');
    document.body.classList.toggle('vista-llista', v === 'llista');
    // Refresca l'icona del toggle (si existeix)
    const btn = document.getElementById('btn-vista');
    if (btn) btn.innerHTML = v === 'grid' ? ICON_VIEW_LIST : ICON_VIEW_GRID;
    if (btn) btn.setAttribute('aria-label', v === 'grid' ? 'Veure com a llista' : 'Veure com a graella');
    if (btn) btn.setAttribute('title', v === 'grid' ? 'Veure com a llista' : 'Veure com a graella');
    window.dispatchEvent(new CustomEvent('vista-change', { detail: v }));
  }
  // Icones inline (es fan servir al toggle i a la nav)
  const ICON_VIEW_GRID = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;
  const ICON_VIEW_LIST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>`;
  // Aplica vista inicial com més aviat millor
  setVista(getVista());

  // ─── CONFIG ────────────────────────────────────────
  const GAP  = 4;
  const NAV_H = 54;
  const GW_INIT = window.innerWidth;
  const IS_MOBILE = GW_INIT < 500;
  let COLS, ROWS, BASE_ROWS, TOTAL;

  // Calcula COLS/ROWS per a cel·les QUADRADES
  function computeGridDims() {
    const GW = window.innerWidth;
    const GH = (window.visualViewport?.height ?? window.innerHeight) - NAV_H;
    // Landscape amb alçada petita (mòbil girat o tauleta horitzontal):
    // cel·les dimensionades per l'alçada, COLS ompli l'amplada.
    const isLandscapeSmall = GW > GH && GH < 500;
    if (IS_MOBILE && !isLandscapeSmall) {
      COLS = 6; BASE_ROWS = 10;
    } else if (isLandscapeSmall) {
      // Mida de cel·la equivalent a la del mòbil portrait (6 cols al cantó curt)
      const shortSide = Math.min(GW, window.innerHeight);
      const TARGET_CELL = Math.max(52, Math.min(64, Math.floor((shortSide - GAP * 7) / 6)));
      COLS = Math.max(8, Math.floor((GW - GAP) / (TARGET_CELL + GAP)));
      BASE_ROWS = Math.max(3, Math.floor((GH - GAP) / (TARGET_CELL + GAP)));
    } else {
      let bestDiff = Infinity, bestC = 12, bestR = 6;
      for (let c = 16; c >= 8; c--) {
        const cellW = (GW - GAP * (c + 1)) / c;
        const r = Math.max(3, Math.min(10, Math.round((GH - GAP) / (cellW + GAP))));
        const cellH = (GH - GAP * (r + 1)) / r;
        const diff = Math.abs(cellW - cellH);
        if (diff < bestDiff && r >= 4) { bestDiff = diff; bestC = c; bestR = r; }
      }
      COLS = bestC; BASE_ROWS = bestR;
    }
    // Si hi ha més entitats que cel·les a la graella base, afegim files al fons
    // fins a encabir-les totes (amb una mica de marge per respirar).
    const V_LEN = (typeof ENTITATS !== 'undefined')
      ? ENTITATS.filter(e => !e.hidden).length
      : 0;
    const MIN_SLOTS = Math.ceil(V_LEN * 1.25); // 25% de "panots grisos" de marge
    ROWS = Math.max(BASE_ROWS, Math.ceil(MIN_SLOTS / COLS));
    TOTAL = COLS * ROWS;
  }
  computeGridDims();
  const HAS_EXTRA_ROWS = ROWS > BASE_ROWS;
  if (HAS_EXTRA_ROWS) document.body.classList.add('grid-overflow');

  // ─── HELPERS ───────────────────────────────────────
  const $ = id => document.getElementById(id);
  const rand = (a, b) => Math.random() * (b - a) + a;
  const inicial = nom => {
    // Agafa la primera lletra significativa ignorant articles/etc.
    const stop = ['de','del','la','el','els','les','i','d\'','l\''];
    const paraules = nom.split(/\s+/).filter(p => !stop.includes(p.toLowerCase().replace(/[.,]/g,'')));
    return (paraules[0] || nom).charAt(0).toUpperCase();
  };
  // Enfosqueix un color hex per un factor (0 = negre, 1 = igual)
  function darken(hex, factor) {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return `rgb(${Math.round(r*factor)},${Math.round(g*factor)},${Math.round(b*factor)})`;
  }

  // Color per tipus (CSS var + fallback hex)
  const TIPUS_COLOR = {
    administratiu: '#2563EB',
    legal:         '#B91C1C',
    estrategic:    '#7C2D12',
    social:        '#C2410C',
    sectorial:     '#047857',
  };

  // ─── SIZING ────────────────────────────────────────
  const gridEl = $('grid');
  let cellSize = 0;

  function sizeGrid() {
    const GW = window.innerWidth;
    const GH = (window.visualViewport?.height ?? window.innerHeight) - NAV_H;
    // cellSize es calcula perquè la graella BASE (sense files extres) encaixi en pantalla.
    // Les files extres s'afegeixen al fons i fan créixer el grid (scrollable).
    const cellFromW = Math.floor((GW - GAP * (COLS + 1)) / COLS);
    const cellFromH = Math.floor((GH - GAP * (BASE_ROWS + 1)) / BASE_ROWS);
    cellSize = Math.max(1, Math.min(cellFromW, cellFromH));
    gridEl.style.gridTemplateColumns = `repeat(${COLS}, ${cellSize}px)`;
    gridEl.style.gridTemplateRows    = `repeat(${ROWS}, ${cellSize}px)`;
    if (ROWS > BASE_ROWS) {
      // La graella creix cap avall; el body és scrollable (vegeu CSS body.grid-overflow).
      gridEl.style.height = 'auto';
      gridEl.style.minHeight = GH + 'px';
      gridEl.style.paddingTop    = GAP + 'px';
      gridEl.style.paddingBottom = GAP + 'px';
    } else {
      gridEl.style.height = GH + 'px';
      gridEl.style.minHeight = '';
      // Centra verticalment l'espai lliure
      const trackH = ROWS * cellSize + (ROWS - 1) * GAP;
      const vPad = Math.max(GAP, (GH - trackH) / 2);
      gridEl.style.paddingTop    = vPad + 'px';
      gridEl.style.paddingBottom = vPad + 'px';
    }
    document.documentElement.style.setProperty('--cell-size', cellSize + 'px');
  }
  sizeGrid();

  // ─── POSICIONS ─────────────────────────────────────
  // Entitats visibles al grid (les amb `hidden:true` queden fora del mapa i dels filtres UI,
  // però segueixen accessibles via deep-link #id)
  const ENTITATS_V = ENTITATS.filter(e => !e.hidden);
  let POSICIONS_EINES = [];
  function computePositions() {
    POSICIONS_EINES = ENTITATS_V.map(e => {
      const [rc, rr] = IS_MOBILE ? e.pos_mobil : e.pos;
      const col = Math.min(COLS - 1, Math.round(rc * COLS));
      const row = Math.min(BASE_ROWS - 1, Math.round(rr * BASE_ROWS));
      return row * COLS + col;
    });
    const usat = new Set();
    POSICIONS_EINES.forEach((pos, i) => {
      let p = pos;
      while (usat.has(p)) p = (p + 1) % TOTAL;
      POSICIONS_EINES[i] = p;
      usat.add(p);
    });
  }
  computePositions();

  // ─── TONS PANOTS ───────────────────────────────────
  const TONS = ['#ebe8e3','#e3e0db','#dcd9d3','#e8e5df','#d5d1cb','#eae7e2','#dfdcd6','#d8d4ce'];
  const DARK_TONS = ['#1b1a18','#1f1e1b','#171614','#1d1c19','#252320','#1a1816','#22201d','#1e1c1a'];

  // Genera mur d'X
  function makeXBuf(n) { return 'X'.repeat(n); }
  function makeXVert() { return makeXBuf(2000); }
  function makeXHoriz() {
    const rows = [];
    for (let r = 0; r < 18; r++) rows.push(makeXBuf(320));
    return rows.join('\n');
  }

  // ─── POSICIONA TOOLTIP SEMPRE A SOBRE ─────────────
  function positionNom(cell, ring) {
    const nomEl = ring.querySelector('.nom');
    if (!nomEl) return;
    const rect = cell.getBoundingClientRect();
    const GAP_PX = 8;
    // offsetWidth/Height funcionen tot i opacity:0 perquè l'element està al DOM
    const nomH = nomEl.offsetHeight || 24;
    const nomW = nomEl.offsetWidth || 120;
    // Sempre a sobre; si toparia amb la nav sticky, posar-ho a sota
    let top = rect.top - nomH - GAP_PX;
    if (top < NAV_H + GAP_PX) top = rect.bottom + GAP_PX;
    // Horitzontal: centrat sobre la cel·la, clamped al viewport
    let left = rect.left + rect.width / 2 - nomW / 2;
    left = Math.max(GAP_PX, Math.min(left, window.innerWidth - nomW - GAP_PX));
    nomEl.style.top = top + 'px';
    nomEl.style.left = left + 'px';
  }

  // ─── DOBLE TAP MÒBIL ───────────────────────────────
  let activeMobileCell = null;
  function deactivateMobile() {
    if (activeMobileCell) { activeMobileCell.classList.remove('eina-activa'); activeMobileCell = null; }
  }
  if (IS_MOBILE) {
    document.addEventListener('touchstart', e => {
      if (activeMobileCell && !activeMobileCell.contains(e.target)) deactivateMobile();
    }, { passive: true });
  }

  // ─── CONSTRUCCIÓ GRID ─────────────────────────────
  const toolData = [];
  const grisData = [];
  let waveLayer = null;

  function buildGrid() {
    // Neteja estat previ abans de reconstruir (per suportar rebuild on resize)
    gridEl.innerHTML = '';
    toolData.length = 0;
    grisData.length = 0;
    waveLayer = null;

    const einesPosMap = new Map(POSICIONS_EINES.map((pos, i) => [pos, i]));
    const assignedBg = new Array(TOTAL).fill(null);

    for (let i = 0; i < TOTAL; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      if (einesPosMap.has(i)) {
        const ent = ENTITATS_V[einesPosMap.get(i)];
        const color = TIPUS_COLOR[ent.tipus];
        cell.classList.add('eina');
        cell.dataset.tipus = ent.tipus;
        cell.dataset.territori = ent.territori || 'cat';
        cell.dataset.mesenlla = ent.mesenlla ? '1' : '0';
        cell.dataset.tematiques = (ent.tematiques || []).join(',');
        cell.style.setProperty('--tipcolor', color);

        // Backdrop tintat (versió fosca del color) amb textura d'X
        const backdrop = document.createElement('div');
        backdrop.className = 'eina-backdrop';
        const bgLight = darken(color, 0.55);
        const bgDark  = darken(color, 0.26);
        backdrop.style.setProperty('--bg-light', bgLight);
        backdrop.style.background = bgLight;
        const bmesh = document.createElement('pre');
        bmesh.className = 'mesh';
        bmesh.textContent = makeXVert();
        bmesh.style.top = '-9px';
        backdrop.appendChild(bmesh);
        cell.appendChild(backdrop);

        const ring = document.createElement('div');
        ring.className = 'tool-ring';

        const ini = document.createElement('span');
        const siglaText = ent.sigles || inicial(ent.nom);
        // Per a sigles amb salt de línia, la mida es basa en la línia més llarga
        const lines = siglaText.split('\n');
        const maxLine = Math.max(...lines.map(l => l.length));
        const lenClass = 'len-' + Math.min(Math.max(maxLine, 1), 12);
        ini.className = 'tool-initial ' + lenClass + (lines.length > 1 ? ' multiline' : '');
        ini.textContent = siglaText;
        ring.appendChild(ini);

        const nom = document.createElement('div');
        nom.className = 'nom';
        nom.textContent = ent.nom;
        ring.appendChild(nom);

        cell.appendChild(ring);
        // Click: obre la fitxa. Doble clic: obre l'enllaç directament.
        let clickTimer = null;
        cell.addEventListener('click', () => {
          if (clickTimer) return;
          clickTimer = setTimeout(() => {
            clickTimer = null;
            openFitxa(ent.id);
          }, 230);
        });
        cell.addEventListener('dblclick', () => {
          if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
          if (ent.enllac && !ent.enllac_inactiu) {
            window.open(ent.enllac, '_blank', 'noopener,noreferrer');
          } else {
            openFitxa(ent.id);
          }
        });

        cell.addEventListener('mouseenter', () => positionNom(cell, ring));

        if (IS_MOBILE) {
          // Un tap = click (obre fitxa). Dos taps ràpids = obre l'enllaç directament.
          let lastTap = 0;
          cell.addEventListener('touchend', e => {
            const now = Date.now();
            if (now - lastTap < 350) {
              e.preventDefault();
              if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
              if (ent.enllac && !ent.enllac_inactiu) {
                window.open(ent.enllac, '_blank', 'noopener,noreferrer');
              } else {
                openFitxa(ent.id);
              }
              lastTap = 0;
            } else {
              lastTap = now;
            }
          });
        }

        toolData.push({
          ring, cell,
          color,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.00035, 0.00060),
          backdrop, bgLight, bgDark,
          wasGrowing: false,
        });

      } else {
        cell.classList.add('gris');
        const veins = new Set([
          assignedBg[i - 1], assignedBg[i - COLS],
          assignedBg[i - COLS - 1], assignedBg[i - COLS + 1],
        ]);
        const candidats = TONS.filter(t => !veins.has(t));
        const bg = candidats[Math.floor(Math.random() * candidats.length)];
        const bgDark = DARK_TONS[TONS.indexOf(bg)] ?? DARK_TONS[0];
        assignedBg[i] = bg;
        cell.style.background = bg;

        const DIRS = ['up','down','left','right'];
        const dir = DIRS[Math.floor(Math.random() * 4)];
        const isH = dir === 'left' || dir === 'right';

        const pre = document.createElement('pre');
        pre.className = 'mesh';
        if (isH) { pre.style.whiteSpace = 'pre'; pre.style.wordBreak = 'normal'; pre.style.overflowWrap = 'normal'; }
        pre.textContent = isH ? makeXHoriz() : makeXVert();
        cell.appendChild(pre);

        grisData.push({
          el: cell, bgLight: bg, bgDark, pre, dir, isH,
          baseSpeed: rand(0.06, 0.09),
          offset: Math.random() * 150,
          maxOffset: isH ? 1100 : 400,
        });
      }

      gridEl.appendChild(cell);
    }
    // La capa d'ones es (re)crea i s'enganxa al final
    waveLayer = document.createElement('div');
    waveLayer.id = 'wave-layer';
    gridEl.appendChild(waveLayer);
    // Re-aplica filtres actuals per no perdre-ho en rebuild
    if (typeof applyFilters === 'function') applyFilters();
  }
  buildGrid();

  // Reajustar layout al resize (amb debounce)
  {
    let rTimer = null;
    const onResize = () => {
      clearTimeout(rTimer);
      rTimer = setTimeout(() => {
        // Recomputem dimensions; si COLS/BASE_ROWS canvien, reconstruïm el grid
        const oldC = COLS, oldR = ROWS;
        computeGridDims();
        const HAS_EXTRA_ROWS_NOW = ROWS > BASE_ROWS;
        document.body.classList.toggle('grid-overflow', HAS_EXTRA_ROWS_NOW);
        if (COLS !== oldC || ROWS !== oldR) {
          computePositions();
          buildGrid();
        }
        sizeGrid();
      }, 120);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 250));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
  }

  // ─── ANIMACIÓ: aura + ones + scroll X ─────────────
  (function anim() {
    // waveLayer ja està creada per buildGrid() i es regenera en cada rebuild
    function spawnWave(td) {
      if (!waveLayer) return;
      // offsetLeft/Top són relatius a l'offsetParent (#grid té position:relative),
      // així sempre queden al centre exacte de la cel·la, independent de scroll o
      // caches obsoletes.
      const cx = td.cell.offsetLeft + td.cell.offsetWidth  / 2;
      const cy = td.cell.offsetTop  + td.cell.offsetHeight / 2;
      const w  = td.cell.offsetWidth;
      const h  = td.cell.offsetHeight;
      const c = td.color;
      const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
      const ring = document.createElement('div');
      ring.className = 'wave-ring';
      ring.style.cssText =
        `left:${cx}px;top:${cy}px;` +
        `width:${w}px;height:${h}px;` +
        `border-color:rgba(${r},${g},${b},0.75);`;
      waveLayer.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
    }

    // Precomputa els RGB de cada tool (evita parsejar hex en cada frame)
    toolData.forEach(td => {
      const c = td.color;
      td.r = parseInt(c.slice(1,3),16);
      td.g = parseInt(c.slice(3,5),16);
      td.b = parseInt(c.slice(5,7),16);
    });

    let rafId = null;
    // Throttle a ~30fps: les aures són lentes i no es nota res; la càrrega de paint baixa a la meitat
    let lastTick = 0;
    const FRAME_MS = 1000 / 30;
    function tick(t) {
      rafId = requestAnimationFrame(tick);
      if (t - lastTick < FRAME_MS) return;
      lastTick = t;
      toolData.forEach(td => {
        // Si la cel·la està filtrada (dim), aturem aura i ones i sortim.
        // Estalvia paint i deixa clar visualment que no és activa.
        const dimmed = td.cell.classList.contains('dim');
        if (dimmed) {
          if (!td.wasDimmed) {
            td.ring.style.boxShadow = 'none';
            td.wasDimmed = true;
          }
          td.wasGrowing = false; // evita spawn d'ona quan recuperi l'estat
          return;
        }
        td.wasDimmed = false;
        const raw = (1 + Math.sin(t * td.speed + td.phase)) * 0.5;
        const raw2 = (1 + Math.sin(t * td.speed * 2.4 + td.phase + 1.8)) * 0.5;
        // Radis d'ombra reduïts (abans 34/12/90/34 → ara 20/7/48/18).
        // box-shadow es pinta a CPU, no a GPU: baixar el blur és la millora més gran.
        const sh =
          `0 0 ${(raw2 * 20).toFixed(1)}px ${(raw2 * 7).toFixed(1)}px rgba(${td.r},${td.g},${td.b},${(0.30 + raw2 * 0.40).toFixed(2)}),` +
          `0 0 ${(raw  * 48).toFixed(1)}px ${(raw  * 18).toFixed(1)}px rgba(${td.r},${td.g},${td.b},${(0.10 + raw  * 0.22).toFixed(2)})`;
        td.ring.style.boxShadow = sh;
        // Emet ona quan l'aura passa de decreixent a creixent
        const growing = Math.cos(t * td.speed + td.phase) > 0;
        if (growing && !td.wasGrowing) spawnWave(td);
        td.wasGrowing = growing;
      });
      grisData.forEach(g => {
        g.offset += g.baseSpeed;
        if (g.offset > g.maxOffset) {
          g.offset = 0;
          g.pre.textContent = g.isH ? makeXHoriz() : makeXVert();
        }
        const tx = g.dir === 'left' ? -g.offset : g.dir === 'right' ? (g.offset - g.maxOffset) : 0;
        const ty = g.dir === 'up'   ? -g.offset : g.dir === 'down'  ? (g.offset - g.maxOffset) : 0;
        g.pre.style.transform = `translate(${tx}px,${ty}px)`;
      });
    }
    function startAnim() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(tick);
    }
    function stopAnim() {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // Només córrer quan estem a la vista grid i la pestanya és visible
    // (estalvia CPU/bateria quan l'usuari és a la llista o ha canviat de pestanya)
    function syncAnim() {
      const active = getVista() === 'grid' && !document.hidden;
      if (active) startAnim(); else stopAnim();
    }
    syncAnim();
    document.addEventListener('visibilitychange', syncAnim);
    window.addEventListener('vista-change', syncAnim);
  })();

  // ─── MODE NIT ─────────────────────────────────────
  const DARK_KEY = 'denunciem-dark';
  const toggleDark = $('toggle-dark');
  function applyDark(dark) {
    document.documentElement.classList.toggle('dark', dark);
    document.querySelector('meta[name="theme-color"]').content = dark ? '#111112' : '#ffffff';
    grisData.forEach(g => { if (g.el) g.el.style.background = dark ? g.bgDark : g.bgLight; });
    toolData.forEach(t => { if (t.backdrop) t.backdrop.style.background = dark ? t.bgDark : t.bgLight; });
    toggleDark.classList.toggle('on', dark);
    localStorage.setItem(DARK_KEY, dark ? '1' : '0');
  }
  (function initDark() {
    const saved = localStorage.getItem(DARK_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDark(saved !== null ? saved === '1' : prefersDark);
  })();
  toggleDark.addEventListener('click', () => applyDark(!document.documentElement.classList.contains('dark')));

  // Switch de vista al Config
  const vistaSwitch = $('config-vista-switch');
  function refreshVistaSwitch() {
    const curr = getVista();
    vistaSwitch.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.v === curr);
    });
  }
  vistaSwitch.addEventListener('click', e => {
    const b = e.target.closest('button[data-v]');
    if (!b) return;
    setVista(b.dataset.v);
  });
  refreshVistaSwitch();
  // Mantén el switch sincronitzat si la vista canvia des de la nav
  window.addEventListener('vista-change', refreshVistaSwitch);

  // ─── SPLASH ───────────────────────────────────────
  const splash = $('splash');
  let splashDismissed = false;
  function dismissSplash() {
    if (splashDismissed) return;
    splashDismissed = true;
    splash.classList.add('out');
    setTimeout(() => gridEl.classList.add('visible'), 250);
    setTimeout(() => splash.remove(), 1700);
    maybeStartOnboarding();
  }
  splash.addEventListener('click', dismissSplash);
  setTimeout(dismissSplash, 2600);

  // ─── ONBOARDING ────────────────────────────────────
  const ONBOARDING_KEY = 'denunciem-onboarded-v2';
  const obOverlay = $('overlay-onboarding');
  const obBtn = $('btn-entesos');

  function maybeStartOnboarding() {
    if (localStorage.getItem(ONBOARDING_KEY) === '1') return;
    setTimeout(() => obOverlay.classList.add('open'), 600);
  }
  obBtn.addEventListener('click', () => {
    obOverlay.classList.remove('open');
    localStorage.setItem(ONBOARDING_KEY, '1');
  });

  // ─── OVERLAYS genèrics ────────────────────────────
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => $(btn.dataset.close).classList.remove('open'));
  });
  document.querySelectorAll('.overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
  });

  // ─── FILTRES COMBINATS (tipus + territori + tematica) ────────
  let activeTipus = null;
  let activeTerritori = null;
  let activeTematica = null;

  function entitatMatchesFilters(ent) {
    const matchT = activeTipus === null || ent.tipus === activeTipus;
    // Territori:
    //  · "mesenlla" no hi posa entitats paisos automàticament; només les que tenen flag mesenlla:true.
    //  · altres territoris: matching directe + transversals (paisos) que cobreixen tots els PPCC.
    const matchG = activeTerritori === null
      || (activeTerritori === 'mesenlla'
          ? !!ent.mesenlla
          : (ent.territori === activeTerritori || ent.territori === 'paisos'));
    const matchTem = activeTematica === null
      || (ent.tematiques || []).includes(activeTematica);
    return matchT && matchG && matchTem;
  }

  function applyFilters() {
    // Grid: dim cel·les que no coincideixen
    document.querySelectorAll('.cell.eina').forEach(c => {
      const tipus = c.dataset.tipus;
      const territori = c.dataset.territori;
      const mesenlla = c.dataset.mesenlla === '1';
      const tematiques = (c.dataset.tematiques || '').split(',').filter(Boolean);
      const matchT = activeTipus === null || tipus === activeTipus;
      const matchG = activeTerritori === null
        || (activeTerritori === 'mesenlla'
            ? mesenlla
            : (territori === activeTerritori || territori === 'paisos'));
      const matchTem = activeTematica === null || tematiques.includes(activeTematica);
      c.classList.toggle('dim', !(matchT && matchG && matchTem));
    });
    // Vista llista: ho gestiona la pròpia llista (es reconstrueix a renderLlista)
    if (window.renderLlista) window.renderLlista();
  }

  // ─── MODAL AJUDA'M ────────────────────────────────
  const ajudamOverlay = $('overlay-ajudam');
  const ajudamModal   = $('ajudam-modal');

  function updateAjudamCount() {
    const countEl = document.getElementById('ajudam-count');
    const warnEl  = document.getElementById('ajudam-zero-warn');
    if (!countEl) return;
    const n = ENTITATS_V.filter(entitatMatchesFilters).length;
    countEl.textContent = n;
    const wasZero = countEl.classList.contains('zero');
    countEl.classList.toggle('zero', n === 0);
    if (warnEl) warnEl.classList.toggle('visible', n === 0);
    // Re-trigger shake animation cada vegada que arribi a 0 (si abans no ho era ja, o si torna)
    if (n === 0) {
      countEl.classList.remove('zero');
      void countEl.offsetWidth;
      countEl.classList.add('zero');
    }
  }

  function pulseCheck(q, hasValue) {
    const check = ajudamModal.querySelector(`.ajudam-check[data-check="${q}"]`);
    if (!check) return;
    if (hasValue) {
      check.classList.add('visible');
      // Re-disparar l'animació de pols encara que ja estigui visible
      check.classList.remove('pulse');
      void check.offsetWidth; // força reflow
      check.classList.add('pulse');
    } else {
      check.classList.remove('visible', 'pulse');
    }
  }

  function buildAjudamOptions() {
    const groups = [
      { q: 'territori', meta: TERRITORI_META, skip: ['paisos'] },
      { q: 'tematica',  meta: TEMATIQUES_META },
      { q: 'tipus',     meta: TIPUS_META },
    ];
    groups.forEach(({ q, meta, skip }) => {
      const container = ajudamModal.querySelector(`.ajudam-opts[data-q="${q}"]`);
      container.innerHTML = '';
      Object.entries(meta).forEach(([key, m]) => {
        if (skip && skip.includes(key)) return;
        const b = document.createElement('button');
        b.className = 'ajudam-opt';
        b.dataset.val = key;
        b.textContent = m.nom;
        b.addEventListener('click', () => {
          const wasSelected = b.classList.contains('selected');
          container.querySelectorAll('.ajudam-opt').forEach(x => x.classList.remove('selected'));
          if (!wasSelected) b.classList.add('selected');
          const newVal = wasSelected ? null : key;
          // Aplica immediatament a l'estat actiu (auto-save)
          if      (q === 'territori') activeTerritori = newVal;
          else if (q === 'tematica')  activeTematica  = newVal;
          else if (q === 'tipus')     activeTipus     = newVal;
          pulseCheck(q, newVal !== null);
          applyFilters();
        });
        container.appendChild(b);
      });
    });
  }
  buildAjudamOptions();

  function openAjudam() {
    // Sincronitza UI amb l'estat actual (que sempre està aplicat)
    ajudamModal.querySelectorAll('.ajudam-opt').forEach(b => b.classList.remove('selected'));
    const setSel = (q, val) => {
      pulseCheck(q, val !== null);
      if (val === null) return;
      const el = ajudamModal.querySelector(`.ajudam-opts[data-q="${q}"] .ajudam-opt[data-val="${val}"]`);
      if (el) el.classList.add('selected');
    };
    // No anima en obrir — només mostra les marques sense pols
    ['territori','tematica','tipus'].forEach(q => {
      const check = ajudamModal.querySelector(`.ajudam-check[data-check="${q}"]`);
      if (check) check.classList.remove('pulse');
    });
    setSel('territori', activeTerritori);
    setSel('tematica',  activeTematica);
    setSel('tipus',     activeTipus);
    // Treu totes les pulses (només els visible es mantenen)
    setTimeout(() => ajudamModal.querySelectorAll('.ajudam-check.pulse').forEach(c => c.classList.remove('pulse')), 0);
    updateAjudamCount();
    ajudamOverlay.classList.add('open');
  }

  // El modal es tanca amb la creu (data-close="overlay-ajudam") o ESC.
  // Els canvis ja s'apliquen en directe, no cal cap botó «Fet».

  // Exposa openAjudam globalment per si la volem cridar de la nav
  window.openAjudam = openAjudam;

  // Marca el botó Ajuda'm en roig si hi ha algun filtre actiu + actualitza comptador
  const _origApply = applyFilters;
  applyFilters = function() {
    _origApply();
    const any = activeTipus !== null || activeTerritori !== null || activeTematica !== null;
    $('btn-ajudam').classList.toggle('active-filter', any);
    updateAjudamCount();
    updateNavCount(any);
  };

  // Xip comptador de la nav (vista grid) — mateixa mecànica que el de la llista
  function updateNavCount(hasFilters) {
    const el = document.getElementById('nav-count');
    if (!el) return;
    const n = ENTITATS_V.filter(entitatMatchesFilters).length;
    // Substitueix només el primer text node (conserva l'SVG)
    el.firstChild.nodeValue = n + ' ';
    el.classList.toggle('clearable', !!hasFilters);
    el.title = hasFilters ? 'Clica per netejar els filtres' : '';
  }
  (function wireNavCount() {
    const el = document.getElementById('nav-count');
    if (!el) return;
    const clear = () => {
      if (activeTipus === null && activeTerritori === null && activeTematica === null) return;
      activeTipus = null;
      activeTerritori = null;
      activeTematica = null;
      ajudamModal.querySelectorAll('.ajudam-opt.selected').forEach(b => b.classList.remove('selected'));
      ajudamModal.querySelectorAll('.ajudam-check.visible').forEach(c => c.classList.remove('visible', 'pulse'));
      applyFilters();
    };
    el.addEventListener('click', () => { if (el.classList.contains('clearable')) clear(); });
    el.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && el.classList.contains('clearable')) {
        e.preventDefault(); clear();
      }
    });
  })();

  applyFilters();

  // ─── FITXA ────────────────────────────────────────
  const fitxaOverlay = $('overlay-fitxa');
  const fitxaModal = $('fitxa-modal');
  function openFitxa(id) {
    const ent = ENTITATS.find(e => e.id === id);
    if (!ent) return;
    const meta = TIPUS_META[ent.tipus];
    fitxaModal.style.setProperty('--tipcolor', meta.color);
    fitxaModal.innerHTML = `
      <button class="modal-close" onclick="document.getElementById('overlay-fitxa').classList.remove('open')" aria-label="Tanca">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <div class="fitxa-head">
        <div class="fitxa-tipus"><span class="dot"></span>${meta.nom}</div>
        <div class="fitxa-nom">${ent.nom}</div>
        <div class="fitxa-ambit">${ent.ambit}</div>
      </div>
      <div class="fitxa-body">
        <div class="fitxa-lead">${ent.per_a_que}</div>

        <div class="fitxa-meta">
          <div><div class="lbl">Temps aproximat</div><div class="val">${ent.temps}</div></div>
          <div><div class="lbl">Tipus de via</div><div class="val">${meta.nom}</div></div>
        </div>

        ${(ent.adreca || ent.telefon || ent.email) ? `
          <div class="fitxa-contacte">
            ${ent.adreca ? `
              <div class="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${ent.adreca}</span>
              </div>` : ''}
            ${ent.telefon ? `
              <div class="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
                <a href="tel:${ent.telefon.replace(/\s/g,'')}">${ent.telefon}</a>
              </div>` : ''}
            ${ent.email ? `
              <div class="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href="mailto:${ent.email}">${ent.email}</a>
              </div>` : ''}
          </div>` : ''}

        ${ent.enllac_inactiu
          ? `<button class="fitxa-cta disabled" disabled title="L'enllaç oficial no funciona actualment">
              Enllaç no disponible
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </button>`
          : `<a class="fitxa-cta" href="${ent.enllac}" target="_blank" rel="noopener noreferrer">
              Obrir canal directe
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
            </a>`}

        <details class="fitxa-fold">
          <summary>Quan usar-ho</summary>
          <div class="fold-body">
            <div class="fitxa-field">
              <ul>${ent.quan_usar.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
          </div>
        </details>

        <details class="fitxa-fold">
          <summary>Què pots esperar</summary>
          <div class="fold-body">
            <div class="fitxa-field">
              <ul>${ent.que_esperar.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div class="fitxa-field">
              <h3>Resultat habitual</h3>
              <p>${ent.resultat_habitual}</p>
            </div>
          </div>
        </details>

        <details class="fitxa-fold">
          <summary>Punts forts i limitacions</summary>
          <div class="fold-body">
            <div class="fitxa-field">
              <h3>Punts forts</h3>
              <ul>${ent.punts_forts.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div class="fitxa-field neg">
              <h3>Limitacions</h3>
              <ul>${ent.limitacions.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
          </div>
        </details>
      </div>
    `;
    fitxaModal.scrollTop = 0;
    fitxaOverlay.classList.add('open');
  }
  window.openFitxa = openFitxa;

  // ─── VISTA LLISTA (plena pantalla, reemplaça el modal Entitats) ───
  function renderLlista() {
    const LLISTA_INTRO_HTML = `
      <header class="llista-intro">
        <h1>Els teus drets, a <span class="em">un clic</span>.</h1>
        <p>Directori d'<strong>entitats i canals</strong> que tens a disposició a la <strong>nació</strong> per fer valer els teus drets. Estan agrupats per tipus de via: administratiu, legal, pressió social…</p>
        <p>Toca una entitat per veure què fa, quan usar-la, i les dades de contacte. Si no saps per on començar, obre <span class="hint-ajudam">Ajuda'm</span> i respon les preguntes.</p>
      </header>
      <h2 class="llista-sec-title">Canals de denúncia <span class="llista-count" id="llista-count">${ENTITATS_V.length}<svg class="x-clear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></h2>
    `;
    const LLISTA_FOOTER_HTML = `
      <footer class="llista-footer">
        <strong>Eina en fase de revisió.</strong> Si detectes algun error o vols fer una aportació, escriu a <a href="https://xiuxiuejar.com/espai/drets" target="_blank" rel="noopener noreferrer">xiuxiuejar.com/espai/drets</a>.
      </footer>
    `;
    const llistaHost = document.getElementById('llista');
    if (!llistaHost) return;
    llistaHost.innerHTML = LLISTA_INTRO_HTML;
    // Wrapper per a la columna dreta (títol + grups) — facilita layout 2 columnes a desktop
    const rightCol = document.createElement('div');
    rightCol.className = 'llista-rightcol';
    // Mou el títol (que està al final de LLISTA_INTRO_HTML) dins del wrapper
    const secTitle = llistaHost.querySelector('.llista-sec-title');
    if (secTitle) rightCol.appendChild(secTitle);
    llistaHost.appendChild(rightCol);
    let totalVisible = 0;
    const anyFilterActive = activeTipus !== null || activeTerritori !== null || activeTematica !== null;
    Object.entries(TIPUS_META).forEach(([key, meta]) => {
      const llista = ENTITATS_V.filter(e => e.tipus === key && entitatMatchesFilters(e));
      if (!llista.length) return;
      totalVisible += llista.length;
      const grup = document.createElement('details');
      grup.className = 'entitat-grup';
      grup.style.setProperty('--grupcolor', meta.color);
      // Si l'usuari ve d'Ajuda'm amb filtres, obrim els grups amb canals directament
      // (si no hi ha entitats coincidents el grup ja no s'ha renderitzat: `if (!llista.length) return`).
      grup.open = anyFilterActive;
      grup.innerHTML = `
        <summary>
          <span class="entitat-grup-head">
            <span class="dot"></span>
            <span>${meta.nom}</span>
          </span>
          <span class="entitat-grup-count">${llista.length} ${llista.length === 1 ? 'entitat' : 'entitats'}</span>
        </summary>
        <div class="entitat-grup-desc">${meta.descripcio}</div>
      `;
      llista.forEach(ent => {
        const it = document.createElement('div');
        it.className = 'entitat-item';
        it.style.setProperty('--tipcolor', meta.color);
        const sRaw = ent.sigles || inicial(ent.nom);
        // A la llista, aplanem el salt de línia (l'icona de la llista és més petita)
        const s = sRaw.replace('\n', '');
        it.innerHTML = `
          <div class="entitat-ico ico-len-${Math.min(s.length, 5)}">${s}</div>
          <div class="entitat-info">
            <div class="entitat-nom">${ent.nom}</div>
            <div class="entitat-ambit">${ent.ambit}</div>
            <div class="entitat-desc">${ent.descripcio_breu}</div>
          </div>
        `;
        it.addEventListener('click', () => openFitxa(ent.id));
        grup.appendChild(it);
      });
      // Botó per plegar el grup des del peu (estalvia scroll fins al títol)
      const plegar = document.createElement('button');
      plegar.className = 'llista-grup-plegar';
      plegar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg> Plegar`;
      plegar.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        grup.open = false;
        grup.querySelector('summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      grup.appendChild(plegar);
      rightCol.appendChild(grup);
    });
    if (totalVisible === 0) {
      rightCol.insertAdjacentHTML('beforeend', `<div class="llista-empty"><strong>Cap entitat coincideix</strong> amb els filtres aplicats.<br>Prova amb <em>Ajuda'm</em> per triar altres criteris.</div>`);
    }
    llistaHost.insertAdjacentHTML('beforeend', LLISTA_FOOTER_HTML);
    // Actualitza el xip comptador amb el total filtrat i fes-lo clicable si hi ha filtres
    const countEl = document.getElementById('llista-count');
    if (countEl) {
      const anyFilter = activeTipus !== null || activeTerritori !== null || activeTematica !== null;
      // Només substitueix el nombre (primer text node); mantén l'SVG
      countEl.firstChild.nodeValue = totalVisible + ' ';
      countEl.classList.toggle('clearable', anyFilter);
      countEl.title = anyFilter ? 'Clica per netejar els filtres' : '';
      if (anyFilter && !countEl._wiredClear) {
        countEl.addEventListener('click', () => {
          if (activeTipus === null && activeTerritori === null && activeTematica === null) return;
          activeTipus = null;
          activeTerritori = null;
          activeTematica = null;
          // Sincronitza l'UI del modal Ajuda'm si està a punt d'obrir-se
          ajudamModal.querySelectorAll('.ajudam-opt.selected').forEach(b => b.classList.remove('selected'));
          ajudamModal.querySelectorAll('.ajudam-check.visible').forEach(c => c.classList.remove('visible', 'pulse'));
          applyFilters();
        });
        countEl._wiredClear = true;
      }
    }
  }
  window.renderLlista = renderLlista;
  renderLlista();

  // ─── NAV BUTTONS ──────────────────────────────────
  $('btn-ajudam').addEventListener('click', openAjudam);
  $('btn-vista').addEventListener('click', () => {
    const curr = getVista();
    setVista(curr === 'grid' ? 'llista' : 'grid');
  });
  $('btn-sobre').addEventListener('click', () => $('overlay-sobre').classList.add('open'));
  $('btn-config').addEventListener('click', () => $('overlay-config').classList.add('open'));

  // Tutorial re-show
  $('btn-reveure-tutorial').addEventListener('click', () => {
    $('overlay-config').classList.remove('open');
    setTimeout(() => obOverlay.classList.add('open'), 200);
  });

  // Install
  let deferredPrompt = null;
  const installBtn = $('btn-install');
  const installHint = $('install-hint');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = '';
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
  if (window.matchMedia('(display-mode: standalone)').matches) {
    installHint.textContent = "Ja estàs fent servir l'app instal·lada.";
  } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    installHint.innerHTML = 'A iPhone/iPad: toca <strong>compartir</strong> i selecciona <em>"Afegir a la pantalla d\'inici"</em>.';
  }

  // Clear cache
  $('btn-clear-cache').addEventListener('click', async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    location.reload();
  });

  // ─── DEEP LINK ────────────────────────────────────
  window.addEventListener('load', () => {
    const h = location.hash.replace('#', '');
    if (h && ENTITATS.find(e => e.id === h)) {
      setTimeout(() => openFitxa(h), 2800);
    }
  });

  // ─── SW ───────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
  