

# Plan: Admin Dashboard Avansat — Monitorizare Completă

## Ce avem acum
Dashboard-ul actual arată doar 6 metrici de bază (useri, verificări, skills, gigs) + 2 grafice (registrări 7 zile, study fields). Lipsește complet vizibilitatea asupra **activității reale** a utilizatorilor.

## Ce construim

### 1. Secțiune nouă: "Engagement Overview" (stats row suplimentar)
Adăugăm carduri cu metrici de engagement:
- **Utilizatori activi AI** (7 din total) — câți au folosit cel puțin o unealtă
- **Total generări AI** (40 total) — cu breakdown per tool
- **Ikigai completate** (10)
- **Dream 100 targets** (44)
- **Progres cursuri** (câți useri au început cel puțin un curs)
- **Email-uri trimise** (445 total, 319 failed — important de văzut!)

### 2. Card: "AI Tools Usage" (bar chart)
Grafic cu cele 5 unelte AI și câte generări are fiecare (offer-builder: 12, profile-builder: 10, ikigai: 9, skill-scanner: 6, life-os: 3).

### 3. Card: "User Activity Funnel"
Vizualizare funnel: Registered → Onboarding Done → Used AI Tool → Created Offer → Dream 100 Started. Arată drop-off-ul la fiecare etapă.

### 4. Card: "Email Health Monitor"
Status emailuri: sent vs failed vs pending vs DLQ. Alertă vizuală dacă failure rate e mare (acum e 71% — critic!).

### 5. Card: "Recent Activity Feed"
Ultimele 20 acțiuni pe platformă din `ai_outputs` — cine a folosit ce tool, când. Live feed pentru monitorizare.

### 6. Card: "Users at Risk" (inactivi 7+ zile)
Tabel cu utilizatorii care nu au mai făcut nimic de 7+ zile — prenume, email, ultima activitate, câte zile inactivi.

### 7. Tabs pentru perioade
Selector 7 zile / 30 zile / All time pentru graficele de registrări și activitate.

## Fișiere afectate

| Fișier | Acțiune |
|---|---|
| `src/pages/admin/AdminDashboard.tsx` | Refactorizare majoră — adăugare secțiuni noi |
| `src/components/admin/StatsCard.tsx` | Minor — adăugare variant "alert" pentru metrici critice |
| `src/components/admin/ActivityFeed.tsx` | NOU — componenta feed activitate |
| `src/components/admin/UserFunnel.tsx` | NOU — vizualizare funnel |
| `src/components/admin/EmailHealthCard.tsx` | NOU — monitor emailuri |

## Pași
1. Creez componentele noi (ActivityFeed, UserFunnel, EmailHealthCard)
2. Extind `AdminDashboard.tsx` cu toate secțiunile noi
3. Adaug query-urile Supabase pentru datele de engagement
4. Stilizez alertele vizuale (email failure rate roșu, useri inactivi)

## Observație importantă
Datele arată că **319 din 445 emailuri au eșuat** (71% failure rate). Dashboard-ul va evidenția asta vizual ca alertă critică.

