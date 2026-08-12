// ===========================================================
// Portfolio i18n: EN (default) / RU / FR
// ===========================================================

(function () {
  const translations = {
    en: {
      "meta.title": "Ariel Kalambay — Portfolio",
      "meta.description": "Personal portfolio of Ariel Kalambay, developer.",
      "nav.home": "Home",
      "nav.about": "About",
      "nav.skills": "Skills",
      "nav.projects": "Projects",
      "nav.contact": "Contact",
      "hero.eyebrow": "Hi, my name is",
      "hero.tagline": "Software Developer.",
      "hero.desc": "I build clean, reliable software and enjoy turning ideas into working products — from small scripts to full web applications.",
      "hero.btn1": "View My Work",
      "hero.btn2": "Get In Touch",
      "about.title": "About Me",
      "about.p1": "Hi, I'm Ariel Kalambay, a software developer who enjoys building things that live on the internet — from small scripts and websites to full applications.",
      "about.p2": "I like figuring out how things work under the hood and turning that understanding into practical, working software. I'm always learning new tools and looking for interesting problems to solve.",
      "about.techIntro": "Here are a few technologies I've been working with recently:",
      "about.photoPlaceholder": "Your Photo",
      "skills.title": "Skills",
      "skills.frontend": "Frontend",
      "skills.backend": "Backend",
      "skills.databases": "Databases",
      "skills.tools": "Tools",
      "projects.title": "Projects",
      "projects.todo.title": "To-Do List App",
      "projects.todo.desc": "A simple task manager where you can add, complete, and delete to-dos. Tasks persist between visits using localStorage. Built to practice DOM manipulation and event handling in vanilla JavaScript.",
      "projects.calc.title": "Calculator",
      "projects.calc.desc": "A responsive calculator that handles basic arithmetic and keyboard input. Built to practice working with functions, operator logic, and styling interactive UI elements with CSS Grid.",
      "projects.landing.title": "Landing Page Clone",
      "projects.landing.desc": "A pixel-inspired recreation of a modern landing page, focused on responsive layout, flexbox/grid structure, and clean typography across mobile and desktop breakpoints.",
      "projects.liveDemo": "Live Demo →",
      "projects.sourceCode": "Source Code →",
      "projects.tagResponsive": "Responsive Design",
      "contact.title": "Get In Touch",
      "contact.desc": "I'm currently open to new opportunities and collaborations. Whether you have a question or just want to say hi, my inbox is always open!",
      "contact.btn": "Say Hello",
      "footer.prefix": "Designed & built by"
    },
    ru: {
      "meta.title": "Ариэль Каламбай — Портфолио",
      "meta.description": "Личное портфолио разработчика Ариэля Каламбая.",
      "nav.home": "Главная",
      "nav.about": "Обо мне",
      "nav.skills": "Навыки",
      "nav.projects": "Проекты",
      "nav.contact": "Контакты",
      "hero.eyebrow": "Привет, меня зовут",
      "hero.tagline": "Разработчик программного обеспечения.",
      "hero.desc": "Я создаю чистое, надёжное программное обеспечение и люблю превращать идеи в готовые продукты — от небольших скриптов до полноценных веб-приложений.",
      "hero.btn1": "Посмотреть работы",
      "hero.btn2": "Связаться со мной",
      "about.title": "Обо мне",
      "about.p1": "Привет, я Ариэль Каламбай, разработчик программного обеспечения, который любит создавать вещи, живущие в интернете — от небольших скриптов и сайтов до полноценных приложений.",
      "about.p2": "Мне нравится разбираться, как всё устроено изнутри, и превращать это понимание в практичное, работающее программное обеспечение. Я постоянно изучаю новые инструменты и ищу интересные задачи для решения.",
      "about.techIntro": "Вот несколько технологий, с которыми я недавно работал:",
      "about.photoPlaceholder": "Ваше фото",
      "skills.title": "Навыки",
      "skills.frontend": "Фронтенд",
      "skills.backend": "Бэкенд",
      "skills.databases": "Базы данных",
      "skills.tools": "Инструменты",
      "projects.title": "Проекты",
      "projects.todo.title": "Список задач",
      "projects.todo.desc": "Простой менеджер задач с возможностью добавлять, отмечать выполненными и удалять задачи. Задачи сохраняются между посещениями благодаря localStorage. Создан для практики работы с DOM и обработки событий на чистом JavaScript.",
      "projects.calc.title": "Калькулятор",
      "projects.calc.desc": "Адаптивный калькулятор для базовых арифметических операций с поддержкой ввода с клавиатуры. Создан для практики работы с функциями, логикой операторов и стилизации интерфейса с помощью CSS Grid.",
      "projects.landing.title": "Клон лендинга",
      "projects.landing.desc": "Воссоздание современного лендинга с акцентом на адаптивную вёрстку, структуру flexbox/grid и аккуратную типографику для мобильных и десктопных экранов.",
      "projects.liveDemo": "Демо →",
      "projects.sourceCode": "Исходный код →",
      "projects.tagResponsive": "Адаптивный дизайн",
      "contact.title": "Свяжитесь со мной",
      "contact.desc": "Сейчас я открыт для новых возможностей и сотрудничества. Если у вас есть вопрос или вы просто хотите поздороваться — мои контакты всегда открыты!",
      "contact.btn": "Написать мне",
      "footer.prefix": "Разработано"
    },
    fr: {
      "meta.title": "Ariel Kalambay — Portfolio",
      "meta.description": "Portfolio personnel d'Ariel Kalambay, développeur.",
      "nav.home": "Accueil",
      "nav.about": "À propos",
      "nav.skills": "Compétences",
      "nav.projects": "Projets",
      "nav.contact": "Contact",
      "hero.eyebrow": "Bonjour, je m'appelle",
      "hero.tagline": "Développeur logiciel.",
      "hero.desc": "Je conçois des logiciels propres et fiables, et j'aime transformer des idées en produits concrets — des petits scripts aux applications web complètes.",
      "hero.btn1": "Voir mes projets",
      "hero.btn2": "Me contacter",
      "about.title": "À propos de moi",
      "about.p1": "Bonjour, je suis Ariel Kalambay, développeur logiciel qui aime créer des choses qui vivent sur internet — des petits scripts et sites web aux applications complètes.",
      "about.p2": "J'aime comprendre comment les choses fonctionnent en coulisses et transformer cette compréhension en logiciels pratiques et fonctionnels. J'apprends constamment de nouveaux outils et je cherche des problèmes intéressants à résoudre.",
      "about.techIntro": "Voici quelques technologies avec lesquelles j'ai travaillé récemment :",
      "about.photoPlaceholder": "Votre photo",
      "skills.title": "Compétences",
      "skills.frontend": "Frontend",
      "skills.backend": "Backend",
      "skills.databases": "Bases de données",
      "skills.tools": "Outils",
      "projects.title": "Projets",
      "projects.todo.title": "Liste de tâches",
      "projects.todo.desc": "Un gestionnaire de tâches simple permettant d'ajouter, de terminer et de supprimer des tâches. Les tâches sont conservées entre les visites grâce à localStorage. Réalisé pour pratiquer la manipulation du DOM et la gestion des événements en JavaScript pur.",
      "projects.calc.title": "Calculatrice",
      "projects.calc.desc": "Une calculatrice responsive gérant les opérations arithmétiques de base et la saisie au clavier. Réalisée pour pratiquer les fonctions, la logique des opérateurs et la mise en forme d'une interface interactive avec CSS Grid.",
      "projects.landing.title": "Clone de landing page",
      "projects.landing.desc": "Une recréation inspirée d'une landing page moderne, axée sur une mise en page responsive, une structure flexbox/grid et une typographie soignée sur mobile et desktop.",
      "projects.liveDemo": "Démo →",
      "projects.sourceCode": "Code source →",
      "projects.tagResponsive": "Design responsive",
      "contact.title": "Me contacter",
      "contact.desc": "Je suis actuellement ouvert à de nouvelles opportunités et collaborations. Que vous ayez une question ou simplement envie de dire bonjour, ma boîte de réception est toujours ouverte !",
      "contact.btn": "Dites bonjour",
      "footer.prefix": "Conçu et développé par"
    }
  };

  const STORAGE_KEY = "portfolio-lang";
  const DEFAULT_LANG = "en";

  function applyLanguage(lang) {
    const dict = translations[lang] || translations[DEFAULT_LANG];

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];
      if (value === undefined) return;

      if (el.hasAttribute("data-i18n-attr")) {
        el.setAttribute(el.getAttribute("data-i18n-attr"), value);
      } else {
        el.textContent = value;
      }
    });

    document.documentElement.setAttribute("lang", lang);

    const select = document.getElementById("langSelect");
    if (select) select.value = lang;
  }

  function initLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lang = translations[saved] ? saved : DEFAULT_LANG;
    applyLanguage(lang);

    const select = document.getElementById("langSelect");
    if (select) {
      select.addEventListener("change", function () {
        const next = select.value;
        applyLanguage(next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initLanguage);
})();
