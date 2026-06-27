// nlWallpaper.js
// --------------------------------------------------------------------------
// ADDITIVE "Change Wallpaper" desktop icon for the NL Windows XP simulator.
//
// Behaviour (per request):
//   - Adds ONE attractive desktop icon (\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062e\u0644\u0641\u064a\u0629 = Change Wallpaper).
//   - Clicking it does NOT open any window or thumbnails. It simply:
//       1) plays a short animation on the icon, and
//       2) instantly switches the desktop background to the next wallpaper
//          with a smooth crossfade.
//   - The chosen wallpaper is remembered (localStorage) and re-applied on load.
//
// Background switching uses exactly the documented mechanism: setting the
// `.desktop` element's backgroundImage (same as the built-in Control Panel),
// with an additional non-destructive crossfade overlay for a clean transition.
//
// Non-invasive: brand-new module. The only wiring is one `import` line added at
// the end of main.js. No existing file/behaviour is modified or removed. The
// icon is self-managed in the DOM (it is NOT registered as a filesystem app),
// so it never triggers the window-opening flow.
// --------------------------------------------------------------------------

import { findNextAvailablePosition, makeDraggable } from "./desktop.js";

const APP_TITLE = "\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062e\u0644\u0641\u064a\u0629"; // "تغيير الخلفية"
const ICON = "wallpaper-changer.png";
const STORAGE_KEY = "nl_wallpaper_choice";
const MARK = "nlWallpaper"; // dataset flag to recognise our own icon

// The wallpapers live in the folder "xp BG imgs" at the repository ROOT, named
// 1.webp .. 30.webp. The /xp/ page is one level below the root, and GitHub
// Pages publishes the whole repo, so the correct relative path is:
//   ../xp BG imgs/<n>.webp
const WALLPAPER_DIR = "xp BG imgs";
const WALLPAPER_COUNT = 30;

const WALLPAPERS = (function () {
  const list = [];
  for (let i = 1; i <= WALLPAPER_COUNT; i++) list.push(WALLPAPER_DIR + "/" + i + ".webp");
  return list;
})();

function wallpaperUrl(name) {
  // Encode each path segment but keep the "/" separators.
  return "../" + name.split("/").map(encodeURIComponent).join("/");
}

function labelFor(name) {
  return name.split("/").pop().replace(/\.webp$/i, ""); // "7"
}

// ---- one-time CSS for the icon activation animation -----------------------
function injectStyleOnce() {
  if (document.getElementById("nl-wp-style")) return;
  const st = document.createElement("style");
  st.id = "nl-wp-style";
  st.textContent =
    "@keyframes nlWpPop{" +
    "0%{transform:scale(1) rotate(0)}" +
    "25%{transform:scale(1.22) rotate(-9deg)}" +
    "55%{transform:scale(.9) rotate(7deg)}" +
    "80%{transform:scale(1.06) rotate(-3deg)}" +
    "100%{transform:scale(1) rotate(0)}}" +
    ".nl-wp-anim{animation:nlWpPop .5s ease;" +
    "filter:drop-shadow(0 0 6px rgba(80,180,255,.95)) drop-shadow(0 0 14px rgba(80,180,255,.6))}";
  document.head.appendChild(st);
}

// ---- background switching --------------------------------------------------
function setDesktopBg(desktop, url) {
  desktop.style.backgroundImage = "url('" + url + "')";
  desktop.style.backgroundSize = "cover";
  desktop.style.backgroundPosition = "center";
  desktop.style.backgroundRepeat = "no-repeat";
}

function applyWallpaper(url, animate) {
  const desktop = document.querySelector(".desktop");
  if (!desktop) return;

  if (!animate) {
    setDesktopBg(desktop, url);
    return;
  }

  // Make sure absolutely-positioned overlay is anchored to the desktop.
  if (getComputedStyle(desktop).position === "static") desktop.style.position = "relative";

  // Crossfade: a temporary overlay (under the icons, click-through) fades in
  // the new image, then we commit it to the desktop and remove the overlay.
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:absolute;left:0;top:0;right:0;bottom:0;" +
    "background-image:url('" + url + "');" +
    "background-size:cover;background-position:center;background-repeat:no-repeat;" +
    "opacity:0;transition:opacity .45s ease;pointer-events:none;z-index:0;";
  // Insert as the FIRST child so existing desktop icons stay painted on top.
  desktop.insertBefore(overlay, desktop.firstChild);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    setDesktopBg(desktop, url);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };
  overlay.addEventListener("transitionend", finish, { once: true });
  // Fallback in case transitionend doesn't fire.
  setTimeout(finish, 800);
  // Kick off the fade on the next frame.
  requestAnimationFrame(() => requestAnimationFrame(() => { overlay.style.opacity = "1"; }));
}

function currentIndex() {
  try {
    return WALLPAPERS.indexOf(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return -1;
  }
}

function restoreSaved() {
  const i = currentIndex();
  if (i !== -1) applyWallpaper(wallpaperUrl(WALLPAPERS[i]), false);
}

function animateIcon(iconEl) {
  const img = iconEl && iconEl.querySelector("img");
  if (!img) return;
  img.classList.remove("nl-wp-anim");
  // force reflow so the animation can restart on rapid clicks
  void img.offsetWidth;
  img.classList.add("nl-wp-anim");
  const clear = () => img.classList.remove("nl-wp-anim");
  img.addEventListener("animationend", clear, { once: true });
  setTimeout(clear, 700);
}

function activate(iconEl) {
  let idx = currentIndex();
  idx = (idx + 1) % WALLPAPERS.length; // -1 -> 0 on first use
  const name = WALLPAPERS[idx];
  applyWallpaper(wallpaperUrl(name), true);
  try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
  animateIcon(iconEl);
  if (window.showNotification) {
    window.showNotification("\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u062e\u0644\u0641\u064a\u0629 \u0633\u0637\u062d \u0627\u0644\u0645\u0643\u062a\u0628 (" + labelFor(name) + "/" + WALLPAPER_COUNT + ")");
  }
}

// ---- the desktop icon ------------------------------------------------------
function bindActivation(iconEl) {
  let downX = 0, downY = 0, moved = false;

  iconEl.addEventListener("mousedown", (e) => { downX = e.clientX; downY = e.clientY; moved = false; });
  iconEl.addEventListener("mousemove", (e) => {
    if (Math.abs(e.clientX - downX) > 5 || Math.abs(e.clientY - downY) > 5) moved = true;
  });
  iconEl.addEventListener("click", (e) => {
    e.stopPropagation();
    // mark as selected (XP look) but do not open anything
    document.querySelectorAll(".icons .icon.selected").forEach((el) => el.classList.remove("selected"));
    iconEl.classList.add("selected");
    if (!moved) activate(iconEl);
  });
  // also support a double-click (won't double-fire harmfully; just cycles again)
  iconEl.addEventListener("dblclick", (e) => { e.preventDefault(); });

  // Touch: a clean tap (no drag) cycles the wallpaper.
  let tStartX = 0, tStartY = 0, tMoved = false;
  iconEl.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    tStartX = e.touches[0].clientX; tStartY = e.touches[0].clientY; tMoved = false;
  }, { passive: true });
  iconEl.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (Math.abs(t.clientX - tStartX) > 10 || Math.abs(t.clientY - tStartY) > 10) tMoved = true;
  }, { passive: true });
  iconEl.addEventListener("touchend", (e) => {
    if (tMoved) return;
    e.preventDefault();
    document.querySelectorAll(".icons .icon.selected").forEach((el) => el.classList.remove("selected"));
    iconEl.classList.add("selected");
    activate(iconEl);
  });
}

function createIcon(container) {
  const icon = document.createElement("div");
  icon.className = "icon";
  icon.dataset[MARK] = "1";
  icon.innerHTML = '<img src="' + ICON + '" alt=""><span>' + APP_TITLE + "</span>";
  container.appendChild(icon);

  const pos = findNextAvailablePosition();
  icon.style.position = "absolute";
  icon.style.left = pos.left + "px";
  icon.style.top = pos.top + "px";

  makeDraggable(icon);   // reuse the system's real drag/snap behaviour
  bindActivation(icon);  // our click-to-cycle behaviour
  return icon;
}

// Ensure our icon exists. updateDesktopIcons() clears .icons innerHTML when it
// re-renders, so we re-add ourselves whenever we go missing.
function ensureIcon() {
  const container = document.querySelector(".icons");
  if (!container) return;
  const existing = container.querySelector('.icon[data-' + MARK.toLowerCase() + '="1"]') ||
    Array.from(container.querySelectorAll(".icon")).find((ic) => ic.dataset && ic.dataset[MARK] === "1");
  if (existing) return;
  createIcon(container);
}

function watchIconsContainer() {
  const container = document.querySelector(".icons");
  if (!container) return;
  const obs = new MutationObserver(() => {
    // If our icon was removed by a desktop re-render, put it back.
    const present = Array.from(container.querySelectorAll(".icon")).some(
      (ic) => ic.dataset && ic.dataset[MARK] === "1"
    );
    if (!present) ensureIcon();
  });
  obs.observe(container, { childList: true });
}

function init() {
  injectStyleOnce();
  ensureIcon();
  watchIconsContainer();
  restoreSaved();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0));
} else {
  setTimeout(init, 0);
}
