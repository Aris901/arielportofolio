// ===========================================================
// Portfolio interactivity: theme, nav, scroll effects, motion
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

  // Every motion feature checks this. Visitors who ask their OS to reduce
  // motion get the finished state immediately rather than a lesser animation.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ---- scroll effects: progress bar, navbar state, back-to-top ----
  // Reads are batched into a rAF so scrolling never triggers layout thrash.
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      progressBar.style.width = progress + '%';
      navbar.classList.toggle('scrolled', scrollTop > 10);
      backToTop.classList.toggle('visible', scrollTop > 400);

      updateActiveSection(scrollTop);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // ---- scrollspy: the nav marks whichever section you are reading ----
  const sections = Array.from(document.querySelectorAll('main > section[id], header[id], section[id]'));
  const navMap = new Map();
  navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
    navMap.set(link.getAttribute('href').slice(1), link);
  });

  function updateActiveSection(scrollTop) {
    // The nav is fixed, so the "current" section is the last one whose top
    // has passed just below the bar.
    const marker = scrollTop + navbar.offsetHeight + 80;
    let activeId = null;

    for (const section of sections) {
      if (section.offsetTop <= marker) activeId = section.id;
    }
    // At the very bottom the final section may never reach the marker.
    if (scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      const last = sections[sections.length - 1];
      if (last) activeId = last.id;
    }

    navMap.forEach(function (link, id) {
      link.classList.toggle('is-current', id === activeId);
    });
  }

  // ---- reveal-on-scroll ----
  // Children of a group are staggered so a row of cards arrives in sequence
  // rather than snapping in together.
  const GROUPS = [
    { selector: '.section-head', stagger: 0 },
    { selector: '.about-text', stagger: 0, variant: 'from-left' },
    { selector: '.about-photo', stagger: 0, variant: 'from-right' },
    { selector: '.skill-card', stagger: 110 },
    { selector: '.project-card', stagger: 90 },
    { selector: '.contact-desc', stagger: 0 },
    { selector: '.contact-block .btn-pill-lg', stagger: 0 },
    { selector: '.social-icon', stagger: 60, variant: 'pop' },
  ];

  const revealTargets = [];

  GROUPS.forEach(function (group) {
    document.querySelectorAll(group.selector).forEach(function (el, index) {
      el.classList.add('reveal');
      if (group.variant) el.classList.add('reveal-' + group.variant);
      if (group.stagger) el.style.setProperty('--reveal-delay', index * group.stagger + 'ms');
      revealTargets.push(el);
    });
  });

  if (reduceMotion) {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  // ---- hero stat counters ----
  // Counts up to whatever number is already in the markup, so the animation
  // can never disagree with the real figure.
  const statValues = Array.from(document.querySelectorAll('.stat strong'));

  function runCounter(el) {
    const text = el.textContent.trim();
    const match = text.match(/^(\d+)(\D*)$/);
    if (!match) return;

    const target = Number(match[1]);
    const suffix = match[2];
    const duration = 1100;
    const start = performance.now();

    el.style.fontVariantNumeric = 'tabular-nums';

    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutExpo — fast start, gentle settle
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (!reduceMotion && statValues.length) {
    // The hero stats animate in after their entrance transition lands.
    setTimeout(function () { statValues.forEach(runCounter); }, 700);
  }

  // ---- subtle parallax on the hero photo ----
  const heroPhoto = document.querySelector('.hero-photo');
  const heroBlock = document.querySelector('.hero-block');

  if (!reduceMotion && heroPhoto && heroBlock) {
    let parallaxTicking = false;
    window.addEventListener('scroll', function () {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(function () {
        const scrollTop = window.scrollY;
        // Only while the hero is on screen, and capped so it never detaches
        // from its frame.
        if (scrollTop < heroBlock.offsetHeight) {
          const shift = Math.min(28, scrollTop * 0.06);
          heroPhoto.style.setProperty('--parallax', shift.toFixed(1) + 'px');
        }
        parallaxTicking = false;
      });
    }, { passive: true });
  }

  // ---- ripple on primary buttons ----
  if (!reduceMotion) {
    document.querySelectorAll('.btn-pill, .btn-dark, .btn-primary').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = event.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = event.clientY - rect.top - size / 2 + 'px';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 620);
      });
    });
  }
})();
