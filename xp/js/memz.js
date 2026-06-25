// MEMZ Trojan (simulated, non-destructive): closer to the original sequence.
// Sequence:
// 1) Immediately opens Notepad with the MEMZ message.
// 2) After ~20s: starts error popups "still using this computer?" (less frequent)
// 3) After ~40s: random Windows error sounds
// 4) After ~70s: cursor leaves a trail of error icons (error.png) that linger before popping out
// 5) After ~100s: random programs begin opening periodically
//
// Note: "Trying to kill MEMZ will cause your system to be destroyed instantly" —
// if stopMemzVirus() is called, we instantly throw a faux BSOD.

import { openErrorWindow } from "./errorWindow.js";
import { showBSOD } from "./bsod.js";

let memzActive = false;
let timers = [];
let cleanups = [];

// Utility helpers
function every(ms, fn) {
  const id = setInterval(fn, ms);
  timers.push(id);
  return id;
}
function once(ms, fn) {
  const id = setTimeout(fn, ms);
  timers.push(id);
  return id;
}
function cleanup(fn) {
  cleanups.push(fn);
}
function safeAudio(src, volume = 1, rate = 1) {
  try {
    const a = new Audio(src);
    a.volume = volume;
    a.playbackRate = rate;
    a.play().catch(() => {});
    return a;
  } catch(e) { return null; }
}

export function startMemzVirus() {
  if (memzActive) return;
  memzActive = true;
  try { localStorage.setItem('memz_ran', '1'); } catch {}
  
  // 1) Immediately open Notepad with the MEMZ message (and title)
  const note = window.createWindow("Notepad");
  const msg = `YOUR COMPUTER HAS BEEN F***ED BY THE MEMZ TROJAN.

Your computer won't boot up again, so use it as long as you can! :D

Trying to kill MEMZ will cause your system to be destroyed instantly, so don't try it :D`;
  // Set dataset before Notepad init runs
  note.dataset.filePath = "C:/Users/User/Documents/MEMZ_README.txt";
  note.dataset.filecontent = msg;

  // NEW PAYLOAD (soon after Notepad): Open IE windows with weird Google searches (slowly, forever ~ every 20s)
  once(5000, () => {
    if (!memzActive) return;
    const queries = [
      "what happens if you delete system32",
      "bonzi buddy download free",
      "batch virus download",
      "my computer is doing weird things what is happenin plz halp",
      "how to stop trojan horse memz",
      "why is my screen glitching colors help",
      "is it safe to delete windows folder",
      "free ram download no virus"
    ];

    const openIEWithQuery = (q) => {
      const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      const ieWin = window.createWindow("Internet Explorer");
      // Wait for IE to set up its DOM
      setTimeout(() => {
        if (!document.body.contains(ieWin)) return;
        const urlBar = ieWin.querySelector('#url-bar');
        const goBtn = ieWin.querySelector('#go-btn');
        if (urlBar && goBtn) {
          urlBar.value = url;
          goBtn.click();
        }
      }, 400);
    };

    // Forever (until memzActive is false), open one every ~20s with slight jitter
    every(20000, () => {
      if (!memzActive) return;
      const q = queries[Math.floor(Math.random() * queries.length)];
      openIEWithQuery(q);
    });
  });

  // 2) NEW PAYLOAD: Screen color inversion toggle (~every 2s) starts before popups
  once(10000, () => {
    if (!memzActive) return;

    // Create an overlay that inverts colors via mix-blend-mode:difference with a white bg
    const invertOverlay = document.createElement('div');
    invertOverlay.id = 'memz-invert-overlay';
    invertOverlay.style.position = 'fixed';
    invertOverlay.style.top = '0';
    invertOverlay.style.left = '0';
    invertOverlay.style.width = '100%';
    invertOverlay.style.height = '100%';
    invertOverlay.style.pointerEvents = 'none';
    invertOverlay.style.zIndex = '100000';
    invertOverlay.style.mixBlendMode = 'difference';
    invertOverlay.style.background = '#ffffff';
    invertOverlay.style.display = 'none';
    document.body.appendChild(invertOverlay);

    cleanup(() => {
      const el = document.getElementById('memz-invert-overlay');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    let inverted = false;
    every(2000, () => {
      if (!memzActive) return;
      inverted = !inverted;
      invertOverlay.style.display = inverted ? 'block' : 'none';
    });
  });

  // 3) After ~20 seconds: start error popups ("still using this computer?") — much less frequent
  once(20000, () => {
    if (!memzActive) return;
    const POPUP_MIN = 25000;
    const POPUP_JITTER = 10000;
    const spawnPopup = () => {
      if (!memzActive) return;
      openErrorWindow("still using this computer?", true, { variant: 'alert' });
      const nextIn = POPUP_MIN + Math.floor(Math.random() * POPUP_JITTER);
      once(nextIn, spawnPopup);
    };
    spawnPopup();
  });

  // 4) After ~40 seconds: random Windows error sounds
  once(40000, () => {
    if (!memzActive) return;
    every(3000, () => {
      if (!memzActive) return;
      const src = Math.random() < 0.5 ? "Windows XP Error Sound.mp3" : "exclamation.wav";
      safeAudio(src, 0.9, 1);
    });
  });

  // 5) After ~70 seconds: trail of error icons — keep a trail (no animation), then pop out after ~0.8–1.6s
  once(70000, () => {
    if (!memzActive) return;
    let lastSpawn = 0;
    const minDeltaMs = 20; // throttle spawning a bit so we get a trail instead of flicker
    const onMove = (e) => {
      if (!memzActive) return;
      const now = performance.now();
      if (now - lastSpawn < minDeltaMs) return;
      lastSpawn = now;

      const img = document.createElement('img');
      img.src = "error.png";
      img.alt = "error";
      img.style.position = 'fixed';
      const jitterX = (Math.random() * 12 - 6);
      const jitterY = (Math.random() * 12 - 6);
      img.style.left = (e.clientX + jitterX) + 'px';
      img.style.top = (e.clientY + jitterY) + 'px';
      img.style.width = '20px';
      img.style.height = '20px';
      img.style.pointerEvents = 'none';
      img.style.zIndex = '9999';
      document.body.appendChild(img);

      // Keep each icon around briefly to create a proper trail, then remove instantly (no animation)
      const life = 800 + Math.floor(Math.random() * 800); // 0.8s to 1.6s
      setTimeout(() => img.remove(), life);
    };
    document.addEventListener('mousemove', onMove);
    cleanup(() => document.removeEventListener('mousemove', onMove));

    // Also: randomly place many Alert.png icons that linger for a long time
    const spawnAlertIcon = () => {
      const img = document.createElement('img');
      img.src = "Alert.png"; img.alt = "alert";
      Object.assign(img.style, { position:'fixed', left: Math.random()* (window.innerWidth-40)+'px',
        top: Math.random()* (window.innerHeight-40)+'px', width:'28px', height:'28px',
        pointerEvents:'none', zIndex:'9998', opacity:'0.95' });
      document.body.appendChild(img);
      setTimeout(() => img.remove(), 30000 + Math.random()*60000); // 30–90s
    };
    for (let i = 0; i < 20; i++) spawnAlertIcon();
    const alertInterval = setInterval(spawnAlertIcon, 1500);
    cleanup(() => clearInterval(alertInterval));
  });

  // 6) After ~100 seconds: start opening random programs periodically
  once(100000, () => {
    if (!memzActive) return;
    every(8000, () => {
      if (!memzActive) return;
      tryOpenRandomProgram();
    });
  });

  // 7) FINAL PAYLOAD (~130s): Tunnel effect (recursive screen duplication)
  //    Attempts to snapshot the current screen and then continuously draw it
  //    into a slightly smaller rectangle in the center, creating a tunnel.
  once(130000, async () => {
    if (!memzActive) return;

    // Ensure html2canvas is available
    async function ensureHtml2Canvas() {
      if (window.html2canvas) return;
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    try {
      await ensureHtml2Canvas();
    } catch (e) {
      console.warn("MEMZ tunnel: failed to load html2canvas. Falling back to simple scale loop.", e);
    }

    if (!memzActive) return;

    const overlay = document.createElement('canvas');
    overlay.id = 'memz-tunnel-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '100001';
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
    document.body.appendChild(overlay);

    const ctx = overlay.getContext('2d');
    const temp = document.createElement('canvas');
    temp.width = overlay.width;
    temp.height = overlay.height;
    const tempCtx = temp.getContext('2d');

    // Take an initial snapshot of the page (best effort)
    async function snapshotBase() {
      try {
        const canvas = await window.html2canvas(document.body, {
          backgroundColor: null,
          useCORS: true,
          scale: 1
        });
        return canvas;
      } catch (e) {
        console.warn("MEMZ tunnel: snapshot failed, using blank base.", e);
        const blank = document.createElement('canvas');
        blank.width = overlay.width;
        blank.height = overlay.height;
        const bctx = blank.getContext('2d');
        bctx.fillStyle = '#000';
        bctx.fillRect(0, 0, blank.width, blank.height);
        return blank;
      }
    }

    let base = await snapshotBase();
    if (!memzActive) return;

    // Periodically refresh the base snapshot so the tunnel picks up changes
    const baseRefreshId = every(5000, async () => {
      if (!memzActive) return;
      base = await snapshotBase();
    });
    cleanup(() => clearInterval(baseRefreshId));

    // Seed the overlay with the base snapshot
    ctx.drawImage(base, 0, 0, overlay.width, overlay.height);

    let rafId = null;
    const scale = 0.96; // shrink each iteration
    function animate() {
      if (!memzActive) return;

      // Copy current overlay to temp (previous frame)
      tempCtx.clearRect(0, 0, temp.width, temp.height);
      tempCtx.drawImage(overlay, 0, 0);

      // Compute scaled rect
      const nw = overlay.width * scale;
      const nh = overlay.height * scale;
      const dx = (overlay.width - nw) / 2;
      const dy = (overlay.height - nh) / 2;

      // IMPORTANT: Draw the base snapshot first to fully cover the canvas each frame,
      // then draw the previous frame scaled down on top to create the tunnel.
      ctx.drawImage(base, 0, 0, overlay.width, overlay.height);
      ctx.drawImage(temp, dx, dy, nw, nh);

      rafId = requestAnimationFrame(animate);
    }

    animate();

    // Handle resizes
    const onResize = () => {
      overlay.width = window.innerWidth;
      overlay.height = window.innerHeight;
      temp.width = overlay.width;
      temp.height = overlay.height;
      // Re-seed with base
      ctx.drawImage(base, 0, 0, overlay.width, overlay.height);
    };
    window.addEventListener('resize', onResize);
    cleanup(() => window.removeEventListener('resize', onResize));

    // Cleanup for this payload
    cleanup(() => {
      if (rafId) cancelAnimationFrame(rafId);
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
  });

  if (window.showNotification) {
    window.showNotification("MEMZ has started. Enjoy the chaos.");
  }
}

// Attempts to open a random program from Apps or Games (excluding known dangerous ones)
function tryOpenRandomProgram() {
  const fs = window.fileSystem?.['C:']?.children;
  if (!fs) return;

  const blocked = new Set([
    'BSOD Creator', 'Error Takeover', 'You Are An Idiot', 'Antivirus 2003',
    'Task Manager', 'Control Panel', 'VirtualBox', 'BonziBuddy'
  ]);

  const choices = [];

  const addFolderApps = (folderName) => {
    const folder = fs[folderName];
    if (folder && folder.children) {
      Object.keys(folder.children).forEach(k => {
        const v = folder.children[k];
        if (v && v.type === 'app') {
          // Filter
          const name = v.program || k;
          if (!blocked.has(name)) {
            choices.push({ folder: folderName, name });
          }
        }
      });
    }
  };

  addFolderApps('Apps');
  addFolderApps('Games');

  if (choices.length === 0) return;
  const pick = choices[Math.floor(Math.random() * choices.length)];
  // Open by path
  const base = pick.folder === 'Apps' ? `C:/Apps/${pick.name}/` : `C:/Games/${pick.name}/`;
  if (window.openItem) {
    window.openItem(base);
  }
}

// If the user or another script tries to stop MEMZ, we "destroy instantly" (fake BSOD).
export function stopMemzVirus() {
  if (!memzActive) return;
  memzActive = false;

  // Clear timers and cleanups first
  timers.forEach(id => {
    clearInterval(id);
    clearTimeout(id);
  });
  timers = [];
  cleanups.forEach(fn => { try { fn(); } catch(e) {} });
  cleanups = [];

  // Show faux BSOD per "destroyed instantly"
  const content = `A problem has been detected and Windows has been shut down to prevent damage
to your computer.

MEMZ_TROJAN_TERMINATED

Trying to terminate MEMZ resulted in an unrecoverable error (by design).

Technical information:

*** STOP: 0x000000MEMZ (0xDEADCAFE, 0xDEADC0DE, 0xC0FFEEEE, 0x1337C0DE)`;
  showBSOD(content, () => {
    // Simulate "won't boot again" feeling: just reload to reset the sim
    window.location.reload();
  }, "Restart");
}