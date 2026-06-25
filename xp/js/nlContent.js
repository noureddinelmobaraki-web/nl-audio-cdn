// ============================================================================
//  NL Content Integration
//  Pulls real content from the NL website (same origin = no CORS) and injects
//  it into the XP virtual filesystem so it appears as native files/folders.
//
//  Desktop layout (next to DANGER!!!):
//    • "My Music"    → every song from songs.json (HLS .m3u8, via hls.js)
//    • "My Pictures" → the me_bit + lens gallery images (open in Paint)
//  Games stay in C:/Games/Flash Games/ (played via Ruffle).
//
//  Adding future content is easy: songs/games come from the SAME data files
//  the live site uses (games.json / songs.json), so anything you add there
//  shows up here automatically on next load. For pictures, add a URL to the
//  ME_BITS / LENS arrays below (or upload me_bit_N.webp / N.webp to the CDN).
// ============================================================================

const SITE_BASE = 'https://noureddinelmobaraki-web.github.io/NL';
const CDN_BASE = 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn';
const GAMES_BASE = `${CDN_BASE}/games`;

// Gallery image URLs (mirror src/constants/assets.ts -> ASSETS.profile).
const ME_BITS = Array.from({ length: 9 }, (_, i) => `${CDN_BASE}/me_bit_${i + 1}.webp`);
const LENS = Array.from({ length: 9 }, (_, i) => `${CDN_BASE}/${i + 1}.webp`);

// Build a SWF url exactly like the main site does (GamesPage.tsx buildUrl).
function buildGameUrl(dir, file) {
  return `${GAMES_BASE}/${encodeURIComponent(dir)}/${encodeURIComponent(file)}`;
}

// Sanitize a title for use as a filename key (avoid path separators).
function safeFileName(title) {
  return String(title).replace(/[\\/]/g, '-').trim();
}

// Ensure a top-level folder exists on the Desktop, then return its children map.
function ensureDesktopFolder(fileSystem, name) {
  const desktop =
    fileSystem && fileSystem['C:'] && fileSystem['C:'].children.Desktop;
  if (!desktop || !desktop.children) return null;
  if (!desktop.children[name] || desktop.children[name].type !== 'folder') {
    desktop.children[name] = { type: 'folder', children: {} };
  }
  return desktop.children[name].children;
}

// ── Games → C:/Games/Flash Games/ (played via Ruffle) ─────────────────────
async function loadNlGames(fileSystem) {
  try {
    const res = await fetch(`${SITE_BASE}/data/games.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const games = Array.isArray(data && data.games) ? data.games : [];

    const flashGames =
      fileSystem &&
      fileSystem['C:'] &&
      fileSystem['C:'].children.Games &&
      fileSystem['C:'].children.Games.children['Flash Games'] &&
      fileSystem['C:'].children.Games.children['Flash Games'].children;
    if (!flashGames) {
      console.warn('[NL] Flash Games folder not found; skipping games injection.');
      return 0;
    }

    let added = 0;
    games.forEach((g) => {
      if (!g || !g.dir || !g.swf || !g.title) return;
      const key = `${safeFileName(g.title)}.swf`;
      flashGames[key] = { type: 'file', content: buildGameUrl(g.dir, g.swf) };
      added++;
    });
    console.log(`[NL] Injected ${added} games into Flash Games folder.`);
    return added;
  } catch (e) {
    console.warn('[NL] Could not load games.json:', e);
    return 0;
  }
}

// ── Songs → Desktop/My Music (played via hls.js) ───────────────────────
// songs.json is a bare array: [{ id, title, url, hasLrc, lrcFile, bgIndex }].
// `url` is a full HLS (.m3u8) URL on the CDN. The Windows Media Player app reads
// both the Music folder and Desktop/My Music, and plays .m3u8 through hls.js.
async function loadNlSongs(fileSystem) {
  try {
    const res = await fetch(`${SITE_BASE}/data/songs.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const songs = Array.isArray(data)
      ? data
      : (Array.isArray(data && data.songs) ? data.songs : []);

    const myMusic = ensureDesktopFolder(fileSystem, 'My Music');
    if (!myMusic) {
      console.warn('[NL] Desktop folder not found; skipping songs injection.');
      return 0;
    }

    let added = 0;
    songs.forEach((s) => {
      if (!s || !s.url || !s.title) return;
      const url = /^https?:\/\//i.test(s.url)
        ? s.url
        : `${CDN_BASE}/${String(s.url).replace(/^\/+/, '')}`;
      const key = `${safeFileName(s.title)}.m3u8`;
      myMusic[key] = { type: 'file', content: url };
      added++;
    });
    console.log(`[NL] Injected ${added} songs into Desktop/My Music folder.`);
    return added;
  } catch (e) {
    console.warn('[NL] Could not load songs.json:', e);
    return 0;
  }
}

// ── Pictures → Desktop/My Pictures (open in Paint) ─────────────────────
async function loadNlPictures(fileSystem) {
  try {
    const myPictures = ensureDesktopFolder(fileSystem, 'My Pictures');
    if (!myPictures) {
      console.warn('[NL] Desktop folder not found; skipping pictures injection.');
      return 0;
    }

    let added = 0;
    ME_BITS.forEach((url, i) => {
      myPictures[`Me Bit ${i + 1}.webp`] = { type: 'file', content: url };
      added++;
    });
    LENS.forEach((url, i) => {
      myPictures[`Lens ${i + 1}.webp`] = { type: 'file', content: url };
      added++;
    });
    console.log(`[NL] Injected ${added} pictures into Desktop/My Pictures folder.`);
    return added;
  } catch (e) {
    console.warn('[NL] Could not inject pictures:', e);
    return 0;
  }
}

// Public entrypoint — called once at boot from init.js (before updateDesktopIcons).
export async function loadNlContent(fileSystem) {
  await loadNlGames(fileSystem);
  await loadNlSongs(fileSystem);
  await loadNlPictures(fileSystem);
}
