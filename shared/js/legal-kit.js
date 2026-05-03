/* legal-kit.js — gestió d'overlay-legal + overlay-privacy + overlay-cookies.
 *
 * Pattern compartit entre els projectes Nexe:
 *  - 3 overlays amb stack de navegació (open un, després openfrom altre,
 *    enrere torna al primer)
 *  - Click backdrop / ESC tanquen tota la pila
 *  - SENSE formulari de contacte: el contacte va via `mailto:` directe
 *    al peu de pàgina (estàndard No Data Found Nivell 1).
 *
 * Markup esperat (cada projecte té els overlays propis amb el seu text legal):
 *   <div id="overlay-legal"   class="overlay">…</div>
 *   <div id="overlay-privacy" class="overlay">…</div>
 *   <div id="overlay-cookies" class="overlay">…</div>
 *
 * Atributs delegats:
 *   data-legal-open="legal|privacy|cookies"      — obre l'overlay
 *   data-legal-openfrom="legal|privacy|cookies"  — obre afegint a la pila
 *   data-legal-back                              — enrere a la pila
 *   data-legal-close                             — tanca tot
 *
 * API: window.SharedLegalKit.{open, close}
 */
(function () {
  const overlays = {};
  const stack = [];

  function render() {
    Object.keys(overlays).forEach(k => {
      const el = overlays[k]; if (!el) return;
      const top = stack[stack.length - 1];
      el.classList.toggle('open', top === k);
      const back = el.querySelector('[data-legal-back]');
      if (back) back.classList.toggle('visible', stack.length > 1 && top === k);
    });
    document.body.style.overflow = stack.length ? 'hidden' : '';
  }

  function open(key) {
    if (!overlays[key]) return;
    if (stack[stack.length - 1] === key) return;
    stack.push(key); render();
  }
  function back() { stack.pop(); render(); }
  function closeAll() { stack.length = 0; render(); }

  function init() {
    overlays.legal     = document.getElementById('overlay-legal');
    overlays.privacy   = document.getElementById('overlay-privacy');
    overlays.cookies   = document.getElementById('overlay-cookies');
    overlays['ndf-seal'] = document.getElementById('overlay-ndf-seal');

    // Si no existeix cap dels overlays, no muntem res
    if (!overlays.legal && !overlays.privacy && !overlays.cookies && !overlays['ndf-seal']) return;

    // Delegació global per data-*
    document.addEventListener('click', e => {
      const openEl = e.target.closest && e.target.closest('[data-legal-open]');
      if (openEl) { open(openEl.getAttribute('data-legal-open')); return; }
      const fromEl = e.target.closest && e.target.closest('[data-legal-openfrom]');
      if (fromEl) { open(fromEl.getAttribute('data-legal-openfrom')); return; }
      const closeEl = e.target.closest && e.target.closest('[data-legal-close]');
      if (closeEl) { closeAll(); return; }
      const backEl = e.target.closest && e.target.closest('[data-legal-back]');
      if (backEl) { back(); return; }
    });

    // Backdrop click tanca tot
    Object.keys(overlays).forEach(k => {
      const el = overlays[k]; if (!el) return;
      el.addEventListener('click', e => { if (e.target === el) closeAll(); });
    });

    // ESC tanca tot
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && stack.length) closeAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SharedLegalKit = { open, close: closeAll };
})();
