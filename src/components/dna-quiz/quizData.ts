export type DnaProfile = 'employee' | 'freelancer' | 'startup';
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
  questions: QuizQuestion[];
  results: Record<DnaProfile, QuizResult>;
}

export const quizTranslations: Record<QuizLang, QuizTranslation> = {
  ro: {
    title: "Descoperă-ți ADN-ul de Execuție",
    subtitle: "10 întrebări. 2 minute. Descoperă calea ta naturală spre succes.",
    startButton: "Începe testul",
    nextButton: "Următoarea",
    questionOf: "din",
    emailTitle: "Rezultatul tău e gata!",
    emailSubtitle: "Introdu email-ul pentru a vedea profilul tău complet.",
    emailPlaceholder: "adresa@email.com",
    emailButton: "Vezi rezultatul",
    registerCta: "Creează-ți cont gratuit",
    registerCtaDesc: "Primește planul complet personalizat pe tipologia ta.",
    retakeButton: "Refă testul",
    tieText: "cu tendințe de",
    questions: [
      {
        question: "Ce te motivează cel mai mult într-un proiect nou?",
        options: [
          { text: "Stabilitatea și claritatea rolului meu.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Libertatea de a-mi alege direcția și clienții.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Potențialul de a crea ceva complet nou și de a scala rapid.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Cum preferi să lucrezi?",
        options: [
          { text: "Într-o echipă bine structurată, cu obiective clare.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Independent, gestionându-mi propriul program și proiecte.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Într-un mediu dinamic, cu responsabilități multiple și decizii rapide.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Ce relație ai cu riscul?",
        options: [
          { text: "Îl evit pe cât posibil, prefer siguranța.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Îl accept ca parte a jocului, atâta timp cât am control.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Îl caut, văd oportunități acolo unde alții văd obstacole.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Cum abordezi eșecul?",
        options: [
          { text: "Învăț din el și mă adaptez, dar prefer să nu se întâmple.", scores: { employee: 2, freelancer: 1, startup: 0 } },
          { text: "Îl văd ca pe o lecție valoroasă și o oportunitate de a pivota.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Eșecul este combustibil pentru inovație, o etapă necesară spre succes.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Ce înseamnă succesul pentru tine?",
        options: [
          { text: "O carieră stabilă, recunoaștere și beneficii consistente.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Independență financiară, flexibilitate și impact direct asupra clienților.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Crearea unui imperiu, rezolvarea unei probleme majore și schimbarea lumii.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Cât de confortabil ești cu incertitudinea?",
        options: [
          { text: "Deloc, am nevoie de predictibilitate.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Destul de confortabil, mă adaptez rapid.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "O îmbrățișez, este mediul meu natural.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Ce rol îți asumi cel mai des într-un grup?",
        options: [
          { text: "Membru valoros al echipei, executant eficient.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Expert independent, consultant.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Lider vizionar, cel care inițiază și coordonează.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Cum gestionezi resursele (timp, bani, energie)?",
        options: [
          { text: "Le gestionez conform bugetului și programului stabilit de alții.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Le aloc strategic pentru a maximiza profitul și libertatea personală.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Le investesc masiv în viziunea mea, chiar dacă asta înseamnă sacrificii pe termen scurt.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Ce te atrage la un loc de muncă/proiect?",
        options: [
          { text: "Siguranța, salariul fix și beneficiile.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Varietatea proiectelor, controlul creativ și potențialul de câștig nelimitat.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Oportunitatea de a construi ceva de la zero și de a lăsa o moștenire.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Cum te vezi peste 5 ani?",
        options: [
          { text: "Avansând într-o companie de top, cu un rol de conducere.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Cu un portofoliu solid de clienți, lucrând de oriunde.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Conducând o companie de succes, cu un impact semnificativ în industrie.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
    ],
    results: {
      employee: {
        title: "ADN de Angajat de Top",
        emoji: "💼",
        description: "Ești o forță stabilă, un pilon de încredere în orice organizație. Nu ești doar un executant, ești un strateg intern, un specialist care aduce valoare consistentă și predictibilitate. Îți place să te dezvolți într-un cadru clar, să contribui la o viziune mai mare și să avansezi pe o cale bine definită. Siguranța, beneficiile și oportunitățile de creștere într-o companie sunt combustibilul tău. Ești gata să preiei responsabilități, să inovezi din interior și să devii un lider respectat.",
        cta: 'Accesează modulul "CV ca Sales Page" și "Dream 100 pentru Angajare"',
        ctaModule: "/cv-builder",
      },
      freelancer: {
        title: "ADN de Freelancer Independent",
        emoji: "💻",
        description: "Ești un arhitect al propriei libertăți, un creator de valoare care refuză să fie limitat de structuri rigide. Îți place să ai control total asupra proiectelor tale, să-ți alegi clienții și să-ți modelezi programul după propriile reguli. Flexibilitatea, diversitatea provocărilor și potențialul de câștig direct sunt motoarele tale. Ești un expert în domeniul tău, gata să oferi soluții personalizate și să construiești relații puternice cu fiecare client.",
        cta: 'Explorează modulul "Offer Builder" și "Dream 100 pentru Freelancing"',
        ctaModule: "/wizard/offer",
      },
      startup: {
        title: "ADN de Fondator de Startup",
        emoji: "🚀",
        description: "Ești un vizionar neînfricat, un inovator care vede lumea nu așa cum este, ci așa cum ar putea fi. Nu te mulțumești cu status quo-ul, ci ești gata să-l zgudui din temelii. Riscul este aliatul tău, eșecul o lecție, iar incertitudinea un teren fertil pentru oportunități. Ești motivat de dorința de a crea ceva măreț, de a rezolva probleme la scară largă și de a lăsa o amprentă durabilă.",
        cta: 'Aprofundează modulul "Founder Accelerator" și "Dream 100 pentru Startup"',
        ctaModule: "/upgrade",
      },
    },
  },
  en: {
    title: "Discover Your Execution DNA",
    subtitle: "10 questions. 2 minutes. Find your natural path to success.",
    startButton: "Start the test",
    nextButton: "Next",
    questionOf: "of",
    emailTitle: "Your result is ready!",
    emailSubtitle: "Enter your email to see your full profile.",
    emailPlaceholder: "your@email.com",
    emailButton: "See my result",
    registerCta: "Create your free account",
    registerCtaDesc: "Get a complete plan personalised to your profile type.",
    retakeButton: "Retake test",
    tieText: "with tendencies of",
    questions: [
      {
        question: "What motivates you most in a new project?",
        options: [
          { text: "Stability and clarity of my role.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Freedom to choose my direction and clients.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "The potential to create something brand new and scale fast.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "How do you prefer to work?",
        options: [
          { text: "In a well-structured team with clear objectives.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Independently, managing my own schedule and projects.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "In a dynamic environment with multiple responsibilities and fast decisions.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "What is your relationship with risk?",
        options: [
          { text: "I avoid it as much as possible, I prefer safety.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "I accept it as part of the game, as long as I have control.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "I seek it out, I see opportunities where others see obstacles.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "How do you approach failure?",
        options: [
          { text: "I learn from it and adapt, but prefer it doesn't happen.", scores: { employee: 2, freelancer: 1, startup: 0 } },
          { text: "I see it as a valuable lesson and an opportunity to pivot.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Failure is fuel for innovation, a necessary stage towards success.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "What does success mean to you?",
        options: [
          { text: "A stable career, recognition and consistent benefits.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Financial independence, flexibility and direct impact on clients.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Building an empire, solving a major problem and changing the world.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "How comfortable are you with uncertainty?",
        options: [
          { text: "Not at all, I need predictability.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Quite comfortable, I adapt quickly.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "I embrace it, it's my natural environment.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "What role do you most often take in a group?",
        options: [
          { text: "Valuable team member, efficient executor.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Independent expert, consultant.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Visionary leader, the one who initiates and coordinates.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "How do you manage resources (time, money, energy)?",
        options: [
          { text: "I manage them according to a budget and schedule set by others.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "I allocate them strategically to maximise profit and personal freedom.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "I invest them heavily in my vision, even if it means short-term sacrifices.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "What attracts you to a job/project?",
        options: [
          { text: "Security, a fixed salary and benefits.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Variety of projects, creative control and unlimited earning potential.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "The opportunity to build something from scratch and leave a legacy.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Where do you see yourself in 5 years?",
        options: [
          { text: "Advancing in a top company with a leadership role.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "With a solid portfolio of clients, working from anywhere.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Leading a successful company with significant industry impact.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
    ],
    results: {
      employee: {
        title: "Top Employee DNA",
        emoji: "💼",
        description: "You are a stable force, a pillar of trust in any organisation. You're not just an executor — you're an internal strategist, a specialist who brings consistent value and predictability. You thrive in a clear framework, contributing to a bigger vision and advancing on a well-defined path. Security, benefits and growth opportunities within a company are your fuel. You're ready to take on responsibilities, innovate from within and become a respected leader.",
        cta: "Access the \"CV as Sales Page\" and \"Dream 100 for Employment\" modules",
        ctaModule: "/cv-builder",
      },
      freelancer: {
        title: "Independent Freelancer DNA",
        emoji: "💻",
        description: "You are an architect of your own freedom, a value creator who refuses to be limited by rigid structures. You love having total control over your projects, choosing your clients and shaping your schedule by your own rules. Flexibility, diverse challenges and direct earning potential are your engines. You're an expert in your field, ready to offer personalised solutions and build strong relationships with every client.",
        cta: "Explore the \"Offer Builder\" and \"Dream 100 for Freelancing\" modules",
        ctaModule: "/wizard/offer",
      },
      startup: {
        title: "Startup Founder DNA",
        emoji: "🚀",
        description: "You are a fearless visionary, an innovator who sees the world not as it is, but as it could be. You don't settle for the status quo — you're ready to shake it to its foundations. Risk is your ally, failure a lesson, and uncertainty fertile ground for opportunities. You're driven by the desire to create something great, solve problems at scale and leave a lasting mark.",
        cta: "Explore the \"Founder Accelerator\" and \"Dream 100 for Startup\" modules",
        ctaModule: "/upgrade",
      },
    },
  },
  ua: {
    title: "Відкрий свою ДНК Виконання",
    subtitle: "10 питань. 2 хвилини. Знайди свій природний шлях до успіху.",
    startButton: "Почати тест",
    nextButton: "Далі",
    questionOf: "з",
    emailTitle: "Ваш результат готовий!",
    emailSubtitle: "Введіть email, щоб побачити свій повний профіль.",
    emailPlaceholder: "ваша@пошта.com",
    emailButton: "Побачити результат",
    registerCta: "Створіть безкоштовний акаунт",
    registerCtaDesc: "Отримайте повний план, персоналізований під ваш тип.",
    retakeButton: "Пройти ще раз",
    tieText: "з тенденціями до",
    questions: [
      {
        question: "Що мотивує вас найбільше в новому проєкті?",
        options: [
          { text: "Стабільність і чіткість моєї ролі.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Свобода обирати напрямок і клієнтів.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Потенціал створити щось абсолютно нове і швидко масштабувати.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Як ви віддаєте перевагу працювати?",
        options: [
          { text: "У добре структурованій команді з чіткими цілями.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Незалежно, керуючи власним графіком і проєктами.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "У динамічному середовищі з множиною обов'язків і швидкими рішеннями.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Яке ваше ставлення до ризику?",
        options: [
          { text: "Уникаю його наскільки можливо, віддаю перевагу безпеці.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Приймаю як частину гри, поки маю контроль.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Шукаю його, бачу можливості там, де інші бачать перешкоди.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Як ви ставитесь до невдач?",
        options: [
          { text: "Вчусь з них і адаптуюсь, але волію, щоб їх не було.", scores: { employee: 2, freelancer: 1, startup: 0 } },
          { text: "Бачу як цінний урок і можливість змінити курс.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Невдача — це паливо для інновацій, необхідний етап до успіху.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Що для вас означає успіх?",
        options: [
          { text: "Стабільна кар'єра, визнання і постійні переваги.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Фінансова незалежність, гнучкість і прямий вплив на клієнтів.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Створення імперії, вирішення великої проблеми і зміна світу.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Наскільки комфортно вам з невизначеністю?",
        options: [
          { text: "Зовсім ні, мені потрібна передбачуваність.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Досить комфортно, я швидко адаптуюсь.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Я її приймаю, це моє природне середовище.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Яку роль ви найчастіше берете на себе в групі?",
        options: [
          { text: "Цінний член команди, ефективний виконавець.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Незалежний експерт, консультант.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Лідер-візіонер, той хто ініціює і координує.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Як ви управляєте ресурсами (час, гроші, енергія)?",
        options: [
          { text: "Управляю відповідно до бюджету і графіку, встановлених іншими.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Розподіляю стратегічно для максимізації прибутку і свободи.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Масово інвестую у свою візію, навіть якщо це означає жертви.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Що вас приваблює у роботі/проєкті?",
        options: [
          { text: "Безпека, фіксована зарплата і пільги.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "Різноманітність проєктів, творчий контроль і необмежений потенціал заробітку.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Можливість побудувати щось з нуля і залишити спадщину.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
      {
        question: "Де ви бачите себе через 5 років?",
        options: [
          { text: "Просуваюсь у топ-компанії з керівною роллю.", scores: { employee: 2, freelancer: 0, startup: 0 } },
          { text: "З солідним портфелем клієнтів, працюючи з будь-якого місця.", scores: { employee: 0, freelancer: 2, startup: 1 } },
          { text: "Керую успішною компанією зі значним впливом на індустрію.", scores: { employee: 0, freelancer: 1, startup: 2 } },
        ],
      },
    ],
    results: {
      employee: {
        title: "ДНК Топ-Працівника",
        emoji: "💼",
        description: "Ви — стабільна сила, опора довіри в будь-якій організації. Ви не просто виконавець — ви внутрішній стратег, спеціаліст, який приносить послідовну цінність і передбачуваність. Вам подобається розвиватися у чіткій структурі, вносити вклад у більшу візію і рухатися визначеним шляхом. Безпека, переваги і можливості зростання у компанії — ваше паливо.",
        cta: "Відкрийте модулі «CV як Sales Page» та «Dream 100 для працевлаштування»",
        ctaModule: "/cv-builder",
      },
      freelancer: {
        title: "ДНК Незалежного Фрілансера",
        emoji: "💻",
        description: "Ви — архітектор власної свободи, творець цінності, який відмовляється бути обмеженим жорсткими структурами. Вам подобається мати повний контроль над своїми проєктами, обирати клієнтів і формувати графік за власними правилами. Гнучкість, різноманітність викликів і прямий потенціал заробітку — ваші двигуни.",
        cta: "Дослідіть модулі «Offer Builder» та «Dream 100 для Freelancing»",
        ctaModule: "/wizard/offer",
      },
      startup: {
        title: "ДНК Засновника Стартапу",
        emoji: "🚀",
        description: "Ви — безстрашний візіонер, інноватор, який бачить світ не таким, яким він є, а таким, яким він може бути. Ви не задовольняєтесь статус-кво — ви готові його змінити. Ризик — ваш союзник, невдача — урок, а невизначеність — родючий ґрунт для можливостей. Вас рухає бажання створити щось величне.",
        cta: "Дослідіть модулі «Founder Accelerator» та «Dream 100 для Startup»",
        ctaModule: "/upgrade",
      },
    },
  },
};

export function calculateResult(scores: Record<DnaProfile, number>): { primary: DnaProfile; secondary?: DnaProfile } {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as [DnaProfile, number][];
  const primary = sorted[0][0];
  // Check for tie between first and second
  if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
    return { primary, secondary: sorted[1][0] };
  }
  return { primary };
}
