// Denunciem.cat â€” Service Worker
// VersiÃ³: bumpa-la a cada release amb canvis trencadors a CORE/ASSETS.
// LÃ²gica completa a /shared/js/sw-template.js (importScripts).
importScripts('./shared/js/sw-template.js');

buildSW({
  cacheName: 'denunciem-v19',

  // Fitxers que canvien sovint â†’ network-first amb timeout 2.5s + cache:'reload'
  core: [
    './',
    './index.html',
    './app.config.js',
    './entitats.js'
  ],

  // Fitxers estables â†’ cache-first
  assets: [
    './favicon.svg',
    './imatges/icon-192.png',
    './imatges/icon-512.png',
    './imatges/icon-maskable-512.png',
    './imatges/fonts/inter-300.woff2',
    './imatges/fonts/inter-800.woff2'
  ]
});
