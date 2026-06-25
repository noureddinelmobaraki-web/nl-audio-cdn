import { getNextWindowId, getNextZIndex, fileSystem, getItemByPath, recycleBin } from "./system.js";
import { getIcon } from "./icons.js";

// Global variable to track current active window id.
window.currentActiveWindowId = null;
// Global variable to track the current file explorer window instance
window.currentFileExplorer = null;

export function createWindow(title, customCode) {
  const win = document.createElement('div');
  win.className = 'window';
  win.style.position = 'absolute';

  const originalTitle = title;
  if (title === "Pinball") {
    title = "3D Pinball for Windows - Space Cadet";
  }
  if (title === "@WannaDecryptor@" || title === "@WanaDecryptor@") {
    title = "Wana Decrypt0r 2.0";
  }
  win.dataset.title = title;
  win.dataset.id = getNextWindowId();

  // Check if horror mode is active
  const isHorrorMode = window.isHorrorModeActive && window.isHorrorModeActive();

  // Layout for Error windows vs. normal windows.
  if (title === "Error") {
    const desktop = document.querySelector('.desktop');
    const desktopWidth = desktop.clientWidth;
    const desktopHeight = desktop.clientHeight;
    // Check our global flag: if true, use random placement; otherwise, center the error window.
    if (window.__errorRandomPlacement || isHorrorMode) {
      win.style.left = `${Math.random() * (desktopWidth - 300)}px`;
      win.style.top = `${Math.random() * (desktopHeight - 100)}px`;
    } else {
      // Center the error window.
      const winWidth = parseFloat(win.style.width) || 300;
      const winHeight = parseFloat(win.style.height) || 150;
      win.style.left = `${(desktopWidth - winWidth) / 2}px`;
      win.style.top = `${(desktopHeight - winHeight) / 2}px`;
    }
  } else {
    win.style.left = `${50 + Math.random() * 100}px`;
    win.style.top = `${50 + Math.random() * 100}px`;
  }
  win.style.zIndex = getNextZIndex();

  // Set default size if not provided.
  if (!win.style.width) win.style.width = "400px";
  if (!win.style.height) win.style.height = "300px";

  // Make the window a flex container so that header and content adjust correctly.
  win.style.display = "flex";
  win.style.flexDirection = "column";
  win.style.minHeight = "0";

  let headerHTML;
  if (title === "Error") {
    const desktop = document.querySelector('.desktop');
    // For error windows (normally) the width should be set so that centering works later.
    if (!win.style.width) win.style.width = "300px";
    headerHTML = `
      <div class="title-bar">
        <div class="title-bar-left" style="display: flex; align-items: center;">
          <div class="title-bar-text">${title}</div>
        </div>
        <div class="title-bar-controls">
          <button aria-label="Close"></button>
        </div>
      </div>
    `;
  } else {
    let iconSrc;
    // Special case for File Explorer, as its title and icon change dynamically.
    // Default to a folder icon, which will be updated by updateFileExplorer.
    if (title === "File Explorer") {
      iconSrc = getIcon("folder");
    } else {
      const item = getItemByPath(`C:/Apps/${originalTitle}`) || getItemByPath(`C:/Games/${originalTitle}`) || { program: originalTitle };
      iconSrc = getIcon(item.program || originalTitle);
    }
    headerHTML = `
      <div class="title-bar">
        <div class="title-bar-left" style="display: flex; align-items: center;">
          <img src="${iconSrc}" style="width:20px; height:20px; margin-right: 5px; pointer-events: none;" draggable="false">
          <div class="title-bar-text">${title}</div>
        </div>
        <div class="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize" class="toggle-maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
    `;
  }

  let bodyHTML = "";
  let content = "";
  switch (originalTitle) {
    case 'Internet Explorer':
      bodyHTML = `<div class="window-body ie-window" style="overflow: auto;">`;
      content = customCode ? customCode : `<div class="ie-toolbar" style="padding: 5px; display: flex; align-items: center;">
          <span style="margin-right: 5px; white-space: nowrap;">Address:</span>
          <input type="text" id="url-bar" placeholder="Enter a search term or URL" style="flex: 1;">
          <button id="go-btn">Go</button>
        </div>
        <div style="width: 100%; height: calc(100% - 40px); overflow: auto;">
          <iframe id="ie-content" srcdoc="<h1>Welcome to Internet Explorer</h1><p>Enter a search term or URL above to begin browsing.</p>" style="width: 100%; height: 100%; border: none; display: block; overflow: auto;"></iframe>
        </div>`;
      win.style.width = '800px';
      win.style.height = '600px';
      break;
    case 'File Explorer':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      break;
    case 'Snake':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content">
        <canvas id="snake-canvas" style="border:1px solid #000;"></canvas>
        <div>Score: <span id="snake-score">0</span></div>
        <button id="snake-start">Start Game</button>
        <div style="margin-top: 10px;">
          <button id="snake-up">↑</button><br>
          <button id="snake-left">←</button>
          <button id="snake-right">→</button><br>
          <button id="snake-down">↓</button>
        </div>`;
      win.style.width = '350px';
      win.style.height = '500px';
      break;
    case 'Minesweeper':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `
        <div style="text-align: center;">
          <div id="minesweeper-controls" style="margin-bottom: 10px;">
            <select id="difficulty-select">
              <option value="easy" selected>Easy (9x9, 10 mines)</option>
              <option value="medium">Medium (16x16, 40 mines)</option>
              <option value="hard">Hard (16x30, 99 mines)</option>
            </select>
            <button id="new-game">New Game</button>
            <span id="mine-count"></span>
            <span id="timer"></span>
          </div>
          <div id="minesweeper-grid" style="margin: 0 auto;"></div>
        </div>
      `;
      win.style.width = '1000px';
      win.style.height = '580px';
      break;
    case 'Notepad':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : ``; 
      win.style.width = '300px';
      win.style.height = '200px';
      break;
    case 'Paint':
      bodyHTML = `<div class="window-content" style="padding: 5px">`;
      content = customCode ? customCode : ``;
      win.style.width = '600px';
      win.style.height = '420px';
      break;
    case 'Calculator':
      bodyHTML = `<div class="window-content">`;
      break;
    case 'Hydra App':
      bodyHTML = `<div class="window-content" style="padding: 5px">`;
      content = customCode ? customCode : `<p>This is the Hydra App. Try closing me!</p>`;
      win.style.width = '200px';
      win.style.height = '100px';
      break;
    case 'Calendar':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content-inner"></div>`;
      win.style.width = '350px';
      win.style.height = '267px';
      break;
    case 'Windows Media Player':
      bodyHTML = `<div class="window-body">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      win.style.height = '400px';
      break;
    case 'Plants vs Zombies':
      bodyHTML = `<div class="window-body pvz-window" style="overflow: hidden;">`;
      content = customCode ? customCode : `
        <div style="width: 100%; height: 100%;">
          <iframe src="https://pvz.ee/iframe.php" style="width: 100%; height: 100%; border: none; display: block;"></iframe>
        </div>
      `;
      win.style.width = '900px';
      win.style.height = '627px';
      break;
    case 'Minecraft':
      bodyHTML = `<div class="window-body threeD-window" style="overflow: hidden;">`;
      content = customCode ? customCode : `<div class="window-content" style="flex:1; overflow: hidden; padding: 0;"></div>`;
      win.style.width = '800px';
      win.style.height = '600px';
      break;
    case 'Roblox':
      bodyHTML = `<div class="window-body threeD-window" style="overflow: hidden;">`;
      content = customCode ? customCode : `<div class="window-content" style="flex:1; overflow: hidden; padding: 0;"></div>`;
      win.style.width = '800px';
      win.style.height = '600px';
      break;
    case 'AOL Instant Messenger':
      bodyHTML = `<div class="window-content" style="padding: 10px">`;
      content = customCode ? customCode : `<div class="window-content">
        <p>Welcome to AOL Instant Messenger Chat!</p>
      </div>`;
      win.style.width = '600px';
      win.style.height = '445px';
      break;
    case 'Error Takeover':
      bodyHTML = `<div class="window-content" style="padding: 10px">`;
      win.style.height = '180px';
      break;
    case 'You Are An Idiot':
      bodyHTML = `<div class="window-content" style="overflow: hidden;">`;
      content = "";
      win.style.width = '600px';
      win.style.height = '445px';
      break;
    case 'Command Prompt':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      win.style.width = '640px';
      win.style.height = '400px';
      break;
    case 'Speak Bonzi, Speak!':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      win.style.width = '350px';
      win.style.height = '170px';
      break;
    case 'Mario':
      bodyHTML = `<div class="window-body mario-window"`;
      content = customCode ? customCode : `
        <div style="width: 100%; height: 100%;">
          <iframe src="https://html-classic.itch.zone/html/15216549/WebGL/index.html" style="width: 100%; height: 100%; border: none; display: block; overflow: auto;"></iframe>
        </div>
      `;
      win.style.width = '990px';
      win.style.height = '700px';
      break;
    case 'VirtualBox':
      bodyHTML = `<div class="window-body vm-window">`;
      content = customCode ? customCode : `
        <div style="width: calc(100%-20px); height: 100%;">
          <iframe src="https://websim.ai/@BookwormKevin/windows-xp-simulator/" style="width: 100%; height: 100%; border: none; display: block;"></iframe>
        </div>
      `;
      win.style.width = '900px';
      win.style.height = '600px';
      break;
    case 'Task Manager':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      break;
    case 'BSOD Creator':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      break;
    case 'Antivirus 2003':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      break;
    case 'Flash Player':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      win.style.width = '550px';
      win.style.height = '400px';
      break;
    case 'Stick Figures':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : ``;
      win.style.width = '320px';
      win.style.height = '280px';
      break;
    case 'Open With': 
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      win.style.width = '400px';
      win.style.height = '350px'; 
      break;
    case 'Information':
      bodyHTML = `<div class="window-body" style="display: flex; gap: 15px; font-size: 11px; line-height: 1.4;">`;
      content = `
        <img src="Information.png" alt="Information" style="width: 48px; height: 48px; flex-shrink: 0; align-self: flex-start;">
        <div>
          <h3 style="margin-top: 0; font-size: 13px;">Welcome to Windows XP Simulator!</h3>
          <p>I hope you enjoy this Windows XP recreation made by me, <strong>BookwormKevin</strong>.</p>
          <p><strong>Warning:</strong> Be careful with the programs located in the <code>DANGER!!!</code> folder, because some of them have flashing lights and loud sounds.</p>
          <hr style="margin: 15px 0; border-top: 1px solid #aca899; border-bottom: none;">
          <p><strong>Credits:</strong><br>
            Some of the icons come from this HD icon pack: <a href="https://www.deviantart.com/marchmountain/art/Windows-XP-High-Resolution-Icon-Pack-916042853" target="_blank" rel="noopener noreferrer">Windows XP High Resolution Icon Pack</a>.<br>
            The 3D Pinball game is from <a href="https://98.js.org/" target="_blank" rel="noopener noreferrer">https://98.js.org/</a>.<br>
            Solitaire comes from <a href="https://github.com/1j01/98/tree/master/programs/js-solitaire" target="_blank" rel="noopener noreferrer">https://github.com/1j01/98/tree/master/programs/js-solitaire</a>.
          </p>
          <p>I am planning to add more apps to this over time, so please comment what you want to see me add!</p>
        </div>
      `;
      win.style.width = '450px';
      win.style.height = '310px';
      break;
    case 'Pinball':
      bodyHTML = `<div class="window-body pinball-window" style="overflow: hidden; padding: 0;">`;
      // Use a full-bleed iframe with no transform or oversized calc to avoid cropping at the top/left.
      content = `
        <iframe src="https://98.js.org/programs/pinball/space-cadet.html" scrolling="no" style="width: 100%; height: 100%; border: none; display: block;"></iframe>
      `;
      win.style.width = '604px';
      win.style.height = '473px'; // Reduced height by 15px to better fit viewport
      break;
    case 'Solitaire':
      bodyHTML = `<div class="window-body pvz-window" style="overflow: hidden;">`;
      content = `<iframe src="https://98.js.org/programs/js-solitaire/" style="width: 100%; height: 100%; border: none; display: block;"></iframe>`;
      win.style.width = '800px';
      win.style.height = '600px';
      break;
    case '@WanaDecryptor@':
      // WannaCry Ransom Window
      bodyHTML = `<div class="window-content">`;
      content = ``;
      win.style.width = '850px'; // Made wider to match screenshot layout
      win.style.height = '600px';
      break;
    case 'NL TV':
      bodyHTML = `<div class="window-body" style="overflow: hidden; padding: 0;">`;
      content = customCode ? customCode : `<div class="window-content" style="flex:1; overflow:hidden; padding:0;"></div>`;
      win.style.width = '860px';
      win.style.height = '600px';
      break;
    default:
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<p>This is the ${title} window.</p>`;
  }
  bodyHTML += content;
  bodyHTML += `</div>`;
  win.innerHTML = headerHTML + bodyHTML;

  // Clamp window size and spawn position to the visible desktop so windows
  // are always fully on screen (critical on phones, where many default
  // window sizes are larger than the viewport).
  {
    const desktopEl = document.querySelector('.desktop');
    const availW = desktopEl ? desktopEl.clientWidth : window.innerWidth;
    const availH = (desktopEl ? desktopEl.clientHeight : window.innerHeight) - 30; // taskbar
    const curW = parseFloat(win.style.width) || 400;
    const curH = parseFloat(win.style.height) || 300;
    if (curW > availW - 4) win.style.width = `${Math.max(200, availW - 4)}px`;
    if (curH > availH - 4) win.style.height = `${Math.max(120, availH - 4)}px`;
    const finalW = parseFloat(win.style.width) || curW;
    const finalH = parseFloat(win.style.height) || curH;
    const curL = parseFloat(win.style.left) || 0;
    const curT = parseFloat(win.style.top) || 0;
    win.style.left = `${Math.max(0, Math.min(curL, availW - finalW))}px`;
    win.style.top = `${Math.max(0, Math.min(curT, availH - finalH))}px`;
  }

  createTaskbarButton(originalTitle, win, title);

  const minimizeBtn = win.querySelector('button[aria-label="Minimize"]');
  const maximizeBtn = win.querySelector('button[aria-label="Maximize"]');
  const closeBtn = win.querySelector('button[aria-label="Close"]');

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      win.style.display = 'none';
      if (window.currentActiveWindowId === win.dataset.id) {
        updateTaskbarButtonState(win.dataset.id, false);
        window.currentActiveWindowId = null;
      }
    });
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!win.classList.contains('maximized')) {
        win.dataset.defaultLeft = win.style.left;
        win.dataset.defaultTop = win.style.top;
        win.dataset.defaultWidth = win.style.width;
        win.dataset.defaultHeight = win.style.height;
        win.style.left = '0';
        win.style.top = '0';
        win.style.width = '100%';
        win.style.height = 'calc(100% - 30px)'; // Subtract taskbar height
        win.classList.add('maximized');
        maximizeBtn.setAttribute('aria-label', 'Restore');
      } else {
        win.style.left = win.dataset.defaultLeft;
        win.style.top = win.dataset.defaultTop;
        win.style.width = win.dataset.defaultWidth;
        win.style.height = win.dataset.defaultHeight;
        win.classList.remove('maximized');
        maximizeBtn.setAttribute('aria-label', 'Maximize');
      }
    });
  }

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    win.remove();
    const taskbarButtons = document.querySelector('.taskbar-buttons');
    const btnToRemove = taskbarButtons.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
    if(btnToRemove) btnToRemove.remove();
    if (window.currentActiveWindowId === win.dataset.id) {
      window.currentActiveWindowId = null;
    }
    // If the closed window was the current file explorer, set it to null
    if (window.currentFileExplorer === win) {
      window.currentFileExplorer = null;
    }
  });

  // Make the title bar draggable.
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    titleBar.style.cursor = 'move';
    let dragging = false, offsetX, offsetY;
    let hasUnmaximized = false;

    // Keep the title bar reachable: never let a window be dragged fully offscreen.
    function clampDragPos(l, t) {
      const desktopEl = document.querySelector('.desktop');
      const dw = desktopEl ? desktopEl.clientWidth : window.innerWidth;
      const dh = (desktopEl ? desktopEl.clientHeight : window.innerHeight) - 30; // taskbar
      const minLeft = -(win.offsetWidth - 60);
      const maxLeft = dw - 60;
      const maxTop = dh - 24;
      return {
        left: Math.max(minLeft, Math.min(l, maxLeft)),
        top: Math.max(0, Math.min(t, maxTop))
      };
    }
    titleBar.addEventListener('mousedown', (e) => {
      if (e.button === 2) return;
      // Don't initiate drag if clicking on control buttons
      if (e.target.closest('.title-bar-controls')) return;
      dragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      win.style.zIndex = getNextZIndex();
    });

    // Add touch support for mobile
    titleBar.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return; // Only handle single touch
      // Don't initiate drag if touching control buttons
      if (e.target.closest('.title-bar-controls')) return;
      const touch = e.touches[0];
      dragging = true;
      offsetX = touch.clientX - win.offsetLeft;
      offsetY = touch.clientY - win.offsetTop;
      win.style.zIndex = getNextZIndex();
      e.preventDefault(); // Prevent scrolling while dragging
    });

    document.addEventListener('mousemove', (e) => {
      if (dragging) {
        if (win.classList.contains('maximized') && !hasUnmaximized &&
            (Math.abs(e.clientX - offsetX) > 5 || Math.abs(e.clientY - offsetY) > 5)) {
          win.style.left = win.dataset.defaultLeft;
          win.style.top = win.dataset.defaultTop;
          win.style.width = win.dataset.defaultWidth;
          win.style.height = win.dataset.defaultHeight;
          win.classList.remove('maximized');
          const maxToggleButton = win.querySelector('.toggle-maximize');
          if (maxToggleButton) {
            maxToggleButton.setAttribute('aria-label', 'Maximize');
          }
          hasUnmaximized = true;
        }
        const pos = clampDragPos(e.clientX - offsetX, e.clientY - offsetY);
        win.style.left = `${pos.left}px`;
        win.style.top = `${pos.top}px`;
      }
    });

    // Add touch move handler
    document.addEventListener('touchmove', (e) => {
      if (dragging && e.touches.length === 1) {
        const touch = e.touches[0];
        if (win.classList.contains('maximized') && !hasUnmaximized &&
            (Math.abs(touch.clientX - offsetX) > 5 || Math.abs(touch.clientY - offsetY) > 5)) {
          win.style.left = win.dataset.defaultLeft;
          win.style.top = win.dataset.defaultTop;
          win.style.width = win.dataset.defaultWidth;
          win.style.height = win.dataset.defaultHeight;
          win.classList.remove('maximized');
          const maxToggleButton = win.querySelector('.toggle-maximize');
          if (maxToggleButton) {
            maxToggleButton.setAttribute('aria-label', 'Maximize');
          }
          hasUnmaximized = true;
        }
        const pos = clampDragPos(touch.clientX - offsetX, touch.clientY - offsetY);
        win.style.left = `${pos.left}px`;
        win.style.top = `${pos.top}px`;
        e.preventDefault(); // Prevent scrolling while dragging
      }
    });

    document.addEventListener('mouseup', () => {
      dragging = false;
      hasUnmaximized = false;
    });

    // Add touch end handler
    document.addEventListener('touchend', () => {
      dragging = false;
      hasUnmaximized = false;
    });

    document.addEventListener('touchcancel', () => {
      dragging = false;
      hasUnmaximized = false;
    });
  }

  const resizableWindows = [
    'Notepad',
    'File Explorer',
    'Internet Explorer',
    'Command Prompt',
    'VirtualBox',
    'Task Manager',
    'Control Panel',
    'AOL Instant Messenger',
    'Roblox',
    'Minecraft',
    'Flash Player',
    'Solitaire'
  ];

  if (resizableWindows.includes(title)) {
      const oldResizeHandle = win.querySelector('.resize-handle');
      if (oldResizeHandle) oldResizeHandle.remove();
      
      // Build dedicated resize gutters to avoid conflicts with scrollbars/iframes
      const edges = [
        { cls: 'left', edge: 'left' }, { cls: 'right', edge: 'right' },
        { cls: 'top', edge: 'top' }, { cls: 'bottom', edge: 'bottom' },
        { cls: 'top left corner', edge: 'top-left' }, { cls: 'top right corner', edge: 'top-right' },
        { cls: 'bottom left corner', edge: 'bottom-left' }, { cls: 'bottom right corner', edge: 'bottom-right' },
      ];
      edges.forEach(({ cls, edge }) => {
        const el = document.createElement('div');
        el.className = `resize-edge ${cls}`;
        win.appendChild(el);
        el.addEventListener('mousedown', (e) => {
          if (win.classList.contains('maximized')) return;
          e.preventDefault(); e.stopPropagation();
          startResize(edge, e.clientX, e.clientY);
        });
        el.addEventListener('touchstart', (e) => {
          if (win.classList.contains('maximized')) return;
          if (e.touches.length !== 1) return;
          e.preventDefault(); e.stopPropagation();
          startResize(edge, e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
      });
      
      let resizeState = { isResizing: false, edge: '', startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLeft: 0, startTop: 0 };
      function startResize(edge, x, y) {
        resizeState.edge = edge; resizeState.isResizing = true;
        resizeState.startX = x; resizeState.startY = y;
        resizeState.startWidth = win.offsetWidth; resizeState.startHeight = win.offsetHeight;
        resizeState.startLeft = win.offsetLeft; resizeState.startTop = win.offsetTop;
        win.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'none');
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', doResizeTouch, { passive: false });
        document.addEventListener('touchend', stopResize);
        document.addEventListener('touchcancel', stopResize);
      }

      function doResizeTouch(e) {
        if (!resizeState.isResizing || e.touches.length !== 1) return;
        e.preventDefault();
        doResize({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      }

      function doResize(e) {
          if (!resizeState.isResizing) return;
          
          const dx = e.clientX - resizeState.startX;
          const dy = e.clientY - resizeState.startY;

          const minWidth = 200;
          const minHeight = 150;

          let newWidth = resizeState.startWidth;
          let newHeight = resizeState.startHeight;
          let newLeft = resizeState.startLeft;
          let newTop = resizeState.startTop;

          if (resizeState.edge.includes('right')) {
              newWidth = Math.max(minWidth, resizeState.startWidth + dx);
          }
          if (resizeState.edge.includes('bottom')) {
              newHeight = Math.max(minHeight, resizeState.startHeight + dy);
          }
          if (resizeState.edge.includes('left')) {
              const proposedWidth = resizeState.startWidth - dx;
              if (proposedWidth > minWidth) {
                  newWidth = proposedWidth;
                  newLeft = resizeState.startLeft + dx;
              } else {
                  newWidth = minWidth;
                  newLeft = resizeState.startLeft + (resizeState.startWidth - minWidth);
              }
          }
          if (resizeState.edge.includes('top')) {
              const proposedHeight = resizeState.startHeight - dy;
              if (proposedHeight > minHeight) {
                  newHeight = proposedHeight;
                  newTop = resizeState.startTop + dy;
              } else {
                  newHeight = minHeight;
                  newTop = resizeState.startTop + (resizeState.startHeight - minHeight);
              }
          }

          win.style.width = `${newWidth}px`;
          win.style.height = `${newHeight}px`;
          win.style.left = `${newLeft}px`;
          win.style.top = `${newTop}px`;
      }

      function stopResize() {
          resizeState.isResizing = false;
          win.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = '');
          document.removeEventListener('mousemove', doResize);
          document.removeEventListener('mouseup', stopResize);
          document.removeEventListener('touchmove', doResizeTouch);
          document.removeEventListener('touchend', stopResize);
          document.removeEventListener('touchcancel', stopResize);
      }
  }

  document.querySelector('.desktop').appendChild(win);

  // --- Initialize app content AFTER appending the window ---
  // Use setTimeout to ensure the element is fully in the DOM
  setTimeout(() => {
    if (title === 'Internet Explorer') window.initInternetExplorer(win, window.showNotification);
    if (title === 'Snake') window.initSnake(win, window.showNotification);
    if (title === 'Minesweeper') window.initMinesweeper(win, window.showNotification);
    if (title === 'Notepad') window.initNotepad(win, window.showNotification); 
    if (title === 'Paint') window.initPaint(win, window.showNotification); 
    if (title === 'Calculator') window.initCalculator(win, window.showNotification);
    if (title === 'Hydra App') window.initHydra(win, window.showNotification, createWindow);
    if (title === 'Calendar') window.initCalendar(win, window.showNotification);
    if (title === 'Windows Media Player') window.initMusicPlayer(win, window.showNotification, win.dataset.filecontent); 
    if (title === 'Minecraft') window.initMinecraft(win, window.showNotification);
    if (title === 'Error Takeover') window.initErrorTester(win, window.showNotification);
    if (title === 'You Are An Idiot') window.initIdiot(win, window.showNotification, createWindow);
    if (title === 'Roblox') window.initRoblox(win, window.showNotification);
    if (title === 'AOL Instant Messenger') window.initAIM(win, window.showNotification);
    if (title === 'Command Prompt') window.initCommandPrompt(win, window.showNotification);
    if (title === 'VirtualBox') window.initVirtualBox(win, window.showNotification);
    if (title === 'Task Manager') window.initTaskManager(win, window.showNotification);
    if (title === 'BSOD Creator') window.initBSODCreator(win, window.showNotification);
    if (title.startsWith('Antivirus 2003')) window.initAntivirus(win, window.showNotification);
    if (title === 'Flash Player') window.initFlashPlayer(win, window.showNotification, win.dataset.filePath);
    if (title === 'Stick Figures') window.initStickFigures(win, window.showNotification);
    if (title === 'NL TV') window.initNlTv(win, window.showNotification);
    if (originalTitle === '@WanaDecryptor@') window.initWannaCry(win);
  }, 0);

  // Set the current file explorer if this is a File Explorer window.
  if (title === "File Explorer") {
    window.currentFileExplorer = win;
  }

  // Apply horror mode if active
  if (isHorrorMode && window.applyHorrorToWindow) {
    setTimeout(() => window.applyHorrorToWindow(win), 100);
  }

  return win;
}

export function createTaskbarButton(programName, win, customTitle = null) {
  const taskbarButtons = document.querySelector('.taskbar-buttons');
  const btn = document.createElement('button');
  btn.className = "taskbar-button";
  btn.setAttribute('data-id', win.dataset.id);
  btn.style.border = "none";
  btn.style.outline = "none";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.justifyContent = "flex-start";
  btn.style.padding = "0 5px";
  btn.style.backgroundRepeat = "no-repeat";
  btn.style.backgroundPosition = "center";
  btn.style.backgroundSize = "contain";
  btn.style.userSelect = "none";
  btn.style.boxShadow = "none";
  btn.style.border = "none";

  const itemForIcon = getItemByPath(`C:/Apps/${programName}`) || getItemByPath(`C:/Games/${programName}`) || { program: programName };
  const iconImg = document.createElement('img');
  iconImg.src = getIcon(itemForIcon.program || programName);
  iconImg.style.width = "20px";
  iconImg.style.height = "20px";
  iconImg.style.marginRight = "5px";
  iconImg.style.flexShrink = "0";

  const btnText = document.createElement('span');
  btnText.textContent = customTitle || programName;
  btnText.style.textAlign = "left";
  btnText.style.flexGrow = "1";

  btn.appendChild(iconImg);
  btn.appendChild(btnText);

  btn.style.backgroundImage = "url('taskbarbutton.png')";

  btn.addEventListener('click', () => {
    if (window.currentActiveWindowId && window.currentActiveWindowId !== win.dataset.id) {
      updateTaskbarButtonState(window.currentActiveWindowId, false);
    }
    window.currentActiveWindowId = win.dataset.id;
    updateTaskbarButtonState(win.dataset.id, true);

    // When showing a hidden window, use display:flex instead of block
    // This fixes layout issues with windows
    if (win.style.display === 'none') {
      win.style.display = "flex";
    }

    win.style.zIndex = getNextZIndex();
  });

  btn.addEventListener('mouseover', () => {
    if (window.currentActiveWindowId !== win.dataset.id) {
      btn.style.backgroundImage = "url('taskbarbuttonhighlight.png')";
    }
  });
  btn.addEventListener('mouseout', () => {
    if (window.currentActiveWindowId !== win.dataset.id) {
      btn.style.backgroundImage = "url('taskbarbutton.png')";
    }
  });
  btn.addEventListener('mousedown', () => {
    btn.style.backgroundImage = "url('taskbarbuttonpress.png')";
  });
  btn.addEventListener('mouseup', () => {
    if (window.currentActiveWindowId === win.dataset.id) {
      btn.style.backgroundImage = "url('taskbarbuttonpress.png')";
    } else {
      btn.style.backgroundImage = "url('taskbarbutton.png')";
    }
  });

  taskbarButtons.appendChild(btn);
}

function updateTaskbarButtonState(buttonId, isSelected) {
  const btn = document.querySelector(`.taskbar-button[data-id="${buttonId}"]`);
  if (btn) {
    if (isSelected) {
      btn.style.backgroundImage = "url('taskbarbuttonpress.png')";
    } else {
      btn.style.backgroundImage = "url('taskbarbutton.png')";
    }
  }
}

export function openProperties(itemOrPath) {
  if (itemOrPath && itemOrPath.dataset && itemOrPath.dataset.recycleKey) {
    const recycleKey = itemOrPath.dataset.recycleKey;
    if (recycleBin && recycleBin.children && recycleBin.children[recycleKey]) {
      const entry = recycleBin.children[recycleKey];
      const originalPath = entry.originalPath;
      const originalName = entry.originalName;
      const item = entry.item;
      let type = "Unknown";
      let details = "";
      if (item) {
        if (item.type === "file") {
          type = "File";
          details = `File Path: ${originalPath}`;
        } else if (item.type === "folder") {
          type = "Folder";
          details = `Folder Path: ${originalPath}`;
        } else if (item.type === "app") {
          type = "Application";
          details = `Executable/Window: ${originalName}`;
        } else if (item.type === "shortcut") {
          type = "Shortcut";
          details = `Points to: ${item.target || "undefined"}`;
          if (item.target) {
            const targetItem = getItemByPath(item.target);
            if (targetItem) {
              details += `<br>Target Type: ${targetItem.type}`;
              if (targetItem.type === 'app' && targetItem.program) {
                 details += ` (${targetItem.program})`;
              }
            }
          }
        }
      }
      const win = createWindow("Properties");
      import("./properties.js").then(m => m.renderProperties(win, {
        name: originalName, path: originalPath, item, isRecycle: true
      }));
       return;
    }
  }
  let filePath = "";
  if (typeof itemOrPath === "string") {
    filePath = itemOrPath;
  } else if (itemOrPath && itemOrPath.dataset && itemOrPath.getAttribute('data-path')) {
    filePath = itemOrPath.getAttribute('data-path');
  } else {
    if (itemOrPath && itemOrPath.querySelector) {
        const span = itemOrPath.querySelector('span');
        if (span) filePath = span.textContent;
    } else {
        filePath = itemOrPath.innerText || "";
    }
  }
  if (typeof filePath !== "string") {
    console.error("openProperties: filePath is not a string");
    return;
  }
  const item = getItemByPath(filePath);
  let name = filePath;
  let type = "Unknown";
  let details = "";
  if (item) {
    const segments = filePath.split('/').filter(Boolean);
    name = segments[segments.length - 1];
    if (!name) name = "C:"; 
    if (item.type === "file") {
      type = "File";
      details = `File Path: ${filePath}`;
    } else if (item.type === "folder") {
      type = "Folder";
      details = `Folder Path: ${filePath}`;
    } else if (item.type === "app") {
      type = "Application";
      details = `Opens Program: ${item.program || name}`;
    } else if (item.type === "shortcut") {
      type = "Shortcut";
      details = `Points to: ${item.target || "undefined"}`;
      if (item.target) {
        const targetItem = getItemByPath(item.target);
        if (targetItem) {
          details += `<br>Target Type: ${targetItem.type}`;
          if (targetItem.type === 'app' && targetItem.program) {
             details += ` (${targetItem.program})`;
          }
        }
      }
    }
  } else {
     let segments = filePath.split('/').filter(Boolean);
     name = segments[segments.length - 1] || filePath; 
     type = "Unknown/Not Found";
     details = `Path: ${filePath}`;
  }
  const win = createWindow("Properties");
  import("./properties.js").then(m => m.renderProperties(win, {
    name, path: filePath, item
  }));
}