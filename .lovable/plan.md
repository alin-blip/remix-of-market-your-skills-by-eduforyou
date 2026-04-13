

# Optimizare Mobile Above-the-Fold + CTA Tracking

## Ce se vede acum pe mobil (390px)

Above the fold: Headline + primele 2 linii din subheadline + începutul video-ului Voomly. Lipsesc:
- Un element vizual care captează atenția instant (primele 2 secunde)
- Tracking pe butoanele CTA

## Plan de implementare

### 1. Animație subtilă de atenție pe headline (gold shimmer pulse)
**Fișier:** `src/pages/skillmarket.css`

Adăugare animație de tip "gold glow pulse" pe textul gold din headline (`Primul Contract`) — un efect subtil de strălucire care pulsează o dată la 3 secunde, captând privirea imediat.

```css
@keyframes sm-gold-pulse {
  0%, 100% { text-shadow: 0 0 0 transparent; }
  50% { text-shadow: 0 0 20px rgba(212,168,67,0.4), 0 0 40px rgba(212,168,67,0.15); }
}
.sm-gold-pulse { animation: sm-gold-pulse 3s ease-in-out infinite; }
```

### 2. Badge animat above headline — "AI-Powered" indicator
**Fișier:** `src/pages/SkillMarketLanding.tsx`

Adăugare un mic badge deasupra headline-ului (similar cu ce ai pe landing-ul principal) cu un dot care pulsează — element vizual mic dar eficient care semnalează "ceva se întâmplă".

```
[🤖 AI construiește planul tău în 30 de minute ●]
```

### 3. Meta Pixel tracking pe butoanele CTA din Hero
**Fișier:** `src/pages/SkillMarketLanding.tsx`

Adăugare `onClick` handler pe ambele butoane CTA din Hero:
- **"Începe Gratuit 7 Zile"** → `fbq('trackCustom', 'HeroCTA_Primary', { button: 'start_free_trial' })`
- **"Cont EduForYou"** → `fbq('trackCustom', 'HeroCTA_Secondary', { button: 'eduforyou' })`
- **Sticky CTA mobil** → `fbq('trackCustom', 'StickyCTA_Click')`

### 4. Aplicare gold pulse pe headline
**Fișier:** `src/pages/SkillMarketLanding.tsx`

Adăugare clasa `sm-gold-pulse` pe `<span className="text-gold italic">` din headline.

## Fișiere modificate

| Fișier | Schimbare |
|---|---|
| `src/pages/skillmarket.css` | Animație `sm-gold-pulse` |
| `src/pages/SkillMarketLanding.tsx` | Badge animat, gold pulse pe headline, `fbq` tracking pe 3 butoane CTA |

## Impact așteptat
- Gold pulse atrage privirea în primele 2 secunde → reduce bounce
- Badge-ul dă context instant ("AI face treaba, nu tu")
- Tracking-ul CTA oferă date concrete despre rata de click din Hero

