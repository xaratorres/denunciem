# Brief per a Claude Xat — Guia ràpida d'ús de Denunciem

> Hola! Necessito que m'ajudis a crear un **document d'inici ràpid (PDF)** per a usuaris finals de **Denunciem.cat**, una PWA. T'adjunto captures de pantalla i una explicació del projecte. Vull un PDF ben presentat, en català, amb un disseny net i clar, exportable a PDF des del navegador.
>
> **Format**: artifact HTML/CSS amb estils d'impressió (`@page A4`).
> **Extensió**: 4–6 pàgines.
> **To**: divulgatiu, clar, no jurídic. Pensat per a qualsevol persona que es plantegi denunciar però no sap per on començar.

---

## 1. Què és Denunciem.cat

**Denunciem.cat** és un directori obert de **canals de denúncia, queixa i pressió a Catalunya**: institucions, ONGs, organismes de control i mitjans on dirigir-te quan t'han vulnerat els teus drets, has patit un mal servei, o vols posar pressió pública sobre una situació injusta.

- **73 entitats** classificades per tipus de via.
- **Web pública**: [denunciem.cat](https://denunciem.cat) — gratuïta i sense registre.
- **És una PWA**: instal·lable al mòbil com una app, sense passar per cap botiga.
- **Estat**: dades completes, en revisió.

Missatge central: **"Els teus drets, a un clic"**. La idea és que en lloc de passar hores buscant a qui dirigir-te, obris l'app, expliques què t'ha passat, i et trobi els canals més adequats.

---

## 2. Funcionalitats principals

### A. Llista per categories
Pantalla principal amb les entitats agrupades per **tipus de via**:
- **Administratiu** — Síndic de Greuges, Defensor del Poble, Oficina del Govern Obert…
- **Legal / penal** — fiscalia, denúncia formal, jutjats…
- **Pressió pública** — mitjans, ONG, plataformes ciutadanes…
- **Associatiu** — entitats que ofereixen acompanyament en àmbits específics

Cada fitxa té contacte directe (telèfon, email, web), àmbit, temps aproximat de resposta, i el botó **"Obrir canal directe"** que porta al lloc oficial.

### B. Cerca
Caixa de cerca per nom d'entitat, àmbit o paraula clau.

### C. Vista galeria
Alternativa visual a la llista — útil quan vols veure els logos i identificar ràpidament l'entitat.

### D. Ajuda'm a trobar el canal
Modal amb 3 preguntes guiades:
1. **On ha passat** (territori)
2. **De què es tracta** (temàtica: drets civils, salut, treball, habitatge, consum…)
3. **Per quina via vols fer-ho** (administrativa, legal, pressió pública…)

A mesura que respons, el comptador de "canals trobats" s'actualitza en temps real. Cap pregunta és obligatòria.

### E. Instal·lable com a app
Igual que Transitem: el navegador ofereix "Afegir a la pantalla d'inici" → icona pròpia, finestra independent, funciona offline.

---

## 3. Captures de pantalla adjuntes

7 captures en format mòbil (iPhone 13) a `screenshots/`:

| Fitxer | Què mostra |
|---|---|
| `01-splash.png` | Splash inicial: "Denunci**em**" amb el "em" en vermell + subtítol "Fes valer els teus drets" |
| `02-onboarding.png` | Modal de benvinguda explicant què és l'eina |
| `03-llista.png` | Vista llista: missatge "Els teus drets, a un clic" + cercador + categoria Administratiu desplegada |
| `04-llista-scroll.png` | Llista amb scroll, més categories visibles |
| `05-ajudam.png` | Modal Ajuda'm amb les 3 preguntes guiades |
| `06-fitxa.png` | Fitxa d'una entitat (Síndic de Greuges de Catalunya) amb temps aproximat, contacte i botó "Obrir canal directe" |
| `07-sobre.png` | Modal Sobre Denunciem amb la dedicatòria i l'enllaç a xiuxiuejar.com |

---

## 4. Identitat visual

- **Logo**: "Denunci**em**" — el "em" en color vermell viu (`#ef4444` aprox.)
- **Colors principals**: vermell intens per a accents, blau marí (`#1e3a8a` aprox.) per a alguns indicadors, fons paper net.
- **Tipografia**: serif elegant per al logo, sans-serif per al text.

---

## 5. Què vull al PDF

1. **Portada** amb el logo i el subtítol "Guia ràpida d'ús"
2. **Què és Denunciem** (paràgraf curt + bullets)
3. **Com instal·lar al mòbil** (iOS + Android, breu)
4. **Pantalla principal** (captura `03-llista.png` + explicació categories i cerca)
5. **Ajuda'm — el camí més fàcil** (captura `05-ajudam.png` + explicació de les 3 preguntes)
6. **Una fitxa** (captura `06-fitxa.png` + què hi trobaràs)
7. **Peu**: web `denunciem.cat`, contacte (xiuxiuejar.com/espai/drets), versió i any

Si fa falta alguna captura addicional (galeria, fitxa amb més detall…), digues-m'ho.
