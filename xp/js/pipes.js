// 3D Pipes — original vanilla-JS screensaver for the NL XP system.
// Self-contained: Canvas 2D with a hand-rolled 3D perspective projection and
// painter's-algorithm depth sorting. No external libraries (works offline).
//
// Integration: registered in system.js (C:/Games/3D Pipes), icon in icons.js
// ("3d pipes"), launched via createWindow('3D Pipes') -> window.initPipes.

export function initPipes(win, showNotification) {
  const content = win.querySelector('.window-content') || win.querySelector('.window-body');
  if (!content) return;
  content.innerHTML = '';
  content.style.cssText = 'display:flex;flex-direction:column;height:100%;width:100%;background:#000;overflow:hidden;font-family:Tahoma,"Segoe UI",Arial,sans-serif;';

  // ---- Toolbar ----
  const bar = document.createElement('div');
  bar.style.cssText = 'flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:5px 8px;background:linear-gradient(#f5f6f8,#dfe4ec);border-bottom:1px solid #9aa3b0;font-size:12px;color:#222;';
  const btnCss = 'height:24px;padding:0 10px;border:1px solid #8a93a0;border-radius:4px;background:linear-gradient(#ffffff,#e4e8ef);cursor:pointer;font-size:12px;color:#222;';
  const restartBtn = document.createElement('button'); restartBtn.textContent = 'إعادة تشغيل'; restartBtn.style.cssText = btnCss;
  const speedLabel = document.createElement('span'); speedLabel.textContent = 'السرعة';
  const speed = document.createElement('input'); speed.type = 'range'; speed.min = '0'; speed.max = '100'; speed.value = '45'; speed.style.width = '120px';
  bar.append(restartBtn, speedLabel, speed);

  // ---- Canvas ----
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'flex:1 1 auto;display:block;width:100%;min-height:0;background:radial-gradient(circle at 50% 40%, #0b1230, #000);';
  content.append(bar, canvas);
  const ctx = canvas.getContext('2d');

  // ---- Config ----
  const GRID = 12;
  const DIRS = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  const PALETTE = ['#e74c3c','#2ecc71','#3498db','#f1c40f','#e67e22','#9b59b6','#1abc9c','#ff7eb6','#56ccf2','#c0e218'];
  const FILL_LIMIT = Math.floor(GRID * GRID * GRID * 0.30);

  let occupied, pipes, yaw, pitch = -0.5, phase, phaseUntil, lastStep, rafId = null;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function key(x, y, z) { return x + ',' + y + ',' + z; }
  function inBounds(x, y, z) { return x >= 0 && x < GRID && y >= 0 && y < GRID && z >= 0 && z < GRID; }
  function rand(n) { return Math.floor(Math.random() * n); }

  function freeNeighbors(p) {
    const out = [];
    for (const d of DIRS) {
      const x = p.x + d[0], y = p.y + d[1], z = p.z + d[2];
      if (inBounds(x, y, z) && !occupied.has(key(x, y, z))) out.push({ d, x, y, z });
    }
    return out;
  }

  function spawnPipe() {
    let cell = null;
    for (let t = 0; t < 60; t++) {
      const x = rand(GRID), y = rand(GRID), z = rand(GRID);
      if (!occupied.has(key(x, y, z))) { cell = { x, y, z }; break; }
    }
    if (!cell) return null;
    occupied.add(key(cell.x, cell.y, cell.z));
    const pipe = { color: PALETTE[rand(PALETTE.length)], points: [cell], dir: DIRS[rand(DIRS.length)], alive: true };
    pipes.push(pipe);
    return pipe;
  }

  function extend(pipe) {
    const head = pipe.points[pipe.points.length - 1];
    const opts = freeNeighbors(head);
    if (opts.length === 0) { pipe.alive = false; return; }
    // 70% chance to keep going straight if possible (classic pipe feel)
    let choice = null;
    if (Math.random() < 0.7) {
      choice = opts.find(o => o.d[0] === pipe.dir[0] && o.d[1] === pipe.dir[1] && o.d[2] === pipe.dir[2]);
    }
    if (!choice) choice = opts[rand(opts.length)];
    occupied.add(key(choice.x, choice.y, choice.z));
    pipe.points.push({ x: choice.x, y: choice.y, z: choice.z });
    pipe.dir = choice.d;
  }

  function reset() {
    occupied = new Set();
    pipes = [];
    phase = 'grow';
    phaseUntil = 0;
    lastStep = 0;
    spawnPipe(); spawnPipe();
  }

  function step(now) {
    if (phase === 'full') {
      if (now >= phaseUntil) reset();
      return;
    }
    let aliveCount = 0;
    for (const p of pipes) { if (p.alive) { extend(p); if (p.alive) aliveCount++; } }
    // keep about two pipes growing
    while (pipes.filter(p => p.alive).length < 2 && occupied.size < FILL_LIMIT) {
      if (!spawnPipe()) break;
    }
    if (occupied.size >= FILL_LIMIT) { phase = 'full'; phaseUntil = now + 2200; }
  }

  // ---- 3D projection ----
  let cx, cy, focal, camDist;
  function project(pt) {
    const c = (GRID - 1) / 2;
    let x = pt.x - c, y = pt.y - c, z = pt.z - c;
    // yaw (around Y)
    const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
    let x1 = x * cyaw - z * syaw;
    let z1 = x * syaw + z * cyaw;
    let y1 = y;
    // pitch (around X)
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    let y2 = y1 * cp - z1 * sp;
    let z2 = y1 * sp + z1 * cp;
    const depth = z2 + camDist;
    const scale = focal / Math.max(0.1, depth);
    return { x: cx + x1 * scale, y: cy + y2 * scale, depth: depth, scale: scale };
  }

  function shade(hex, factor) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r * factor); g = Math.round(g * factor); b = Math.round(b * factor);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 600, h = canvas.clientHeight || 400;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    cx = canvas.width / 2; cy = canvas.height / 2;
    camDist = GRID * 1.9;
    focal = Math.min(canvas.width, canvas.height) * 0.95;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // project + sort pipes far-to-near by average depth
    const drawables = pipes.map(p => {
      const pts = p.points.map(project);
      let sum = 0; for (const q of pts) sum += q.depth;
      return { pts: pts, color: p.color, avg: sum / Math.max(1, pts.length) };
    });
    drawables.sort((a, b) => b.avg - a.avg);

    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const d of drawables) {
      if (d.pts.length < 1) continue;
      const avgScale = focal / Math.max(0.1, d.avg);
      const lw = Math.max(2 * dpr, avgScale * 0.34);
      const depthFactor = Math.max(0.35, Math.min(1.1, (camDist + GRID) / (d.avg + GRID)));
      // pipe body
      ctx.strokeStyle = shade(d.color, 0.85 * depthFactor);
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(d.pts[0].x, d.pts[0].y);
      for (let i = 1; i < d.pts.length; i++) ctx.lineTo(d.pts[i].x, d.pts[i].y);
      ctx.stroke();
      // ball joints (classic 3D Pipes look)
      ctx.fillStyle = shade(d.color, 1.05 * depthFactor);
      for (const q of d.pts) {
        ctx.beginPath();
        ctx.arc(q.x, q.y, lw * 0.62, 0, Math.PI * 2);
        ctx.fill();
      }
      // subtle highlight on first joint
    }
  }

  function frame(now) {
    if (!document.body.contains(canvas)) { if (rafId) cancelAnimationFrame(rafId); return; }
    const sp = parseInt(speed.value, 10) / 100;
    yaw += 0.0035 + sp * 0.012;
    const stepInterval = 200 - sp * 150; // faster slider -> faster growth
    if (now - lastStep >= stepInterval) { step(now); lastStep = now; }
    draw();
    rafId = requestAnimationFrame(frame);
  }

  restartBtn.onclick = () => { reset(); };

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  // initial sizing may be 0 until layout settles; retry shortly
  resize();
  setTimeout(resize, 60);
  reset();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(frame);
}
