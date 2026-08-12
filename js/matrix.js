// ===========================================================
// Hero "Matrix rain" background — tinted to the current theme's
// accent color so it adapts automatically with the theme toggle.
// ===========================================================

(function () {
  const canvas = document.getElementById("matrixCanvas");
  const hero = document.getElementById("home");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/{}[]";
  const FONT_SIZE = 16;

  let width, height, columns, drops, timer;

  function hexToRgba(hex, alpha) {
    hex = hex.replace("#", "").trim();
    if (hex.length === 3) {
      hex = hex.split("").map(function (c) { return c + c; }).join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  function themeColor(varName, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || fallback;
  }

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
    columns = Math.max(1, Math.floor(width / FONT_SIZE));
    drops = new Array(columns).fill(0).map(function () {
      return Math.random() * -40;
    });
  }

  function draw() {
    ctx.fillStyle = hexToRgba(themeColor("--bg", "#2b2318"), 0.08);
    ctx.fillRect(0, 0, width, height);

    ctx.font = FONT_SIZE + "px monospace";
    ctx.fillStyle = themeColor("--accent", "#64ffda");

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);

      if (drops[i] * FONT_SIZE > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  window.addEventListener("resize", resize);
  resize();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    timer = setInterval(draw, 45);
  }
})();
