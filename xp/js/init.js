import { fileSystem, getItemByPath, getFolderAndFilename, saveSnapshot, loadSnapshot } from "./system.js";
import {
  updateDesktopIcons,
  repositionDesktopIconsInitial,
  addNewAppToDesktop,
  makeDraggable,
  findNextAvailablePosition
} from "./desktop.js";
import { createWindow, createTaskbarButton, openProperties } from "./windowManager.js";
import { getIcon } from "./icons.js"; 
import { initNotepad } from "./notepad.js";
import { initSnake } from "./snake.js";
import { initSolitaire } from "./solitaire.js";
import { initPipes } from "./pipes.js";
import { initCalendar } from "./calendar.js";
import { initHydra } from "./hydra.js";
import { initCalculator } from "./calculator.js";
import { initPaint } from "./paint.js";
import { updateFileExplorer } from "./updateFileExplorer.js";
import { initInternetExplorer } from "./internet-explorer.js";
import { initMinesweeper } from "./minesweeper.js";
import { initMusicPlayer } from "./music-player.js";
import { initMinecraft } from "./minecraft.js";
import { initErrorTester } from "./errorTester.js";
import { initIdiot } from "./idiot.js";
import { initRoblox } from "./roblox.js";
import { initAIM } from "./aim.js";
import { openItem } from "./openItem.js";
import { openErrorWindow } from "./errorWindow.js";
import { initCommandPrompt } from "./commandPrompt.js";
import { initBonziBuddy } from "./bonziBuddy.js";
import { initControlPanel } from "./controlPanel.js";
import { initVirtualBox } from "./virtualbox.js";
import { initTaskManager } from "./taskManager.js";
import { initOpenWith } from "./openWith.js"; 
import { initProgressbar } from "./progressbar.js";
import { initBSODCreator } from "./bsodCreator.js";
import { initAntivirus } from "./antivirus.js";
import { initFlashPlayer } from "./flashPlayer.js";
import { initStickFigures, spawnStickFigure, clearStickFigures } from "./stickFigures.js";
import { toggleHorrorMode } from "./horror.js";
import { initWannaCry } from "./wannacry.js";

// Make all the necessary functions and objects available globally
window.fileSystem = fileSystem;
window.updateDesktopIcons = updateDesktopIcons;
window.addNewAppToDesktop = addNewAppToDesktop;
window.createWindow = createWindow;
window.createTaskbarButton = createTaskbarButton;
window.openProperties = openProperties;
window.getIcon = getIcon;
window.initNotepad = initNotepad;
window.initSnake = initSnake;
window.initSolitaire = initSolitaire;
window.initPipes = initPipes;
window.initCalendar = initCalendar;
window.initHydra = initHydra;
window.initCalculator = initCalculator;
window.initPaint = initPaint;
window.updateFileExplorer = updateFileExplorer;
window.initInternetExplorer = initInternetExplorer;
window.initMinesweeper = initMinesweeper;
window.initMusicPlayer = initMusicPlayer;
window.initMinecraft = initMinecraft;
window.initErrorTester = initErrorTester;
window.initIdiot = initIdiot;
window.initRoblox = initRoblox;
window.initAIM = initAIM;
window.openItem = openItem;
window.openErrorWindow = openErrorWindow;
window.getItemByPath = getItemByPath;
window.getFolderAndFilename = getFolderAndFilename;  
window.initCommandPrompt = initCommandPrompt;
window.initBonziBuddy = initBonziBuddy;
window.initControlPanel = initControlPanel;
window.initVirtualBox = initVirtualBox;
window.initTaskManager = initTaskManager;
window.initOpenWith = initOpenWith; 
window.initProgressbar = initProgressbar;
window.initBSODCreator = initBSODCreator;
window.initAntivirus = initAntivirus;
window.initFlashPlayer = initFlashPlayer;
window.initStickFigures = initStickFigures;
window.initWannaCry = initWannaCry;
window.saveSnapshot = saveSnapshot;
window.loadSnapshot = loadSnapshot;

function closeStartMenu() {
  const startMenu = document.querySelector('.start-menu');
  if (startMenu) {
    startMenu.style.display = 'none';
  }
  const startButton = document.querySelector('.start-button');
  if (startButton) {
    startButton.classList.remove('active');
  }
}
window.closeStartMenu = closeStartMenu;

window.showContextMenu = (x, y, options) => {
  import("./contextMenu.js").then(module => module.showContextMenu(x, y, options));
};
window.hideContextMenu = () => {
  import("./contextMenu.js").then(module => module.hideContextMenu());
};

window.showNotification = function(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => { notification.remove(); }, 5000);
};

document.addEventListener('DOMContentLoaded', async () => {
  const ranMemz = (()=>{try{return localStorage.getItem('memz_ran')==='1'}catch{return false}})();
  if (ranMemz) {
    const overlay = document.createElement('div'); overlay.id='memz-lock-screen';
    overlay.style.cssText='position:fixed;inset:0;background:#000;display:flex;align-items:center;justify-content:center;z-index:10000;';
    const img=document.createElement('img'); img.src='/poptart1redrainbowfix_1.webp'; img.style.maxWidth='90%'; img.style.maxHeight='90%'; overlay.appendChild(img);
    const btn=document.createElement('button'); btn.textContent='Escape'; btn.style.cssText='position:absolute;bottom:40px;padding:8px 16px;display:none;';
    overlay.appendChild(btn); document.body.appendChild(overlay);
    setTimeout(()=>{btn.style.display='inline-block';},3000);
    btn.onclick=()=>{try{localStorage.removeItem('memz_ran');}catch{} window.location.reload();};
    return;
  }

  // Play Windows XP startup sound
  const startupSound = new Audio("Windows XP Startup.mp3");
  startupSound.play().catch(err => {
    console.warn('Could not play startup sound:', err);
  });

  updateDesktopIcons();

  // Get the currently logged in user's username and avatar if available
  let username = "Administrator";
  let avatarUrl = "/Profile_Chess.webp"; // Default avatar
  try {
    if (window.websim && window.websim.getUser) {
      const user = await window.websim.getUser();
      if (user && user.username && !/^ann?onymous$/i.test(user.username)) {
        username = user.username;
        avatarUrl = `https://images.websim.com/avatar/${user.username}`;
      }
    }
  } catch (err) {
    console.warn('Could not get user info:', err);
  }

  // Update the start menu header with the username and avatar
  const startMenuHeader = document.querySelector('.start-menu-header');
  if (startMenuHeader) {
    const avatarImg = startMenuHeader.querySelector('img');
    if (avatarImg) {
      avatarImg.src = avatarUrl;
      // Add error handler to fall back to default avatar if user avatar fails to load
      avatarImg.onerror = () => {
        avatarImg.src = "/Profile_Chess.webp";
      };
    }
    const usernameSpan = startMenuHeader.querySelector('span');
    if (usernameSpan) {
      usernameSpan.textContent = username;
    }
  }

  // Make the start menu wider to accommodate two columns properly.
  const startMenu = document.querySelector('.start-menu');
  startMenu.style.width = "300px";

  // Make the desktop available globally for context menu functionality
  window.desktopElement = document.querySelector('.desktop');

  // -------------------- Start Menu Setup --------------------
  const startMenuItemsContainer = document.querySelector('.start-menu-items');
  startMenuItemsContainer.innerHTML = "";
  startMenuItemsContainer.style.display = "flex";

  // First column: contains desktop items except those that should appear in the second column.
  const firstColumn = document.createElement('div');
  firstColumn.className = "start-menu-column first-column";
  firstColumn.style.flex = "1";
  firstColumn.style.display = "flex";
  firstColumn.style.flexDirection = "column";
  firstColumn.style.padding = "10px";

  // Separator: thin line between columns.
  const separator = document.createElement('div');
  separator.style.width = "1px";
  separator.style.backgroundColor = "#95bdee";
  separator.style.margin = "0";

  // Second column: set to #d3e5fa colored background; will contain My Documents, My Pictures, My Music, My Computer.
  const secondColumn = document.createElement('div');
  secondColumn.className = "start-menu-column second-column";
  secondColumn.style.flex = "1";
  secondColumn.style.display = "flex";
  secondColumn.style.flexDirection = "column";
  secondColumn.style.backgroundColor = "#d3e5fa";
  secondColumn.style.padding = "10px";
  secondColumn.style.margin = "0";  

  startMenuItemsContainer.appendChild(firstColumn);
  startMenuItemsContainer.appendChild(separator);
  startMenuItemsContainer.appendChild(secondColumn);

  const startButton = document.querySelector('.start-button');
  // Removed auto-populating Start menu from Desktop items; only handpicked items are shown now.
  // (Previously iterated desktopFolder.children and appended to firstColumn)

  // Find the first column for later use when pinning new items
  const firstColumnForPinning = startMenuItemsContainer.querySelector('.first-column');

  // Explicit left column items and order
  const addStartItem = (name, path) => {
    const smItem = document.createElement('div');
    smItem.className = 'start-menu-item';
    smItem.setAttribute('data-path', path);
    smItem.innerHTML = `<img src="${getIcon(name)}" alt="${name} icon" width="32" height="32"><span>${name}</span>`;
    smItem.addEventListener('click', () => { const p = smItem.getAttribute('data-path'); if (p) openItem(p); closeStartMenu(); });
    firstColumn.appendChild(smItem);
  };
  addStartItem('Internet Explorer', 'C:/Apps/Internet Explorer/');
  addStartItem('Information', 'C:/Apps/Information/');
  // gray divider
  const grayDivider = document.createElement('div');
  grayDivider.style.height = '1px'; grayDivider.style.background = '#c0c0c0'; grayDivider.style.margin = '6px 0';
  firstColumn.appendChild(grayDivider);
  // remaining items
  addStartItem('Notepad', 'C:/Apps/Notepad/');
  addStartItem('Windows Media Player', 'C:/Apps/Windows Media Player/');
  addStartItem('Command Prompt', 'C:/Apps/Command Prompt/');
  addStartItem('Minesweeper', 'C:/Games/Minesweeper/');
  addStartItem('Solitaire', 'C:/Games/Solitaire/');
  addStartItem('Pinball', 'C:/Games/Pinball/');
  addStartItem('Paint', 'C:/Apps/Paint/');

  const secondItems = [
    { name: "My Documents", path: "C:/Users/User/Documents/" },
    { name: "My Pictures", path: "C:/Users/User/Pictures/" },
    { name: "My Music", path: "C:/Users/User/Music/" },
    { name: "My Computer", path: "C:/" },
    { name: "Control Panel", path: "C:/Apps/Control Panel/" },
    { name: "Task Manager", path: "C:/Apps/Task Manager/" } 
  ];
  secondItems.forEach(item => {
    const smItem = document.createElement('div');
    smItem.className = 'start-menu-item';
    smItem.setAttribute('data-path', item.path);
    smItem.innerHTML = `<img src="${getIcon(item.program || item.name)}" alt="${item.name} icon" width="32" height="32"><span>${item.name}</span>`;
    smItem.addEventListener('click', () => { const path = smItem.getAttribute('data-path'); if(path) openItem(path); closeStartMenu(); });
    secondColumn.appendChild(smItem);
    // add blue dividers
    if (item.name === 'My Computer' || item.name === 'Task Manager') {
      const blueDivider = document.createElement('div');
      blueDivider.style.height = '1px'; blueDivider.style.background = '#95bdee'; blueDivider.style.margin = '6px 0';
      secondColumn.appendChild(blueDivider);
    }
  });

  // --- Add Horror Mode, Save, and Load buttons here to avoid race conditions ---
  const horrorModeItem = document.createElement('div');
  horrorModeItem.className = 'start-menu-item';
  horrorModeItem.style.marginTop = '6px'; // reduced from 20px
  horrorModeItem.innerHTML = `<span style="color: #f00; font-weight: bold;">Toggle Horror Mode</span>`;
  horrorModeItem.addEventListener('click', () => {
    toggleHorrorMode();
    closeStartMenu();
  });
  secondColumn.appendChild(horrorModeItem);

  const saveSnapshotItem = document.createElement('div');
  saveSnapshotItem.className = 'start-menu-item';
  saveSnapshotItem.style.marginTop = '10px';
  saveSnapshotItem.innerHTML = `<img src="Save.png" width="24" height="24" style="margin-right: 10px;"><span>Save Snapshot</span>`;
  saveSnapshotItem.addEventListener('click', () => {
    saveSnapshot();
    closeStartMenu();
  });
  secondColumn.appendChild(saveSnapshotItem);

  const loadSnapshotItem = document.createElement('div');
  loadSnapshotItem.className = 'start-menu-item';
  loadSnapshotItem.innerHTML = `<img src="Backups.png" width="24" height="24" style="margin-right: 10px;"><span>Load Snapshot</span>`;
  loadSnapshotItem.addEventListener('click', () => {
    loadSnapshot();
    closeStartMenu();
  });
  secondColumn.appendChild(loadSnapshotItem);

  startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = startMenu.style.display === 'block';
    if (isVisible) {
      closeStartMenu();
    } else {
      startMenu.style.display = 'block';
      startButton.classList.add('active');
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
      closeStartMenu();
    }
  });

  // Create fullscreen toggle button to the left of the clock
  (function createFullscreenToggle() {
    const taskbarRight = document.querySelector('.taskbar-right');
    if (!taskbarRight) return;
    const btn = document.createElement('button');
    btn.id = 'fullscreen-toggle';
    btn.title = 'Toggle fullscreen';
    btn.style.marginRight = '8px';
    btn.style.width = '30px';
    btn.style.height = '22px';
    btn.style.border = 'none';
    btn.style.background = 'transparent';
    btn.style.cursor = 'pointer';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.color = 'white';
    btn.style.fontSize = '14px';
    btn.innerHTML = '⤢'; // fullscreen icon
    btn.addEventListener('click', async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          btn.innerHTML = '⤡';
        } else {
          await document.exitFullscreen();
          btn.innerHTML = '⤢';
        }
      } catch (e) {
        console.warn('Fullscreen toggle failed:', e);
      }
    });
    // Update icon when fullscreen changes (via ESC or other)
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) btn.innerHTML = '⤢';
      else btn.innerHTML = '⤡';
    });

    // Insert before the clock
    const clockEl = document.getElementById('clock');
    if (clockEl) {
      taskbarRight.insertBefore(btn, clockEl);
    } else {
      taskbarRight.appendChild(btn);
    }
  })();

  function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clock').style.marginRight = "20px";
    document.getElementById('clock').textContent = timeString;
  }
  setInterval(updateClock, 1000);
  updateClock();
});