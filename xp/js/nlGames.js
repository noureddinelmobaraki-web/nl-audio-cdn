// nlGames.js
// --------------------------------------------------------------------------
// ADDITIVE community-games integration for the NL Windows XP simulator.
//
// Adds 5 games to the Desktop + Games folder WITHOUT modifying any existing
// file in the system:
//   - Subway Surfers   (iframe)
//   - Level Devel      (iframe)
//   - 99 Nights        (iframe, full game site)
//   - Pong             (local canvas game -> ./pong.js)
//   - Deltarune        (iframe)
//
// How it stays non-invasive:
//   1) Registers the games into window.fileSystem (Games apps + Desktop
//      shortcuts) with a per-item `icon`, exactly the same mechanism the NL
//      songs/pictures already use.
//   2) Opening any of these uses the normal openItem -> createWindow path and
//      lands in windowManager's default case; a MutationObserver then fills
//      that fresh window with the real game content and fixes its icons.
//
// The ONLY wiring needed elsewhere is a single `import "./nlGames.js";` line
// at the end of main.js.
// --------------------------------------------------------------------------

import { fileSystem } from "./system.js";

// Game -> icon file (placed at the xp/ root, same convention as VLC.png etc.)
const GAME_ICONS = {
  "Subway Surfers": "subway-surfers.png",
  "Level Devel": "level-devel.png",
  "99 Nights": "99-nights.jpg",
  "Pong": "pong.png",
  "Deltarune": "deltarune.png",
};

// iframe games -> their source URL. (Pong is local and handled separately.)
const IFRAME_GAMES = {
  "Subway Surfers": "https://g2.igroutka.ru/games/164/ZXLa594fek6p7nVR/10/subway_surfers_classic/",
  "Level Devel": "https://leveldevilfull.com/",
  "99 Nights": "https://99-nightsintheforest.io/",
  "Deltarune": "https://gwynfish.github.io/deltarune/",
};

// Preferred window sizes (mirrors the community versions).
const WINDOW_SIZES = {
  "Subway Surfers": { w: "92vw", h: "80vh" },
  "Level Devel": { w: "900px", h: "600px" },
  "99 Nights": { w: "1000px", h: "700px" },
  "Deltarune": { w: "92vw", h: "80vh" },
  "Pong": { w: "720px", h: "440px" },
};

function isGame(title) {
  return title === "Pong" || Object.prototype.hasOwnProperty.call(IFRAME_GAMES, title);
}

// 1) Register games into the virtual filesystem (idempotent).
function registerGames() {
  const fs = window.fileSystem || fileSystem;
  const root = fs && fs["C:"];
  if (!root || !root.children) return;
  const games = root.children["Games"];
  const desktop = root.children["Desktop"];
  Object.keys(GAME_ICONS).forEach((name) => {
    const icon = GAME_ICONS[name];
    if (games && games.children && !games.children[name]) {
      games.children[name] = { type: "app", program: name, icon: icon };
    }
    if (desktop && desktop.children && !desktop.children[name]) {
      desktop.children[name] = { type: "shortcut", target: "C:/Games/" + name, icon: icon };
    }
  });
}

// 2) Fill a freshly created game window with its real content.
function fillGameWindow(win, title) {
  const body = win.querySelector(".window-content") || win.querySelector(".window-body");
  if (!body) return;

  const size = WINDOW_SIZES[title];
  if (size) {
    win.style.width = size.w;
    win.style.height = size.h;
  }

  if (title === "Pong") {
    import("./pong.js")
      .then((m) => {
        if (m && m.initPong) m.initPong(win, window.showNotification);
      })
      .catch((err) => {
        console.error("Failed to initialize Pong:", err);
        if (window.openErrorWindow) window.openErrorWindow("Failed to open Pong. See console for details.");
      });
  } else if (IFRAME_GAMES[title]) {
    const src = IFRAME_GAMES[title];
    body.innerHTML =
      '<div style="width:100%;height:100%;display:flex;flex-direction:column;">' +
        '<div style="flex:1;overflow:hidden;">' +
          '<iframe src="' + src + '" style="width:100%;height:100%;border:0;" scrolling="auto" allowfullscreen="allowfullscreen"></iframe>' +
        '</div>' +
      '</div>';
  }

  // Fix the title-bar + taskbar icons (default-case windows show a generic icon
  // because getIcon() is looked up by program name, not by the filesystem item).
  const iconFile = GAME_ICONS[title];
  if (iconFile) {
    const titleImg = win.querySelector(".title-bar img");
    if (titleImg) titleImg.src = iconFile;
    const id = win.dataset && win.dataset.id;
    if (id) {
      const tbImg = document.querySelector('.taskbar-button[data-id="' + id + '"] img');
      if (tbImg) tbImg.src = iconFile;
    }
  }
}

// 3) Watch for game windows being created and inject their content.
function watchForGameWindows() {
  const desktop = document.querySelector(".desktop");
  if (!desktop) return;
  const handled = new WeakSet();

  const tryHandle = (node) => {
    if (!(node instanceof HTMLElement)) return;
    if (!node.classList || !node.classList.contains("window")) return;
    if (handled.has(node)) return;
    const title = node.dataset && node.dataset.title;
    if (title && isGame(title)) {
      handled.add(node);
      // Defer one tick so the window body/innerHTML is fully in place.
      setTimeout(() => fillGameWindow(node, title), 0);
    }
  };

  const obs = new MutationObserver((mutations) => {
    mutations.forEach((mu) => {
      if (mu.addedNodes) mu.addedNodes.forEach(tryHandle);
    });
  });
  obs.observe(desktop, { childList: true });
}

function init() {
  registerGames();
  if (window.updateDesktopIcons) window.updateDesktopIcons();
  watchForGameWindows();
}

// Register as early as possible so the games exist before the first desktop paint.
registerGames();

if (document.readyState === "loading") {
  // Run after init.js finishes its own DOMContentLoaded work.
  document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0));
} else {
  setTimeout(init, 0);
}
