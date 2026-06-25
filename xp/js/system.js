// Global system state: file system and utility functions.
import { openErrorWindow } from './errorWindow.js';
import { showBSOD } from './bsod.js';

export const fileSystem = {
  'C:': {
    type: "folder",
    children: {
      'Desktop': {
        type: "folder",
        children: {
          'My Computer': { type: "app", program: "My Computer" },
          'Recycle Bin': { type: "app", program: "Recycle Bin" },  
          'Information': { type: "shortcut", target: "C:/Apps/Information" },
          'Internet Explorer': { type: "shortcut", target: "C:/Apps/Internet Explorer" },
          'Notepad': { type: "shortcut", target: "C:/Apps/Notepad" },
          'Paint': { type: "shortcut", target: "C:/Apps/Paint" },
          'Calculator': { type: "shortcut", target: "C:/Apps/Calculator" },
          'Calendar': { type: "shortcut", target: "C:/Apps/Calendar" },
          'Windows Media Player': { type: "shortcut", target: "C:/Apps/Windows Media Player" },
          'Flash Player': { type: "shortcut", target: "C:/Apps/Flash Player" },
          'Snake': { type: "shortcut", target: "C:/Games/Snake" },
          'Minesweeper': { type: "shortcut", target: "C:/Games/Minesweeper" },
          'Plants vs Zombies': { type: "shortcut", target: "C:/Games/Plants vs Zombies" },
          'Minecraft': { type: "shortcut", target: "C:/Games/Minecraft" },
          'Roblox': { type: "shortcut", target: "C:/Games/Roblox" },
          'Mario': { type: "shortcut", target: "C:/Games/Mario" },
          'Progressbar': { type: "shortcut", target: "C:/Games/Progressbar" },
          'Pinball': { type: "shortcut", target: "C:/Games/Pinball" },
          'Solitaire': { type: "shortcut", target: "C:/Games/Solitaire" },
          'AOL Instant Messenger': { type: "shortcut", target: "C:/Apps/AOL Instant Messenger" },
          'Command Prompt': { type: "shortcut", target: "C:/Apps/Command Prompt" },
          'BonziBuddy': { type: "shortcut", target: "C:/Apps/BonziBuddy" },
          'VirtualBox': { type: "shortcut", target: "C:/Apps/VirtualBox" },
          'Stick Figures': { type: "shortcut", target: "C:/Apps/Stick Figures" },
          'NL TV': { type: "shortcut", target: "C:/Apps/NL TV" },
          'Movies': { type: "shortcut", target: "C:/Apps/Movies" },
          'VLC media player': { type: "shortcut", target: "C:/Apps/VLC media player" },
          'DANGER!!!': {
            type: "folder",
            children: {
              'Hydra App': { type: "shortcut", target: "C:/Games/Hydra App" },
              'Error Takeover': { type: "shortcut", target: "C:/Apps/Error Takeover" },
              'You Are An Idiot': { type: "shortcut", target: "C:/Apps/You Are An Idiot" },
              'BSOD Creator': { type: "shortcut", target: "C:/Apps/BSOD Creator" },
              'totally not a virus': { type: "app", program: "virus", virus: true },
              'MEMZ': { type: "app", program: "MEMZ", virus: 'memz' },
              'WARNING.txt': { type: "file", content: "WARNING: The programs in this folder might destroy your computer, and may contain flashing lights and loud sounds." },
              'WannaCrypt0r': { type: "app", program: "WannaCrypt0r", virus: true }
            }
          }
        }
      },
      'Games': {
        type: "folder",
        children: {
          'Snake': { type: "app", program: "Snake" },
          'Minesweeper': { type: "app", program: "Minesweeper" },
          'Hydra App': { type: "app", program: "Hydra App" },
          'Plants vs Zombies': { type: "app", program: "Plants vs Zombies" },
          'Minecraft': { type: "app", program: "Minecraft" },
          'Roblox': { type: "app", program: "Roblox" },
          'Mario': { type: "app", program: "Mario" },
          'Progressbar': { type: "app", program: "Progressbar" },
          'Pinball': { type: "app", program: "Pinball" },
          'Solitaire': { type: "app", program: "Solitaire" },
          'Flash Games': {
            type: "folder",
            children: {
              'mario-starcatcher-2.swf': { type: "file", content: "flash_mario-starcatcher-2.swf" },
              'Use-Boxmen.swf': { type: "file", content: "flash_Use-Boxmen.swf" },
              'this-is-the-only-level.swf': { type: "file", content: "flash_this-is-the-only-level.swf" },
              'ball-revamped.swf': { type: "file", content: "flash_ball-revamped.swf" },
              'happy-wheels.swf': { type: "file", content: "flash_happy-wheels.swf" },
              'worlds-hardest-game.swf': { type: "file", content: "flash_worlds-hardest-game.swf" },
              'mario-flash.swf': { type: "file", content: "flash_mario-flash.swf" },
              'papasburgeria.swf': { type: "file", content: "papasburgeria.swf" },
              'raft-wars-2.swf': { type: "file", content: "raft-wars-2.swf" },
              'bloonstd3.swf': { type: "file", content: "bloonstd3.swf" }
            }
          }
        }
      },
      'Apps': {
        type: "folder",
        children: {
          'Internet Explorer': { type: "app", program: "Internet Explorer" },
          'Information': { type: "app", program: "Information" },
          'Notepad': { type: "app", program: "Notepad" },
          'Paint': { type: "app", program: "Paint" },
          'Calculator': { type: "app", program: "Calculator" },
          'Calendar': { type: "app", program: "Calendar" },
          'Windows Media Player': { type: "app", program: "Windows Media Player" },
          'Error Takeover': { type: "app", program: "Error Takeover" },
          'You Are An Idiot': { type: "app", program: "You Are An Idiot" },
          'AOL Instant Messenger': { type: "app", program: "AOL Instant Messenger" },
          'Command Prompt': { type: "app", program: "Command Prompt" },
          'BonziBuddy': { type: "app", program: "BonziBuddy" },
          'VirtualBox': { type: "app", program: "VirtualBox" },
          'Control Panel': { type: "app", program: "Control Panel" },
          'Task Manager': { type: "app", program: "Task Manager" },
          'BSOD Creator': { type: "app", program: "BSOD Creator" },
          'Flash Player': { type: "app", program: "Flash Player" },
          'Stick Figures': { type: "app", program: "Stick Figures" },
          'NL TV': { type: "app", program: "NL TV" },
          'Movies': { type: "app", program: "Movies" },
          'VLC media player': { type: "app", program: "VLC media player" }
        }
      },
      'Program Files': {
        type: "folder",
        children: {
          'Paint': { type: "app", program: "Paint" }
        }
      },
      'Users': {
        type: "folder",
        children: {
          'User': {
            type: "folder",
            children: {
              'Documents': {
                type: "folder",
                children: {
                  'notepad.txt': { type: "file", content: "Some text content for Notepad" }
                }
              },
              'Pictures': {
                type: "folder",
                children: {
                  'Sunset.jpg': { type: 'file', content: 'image_Sunset.jpg' },
                  'Winter.jpg': { type: 'file', content: 'image_Winter.jpg' },
                  'Blue hills.jpg': { type: 'file', content: 'image_Blue hills.jpg' },
                  'Water lilies.jpg': { type: 'file', content: 'image_Water lilies.jpg' }
                }
              },
              'Music': { 
                type: "folder", 
                children: {
                  'Jetpack Joyride Theme.mp3': { type: "file", content: "music_JetpackJoyride.mp3" },
                  'Super Mario 64 - Dire Dire Docks.mp3': { type: "file", content: "music_DireDireDocks.mp3" },
                  'Relaxed Scene.mp3': { type: "file", content: "music_RelaxedScene.mp3" },
                  'Kevin MacLeod - New Friendly.mp3': { type: "file", content: "music_NewFriendly.mp3" },
                  'Green Hill Zone - Act 1.mp3': { type: "file", content: "music_GreenHillZone.mp3" },
                  'Nintendo Wii - Mii Channel Theme.mp3': { type: "file", content: "music_MiiChannel.mp3" },
                  'Geometry Dash - Stereo Madness.mp3': { type: "file", content: "music_StereoMadness.mp3" },
                  'Minecraft - Sweden.mp3': { type: "file", content: "music_MinecraftSweeden.mp3" },
                  'Wii U - Mii Maker Theme.mp3': { type: "file", content: "music_MiiMakerWiiU.mp3" },
                  'Wii Sports Theme.mp3': { type: "file", content: "music_WiiSports.mp3" },
                  'Plants vs Zombies - Day Stage.mp3': { type: "file", content: "music_PvZDay.mp3" },
                  'Windows XP installation music [HD].mp3': { type: "file", content: "music_WindowsXP.mp3" },
                  'Tomodachi Collection - Making a Friend.mp3': { type: "file", content: "music_MakingAFriend.mp3" },
                  'DKC2 - Stickerbush Symphony.mp3': { type: "file", content: "music_StickerbushSymphony.mp3" },
                  'Wii Party - Main Menu.mp3': { type: "file", content: "music_WiiParty.mp3" }
                }
              }
            }
          }
        }
      },
      'WINDOWS': {
        type: "folder",
        children: {
          'system32': {
            type: "folder",
            children: {
              'kernel32.dll': { type: "file", content: "Binary data... cannot display." },
              'user32.dll': { type: "file", content: "Binary data... cannot display." },
              'gdi32.dll': { type: "file", content: "Binary data... cannot display." },
              'ntdll.dll': { type: "file", content: "Binary data... cannot display." },
              'hal.dll': { type: "file", content: "Binary data... cannot display." },
              'shell32.dll': { type: "file", content: "Binary data... cannot display." },
              'advapi32.dll': { type: "file", content: "Binary data... cannot display." }
            }
          }
        }
      }
    }
  }
};

// Clipboard state
export let systemClipboard = null; // Stores { name: string, data: object }

// Internal counter for window z-index management.
let internalZIndex = 1;
export function getNextZIndex() {
  return internalZIndex++;
}

let windowCounter = 0; 
export function getNextWindowId() {
  return windowCounter++;
}

// Simple deep copy function for plain objects and primitives
export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Return primitives directly
  }

  if (Array.isArray(obj)) {
    return obj.map(deepCopy); // Recursively copy array elements
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = deepCopy(obj[key]); // Recursively copy object properties
    }
  }
  return newObj;
}

function triggerSystemCollapse() {
    // Spawn a bunch of error windows
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            openErrorWindow("SYSTEM_CRITICAL_FAILURE: UNABLE TO LOCATE SYSTEM32", true);
        }, i * 200);
    }

    // After a few seconds, show BSOD
    setTimeout(() => {
        const bsodContent = `A problem has been detected and Windows has been shut down to prevent damage
to your computer.

UNMOUNTABLE_BOOT_VOLUME

If this is the first time you've seen this Stop error screen,
restart your computer. If this screen appears again, follow
these steps:

Check to make sure any new hardware or software is properly installed.
If this is a new installation, ask your hardware or software manufacturer
for any Windows updates you might need.

Technical information:

*** STOP: 0x000000ED (0x80F12A40, 0xC0000032, 0x00000000, 0x00000000)`;

        showBSOD(bsodContent, () => {
            window.location.reload();
        }, "Restart");
    }, 4000);
}

export function handleCriticalDelete(path) {
    const lowerPath = path.toLowerCase().replace(/\/$/, ''); // Normalize path
    const criticalPaths = [
        "c:/windows",
        "c:/windows/system32"
    ];

    if (criticalPaths.includes(lowerPath)) {
        if (confirm(`Are you sure you want to delete ${path}? This is a critical system folder and deleting it will make your system unstable.`)) {
            triggerSystemCollapse();
        }
        return true; // Indicates that the delete was handled (or cancelled)
    }
    return false; // Not a critical delete
}

export function copyToClipboard(sourcePath) {
  const item = getItemByPath(sourcePath);
  if (item) {
    const parts = sourcePath.replace(/\/$/, '').split('/'); // Remove trailing slash if exists before split
    const name = parts[parts.length - 1];
    // Store a deep copy of the data, not a reference
    systemClipboard = { name: name, data: deepCopy(item) };
    if (window.showNotification) {
        window.showNotification(`Copied "${name}" to clipboard.`);
    }
    console.log("Copied to clipboard:", systemClipboard);
  } else {
    systemClipboard = null; // Clear clipboard if source not found
    if (window.showNotification) {
        window.showNotification(`Error: Could not find item to copy at ${sourcePath}.`);
    }
    console.error("Copy failed: Item not found at", sourcePath);
  }
}

export function pasteFromClipboard(targetFolderPath) {
  if (!systemClipboard || !systemClipboard.data) {
    if (window.showNotification) {
        window.showNotification("Clipboard is empty.");
    }
    return false; // Nothing to paste
  }

  // Ensure target path ends with a slash
  if (!targetFolderPath.endsWith('/')) {
    targetFolderPath += '/';
  }

  const targetFolder = getItemByPath(targetFolderPath);
  if (!targetFolder || targetFolder.type !== 'folder' || !targetFolder.children) {
     if (window.showNotification) {
        window.showNotification(`Error: Cannot paste into "${targetFolderPath}". Invalid location.`);
     }
    console.error("Paste failed: Target folder not found or invalid", targetFolderPath);
    return false; // Invalid target
  }

  let newName = systemClipboard.name;
  let counter = 1;
  const baseName = newName.replace(/ \(\d+\)$/, '').replace(/^Copy of /, ''); // Base name without "Copy of" or "(n)"

  // Handle initial "Copy of" prefix if pasting in the same folder (check is simplified here, assumes different folder paste always needs a check)
  // A more robust check would compare source and target paths.
  const nameExists = (name) => Object.keys(targetFolder.children).some(key => key.toLowerCase() === name.toLowerCase());

  if (nameExists(newName)) {
      newName = `Copy of ${baseName}`;
  }

  // Handle further collisions with "(n)" suffix
  while (nameExists(newName)) {
    counter++;
    newName = `Copy of ${baseName} (${counter})`;
    // Safety break for extreme cases
    if (counter > 100) {
        if (window.showNotification) {
            window.showNotification("Error: Could not find a unique name to paste.");
        }
        console.error("Paste failed: Could not generate unique name after 100 attempts");
        return false;
    }
  }

  // Add the deep copied data to the target folder
  targetFolder.children[newName] = deepCopy(systemClipboard.data);
   if (window.showNotification) {
        window.showNotification(`Pasted "${newName}" into ${targetFolderPath}.`);
   }
  console.log("Pasted item:", newName, "into", targetFolderPath);
  return true; // Success
}

export function getItemByPath(path) {
  const cleanPath = path.replace(/^[A-Za-z]:[\\/]/, '');
  const parts = cleanPath.split(/[\\/]/).filter(Boolean);
  let current = fileSystem['C:'];
  for (let part of parts) {
    if (current && current.children && current.children.hasOwnProperty(part)) {
      current = current.children[part];
    } else {
      return null;
    }
  }
  return current;
}

// New helper: splits a full file path into its parent folder and filename.
export function getFolderAndFilename(path) {
  if (!path.startsWith("C:/")) return { folder: null, filename: null };
  const withoutRoot = path.slice(3); // Remove "C:/"
  const parts = withoutRoot.split('/').filter(Boolean);
  if (parts.length === 0) return { folder: fileSystem['C:'], filename: "" };
  const filename = parts.pop();
  let current = fileSystem['C:'];
  parts.forEach(part => {
    if (current && current.children && current.children[part]) {
      current = current.children[part];
    } else {
      current = null;
    }
  });
  return { folder: current, filename: filename };
}

// Added recycleBin as a special, separate folder.
export const recycleBin = {
  type: "recyclebin",
  children: {}
};

export async function saveSnapshot() {
  // 1. Collect icon positions
  const iconPositions = {};
  const icons = document.querySelectorAll('.desktop .icons .icon');
  icons.forEach(icon => {
    const name = icon.querySelector('span').textContent;
    iconPositions[name] = {
      left: icon.style.left,
      top: icon.style.top
    };
  });

  // 2. Get wallpaper
  const wallpaper = document.querySelector('.desktop').style.backgroundImage;

  // 3. Create state object
  const snapshot = {
    fileSystem: fileSystem,
    recycleBin: recycleBin,
    desktop: {
      wallpaper: wallpaper,
      iconPositions: iconPositions
    }
  };

  // 4. Serialize and download
  try {
    const jsonString = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websim-xp-snapshot-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.showNotification) {
      window.showNotification("Snapshot saved successfully!");
    }
  } catch (error) {
    console.error("Failed to save snapshot:", error);
    if (window.showNotification) {
      window.showNotification("Error: Failed to save snapshot.");
    }
  }
}

export function loadSnapshot() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const snapshot = JSON.parse(e.target.result);

        if (!snapshot.fileSystem || !snapshot.recycleBin || !snapshot.desktop) {
          throw new Error("Invalid snapshot file format.");
        }

        // Close all windows and BonziBuddy instances before loading state
        document.querySelectorAll('.window').forEach(win => {
          const closeBtn = win.querySelector('button[aria-label="Close"]');
          if (closeBtn) {
            closeBtn.click();
          } else {
            win.remove();
          }
        });
        document.querySelectorAll('.bonzi-buddy').forEach(b => b.remove());
        
        // Load filesystem and recycle bin by mutating the existing objects
        Object.keys(fileSystem).forEach(key => delete fileSystem[key]);
        Object.assign(fileSystem, snapshot.fileSystem);

        Object.keys(recycleBin).forEach(key => delete recycleBin[key]);
        Object.assign(recycleBin, snapshot.recycleBin);
        
        document.querySelector('.desktop').style.backgroundImage = snapshot.desktop.wallpaper;

        if (window.updateDesktopIcons) {
          window.updateDesktopIcons();
        }

        // Apply positions after a short delay to ensure icons are rendered
        setTimeout(() => {
          const icons = document.querySelectorAll('.desktop .icons .icon');
          icons.forEach(icon => {
            const name = icon.querySelector('span').textContent;
            if (snapshot.desktop.iconPositions && snapshot.desktop.iconPositions[name]) {
              const pos = snapshot.desktop.iconPositions[name];
              icon.style.left = pos.left;
              icon.style.top = pos.top;
            }
          });
        }, 100);

        if (window.showNotification) {
          window.showNotification("Snapshot loaded successfully!");
        }

      } catch (error) {
        console.error("Failed to load snapshot:", error);
        if (window.showNotification) {
          window.showNotification(`Error loading snapshot: ${error.message}`);
        }
      }
    };
    reader.readAsText(file);
  });

  document.body.appendChild(fileInput);
  fileInput.click();
  // No need to remove immediately, it will be garbage collected.
}