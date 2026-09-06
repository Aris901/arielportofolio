'use strict';

/**
 * Builds img/og-cover.png — the preview card that appears when the site is
 * pasted into WhatsApp, Telegram or LinkedIn.
 *
 * Section 9 of the build brief asks for one, on the grounds that "a link with
 * no preview reads as unfinished". The Russian-speaking market this is aimed
 * at does most of its business in exactly those apps, so the preview is the
 * first thing many people will see of the site.
 *
 *   node scripts/make-og-image.js
 *
 * Renders in Chrome at the 1200x630 Open Graph size. The words are the
 * headline and nothing else — no invented logos, no stock photography.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'img', 'og-cover.png');
const DBG = 9391;
const W = 1200;
const H = 630;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => fs.existsSync(p));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Same black and terracotta as the site, so the preview and the page are
// recognisably the same thing.
const CARD = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: ${W}px; height: ${H}px; overflow: hidden;
    background: #0a0806; color: #f6ede8;
    font-family: Poppins, "Segoe UI", sans-serif;
    display: flex; flex-direction: column; justify-content: center;
    padding: 76px 88px; position: relative;
  }
  .ember {
    position: absolute; inset: -30% -10% auto -10%; height: 150%;
    background: linear-gradient(154deg, transparent 20%, rgba(200,107,74,.40) 36%,
      rgb(255,206,178) 42%, rgba(226,146,110,.32) 48%, rgba(169,82,47,.22) 56%,
      transparent 76%);
    filter: blur(120px); opacity: .55;
  }
  .scrim { position: absolute; inset: 0; background: rgba(10,8,6,.42); }
  .in { position: relative; }
  .eyebrow {
    font-size: 21px; font-weight: 600; letter-spacing: .16em;
    text-transform: uppercase; color: #f2a03d; margin-bottom: 26px;
  }
  h1 {
    font-size: 62px; line-height: 1.12; letter-spacing: -.02em;
    font-weight: 800; max-width: 19ch;
  }
  p { margin-top: 26px; font-size: 25px; line-height: 1.5; color: #cdbcb2; max-width: 34ch; }
  .rule { margin-top: 38px; width: 96px; height: 4px; background: #c86b4a; border-radius: 3px; }
</style></head><body>
  <div class="ember"></div><div class="scrim"></div>
  <div class="in">
    <div class="eyebrow">Ariel Kalambay</div>
    <h1>I build booking and ordering systems for small service businesses.</h1>
    <p>And the sites in front of them. English and Russian. Every project live and public.</p>
    <div class="rule"></div>
  </div>
</body></html>`;

(async () => {
  if (!CHROME) { console.error('Chrome not found'); process.exit(2); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${DBG}`, '--no-first-run',
    '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });

  let sock;
  try {
    let ws;
    for (let i = 0; i < 80; i++) {
      try {
        const r = await fetch(`http://127.0.0.1:${DBG}/json/list`);
        if (r.ok) { const p = (await r.json()).find((t) => t.type === 'page'); if (p) { ws = p.webSocketDebuggerUrl; break; } }
      } catch { /* not up yet */ }
      await sleep(250);
    }
    sock = new WebSocket(ws);
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

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(CARD) });
    // Give the webfont a moment; a fallback render would look wrong.
    await sleep(2500);

    const { result } = await send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, Buffer.from(result.data, 'base64'));
    console.log(`wrote ${path.relative(ROOT, OUT)}  ${W}x${H}  ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
  } finally {
    if (sock) sock.close();
    chrome.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
})();
