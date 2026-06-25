// ============================================================================
//  NL Content Integration
//  Pulls real content from the NL website (same origin = no CORS) and injects
//  it into the XP virtual filesystem so it appears as native files/apps.
//  Phase 1: Games (Flash/Ruffle).  Phase 2: Songs (HLS).  Pictures: later.
//
//  Adding future content is automatic: this fetches the SAME data files the
//  live site uses (games.json / songs.json), so anything you add there shows
//  up here on next load — no code changes needed.
// ============================================================================

const SITE_BASE = 'https://noureddinelmobaraki-web.github.io/NL';
const CDN_BASE = 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn';
const GAMES_BASE = `${CDN_BASE}/games`;

// Build a SWF url exactly like the main site does (GamesPage.tsx buildUrl).
function buildGameUrl(dir, file) {
  return `${GAMES_BASE}/${encodeURIComponent(dir)}/${encodeURIComponent(file)}`;
}

// Sanitize a title for use as a filename key (avoid path separators).
function safeFileName(title) {
  return String(title).replace(/[\\/]/g, '-').trim();
}

// ── Phase 1: Games → C:/Games/Flash Games/ (played via Ruffle) ────────────
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

// ── Phase 2: Songs → C:/Users/User/Music/My Songs/ (played via hls.js) ──────
// songs.json is a bare array: [{ id, title, url, hasLrc, lrcFile, bgIndex }].
// `url` is a full HLS (.m3u8) URL on the CDN. Windows Media Player reads the
// Music folder recursively and plays .m3u8 through hls.js (window.Hls).
async function loadNlSongs(fileSystem) {
  try {
    const res = await fetch(`${SITE_BASE}/data/songs.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const songs = Array.isArray(data)
      ? data
      : (Array.isArray(data && data.songs) ? data.songs : []);

    const music =
      fileSystem &&
      fileSystem['C:'] &&
      fileSystem['C:'].children.Users &&
      fileSystem['C:'].children.Users.children.User &&
      fileSystem['C:'].children.Users.children.User.children.Music;
    if (!music || !music.children) {
      console.warn('[NL] Music folder not found; skipping songs injection.');
      return 0;
    }

    // Create (or reuse) the "My Songs" subfolder.
    if (!music.children['My Songs'] || music.children['My Songs'].type !== 'folder') {
      music.children['My Songs'] = { type: 'folder', children: {} };
    }
    const mySongs = music.children['My Songs'].children;

    let added = 0;
    songs.forEach((s) => {
      if (!s || !s.url || !s.title) return;
      const url = /^https?:\/\//i.test(s.url)
        ? s.url
        : `${CDN_BASE}/${String(s.url).replace(/^\/+/, '')}`;
      const key = `${safeFileName(s.title)}.m3u8`;
      mySongs[key] = { type: 'file', content: url };
      added++;
    });
    console.log(`[NL] Injected ${added} songs into Music/My Songs folder.`);
    return added;
  } catch (e) {
    console.warn('[NL] Could not load songs.json:', e);
    return 0;
  }
}

// Public entrypoint — called once at boot from init.js (before updateDesktopIcons).
export async function loadNlContent(fileSystem) {
  await loadNlGames(fileSystem);
  await loadNlSongs(fileSystem);
  // Future phase (incremental):
  //   await loadNlPictures(fileSystem);  // images into C:/Users/User/Pictures/
}
