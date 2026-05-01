/* sw-register.js — registra el Service Worker amb auto-reload en updates.
 *
 * Comportament:
 *  - Registra `./sw.js` al boot (silencia errors).
 *  - Quan un SW nou pren el control (skipWaiting + clients.claim) la
 *    pàgina es recarrega automàticament. Sense això, una vegada el SW
 *    nou s'activava la pàgina ja renderitzada continuava executant el
 *    JS antic fins a la propera càrrega manual — cosa que en una PWA
 *    instal·lada al home screen pràcticament no passa mai. Guardat
 *    perquè la primera instal·lació (controller passa de null → v1)
 *    no dispari un reload innecessari.
 *
 * Inclou-lo a l'<head> amb defer:
 *   <script src="./shared/js/sw-register.js" defer></script>
 *
 * Personalització via APP_CONFIG.sw (totes opcionals):
 *   path: './sw.js'   // ruta del SW (default)
 */
(function () {
  if (!('serviceWorker' in navigator)) return;
  const cfg = (window.APP_CONFIG && window.APP_CONFIG.sw) || {};
  const SW_PATH = cfg.path || './sw.js';

  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  navigator.serviceWorker.register(SW_PATH).catch(function () {});
})();
