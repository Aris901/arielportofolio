/* Renders the portfolio in a real Chrome and checks that the foundation
   document's changes actually landed: the headline, the two project lines,
   the corrected claims, the contact channels, both languages, and no layout
   overflow at four widths.

     node test/page.test.js

   No dependencies — Node 22 ships a WebSocket client and Chrome speaks CDP. */
'use strict';

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8741;
const DBG = 9351;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => fs.existsSync(p));

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.ico': 'image/x-icon',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pass = 0;
const fail = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log('  ok   ' + name); }
  else { fail.push(name); console.log('  FAIL ' + name + (detail ? '\n         ' + detail : '')); }
};

const serve = () => new Promise((res) => {
  const srv = http.createServer((q, s) => {
    const rel = q.url === '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0]).slice(1);
    const f = path.resolve(ROOT, rel);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(s);
  });
  srv.listen(PORT, () => res(srv));
});

async function connect(wsUrl) {
  const sock = new WebSocket(wsUrl);
  await new Promise((r) => { sock.onopen = r; });
  let id = 1;
  const waiting = new Map();
  sock.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { const { resolve } = waiting.get(m.id); waiting.delete(m.id); resolve(m); }
  };
  const send = (method, params = {}) => new Promise((r) => {
    const n = id++; waiting.set(n, { resolve: r });
    sock.send(JSON.stringify({ id: n, method, params }));
  });
  const ev = async (fn, ...args) => {
    const r = await send('Runtime.evaluate', {
      expression: `(${fn})(${args.map((x) => JSON.stringify(x)).join(',')})`,
      awaitPromise: true, returnByValue: true,
    });
    if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description);
    return r.result.result.value;
  };
  return { send, ev, close: () => sock.close() };
}

(async () => {
  if (!CHROME) { console.error('Chrome not found'); process.exit(2); }
  const srv = await serve();
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'pf-'));
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${DBG}`, '--no-first-run',
    '--disable-gpu', `--user-data-dir=${prof}`, 'about:blank',
  ], { stdio: 'ignore' });

  let cdp;
  try {
    let ws;
    for (let i = 0; i < 60; i++) {
      try {
        const r = await fetch(`http://127.0.0.1:${DBG}/json/list`);
        if (r.ok) { const p = (await r.json()).find((t) => t.type === 'page'); if (p) { ws = p.webSocketDebuggerUrl; break; } }
      } catch { /* not up yet */ }
      await sleep(250);
    }
    cdp = await connect(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const load = async (lang) => {
      await cdp.ev((l) => { try { localStorage.setItem('portfolio-lang', l); } catch {} }, lang);
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
      for (let i = 0; i < 80; i++) {
        if (await cdp.ev(() => !!document.querySelector('.hero-name'))) break;
        await sleep(100);
      }
      await sleep(400);
    };

    console.log('\nHEADLINE AND FRAMING');
    await load('en');
    const h = await cdp.ev(() => ({
      badge: document.querySelector('.hero-badge').textContent.replace(/\s+/g, ' ').trim(),
      h1: document.querySelector('.hero-name').textContent.trim(),
      desc: document.querySelector('.hero-desc').textContent.replace(/\s+/g, ' ').trim(),
      stats: [...document.querySelectorAll('.stat')].map((s) => s.textContent.replace(/\s+/g, ' ').trim()),
    }));
    check('headline names the buyer and the thing built', /booking and ordering systems for small service businesses/i.test(h.h1), h.h1);
    check('availability framing is gone', !/taking on projects/i.test(h.badge + h.h1 + h.desc), h.badge);
    check('AI method is disclosed up front', /AI assistance/i.test(h.badge), h.badge);
    check('code handover is stated in the headline block', /code handed over on delivery/i.test(h.desc));
    check('EN/RU is no longer a statistic', !h.stats.some((s) => /EN \/ RU/.test(s)), h.stats.join(' | '));
    check('languages are sold, not counted', /English and Russian/i.test(h.desc), h.desc);

    console.log('\nPROJECT LINES');
    const pl = await cdp.ev(() => ({
      lines: [...document.querySelectorAll('.line-title')].map((e) => e.textContent.trim()),
      systemsCards: document.querySelectorAll('.projects-grid')[0].querySelectorAll('.project-card').length,
      sitesCards: document.querySelectorAll('.projects-grid')[1].querySelectorAll('.project-card').length,
      flag: document.querySelector('.card-flag') ? document.querySelector('.card-flag').textContent.trim() : null,
      proof: document.querySelectorAll('.card-proof li').length,
      links: [...document.querySelectorAll('.project-links a')].length,
    }));
    check('two lines: Systems then Sites', JSON.stringify(pl.lines) === JSON.stringify(['Systems', 'Sites']), pl.lines.join(','));
    check('In-Room Dining stands alone under Systems', pl.systemsCards === 1, String(pl.systemsCards));
    check('clinic and Retreat Club sit under Sites', pl.sitesCards === 2, String(pl.sitesCards));
    check('the reference project is marked as such', pl.flag === 'The reference project', pl.flag);
    check('it carries a proof list, not only tags', pl.proof === 3, String(pl.proof));
    check('every project keeps a live link and a repo', pl.links === 6, String(pl.links));

    console.log('\nCLAIMS');
    const c = await cdp.ev(() => ({
      tech: [...document.querySelectorAll('.about-list li, .skill-card p')].map((e) => e.textContent).join(', '),
      skillAreas: [...document.querySelectorAll('.skill-card h3')].map((e) => e.textContent.trim()),
      socials: [...document.querySelectorAll('.social-icon')].map((a) => a.getAttribute('aria-label')).sort(),
      hasWe: /\bwe (build|are|offer|deliver|can)\b/i.test(document.body.innerText),
    }));
    check('no technology listed that is not in shipped code',
      !/React|TypeScript|MongoDB|PostgreSQL|MySQL|Figma/.test(c.tech), c.tech);
    check('Backend is listed, because the headline sells systems', c.skillAreas.includes('Backend'), c.skillAreas.join(','));
    check('contact row is email, WhatsApp, LinkedIn only',
      JSON.stringify(c.socials) === JSON.stringify(['Email', 'LinkedIn', 'WhatsApp']), c.socials.join(','));
    check('first person singular, no "we"', c.hasWe === false);

    console.log('\nMOBILE DRAWER');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    await load('en');
    const drawer = await cdp.ev(() => {
      const links = [...document.querySelectorAll('.nav-links a')];
      return {
        reachable: links.filter((a) => { a.focus(); return document.activeElement === a; }).length,
        total: links.length,
      };
    });
    check('the closed drawer is not reachable by keyboard', drawer.reachable === 0,
      `${drawer.reachable}/${drawer.total} focusable while invisible`);
    await cdp.send('Emulation.clearDeviceMetricsOverride');

    console.log('\nRUSSIAN');
    await load('ru');
    const ru = await cdp.ev(() => ({
      h1: document.querySelector('.hero-name').textContent.trim(),
      lines: [...document.querySelectorAll('.line-title')].map((e) => e.textContent.trim()),
      flag: document.querySelector('.card-flag') ? document.querySelector('.card-flag').textContent.trim() : null,
      skills: [...document.querySelectorAll('.skill-card h3')].map((e) => e.textContent.trim()),
      // Anything long and purely Latin under a translated key has not been translated.
      leftInEnglish: [...document.querySelectorAll('[data-i18n]')]
        .filter((e) => /^[A-Za-z][A-Za-z ,.'\u2019\u2014-]{18,}$/.test(e.textContent.trim()))
        .map((e) => e.getAttribute('data-i18n'))
        // Project and product names read the same in both languages.
        .filter((k) => k !== 'projects.dining.title'),
    }));
    check('headline is translated', /системы бронирования и заказов/i.test(ru.h1), ru.h1);
    check('both lines are translated', JSON.stringify(ru.lines) === JSON.stringify(['Системы', 'Сайты']), ru.lines.join(','));
    check('the reference flag is translated', ru.flag === 'Референсный проект', ru.flag);
    check('Backend is translated', ru.skills.includes('Бэкенд'), ru.skills.join(','));
    check('nothing is left in English', ru.leftInEnglish.length === 0, ru.leftInEnglish.join(', '));

    console.log('\nLAYOUT');
    for (const w of [320, 375, 768, 1280]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
      await load('en');
      // scrollWidth counts off-viewport fixed elements a person can never
      // reach, so it reports overflow that does not exist. The honest test is
      // whether the page actually scrolls sideways.
      const r = await cdp.ev(() => {
        window.scrollTo(400, 0);
        const moved = window.scrollX;
        window.scrollTo(0, 0);
        const de = document.documentElement;
        const over = [...document.querySelectorAll('body *')]
          .filter((el) => !el.closest('.aura-bg') && getComputedStyle(el).position !== 'fixed')
          .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1)
          .map((el) => el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : ''));
        return { moved, over: [...new Set(over)].slice(0, 4) };
      });
      check(`${w}px — the page cannot be scrolled sideways`, r.moved === 0,
        `scrolled ${r.moved}px; widest in-flow: ` + r.over.join(', '));
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride');

    console.log('\nANIMATION TARGETS');
    await load('en');
    // Scroll the way a person does, one step per round-trip. The
    // IntersectionObserver needs painted frames between steps; looping inside
    // a single evaluate starves it and the reveals appear not to fire.
    for (let y = 0; y < 16; y++) {
      await cdp.ev(() => window.scrollBy(0, 600));
      await sleep(220);
    }
    await sleep(1000);
    const rev = await cdp.ev(() => {
      const groups = ['.section-head', '.about-text', '.skill-card', '.project-card', '.working-block', '.social-icon'];
      return groups.map((g) => ({
        g,
        n: document.querySelectorAll(g).length,
        shown: [...document.querySelectorAll(g)].filter((e) => getComputedStyle(e).opacity !== '0').length,
      }));
    });
    for (const r of rev) {
      check(`reveal group ${r.g} (${r.n}) becomes visible`, r.n > 0 && r.shown === r.n, `${r.shown}/${r.n}`);
    }
  } catch (e) {
    console.error('harness:', e.message);
    fail.push('harness: ' + e.message);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    srv.close();
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
  }

  console.log(`\n${pass} passed, ${fail.length} failed`);
  if (fail.length) { console.log('failed:\n  - ' + fail.join('\n  - ')); process.exit(1); }
})();
