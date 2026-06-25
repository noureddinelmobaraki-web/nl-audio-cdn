// ============================================================================
//  NL Content Integration
//  Pulls real content from the NL website (same origin = no CORS) and injects
//  it into the XP virtual filesystem so it appears as native files/apps.
//  Phase 1: Games (Flash/Ruffle).  Songs/Pictures added in later phases.
// ============================================================================

const SITE_BASE = 'https://noureddinelmobaraki-web.github.io/NL';
const CDN_BASE = 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn';
const GAMES_BASE = `${CDN_BASE}/games`;

// Build a SWF url exactly like the main site does (GamesPage.tsx buildUrl).
function buildGameUrl(dir, file) {
  return `${GAMES_BASE}/${encodeURIComponent(dir)}/${encodeURIComponent(file)}`;
}

// Inject every game from the site's games.json into C:/Games/Flash Games/.
// The existing Flash Player app already lists that folder and plays via Ruffle.
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
      // Sanitize title for use as a filename key (avoid slashes).
      const safeTitle = String(g.title).replace(/[\\/]/g, '-').trim();
      const key = `${safeTitle}.swf`;
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

// Public entrypoint — called once at boot from init.js (before updateDesktopIcons).
export async function loadNlContent(fileSystem) {
  await loadNlGames(fileSystem);
  // Future phases (added incrementally):
  //   await loadNlSongs(fileSystem);     // needs hls.js in music-player.js
  //   await loadNlPictures(fileSystem);  // needs image source URLs
}
