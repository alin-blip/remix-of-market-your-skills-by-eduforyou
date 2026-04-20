// B2B Partnership DNA Quiz — identifies the best partnership model for your company
export type DnaProfile = 'affiliate' | 'referral' | 'jv';
export type QuizLang = 'ro' | 'en' | 'ua';

export interface QuizOption {
  text: string;
  scores: Record<DnaProfile, number>;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export interface QuizResult {
  title: string;
  emoji: string;
  description: string;
  cta: string;
  ctaModule: string;
}

export interface QuizTranslation {
  title: string;
  subtitle: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCta: string;
  startButton: string;
  nextButton: string;
  questionOf: string;
  emailTitle: string;
  emailSubtitle: string;
  emailPlaceholder: string;
  emailButton: string;
  registerCta: string;
  registerCtaDesc: string;
  retakeButton: string;
  tieText: string;
  signupTitle: string;
  signupSubtitle: string;
  passwordPlaceholder: string;
  signupButton: string;
  loginLink: string;
  loginLinkAction: string;
  enterPlatform: string;
  orContinueWith: string;
  signupError: string;
  questions: QuizQuestion[];
  results: Record<DnaProfile, QuizResult>;
}

export const quizTranslations: Record<QuizLang, QuizTranslation> = {
  ro: {
    title: "Descoperă-ți ADN-ul de Parteneriat B2B",
    subtitle: "10 întrebări. 2 minute. Află ce model de parteneriat scalează compania ta.",
    heroHeadline: "Multe companii vând singure...\ndar cele mai mari cresc prin parteneri.",
    heroSubheadline: "Compania ta este construită pentru Affiliate, Referral sau Joint Venture? Nu pierde luni întregi pe modelul greșit.",
    heroCta: "Verifică-ți ADN-ul de Parteneriat — Gratuit",
    startButton: "Începe testul",
    nextButton: "Următoarea",
    questionOf: "din",
    emailTitle: "Rezultatul tău e gata!",
    emailSubtitle: "Introdu email-ul pentru a vedea profilul complet de parteneriat.",
    emailPlaceholder: "adresa@email.com",
    emailButton: "Vezi rezultatul",
    registerCta: "Creează-ți cont gratuit",
    registerCtaDesc: "Primește planul Dream 100 personalizat pe modelul tău de parteneriat.",
    retakeButton: "Refă testul",
    tieText: "cu tendințe de",
    signupTitle: "Rezultatul tău e gata! 🎯",
    signupSubtitle: "Creează-ți cont gratuit pentru a vedea profilul complet și a accesa platforma.",
    passwordPlaceholder: "Parolă (min. 6 caractere)",
    signupButton: "Creează cont și vezi rezultatul",
    loginLink: "Ai deja cont?",
    loginLinkAction: "Loghează-te",
    enterPlatform: "Intră în platformă",
    orContinueWith: "sau continuă cu",
    signupError: "Eroare la crearea contului. Încearcă din nou.",
    questions: [
      {
        question: "Care e principalul activ al companiei tale astăzi?",
        options: [
          { text: "Trafic, audiență sau o listă de email mare.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Relații puternice cu clienți / decision makers.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Produs/tehnologie unică sau capabilități greu de replicat.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Cum preferi să lucrezi cu un partener?",
        options: [
          { text: "Setez link-uri de tracking și plătesc pe rezultat.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Fac introduceri calde și împart comisionul pe deal-uri închise.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Construim împreună un produs/ofertă comună cu split de revenue.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Cum gândești comisionul ideal?",
        options: [
          { text: "% fix din vânzare, plătit automat per conversie.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Fee fix per intro calificat + bonus la closing.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Revenue share pe termen lung + equity sau co-branding.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Cât de implicat vrei să fii în vânzare?",
        options: [
          { text: "Deloc — partenerul aduce trafic, eu gestionez restul.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Moderat — partenerul recomandă, eu închid deal-ul.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Foarte — co-pitching, co-delivery, co-ownership al clientului.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Care e ciclul tău mediu de vânzare?",
        options: [
          { text: "Scurt — checkout direct, decizie individuală.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Mediu — 1-3 meetings, decizie B2B clasică.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Lung — enterprise, comitete, contract complex.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Ce volum de parteneri urmărești?",
        options: [
          { text: "Sute / mii — un program scalabil cu auto-onboarding.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Zeci de parteneri activi pe care îi cunosc personal.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "5–20 parteneri strategici cu relație profundă.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Câtă atenție investești per partener?",
        options: [
          { text: "Minimă — dashboard, link-uri, plăți automate.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Moderată — check-in lunar, materiale de vânzare.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Maximă — calls săptămânale, planuri comune, escalare.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Cum vrei să fie atribuirea revenue-ului?",
        options: [
          { text: "Tracking last-click, fără ambiguitate.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Atribuire manuală pe baza intro-ului calificat.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Revenue share contractual pe toate deal-urile generate împreună.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Ce tip de partener te entuziasmează cel mai mult?",
        options: [
          { text: "Creatori, media, comunități cu audiență targetată.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Consultanți, agenții, freelanceri cu portofoliu de clienți.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Companii complementare cu produs sinergic și brand puternic.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Care e obiectivul tău în următoarele 90 de zile?",
        options: [
          { text: "Lansez un program de afiliere cu 50+ parteneri activi.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Construiesc o rețea de 20-30 referrers calificați.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Închid 3-5 parteneriate JV strategice cu impact mare.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
    ],
    results: {
      affiliate: {
        title: "ADN de Affiliate Operator",
        emoji: "🔗",
        description: "Compania ta este construită pentru un program de afiliere scalabil. Ai trafic, audiență sau o ofertă cu volum și ai nevoie de un sistem care funcționează 24/7 fără implicare per partener. Cei mai buni parteneri pentru tine sunt creatori de conținut, comunități și site-uri cu audiență targetată. Modelul tău: % comision fix, tracking automat, plăți recurente, dashboard self-serve. Construiește un program cu 50+ afiliați și lasă sistemul să scaleze.",
        cta: 'Accesează "Partnership Offer Builder" și creează tier-ul tău Affiliate',
        ctaModule: "/wizard/offer",
      },
      referral: {
        title: "ADN de Referral Networker",
        emoji: "🤝",
        description: "Compania ta crește prin relații, nu prin trafic. Ai o ofertă B2B premium și ciclu de vânzare care necesită încredere. Cei mai buni parteneri sunt consultanți, agenții, freelanceri și conectori care au deja relația cu clienții pe care îi vizezi. Modelul tău: fee fix per intro calificat + bonus de închidere. Construiește o rețea de 20-30 referrers personali, oferă-le materiale de vânzare premium și fii prezent în pipeline-ul lor lunar.",
        cta: 'Accesează "Partner CRM" pentru a-ți gestiona rețeaua de referrers',
        ctaModule: "/client-crm",
      },
      jv: {
        title: "ADN de JV Builder",
        emoji: "🚀",
        description: "Compania ta este pregătită pentru parteneriate strategice cu impact mare. Ai produs unic, brand sau capabilități pe care alte companii și le doresc — și vrei deal-uri profunde, nu volum. Cei mai buni parteneri sunt companii complementare, white-label resellers sau jucători enterprise. Modelul tău: revenue share pe termen lung, co-branding, co-delivery și uneori equity. Concentrează-te pe 5-20 parteneriate JV de impact major în următoarele 12 luni.",
        cta: 'Accesează "Dream 100 Tracker" pentru a-ți construi pipeline-ul JV',
        ctaModule: "/dream100",
      },
    },
  },
  en: {
    title: "Discover Your B2B Partnership DNA",
    subtitle: "10 questions. 2 minutes. Find the partnership model that scales your company.",
    heroHeadline: "Many companies sell alone...\nbut the biggest grow through partners.",
    heroSubheadline: "Is your company built for Affiliate, Referral or Joint Venture partnerships? Don't waste months on the wrong model.",
    heroCta: "Check Your Partnership DNA — Free",
    startButton: "Start the test",
    nextButton: "Next",
    questionOf: "of",
    emailTitle: "Your result is ready!",
    emailSubtitle: "Enter your email to see your full partnership profile.",
    emailPlaceholder: "your@email.com",
    emailButton: "See my result",
    registerCta: "Create your free account",
    registerCtaDesc: "Get a Dream 100 plan personalised to your partnership model.",
    retakeButton: "Retake test",
    tieText: "with tendencies of",
    signupTitle: "Your result is ready! 🎯",
    signupSubtitle: "Create a free account to see your full profile and access the platform.",
    passwordPlaceholder: "Password (min. 6 characters)",
    signupButton: "Create account & see result",
    loginLink: "Already have an account?",
    loginLinkAction: "Log in",
    enterPlatform: "Enter the platform",
    orContinueWith: "or continue with",
    signupError: "Error creating account. Please try again.",
    questions: [
      {
        question: "What is your company's main asset today?",
        options: [
          { text: "Traffic, audience, or a large email list.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Strong relationships with clients / decision makers.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Unique product/tech or hard-to-replicate capabilities.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "How do you prefer to work with a partner?",
        options: [
          { text: "Set up tracking links and pay per result.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Make warm intros and split commission on closed deals.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Build a joint product/offer together with revenue split.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "How do you think about ideal commission?",
        options: [
          { text: "Fixed % per sale, paid automatically per conversion.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Fixed fee per qualified intro + closing bonus.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Long-term revenue share + equity or co-branding.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "How involved do you want to be in the sale?",
        options: [
          { text: "Not at all — partner brings traffic, I handle the rest.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Moderately — partner refers, I close the deal.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Heavily — co-pitching, co-delivery, co-ownership of the client.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "What is your average sales cycle?",
        options: [
          { text: "Short — direct checkout, individual decision.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Medium — 1-3 meetings, classic B2B decision.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Long — enterprise, committees, complex contract.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "What partner volume are you targeting?",
        options: [
          { text: "Hundreds / thousands — a scalable program with auto-onboarding.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Dozens of active partners I know personally.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "5–20 strategic partners with deep relationships.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "How much attention do you invest per partner?",
        options: [
          { text: "Minimal — dashboard, links, automatic payouts.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Moderate — monthly check-in, sales materials.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Maximum — weekly calls, joint plans, escalation.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "How do you want revenue attribution to work?",
        options: [
          { text: "Last-click tracking, no ambiguity.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Manual attribution based on the qualified intro.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Contractual revenue share on all deals generated together.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "What kind of partner excites you most?",
        options: [
          { text: "Creators, media, communities with targeted audience.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Consultants, agencies, freelancers with client portfolios.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Complementary companies with synergistic product and strong brand.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "What is your goal for the next 90 days?",
        options: [
          { text: "Launch an affiliate program with 50+ active partners.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Build a network of 20-30 qualified referrers.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Close 3-5 strategic JV partnerships with major impact.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
    ],
    results: {
      affiliate: {
        title: "Affiliate Operator DNA",
        emoji: "🔗",
        description: "Your company is built for a scalable affiliate program. You have traffic, audience, or a high-volume offer and you need a system that runs 24/7 without per-partner involvement. Best partners for you: content creators, communities, and sites with targeted audiences. Your model: fixed % commission, automatic tracking, recurring payouts, self-serve dashboard. Build a program with 50+ affiliates and let the system scale.",
        cta: 'Open "Partnership Offer Builder" and create your Affiliate tier',
        ctaModule: "/wizard/offer",
      },
      referral: {
        title: "Referral Networker DNA",
        emoji: "🤝",
        description: "Your company grows through relationships, not traffic. You have a premium B2B offer and a sales cycle that requires trust. Best partners: consultants, agencies, freelancers and connectors who already have the relationship with the clients you target. Your model: fixed fee per qualified intro + closing bonus. Build a network of 20-30 personal referrers, give them premium sales materials, and stay present in their monthly pipeline.",
        cta: 'Open "Partner CRM" to manage your referrer network',
        ctaModule: "/client-crm",
      },
      jv: {
        title: "JV Builder DNA",
        emoji: "🚀",
        description: "Your company is ready for high-impact strategic partnerships. You have a unique product, brand or capability that other companies want — and you want deep deals, not volume. Best partners: complementary companies, white-label resellers, or enterprise players. Your model: long-term revenue share, co-branding, co-delivery, sometimes equity. Focus on 5-20 high-impact JV partnerships in the next 12 months.",
        cta: 'Open "Dream 100 Tracker" to build your JV pipeline',
        ctaModule: "/dream100",
      },
    },
  },
  ua: {
    title: "Відкрий ДНК B2B Партнерства",
    subtitle: "10 питань. 2 хвилини. Знайди модель партнерства, яка масштабує компанію.",
    heroHeadline: "Багато компаній продають самі...\nале найбільші ростуть через партнерів.",
    heroSubheadline: "Ваша компанія створена для Affiliate, Referral чи Joint Venture? Не витрачайте місяці на неправильну модель.",
    heroCta: "Перевірте свою ДНК Партнерства — Безкоштовно",
    startButton: "Почати тест",
    nextButton: "Далі",
    questionOf: "з",
    emailTitle: "Ваш результат готовий!",
    emailSubtitle: "Введіть email, щоб побачити повний профіль партнерства.",
    emailPlaceholder: "ваша@пошта.com",
    emailButton: "Побачити результат",
    registerCta: "Створіть безкоштовний акаунт",
    registerCtaDesc: "Отримайте план Dream 100, персоналізований під вашу модель.",
    retakeButton: "Пройти ще раз",
    tieText: "з тенденціями до",
    signupTitle: "Ваш результат готовий! 🎯",
    signupSubtitle: "Створіть безкоштовний акаунт, щоб побачити повний профіль.",
    passwordPlaceholder: "Пароль (мін. 6 символів)",
    signupButton: "Створити акаунт",
    loginLink: "Вже є акаунт?",
    loginLinkAction: "Увійти",
    enterPlatform: "Увійти в платформу",
    orContinueWith: "або продовжити з",
    signupError: "Помилка створення акаунту. Спробуйте ще раз.",
    questions: [
      {
        question: "Який головний актив вашої компанії сьогодні?",
        options: [
          { text: "Трафік, аудиторія або великий список email.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Сильні стосунки з клієнтами / decision makers.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Унікальний продукт/технологія, яку важко повторити.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Як ви віддаєте перевагу працювати з партнером?",
        options: [
          { text: "Налаштовую tracking-посилання і плачу за результат.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Роблю теплі інтро і ділю комісію за закриті угоди.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Будуємо разом спільний продукт з revenue split.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Як ви думаєте про ідеальну комісію?",
        options: [
          { text: "Фіксований % від продажу, автоматично за конверсію.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Фіксована плата за кваліфіковане інтро + бонус за закриття.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Довгостроковий revenue share + equity або co-branding.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Наскільки ви хочете бути залучені у продаж?",
        options: [
          { text: "Зовсім ні — партнер приводить трафік, я роблю решту.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Помірно — партнер рекомендує, я закриваю угоду.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Дуже — co-pitching, co-delivery, спільне володіння клієнтом.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Який ваш середній цикл продажу?",
        options: [
          { text: "Короткий — прямий checkout, індивідуальне рішення.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Середній — 1-3 зустрічі, класичне B2B рішення.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Довгий — enterprise, комітети, складний контракт.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Який обсяг партнерів ви плануєте?",
        options: [
          { text: "Сотні / тисячі — масштабована програма з auto-onboarding.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Десятки активних партнерів, яких я знаю особисто.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "5–20 стратегічних партнерів з глибокими стосунками.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Скільки уваги інвестуєте на партнера?",
        options: [
          { text: "Мінімум — dashboard, посилання, автоматичні виплати.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Помірно — щомісячний check-in, матеріали.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Максимум — щотижневі дзвінки, спільні плани.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Як ви хочете атрибуцію доходу?",
        options: [
          { text: "Last-click tracking, без неоднозначності.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Ручна атрибуція на основі кваліфікованого інтро.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Контрактний revenue share на всі спільні угоди.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Який тип партнера вас найбільше захоплює?",
        options: [
          { text: "Креатори, медіа, спільноти з таргетованою аудиторією.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Консультанти, агенції, фрілансери з портфоліо клієнтів.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Компанії з синергічним продуктом і сильним брендом.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
      {
        question: "Яка ваша ціль на наступні 90 днів?",
        options: [
          { text: "Запустити affiliate-програму з 50+ активних партнерів.", scores: { affiliate: 2, referral: 0, jv: 0 } },
          { text: "Побудувати мережу з 20-30 кваліфікованих referrers.", scores: { affiliate: 0, referral: 2, jv: 1 } },
          { text: "Закрити 3-5 стратегічних JV з великим впливом.", scores: { affiliate: 0, referral: 1, jv: 2 } },
        ],
      },
    ],
    results: {
      affiliate: {
        title: "ДНК Affiliate Operator",
        emoji: "🔗",
        description: "Ваша компанія створена для масштабованої affiliate-програми. У вас є трафік, аудиторія або оферта з обсягом, і вам потрібна система, що працює 24/7 без залученості per-partner. Найкращі партнери: контент-креатори, спільноти, сайти з таргетованою аудиторією. Ваша модель: фіксований % комісії, автоматичне відстеження, повторювані виплати, self-serve dashboard.",
        cta: 'Відкрийте "Partnership Offer Builder" і створіть Affiliate тir',
        ctaModule: "/wizard/offer",
      },
      referral: {
        title: "ДНК Referral Networker",
        emoji: "🤝",
        description: "Ваша компанія росте через стосунки, а не трафік. У вас premium B2B оферта і цикл продажу, що вимагає довіри. Найкращі партнери: консультанти, агенції, фрілансери та коннектори, які вже мають стосунки з клієнтами. Ваша модель: фіксована плата за кваліфіковане інтро + бонус за закриття.",
        cta: 'Відкрийте "Partner CRM" для управління мережею referrers',
        ctaModule: "/client-crm",
      },
      jv: {
        title: "ДНК JV Builder",
        emoji: "🚀",
        description: "Ваша компанія готова до стратегічних партнерств з великим впливом. У вас унікальний продукт, бренд чи капабіліті, які потрібні іншим — і ви хочете глибокі угоди, а не обсяг. Найкращі партнери: компанії з синергічним продуктом, white-label resellers, enterprise. Ваша модель: довгостроковий revenue share, co-branding, co-delivery.",
        cta: 'Відкрийте "Dream 100 Tracker" для побудови JV pipeline',
        ctaModule: "/dream100",
      },
    },
  },
};

export function calculateResult(scores: Record<DnaProfile, number>): { primary: DnaProfile; secondary?: DnaProfile } {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as [DnaProfile, number][];
  const primary = sorted[0][0];
  if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
    return { primary, secondary: sorted[1][0] };
  }
  return { primary };
}
