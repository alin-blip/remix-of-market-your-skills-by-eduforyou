

# Optimizare Landing `/ro` pentru Mobil

## Probleme identificate

1. **Navbar "Get Access"** — trimite la `/waitlist` (liniile 150, 175) — trebuie schimbat în `#pricing`
2. **Pe mobil nu se vede nimic vizual în Hero** — secțiunea cu video/mockup are `hidden lg:flex`, deci pe mobil (63% din trafic) Hero-ul e doar text
3. **Eroarea Voomly** — apare doar pe desktop, nu afectează mobilul

## Modificări propuse

### Fișier: `src/pages/SkillMarketLanding.tsx`

**1. Fix navbar CTA-uri (2 locuri)**
- Linia 150: `/waitlist` → `#pricing`
- Linia 175: `/waitlist` → `#pricing`

**2. Sticky CTA pe mobil**
- Adăugare bară fixă la baza ecranului (doar `lg:hidden`) cu buton "Vezi Planurile" / "View Plans" → `#pricing`
- Se ascunde când secțiunea pricing e vizibilă (IntersectionObserver)
- Design consistent cu stilul gold existent

**3. Wrap Voomly script în try-catch**
- Previne eroarea `ReferenceError: e is not defined` pe desktop

## Impact
- Eliminare redirect greșit la `/waitlist`
- Sticky CTA pe mobil reduce scroll-ul necesar pentru a ajunge la pricing
- Fix eroare runtime pe desktop

