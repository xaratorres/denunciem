/**
 * app.config.js — Denunciem.cat
 * Llegit pels mòduls compartits a /shared/ i per /c/Projectes/_shared/scripts/sync.sh.
 *
 * NOTA: Denunciem progressivament migra mòduls al shared. Actualment usa:
 * sw-register, search, category-group, start-home, brand-home, changelog,
 * onboarding (versionat amb mode 'changelog'). Les modal de Sobre/Legal
 * encara són locals.
 */
window.APP_CONFIG = {
  meta: {
    name: 'Denunciem.cat',
    shortName: 'Denunciem',
    description: 'Fes valer els teus drets — canals de queixa, denúncia i pressió als Països Catalans.',
    version: '1.1',
    territory: 'Catalunya',
    year: 2026,
    dataFile: 'entitats.js',
    storagePrefix: 'denunciem',
    sharedVersion: '0.20.0',
    startUrl: './',
    themeColor: '#ffffff'
  },

  brand: {
    primary: '#DC2626',
    primaryDark: '#991B1B'
  },

  onboarding: {
    version: '1.1',
    typewriter: false,
    // body buit: respectem el HTML inline a #onboarding-text del index.html
    // (té enllaços a xiuxiuejar.com que no encaixen amb el patró segments).
    body: [],
    buttonLabel: 'Entès'
  },

  // Llegit per shared/js/changelog.js. Ordenat de més nou a més antic.
  // Bumpa onboarding.version quan afegeixis una entry → SharedOnboarding
  // mostrarà el modal en mode 'changelog' a usuaris recurrents.
  changelog: [
    {
      version: '1.1',
      date: '2026-04-27',
      items: [
        'Títol "Denunciem" clicable a la barra superior per tornar a inici',
        'Cada càrrega nova arrenca a la vista llista (encara que la sessió anterior fos en graella)'
      ]
    }
  ]
};
