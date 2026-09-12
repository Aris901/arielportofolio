/* The three states a visitor can be in.
 *
 * Not two. They chose light, they chose dark, or they have chosen nothing and
 * their operating system has an opinion — and the third is the common one.
 * Before this suite existed the markup hardcoded dark and the OS preference
 * was never consulted, so someone on a light machine got dark regardless.
 *
 * Also checks there is no flash: the theme has to be settled before the first
 * paint, which means the deciding script must be inline in <head>, not at the
 * end of the body with the rest.
 *
 *   node test/theme.test.js
 */
'use strict';

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8901;
const DBG = 9541;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => fs.existsSync(p));

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
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
  const send = (me, pa = {}) => new Promise((r) => {
    const n = id++; waiting.set(n, { resolve: r });
    sock.send(JSON.stringify({ id: n, method: me, params: pa }));
  });
  const ev = async (fn, ...a) => {
    const r = await send('Runtime.evaluate', {
      expression: `(${fn})(${a.map((x) => JSON.stringify(x)).join(',')})`,
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
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'th-'));
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
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 800, deviceScaleFactor: 1, mobile: false });

    const load = async () => {
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
      for (let i = 0; i < 90; i++) {
        if (await cdp.ev(() => !!document.querySelector('#themeToggle'))) break;
        await sleep(100);
      }
      await sleep(500);
    };

    /** What the page resolved to, and what it actually painted. */
    const state = () => cdp.ev(() => {
      const bg = getComputedStyle(document.body).backgroundColor;
      const n = bg.match(/\d+/g).map(Number);
      return {
        attr: document.documentElement.getAttribute('data-theme'),
        bg,
        // A dark ground is dark in every channel; a light one is not.
        painted: (n[0] + n[1] + n[2]) / 3 < 90 ? 'dark' : 'light',
        heading: getComputedStyle(document.querySelector('.hero-name')).color,
      };
    });

    const setPref = (scheme) => cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: scheme }],
    });
    const clearChoice = () => cdp.ev(() => { try { localStorage.removeItem('portfolio-theme'); } catch {} });
    const setChoice = (v) => cdp.ev((x) => { try { localStorage.setItem('portfolio-theme', x); } catch {} }, v);

    console.log('\nSTATE 1 — no choice made, system decides');
    await load();
    await clearChoice();
    await setPref('light');
    await load();
    let s = await state();
    check('a light system gets light', s.painted === 'light', `attr=${s.attr} bg=${s.bg}`);

    await setPref('dark');
    await load();
    s = await state();
    check('a dark system gets dark', s.painted === 'dark', `attr=${s.attr} bg=${s.bg}`);

    console.log('\nSTATE 2 — an explicit choice beats the system');
    await setChoice('light');
    await setPref('dark');
    await load();
    s = await state();
    check('chosen light wins over a dark system', s.painted === 'light', `attr=${s.attr} bg=${s.bg}`);

    await setChoice('dark');
    await setPref('light');
    await load();
    s = await state();
    check('chosen dark wins over a light system', s.painted === 'dark', `attr=${s.attr} bg=${s.bg}`);

    console.log('\nSTATE 3 — the toggle');
    await clearChoice();
    await setPref('dark');
    await load();
    const before = await state();
    await cdp.ev(() => document.getElementById('themeToggle').click());
    // The ground transitions, and headless with --disable-gpu takes well over
    // a second to settle it. Wait for the paint to stop moving rather than
    // guessing a duration.
    let after = await state();
    for (let i = 0; i < 40 && after.painted === before.painted; i++) {
      await sleep(150);
      after = await state();
    }
    check('the toggle flips the painted theme',
      before.painted !== after.painted, `${before.painted} -> ${after.painted}`);
    check('the choice is remembered',
      await cdp.ev(() => { try { return localStorage.getItem('portfolio-theme'); } catch { return null; } }) === after.painted);
    await load();
    check('and survives a reload', (await state()).painted === after.painted);

    console.log('\nNO FLASH');
    // The deciding script must be inline in <head>. At the end of the body it
    // would run after the first paint and the page would visibly change.
    const html = await (await fetch(`http://127.0.0.1:${PORT}/`)).text();
    const head = html.slice(0, html.indexOf('</head>'));
    check('the theme is decided by an inline script in <head>',
      /prefers-color-scheme/.test(head) && /<script>/.test(head));
    check('nothing else re-decides it after paint',
      !/localStorage\.getItem\('portfolio-theme'\)[\s\S]{0,200}setAttribute\('data-theme'/.test(
        await (await fetch(`http://127.0.0.1:${PORT}/js/script.js`)).text()));

    console.log('\nBOTH THEMES ARE READABLE');
    for (const [label, pref] of [['light', 'light'], ['dark', 'dark']]) {
      await clearChoice();
      await setPref(pref);
      await load();
      const r = await cdp.ev(() => {
        const px = (c) => c.match(/\d+/g).map(Number);
        const lum = (c) => { const [r2, g, b] = px(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r2 + 0.7152 * g + 0.0722 * b; };
        const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
        // Sample real rendered text against the surface actually behind it.
        const pick = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          let node = el, bg = 'rgba(0, 0, 0, 0)';
          while (node && bg === 'rgba(0, 0, 0, 0)') { bg = getComputedStyle(node).backgroundColor; node = node.parentElement; }
          return { sel, r: +ratio(getComputedStyle(el).color, bg).toFixed(2) };
        };
        return ['.hero-name', '.hero-desc', '.section-title', '.card-proof li', '.line-desc']
          .map(pick).filter(Boolean);
      });
      const worst = r.reduce((a, b) => (b.r < a.r ? b : a));
      check(`${label}: every sampled text clears AA`, r.every((x) => x.r >= 4.5),
        `worst ${worst.sel} at ${worst.r}:1`);
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
