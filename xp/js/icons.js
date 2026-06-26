// Consolidated icon mapping for all apps and folders.
const iconMapping = {
  "nl spotify": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJnIiBjeD0iMzglIiBjeT0iMzAlIiByPSI4MCUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzJiZTA2YSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBmOWQ0NiIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjMwIiBmaWxsPSJ1cmwoI2cpIiBzdHJva2U9IiMwYzdhMzciIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0xOCAzOCBxMTQgLTkgMzAgLTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMTkgMzAgcTEzIC04IDI3IC0yLjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzLjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iLjkyIi8+PHBhdGggZD0iTTIwIDIzIHExMiAtNyAyMyAtMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIuODUiLz48dGV4dCB4PSIzMiIgeT0iNTIiIGZvbnQtZmFtaWx5PSJUYWhvbWEsQXJpYWwiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDYzZDFjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OTDwvdGV4dD48L3N2Zz4K",
  "vlc media player": "VLC.png",
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
  "movies": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB4PSI2IiB5PSIxMiIgd2lkdGg9IjUyIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzFiMWIxYiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxyZWN0IHg9IjYiIHk9IjEyIiB3aWR0aD0iNiIgaGVpZ2h0PSI0MCIgZmlsbD0iIzExMSIvPjxyZWN0IHg9IjUyIiB5PSIxMiIgd2lkdGg9IjYiIGhlaWdodD0iNDAiIGZpbGw9IiMxMTEiLz48ZyBmaWxsPSIjZjVjNTE4Ij48cmVjdCB4PSI3LjUiIHk9IjE1IiB3aWR0aD0iMyIgaGVpZ2h0PSI0IiByeD0iMSIvPjxyZWN0IHg9IjcuNSIgeT0iMjMiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PHJlY3QgeD0iNy41IiB5PSIzMSIgd2lkdGg9IjMiIGhlaWdodD0iNCIgcng9IjEiLz48cmVjdCB4PSI3LjUiIHk9IjM5IiB3aWR0aD0iMyIgaGVpZ2h0PSI0IiByeD0iMSIvPjxyZWN0IHg9IjcuNSIgeT0iNDUiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PHJlY3QgeD0iNTMuNSIgeT0iMTUiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PHJlY3QgeD0iNTMuNSIgeT0iMjMiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PHJlY3QgeD0iNTMuNSIgeT0iMzEiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PHJlY3QgeD0iNTMuNSIgeT0iMzkiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PHJlY3QgeD0iNTMuNSIgeT0iNDUiIHdpZHRoPSIzIiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PC9nPjxyZWN0IHg9IjE1IiB5PSIxNiIgd2lkdGg9IjM0IiBoZWlnaHQ9IjMyIiBmaWxsPSIjMGQwZDBkIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMTEiIGZpbGw9IiNlNTA5MTQiLz48cGF0aCBkPSJNMjkgMjYgTDQwIDMyIEwyOSAzOCBaIiBmaWxsPSIjZmZmIi8+PC9zdmc+",
  "nl player": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMzYThlZTYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxYzVmYjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSI1IiB5PSI5IiB3aWR0aD0iNTQiIGhlaWdodD0iNDYiIHJ4PSI2IiBmaWxsPSJ1cmwoI2IpIiBzdHJva2U9IiMwZTNkNzgiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHJlY3QgeD0iOSIgeT0iMTkiIHdpZHRoPSI0NiIgaGVpZ2h0PSIyOCIgcng9IjIiIGZpbGw9IiMwYTBhMGEiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjMzIiByPSIxMCIgZmlsbD0iI2U1MDkxNCIvPjxwYXRoIGQ9Ik0yOSAyOCBMMzggMzMgTDI5IDM4IFoiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIxMS41IiBjeT0iMTMuNSIgcj0iMS42IiBmaWxsPSIjZmY1ZjU2Ii8+PGNpcmNsZSBjeD0iMTciIGN5PSIxMy41IiByPSIxLjYiIGZpbGw9IiNmZmJkMmUiLz48Y2lyY2xlIGN4PSIyMi41IiBjeT0iMTMuNSIgcj0iMS42IiBmaWxsPSIjMjdjOTNmIi8+PHJlY3QgeD0iMzAiIHk9IjExIiB3aWR0aD0iMjQiIGhlaWdodD0iNSIgcng9IjIuNSIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC44NSIvPjwvc3ZnPg==",
  "nl tv": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48bGluZSB4MT0iMjQiIHkxPSIxOCIgeDI9IjE1IiB5Mj0iNyIgc3Ryb2tlPSIjNDQ0IiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGxpbmUgeDE9IjQwIiB5MT0iMTgiIHgyPSI0OSIgeTI9IjciIHN0cm9rZT0iIzQ0NCIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjUiIHk9IjE3IiB3aWR0aD0iNTQiIGhlaWdodD0iMzgiIHJ4PSI1IiBmaWxsPSIjM2EzYTNhIiBzdHJva2U9IiMxYTFhMWEiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9IjkiIHk9IjIxIiB3aWR0aD0iMzgiIGhlaWdodD0iMzAiIHJ4PSIyIiBmaWxsPSIjNWRiNGYwIi8+PHJlY3QgeD0iOSIgeT0iMjEiIHdpZHRoPSIzOCIgaGVpZ2h0PSIzMCIgcng9IjIiIGZpbGw9InVybCgjZykiLz48Y2lyY2xlIGN4PSI1MyIgY3k9IjI3IiByPSIyLjQiIGZpbGw9IiM3Q0ZDMDAiLz48Y2lyY2xlIGN4PSI1MyIgY3k9IjM1IiByPSIyLjQiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSI1MC41IiB5PSI0MiIgd2lkdGg9IjUiIGhlaWdodD0iNyIgcng9IjEiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSIxNyIgeT0iNTUiIHdpZHRoPSI3IiBoZWlnaHQ9IjUiIGZpbGw9IiMyYTJhMmEiLz48cmVjdCB4PSI0MCIgeT0iNTUiIHdpZHRoPSI3IiBoZWlnaHQ9IjUiIGZpbGw9IiMyYTJhMmEiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmZmZmYiIHN0b3Atb3BhY2l0eT0iMC4zNSIvPjxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4K",
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