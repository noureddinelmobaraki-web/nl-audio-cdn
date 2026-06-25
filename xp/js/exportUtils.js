export async function exportFile(fileName, itemData) {
  const { getFileExtension } = await import("./icons.js");
  if (!itemData || itemData.type !== "file" || itemData.content === undefined) {
    window.showNotification(`Error: Cannot export '${fileName}'.`);
    return;
  }
  let blob, mime = "application/octet-stream";
  const ext = getFileExtension(fileName);
  if (ext === ".txt") mime = "text/plain";
  else if ([".png",".jpg",".jpeg",".gif",".bmp",".webp"].includes(ext)) mime = `image/${ext.slice(1)}`;
  else if ([".mp3",".wav",".ogg"].includes(ext)) mime = `audio/${ext.slice(1)}`;
  try {
    const c = itemData.content;
    const isAudio = [".mp3",".wav",".ogg"].includes(ext);
    if (typeof c === "string" && c.startsWith("data:")) {
      const res = await fetch(c); blob = await res.blob(); const m = c.match(/^data:(.*?);/); if (m) mime = m[1];
    } else if (typeof c === "string" && (c.startsWith("http") || c.startsWith("/") || isAudio)) {
      const res = await fetch(c); if (!res.ok) throw new Error(res.statusText); blob = await res.blob(); const ct = res.headers.get("content-type"); if (ct) mime = ct.split(";")[0];
    } else if (typeof c === "string") {
      blob = new Blob([c], { type: mime });
    } else {
      window.showNotification(`Error: Unsupported content for '${fileName}'.`); return;
    }
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    window.showNotification(`Exported '${fileName}'.`);
  } catch (e) {
    console.error(e); window.showNotification(`Error exporting '${fileName}': ${e.message}`);
  }
}

export async function exportFolder(folderName, folderData) {
  if (!folderData || folderData.type !== "folder" || !folderData.children) {
    window.showNotification(`Error: Cannot export folder '${folderName}'.`); return;
  }
  const JSZipMod = await import("https://esm.sh/jszip@3.10.1"); const JSZip = JSZipMod.default || JSZipMod;
  const zip = new JSZip();
  async function addFolder(z, name, folder) {
    const dir = z.folder(name);
    for (const key of Object.keys(folder.children)) {
      const child = folder.children[key];
      if (child.type === "folder") {
        await addFolder(dir, key, child);
      } else if (child.type === "file") {
        let data;
        const c = child.content;
        if (typeof c === "string" && c.startsWith("data:")) {
          const res = await fetch(c); data = await res.blob();
        } else if (typeof c === "string" && (c.startsWith("http") || c.startsWith("/"))) {
          const res = await fetch(c); if (!res.ok) continue; data = await res.blob();
        } else if (typeof c === "string") {
          data = c;
        } else {
          continue;
        }
        dir.file(key, data);
      }
    }
  }
  await addFolder(zip, folderName, folderData);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = `${folderName}.zip`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  window.showNotification(`Exported '${folderName}.zip'.`);
}