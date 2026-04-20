

# Faza 2: Multi-Tenant B2B Partnership Wizard

## Decizii confirmate
1. **Multi-tenant** — orice business folosește platforma pentru Dream 100 B2B
2. **Generic** pentru orice industrie (HR, edu, SaaS, consultanță, agenții, etc.)
3. **Scoate Learning Hub complet** (+ Courses, Quiz, Gamification, Notes — tot ecosistemul educațional)
4. **Pricing model hibrid**: % comision + fee fix + bonus performance, configurabil per ofertă

## Ce scoatem complet (Learning ecosystem)

### Pagini & rute
- `LearningHub.tsx`, `CourseViewer.tsx`, `PartnerCourses.tsx`
- `CourseSalesPage.tsx`, `EbookSalesPage.tsx`, `BundleSalesPage.tsx`
- `admin/CoursesManager.tsx`, `admin/CourseAnalytics.tsx`, `admin/BundlesManager.tsx`, `admin/PLRCourseImporter.tsx`

### Componente
- Tot folderul `src/components/courses/`
- `BadgesDisplay.tsx`, `useGamification.ts`, `useCourseAccess.ts`
- `LessonNotes`, `LessonQuiz`, `CourseCertificatePDF`, `SecureVideoPlayer`, etc.

### Edge functions
- `course-notifications`, `course-recommendations`, `create-course-price`, `extract-zip`, `elevenlabs-tts`

### Sidebar & Tools Hub
- Scoatem itemul "Learning Hub" din sidebar și `ToolsHub.tsx`

### DB (păstrăm tabelele, doar nu le mai folosim în UI)
Nu ștergem tabelele din DB acum (risk-free) — doar dezactivăm UI. Cleanup DB îl facem la sfârșit dacă confirmi.

## Ce transformăm (Wizard B2B)

### 1. Onboarding (înlocuim steps 6-8 personale cu steps companie)
| Step nou | Conținut |
|---|---|
| **Step 6: Company Profile** | Industry, company size, country, website, what you sell |
| **Step 7: ICP & IPP Builder** | Ideal Client Profile (cui vinzi) + Ideal Partner Profile (cine te-ar putea recomanda) |
| **Step 8: Partnership Offer Builder** | Hybrid commission: % rev share + fixed referral fee + performance bonus |

### 2. Wizard tools rebrand
| Vechi (B2C) | Nou (B2B Multi-tenant) |
|---|---|
| `SkillScanner.tsx` | **CompanyAssetScanner.tsx** — audiență, produse, expertiză, case studies, distribution channels |
| `IkigaiBuilder.tsx` | **ICPBuilder.tsx** — Ideal Client + Ideal Partner profile cu segmentare industrie |
| `OfferBuilder.tsx` | **PartnershipOfferBuilder.tsx** — 3 tier hibrid: Affiliate (%), Referral (fix £), Joint Venture (rev share + bonus) |
| `ProfileBuilder.tsx` | **CompanyProfileBuilder.tsx** — one-pager pentru pitch parteneriat |
| `GigJobBuilder.tsx` | **PartnershipPitchBuilder.tsx** — propunere formală cu term sheet |
| `FreedomPlanExport.tsx` | **PartnershipStrategyExport.tsx** — PDF plan 90 zile |
| `CVBuilder.tsx` | **PartnershipPitchDeck.tsx** — Deck PDF pentru meeting cu parteneri |
| `DnaQuizPublic.tsx` | **PartnershipDnaQuiz.tsx** — Affiliate / Referral / JV / White Label |

### 3. Edge functions — update prompts (multi-tenant generic)
- `skill-scanner` → `company-asset-scanner` (analizează ce oferă **compania**, nu persoana)
- `ikigai-builder` → `icp-builder` (ICP + IPP)
- `offer-builder` → `partnership-offer-builder` (output: 3 oferte hibride cu % + fix + bonus)
- `gig-generator` / `gig-platform-generator` → `partnership-pitch-generator`
- `profile-builder` → `company-profile-builder`
- `cv-generator` → `pitch-deck-generator`
- `dream100-scanner` → prompt update: caută **parteneri B2B generici** în industria userului (nu studenți)
- `outreach-generator` → tonul B2B partnership outreach (nu freelance)
- `dna-quiz-email`, `dna-quiz-followup` → tipologii partnership

### 4. DB schema additions (multi-tenant friendly)
Adăugăm câmpuri în `profiles` pentru context companie (toți userii sunt operatori B2B):
- `company_name`, `company_industry`, `company_size`, `company_website`, `company_country`
- `company_sells` (text — ce vinde compania)
- `icp_json`, `ipp_json` (Ideal Client/Partner profiles)
- `partnership_offer_json` (oferta hibridă activă)

### 5. CRM & Tracking
- `ClientCRM.tsx` → `PartnerCRM.tsx`: tracking parteneri activi, contracte, comision agreed (% + fix), status
- `IncomeTracker.tsx` → `CommissionTracker.tsx`: revenue per partener, referrals, commission earned, payouts

### 6. i18n updates
- Update `skillmarket-i18n.tsx` + `lib/i18n/translations/{ro,en}.ts`: rebrand toate label-urile wizard-ului pe limbaj B2B partnership
- Scoatem toate string-urile legate de Learning Hub, Courses, Badges

## Plan execuție Faza 2 (4 sub-faze)

### **2A. Cleanup Learning Ecosystem**
- Șterg pagini, componente, edge functions Learning
- Curăț rute în `App.tsx` + sidebar + ToolsHub
- Șterg i18n keys aferente

### **2B. DB Migration — Company fields**
- Migration: ADD COLUMN-uri company_* pe `profiles`
- RLS: rămân pe own-row (deja are)

### **2C. Wizard Rebrand (UI + Edge Functions)**
- Refactor 8 pagini wizard + 8 edge functions cu prompturi B2B generice multi-tenant
- Update onboarding steps 6-8

### **2D. CRM + Commission Tracker**
- Rename ClientCRM → PartnerCRM, adaug câmpuri commission_pct + commission_fixed + bonus
- Rename IncomeTracker → CommissionTracker, adaug per-partner breakdown

## Fișiere de șters (cleanup)

```text
DELETE pages:
- src/pages/LearningHub.tsx
- src/pages/CourseViewer.tsx
- src/pages/PartnerCourses.tsx
- src/pages/CourseSalesPage.tsx
- src/pages/EbookSalesPage.tsx
- src/pages/BundleSalesPage.tsx
- src/pages/admin/CoursesManager.tsx
- src/pages/admin/CourseAnalytics.tsx
- src/pages/admin/BundlesManager.tsx
- src/pages/admin/PLRCourseImporter.tsx

DELETE folder:
- src/components/courses/ (tot)
- src/components/admin/AdminCourseDialog, LessonManagerDialog, QuizManagerDialog
- src/components/gamification/

DELETE hooks:
- useCourseAccess, useGamification

DELETE edge functions:
- course-notifications, course-recommendations, create-course-price
- extract-zip, elevenlabs-tts
```

## Întrebări înainte de cod

