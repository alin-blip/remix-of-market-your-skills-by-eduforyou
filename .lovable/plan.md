

# Status Faza 2 — Ce e gata și ce mai rămâne

## ✅ Ce am terminat (Fazele 2A-2D)

- **2A Cleanup**: Learning Hub, Courses, Gamification, Quiz, Notes — toate șterse (pagini, componente, hooks, edge functions)
- **2B DB Migration**: câmpuri company_* pe `profiles`, commission fields pe `clients`, partner attribution pe `freelance_income`
- **2C Wizard Rebrand**: 6 edge functions cu prompturi B2B multi-tenant, OnboardingStepCompany adăugat
- **2D CRM**: ClientCRM → Partner CRM (comision hibrid % + fix + bonus), IncomeTracker → Commission Tracker (per-partner breakdown)

## ⚠️ Ce a rămas necurățat (gap-uri reale)

Am verificat codebase-ul și am găsit lucruri care **NU** au fost finalizate complet:

### 1. **Pagini wizard cu nume B2C încă în cod**
Edge functions au fost actualizate, dar fișierele UI au păstrat numele vechi:
- `SkillScanner.tsx` (UI încă zice "skills" în loc de "company assets")
- `IkigaiBuilder.tsx` (UI încă zice "Ikigai" în loc de "ICP/IPP")
- `OfferBuilder.tsx` (UI nu arată cele 3 tier-uri hibrid clar: Affiliate/Referral/JV)
- `ProfileBuilder.tsx`, `GigJobBuilder.tsx`, `CVBuilder.tsx`, `FreedomPlanExport.tsx`
- `DnaQuizPublic.tsx` (încă cu Employee/Freelancer/Startup în loc de Affiliate/Referral/JV/White Label)

### 2. **i18n încă plin de copy B2C**
- `src/lib/i18n/translations/ro.ts` și `en.ts` — labels wizard încă zic "Skills", "Ikigai", "Gig", "Freedom Plan"
- `DefineYourPath.tsx` folosește `t.defineYourPath.steps.skillScanner` etc. — labels neactualizate

### 3. **Onboarding flow incomplet**
- Am adăugat `OnboardingStepCompany.tsx` ca step nou, dar **vechile** steps 6-8 (Skills, Ikigai personal, Offer personal) au rămas în flow
- Trebuie să decizi: înlocuim steps 6-8 sau le păstrăm pe lângă step company?

### 4. **Sidebar items vechi**
- "Define Your Path" încă apare cu icoane/labels vechi
- Itemele wizard în sidebar arată `SkillScanner`, `IkigaiBuilder` etc. în loc de noile nume

### 5. **DnaQuiz tipologii**
- `quizData.ts` are întrebări pentru Employee/Freelancer/Startup
- Edge functions `dna-quiz-email` și `dna-quiz-followup` au prompturi B2C
- Trebuie rebuild complet pentru tipologii B2B: **Affiliate Operator / Referral Networker / JV Builder / White Label Reseller**

### 6. **CV / Pitch Deck Generator**
- `cv-generator/index.ts` încă generează CV personal
- Trebuie refactorizat pentru **Partnership Pitch Deck** (one-pager + term sheet B2B)

### 7. **Freedom Plan PDF**
- `FreedomPlanPDF.tsx` și `FreedomPlanDocx.tsx` au structură B2C personal
- Trebuie rebrand → **Partnership Strategy 90-Day Plan** (PDF B2B)

## 🎯 Recomandare: Faza 3 — Finalizare wizard B2B

Împărțit în 3 sub-faze digerabile:

### **3A. Wizard UI Rebrand (8 fișiere)**
Rename + refactor copy + redesign secțiuni:
- SkillScanner → Company Asset Scanner UI
- IkigaiBuilder → ICP/IPP Builder UI cu 2 coloane (clienți vs parteneri)
- OfferBuilder → 3 carduri tier (Affiliate / Referral / JV) cu inputs hibrid
- ProfileBuilder, CVBuilder, FreedomPlanExport, DefineYourPath — UI refresh

### **3B. i18n Complete Rebrand**
- Update `ro.ts` + `en.ts` cu toate labels B2B
- Sidebar labels actualizate
- Onboarding steps 6-8 înlocuite cu Company / ICP / Offer hibrid

### **3C. DNA Quiz B2B + Pitch Deck**
- Rebuild `quizData.ts` cu întrebări pentru Affiliate/Referral/JV/White Label
- Update `dna-quiz-email` + `dna-quiz-followup` prompturi
- Refactor `cv-generator` → `pitch-deck-generator` (output: 1-page partnership pitch deck)
- Rebrand `FreedomPlanPDF` → Partnership Strategy 90-Day Plan PDF

## Estimare
- **3A**: ~8 fișiere refactor mediu
- **3B**: ~3 fișiere mari (i18n) + sidebar
- **3C**: ~5 fișiere (quiz + 2 edge functions + 2 PDF)

**Total Faza 3**: ~16 fișiere modificate, ~2-3 turn-uri de execuție

