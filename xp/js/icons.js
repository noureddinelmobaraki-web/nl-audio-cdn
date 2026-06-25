// Consolidated icon mapping for all apps and folders.
const iconMapping = {
  "my computer": "My Computer.ico",
  "recycle bin": "recycle-bin-683244_960_720.webp",
  "internet explorer": "Internet Explorer 6.png", 
  "paint": "21w0apjl-removebg-preview.png",
  "notepad": "Notepad.png",
  "snake": "54965.jpg",
  "pinball": "Pinball.png",
  "hydra app": "hydra.webp",
  "windows media player": "media player icon.webp",
  "calculator": "Calculator.png",  
  "calendar": "calendar.png",
  "plants vs zombies": "ZombieHead.png",
  "minesweeper": "Minesweeper.png",
  "my documents": "MyDocuments[1].png",
  "my pictures": "fig-05_1_-removebg-preview.png",
  "my music": "My_Music_WinXP.webp",
  "minecraft": "minecraft.png",
  "roblox": "Roblox_icon_2006.svg",
  "mario": "LUMMM_icon_512px.png",
  "solitaire": "Solitaire.png",
  "aol instant messenger": "aim.webp",
  "folder": "folder.png",
  "error takeover": "error.png",
  "you are an idiot": "Idioticon.png",
  "totally not a virus": "exe-icon.png",
  "virus": "exe-icon.png", // Added for the virus program
  "bonzibuddy": "bonzi-icon.png",
  "information": "Information.png",
  "virtualbox": "Virtualbox_logo.png",
  "progressbar": "progressbar.png",
  "bsod creator": "bsod_creator.png",
  "antivirus 2003": "antivirus_icon.png",
  "flash player": "Flash_icon.png",
  "stick figures": "icon_stickfigure.webp",
  "memz": "exe-icon.png", // NEW: MEMZ icon mapping
  "wannacrypt0r": "exe-icon.png",
  "@wanadecryptor@": "wannacry_icon.png",
  "wana decrypt0r 2.0": "wannacry_icon.png",
  ".txt": "TXT.png",
  ".bmp": "Bitmap.png", 
  ".png": "Bitmap.png", 
  ".jpg": "Bitmap.png", 
  ".jpeg": "Bitmap.png",
  ".gif": "Bitmap.png", 
  ".webp": "Bitmap.png",
  ".mp3": "Generic Audio.png",
  ".wav": "Generic Audio.png", 
  ".ogg": "Generic Audio.png", 
  ".swf": "Flash_icon.png",
  ".dll": "DLL.png",
  "command prompt": "Command Prompt.png",
  "control panel": "Control Panel.png",
  "appearance and themes": "Appearance.png",
  "network and internet connections": "Network and Internet.png",
  "sounds, speech, and audio devices": "Audio Devices.png",
  "add or remove programs": "Programs.png",
  "task manager": "Task Manager.png",
  "default": "Default.png"
};

// Helper function to extract the file extension (e.g., ".txt")
export function getFileExtension(filename) {
  if (typeof filename !== 'string') return null;
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    // No extension or file starts with a dot
    return null;
  }
  return filename.substring(lastDotIndex).toLowerCase();
}

// Helper to get item by path from global fileSystem
function getItemByPath(path) {
    if (typeof path !== 'string' || !window.fileSystem) return null;
    const cleanPath = path.replace(/^[A-Za-z]:[\\/]/, '');
    const parts = cleanPath.split(/[\\/]/).filter(Boolean);
    let current = window.fileSystem['C:'];
    for (const part of parts) {
        if (current && current.children && typeof current.children === 'object') {
            const caseInsensitiveKey = Object.keys(current.children).find(key => key.toLowerCase() === part.toLowerCase());
            if (caseInsensitiveKey) {
                current = current.children[caseInsensitiveKey];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    return current;
}

export function getIcon(pathOrName, depth = 0) {
  if (depth > 5) { // Prevent infinite recursion for shortcuts
      return iconMapping["default"];
  }

  // First, check if it's a path
  if (pathOrName.includes('/') || pathOrName.includes('\\')) {
    const item = getItemByPath(pathOrName);
    const name = pathOrName.split(/[\\/]/).pop();

    if (item) {
      // Per-file custom icon (e.g. NL songs use a music-note gif; NL pictures
      // use a thumbnail of the image itself). Takes priority over extension.
      if (typeof item.icon === 'string' && item.icon) {
        return item.icon;
      }
      if (item.type === 'shortcut' && item.target) {
        // For shortcuts, get the icon of the target
        return getIcon(item.target, depth + 1);
      }
      if (item.type === 'app' && item.program) {
        // For apps, use the program name to find the icon
        const programKey = item.program.toLowerCase();
        if (iconMapping.hasOwnProperty(programKey)) {
          return iconMapping[programKey];
        }
      }
      if (item.type === 'folder') {
        return iconMapping["folder"];
      }
      // For files (or apps without a program prop), fall through to check extension
    }
    
    // Fallback for files or if item lookup fails but it looks like a path
    const extension = getFileExtension(name);
    if (extension && iconMapping.hasOwnProperty(extension)) {
      return iconMapping[extension];
    }
    if(extension) return iconMapping["default"]; // Default file icon for unknown extensions
  }

  // If not a path or if path-based logic didn't return, treat as a name
  const nameKey = pathOrName.toLowerCase();
  if (iconMapping.hasOwnProperty(nameKey)) {
    return iconMapping[nameKey];
  }

  // Final fallback
  return iconMapping["default"];
}