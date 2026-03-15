

# Plan: Conectori pentru Module Dream 100

## Ce conectori avem si unde ii folosim

Ai deja in workspace **Firecrawl** si **Perplexity** -- trebuie doar conectate la proiect.

### Unde ajuta fiecare:

| Modul | Firecrawl | Perplexity | Lovable AI (Gemini) |
|---|---|---|---|
| **Dream 100 Scanner** | -- | Cauta companii reale in timp real cu surse | Fallback daca Perplexity nu e conectat |
| **Dream 100 Analyzer** | Scrape-uieste site-ul companiei (About, Careers, Values) | Cauta news recente, hiring trends | Analizeaza datele colectate si genereaza insights |
| **CV Builder** | -- | -- | Genereaza CV-uri, cover letters (nu are nevoie de date externe) |
| **Outreach Sequences** | -- | -- | Genereaza mesaje personalizate (foloseste datele din Analyzer) |

### Beneficii concrete:

**Perplexity (sonar)** -- pentru Dream 100 Scanner:
- Cauta companii REALE, actualizate, cu URL-uri verificabile
- Returneaza citations (link-uri sursa) pe care studentul le poate verifica
- Filtreaza pe industrie, locatie, marime -- cu date din web real
- Fara Perplexity: AI-ul genereaza companii din memorie (pot fi inexistente sau outdated)

**Firecrawl** -- pentru Dream 100 Analyzer:
- Scrape-uieste pagina "About Us" / "Careers" / "Culture" a companiei
- Extrage valori culturale, job-uri deschise, ton comunicare -- din date REALE
- Fara Firecrawl: AI-ul ghiceste valorile companiei din cunostinte generale

### Flow tehnic:

```text
Dream 100 Scanner:
  Student completeaza filtre
    → Edge function "dream100-scanner" 
    → Perplexity API (sonar) cauta companii reale
    → AI (Gemini) structureaza rezultatele
    → Lista 20-30 companii cu link-uri reale

Dream 100 Analyzer (buton "Analizeaza" pe card):
  Student da click "Analizeaza" pe o tinta
    → Edge function "dream100-analyzer"
    → Firecrawl scrape site-ul companiei (about, careers pages)
    → AI (Gemini) analizeaza continutul scraped
    → Returneaza: valori culturale, probleme, ton recomandat
    → Datele se salveaza pe card si se refolosesc in CV Builder + Outreach
```

### Edge functions noi:

1. **dream100-scanner** -- Perplexity search → Gemini structurare
2. **dream100-analyzer** -- Firecrawl scrape → Gemini analiza
3. **cv-generator** -- Gemini doar (preia date din analyzer + skill_entries + offers)
4. **outreach-sequence** -- Gemini doar (preia date din analyzer)

### Pasi de conectare:

1. Conectam **Firecrawl** la proiect (ai deja conexiunea `std_01kdsjm2f4edsvzsn2tpcapz66`)
2. Conectam **Perplexity** la proiect (ai deja conexiunea `std_01kdsjkjbsfvba4jcmpxkd3267`)
3. Ambele chei API devin automat disponibile in edge functions

### Recomandare:

Folosim **ambele** (Firecrawl + Perplexity). Costul e minimal si diferenta de calitate e enorma: date reale vs date inventate de AI. Studentul primeste companii care exista cu adevarat si analiza bazata pe continut real de pe site-ul companiei.

Vrei sa conectam ambii conectori si sa incepem implementarea cu Pasul 1 (Dream 100 Tracker + Scanner)?

