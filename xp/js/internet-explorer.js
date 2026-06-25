export function initInternetExplorer(win, showNotification) {
  const urlBar = win.querySelector('#url-bar');
  const goBtn = win.querySelector('#go-btn');
  const ieContent = win.querySelector('#ie-content');
  if (!urlBar || !goBtn || !ieContent) {
    console.error('Internet Explorer elements not found');
    return;
  }
  
  // Set the default URL to blank for our custom homepage
  urlBar.value = "about:home";
  
  // Create a custom homepage with links instead of automatically loading Google
  const customHomepage = `
    <html>
    <head>
      <title>Internet Explorer Homepage</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f0f0f0;
        }
        h1 {
          color: #0078D7;
          text-align: center;
        }
        .favorites {
          width: 80%;
          margin: 20px auto;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .site {
          display: block;
          padding: 10px;
          margin: 10px 0;
          background-color: #e8f0fe;
          border-radius: 3px;
          text-decoration: none;
          color: #0067b8;
        }
        .site:hover {
          background-color: #d0e0fc;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to Internet Explorer</h1>
      <div class="favorites">
        <h2>Favorite Websites</h2>
        <a href="https://web.archive.org/web/20010602041016/http://www.google.com/" class="site">Google (2001)</a>
        <a href="javascript:window.parent.postMessage('openAIGoogle', '*')" class="site">AI Google</a>
        <a href="javascript:window.parent.postMessage('openSketchyWebsite', '*')" class="site">Sketchy Website</a>
        <a href="javascript:window.parent.postMessage('openSketchyAntivirus', '*')" class="site">FREE Antivirus!! (100% REAL)</a>
      </div>
    </body>
    </html>
  `;
  
  // Set the custom homepage content
  setTimeout(() => {
    ieContent.setAttribute('srcdoc', customHomepage);
    
    // Add event listener for messages from the iframe
    window.addEventListener('message', handleIEMessages);
    
  }, 100);
  
  function handleIEMessages(event) {
    if (event.data === 'openSketchyWebsite') {
      navigateToSketchyWebsite();
    } else if (event.data === 'openSketchyAntivirus') {
      navigateToSketchyAntivirus();
    } else if (event.data === 'downloadAntivirus') {
      downloadAntivirus();
    } else if (event.data === 'openAIGoogle') {
      renderAIGoogleHome();
    } else if (event.data && event.data.type === 'createPopup') {
      createAdvertPopup(event.data.message, event.data.color);
    }
  }

  // ---- NEW: Fake Google renderer ----
  function renderFakeGoogle(query) {
    return renderAIGoogle(query);
  }
  // ---- END: Fake Google ----

  function renderAIGoogleHome() {
    const html = `<html><head><title>Google</title><style>body{font-family:Arial;margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff}.box{max-width:600px;width:90%;text-align:center}.logo{font-size:42px;color:#4285F4;font-weight:bold;margin-bottom:16px}.input{width:100%;padding:10px 14px;border:1px solid #dadce0;border-radius:24px}</style></head><body><div class="box"><div class="logo">Google</div><input class="input" placeholder="Search Google"/></div></body></html>`;
    ieContent.setAttribute('srcdoc', html);
    setTimeout(() => {
      const doc = ieContent.contentDocument;
      const box = doc.querySelector('.box');
      const input = doc.querySelector('.input');
      const btn = doc.createElement('button');
      btn.textContent = 'Search';
      btn.style.marginTop = '10px';
      btn.style.padding = '8px 14px';
      btn.style.border = '1px solid #dadce0';
      btn.style.borderRadius = '24px';
      box.appendChild(btn);
      btn.addEventListener('click', () => renderAIGoogle(input.value || ''));
      input.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderAIGoogle(input.value || ''); });
    }, 100);
  }

  async function aiSearchResults(query) {
    try {
      const res = await websim.chat.completions.create({
        messages: [
          { role: "system", content: "Respond directly with JSON only following this schema: { results: { title: string; url: string; snippet: string; }[] }" },
          { role: "user", content: [{ type: "text", text: query }] }
        ],
        json: true,
      });
      const parsed = JSON.parse(res.content);
      return Array.isArray(parsed.results) ? parsed.results : [];
    } catch (e) {
      console.warn("AI Google fallback due to chat completion error:", e);
      return [
        { title: `About "${query}"`, url: "http://example.com", snippet: "AI fallback summary for your query." },
        { title: `Top resources on ${query}`, url: "http://example.com/resources", snippet: "Curated links and references." },
        { title: `Learn more: ${query}`, url: "http://example.com/learn", snippet: "Guides, tutorials, and explainers." }
      ];
    }
  }

  function downloadAntivirus() {
    const desktopFolder = window.fileSystem['C:'].children['Desktop'];
    if (desktopFolder && desktopFolder.children) {
        let fileName = "Antivirus 2003.exe";
        let counter = 1;
        // Handle name collisions
        while (Object.keys(desktopFolder.children).some(key => key.toLowerCase() === fileName.toLowerCase())) {
            const nameParts = fileName.split('.');
            const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
            const baseName = nameParts.join('.').replace(/ \(\d+\)$/, '');
            fileName = `${baseName} (${counter++})${extension}`;
        }
        
        // This is now an app on the desktop.
        desktopFolder.children[fileName] = { 
            type: "app",
            program: "Antivirus 2003"
        };
        
        if (window.updateDesktopIcons) {
            window.updateDesktopIcons();
        }
        
        showNotification(`Downloaded ${fileName} to your desktop!`);
    } else {
        showNotification("Error: Could not find Desktop folder.");
    }
  }

  function navigateToSketchyAntivirus() {
    const sketchyContent = `
      <html>
        <head>
          <title>ULTIMATE ANTIVIRUS 2003 - FREE</title>
          <style>
              body {
                  background: linear-gradient(to bottom, #000080, #000000);
                  color: white;
                  font-family: 'Courier New', monospace;
                  text-align: center;
              }
              .container {
                  border: 5px outset #c0c0c0;
                  padding: 20px;
                  margin: 50px auto;
                  width: 80%;
                  background-color: #333;
              }
              h1 {
                  color: lime;
                  font-size: 3em;
                  text-shadow: 2px 2px #ff00ff;
                  animation: blink 1s infinite;
              }
              @keyframes blink { 50% { opacity: 0; } }
              p {
                  font-size: 1.2em;
                  color: #00ff00;
              }
              .download-btn {
                  background-color: red;
                  color: yellow;
                  font-size: 2em;
                  padding: 20px;
                  border: 5px outset yellow;
                  cursor: pointer;
                  animation: pulse 0.5s infinite alternate;
              }
              @keyframes pulse {
                  from { transform: scale(1); }
                  to { transform: scale(1.1); }
              }
              .warning {
                  color: yellow;
                  font-weight: bold;
              }
          </style>
        </head>
        <body>
            <div class="container">
                <h1>! WARNING !</h1>
                <p>YOUR COMPUTER IS INFECTED WITH 1,337 VIRUSES!</p>
                <p class="warning">IMMEDIATE ACTION REQUIRED!</p>
                <button class="download-btn" onclick="window.parent.postMessage('downloadAntivirus', '*')">DOWNLOAD ANTIVIRUS NOW!</button>
                <p>100% FREE AND SAFE SCAN</p>
            </div>
        </body>
      </html>
    `;
    
    urlBar.value = "http://www.ultimate-antivirus-free-safe-2003.com/download";
    ieContent.setAttribute('srcdoc', sketchyContent);
    
    // Set up message listener for popup requests
    window.addEventListener('message', handleSketchyMessage);
    
    // Make sure we clean up when IE is closed
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) {
      const originalOnClick = closeBtn.onclick;
      closeBtn.onclick = () => {
        window.removeEventListener('message', handleSketchyMessage);
        if (originalOnClick) originalOnClick();
      };
    }
  }
  
  function handleSketchyMessage(event) {
    // Make sure it's from our sketchy website
    if (event.data && event.data.type === 'createPopup') {
      createAdvertPopup(event.data.message, event.data.color);
    }
  }
  
  function createAdvertPopup(message, color) {
    // Generate random size and position
    const width = 200 + Math.floor(Math.random() * 200);
    const height = 100 + Math.floor(Math.random() * 150);
    
    const desktop = document.querySelector('.desktop');
    const maxLeft = desktop.clientWidth - width;
    const maxTop = desktop.clientHeight - height;
    
    const left = Math.floor(Math.random() * maxLeft);
    const top = Math.floor(Math.random() * maxTop);
    
    // Create popup window with ad content
    const popupContent = `
      <div style="background-color: ${color}; height: 100%; overflow: hidden; 
                  display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h3 style="color: white; text-shadow: 2px 2px black; margin: 0; font-size: 24px; animation: blink 1s infinite;">⚠️ ${message} ⚠️</h3>
        <button style="margin-top: 10px; padding: 5px 15px; font-weight: bold; cursor: pointer;">CLICK HERE!</button>
      </div>
      <style>
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      </style>
    `;
    
    const popupWin = window.createWindow("Advertisement", popupContent);
    popupWin.style.width = width + "px";
    popupWin.style.height = height + "px";
    popupWin.style.left = left + "px";
    popupWin.style.top = top + "px";
  }

  async function renderAIGoogle(query) {
    const safeQ = (query || '').toString().trim().slice(0, 200);
    if (!safeQ) { renderAIGoogleHome(); return; }
    showGoogleLoading(safeQ);
    const results = await aiSearchResults(safeQ);
    const resultsHtml = results.map(r => `
      <div class="g">
        <a class="result-title" href="javascript:void(0)">${(r.title||'Result')}</a>
        <div class="result-url">${(r.url||'http://example.com')}</div>
        <div class="result-snippet">${(r.snippet||'')}</div>
      </div>`).join('');
    const html = `
      <html><head><title>${safeQ ? safeQ + " - Google Search" : "Google"}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:0;background:#fff;color:#202124}
        .topbar{display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid #e0e0e0}
        .logo{font-size:22px;color:#4285F4;font-weight:bold;margin-right:16px}
        .searchbox{flex:1}.searchbox input{width:100%;padding:8px 12px;border:1px solid #dadce0;border-radius:24px;outline:none}
        .container{max-width:700px;margin:20px auto;padding:0 16px}.stats{color:#70757a;font-size:12px;margin-bottom:16px}
        .g{margin-bottom:22px}.result-title{font-size:18px;color:#1a0dab;text-decoration:none}
        .result-title:hover{text-decoration:underline}.result-url{color:#006621;font-size:14px;margin:2px 0}
        .result-snippet{color:#4d5156;font-size:14px}.notice{background:#fff8e1;border:1px solid #ffe082;padding:8px 12px;border-radius:6px;margin-bottom:16px;color:#8d6e63}
        .foot{color:#70757a;font-size:12px;padding:16px;text-align:center;border-top:1px solid #e0e0e0}
      </style></head>
      <body>
        <div class="topbar"><div class="logo">G</div><div class="searchbox"><input value="${safeQ.replace(/"/g,'&quot;')}" /></div></div>
        <div class="container"><div class="stats">AI results for "${safeQ}"</div>
        <div class="notice">These search results are AI-generated.</div>${resultsHtml}</div>
        <div class="foot">Google (simulated)</div>
      </body></html>`;
    ieContent.setAttribute('srcdoc', html);
  }

  function showGoogleLoading(query) {
    const html = `<html><head><title>Searching...</title><style>body{font-family:Arial;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;color:#202124}.wrap{text-align:center}.spinner{width:28px;height:28px;border:3px solid #dadce0;border-top-color:#4285F4;border-radius:50%;margin:12px auto;animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div class="wrap"><div>Searching for "${(query||'').replace(/</g,'&lt;')}"</div><div class="spinner"></div></div></body></html>`;
    ieContent.setAttribute('srcdoc', html);
  }

  goBtn.addEventListener('click', () => navigateTo(urlBar.value));
  urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') navigateTo(urlBar.value);
  });
  
  async function navigateTo(query) {
    let url = query.trim();
    
    // Special case for sketchy website
    if (url === "sketchy" || url === "sketchy website" || url === "sketchy-website") {
      navigateToSketchyWebsite();
      return;
    }
    
    // Special case for our custom homepage
    if (url === "about:home") {
      ieContent.setAttribute('srcdoc', customHomepage);
      return;
    }

    // NEW: Intercept Google searches/pages and render a fake results page instead of fetching
    const lower = url.toLowerCase();
    const isGoogle =
      lower.includes('google.com') ||
      lower.includes('www.google.com') ||
      lower.startsWith('google.com') ||
      lower.startsWith('www.google.com');
    if (isGoogle) {
      const q = getQueryParam(url, 'q') || url.replace(/^https?:\/\/(www\.)?google\.com\/?/, '').replace(/^\?/, '');
      await renderAIGoogle(decodeURIComponent(q || '').replace(/\+/g, ' '));
      return;
    }
    
    // Plain search terms (no scheme and likely not a domain)
    if (!/^https?:\/\//i.test(url) && (url.includes(' ') || !url.includes('.'))) {
      await renderAIGoogle(url);
      return;
    }
    
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    urlBar.value = query;
    showNotification(`Connecting to ${query}...`);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();
      ieContent.setAttribute('srcdoc', data);
      // Force the iframe to update with a proper scrollbar; reflow needed.
      ieContent.style.overflowY = 'scroll';
    } catch (error) {
      // Fallback: if fetch fails and looks like a Google URL, render fake Google
      if (isGoogle) {
        const q = getQueryParam(url, 'q');
        renderFakeGoogle(decodeURIComponent(q || '').replace(/\+/g, ' '));
        return;
      }
      showNotification(`Error loading website: ${error.message}`);
      ieContent.removeAttribute('srcdoc');
      ieContent.src = url;
    }
  }
  
  function navigateToSketchyWebsite() {
    const sketchyContent = `
      <html>
      <head>
        <title>FREE PRIZE WINNER!!!</title>
        <style>
          body {
            background-color: #ff00ff;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="10" y="30" font-size="30" fill="yellow">$$$</text></svg>');
            font-family: 'Comic Sans MS', cursive;
            color: yellow;
            text-align: center;
            overflow: hidden;
          }
          h1 {
            color: lime;
            font-size: 40px;
            text-shadow: 2px 2px blue;
            animation: blink 0.5s infinite;
          }
          .flash {
            animation: flash 0.3s infinite;
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes flash {
            0% { background-color: yellow; }
            50% { background-color: red; }
            100% { background-color: blue; }
          }
          .button {
            background-color: red;
            color: white;
            border: 5px solid green;
            padding: 15px 30px;
            font-size: 24px;
            margin: 20px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h1 class="flash">🎉 CONGRATULATIONS! YOU ARE THE 1,000,000th VISITOR! 🎉</h1>
        <h2>You have won a FREE prize!</h2>
        <button class="button" onclick="spawnPopups()">CLICK HERE TO CLAIM NOW!!!</button>
        
        <script>
          let popupCount = 0;
          const messages = [
            "FREE IPHONE!!! CLICK NOW!",
            "HOT SINGLES IN YOUR AREA!",
            "YOU'VE WON A NEW CAR!",
            "UNLOCK SECRET MONEY TRICK!",
            "DOCTORS HATE THIS ONE WEIRD TRICK!",
            "DOWNLOAD MORE RAM NOW!",
            "YOUR COMPUTER HAS A VIRUS!",
            "CONGRATULATIONS AMAZON SHOPPER!",
            "CLAIM YOUR INHERITANCE NOW!",
            "MEETING SINGLES TONIGHT?",
            "WARNING: YOUR COMPUTER IS SLOW!",
            "FREE GIFT CARD!!!",
            "BECOME RICH OVERNIGHT!"
          ];
          
          const colors = [
            "#ff0000", "#00ff00", "#0000ff", "#ffff00", 
            "#ff00ff", "#00ffff", "#ff8800", "#ff0088",
            "#88ff00", "#0088ff", "#8800ff", "#00ff88"
          ];
          
          function randomPosition(max) {
            return Math.floor(Math.random() * max);
          }
          
          function randomSize(min, max) {
            return min + Math.floor(Math.random() * (max - min));
          }
          
          function spawnPopups() {
            // Create 5 popups immediately
            for (let i = 0; i < 5; i++) {
              createPopup();
            }
            
            // Then create one every second up to a maximum
            const interval = setInterval(() => {
              if (popupCount >= 20) {
                clearInterval(interval);
              } else {
                createPopup();
              }
            }, 1000);
          }
          
          function createPopup() {
            if (popupCount >= 20) return; // Limit total popups
            
            // Notify the parent window to create a popup
            window.parent.postMessage({
              type: 'createPopup', 
              message: messages[Math.floor(Math.random() * messages.length)],
              color: colors[Math.floor(Math.random() * colors.length)]
            }, '*');
            
            popupCount++;
          }
        </script>
      </body>
      </html>
    `;
    
    urlBar.value = "SKETCHY-WEBSITE.NET/WINNER!!!";
    ieContent.setAttribute('srcdoc', sketchyContent);
    
    // Set up message listener for popup requests
    window.addEventListener('message', handleSketchyMessage);
    
    // Make sure we clean up when IE is closed
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) {
      const originalOnClick = closeBtn.onclick;
      closeBtn.onclick = () => {
        window.removeEventListener('message', handleSketchyMessage);
        if (originalOnClick) originalOnClick();
      };
    }
  }
}

// Helper to extract query parameters from URLs
function getQueryParam(url, key) {
  try { const u = new URL(url, 'https://example.com'); return u.searchParams.get(key); }
  catch { const m = url.match(new RegExp('[?&]'+key+'=([^&#]+)')); return m ? decodeURIComponent(m[1]) : null; }
}