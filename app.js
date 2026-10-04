var typed = new Typed('#element', {
      strings: ['Full-Stack developer','ML Engineer...'],
      typeSpeed: 50,
});



// themes.js: animated backgrounds + theme switcher (Vesper + Obsidian)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // remove layers from the older snippet, then create fresh ones
  document.querySelectorAll("#smoke,.light,.grain,.themeSwitch").forEach(e => e.remove());
  const cv = Object.assign(document.createElement("canvas"), { id: "smoke" });
  const light = Object.assign(document.createElement("div"), { className: "light" });
  const grain = Object.assign(document.createElement("div"), { className: "grain" });
  document.body.prepend(grain, light, cv);

  const ctx = cv.getContext("2d");
  let W, H;
  const fit = () => { W = cv.width = innerWidth / 2; H = cv.height = innerHeight / 2; };
  addEventListener("resize", fit); fit();

  // cursor glow + mouse position
  const root = document.documentElement;
  let mx = -999, my = -999, tx = innerWidth * .5, ty = innerHeight * .4, cx = tx, cy = ty;
  addEventListener("pointermove", e => { tx = mx = e.clientX; ty = my = e.clientY; });
  (function ease() {
    cx += (tx - cx) * .06; cy += (ty - cy) * .06;
    root.style.setProperty("--mx", cx + "px");
    root.style.setProperty("--my", cy + "px");
    requestAnimationFrame(ease);
  })();

  // ---------- backgrounds ----------
  // soft drifting colour clouds. item: [rgb, alpha, radius, speedX, speedY, phaseX, phaseY]
  const clouds = (base, list) => t => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
    for (const [c, a, r, sx, sy, px, py] of list) {
      const x = W * (.5 + .4 * Math.sin(t * sx * 6 + px));
      const y = H * (.5 + .4 * Math.cos(t * sy * 6 + py));
      const R = Math.max(W, H) * r;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  };

  const vesper = clouds("#120d16", [
    ["47,111,106", .55, .6, .00021, .00017, 0, 1],
    ["120,50,150", .65, .6, .00016, .00023, 2, 4],
    ["201,164,106", .20, .4, .00027, .00019, 5, 2],
    ["70,30,95", .6, .7, .00012, .00015, 3, 6]
  ]);

  // rising gold dust that links up near the cursor
  const dust = Array.from({ length: 70 }, () => ({
    x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + .4, v: Math.random() * .0004 + .0001, p: Math.random() * 6
  }));
  const gold = t => {
    ctx.fillStyle = "#0b0a08"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H * 1.15, 0, W / 2, H * 1.15, H * 1.1);
    g.addColorStop(0, "rgba(224,184,103,.26)"); g.addColorStop(1, "rgba(224,184,103,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const pts = dust.map(d => {
      d.y -= d.v; if (d.y < 0) d.y = 1;
      const x = d.x * W + Math.sin(t * .0005 + d.p) * 10, y = d.y * H;
      ctx.fillStyle = `rgba(240,205,130,${.35 + .4 * Math.sin(t * .002 + d.p)})`;
      ctx.beginPath(); ctx.arc(x, y, d.r, 0, 7); ctx.fill();
      return [x, y];
    });
    pts.push([mx / 2, my / 2]);
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d < 70) {
        ctx.strokeStyle = `rgba(224,184,103,${(1 - d / 70) * .35})`;
        ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); ctx.stroke();
      }
    }
  };

  const draw = { vesper, gold };
  let current = "vesper";
  requestAnimationFrame(function loop(t) { draw[current](reduce ? 0 : t); requestAnimationFrame(loop); });

  // ---------- switcher ----------
  const defs = [["vesper", "Vesper", "#c9a46a"], ["gold", "Obsidian", "#e0b867"]];
  const bar = Object.assign(document.createElement("div"), { className: "themeSwitch" });
  bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Theme");
  for (const [id, label, c] of defs) {
    const b = document.createElement("button");
    b.title = label; b.setAttribute("aria-label", label + " theme");
    b.dataset.id = id; b.style.setProperty("--c", c);
    b.onclick = () => set(id);
    bar.append(b);
  }
  document.body.append(bar);

  function set(id) {
    current = id; root.dataset.theme = id;
    try { localStorage.setItem("theme", id); } catch (e) {}
    bar.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === id));
  }
  let saved = "vesper";
  try { saved = localStorage.getItem("theme") || "vesper"; } catch (e) {}
  set(draw[saved] ? saved : "vesper");
})();