

# Plan: Integrare Strategică a Imaginilor de Referință pe Landing Page

## Analiza Imaginilor și Selecția

Din cele 28 de imagini primite, am selectat cele mai relevante care aduc plus valoare vizuală pe landing page și cresc percepția de valoare:

### Imagini selectate pentru integrare:

| Imagine | Unde o folosim | De ce |
|---------|---------------|-------|
| **Skilluri Invizibile (iceberg)** | How It Works — Pasul 1 (Skill Scanner) | Metafora vizuală perfectă: skillurile ascunse sub suprafață |
| **Hard vs Soft Skills** | How It Works — Pasul 1 sau secțiune nouă "Ce Descoperim" | Explică ce face platforma |
| **Ikigai (4 cercuri)** | How It Works — Pasul 2 (Ikigai Builder) | Vizualizează exact ce construim |
| **Pachete Starter/Standard/Premium** | How It Works — Pasul 3 (Offer Builder) | Arată output-ul concret al pașilor |
| **CV-ul Tău e o Ofertă** | How It Works — Pasul 5 (CV as Sales Page) | Comparație vizuală puternică Vechi vs Nou |
| **Dream 100 Kanban** | How It Works — Pasul 4 (Dream 100 Tracker) | Arată exact sistemul Kanban |
| **Client de Vis** | Dream 100 section — ilustrație | Clarifică targetarea |
| **Prețul Corect (3 pași)** | Offer Builder sau Value Stack | Educă despre pricing |
| **Timp vs Rezultate** | Tagline Banner sau secțiune nouă mindset | Schimbă mentalitatea |
| **Viața Ta e un CV Nescris** | For Whom section sau Hero | Motivational, conectare emoțională |
| **Ce Studiezi = Venit Real** | Stats section sau For Whom | Concretizează valoarea |
| **SMV (Simple Mega Value)** | Value Stack section | Explică conceptul SMV |

---

## Ce lipsește: ADN Test ca Pas 0

Observație importantă: **Testul ADN de Execuție** (Angajat / Freelancer / Startup) **nu apare** ca pas în secțiunea "How It Works". Acesta ar trebui să fie **Pasul 0** — prima acțiune pe care o face utilizatorul.

---

## Planul de Implementare

### 1. Adăugare Pas 0 — ADN Test în How It Works
- Adăugăm un card special evidențiat (gold glow) ca **Pas 00 — "Descoperă-ți ADN-ul de Execuție"**
- Include CTA direct către `/adn-test/:lang`
- Grid-ul devine 7 pași: 00 (full-width sau evidențiat) + 01-06

### 2. Imagini ca Ilustrații Mici pe Pașii How It Works
- Fiecare card din secțiunea How It Works primește o imagine thumbnail (120x80px) din setul trimis
- Imaginile se afișează ca preview mic în colțul cardului sau sub descriere
- Mapping:
  - Pas 00: imagine nouă ADN/tipologie (putem genera sau folosi una existentă)
  - Pas 01 (Skill Scanner): `post-01-skilluri-invizibile.png` (icebergul)
  - Pas 02 (Ikigai): `post-05-ikigai.png` (4 cercuri)
  - Pas 03 (Offer Builder): `post-07-pachete-starter-premium.png` (3 pachete)
  - Pas 04 (Dream 100): `post-12-dream100-angajatori.png` (Kanban)
  - Pas 05 (CV): `post-11-cv-oferta.png` (Vechi vs Nou)
  - Pas 06 (Freedom Plan): rămâne cu icon

### 3. Secțiune Nouă "Mindset Shift" (opțional, între TaglineBanner și Stats)
- 2-3 imagini side-by-side ca carduri vizuale mici
- `post-06-timp-vs-rezultate.png` — "Nu Vinzi Timp. Vinzi Rezultate."
- `post-04-skilluri-viata.png` — "Viața Ta e un CV Nescris"
- `post-03-facultate-bani.png` — "Ce Studiezi = Venit Real"
- Fiecare ca mini-card cu imaginea + text scurt

### 4. Dream 100 Section — înlocuire placeholder
- Înlocuim imaginea placeholder `dream100-network.png` (care probabil nu se încarcă) cu `post-12-dream100-angajatori.png`
- Adăugăm `post-09-client-vis.png` ca ilustrație secundară

### 5. Value Stack — adăugare imagine SMV
- `post-08-smv.png` ca vizual în secțiunea Value Stack

---

## Detalii Tehnice

- Imaginile uploadate vor fi salvate în `public/images/landing/` ca fișiere optimizate
- Folosim `loading="lazy"` pe toate
- Pe mobile, imaginile din carduri se ascund pentru a păstra layout-ul curat (`hidden sm:block`)
- Cardurile How It Works se redimensionează pentru a acomoda thumbnail-urile
- Pasul 00 (ADN Test) primește stilizare specială: border auriu dublu, glow, CTA button
- Toate modificările sunt pe `SkillMarketLanding.tsx` și posibil pe `skillmarket-i18n.tsx` (pentru textele pasului 0)
- Se aplică pe ambele landing pages (SkillMarket + Landing.tsx) unde e relevant

### Fișiere modificate:
1. `src/pages/SkillMarketLanding.tsx` — How It Works (pas 0 + imagini), Dream100 (imagine), Mindset section nouă
2. `src/lib/skillmarket-i18n.tsx` — texte pentru Pasul 0 ADN Test (RO, EN, UA)
3. `src/pages/Landing.tsx` — adăugare referință la ADN Test în secțiunea Steps
4. `public/images/landing/` — imaginile selectate (8-10 fișiere)

