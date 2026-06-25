import { startVirus } from "./virus.js";
import { getItemByPath } from "./system.js";
import { initBonziBuddy } from "./bonziBuddy.js";
import { startMemzVirus } from "./memz.js"; // NEW: MEMZ-specific virus
import { encryptAllFiles } from "./wannacry.js";

// Added currentWindow parameter to allow updating existing File Explorer
export function openItem(filePath, currentWindow = null) {
  filePath = filePath.trim().replace(/\\/g, '/');
  if (filePath !== "C:/" && filePath.endsWith("/")) {
    filePath = filePath.slice(0, -1);
  }
  const lowerFilePath = filePath.toLowerCase();

  // Special handling for Recycle Bin - always navigate to the canonical path
  if (lowerFilePath === "c:/desktop/recycle bin" || lowerFilePath === "c:/recycle bin") {
    // Check if we are already in a File Explorer window using the data-type attribute
    if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
      window.updateFileExplorer(currentWindow, "C:/Recycle Bin/");
    } else {
      const win = window.createWindow("File Explorer");
      window.updateFileExplorer(win, "C:/Recycle Bin/");
    }
    return;
  }

  const item = getItemByPath(filePath);
  if (!item) {
    window.openErrorWindow(`Windows cannot find '${filePath}'. Check the spelling and try again.`);
    return;
  }

  // Special case: WannaCrypt0r should not run; show an error instead
  if (item.program === "WannaCrypt0r") {
    // Encrypt all files (simulate)
    encryptAllFiles();
    // Refresh desktop icons
    if (window.updateDesktopIcons) window.updateDesktopIcons();
    // Refresh open File Explorer if present
    if (window.currentFileExplorer) {
      const explorerPathInput = window.currentFileExplorer.querySelector('input[type="text"]');
      if (explorerPathInput) {
        const currentDisplayPath = explorerPathInput.value.trim().toLowerCase() === "recycle bin" ? "C:/Recycle Bin/" : explorerPathInput.value.trim();
        window.updateFileExplorer(window.currentFileExplorer, currentDisplayPath);
      }
    }
    return;
  }

  const segments = filePath.split('/').filter(Boolean);
  const itemName = segments[segments.length - 1].toLowerCase();
  const originalItemName = segments[segments.length - 1]; // Preserve case for display

  if (item.program === "My Computer") {
    // Check if we are already in a File Explorer window using the data-type attribute
    if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
       window.updateFileExplorer(currentWindow, "C:/");
    } else {
       const win = window.createWindow("File Explorer");
       window.updateFileExplorer(win, "C:/");
    }
    return;
  }
  
  if (item.program === "Recycle Bin") {
     if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
      window.updateFileExplorer(currentWindow, "C:/Recycle Bin/");
    } else {
      const win = window.createWindow("File Explorer");
      window.updateFileExplorer(win, "C:/Recycle Bin/");
    }
    return;
  }

  if (item.program === "Control Panel") {
    // Control Panel always opens a new window
    const win = window.createWindow("Control Panel");
    import("./controlPanel.js").then(module => {
      module.initControlPanel(win, window.showNotification);
    });
    return;
  }

  if (item.program === "Task Manager") {
    // Task Manager always opens a new window
    const win = window.createWindow("Task Manager");
    // Note: initTaskManager will be called by the windowManager
    return;
  }

  if (item.type === "app" && item.virus) {
    // Support multiple virus variants
    if (item.virus === 'memz' || item.program === 'MEMZ') {
      startMemzVirus();
    } else {
      startVirus();
    }
    return;
  }

  if (item.type === "shortcut") {
    if (item.target) {
      const targetItem = getItemByPath(item.target);
      // Handle shortcuts to folders specifically
      if (targetItem && targetItem.type === "folder") {
         // If called from File Explorer, update it; otherwise open potentially new explorer
         if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
             const targetPath = item.target.endsWith('/') ? item.target : (item.target + '/');
             window.updateFileExplorer(currentWindow, targetPath);
         } else {
             // Pass null for currentWindow to force a new window if needed
             openItem(item.target, null);
         }
      } else {
         // For non-folder shortcuts, pass the currentWindow context if available
         openItem(item.target, currentWindow);
      }
      return;
    } else {
      // Handle shortcuts without a valid target, maybe open properties or show error?
      // Pass currentWindow context
      openItemBasedOnName(originalItemName, filePath, item.program, currentWindow);
      return;
    }
  }

  if (item.type === "file") {
    // Opening files always creates a new window (unless handled by Open With)
    if (itemName.endsWith('.txt')) {
      const win = window.createWindow("Notepad", null);
      win.dataset.filePath = filePath;
      win.dataset.filecontent = item.content || ""; // Pass content directly
      // initNotepad will be called by windowManager
    } else if (itemName.endsWith('.bmp') || itemName.endsWith('.png') || itemName.endsWith('.jpg') || itemName.endsWith('.jpeg') || itemName.endsWith('.gif') || itemName.endsWith('.webp')) {
      const win = window.createWindow("Paint", null);
      win.dataset.filePath = filePath;
      win.dataset.filecontent = item.content;
      // initPaint will be called by windowManager, which now handles loading
    } else if (itemName.endsWith('.mp3') || itemName.endsWith('.ogg') || itemName.endsWith('.wav')) {
      const win = window.createWindow("Windows Media Player");
      win.dataset.filePath = filePath;
      win.dataset.filecontent = item.content;
      // Do not call initMusicPlayer here since windowManager automatically
      // initializes the Windows Media Player instance.
    } else if (itemName.endsWith('.swf')) {
      const win = window.createWindow("Flash Player", null);
      win.dataset.filePath = filePath;
      win.dataset.filecontent = item.content; // Pass content URL
      // initFlashPlayer will be called by windowManager
    } else {
      // Unknown file type - open the "Open With..." dialog
      const openWithWin = window.createWindow("Open With");
      import("./openWith.js").then(module => {
        module.initOpenWith(openWithWin, filePath, window.showNotification);
      });
    }
    return;
  }

  if (item.type === "folder") {
    // Check if called from an existing File Explorer window
    if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
      // Update the existing window
      const normalized = filePath.endsWith('/') ? filePath : (filePath + '/');
      window.updateFileExplorer(currentWindow, normalized);
    } else {
      // Open a new window
      const win = window.createWindow("File Explorer");
      const normalized = filePath.endsWith('/') ? filePath : (filePath + '/');
      window.updateFileExplorer(win, normalized);
    }
    return;
  }

  if (item.type === "app") {
    // Apps generally open new windows, pass currentWindow context if needed
    openItemBasedOnName(originalItemName, filePath, item.program, currentWindow);
    return;
  }

  // Fallback for other types? Maybe just try to open a window with the name
  // Pass currentWindow context
  openItemBasedOnName(originalItemName, filePath, item.program, currentWindow);
}

// Helper function to open based on name (used for apps and fallbacks)
// Pass currentWindow context
function openItemBasedOnName(appName, filePath, programName, currentWindow = null) {
  const effectiveName = programName || appName;

  if (effectiveName === "Pinball") {
    // Show splash screen
    const splashScreen = document.createElement('div');
    splashScreen.style.position = 'fixed';
    splashScreen.style.top = '0';
    splashScreen.style.left = '0';
    splashScreen.style.width = '100vw';
    splashScreen.style.height = '100vh';
    splashScreen.style.backgroundColor = 'black';
    splashScreen.style.zIndex = '10001';
    splashScreen.style.display = 'flex';
    splashScreen.style.justifyContent = 'center';
    splashScreen.style.alignItems = 'center';

    const splashImage = document.createElement('img');
    splashImage.src = 'pinball startup.png';
    splashImage.style.maxWidth = '90%';
    splashImage.style.maxHeight = '90%';
    splashScreen.appendChild(splashImage);
    document.body.appendChild(splashScreen);

    setTimeout(() => {
      splashScreen.remove();
      window.createWindow(effectiveName);
    }, 2000);
    return;
  }

  if (effectiveName === "BonziBuddy") {
    initBonziBuddy(window.showNotification);
    return;
  }
  
  if (effectiveName === "Progressbar") {
    if (window.initProgressbar) {
      window.initProgressbar(window.showNotification);
    }
    return;
  }

  // Check if a window with this title already exists AND if it's the current window
  // This prevents opening duplicate windows from within itself (less relevant now)
  if (currentWindow && currentWindow.dataset.type === effectiveName) {
    // Potentially bring window to front or do nothing
    currentWindow.style.zIndex = window.getNextZIndex ? window.getNextZIndex() : 100;
    return;
  }

  // Create a new window if not Bonzi or if not trying to re-open self
  const win = window.createWindow(effectiveName);

  // Special handling for Command Prompt app by name
  if (effectiveName === "Command Prompt" && window.initCommandPrompt) {
    window.initCommandPrompt(win, window.showNotification);
  }
  // Other app initializations might go here if needed when opened by name/fallback
}