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

  // ---- theme (persisted, defaults to light) ----
  // The toggle holds a moon + sun SVG; CSS shows the right one per theme.
  function syncThemeLabel(theme) {
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');
  syncThemeLabel(savedTheme === 'dark' ? 'dark' : 'light');

  themeToggle.addEventListener('click', function () {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    syncThemeLabel(next);
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
    '.section-head, .about-grid, .skill-card, .project-card, .contact-desc, .social-icons'
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
