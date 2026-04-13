

# Optimizare Sub-headline Hero — Mai Scurt, Mai Clar

## Problema
Sub-headline-ul are 5 linii care apar secvențial cu pauze de 2.5s fiecare. Pe mobil (390px), utilizatorul așteaptă ~12 secunde să vadă tot textul. E prea lung, prea lent — pierde atenția.

## Soluția: O singură propoziție puternică + 3 bullet-uri rapide

Înlocuim typewriter-ul cu un format compact:

**RO:**
> AI-ul îți extrage skill-urile, creează oferta, găsește clienți și scrie mesajele — în 30 de minute.

**EN:**
> AI extracts your skills, builds your offer, finds clients & writes outreach — in 30 minutes.

### Opțiunea vizuală
În loc de typewriter lent, folosim **3 icon-bullets** care apar rapid (fade-in staggered la 0.3s interval) sub propoziția principală:

```
✓ Ofertă de servicii personalizată
✓ 100 companii ideale pentru tine  
✓ Mesaje de outreach gata de trimis
```

Bullet-urile au un fade-in rapid (300ms delay între ele), nu 2.5s. Total reveal: ~1.5s vs ~12s actual.

## Modificări tehnice

### `src/lib/skillmarket-i18n.tsx`
- Înlocuire `sub`, `subBold1-3`, `subEnd` cu:
  - `sub`: propoziție unică (cea de sus)
  - `bullets`: array de 3 stringuri scurte

### `src/pages/SkillMarketLanding.tsx`
- Simplificare `HeroSubheadline`: un `<p>` + 3 `<span>` bullets cu staggered fade-in la 300ms
- Eliminare logica de typewriter cu 2.5s delay

### Fix runtime error
- Investigare și fix pentru `ReferenceError: e is not defined`

