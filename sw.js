// Denunciem.cat — Service Worker
// Versió: bumpa-la a cada release amb canvis trencadors a CORE/ASSETS.
// Lògica completa a /shared/js/sw-template.js (importScripts).
importScripts('./shared/js/sw-template.js');

buildSW({
  cacheName: 'denunciem-v16',

  // Fitxers que canvien sovint → network-first amb timeout 2.5s + cache:'reload'
  core: [
    './',
    './index.html',
    './app.config.js',
    './entitats.js'
  ],

  // Fitxers estables → cache-first
  assets: [
    './favicon.svg',
    './imatges/icon-192.png',
    './imatges/icon-512.png',
    './imatges/icon-maskable-512.png'
  ]
});
