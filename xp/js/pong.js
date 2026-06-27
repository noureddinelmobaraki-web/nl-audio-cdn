/* Simple Pong with AI paddle and square "ball" */
export function initPong(win, showNotification) {
  const content = win.querySelector('.window-content') || win.querySelector('.window-body');
  content.innerHTML = "";
  content.style.display = "flex";
  content.style.alignItems = "center";
  content.style.justifyContent = "center";
  content.style.padding = "8px";
  content.style.boxSizing = "border-box";

  // Canvas setup
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  canvas.style.maxWidth = "100%";
  canvas.style.height = "auto";
  canvas.style.background = "#000";
  canvas.style.display = "block";
  content.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Load the retro PressStart2P font and make it available as "PressStart2P"
  (function loadRetroFont() {
    try {
      // If the font file is available locally, register and load it
      const font = new FontFace('PressStart2P', "url('/PressStart2P-Regular.ttf')");
      font.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        console.log('PressStart2P font loaded');
      }).catch((err) => {
        console.warn('PressStart2P font load failed:', err);
      });
    } catch (e) {
      console.warn('FontFace API not available:', e);
    }
  })();

  // Load BEP sound for collisions and scoring
  const bepSound = new Audio('bep.mp3');
  bepSound.preload = 'auto';

  // Pong uses the app icon for branding; no in-game logo image is drawn to keep the canvas focused.

  // Game state
  const paddleW = 10;
  const paddleH = 70;
  const player = { x: 20, y: (canvas.height - paddleH) / 2, vy: 0 };
  const ai = { x: canvas.width - 20 - paddleW, y: (canvas.height - paddleH) / 2, vy: 0 };
  // square ball
  const ball = { x: canvas.width / 2 - 6, y: canvas.height / 2 - 6, w: 12, h: 12, vx: 220, vy: 120 };

  let score = { player: 0, ai: 0 };
  let lastTime = performance.now();
  let running = true;
  let animationId = null;

  function tryPlayBep() {
    try {
      // Clone playback to allow overlapping beps
      const s = bepSound.cloneNode();
      s.volume = 0.9;
      s.play().catch(() => {});
    } catch (e) {
      // ignore
    }
  }

  function resetBall(direction = 1) {
    ball.x = canvas.width / 2 - ball.w / 2;
    ball.y = canvas.height / 2 - ball.h / 2;
    const speed = 200;
    const angle = (Math.random() * 0.5 - 0.25) * Math.PI; // slight angle
    ball.vx = direction * speed * (0.9 + Math.random() * 0.3);
    ball.vy = speed * Math.sin(angle);
    // play a bep on reset to indicate serve
    tryPlayBep();
  }

  // Player input (W/S or touch)
  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  // Touch controls: simple top/bottom half
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const y = (t.clientY - rect.top) * (canvas.height / rect.height);
    player.y = Math.max(0, Math.min(canvas.height - paddleH, y - paddleH / 2));
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const y = (t.clientY - rect.top) * (canvas.height / rect.height);
    player.y = Math.max(0, Math.min(canvas.height - paddleH, y - paddleH / 2));
  }, { passive: false });

  // AI: smooth tracking with predictive element
  function updateAI(dt) {
    // Basic prediction: aim at where ball will be when x reaches AI paddle
    const predictTime = (ai.x - (ball.x + ball.w)) / (ball.vx || 0.0001);
    let targetY;
    if (predictTime > 0 && Math.abs(ball.vx) > 50) {
      targetY = ball.y + ball.h / 2 + ball.vy * predictTime - paddleH / 2;
    } else {
      targetY = ball.y + ball.h / 2 - paddleH / 2;
    }
    // Smooth move towards target
    const speed = 220 + Math.min(200, Math.abs(ball.vx) * 0.6);
    if (ai.y + paddleH / 2 < targetY + 5) ai.y += speed * dt;
    else if (ai.y + paddleH / 2 > targetY - 5) ai.y -= speed * dt;
    ai.y = Math.max(0, Math.min(canvas.height - paddleH, ai.y));
  }

  // Collision helpers
  function rectsOverlap(a, b) {
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  function update(dt) {
    // Player movement
    const moveSpeed = 260;
    if (keys['w'] || keys['arrowup']) player.y -= moveSpeed * dt;
    if (keys['s'] || keys['arrowdown']) player.y += moveSpeed * dt;
    player.y = Math.max(0, Math.min(canvas.height - paddleH, player.y));

    // Ball physics
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Wall bounce
    if (ball.y <= 0) { ball.y = 0; ball.vy = Math.abs(ball.vy); tryPlayBep(); }
    if (ball.y + ball.h >= canvas.height) { ball.y = canvas.height - ball.h; ball.vy = -Math.abs(ball.vy); tryPlayBep(); }

    // Paddle collisions
    const ballRect = { x: ball.x, y: ball.y, w: ball.w, h: ball.h };
    const playerRect = { x: player.x, y: player.y, w: paddleW, h: paddleH };
    const aiRect = { x: ai.x, y: ai.y, w: paddleW, h: paddleH };

    if (rectsOverlap(ballRect, playerRect) && ball.vx < 0) {
      ball.x = player.x + playerRect.w;
      ball.vx = Math.abs(ball.vx) * 1.05; // speed up a bit
      // add spin based on where it hit
      const hit = (ball.y + ball.h / 2) - (player.y + paddleH / 2);
      ball.vy += hit * 5;
      tryPlayBep();
    } else if (rectsOverlap(ballRect, aiRect) && ball.vx > 0) {
      ball.x = ai.x - ball.w;
      ball.vx = -Math.abs(ball.vx) * 1.03;
      const hit = (ball.y + ball.h / 2) - (ai.y + paddleH / 2);
      ball.vy += hit * 4;
      tryPlayBep();
    }

    // Score
    if (ball.x + ball.w < 0) {
      score.ai++;
      tryPlayBep();
      resetBall(1);
      showNotification && showNotification(`AI scores! ${score.player}:${score.ai}`);
    } else if (ball.x > canvas.width) {
      score.player++;
      tryPlayBep();
      resetBall(-1);
      showNotification && showNotification(`You score! ${score.player}:${score.ai}`);
    }

    // Update AI after ball movement to be responsive
    updateAI(dt);
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // background
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // No in-game logo drawing; app icon is used for the Pong shortcut and taskbar.

    // middle dashed line
    ctx.fillStyle = '#fff';
    for (let y = 0; y < canvas.height; y += 24) {
      ctx.fillRect(canvas.width/2 - 2, y + 4, 4, 12);
    }

    // paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x, player.y, paddleW, paddleH);
    ctx.fillRect(ai.x, ai.y, paddleW, paddleH);

    // square ball
    ctx.fillStyle = '#fff';
    ctx.fillRect(ball.x, ball.y, ball.w, ball.h);

    // scores using PressStart2P font (fallback to monospace)
    const fontSize = 16;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `${fontSize}px "PressStart2P", Tahoma, monospace`;
    // draw player score left of center
    ctx.fillText(score.player.toString(), canvas.width/2 - 60, 10);
    // draw ai score right of center
    ctx.fillText(score.ai.toString(), canvas.width/2 + 40, 10);
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    animationId = requestAnimationFrame(loop);
  }

  // start
  resetBall(Math.random() < 0.5 ? 1 : -1);
  lastTime = performance.now();
  animationId = requestAnimationFrame(loop);

  // Clean up on close
  const closeBtn = win.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      running = false;
      if (animationId) cancelAnimationFrame(animationId);
      try { window.removeEventListener('keydown', ()=>{}); } catch(e){}
    });
  }

  // Resize canvas responsively when window resizes (keep internal resolution constant)
  const resizeObserver = new ResizeObserver(() => {
    // no-op, canvas styled with max-width to fit window; logical size stays same for gameplay
  });
  resizeObserver.observe(content);
}