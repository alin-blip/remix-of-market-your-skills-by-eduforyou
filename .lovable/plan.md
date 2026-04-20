

# Transformare B2B: Edu4You → Dream 100 Partnership Engine

## Viziunea (Hormozi-style)

**Status acum:** Platformă B2C pentru studenți ce-și caută primul contract.
**Status nou:** Motor B2B de parteneriate strategice — Edu4You folosește Dream 100 pentru a închide 100 de parteneriate (agenții HR, contabilitate, clinici, avocatură) care recomandă studenți internaționali la universități UK pe bază de comision.

**Oferta Edu4You către parteneri (exemplu pe care platforma o va construi automat):**
> "Îți dau £X comision pentru fiecare student internațional pe care mi-l trimiți și se înscrie. Tu ai deja baza de clienți (părinți cu copii adolescenți, profesioniști cu familii). Eu îi duc la universitate în UK. Win-win, zero efort din partea ta."

## Ce păstrăm, ce scoatem, ce transformăm

### KEEP (deja perfect pentru B2B)
- **Dream 100 Scanner** → găsește 100 companii partenere
- **Dream 100 Tracker** → Kanban cu pipeline parteneriate
- **Outreach Generator** (3-message sequence) → secvențe către decision makers
- **Perplexity + Firecrawl** → research real-time pe parteneri
- **CV Builder** → devine "Company Pitch Deck" / "One-Pager Parteneriat"
- **Life OS** → goals B2B (parteneriate închise, comisioane)
- **Gamification, Notes, Quiz, Hub Învățare** → curriculum B2B

### TRANSFORM (rebrand + repurpose)
| Acum (B2C) | Devine (B2B) |
|---|---|
| Skill Scanner | **Company Asset Scanner** (ce ai de oferit ca business: produse, audiență, expertiză) |
| Offer Builder (3-tier servicii) | **Partnership Offer Builder** (3-tier comision/revenue share/joint venture) |
| Ikigai | **Business ICP Builder** (Ideal Client Profile + Ideal Partner Profile) |
| Profile Builder | **Company Profile Builder** (one-pager pentru pitch parteneriat) |
| Gig Job Builder | **Partnership Pitch Builder** (propunere formală cu comision, termeni) |
| Freedom Plan Export | **Partnership Strategy Export** (PDF cu plan 90 zile) |
| DNA Quiz (Angajat/Freelancer/Startup) | **Partnership DNA Quiz** (Affiliate / Referral / Joint Venture / White Label) |
| Course Sales Pages | **Partnership Case Studies** (cazuri reale de parteneriate închise) |

### REMOVE (irelevante pentru B2B)
- **SwipeHire integration completă** (`useSwipeHireIntegration`, `SwipeHireSettings`, edge function `swipehire-sync`, secrets `SWIPEHIRE_*`, câmp `swipehire_user_id` din profiles)
- **EduForYou student registration flow** (`/auth/register-eduforyou`) — Edu4You devine *operatorul* platformei, nu studentul. Studenții nu mai sunt useri.
- **Fiverr sales pages** (`FiverrCourseSalesPage`, `FiverrEbookSalesPage`)
- **Squeeze pages B2C** pentru studenți individuali
- **Onboarding steps 6-8** (Skills/Ikigai/Offer în varianta personală) — refăcute pentru companie

## Arhitectura nouă (B2B)

```text
┌─────────────────────────────────────────────────────────────┐
│  EDU4YOU (admin / power user)                               │
│  ├─ Onboarding companie (industry, ICP, what we offer)      │
│  ├─ Partnership Offer Builder (comision % / fixed / hybrid) │
│  ├─ Dream 100 Scanner → 100 parteneri ideali                │
│  │    ├─ Categorii: HR, Contabilitate, Clinici, Avocatură   │
│  │    └─ Filtru: au baza de clienți cu copii adolescenți    │
│  ├─ Dream 100 Tracker (pipeline Kanban)                     │
│  │    └─ Stages: Identified → Contacted → Meeting → Signed  │
│  ├─ Outreach Generator (3 mesaje + follow-up)               │
│  ├─ Partnership Pitch Deck (PDF auto-generat)               │
│  ├─ CRM Parteneri (deja avem ClientCRM.tsx)                 │
│  └─ Revenue Tracker (deja avem IncomeTracker.tsx)           │
│       └─ Devine: Commission Tracker per partener            │
└─────────────────────────────────────────────────────────────┘
```

## Plan de execuție în 4 faze

### **FAZA 1 — Curățenie + Rebrand strategic** (acest sprint)
1. Șterg `useSwipeHireIntegration`, `SwipeHireSettings`, edge function `swipehire-sync`
2. Șterg pagini Fiverr + squeeze B2C
3. Schimb headline + subheadline landing → B2B ("Construiește 100 parteneriate strategice în 90 zile")
4. Schimb tagline & i18n keys principale (RO/EN/UA) → tonul Edu4You B2B
5. Update `mem://` cu noua poziționare

### **FAZA 2 — Transformare Wizard în B2B Partnership Wizard**
1. **Onboarding companie** (înlocuiește Step 6-8): industry, target market, ce oferă, ICP/IPP
2. **Partnership Offer Builder**: 3 tipuri de propuneri (Affiliate %, Referral fee fix, Joint Venture/Revenue share)
3. **Company Asset Scanner**: în loc de skills personale → assets companie (audiență, produse, expertiză, case studies)
4. **Partnership Pitch Deck**: PDF profesional în loc de CV personal

### **FAZA 3 — Dream 100 specializat pe parteneri B2B**
1. Update `dream100-scanner` edge function: prompt Perplexity tunat pe **partner search** (nu candidate search). Categorii predefinite: HR agencies, Accounting firms, Medical clinics, Law firms, Consulting, etc.
2. Update Tracker stages: `Identified → Researched → Contacted → Meeting Booked → Proposal Sent → Negotiation → Signed → Active Partner`
3. Outreach Generator: 3 mesaje B2B (Conexiune LinkedIn → Valoare/Case study → Propunere meeting cu cifre concrete)

### **FAZA 4 — CRM + Commission Tracking**
1. `ClientCRM.tsx` → `PartnerCRM.tsx`: tracking parteneriate active, contracte, comision agreed
2. `IncomeTracker.tsx` → `CommissionTracker.tsx`: revenue per partener, students referred, commission earned, payouts

## Întrebări strategice (înainte să încep)

Înainte să mă apuc, am nevoie de 3 decizii de la tine ca să nu construiesc greșit:

