export const ro = {
  // Common
  common: {
    back: 'Înapoi',
    next: 'Continuă',
    save: 'Salvează',
    cancel: 'Anulează',
    loading: 'Se încarcă...',
    error: 'Eroare',
    success: 'Succes',
    start: 'Start',
    finish: 'Finalizează',
    saving: 'Se salvează...',
    download: 'Descarcă',
    preview: 'Previzualizare',
    locked: 'Blocat',
    completed: 'Completat',
    review: 'Revizuiește',
    items: 'elemente',
    item: 'element',
  },

  // Auth
  auth: {
    login: 'Autentificare',
    register: 'Înregistrare',
    logout: 'Deconectare',
    email: 'Email',
    password: 'Parolă',
    fullName: 'Nume complet',
    welcomeBack: 'Bine ai revenit',
    loginDescription: 'Intră în contul tău pentru a continua',
    loginButton: 'Autentificare',
    loggingIn: 'Se autentifică...',
    noAccount: 'Nu ai cont?',
    registerFree: 'Înregistrează-te gratuit',
    createAccount: 'Creează cont',
    createAccountDescription: 'Începe-ți călătoria spre libertate financiară',
    createAccountButton: 'Creează cont gratuit',
    creatingAccount: 'Se creează contul...',
    hasAccount: 'Ai deja cont?',
    loginHere: 'Autentifică-te',
    passwordMinLength: 'Minim 6 caractere',
    loginFailed: 'Autentificare eșuată',
    loginFailedDescription: 'Email sau parolă incorectă.',
    registerFailed: 'Înregistrare eșuată',
    registerFailedDescription: 'A apărut o eroare. Încearcă din nou.',
    registerSuccess: 'Cont creat cu succes!',
    registerSuccessDescription: 'Bine ai venit în Student Freedom OS!',
    passwordTooShort: 'Parola prea scurtă',
    passwordTooShortDescription: 'Parola trebuie să aibă minim 6 caractere.',
  },

  // Auth benefits
  authBenefits: [
    'Acces la toate uneltele AI',
    'Plan personalizat de freelancing',
    'Template-uri de outreach',
  ],

  // Onboarding
  onboarding: {
    steps: [
      { title: 'Date personale', description: 'Spune-ne cine ești' },
      { title: 'Interese', description: 'Ce îți place să faci' },
      { title: 'Experiență', description: 'Proiecte și realizări' },
      { title: 'Obiective', description: 'Unde vrei să ajungi' },
      { title: 'Valori', description: 'Ce contează pentru tine' },
      { title: 'Skill Scanner', description: 'Descoperă-ți competențele' },
      { title: 'Ikigai', description: 'Găsește-ți direcția' },
      { title: 'Ofertă', description: 'Creează-ți pachetele' },
    ],
    completeSuccess: 'Felicitări! Ai finalizat onboarding-ul!',
    saveError: 'A apărut o eroare. Încearcă din nou.',
  },

  // Onboarding Step 1
  onboardingStep1: {
    description: 'Completează câteva detalii despre tine pentru a personaliza experiența ta.',
    fullNameLabel: 'Numele tău complet *',
    fullNamePlaceholder: 'ex: Alexandru Popescu',
    dateOfBirthLabel: 'Data nașterii (opțional)',
    studyFieldLabel: 'Ce curs studiezi sau ai studiat? *',
    studyFieldPlaceholder: 'Alege cursul tău',
    studyFieldHint: 'Cursuri oferite de EduForYou UK și alte universități din UK',
    otherCourseLabel: 'Specifică cursul tău *',
    otherCoursePlaceholder: 'ex: Economics (BSc) - University of Manchester',
    languageLabel: 'Limba aplicației *',
    languagePlaceholder: 'Alege limba',
    otherCategory: 'Altele',
    otherCourse: 'Alt curs din UK',
  },

  // Dashboard
  dashboard: {
    greeting: 'Bună',
    subtitle: 'Continuă-ți călătoria către libertatea financiară.',
    freedomScore: 'Freedom Score',
    stepsCompleted: 'Pași completați',
    domain: 'Domeniu',
    notSet: 'Nesetat',
    nextStep: 'Următorul pas',
    startNow: 'Începe acum',
    freedomPath: 'Freedom Path',
  },

  // Freedom Path Steps
  pathSteps: {
    skills: {
      title: 'Skill Scanner',
      description: 'Descoperă-ți competențele monetizabile',
    },
    ikigai: {
      title: 'Ikigai Builder',
      description: 'Găsește-ți poziționarea unică',
    },
    offer: {
      title: 'Offer Builder',
      description: 'Creează-ți pachetele de servicii',
    },
    outreach: {
      title: 'Outreach Generator',
      description: 'Generează mesaje de prospectare',
    },
    export: {
      title: 'Freedom Plan',
      description: 'Exportă-ți planul complet',
    },
  },

  // Freedom Plan Export
  export: {
    title: 'Freedom Plan Export',
    subtitle: 'Exportă planul tău complet de freelancing într-un document PDF profesional',
    progressTitle: 'Progres General',
    modulesCompleted: 'module completate',
    allCompletedDescription: 'Felicitări! Ai completat toate modulele și poți exporta planul tău.',
    incompleteDescription: 'Completează toate modulele pentru a genera planul complet.',
    exportTitle: 'Exportă Freedom Plan',
    exportReadyDescription: 'Descarcă documentul în formatul preferat.',
    exportNotReadyDescription: 'Completează toate modulele pentru a putea exporta planul.',
    planReady: 'Planul tău este gata!',
    planReadyDescription: 'Documentul include toate informațiile din cele 5 module: competențe, Ikigai, oferte de servicii, profiluri sociale și template-uri de outreach.',
    modulesRemaining: 'Mai ai {count} module de completat',
    clickModulesToComplete: 'Apasă pe modulele necompletate de mai sus pentru a le finaliza.',
    downloadPdf: 'Descarcă PDF',
    downloadDocx: 'Descarcă DOCX',
    generatingPdf: 'Se generează PDF-ul...',
    previewTitle: 'Preview PDF',
    previewDescription: 'Vizualizează planul tău înainte de a-l descărca',
    backToOutreach: 'Înapoi la Outreach',
    backToDashboard: 'Înapoi la Dashboard',
  },

  // Wizard modules
  wizard: {
    skillScanner: 'Skill Scanner',
    ikigaiBuilder: 'Ikigai Builder',
    offerBuilder: 'Offer Builder',
    profileBuilder: 'Profile Builder',
    outreachGenerator: 'Outreach Generator',
  },

  // Languages
  languages: {
    ro: 'Română',
    en: 'English',
  },
};
