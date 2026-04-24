/**
 * app.config.js — Denunciem.cat
 * Llegit pels mòduls compartits a /shared/ i per /c/Projectes/_shared/scripts/sync.sh.
 *
 * NOTA: Denunciem de moment només fa servir uns quants mòduls compartits
 * (sw-register, search, category-group). Els altres (about-modal, onboarding,
 * legal-kit, install-banner...) estan implementats localment a index.html.
 * Per això aquest fitxer només declara els camps mínims; brand/onboarding/about
 * i similars s'afegiran quan toqui migrar cada modal al shared.
 */
window.APP_CONFIG = {
  meta: {
    name: 'Denunciem.cat',
    shortName: 'Denunciem',
    description: 'Fes valer els teus drets — canals de queixa, denúncia i pressió als Països Catalans.',
    version: '1.0',
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
  }
};
