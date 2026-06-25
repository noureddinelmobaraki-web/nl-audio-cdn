// NL PLAYER \u2014 an in-window browser/media player for the XP system.
//
// IMPORTANT TECHNICAL NOTE (why we use embeddable sources):
// A web page CANNOT bypass a remote site's X-Frame-Options / CSP frame-ancestors
// from client-side JavaScript \u2014 the BROWSER ENGINE itself refuses to render such
// framed content, no matter what "browser" wrapper we build around the <iframe>.
// So playimdb (which sends those headers) can never render inside this window.
// The only way to truly PLAY IN-WINDOW is to use providers that intentionally
// ALLOW embedding (vidsrc, 2embed, vidify, ...). NL PLAYER therefore:
//   - auto-loads an embeddable source in the <iframe> (real in-window playback),
//   - lets the user switch sources if one is down,
//   - keeps "open in browser" (playimdb) as the site's proven fallback.
//
// Timing-safe bridge: openNlPlayer() fills _nlpPending BEFORE createWindow() runs
// so initNlPlayer() resolves the right data even if the window manager inits the
// window synchronously (before win.dataset is assigned).
var _nlpPending = null;

function nlpEsc(s) {
  return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function initNlPlayer(win, showNotification) {
  var content = win.querySelector(".window-content");
  if (!content) return;

  var startUrl = win.dataset.playUrl || (_nlpPending && _nlpPending.url) || "";
  var mediaTitle = win.dataset.movieTitle || (_nlpPending && _nlpPending.title) || "NL PLAYER";
  var sources = null;
  try { sources = win.dataset.playSources ? JSON.parse(win.dataset.playSources) : null; } catch (e) { sources = null; }
  if (!sources) sources = (_nlpPending && _nlpPending.sources) || [];
  if (!Array.isArray(sources)) sources = [];

  if (startUrl) win.dataset.playUrl = startUrl;
  if (mediaTitle) win.dataset.movieTitle = mediaTitle;
  if (sources.length) win.dataset.playSources = JSON.stringify(sources);

  // The first thing we load in the frame: an embeddable source if we have one,
  // otherwise the external URL (which will likely be blocked, handled gracefully).
  var firstFrameUrl = sources.length ? sources[0].url : startUrl;

  var btn = "height:24px;min-width:26px;padding:0 6px;border:1px solid #8a93a0;border-radius:4px;background:linear-gradient(#ffffff,#e4e8ef);cursor:pointer;font-size:13px;color:#222;";
  var btnPrimary = "height:24px;padding:0 10px;border:1px solid #a52a1f;border-radius:4px;background:linear-gradient(#e74c3c,#c0392b);color:#fff;cursor:pointer;font-size:12px;font-weight:bold;";
  var selStyle = "height:24px;padding:0 4px;border:1px solid #8a93a0;border-radius:4px;background:#fff;font-size:12px;color:#1a3c66;cursor:pointer;";

  var srcSelectHtml = sources.length
    ? '<select class="nlp-src" title="\u0627\u0644\u0645\u0635\u062f\u0631" style="' + selStyle + '">' +
        sources.map(function (s) { return '<option value="' + nlpEsc(s.url) + '">' + nlpEsc(s.label) + '</option>'; }).join("") +
      '</select>'
    : "";

  content.style.cssText = "display:flex;flex-direction:column;height:100%;width:100%;background:#1b1b1b;overflow:hidden;";
  content.innerHTML =
    '<div class="nlp-toolbar" style="display:flex;align-items:center;gap:5px;padding:6px 8px;background:linear-gradient(#f5f6f8,#d9dee6);border-bottom:1px solid #9aa3b0;flex:0 0 auto;">' +
      '<button class="nlp-back" title="\u0631\u062c\u0648\u0639" style="' + btn + '">\u25C0</button>' +
      '<button class="nlp-fwd" title="\u062a\u0642\u062f\u0651\u0645" style="' + btn + '">\u25B6</button>' +
      '<button class="nlp-reload" title="\u062a\u062d\u062f\u064a\u062b" style="' + btn + '">\u27F3</button>' +
      '<input class="nlp-url" type="text" spellcheck="false" value="' + nlpEsc(firstFrameUrl) + '" style="flex:1;height:24px;padding:0 8px;border:1px solid #8a93a0;border-radius:11px;font-size:12px;color:#1a3c66;background:#fff;outline:none;"/>' +
      '<button class="nlp-go" style="' + btn + '">\u0627\u0646\u062a\u0642\u0627\u0644</button>' +
      srcSelectHtml +
      '<button class="nlp-full" title="\u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629" style="' + btn + '">\u26F6</button>' +
      '<button class="nlp-ext" style="' + btnPrimary + '">\uD83C\uDF10 \u0641\u062a\u062d \u0641\u064a \u0627\u0644\u0645\u062a\u0635\u0641\u062d</button>' +
    '</div>' +
    '<div class="nlp-viewport" style="position:relative;flex:1 1 auto;background:#000;min-height:0;">' +
      '<iframe class="nlp-frame" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="no-referrer" style="position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;"></iframe>' +
      '<div class="nlp-overlay" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle at 50% 38%,#262626,#000);color:#eee;text-align:center;padding:24px;">' +
        '<div style="font-size:38px;">\uD83C\uDFAC</div>' +
        '<div style="font-size:16px;font-weight:bold;max-width:520px;">' + nlpEsc(mediaTitle) + '</div>' +
        '<div style="font-size:12px;color:#bbb;max-width:480px;line-height:1.8;">\u0627\u0636\u063a\u0637 \u0644\u0628\u062f\u0621 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u062f\u0627\u062e\u0644 \u0627\u0644\u0646\u0627\u0641\u0630\u0629\u060c \u0623\u0648 \u0627\u0641\u062a\u062d \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064a \u0627\u0644\u0645\u062a\u0635\u0641\u062d.</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">' +
          '<button class="nlp-ov-frame" style="background:#2c3e50;color:#fff;border:0;padding:11px 20px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px;">\u25B6 \u062a\u0634\u063a\u064a\u0644 \u062f\u0627\u062e\u0644 \u0627\u0644\u0646\u0627\u0641\u0630\u0629</button>' +
          '<button class="nlp-ov-ext" style="background:#c0392b;color:#fff;border:0;padding:11px 20px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px;">\uD83C\uDF10 \u0641\u062a\u062d \u0641\u064a \u0627\u0644\u0645\u062a\u0635\u0641\u062d</button>' +
        '</div>' +
        '<div class="nlp-ov-url" style="font-size:11px;color:#7f8c8d;word-break:break-all;max-width:520px;">' + nlpEsc(firstFrameUrl) + '</div>' +
      '</div>' +
    '</div>';

  var frame = content.querySelector(".nlp-frame");
  var urlInput = content.querySelector(".nlp-url");
  var overlay = content.querySelector(".nlp-overlay");
  var viewport = content.querySelector(".nlp-viewport");
  var srcSelect = content.querySelector(".nlp-src");

  var history = firstFrameUrl ? [firstFrameUrl] : [];
  var histIndex = history.length - 1;
  var loadTimer = null;

  function currentUrl() {
    var u = (urlInput && urlInput.value ? urlInput.value : "").trim();
    if (!u) u = (firstFrameUrl || startUrl || "").trim();
    return u;
  }

  // "Open in browser" always uses the external (playimdb) URL when present \u2014 the
  // exact method the real site uses \u2014 else falls back to whatever is in the bar.
  function openExternal() {
    var u = (startUrl || "").trim() || currentUrl();
    if (u) window.open(u, "_blank", "noopener,noreferrer");
    else if (showNotification) showNotification("NL PLAYER", "\u0644\u0627 \u064a\u0648\u062c\u062f \u0631\u0627\u0628\u0637 \u0644\u0644\u062a\u0634\u063a\u064a\u0644");
  }

  function showLoading() {
    hideLoading();
    var l = document.createElement("div");
    l.className = "nlp-loading";
    l.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0c0c0c;color:#ddd;z-index:5;";
    l.innerHTML = '<div style="width:34px;height:34px;border:4px solid #333;border-top-color:#e74c3c;border-radius:50%;animation:nlpspin 1s linear infinite;"></div>' +
      '<div style="font-size:12px;color:#bbb;">\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644\u2026</div>' +
      '<style>@keyframes nlpspin{to{transform:rotate(360deg)}}</style>';
    viewport.appendChild(l);
  }
  function hideLoading() {
    var ex = viewport.querySelector(".nlp-loading");
    if (ex && ex.parentNode) ex.parentNode.removeChild(ex);
  }
  function clearBlocked() {
    var b = viewport.querySelector(".nlp-blocked");
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }
  // Shown only if the frame never reports a load within the timeout (total
  // failure / network or carrier block). Offers source switching + browser +
  // a hint about mobile-data blocking (VPN / Wi-Fi).
  function showBlocked() {
    hideLoading();
    if (viewport.querySelector(".nlp-blocked")) return;
    var d = document.createElement("div");
    d.className = "nlp-blocked";
    d.style.cssText = "position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(192,57,43,.96);color:#fff;font-size:12px;z-index:6;flex-wrap:wrap;";
    d.innerHTML = '<span style="flex:1;min-width:200px;line-height:1.7;">\u26A0 \u062a\u0639\u0630\u0651\u0631 \u0628\u062f\u0621 \u0627\u0644\u062a\u0634\u063a\u064a\u0644. \u062c\u0631\u0651\u0628 \u0645\u0635\u062f\u0631\u064b\u0627 \u0622\u062e\u0631 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629\u060c \u0623\u0648 \u0627\u0641\u062a\u062d \u0641\u064a \u0627\u0644\u0645\u062a\u0635\u0641\u062d. \u0648\u0625\u0646 \u0643\u0646\u062a \u0639\u0644\u0649 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0647\u0627\u062a\u0641 \u0641\u0642\u062f \u064a\u062d\u062c\u0628 \u0645\u0632\u0648\u0651\u062f\u0643 \u0627\u0644\u0645\u0635\u062f\u0631 \u2014 \u062c\u0631\u0651\u0628 Wi\u2011Fi \u0623\u0648 VPN.</span>' +
      '<button class="nlp-blk-ext" style="background:#fff;color:#c0392b;border:0;padding:6px 14px;border-radius:5px;font-weight:bold;cursor:pointer;font-size:12px;white-space:nowrap;">\u25B6 \u0641\u062a\u062d \u0641\u064a \u0627\u0644\u0645\u062a\u0635\u0641\u062d</button>' +
      '<button class="nlp-blk-x" style="background:transparent;color:#fff;border:0;font-size:16px;cursor:pointer;line-height:1;">\u2715</button>';
    viewport.appendChild(d);
    d.querySelector(".nlp-blk-ext").addEventListener("click", openExternal);
    d.querySelector(".nlp-blk-x").addEventListener("click", clearBlocked);
  }

  function loadInFrame(u) {
    u = (u || "").trim();
    if (!u) return;
    overlay.style.display = "none";
    clearBlocked();
    showLoading();
    if (loadTimer) clearTimeout(loadTimer);
    frame.src = u;
    // If nothing loads within this window, surface the helpful hint.
    loadTimer = setTimeout(function () { hideLoading(); showBlocked(); }, 7000);
  }

  function navigate(u, push) {
    u = (u || "").trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    urlInput.value = u;
    if (push !== false) {
      history = history.slice(0, histIndex + 1);
      history.push(u);
      histIndex = history.length - 1;
    }
    loadInFrame(u);
  }

  content.querySelector(".nlp-ext").addEventListener("click", openExternal);
  content.querySelector(".nlp-ov-ext").addEventListener("click", openExternal);
  content.querySelector(".nlp-ov-frame").addEventListener("click", function () { navigate(currentUrl(), true); });
  content.querySelector(".nlp-go").addEventListener("click", function () { navigate(urlInput.value, true); });
  urlInput.addEventListener("keydown", function (e) { if (e.key === "Enter") navigate(urlInput.value, true); });
  content.querySelector(".nlp-reload").addEventListener("click", function () { if (frame.src) loadInFrame(currentUrl()); });
  content.querySelector(".nlp-back").addEventListener("click", function () { if (histIndex > 0) { histIndex--; navigate(history[histIndex], false); } });
  content.querySelector(".nlp-fwd").addEventListener("click", function () { if (histIndex < history.length - 1) { histIndex++; navigate(history[histIndex], false); } });
  content.querySelector(".nlp-full").addEventListener("click", function () {
    var target = viewport;
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (target.requestFullscreen) target.requestFullscreen();
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
  });
  if (srcSelect) srcSelect.addEventListener("change", function () { navigate(srcSelect.value, true); });

  // Hide the spinner the moment the frame reports a load, and cancel the hint
  // (embeddable sources load fine; blocked sites are handled by the timeout).
  frame.addEventListener("load", function () {
    if (frame.src) { hideLoading(); if (loadTimer) clearTimeout(loadTimer); }
  });

  // Auto-start: if we have an embeddable source (or any URL), play it in-window.
  if (firstFrameUrl) loadInFrame(firstFrameUrl);
}

window.initNlPlayer = initNlPlayer;

// Open NL PLAYER programmatically (used by the Movies app "Watch Now" button).
// opts: { url (external/playimdb), title, sources:[{label,url}] }
window.openNlPlayer = function (opts) {
  opts = opts || {};
  _nlpPending = { url: opts.url || "", title: opts.title || "NL PLAYER", sources: opts.sources || [] };
  var win = window.createWindow("NL PLAYER");
  win.dataset.playUrl = _nlpPending.url;
  win.dataset.movieTitle = _nlpPending.title;
  if (_nlpPending.sources && _nlpPending.sources.length) win.dataset.playSources = JSON.stringify(_nlpPending.sources);
  return win;
};
