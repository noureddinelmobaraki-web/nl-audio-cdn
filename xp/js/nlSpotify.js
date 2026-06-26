// nlSpotify.js — "NL spotify": a full-featured, XP-glass music player for the NL XP system.
// Self-contained vanilla JS (no external deps). Streams the 116-track
// "NL fv songs of all time" library directly from the CDN (media/nl-fv-songs/*.m4a).
//
// Public surface:
//   export function initNLSpotify(win, showNotification)   // wired by init.js
//   window.openNLSpotify({ url, title, artist })            // optional external open
//
// Audio graph: <audio> -> MediaElementSource -> 10x BiquadFilter (EQ)
//              -> StereoPanner -> Gain -> Analyser -> destination
// Features: play/pause/next/prev, seek + buffered, volume + mute, shuffle,
//   repeat (off/all/one), playback speed, 10-band EQ + presets + bypass,
//   spectrum visualizer, LRC lyrics (auto-fetch + manual), search/library,
//   generated artwork, calm reactions + favorites, MediaSession, localStorage state.

const NL_TRACKS = [{"file": "song_001.m4a", "url": "media/nl-fv-songs/song_001.m4a", "title": "Mi Amore (V2)", "artist": "7liwa"}, {"file": "song_002.m4a", "url": "media/nl-fv-songs/song_002.m4a", "title": "Fataat Al Khair", "artist": "Abbu Alli"}, {"file": "song_003.m4a", "url": "media/nl-fv-songs/song_003.m4a", "title": "U.Z.I", "artist": "A.L.A"}, {"file": "song_004.m4a", "url": "media/nl-fv-songs/song_004.m4a", "title": "A Horse with No Name", "artist": "America"}, {"file": "song_005.m4a", "url": "media/nl-fv-songs/song_005.m4a", "title": "Rhyme Serve Me", "artist": "Art-Smoke"}, {"file": "song_006.m4a", "url": "media/nl-fv-songs/song_006.m4a", "title": "Blessings (Extended Version)", "artist": "Big Sean"}, {"file": "song_007.m4a", "url": "media/nl-fv-songs/song_007.m4a", "title": "Duvet", "artist": "bôa"}, {"file": "song_008.m4a", "url": "media/nl-fv-songs/song_008.m4a", "title": "Rak chayaa bel khlayaa", "artist": "Cheb Bilal"}, {"file": "song_009.m4a", "url": "media/nl-fv-songs/song_009.m4a", "title": "Bullet and a Target", "artist": "Citizen Cope"}, {"file": "song_010.m4a", "url": "media/nl-fv-songs/song_010.m4a", "title": "Back Up (feat. Big Sean)", "artist": "Dej Loaf"}, {"file": "song_011.m4a", "url": "media/nl-fv-songs/song_011.m4a", "title": "Back To Back", "artist": "Drake"}, {"file": "song_012.m4a", "url": "media/nl-fv-songs/song_012.m4a", "title": "Pop Style", "artist": "Drake"}, {"file": "song_013.m4a", "url": "media/nl-fv-songs/song_013.m4a", "title": "Trust Nobody", "artist": "Hippie Sabotage"}, {"file": "song_014.m4a", "url": "media/nl-fv-songs/song_014.m4a", "title": "Vienen A Verme (Theme from El Chapo)", "artist": "iLe"}, {"file": "song_015.m4a", "url": "media/nl-fv-songs/song_015.m4a", "title": "The Last Kingdom Blood Will Prevail", "artist": "John Lunn"}, {"file": "song_016.m4a", "url": "media/nl-fv-songs/song_016.m4a", "title": "All Time Low", "artist": "Jon Bellion"}, {"file": "song_017.m4a", "url": "media/nl-fv-songs/song_017.m4a", "title": "L'morphiniya 12", "artist": "L'morphine"}, {"file": "song_018.m4a", "url": "media/nl-fv-songs/song_018.m4a", "title": "Aniki", "artist": "Lquinze"}, {"file": "song_019.m4a", "url": "media/nl-fv-songs/song_019.m4a", "title": "Hashrab Hashish", "artist": "Luka Salam"}, {"file": "song_020.m4a", "url": "media/nl-fv-songs/song_020.m4a", "title": "غصن رمان", "artist": "maryam shehab"}, {"file": "song_021.m4a", "url": "media/nl-fv-songs/song_021.m4a", "title": "24", "artist": "Money Man"}, {"file": "song_022.m4a", "url": "media/nl-fv-songs/song_022.m4a", "title": "Eva (feat. Kira7)", "artist": "NAB FAKE"}, {"file": "song_023.m4a", "url": "media/nl-fv-songs/song_023.m4a", "title": "Too Late", "artist": "nixy"}, {"file": "song_024.m4a", "url": "media/nl-fv-songs/song_024.m4a", "title": "Man O To", "artist": "Nu"}, {"file": "song_025.m4a", "url": "media/nl-fv-songs/song_025.m4a", "title": "Dizeres", "artist": "Orgânico"}, {"file": "song_026.m4a", "url": "media/nl-fv-songs/song_026.m4a", "title": "Hal 2", "artist": "Oum, M-Carlos"}, {"file": "song_027.m4a", "url": "media/nl-fv-songs/song_027.m4a", "title": "Peter, Paul And Mary Early in the Morning 2004 Remaster", "artist": "Unknown"}, {"file": "song_028.m4a", "url": "media/nl-fv-songs/song_028.m4a", "title": "Show Must Go On", "artist": "Rilès"}, {"file": "song_029.m4a", "url": "media/nl-fv-songs/song_029.m4a", "title": "Smooth Operator", "artist": "Sade"}, {"file": "song_030.m4a", "url": "media/nl-fv-songs/song_030.m4a", "title": "Selena Gomez & The Scene Love You Like A Love Song", "artist": "Unknown"}, {"file": "song_031.m4a", "url": "media/nl-fv-songs/song_031.m4a", "title": "ميل على بلدي", "artist": "Shalby Younis"}, {"file": "song_032.m4a", "url": "media/nl-fv-songs/song_032.m4a", "title": "Bullet From A Gun", "artist": "Skepta"}, {"file": "song_033.m4a", "url": "media/nl-fv-songs/song_033.m4a", "title": "Dark Red", "artist": "Steve Lacy"}, {"file": "song_034.m4a", "url": "media/nl-fv-songs/song_034.m4a", "title": "No Mediocre (feat. Iggy Azalea)", "artist": "T.I."}, {"file": "song_035.m4a", "url": "media/nl-fv-songs/song_035.m4a", "title": "L'ITALIANO", "artist": "Toto Cutugno"}, {"file": "song_036.m4a", "url": "media/nl-fv-songs/song_036.m4a", "title": "دايس", "artist": "طارق العربي طرقان"}, {"file": "song_037.m4a", "url": "media/nl-fv-songs/song_037.m4a", "title": "هزتني", "artist": "محمد الوهيبي"}, {"file": "song_038.m4a", "url": "media/nl-fv-songs/song_038.m4a", "title": "Thank You", "artist": "Dido"}, {"file": "song_039.m4a", "url": "media/nl-fv-songs/song_039.m4a", "title": "'Bout It", "artist": "JMSN"}, {"file": "song_040.m4a", "url": "media/nl-fv-songs/song_040.m4a", "title": "Fade Away", "artist": "Logic"}, {"file": "song_041.m4a", "url": "media/nl-fv-songs/song_041.m4a", "title": "N.Y. State Of Mind (Explicit Album Version)", "artist": "Nas"}, {"file": "song_042.m4a", "url": "media/nl-fv-songs/song_042.m4a", "title": "Unwritten", "artist": "Natasha Bedingfield"}, {"file": "song_043.m4a", "url": "media/nl-fv-songs/song_043.m4a", "title": "500 Miles (2004 Remaster)", "artist": "Peter, Paul And Mary"}, {"file": "song_044.m4a", "url": "media/nl-fv-songs/song_044.m4a", "title": "Quatrehuit l'Mkhokha II La suite feat l'Morphine", "artist": "Unknown"}, {"file": "song_045.m4a", "url": "media/nl-fv-songs/song_045.m4a", "title": "Won't Forget You (Edit)", "artist": "Shouse"}, {"file": "song_046.m4a", "url": "media/nl-fv-songs/song_046.m4a", "title": "Maybe Tomorrow", "artist": "Stereophonics"}, {"file": "song_047.m4a", "url": "media/nl-fv-songs/song_047.m4a", "title": "Selfish", "artist": "TWENTY88"}, {"file": "song_048.m4a", "url": "media/nl-fv-songs/song_048.m4a", "title": "Thuggish Ruggish Bone", "artist": "Bone Thugs-N-Harmony"}, {"file": "song_049.m4a", "url": "media/nl-fv-songs/song_049.m4a", "title": "Bonfire", "artist": "Childish Gambino"}, {"file": "song_050.m4a", "url": "media/nl-fv-songs/song_050.m4a", "title": "10 Bands", "artist": "Drake"}, {"file": "song_051.m4a", "url": "media/nl-fv-songs/song_051.m4a", "title": "Only Time", "artist": "Enya"}, {"file": "song_052.m4a", "url": "media/nl-fv-songs/song_052.m4a", "title": "Ready or Not", "artist": "Fugees"}, {"file": "song_053.m4a", "url": "media/nl-fv-songs/song_053.m4a", "title": "Where Ya At (feat. Drake)", "artist": "Future"}, {"file": "song_054.m4a", "url": "media/nl-fv-songs/song_054.m4a", "title": "All Mine", "artist": "Kanye West"}, {"file": "song_055.m4a", "url": "media/nl-fv-songs/song_055.m4a", "title": "Couteau Suisse", "artist": "L'morphine"}, {"file": "song_056.m4a", "url": "media/nl-fv-songs/song_056.m4a", "title": "Breathe Me", "artist": "Sia"}, {"file": "song_057.m4a", "url": "media/nl-fv-songs/song_057.m4a", "title": "Byeb’a Nas", "artist": "Abeer Nehme"}, {"file": "song_058.m4a", "url": "media/nl-fv-songs/song_058.m4a", "title": "Let The Drummer Kick (Album Version)", "artist": "Citizen Cope"}, {"file": "song_059.m4a", "url": "media/nl-fv-songs/song_059.m4a", "title": "Snake Eater", "artist": "Cynthia Harrell"}, {"file": "song_060.m4a", "url": "media/nl-fv-songs/song_060.m4a", "title": "Cleanin' Out My Closet", "artist": "Eminem"}, {"file": "song_061.m4a", "url": "media/nl-fv-songs/song_061.m4a", "title": "My Immortal", "artist": "Evanescence"}, {"file": "song_062.m4a", "url": "media/nl-fv-songs/song_062.m4a", "title": "Rai Machi Punk", "artist": "ISSAM"}, {"file": "song_063.m4a", "url": "media/nl-fv-songs/song_063.m4a", "title": "By Design", "artist": "Kid Cudi"}, {"file": "song_064.m4a", "url": "media/nl-fv-songs/song_064.m4a", "title": "Gang Related", "artist": "Logic"}, {"file": "song_065.m4a", "url": "media/nl-fv-songs/song_065.m4a", "title": "See You Again (feat. Kali Uchis)", "artist": "Tyler, The Creator"}, {"file": "song_066.m4a", "url": "media/nl-fv-songs/song_066.m4a", "title": "Future Swag", "artist": "Young Thug"}, {"file": "song_067.m4a", "url": "media/nl-fv-songs/song_067.m4a", "title": "The Tide Is High (Remastered 2001)", "artist": "Blondie"}, {"file": "song_068.m4a", "url": "media/nl-fv-songs/song_068.m4a", "title": "Gotta Have It", "artist": "JAY-Z"}, {"file": "song_069.m4a", "url": "media/nl-fv-songs/song_069.m4a", "title": "No Mistakes", "artist": "Kanye West"}, {"file": "song_070.m4a", "url": "media/nl-fv-songs/song_070.m4a", "title": "Favor for a Favor (feat. Scarface)", "artist": "Nas"}, {"file": "song_071.m4a", "url": "media/nl-fv-songs/song_071.m4a", "title": "Galbi 3achakli fiha sif", "artist": "Cheb Akil"}, {"file": "song_072.m4a", "url": "media/nl-fv-songs/song_072.m4a", "title": "Eurythmics Sweet Dreams Are Made of This Remastered", "artist": "Unknown"}, {"file": "song_073.m4a", "url": "media/nl-fv-songs/song_073.m4a", "title": "fukumean", "artist": "Gunna"}, {"file": "song_074.m4a", "url": "media/nl-fv-songs/song_074.m4a", "title": "Fire Squad", "artist": "J. Cole"}, {"file": "song_075.m4a", "url": "media/nl-fv-songs/song_075.m4a", "title": "Maybe IDK", "artist": "Jon Bellion"}, {"file": "song_076.m4a", "url": "media/nl-fv-songs/song_076.m4a", "title": "L'exorciste", "artist": "L'morphine"}, {"file": "song_077.m4a", "url": "media/nl-fv-songs/song_077.m4a", "title": "Bounce", "artist": "Logic"}, {"file": "song_078.m4a", "url": "media/nl-fv-songs/song_078.m4a", "title": "El-Kaoui", "artist": "Nabyla Maan"}, {"file": "song_079.m4a", "url": "media/nl-fv-songs/song_079.m4a", "title": "Freed From Desire (prod. Molella, Phil Jay)", "artist": "Gala"}, {"file": "song_080.m4a", "url": "media/nl-fv-songs/song_080.m4a", "title": "St. Tropez", "artist": "J. Cole"}, {"file": "song_081.m4a", "url": "media/nl-fv-songs/song_081.m4a", "title": "Violent Crimes", "artist": "Kanye West"}, {"file": "song_082.m4a", "url": "media/nl-fv-songs/song_082.m4a", "title": "Alright", "artist": "Kendrick Lamar"}, {"file": "song_083.m4a", "url": "media/nl-fv-songs/song_083.m4a", "title": "Skit", "artist": "L'morphine"}, {"file": "song_084.m4a", "url": "media/nl-fv-songs/song_084.m4a", "title": "Nsak", "artist": "ONZY"}, {"file": "song_085.m4a", "url": "media/nl-fv-songs/song_085.m4a", "title": "Big Amount", "artist": "2 Chainz"}, {"file": "song_086.m4a", "url": "media/nl-fv-songs/song_086.m4a", "title": "Massive", "artist": "Drake"}, {"file": "song_087.m4a", "url": "media/nl-fv-songs/song_087.m4a", "title": "G.O.M.D", "artist": "J. Cole"}, {"file": "song_088.m4a", "url": "media/nl-fv-songs/song_088.m4a", "title": "I Am The Greatest", "artist": "Logic"}, {"file": "song_089.m4a", "url": "media/nl-fv-songs/song_089.m4a", "title": "Heart To Heart", "artist": "Mac DeMarco"}, {"file": "song_090.m4a", "url": "media/nl-fv-songs/song_090.m4a", "title": "Nothing Else Matters (Remastered 2021)", "artist": "Metallica"}, {"file": "song_091.m4a", "url": "media/nl-fv-songs/song_091.m4a", "title": "Purnamadah", "artist": "Shantala"}, {"file": "song_092.m4a", "url": "media/nl-fv-songs/song_092.m4a", "title": "Tech N9ne feat Kendrick Lamar, ¡Mayday!, Kendall Morgan Fragile", "artist": "Unknown"}, {"file": "song_093.m4a", "url": "media/nl-fv-songs/song_093.m4a", "title": "Halftime", "artist": "Young Thug"}, {"file": "song_094.m4a", "url": "media/nl-fv-songs/song_094.m4a", "title": "No Role Modelz", "artist": "J. Cole"}, {"file": "song_095.m4a", "url": "media/nl-fv-songs/song_095.m4a", "title": "Take What You Want", "artist": "Post Malone"}, {"file": "song_096.m4a", "url": "media/nl-fv-songs/song_096.m4a", "title": "Lord Willin'", "artist": "Logic"}, {"file": "song_097.m4a", "url": "media/nl-fv-songs/song_097.m4a", "title": "Already Home", "artist": "JAY-Z"}, {"file": "song_098.m4a", "url": "media/nl-fv-songs/song_098.m4a", "title": "The Glory", "artist": "Kanye West"}, {"file": "song_099.m4a", "url": "media/nl-fv-songs/song_099.m4a", "title": "Ceux qui rêvent", "artist": "Pomme"}, {"file": "song_100.m4a", "url": "media/nl-fv-songs/song_100.m4a", "title": "Outro", "artist": "Big Sean"}, {"file": "song_101.m4a", "url": "media/nl-fv-songs/song_101.m4a", "title": "6 Man", "artist": "Drake"}, {"file": "song_102.m4a", "url": "media/nl-fv-songs/song_102.m4a", "title": "Boadicea (2009 Remaster)", "artist": "Enya"}, {"file": "song_103.m4a", "url": "media/nl-fv-songs/song_103.m4a", "title": "I Will Survive", "artist": "Gloria Gaynor"}, {"file": "song_104.m4a", "url": "media/nl-fv-songs/song_104.m4a", "title": "Ain't That Some Shit (Interlude)", "artist": "J. Cole"}, {"file": "song_105.m4a", "url": "media/nl-fv-songs/song_105.m4a", "title": "Guillotine", "artist": "Jon Bellion, Travis Mendes"}, {"file": "song_106.m4a", "url": "media/nl-fv-songs/song_106.m4a", "title": "Trap Niggas", "artist": "Future"}, {"file": "song_107.m4a", "url": "media/nl-fv-songs/song_107.m4a", "title": "Captcha", "artist": "L'morphine"}, {"file": "song_108.m4a", "url": "media/nl-fv-songs/song_108.m4a", "title": "Botola", "artist": "Stormy"}, {"file": "song_109.m4a", "url": "media/nl-fv-songs/song_109.m4a", "title": "Bre Petrunko", "artist": "Baklava"}, {"file": "song_110.m4a", "url": "media/nl-fv-songs/song_110.m4a", "title": "What You Know Bout Love", "artist": "Pop Smoke"}, {"file": "song_111.m4a", "url": "media/nl-fv-songs/song_111.m4a", "title": "Switch Up", "artist": "Big Sean, Common"}, {"file": "song_112.m4a", "url": "media/nl-fv-songs/song_112.m4a", "title": "مولاى انى ببابك", "artist": "El Sheikh Al Naqshabandy"}, {"file": "song_113.m4a", "url": "media/nl-fv-songs/song_113.m4a", "title": "Fly Me To The Moon (In Other Words)", "artist": "Julie London"}, {"file": "song_114.m4a", "url": "media/nl-fv-songs/song_114.m4a", "title": "Saint Pablo", "artist": "Kanye West"}, {"file": "song_115.m4a", "url": "media/nl-fv-songs/song_115.m4a", "title": "True", "artist": "Akira Yamaoka"}, {"file": "song_116.m4a", "url": "media/nl-fv-songs/song_116.m4a", "title": "Shahdaroba", "artist": "Roy Orbison"}];

const EQ_FREQS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EQ_PRESETS = {
  Flat:           [0,0,0,0,0,0,0,0,0,0],
  'Bass Boost':   [7,6,5,3,1,0,0,0,0,0],
  'Treble Boost': [0,0,0,0,0,1,3,5,6,7],
  Vocal:          [-2,-1,0,2,4,4,3,1,0,-1],
  Rock:           [5,4,2,0,-1,-1,0,2,3,4],
  Pop:            [-1,0,2,4,4,2,0,-1,-2,-2],
  Jazz:           [3,2,1,2,-1,-1,0,1,2,3],
  Classical:      [4,3,2,0,0,0,-1,-1,0,2],
  'Hip-Hop':      [6,5,3,2,1,-1,0,1,2,3],
  Electronic:     [5,4,1,0,-2,1,0,1,4,5]
};
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const STORE_KEY = 'nlspotify_state_v1';

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function fmtTime(s){ if(!isFinite(s)||s<0) s=0; const m=Math.floor(s/60), sec=Math.floor(s%60); return m+':'+String(sec).padStart(2,'0'); }
function hashHue(str){ let h=0; for(let i=0;i<(str||'').length;i++){ h=(h*31+str.charCodeAt(i))>>>0; } return h%360; }
function initials(t){ const p=(t||'?').trim().split(/\s+/); return (((p[0]||'')[0]||'?')+((p[1]||'')[0]||'')).toUpperCase(); }
function isRTL(s){ return /[\u0600-\u06FF]/.test(s||''); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function loadState(){ try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch(e){ return {}; } }
let _state = loadState();
function saveState(patch){ _state = Object.assign({}, _state, patch||{}); try { localStorage.setItem(STORE_KEY, JSON.stringify(_state)); } catch(e){} }

let stylesInjected = false;
function injectStyles(){
  if (stylesInjected || document.getElementById('nls-style')) { stylesInjected = true; return; }
  const st = document.createElement('style');
  st.id = 'nls-style';
  st.textContent = `
  .nls-root{--accent:#1DB954;--xpblue:#1B6AC9;display:flex;flex-direction:column;height:100%;width:100%;font-family:Tahoma,'Segoe UI',sans-serif;font-size:12px;color:#eaf2ff;position:relative;background:radial-gradient(120% 120% at 20% 0%,#22325b 0%,#161a2e 55%,#0d0f1c 100%);overflow:hidden}
  .nls-root *{box-sizing:border-box}
  .nls-glass{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 6px 18px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);position:relative}
  .nls-glass::before{content:'';position:absolute;left:0;right:0;top:0;height:38%;background:linear-gradient(rgba(255,255,255,.18),rgba(255,255,255,0));border-radius:inherit;pointer-events:none}
  .nls-tabs{display:flex;gap:4px;padding:6px 8px;flex:0 0 auto}
  .nls-tab{padding:4px 12px;border-radius:14px;cursor:pointer;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#cfe0ff;text-shadow:0 1px 1px rgba(0,0,0,.4);user-select:none}
  .nls-tab:hover{background:rgba(255,255,255,.14)}
  .nls-tab.active{background:linear-gradient(var(--xpblue),#0d3f86);color:#fff;border-color:rgba(255,255,255,.45)}
  .nls-main{display:flex;flex:1 1 auto;min-height:0;gap:8px;padding:0 8px 8px}
  .nls-side{flex:0 0 250px;border-radius:8px;display:flex;flex-direction:column;min-height:0;overflow:hidden}
  .nls-search{margin:8px;padding:5px 8px;border-radius:14px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.25);color:#fff;font-size:12px;outline:none}
  .nls-search::placeholder{color:#9fb2d8}
  .nls-listhead{display:flex;justify-content:space-between;align-items:center;padding:2px 12px 6px;color:#a9bbe0;font-size:11px}
  .nls-list{list-style:none;margin:0;padding:0 4px 6px;overflow-y:auto;flex:1 1 auto}
  .nls-li{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;white-space:nowrap}
  .nls-li:hover{background:rgba(255,255,255,.1)}
  .nls-li.active{background:linear-gradient(90deg,rgba(29,185,84,.35),rgba(29,185,84,.05));box-shadow:inset 2px 0 0 var(--accent)}
  .nls-li .num{width:20px;text-align:right;color:#8fa3cc;font-variant-numeric:tabular-nums;flex:0 0 auto}
  .nls-li .meta{overflow:hidden;flex:1 1 auto}
  .nls-li .t{display:block;overflow:hidden;text-overflow:ellipsis}
  .nls-li .a{display:block;font-size:11px;color:#9fb2d8;overflow:hidden;text-overflow:ellipsis}
  .nls-li .fav{flex:0 0 auto;color:#ff5d8f;opacity:0;font-size:13px}
  .nls-li.isfav .fav{opacity:1}
  .nls-li:hover .fav{opacity:.6}
  .nls-center{flex:1 1 auto;min-width:0;border-radius:8px;display:flex;flex-direction:column;overflow:hidden}
  .nls-view{flex:1 1 auto;min-height:0;display:none;overflow:auto}
  .nls-view.show{display:flex}
  /* Now playing */
  .nls-now{flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:18px;text-align:center}
  .nls-art{width:200px;height:200px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:bold;color:rgba(255,255,255,.92);text-shadow:0 2px 8px rgba(0,0,0,.5);box-shadow:0 10px 30px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.35);letter-spacing:1px}
  .nls-title{font-size:20px;font-weight:bold;text-shadow:0 1px 2px rgba(0,0,0,.5);max-width:90%}
  .nls-artist{font-size:14px;color:#bcd0f5}
  .nls-reactions{display:flex;gap:10px;margin-top:4px}
  .nls-react{font-size:18px;cursor:pointer;opacity:.8;transition:transform .15s ease,opacity .15s}
  .nls-react:hover{transform:scale(1.25);opacity:1}
  .nls-react.fav.on{filter:drop-shadow(0 0 6px #ff5d8f)}
  .nls-float{position:absolute;pointer-events:none;font-size:22px;animation:nlsfloat 1.4s ease-out forwards;z-index:5}
  @keyframes nlsfloat{0%{opacity:.9;transform:translateY(0) scale(.8)}100%{opacity:0;transform:translateY(-90px) scale(1.4)}}
  /* Visualizer */
  .nls-viz{align-items:stretch;justify-content:center;padding:10px}
  .nls-viz canvas{width:100%;height:100%;border-radius:8px;background:rgba(0,0,0,.25)}
  /* EQ */
  .nls-eq{flex-direction:column;padding:12px;gap:10px}
  .nls-eqtop{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .nls-eqbands{display:flex;justify-content:space-around;align-items:flex-end;flex:1 1 auto;gap:6px;min-height:150px}
  .nls-eqband{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:10px;color:#a9bbe0;height:100%}
  .nls-eqband input[type=range]{writing-mode:vertical-lr;direction:rtl;width:22px;height:120px;accent-color:var(--accent)}
  .nls-eqcurve{height:60px;width:100%;border-radius:6px;background:rgba(0,0,0,.25)}
  /* Lyrics */
  .nls-lyrics{flex-direction:column;padding:14px;gap:8px}
  .nls-lrcbox{flex:1 1 auto;overflow-y:auto;line-height:2;text-align:center;color:#9fb2d8;scroll-behavior:smooth}
  .nls-lrc-line{padding:2px 0;transition:color .2s,opacity .2s;opacity:.5}
  .nls-lrc-line.cur{color:#fff;opacity:1;font-weight:bold;text-shadow:0 0 8px rgba(29,185,84,.6)}
  .nls-lyrics textarea{width:100%;height:80px;background:rgba(0,0,0,.3);color:#eaf2ff;border:1px solid rgba(255,255,255,.25);border-radius:6px;font-family:Tahoma;font-size:12px;padding:6px}
  /* Info */
  .nls-info{flex-direction:column;padding:18px;gap:8px;line-height:1.8}
  .nls-info h3{margin:0 0 6px;color:#fff}
  .nls-info .row{display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);padding:4px 0}
  .nls-info .k{color:#9fb2d8}
  /* Controls bar */
  .nls-bar{flex:0 0 auto;border-radius:8px;margin:0 8px 8px;padding:6px 10px;display:flex;flex-direction:column;gap:6px}
  .nls-seekwrap{position:relative;height:14px;display:flex;align-items:center}
  .nls-buffered{position:absolute;left:0;top:5px;height:4px;background:rgba(255,255,255,.25);border-radius:3px;width:0}
  .nls-seek{position:relative;width:100%;accent-color:var(--accent);margin:0}
  .nls-ctlrow{display:flex;align-items:center;gap:8px}
  .nls-time{font-variant-numeric:tabular-nums;color:#bcd0f5;min-width:42px;text-align:center}
  .nls-btn{min-width:30px;height:28px;padding:0 7px;border-radius:6px;border:1px solid rgba(255,255,255,.22);background:linear-gradient(rgba(255,255,255,.18),rgba(255,255,255,.05));color:#eaf2ff;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}
  .nls-btn:hover{background:linear-gradient(rgba(255,255,255,.3),rgba(255,255,255,.1));border-color:rgba(255,255,255,.45)}
  .nls-btn:active{box-shadow:inset 0 2px 4px rgba(0,0,0,.4)}
  .nls-btn.on{color:#fff;background:linear-gradient(var(--accent),#0f7c37);border-color:rgba(255,255,255,.5)}
  .nls-btn.play{min-width:44px;height:34px;font-size:18px;background:linear-gradient(var(--accent),#0f7c37);color:#fff}
  .nls-vol{width:90px;accent-color:var(--accent)}
  .nls-sel{height:26px;border-radius:6px;background:rgba(0,0,0,.35);color:#eaf2ff;border:1px solid rgba(255,255,255,.25);font-size:11px}
  .nls-spacer{flex:1 1 auto}
  .nls-root ::-webkit-scrollbar{width:12px;height:12px}
  .nls-root ::-webkit-scrollbar-thumb{background:linear-gradient(var(--xpblue),#0d3f86);border-radius:6px;border:2px solid transparent;background-clip:content-box}
  .nls-root ::-webkit-scrollbar-track{background:rgba(0,0,0,.2)}
  `;
  document.head.appendChild(st);
  stylesInjected = true;
}

export function initNLSpotify(win, showNotification){
  injectStyles();
  const notify = (m)=>{ try { showNotification && showNotification(m); } catch(e){} };
  const content = win.querySelector('.window-content');
  if (!content) return;

  // ---- persistent state defaults ----
  let vol = typeof _state.volume === 'number' ? _state.volume : 0.8;
  let muted = !!_state.muted;
  let shuffle = !!_state.shuffle;
  let repeat = _state.repeat || 'off';       // off | all | one
  let speed = _state.speed || 1;
  let eqBands = Array.isArray(_state.eqBands) && _state.eqBands.length===10 ? _state.eqBands.slice() : EQ_PRESETS.Flat.slice();
  let eqBypass = !!_state.eqBypass;
  let favorites = _state.favorites || {};
  let playCounts = _state.playCounts || {};

  // ---- DOM ----
  content.innerHTML = `
  <div class="nls-root" tabindex="-1">
    <div class="nls-tabs">
      <span class="nls-tab active" data-view="now">\u266B Now Playing</span>
      <span class="nls-tab" data-view="viz">\u2261 Visualizer</span>
      <span class="nls-tab" data-view="eq">\uD83C\uDF9B EQ</span>
      <span class="nls-tab" data-view="lyrics">\uD83D\uDCDD Lyrics</span>
      <span class="nls-tab" data-view="info">\u2139 Info</span>
    </div>
    <div class="nls-main">
      <div class="nls-side nls-glass">
        <input class="nls-search" type="text" placeholder="Search title or artist...">
        <div class="nls-listhead"><span class="nls-count"></span><span class="nls-favtoggle" style="cursor:pointer">\u2661 Favorites</span></div>
        <ul class="nls-list"></ul>
      </div>
      <div class="nls-center nls-glass">
        <div class="nls-view nls-now show">
          <div class="nls-art"></div>
          <div class="nls-title">NL spotify</div>
          <div class="nls-artist">116 songs of all time \u00B7 pick a track</div>
          <div class="nls-reactions">
            <span class="nls-react fav" data-r="\u2665" title="Favorite">\u2661</span>
            <span class="nls-react" data-r="\uD83D\uDD25">\uD83D\uDD25</span>
            <span class="nls-react" data-r="\uD83C\uDFA7">\uD83C\uDFA7</span>
            <span class="nls-react" data-r="\u2728">\u2728</span>
          </div>
        </div>
        <div class="nls-view nls-viz"><canvas></canvas></div>
        <div class="nls-view nls-eq">
          <div class="nls-eqtop">
            <select class="nls-sel nls-eqpreset"></select>
            <button class="nls-btn nls-eqbypass">Bypass</button>
            <span style="color:#9fb2d8">10-band \u00B112dB</span>
          </div>
          <div class="nls-eqbands"></div>
          <canvas class="nls-eqcurve"></canvas>
        </div>
        <div class="nls-view nls-lyrics">
          <div class="nls-lrcbox">No lyrics loaded. Paste LRC or plain text below.</div>
          <textarea placeholder="Paste .lrc ([mm:ss.xx] line) or plain lyrics here..."></textarea>
          <button class="nls-btn nls-lrcapply" style="width:120px">Apply lyrics</button>
        </div>
        <div class="nls-view nls-info"></div>
      </div>
    </div>
    <div class="nls-bar nls-glass">
      <div class="nls-seekwrap">
        <div class="nls-buffered"></div>
        <input class="nls-seek" type="range" min="0" max="100" value="0" step="0.1">
      </div>
      <div class="nls-ctlrow">
        <span class="nls-time nls-cur">0:00</span>
        <button class="nls-btn nls-prev" title="Previous">\u23EE</button>
        <button class="nls-btn nls-back" title="-10s">\u00AB</button>
        <button class="nls-btn play nls-play" title="Play/Pause">\u25B6</button>
        <button class="nls-btn nls-fwd" title="+10s">\u00BB</button>
        <button class="nls-btn nls-next" title="Next">\u23ED</button>
        <span class="nls-time nls-dur">0:00</span>
        <span class="nls-spacer"></span>
        <button class="nls-btn nls-shuffle" title="Shuffle">\uD83D\uDD00</button>
        <button class="nls-btn nls-repeat" title="Repeat">\uD83D\uDD01</button>
        <select class="nls-sel nls-speed" title="Speed"></select>
        <button class="nls-btn nls-mute" title="Mute">\uD83D\uDD08</button>
        <input class="nls-vol" type="range" min="0" max="1" step="0.01">
      </div>
    </div>
  </div>`;

  const root = content.querySelector('.nls-root');
  const $ = (s)=>root.querySelector(s);
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.crossOrigin = 'anonymous';
  audio.volume = muted ? 0 : vol;
  audio.playbackRate = speed;

  // ---- Web Audio graph (lazy) ----
  let actx, srcNode, eqNodes=[], panNode, gainNode, analyser, graphReady=false, vizRAF=null;
  function setupGraph(){
    if (graphReady) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = new AC();
      srcNode = actx.createMediaElementSource(audio);
      eqNodes = EQ_FREQS.map((f,i)=>{ const n=actx.createBiquadFilter(); n.type = i===0?'lowshelf':(i===EQ_FREQS.length-1?'highshelf':'peaking'); n.frequency.value=f; n.Q.value=1; n.gain.value=0; return n; });
      panNode = actx.createStereoPanner ? actx.createStereoPanner() : null;
      gainNode = actx.createGain(); gainNode.gain.value = 1;
      analyser = actx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.85;
      let node = srcNode;
      eqNodes.forEach(n=>{ node.connect(n); node=n; });
      if (panNode){ node.connect(panNode); node=panNode; }
      node.connect(gainNode); gainNode.connect(analyser); analyser.connect(actx.destination);
      graphReady = true;
      applyEq();
    } catch(e){ graphReady = false; }
  }
  function applyEq(){ if(!graphReady) return; const b = eqBypass ? new Array(10).fill(0) : eqBands; eqNodes.forEach((n,i)=> n.gain.value = clamp(b[i],-12,12)); drawEqCurve(); }

  // ---- playback model ----
  let order = NL_TRACKS.map((_,i)=>i);
  let current = -1;
  function reshuffle(keepCurrent){
    order = NL_TRACKS.map((_,i)=>i);
    if (shuffle){ for(let i=order.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; } }
    if (keepCurrent && current>=0){ const p=order.indexOf(current); if(p>0){ [order[0],order[p]]=[order[p],order[0]]; } }
  }
  reshuffle(false);

  function trackArtCss(t){ const h=hashHue((t.artist||'')+(t.title||'')); return `linear-gradient(135deg,hsl(${h},58%,46%),hsl(${(h+38)%360},52%,26%))`; }

  function play(idx){
    if (idx<0 || idx>=NL_TRACKS.length) return;
    current = idx;
    const t = NL_TRACKS[idx];
    audio.src = t.url;
    audio.playbackRate = speed;
    setupGraph();
    if (actx && actx.state==='suspended') actx.resume();
    audio.play().catch(()=>{});
    playCounts[t.url] = (playCounts[t.url]||0)+1;
    saveState({ currentIndex: idx, playCounts });
    updateNow(); renderList(); updateMediaSession(); loadLyricsFor(t);
  }
  function nextIndexInOrder(step){
    const p = order.indexOf(current);
    if (p<0) return order[0];
    let np = p + step;
    if (np >= order.length){ if(repeat==='all'){ np=0; } else { return -1; } }
    if (np < 0){ np = order.length-1; }
    return order[np];
  }
  function next(auto){
    if (auto && repeat==='one'){ audio.currentTime=0; audio.play().catch(()=>{}); return; }
    const ni = nextIndexInOrder(1);
    if (ni<0){ audio.pause(); return; }
    play(ni);
  }
  function prev(){ if (audio.currentTime>3){ audio.currentTime=0; return; } const pi=nextIndexInOrder(-1); play(pi<0?current:pi); }

  // ---- now playing UI ----
  const artEl=$('.nls-art'), titleEl=$('.nls-title'), artistEl=$('.nls-artist');
  const favReact=$('.nls-react.fav');
  function updateNow(){
    if (current<0) return;
    const t = NL_TRACKS[current];
    artEl.style.background = trackArtCss(t);
    artEl.textContent = initials(t.title);
    titleEl.textContent = t.title; titleEl.dir = isRTL(t.title)?'rtl':'ltr';
    artistEl.textContent = t.artist + '  \u00B7  played ' + (playCounts[t.url]||0) + '\u00D7';
    artistEl.dir = isRTL(t.artist)?'rtl':'ltr';
    favReact.textContent = favorites[t.url] ? '\u2665' : '\u2661';
    favReact.classList.toggle('on', !!favorites[t.url]);
    buildInfo();
  }

  // ---- list rendering ----
  const listEl=$('.nls-list'), countEl=$('.nls-count'), searchEl=$('.nls-search'), favToggle=$('.nls-favtoggle');
  let filter='', favOnly=false;
  function renderList(){
    const q=filter.trim().toLowerCase();
    let shown=0; const frag=document.createDocumentFragment();
    NL_TRACKS.forEach((t,i)=>{
      if (favOnly && !favorites[t.url]) return;
      if (q && !((t.title||'').toLowerCase().includes(q) || (t.artist||'').toLowerCase().includes(q))) return;
      shown++;
      const li=document.createElement('li');
      li.className='nls-li'+(i===current?' active':'')+(favorites[t.url]?' isfav':'');
      li.dataset.i=i;
      li.innerHTML = `<span class="num">${i+1}</span><span class="meta"><span class="t" dir="${isRTL(t.title)?'rtl':'ltr'}">${esc(t.title)}</span><span class="a" dir="${isRTL(t.artist)?'rtl':'ltr'}">${esc(t.artist)}</span></span><span class="fav">\u2665</span>`;
      frag.appendChild(li);
    });
    listEl.innerHTML=''; listEl.appendChild(frag);
    countEl.textContent = shown+' / '+NL_TRACKS.length+' songs';
  }
  listEl.addEventListener('click',(e)=>{
    const fav=e.target.closest('.fav'); const li=e.target.closest('.nls-li'); if(!li) return;
    const i=parseInt(li.dataset.i,10);
    if (fav){ const u=NL_TRACKS[i].url; if(favorites[u]) delete favorites[u]; else favorites[u]=1; saveState({favorites}); renderList(); if(i===current) updateNow(); return; }
    play(i);
  });
  searchEl.addEventListener('input',()=>{ filter=searchEl.value; clearTimeout(searchEl._t); searchEl._t=setTimeout(renderList,150); });
  favToggle.addEventListener('click',()=>{ favOnly=!favOnly; favToggle.style.color=favOnly?'#ff5d8f':''; renderList(); });

  // ---- tabs ----
  root.querySelectorAll('.nls-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      root.querySelectorAll('.nls-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const v=tab.dataset.view;
      root.querySelectorAll('.nls-view').forEach(el=>el.classList.remove('show'));
      $('.nls-'+v).classList.add('show');
      if (v==='viz') startViz();
      if (v==='eq') drawEqCurve();
    });
  });

  // ---- reactions ----
  root.querySelector('.nls-reactions').addEventListener('click',(e)=>{
    const r=e.target.closest('.nls-react'); if(!r) return;
    if (r.classList.contains('fav') && current>=0){ const u=NL_TRACKS[current].url; if(favorites[u]) delete favorites[u]; else favorites[u]=1; saveState({favorites}); updateNow(); renderList(); }
    // calm floating reaction
    const f=document.createElement('div'); f.className='nls-float'; f.textContent=r.dataset.r;
    const rect=r.getBoundingClientRect(), rr=root.getBoundingClientRect();
    f.style.left=(rect.left-rr.left)+'px'; f.style.top=(rect.top-rr.top)+'px';
    root.appendChild(f); setTimeout(()=>f.remove(),1400);
  });

  // ---- controls ----
  const playBtn=$('.nls-play'), seek=$('.nls-seek'), buffered=$('.nls-buffered');
  const curEl=$('.nls-cur'), durEl=$('.nls-dur'), volEl=$('.nls-vol'), muteBtn=$('.nls-mute');
  const shuffleBtn=$('.nls-shuffle'), repeatBtn=$('.nls-repeat'), speedSel=$('.nls-speed');
  SPEEDS.forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s+'\u00D7'; if(s===speed)o.selected=true; speedSel.appendChild(o); });
  volEl.value = muted?0:vol;
  shuffleBtn.classList.toggle('on',shuffle);
  function repeatGlyph(){ repeatBtn.textContent = repeat==='one'?'\uD83D\uDD02':'\uD83D\uDD01'; repeatBtn.classList.toggle('on',repeat!=='off'); }
  repeatGlyph();
  function muteGlyph(){ muteBtn.textContent = (muted||vol===0)?'\uD83D\uDD07':'\uD83D\uDD08'; }
  muteGlyph();

  playBtn.addEventListener('click',()=>{ if(current<0){ play(order[0]); return; } if(audio.paused){ if(actx&&actx.state==='suspended')actx.resume(); audio.play().catch(()=>{}); } else audio.pause(); });
  $('.nls-prev').addEventListener('click',prev);
  $('.nls-next').addEventListener('click',()=>next(false));
  $('.nls-back').addEventListener('click',()=>{ audio.currentTime=Math.max(0,audio.currentTime-10); });
  $('.nls-fwd').addEventListener('click',()=>{ audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10); });
  shuffleBtn.addEventListener('click',()=>{ shuffle=!shuffle; shuffleBtn.classList.toggle('on',shuffle); reshuffle(true); saveState({shuffle}); });
  repeatBtn.addEventListener('click',()=>{ repeat = repeat==='off'?'all':(repeat==='all'?'one':'off'); repeatGlyph(); saveState({repeat}); });
  speedSel.addEventListener('change',()=>{ speed=parseFloat(speedSel.value); audio.playbackRate=speed; saveState({speed}); });
  muteBtn.addEventListener('click',()=>{ muted=!muted; audio.volume=muted?0:vol; muteGlyph(); saveState({muted}); });
  volEl.addEventListener('input',()=>{ vol=parseFloat(volEl.value); muted=false; audio.volume=vol; muteGlyph(); saveState({volume:vol,muted:false}); });

  // seek
  let seeking=false;
  seek.addEventListener('input',()=>{ seeking=true; if(audio.duration){ curEl.textContent=fmtTime(audio.duration*(seek.value/100)); } });
  seek.addEventListener('change',()=>{ if(audio.duration){ audio.currentTime=audio.duration*(seek.value/100); } seeking=false; });
  audio.addEventListener('timeupdate',()=>{ if(!seeking&&audio.duration){ seek.value=(audio.currentTime/audio.duration)*100; } curEl.textContent=fmtTime(audio.currentTime); syncLyrics(); saveTimeThrottled(); });
  audio.addEventListener('loadedmetadata',()=>{ durEl.textContent=fmtTime(audio.duration); });
  audio.addEventListener('progress',()=>{ try{ if(audio.buffered.length&&audio.duration){ buffered.style.width=(audio.buffered.end(audio.buffered.length-1)/audio.duration*100)+'%'; } }catch(e){} });
  audio.addEventListener('play',()=>{ playBtn.textContent='\u23F8'; startViz(); updateMediaSession(); });
  audio.addEventListener('pause',()=>{ playBtn.textContent='\u25B6'; });
  audio.addEventListener('ended',()=>next(true));
  audio.addEventListener('error',()=>{ notify('Skipping unплayable track'); setTimeout(()=>next(true),300); });

  let _saveT=0; function saveTimeThrottled(){ const n=Date.now(); if(n-_saveT>4000){ _saveT=n; saveState({currentIndex:current,currentTime:audio.currentTime}); } }

  // ---- visualizer ----
  const vizCanvas=$('.nls-viz canvas');
  function startViz(){ if(!analyser||vizRAF) return; const ctx=vizCanvas.getContext('2d'); const buf=new Uint8Array(analyser.frequencyBinCount);
    function frame(){ if(audio.paused){ vizRAF=null; return; } const w=vizCanvas.width=vizCanvas.clientWidth, h=vizCanvas.height=vizCanvas.clientHeight; analyser.getByteFrequencyData(buf); ctx.clearRect(0,0,w,h); const n=buf.length, bw=w/n; for(let i=0;i<n;i++){ const v=buf[i]/255; const bh=v*h; const hue=200-(v*140); ctx.fillStyle='hsl('+hue+',80%,'+(40+v*30)+'%)'; ctx.fillRect(i*bw, h-bh, bw*0.8, bh); } vizRAF=requestAnimationFrame(frame); }
    vizRAF=requestAnimationFrame(frame);
  }

  // ---- EQ UI ----
  const eqBandsEl=$('.nls-eqbands'), eqPresetSel=$('.nls-eqpreset'), eqBypassBtn=$('.nls-eqbypass'), eqCurve=$('.nls-eqcurve');
  Object.keys(EQ_PRESETS).forEach(p=>{ const o=document.createElement('option'); o.value=p; o.textContent=p; eqPresetSel.appendChild(o); });
  EQ_FREQS.forEach((f,i)=>{ const d=document.createElement('div'); d.className='nls-eqband'; const lbl=f>=1000?(f/1000)+'k':f; d.innerHTML=`<input type="range" min="-12" max="12" step="1" value="${eqBands[i]}" data-i="${i}"><span>${lbl}</span>`; eqBandsEl.appendChild(d); });
  eqBandsEl.addEventListener('input',(e)=>{ const inp=e.target.closest('input'); if(!inp) return; eqBands[parseInt(inp.dataset.i,10)]=parseFloat(inp.value); applyEq(); saveState({eqBands}); });
  eqPresetSel.addEventListener('change',()=>{ const p=EQ_PRESETS[eqPresetSel.value]; if(!p) return; eqBands=p.slice(); eqBandsEl.querySelectorAll('input').forEach((inp,i)=>inp.value=eqBands[i]); applyEq(); saveState({eqBands}); });
  eqBypassBtn.addEventListener('click',()=>{ eqBypass=!eqBypass; eqBypassBtn.classList.toggle('on',eqBypass); applyEq(); saveState({eqBypass}); });
  eqBypassBtn.classList.toggle('on',eqBypass);
  function drawEqCurve(){ if(!eqCurve.clientWidth) return; const ctx=eqCurve.getContext('2d'); const w=eqCurve.width=eqCurve.clientWidth, h=eqCurve.height=eqCurve.clientHeight; ctx.clearRect(0,0,w,h); ctx.beginPath(); ctx.strokeStyle='#1DB954'; ctx.lineWidth=2; const b=eqBypass?new Array(10).fill(0):eqBands; for(let i=0;i<b.length;i++){ const x=i/(b.length-1)*w; const y=h/2 - (b[i]/12)*(h/2-6); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke(); ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke(); }

  // ---- lyrics ----
  const lrcBox=$('.nls-lrcbox'), lrcArea=root.querySelector('.nls-lyrics textarea'), lrcApply=$('.nls-lrcapply');
  let lrcLines=[]; // {t, text}
  function parseLrc(text){ const out=[]; const re=/\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g; text.split(/\r?\n/).forEach(line=>{ let m, last=null; const tags=[]; re.lastIndex=0; while((m=re.exec(line))){ const t=parseInt(m[1])*60+parseInt(m[2])+(m[3]?parseInt(m[3].padEnd(3,'0'))/1000:0); tags.push(t); last=re.lastIndex; } const txt=line.replace(re,'').trim(); if(tags.length){ tags.forEach(t=>out.push({t,text:txt})); } else if(txt){ out.push({t:-1,text:txt}); } }); out.sort((a,b)=>a.t-b.t); return out; }
  function renderLrc(){ if(!lrcLines.length){ lrcBox.textContent='No lyrics. Paste LRC or plain text below.'; return; } lrcBox.innerHTML=lrcLines.map((l,i)=>`<div class="nls-lrc-line" data-i="${i}" dir="${isRTL(l.text)?'rtl':'ltr'}">${esc(l.text)||'\u00A0'}</div>`).join(''); }
  let curLrc=-1;
  function syncLyrics(){ if(!lrcLines.length||lrcLines[0].t<0) return; let idx=-1; for(let i=0;i<lrcLines.length;i++){ if(lrcLines[i].t<=audio.currentTime) idx=i; else break; } if(idx!==curLrc){ curLrc=idx; const lines=lrcBox.querySelectorAll('.nls-lrc-line'); lines.forEach(el=>el.classList.remove('cur')); if(idx>=0&&lines[idx]){ lines[idx].classList.add('cur'); lines[idx].scrollIntoView({block:'center'}); } } }
  function loadLyricsFor(t){ lrcLines=[]; curLrc=-1; lrcBox.textContent='Loading lyrics...'; const url=t.url.replace(/\.[^.]+$/,'.lrc'); fetch(url).then(r=>r.ok?r.text():Promise.reject()).then(txt=>{ lrcLines=parseLrc(txt); renderLrc(); }).catch(()=>{ lrcLines=[]; lrcBox.textContent='No .lrc found for this track. Paste lyrics below.'; }); }
  lrcApply.addEventListener('click',()=>{ lrcLines=parseLrc(lrcArea.value); if(!lrcLines.length&&lrcArea.value.trim()){ lrcLines=lrcArea.value.split(/\r?\n/).filter(Boolean).map(t=>({t:-1,text:t})); } renderLrc(); });

  // ---- info ----
  function buildInfo(){ const el=$('.nls-info'); const artists=new Set(NL_TRACKS.map(t=>t.artist)); const favCount=Object.keys(favorites).length; const t=current>=0?NL_TRACKS[current]:null; el.innerHTML = `<h3>NL spotify</h3><div class="row"><span class="k">Library</span><span>${NL_TRACKS.length} songs \u00B7 ${artists.size} artists</span></div><div class="row"><span class="k">Favorites</span><span>${favCount}</span></div><div class="row"><span class="k">Source</span><span>nl-audio-cdn / media/nl-fv-songs</span></div>`+ (t?`<h3 style="margin-top:14px">Now playing</h3><div class="row"><span class="k">Title</span><span dir="${isRTL(t.title)?'rtl':'ltr'}">${esc(t.title)}</span></div><div class="row"><span class="k">Artist</span><span dir="${isRTL(t.artist)?'rtl':'ltr'}">${esc(t.artist)}</span></div><div class="row"><span class="k">Plays</span><span>${playCounts[t.url]||0}</span></div><div class="row"><span class="k">File</span><span>${esc(t.file)}</span></div>`:''); }

  // ---- MediaSession ----
  function updateMediaSession(){ if(!('mediaSession'in navigator)||current<0) return; const t=NL_TRACKS[current]; try{ navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:'NL fv songs of all time'}); navigator.mediaSession.setActionHandler('play',()=>audio.play()); navigator.mediaSession.setActionHandler('pause',()=>audio.pause()); navigator.mediaSession.setActionHandler('previoustrack',prev); navigator.mediaSession.setActionHandler('nexttrack',()=>next(false)); }catch(e){} }

  // ---- keyboard shortcuts (scoped to this window) ----
  root.addEventListener('keydown',(e)=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return;
    switch(e.key){
      case ' ': e.preventDefault(); playBtn.click(); break;
      case 'ArrowRight': if(e.shiftKey){next(false);}else{audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10);} break;
      case 'ArrowLeft': if(e.shiftKey){prev();}else{audio.currentTime=Math.max(0,audio.currentTime-10);} break;
      case 'ArrowUp': e.preventDefault(); vol=clamp(vol+0.05,0,1); volEl.value=vol; muted=false; audio.volume=vol; muteGlyph(); saveState({volume:vol}); break;
      case 'ArrowDown': e.preventDefault(); vol=clamp(vol-0.05,0,1); volEl.value=vol; audio.volume=muted?0:vol; saveState({volume:vol}); break;
      case 'm': case 'M': muteBtn.click(); break;
      case 's': case 'S': shuffleBtn.click(); break;
      case 'r': case 'R': repeatBtn.click(); break;
    }
  });

  // ---- cleanup on close ----
  const closeBtn = win.querySelector('.title-bar-controls button[aria-label="Close"]');
  function cleanup(){ try{ audio.pause(); audio.src=''; }catch(e){} if(vizRAF){ cancelAnimationFrame(vizRAF); vizRAF=null; } try{ if(actx) actx.close(); }catch(e){} }
  if (closeBtn) closeBtn.addEventListener('click', cleanup);
  const mo = new MutationObserver(()=>{ if(!document.body.contains(win)){ cleanup(); mo.disconnect(); } });
  try { mo.observe(win.parentNode||document.body,{childList:true}); } catch(e){}

  // ---- initial render + resume ----
  renderList(); buildInfo();
  const ri = (typeof _state.currentIndex==='number' && _state.currentIndex>=0 && _state.currentIndex<NL_TRACKS.length) ? _state.currentIndex : 0;
  current = ri; updateNow(); renderList();
  const t0 = NL_TRACKS[ri];
  if (t0){ audio.src = t0.url; if(typeof _state.currentTime==='number'){ audio.addEventListener('loadedmetadata',function once(){ try{ audio.currentTime=Math.min(_state.currentTime, (audio.duration||0)-1); }catch(e){} audio.removeEventListener('loadedmetadata',once); }); } loadLyricsFor(t0); }
  notify('NL spotify ready \u00B7 '+NL_TRACKS.length+' songs');
}

// optional external entry
if (typeof window!=='undefined'){
  window.openNLSpotify = function(){ if(window.createWindow) window.createWindow('NL spotify'); };
}
