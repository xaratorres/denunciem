/* scroll-autohide.js — toggles the .is-scrolling class on <html>
 * while the user is actively scrolling, removes it 900 ms after the
 * last scroll event. Combined with the scrollbar rules in base.css
 * this gives an iOS-style overlay scrollbar that appears only during
 * scroll and fades out when idle.
 *
 * Self-contained, no dependencies, passive listener, idempotent —
 * include with `<script src="./shared/js/scroll-autohide.js" defer>`
 * anywhere in the head/body and that's it.
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const root = document.documentElement;
  let timer = null;

  function onScroll() {
    root.classList.add('is-scrolling');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      root.classList.remove('is-scrolling');
    }, 900);
  }

  function bind() {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
