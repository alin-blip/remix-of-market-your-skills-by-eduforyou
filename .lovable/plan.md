

## Plan: Pagina `/` cu landing + dropdown limba deschis + Thank You page cu Skool CTA

### 1. Pagina Index (`/`) — Landing cu dropdown limba deschis

In loc de pagina separata de selectare limba, ruta `/` va randa direct `SkillMarketLanding` (aceeasi componenta ca `/ro`) dar cu un prop `autoOpenLangPicker={true}`. La mount, dropdown-ul de limba se va deschide automat cu un text subtil "Choose your language" deasupra.

**Modificari:**
- **`src/App.tsx`**: Inlocuiesc `<Index />` cu `<SkillMarketLanding autoOpenLangPicker />` pe ruta `/`
- **`src/pages/SkillMarketLanding.tsx`**: Accept prop `autoOpenLangPicker`. Cand e true, afisez un overlay/banner subtil in header care arata dropdown-ul de limba deschis automat (folosind `open` state pe DropdownMenu). Se inchide dupa selectie sau dupa click in afara.
- **`src/pages/Index.tsx`**: Se poate sterge (nu mai e folosit)

### 2. Thank You Page dupa Waitlist — redirect spre Skool

Dupa submit-ul formularului de waitlist, in loc de mesajul simplu "Multumim", afisez o pagina de Thank You optimizata cu CTA puternic spre comunitatea Skool.

**Modificari in `src/pages/WaitlistForm.tsx`** (sectiunea `if (submitted)`):

Continut nou:
- Iconita success + "Esti in! 🎉"
- Mesaj scurt: aplicatia a fost trimisa
- Card separat cu CTA spre Skool:
  - Titlu: "Pasul urmator: Intra in comunitate"
  - Copy optimizat: "Am creat aceasta comunitate special pentru tine. Aici primesti suport direct, resurse exclusive si faci parte din echipa de beta testeri care modeleaza viitorul platformei. Feedback-ul tau conteaza enorm — esti parte din fundatie."
  - Buton mare: "Intră în comunitate →" care deschide `https://www.skool.com/marketyourskill` in tab nou
- Link secundar: "← Inapoi la pagina principala"

### Fisiere modificate

| Fisier | Ce se schimba |
|--------|--------------|
| `src/App.tsx` | Ruta `/` foloseste `SkillMarketLanding` cu prop `autoOpenLangPicker` |
| `src/pages/SkillMarketLanding.tsx` | Accept prop, auto-open lang dropdown cu hint text |
| `src/pages/WaitlistForm.tsx` | Thank you page cu CTA Skool community |
| `src/pages/Index.tsx` | Se sterge (optional, sau se pastreaza neutilizat) |

