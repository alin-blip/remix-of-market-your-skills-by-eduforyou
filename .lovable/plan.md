

## Plan: Actualizare Features Pro + Animație Gold Border

### Ce se schimbă la feature-urile Pro

**Scos din Pro:**
- ~~Founder Accelerator (10+ module)~~
- ~~UK Income Optimizer (SFE + calcul freelancing)~~
- ~~Learning Hub complet + certificat~~ (înlocuit cu doar "Certificat")

**Adăugat/Reformulat în Pro:**
- Life Operating System (Taskuri, Sprinturi, Vision Board)
- Client CRM pentru freelanceri
- Social Media Optimization
- Creare Gig + Job Full Time
- Tracking Venituri (Income Tracker + Analytics)
- Certificat (fără "Learning Hub")
- Curs: Cum să folosești platforma pas cu pas

### Animație lumină pe border gold (Pro card)

CSS keyframe animation care face o lumină (gradient highlight) să se miște continuu de-a lungul border-ului cardului Pro. Implementat cu `@keyframes` și un pseudo-element `::before` cu gradient care rotește/se deplasează pe contur.

### Fișiere modificate

**1. `src/pages/Pricing.tsx`** — features array Pro:
```
- Life Operating System (Taskuri & Sprinturi)
- Client CRM pentru freelanceri
- Social Media Optimization
- Creare Gig + Job Full Time
- Tracking Venituri + Analytics
- Dream 100 Tracker
- CV Generator
- Outreach Sequences
- Certificat
- Curs: Cum să folosești platforma
- Suport prioritar 48h
```
Scos: Founder Accelerator, Income Optimizer, Learning Hub.
Adăugat animația de border glow pe cardul Pro via CSS class.

**2. `src/lib/skillmarket-i18n.tsx`** — aceleași modificări la features Pro, în toate 3 limbile (EN, RO, UA).

**3. `src/components/landing/PricingPreview.tsx`** — actualizat features Pro (3 highlights).

**4. `src/components/upgrade/UpgradeModal.tsx`** — actualizat lista Pro features.

**5. `src/pages/skillmarket.css`** (sau `src/index.css`) — adăugat keyframe animation `@keyframes borderGlow` care face o lumină aurie să se deplaseze pe conturul cardului Pro.

**6. `src/lib/i18n/translations/en.ts` + `ro.ts`** — actualizat pricing preview features pentru Pro.

### Animație border gold — detalii tehnice

Cardul Pro va avea un container cu `position: relative; overflow: hidden` și un pseudo-element `::before` cu:
- Gradient conic auriu (#D4A843) care rotește cu `@keyframes rotate { to { transform: rotate(360deg) } }`
- Border-ul real al cardului creat prin mask/clip pe pseudo-element
- Rotație continu<lov-plan>

## Plan: Actualizare Features Pro + Animație Gold Border

### Ce se schimbă la feature-urile Pro

**Scos din Pro:**
- ~~Founder Accelerator (10+ module)~~
- ~~UK Income Optimizer (SFE + calcul freelancing)~~
- ~~Learning Hub complet + certificat~~ (înlocuit cu doar "Certificat")

**Adăugat/Reformulat în Pro:**
- Life Operating System (Taskuri, Sprinturi, Vision Board)
- Client CRM pentru freelanceri
- Social Media Optimization
- Creare Gig + Job Full Time
- Tracking Venituri (Income Tracker + Analytics)
- Certificat (fără "Learning Hub")
- Curs: Cum să folosești platforma pas cu pas

### Animație lumină pe border gold (Pro card)

CSS keyframe animation — un gradient auriu care se rotește continuu pe conturul cardului Pro, creând efectul de "lumină care merge pe border". Implementat cu pseudo-element `::before` și `@keyframes rotate`.

### Fișiere modificate

**1. `src/pages/Pricing.tsx`**
- Features Pro actualizate conform listei de mai sus
- Clasa CSS specială pe cardul Pro pentru animația border

**2. `src/lib/skillmarket-i18n.tsx`**
- Features Pro actualizate în toate 3 limbile (EN, RO, UA)
- Scos: Founder Accelerator, Income Optimizer, Learning Hub complet
- Adăugat: Life OS, Client CRM, Social Media, Gig+Job, Certificat, Curs platformă

**3. `src/components/landing/PricingPreview.tsx`**
- Actualizat cele 3 highlight features Pro

**4. `src/components/upgrade/UpgradeModal.tsx`**
- Actualizat lista features Pro din modal

**5. `src/index.css` sau `src/pages/skillmarket.css`**
- Adăugat `@keyframes` pentru animația de lumină pe border gold
- Clasa `.pro-border-glow` cu pseudo-element rotativ conic-gradient auriu

**6. `src/lib/i18n/translations/en.ts` + `ro.ts`**
- Actualizat pricing preview features Pro

