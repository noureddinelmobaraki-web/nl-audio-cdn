// NL PLAYER — a browser-like media player window for the XP system.
//
// WHY a browser, not a plain <video>: the site streams via pages like
// playimdb.com/title/<imdbId>/ which send X-Frame-Options / frame-ancestors and
// therefore REFUSE to load inside an <iframe>. The real site works around this by
// calling window.open(url) — a true top-level browser tab. NL PLAYER reproduces
// that exactly: it has full browser chrome (address bar, back/forward/reload,
// fullscreen) and a viewport that tries to embed the stream, but its guaranteed
// action opens the link in a real new browser tab (the proven method).

function nlpEsc(s) {
  return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function initNlPlayer(win, showNotification) {
  var content = win.querySelector(".window-content");
  if (!content) return;

  var startUrl = win.dataset.playUrl || "";
  var mediaTitle = win.dataset.movieTitle || "NL PLAYER";

  var history = startUrl ? [startUrl] : [];
  var histIndex = history.length - 1;

  var btn = "height:24px;min-width:26px;padding:0 6px;border:1px solid #8a93a0;border-radius:4px;background:linear-gradient(#ffffff,#e4e8ef);cursor:pointer;font-size:13px;color:#222;";
  var btnPrimary = "height:24px;padding:0 10px;border:1px solid #a52a1f;border-radius:4px;background:linear-gradient(#e74c3c,#c0392b);color:#fff;cursor:pointer;font-size:12px;font-weight:bold;";

  content.style.cssText = "display:flex;flex-direction:column;height:100%;width:100%;background:#1b1b1b;overflow:hidden;";
  content.innerHTML =
    '<div class="nlp-toolbar" style="display:flex;align-items:center;gap:5px;padding:6px 8px;background:linear-gradient(#f5f6f8,#d9dee6);border-bottom:1px solid #9aa3b0;flex:0 0 auto;">' +
      '<button class="nlp-back" title="\u0631\u062c\u0648\u0639" style="' + btn + '">\u25C0</button>' +
      '<button class="nlp-fwd" title="\u062a\u0642\u062f\u0651\u0645" style="' + btn + '">\u25B6</button>' +
      '<button class="nlp-reload" title="\u062a\u062d\u062f\u064a\u062b" style="' + btn + '">\u27F3</button>' +
      '<input class="nlp-url" type="text" spellcheck="false" value="' + nlpEsc(startUrl) + '" style="flex:1;height:24px;padding:0 8px;border:1px solid #8a93a0;border-radius:11px;font-size:12px;color:#1a3c66;background:#fff;outline:none;"/>' +
      '<button class="nlp-go" style="' + btn + '">\u0627\u0646\u062a\u0642\u0627\u0644</button>' +
      '<button class="nlp-full" title="\u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629" style="' + btn + '">\u26F6</button>' +
      '<button class="nlp-ext" style="' + btnPrimary + '">\uD83C\uDF10 \u0641\u062a\u062d \u0641\u064a \u0627\u0644\u0645\u062a\u0635\u0641\u062d</button>' +
    '</div>' +
    '<div class="nlp-viewport" style="position:relative;flex:1 1 auto;background:#000;min-height:0;">' +
      '<iframe class="nlp-frame" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="no-referrer" style="position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;"></iframe>' +
      '<div class="nlp-overlay" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle at 50% 38%,#262626,#000);color:#eee;text-align:center;padding:24px;">' +
        '<div style="font-size:38px;">\uD83C\uDFAC</div>' +
        '<div style="font-size:16px;font-weight:bold;max-width:520px;">' + nlpEsc(mediaTitle) + '</div>' +
        '<div style="font-size:12px;color:#bbb;max-width:480px;line-height:1.8;">\u0628\u0639\u0636 \u0645\u0635\u0627\u062f\u0631 \u0627\u0644\u0628\u062b (\u0645\u062b\u0644 playimdb) \u062a\u0645\u0646\u0639 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u062f\u0627\u062e\u0644 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0644\u0623\u0633\u0628\u0627\u0628 \u0623\u0645\u0646\u064a\u0629. \u0644\u0644\u0645\u0634\u0627\u0647\u062f\u0629 \u0627\u0644\u0645\u0636\u0645\u0648\u0646\u0629 \u0627\u0641\u062a\u062d \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064a \u062a\u0628\u0648\u064a\u0628 \u0627\u0644\u0645\u062a\u0635\u0641\u062d\u060c \u0623\u0648 \u062c\u0631\u0651\u0628 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u062f\u0627\u062e\u0644 \u0627\u0644\u0646\u0627\u0641\u0630\u0629.</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">' +
          '<button class="nlp-ov-ext" style="background:#c0392b;color:#fff;border:0;padding:11px 20px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px;">\u25B6 \u062a\u0634\u063a\u064a\u0644 \u0641\u064a \u0627\u0644\u0645\u062a\u0635\u0641\u062d (\u062a\u0628\u0648\u064a\u0628 \u062c\u062f\u064a\u062f)</button>' +
          '<button class="nlp-ov-frame" style="background:#2c3e50;color:#fff;border:0;padding:11px 20px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px;">\uD83D\uDDD6 \u0645\u062d\u0627\u0648\u0644\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0646\u0627\u0641\u0630\u0629</button>' +
        '</div>' +
        '<div style="font-size:11px;color:#7f8c8d;word-break:break-all;max-width:520px;">' + nlpEsc(startUrl) + '</div>' +
      '</div>' +
    '</div>';

  var frame = content.querySelector(".nlp-frame");
  var urlInput = content.querySelector(".nlp-url");
  var overlay = content.querySelector(".nlp-overlay");
  var viewport = content.querySelector(".nlp-viewport");

  function currentUrl() { return (urlInput.value || startUrl || "").trim(); }

  function openExternal() {
    var u = currentUrl();
    if (u) window.open(u, "_blank", "noopener,noreferrer");
    else if (showNotification) showNotification("NL PLAYER", "\u0644\u0627 \u064a\u0648\u062c\u062f \u0631\u0627\u0628\u0637 \u0644\u0644\u062a\u0634\u063a\u064a\u0644");
  }

  function loadInFrame(u) {
    overlay.style.display = "none";
    frame.src = u;
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
  content.querySelector(".nlp-ov-frame").addEventListener("click", function () { loadInFrame(currentUrl()); });
  content.querySelector(".nlp-go").addEventListener("click", function () { navigate(urlInput.value, true); });
  urlInput.addEventListener("keydown", function (e) { if (e.key === "Enter") navigate(urlInput.value, true); });
  content.querySelector(".nlp-reload").addEventListener("click", function () { if (overlay.style.display !== "none") loadInFrame(currentUrl()); else frame.src = frame.src; });
  content.querySelector(".nlp-back").addEventListener("click", function () { if (histIndex > 0) { histIndex--; navigate(history[histIndex], false); } });
  content.querySelector(".nlp-fwd").addEventListener("click", function () { if (histIndex < history.length - 1) { histIndex++; navigate(history[histIndex], false); } });
  content.querySelector(".nlp-full").addEventListener("click", function () {
    var target = viewport;
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (target.requestFullscreen) target.requestFullscreen();
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
  });
}

window.initNlPlayer = initNlPlayer;

// Open NL PLAYER programmatically (used by the Movies app \"Watch Now\" button).
window.openNlPlayer = function (opts) {
  opts = opts || {};
  var win = window.createWindow("NL PLAYER");
  win.dataset.playUrl = opts.url || "";
  win.dataset.movieTitle = opts.title || "NL PLAYER";
  return win;
};
