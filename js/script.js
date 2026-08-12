// ===========================================================
// Portfolio interactivity: theme toggle, nav, scroll effects
// ===========================================================

(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const progressBar = document.getElementById('progressBar');
  const backToTop = document.getElementById('backToTop');
  const yearEl = document.getElementById('year');

  // ---- footer year ----
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- theme (persisted) ----
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
  }

  themeToggle.addEventListener('click', function () {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    themeToggle.textContent = next === 'light' ? '☀️' : '🌙';
    localStorage.setItem('portfolio-theme', next);
  });

  // ---- mobile nav toggle ----
  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });

  // ---- scroll effects: navbar shadow, progress bar, back-to-top ----
  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    progressBar.style.width = progress + '%';
    navbar.classList.toggle('scrolled', scrollTop > 10);
    backToTop.classList.toggle('visible', scrollTop > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- reveal-on-scroll for sections ----
  const revealTargets = document.querySelectorAll(
    '.section-title, .about-grid, .skill-card, .project-card, .contact-desc, .btn-large, .social-links'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach(function (el) { observer.observe(el); });
})();
