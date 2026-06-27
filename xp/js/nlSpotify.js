// nlSpotify.js v2 — "NL spotify": redesigned XP-glass music player for the NL XP system.
// Self-contained vanilla JS (ES module). Icon-based UI (no emoji), virtualized
// library (1800+ tracks), LRClib runtime lyrics with smart prefetch + cache,
// and a professional cover-backed lyrics viewer.
//
// Public surface:
//   export function initNLSpotify(win, showNotification)   // wired by init.js
//   window.openNLSpotify()                                  // optional external open
//
// Audio graph: <audio> -> MediaElementSource -> 10x BiquadFilter (EQ)
//              -> StereoPanner -> Gain -> Analyser -> destination

// ---- The 116 built-in "NL fv songs of all time" (relative CDN paths). ----
const NL_FV_TRACKS = /*116 built-in fv tracks*/[
  {"id":1,"file":"song_001.m4a","title":"Mi Amore (V2)","artist":"7liwa","url":"media/nl-fv-songs/song_001.m4a","duration":223},
  {"id":2,"file":"song_002.m4a","title":"Fataat Al Khair","artist":"Abbu Alli","url":"media/nl-fv-songs/song_002.m4a","duration":287},
  {"id":3,"file":"song_003.m4a","title":"U.Z.I","artist":"A.L.A","url":"media/nl-fv-songs/song_003.m4a","duration":257},
  {"id":4,"file":"song_004.m4a","title":"A Horse with No Name","artist":"America","url":"media/nl-fv-songs/song_004.m4a","duration":252},
  {"id":5,"file":"song_005.m4a","title":"Rhyme Serve Me","artist":"Art-Smoke","url":"media/nl-fv-songs/song_005.m4a","duration":155},
  {"id":6,"file":"song_006.m4a","title":"Blessings (Extended Version)","artist":"Big Sean","url":"media/nl-fv-songs/song_006.m4a","duration":302},
  {"id":7,"file":"song_007.m4a","title":"Duvet","artist":"bôa","url":"media/nl-fv-songs/song_007.m4a","duration":204},
  {"id":8,"file":"song_008.m4a","title":"Rak chayaa bel khlayaa","artist":"Cheb Bilal","url":"media/nl-fv-songs/song_008.m4a","duration":326},
  {"id":9,"file":"song_009.m4a","title":"Bullet and a Target","artist":"Citizen Cope","url":"media/nl-fv-songs/song_009.m4a","duration":261},
  {"id":10,"file":"song_010.m4a","title":"Back Up (feat. Big Sean)","artist":"Dej Loaf","url":"media/nl-fv-songs/song_010.m4a","duration":241},
  {"id":11,"file":"song_011.m4a","title":"Back To Back","artist":"Drake","url":"media/nl-fv-songs/song_011.m4a","duration":171},
  {"id":12,"file":"song_012.m4a","title":"Pop Style","artist":"Drake","url":"media/nl-fv-songs/song_012.m4a","duration":209},
  {"id":13,"file":"song_013.m4a","title":"Trust Nobody","artist":"Hippie Sabotage","url":"media/nl-fv-songs/song_013.m4a","duration":225},
  {"id":14,"file":"song_014.m4a","title":"Vienen A Verme (Theme from El Chapo)","artist":"iLe","url":"media/nl-fv-songs/song_014.m4a","duration":201},
  {"id":15,"file":"song_015.m4a","title":"The Last Kingdom Blood Will Prevail","artist":"John Lunn","url":"media/nl-fv-songs/song_015.m4a","duration":173},
  {"id":16,"file":"song_016.m4a","title":"All Time Low","artist":"Jon Bellion","url":"media/nl-fv-songs/song_016.m4a","duration":218},
  {"id":17,"file":"song_017.m4a","title":"L'morphiniya 12","artist":"L'morphine","url":"media/nl-fv-songs/song_017.m4a","duration":121},
  {"id":18,"file":"song_018.m4a","title":"Aniki","artist":"Lquinze","url":"media/nl-fv-songs/song_018.m4a","duration":168},
  {"id":19,"file":"song_019.m4a","title":"Hashrab Hashish","artist":"Luka Salam","url":"media/nl-fv-songs/song_019.m4a","duration":184},
  {"id":20,"file":"song_020.m4a","title":"غصن رمان","artist":"maryam shehab","url":"media/nl-fv-songs/song_020.m4a","duration":150},
  {"id":21,"file":"song_021.m4a","title":"24","artist":"Money Man","url":"media/nl-fv-songs/song_021.m4a","duration":183},
  {"id":22,"file":"song_022.m4a","title":"Eva (feat. Kira7)","artist":"NAB FAKE","url":"media/nl-fv-songs/song_022.m4a","duration":215},
  {"id":23,"file":"song_023.m4a","title":"Too Late","artist":"nixy","url":"media/nl-fv-songs/song_023.m4a","duration":192},
  {"id":24,"file":"song_024.m4a","title":"Man O To","artist":"Nu","url":"media/nl-fv-songs/song_024.m4a","duration":580},
  {"id":25,"file":"song_025.m4a","title":"Dizeres","artist":"Orgânico","url":"media/nl-fv-songs/song_025.m4a","duration":258},
  {"id":26,"file":"song_026.m4a","title":"Hal 2","artist":"Oum, M-Carlos","url":"media/nl-fv-songs/song_026.m4a","duration":367},
  {"id":27,"file":"song_027.m4a","title":"Peter, Paul And Mary Early in the Morning 2004 Remaster","artist":"","url":"media/nl-fv-songs/song_027.m4a","duration":95},
  {"id":28,"file":"song_028.m4a","title":"Show Must Go On","artist":"Rilès","url":"media/nl-fv-songs/song_028.m4a","duration":230},
  {"id":29,"file":"song_029.m4a","title":"Smooth Operator","artist":"Sade","url":"media/nl-fv-songs/song_029.m4a","duration":298},
  {"id":30,"file":"song_030.m4a","title":"Selena Gomez & The Scene Love You Like A Love Song","artist":"","url":"media/nl-fv-songs/song_030.m4a","duration":188},
  {"id":31,"file":"song_031.m4a","title":"ميل على بلدي","artist":"Shalby Younis","url":"media/nl-fv-songs/song_031.m4a","duration":306},
  {"id":32,"file":"song_032.m4a","title":"Bullet From A Gun","artist":"Skepta","url":"media/nl-fv-songs/song_032.m4a","duration":171},
  {"id":33,"file":"song_033.m4a","title":"Dark Red","artist":"Steve Lacy","url":"media/nl-fv-songs/song_033.m4a","duration":173},
  {"id":34,"file":"song_034.m4a","title":"No Mediocre (feat. Iggy Azalea)","artist":"T.I.","url":"media/nl-fv-songs/song_034.m4a","duration":202},
  {"id":35,"file":"song_035.m4a","title":"L'ITALIANO","artist":"Toto Cutugno","url":"media/nl-fv-songs/song_035.m4a","duration":237},
  {"id":36,"file":"song_036.m4a","title":"دايس","artist":"طارق العربي طرقان","url":"media/nl-fv-songs/song_036.m4a","duration":103},
  {"id":37,"file":"song_037.m4a","title":"هزتني","artist":"محمد الوهيبي","url":"media/nl-fv-songs/song_037.m4a","duration":79},
  {"id":38,"file":"song_038.m4a","title":"Thank You","artist":"Dido","url":"media/nl-fv-songs/song_038.m4a","duration":218},
  {"id":39,"file":"song_039.m4a","title":"'Bout It","artist":"JMSN","url":"media/nl-fv-songs/song_039.m4a","duration":394},
  {"id":40,"file":"song_040.m4a","title":"Fade Away","artist":"Logic","url":"media/nl-fv-songs/song_040.m4a","duration":287},
  {"id":41,"file":"song_041.m4a","title":"N.Y. State Of Mind (Explicit Album Version)","artist":"Nas","url":"media/nl-fv-songs/song_041.m4a","duration":294},
  {"id":42,"file":"song_042.m4a","title":"Unwritten","artist":"Natasha Bedingfield","url":"media/nl-fv-songs/song_042.m4a","duration":258},
  {"id":43,"file":"song_043.m4a","title":"500 Miles (2004 Remaster)","artist":"Peter, Paul And Mary","url":"media/nl-fv-songs/song_043.m4a","duration":168},
  {"id":44,"file":"song_044.m4a","title":"Quatrehuit l'Mkhokha II La suite feat l'Morphine","artist":"","url":"media/nl-fv-songs/song_044.m4a","duration":172},
  {"id":45,"file":"song_045.m4a","title":"Won't Forget You (Edit)","artist":"Shouse","url":"media/nl-fv-songs/song_045.m4a","duration":231},
  {"id":46,"file":"song_046.m4a","title":"Maybe Tomorrow","artist":"Stereophonics","url":"media/nl-fv-songs/song_046.m4a","duration":273},
  {"id":47,"file":"song_047.m4a","title":"Selfish","artist":"TWENTY88","url":"media/nl-fv-songs/song_047.m4a","duration":191},
  {"id":48,"file":"song_048.m4a","title":"Thuggish Ruggish Bone","artist":"Bone Thugs-N-Harmony","url":"media/nl-fv-songs/song_048.m4a","duration":282},
  {"id":49,"file":"song_049.m4a","title":"Bonfire","artist":"Childish Gambino","url":"media/nl-fv-songs/song_049.m4a","duration":193},
  {"id":50,"file":"song_050.m4a","title":"10 Bands","artist":"Drake","url":"media/nl-fv-songs/song_050.m4a","duration":178},
  {"id":51,"file":"song_051.m4a","title":"Only Time","artist":"Enya","url":"media/nl-fv-songs/song_051.m4a","duration":219},
  {"id":52,"file":"song_052.m4a","title":"Ready or Not","artist":"Fugees","url":"media/nl-fv-songs/song_052.m4a","duration":227},
  {"id":53,"file":"song_053.m4a","title":"Where Ya At (feat. Drake)","artist":"Future","url":"media/nl-fv-songs/song_053.m4a","duration":208},
  {"id":54,"file":"song_054.m4a","title":"All Mine","artist":"Kanye West","url":"media/nl-fv-songs/song_054.m4a","duration":146},
  {"id":55,"file":"song_055.m4a","title":"Couteau Suisse","artist":"L'morphine","url":"media/nl-fv-songs/song_055.m4a","duration":152},
  {"id":56,"file":"song_056.m4a","title":"Breathe Me","artist":"Sia","url":"media/nl-fv-songs/song_056.m4a","duration":273},
  {"id":57,"file":"song_057.m4a","title":"Byeb’a Nas","artist":"Abeer Nehme","url":"media/nl-fv-songs/song_057.m4a","duration":235},
  {"id":58,"file":"song_058.m4a","title":"Let The Drummer Kick (Album Version)","artist":"Citizen Cope","url":"media/nl-fv-songs/song_058.m4a","duration":257},
  {"id":59,"file":"song_059.m4a","title":"Snake Eater","artist":"Cynthia Harrell","url":"media/nl-fv-songs/song_059.m4a","duration":180},
  {"id":60,"file":"song_060.m4a","title":"Cleanin' Out My Closet","artist":"Eminem","url":"media/nl-fv-songs/song_060.m4a","duration":298},
  {"id":61,"file":"song_061.m4a","title":"My Immortal","artist":"Evanescence","url":"media/nl-fv-songs/song_061.m4a","duration":263},
  {"id":62,"file":"song_062.m4a","title":"Rai Machi Punk","artist":"ISSAM","url":"media/nl-fv-songs/song_062.m4a","duration":165},
  {"id":63,"file":"song_063.m4a","title":"By Design","artist":"Kid Cudi","url":"media/nl-fv-songs/song_063.m4a","duration":257},
  {"id":64,"file":"song_064.m4a","title":"Gang Related","artist":"Logic","url":"media/nl-fv-songs/song_064.m4a","duration":167},
  {"id":65,"file":"song_065.m4a","title":"See You Again (feat. Kali Uchis)","artist":"Tyler, The Creator","url":"media/nl-fv-songs/song_065.m4a","duration":180},
  {"id":66,"file":"song_066.m4a","title":"Future Swag","artist":"Young Thug","url":"media/nl-fv-songs/song_066.m4a","duration":166},
  {"id":67,"file":"song_067.m4a","title":"The Tide Is High (Remastered 2001)","artist":"Blondie","url":"media/nl-fv-songs/song_067.m4a","duration":284},
  {"id":68,"file":"song_068.m4a","title":"Gotta Have It","artist":"JAY-Z","url":"media/nl-fv-songs/song_068.m4a","duration":141},
  {"id":69,"file":"song_069.m4a","title":"No Mistakes","artist":"Kanye West","url":"media/nl-fv-songs/song_069.m4a","duration":123},
  {"id":70,"file":"song_070.m4a","title":"Favor for a Favor (feat. Scarface)","artist":"Nas","url":"media/nl-fv-songs/song_070.m4a","duration":247},
  {"id":71,"file":"song_071.m4a","title":"Galbi 3achakli fiha sif","artist":"Cheb Akil","url":"media/nl-fv-songs/song_071.m4a","duration":350},
  {"id":72,"file":"song_072.m4a","title":"Eurythmics Sweet Dreams Are Made of This Remastered","artist":"","url":"media/nl-fv-songs/song_072.m4a","duration":217},
  {"id":73,"file":"song_073.m4a","title":"fukumean","artist":"Gunna","url":"media/nl-fv-songs/song_073.m4a","duration":125},
  {"id":74,"file":"song_074.m4a","title":"Fire Squad","artist":"J. Cole","url":"media/nl-fv-songs/song_074.m4a","duration":288},
  {"id":75,"file":"song_075.m4a","title":"Maybe IDK","artist":"Jon Bellion","url":"media/nl-fv-songs/song_075.m4a","duration":233},
  {"id":76,"file":"song_076.m4a","title":"L'exorciste","artist":"L'morphine","url":"media/nl-fv-songs/song_076.m4a","duration":153},
  {"id":77,"file":"song_077.m4a","title":"Bounce","artist":"Logic","url":"media/nl-fv-songs/song_077.m4a","duration":245},
  {"id":78,"file":"song_078.m4a","title":"El-Kaoui","artist":"Nabyla Maan","url":"media/nl-fv-songs/song_078.m4a","duration":299},
  {"id":79,"file":"song_079.m4a","title":"Freed From Desire (prod. Molella, Phil Jay)","artist":"Gala","url":"media/nl-fv-songs/song_079.m4a","duration":213},
  {"id":80,"file":"song_080.m4a","title":"St. Tropez","artist":"J. Cole","url":"media/nl-fv-songs/song_080.m4a","duration":258},
  {"id":81,"file":"song_081.m4a","title":"Violent Crimes","artist":"Kanye West","url":"media/nl-fv-songs/song_081.m4a","duration":215},
  {"id":82,"file":"song_082.m4a","title":"Alright","artist":"Kendrick Lamar","url":"media/nl-fv-songs/song_082.m4a","duration":219},
  {"id":83,"file":"song_083.m4a","title":"Skit","artist":"L'morphine","url":"media/nl-fv-songs/song_083.m4a","duration":93},
  {"id":84,"file":"song_084.m4a","title":"Nsak","artist":"ONZY","url":"media/nl-fv-songs/song_084.m4a","duration":182},
  {"id":85,"file":"song_085.m4a","title":"Big Amount","artist":"2 Chainz","url":"media/nl-fv-songs/song_085.m4a","duration":188},
  {"id":86,"file":"song_086.m4a","title":"Massive","artist":"Drake","url":"media/nl-fv-songs/song_086.m4a","duration":337},
  {"id":87,"file":"song_087.m4a","title":"G.O.M.D","artist":"J. Cole","url":"media/nl-fv-songs/song_087.m4a","duration":301},
  {"id":88,"file":"song_088.m4a","title":"I Am The Greatest","artist":"Logic","url":"media/nl-fv-songs/song_088.m4a","duration":203},
  {"id":89,"file":"song_089.m4a","title":"Heart To Heart","artist":"Mac DeMarco","url":"media/nl-fv-songs/song_089.m4a","duration":211},
  {"id":90,"file":"song_090.m4a","title":"Nothing Else Matters (Remastered 2021)","artist":"Metallica","url":"media/nl-fv-songs/song_090.m4a","duration":389},
  {"id":91,"file":"song_091.m4a","title":"Purnamadah","artist":"Shantala","url":"media/nl-fv-songs/song_091.m4a","duration":515},
  {"id":92,"file":"song_092.m4a","title":"Tech N9ne feat Kendrick Lamar, ¡Mayday!, Kendall Morgan Fragile","artist":"","url":"media/nl-fv-songs/song_092.m4a","duration":236},
  {"id":93,"file":"song_093.m4a","title":"Halftime","artist":"Young Thug","url":"media/nl-fv-songs/song_093.m4a","duration":227},
  {"id":94,"file":"song_094.m4a","title":"No Role Modelz","artist":"J. Cole","url":"media/nl-fv-songs/song_094.m4a","duration":293},
  {"id":95,"file":"song_095.m4a","title":"Take What You Want","artist":"Post Malone","url":"media/nl-fv-songs/song_095.m4a","duration":230},
  {"id":96,"file":"song_096.m4a","title":"Lord Willin'","artist":"Logic","url":"media/nl-fv-songs/song_096.m4a","duration":209},
  {"id":97,"file":"song_097.m4a","title":"Already Home","artist":"JAY-Z","url":"media/nl-fv-songs/song_097.m4a","duration":270},
  {"id":98,"file":"song_098.m4a","title":"The Glory","artist":"Kanye West","url":"media/nl-fv-songs/song_098.m4a","duration":213},
  {"id":99,"file":"song_099.m4a","title":"Ceux qui rêvent","artist":"Pomme","url":"media/nl-fv-songs/song_099.m4a","duration":118},
  {"id":100,"file":"song_100.m4a","title":"Outro","artist":"Big Sean","url":"media/nl-fv-songs/song_100.m4a","duration":223},
  {"id":101,"file":"song_101.m4a","title":"6 Man","artist":"Drake","url":"media/nl-fv-songs/song_101.m4a","duration":168},
  {"id":102,"file":"song_102.m4a","title":"Boadicea (2009 Remaster)","artist":"Enya","url":"media/nl-fv-songs/song_102.m4a","duration":212},
  {"id":103,"file":"song_103.m4a","title":"I Will Survive","artist":"Gloria Gaynor","url":"media/nl-fv-songs/song_103.m4a","duration":279},
  {"id":104,"file":"song_104.m4a","title":"Ain't That Some Shit (Interlude)","artist":"J. Cole","url":"media/nl-fv-songs/song_104.m4a","duration":147},
  {"id":105,"file":"song_105.m4a","title":"Guillotine","artist":"Jon Bellion, Travis Mendes","url":"media/nl-fv-songs/song_105.m4a","duration":208},
  {"id":106,"file":"song_106.m4a","title":"Trap Niggas","artist":"Future","url":"media/nl-fv-songs/song_106.m4a","duration":184},
  {"id":107,"file":"song_107.m4a","title":"Captcha","artist":"L'morphine","url":"media/nl-fv-songs/song_107.m4a","duration":132},
  {"id":108,"file":"song_108.m4a","title":"Botola","artist":"Stormy","url":"media/nl-fv-songs/song_108.m4a","duration":186},
  {"id":109,"file":"song_109.m4a","title":"Bre Petrunko","artist":"Baklava","url":"media/nl-fv-songs/song_109.m4a","duration":80},
  {"id":110,"file":"song_110.m4a","title":"What You Know Bout Love","artist":"Pop Smoke","url":"media/nl-fv-songs/song_110.m4a","duration":160},
  {"id":111,"file":"song_111.m4a","title":"Switch Up","artist":"Big Sean, Common","url":"media/nl-fv-songs/song_111.m4a","duration":308},
  {"id":112,"file":"song_112.m4a","title":"مولاى انى ببابك","artist":"El Sheikh Al Naqshabandy","url":"media/nl-fv-songs/song_112.m4a","duration":373},
  {"id":113,"file":"song_113.m4a","title":"Fly Me To The Moon (In Other Words)","artist":"Julie London","url":"media/nl-fv-songs/song_113.m4a","duration":162},
  {"id":114,"file":"song_114.m4a","title":"Saint Pablo","artist":"Kanye West","url":"media/nl-fv-songs/song_114.m4a","duration":372},
  {"id":115,"file":"song_115.m4a","title":"True","artist":"Akira Yamaoka","url":"media/nl-fv-songs/song_115.m4a","duration":187},
  {"id":116,"file":"song_116.m4a","title":"Shahdaroba","artist":"Roy Orbison","url":"media/nl-fv-songs/song_116.m4a","duration":159}
];

// ---- New songs (id>=117) are loaded at runtime from this manifest (absolute URLs). ----
const MANIFEST_URL = (typeof window!=='undefined' && window.NL_SPOTIFY_MANIFEST_URL) || 'media/nl-fv-songs/songs.manifest.json';
const LRCLIB_API = 'https://lrclib.net/api';
const PROFILE_IMG = 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn/profile_img.webp';
const DL_SVG = ic('<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',{size:14});
const DL_SVG16 = ic('<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',{size:16});

const EQ_FREQS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EQ_PRESETS = {
  Flat:[0,0,0,0,0,0,0,0,0,0],'Bass Boost':[7,6,5,3,1,0,0,0,0,0],'Treble Boost':[0,0,0,0,0,1,3,5,6,7],
  Vocal:[-2,-1,0,2,4,4,3,1,0,-1],Rock:[5,4,2,0,-1,-1,0,2,3,4],Pop:[-1,0,2,4,4,2,0,-1,-2,-2],
  Jazz:[3,2,1,2,-1,-1,0,1,2,3],Classical:[4,3,2,0,0,0,-1,-1,0,2],'Hip-Hop':[6,5,3,2,1,-1,0,1,2,3],Electronic:[5,4,1,0,-2,1,0,1,4,5]
};
const SPEEDS = [0.5,0.75,1,1.25,1.5,2];
const STORE_KEY = 'nlspotify_state_v2';
const ROW_H = 46;          // virtualized row height (px)
const OVERSCAN = 8;        // rows rendered above/below viewport
const LRC_CACHE_MAX = 400; // max cached lyrics entries
const PREFETCH_MAX = 3;    // concurrent LRClib prefetches

// ---- helpers ----
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function fmtTime(s){ if(!isFinite(s)||s<0) s=0; const m=Math.floor(s/60), sec=Math.floor(s%60); return m+':'+String(sec).padStart(2,'0'); }
function hashHue(str){ let h=0; for(let i=0;i<(str||'').length;i++){ h=(h*31+str.charCodeAt(i))>>>0; } return h%360; }
function initials(t){ const c=(t||'?').replace(/[^\p{L}\p{N}\s]/gu,'').trim().split(/\s+/).filter(Boolean); return (((c[0]||'?')[0]||'?')+((c[1]||'')[0]||'')).toUpperCase(); }
function isRTL(s){ return /[\u0600-\u06FF]/.test(s||''); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function shuffleInPlace(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// ---- inline SVG icons (stroke=currentColor) ----
function ic(d, o){ o=o||{}; const s=o.size||18; const f=o.fill||'none'; const sw=o.sw==null?2:o.sw; return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="${f}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`; }
const ICONS = {
  play:(o)=>ic('<path d="M6 4l14 8-14 8z"/>',Object.assign({fill:'currentColor',sw:0},o)),
  pause:(o)=>ic('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',Object.assign({fill:'currentColor',sw:0},o)),
  prev:(o)=>ic('<path d="M19 5v14l-9-7z"/><rect x="5" y="5" width="2.4" height="14" rx="1"/>',Object.assign({fill:'currentColor',sw:0},o)),
  next:(o)=>ic('<path d="M5 5v14l9-7z"/><rect x="16.6" y="5" width="2.4" height="14" rx="1"/>',Object.assign({fill:'currentColor',sw:0},o)),
  back10:(o)=>ic('<path d="M11 7L6 12l5 5"/><path d="M6 12h9a4 4 0 0 1 0 8h-3"/>',o),
  fwd10:(o)=>ic('<path d="M13 7l5 5-5 5"/><path d="M18 12H9a4 4 0 0 0 0 8h3"/>',o),
  shuffle:(o)=>ic('<path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>',o),
  repeat:(o)=>ic('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',o),
  repeatOne:(o)=>ic('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="15" font-size="8" fill="currentColor" stroke="none" text-anchor="middle">1</text>',o),
  vol:(o)=>ic('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 8a5 5 0 0 1 0 8"/><path d="M19 5a9 9 0 0 1 0 14"/>',o),
  mute:(o)=>ic('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/>',o),
  search:(o)=>ic('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',o),
  heart:(o)=>ic('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',o),
  heartFill:(o)=>ic('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',Object.assign({fill:'currentColor',sw:0},o)),
  eq:(o)=>ic('<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/>',o),
  lyrics:(o)=>ic('<path d="M4 5h16"/><path d="M4 10h11"/><path d="M4 15h16"/><path d="M4 20h8"/>',o),
  viz:(o)=>ic('<rect x="3" y="10" width="3" height="10" rx="1"/><rect x="8.5" y="5" width="3" height="15" rx="1"/><rect x="14" y="12" width="3" height="8" rx="1"/><rect x="19" y="7" width="2.5" height="13" rx="1"/>',o),
  info:(o)=>ic('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.5" r="0.6" fill="currentColor"/>',o),
  now:(o)=>ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>',o),
  music:(o)=>ic('<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',o)
};

function loadState(){ try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch(e){ return {}; } }
let _state = loadState();
function saveState(patch){ _state = Object.assign({}, _state, patch||{}); try { localStorage.setItem(STORE_KEY, JSON.stringify(_state)); } catch(e){} }

// ---------- styles ----------
let stylesInjected = false;
function injectStyles(){
  if (stylesInjected || document.getElementById('nls-style')) { stylesInjected = true; return; }
  const st = document.createElement('style');
  st.id = 'nls-style';
  st.textContent = `
  .nls-root{--accent:#FF7A1A;--accent2:#34E89E;--xpblue:#1B6AC9;display:flex;flex-direction:column;height:100%;width:100%;font-family:'Segoe UI',Tahoma,sans-serif;font-size:12px;color:#eaf2ff;position:relative;background:radial-gradient(130% 130% at 15% 0%,#243049 0%,#161a2e 55%,#0c0e18 100%);overflow:hidden}
  .nls-root *{box-sizing:border-box}
  .nls-glass{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 8px 24px rgba(0,0,0,.32);-webkit-backdrop-filter:blur(22px) saturate(170%);backdrop-filter:blur(22px) saturate(170%);position:relative}
  .nls-tabs{display:flex;gap:6px;padding:8px 10px;flex:0 0 auto}
  .nls-tab{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:12px;cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#cfe0ff;user-select:none;transition:all .15s;font-weight:600}
  .nls-tab svg{opacity:.9}
  .nls-tab:hover{background:rgba(255,255,255,.12)}
  .nls-tab.active{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#10131f;border-color:transparent;box-shadow:0 4px 14px rgba(255,122,26,.35)}
  .nls-tab.active svg{opacity:1}
  .nls-main{display:flex;flex:1 1 auto;min-height:0;gap:10px;padding:0 10px 10px}
  .nls-side{flex:0 0 264px;border-radius:14px;display:flex;flex-direction:column;min-height:0;overflow:hidden}
  .nls-searchwrap{position:relative;margin:10px 10px 6px}
  .nls-searchwrap svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:#9fb2d8;pointer-events:none}
  .nls-search{width:100%;padding:7px 10px 7px 30px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.28);color:#fff;font-size:12px;outline:none}
  .nls-search:focus{border-color:var(--accent);background:rgba(0,0,0,.4)}
  .nls-search::placeholder{color:#8ea1c8}
  .nls-listhead{display:flex;justify-content:space-between;align-items:center;padding:2px 12px 6px;color:#9fb2d8;font-size:11px}
  .nls-favtoggle{display:flex;align-items:center;gap:5px;cursor:pointer;padding:3px 8px;border-radius:10px;border:1px solid transparent}
  .nls-favtoggle:hover{background:rgba(255,255,255,.08)}
  .nls-favtoggle.on{color:#ff5d8f;border-color:rgba(255,93,143,.4);background:rgba(255,93,143,.1)}
  .nls-listvp{flex:1 1 auto;overflow-y:auto;position:relative;padding:0 6px 8px}
  .nls-sizer{position:relative;width:100%}
  .nls-li{position:absolute;left:6px;right:6px;height:${ROW_H-6}px;display:flex;align-items:center;gap:9px;padding:0 8px;border-radius:10px;cursor:pointer;white-space:nowrap;border:1px solid transparent}
  .nls-li:hover{background:rgba(255,255,255,.09)}
  .nls-li.active{background:linear-gradient(90deg,rgba(255,122,26,.28),rgba(52,232,158,.06));border-color:rgba(255,122,26,.4)}
  .nls-li .cov{flex:0 0 auto;width:32px;height:32px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;background-size:cover;background-position:center}
  .nls-li .cov img{width:100%;height:100%;object-fit:cover;display:block}
  .nls-li .meta{overflow:hidden;flex:1 1 auto;min-width:0}
  .nls-li .t{display:block;overflow:hidden;text-overflow:ellipsis;font-weight:600}
  .nls-li .a{display:block;font-size:11px;color:#9fb2d8;overflow:hidden;text-overflow:ellipsis}
  .nls-li .dur{flex:0 0 auto;color:#8fa3cc;font-variant-numeric:tabular-nums;font-size:11px}
  .nls-li .fav{flex:0 0 auto;color:#ff5d8f;opacity:0;display:flex}
  .nls-li.isfav .fav{opacity:1}
  .nls-li:hover .fav{opacity:.55}
  .nls-li .dl{flex:0 0 auto;color:#9fb2d8;opacity:0;display:flex;cursor:pointer;padding:2px}
  .nls-li:hover .dl{opacity:.7}
  .nls-li .dl:hover{color:#fff;transform:translateY(-1px)}
  .nls-li .dl.busy{opacity:1;color:var(--accent2);animation:nlspin 1s linear infinite}
  @keyframes nlspin{to{transform:rotate(360deg)}}
  .nls-center{flex:1 1 auto;min-width:0;border-radius:14px;display:flex;flex-direction:column;overflow:hidden}
  .nls-view{flex:1 1 auto;min-height:0;display:none;overflow:auto}
  .nls-view.show{display:flex}
  /* now playing */
  .nls-now{flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:22px;text-align:center;position:relative}
  .nls-art{width:210px;height:210px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:800;color:rgba(255,255,255,.95);text-shadow:0 2px 10px rgba(0,0,0,.5);box-shadow:0 16px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.3);overflow:hidden;background-size:cover;background-position:center}
  .nls-art img{width:100%;height:100%;object-fit:cover}
  .nls-title{font-size:21px;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,.5);max-width:92%}
  .nls-artist{font-size:14px;color:#bcd0f5}
  .nls-sub{font-size:12px;color:#8fa3cc}
  .nls-related{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;max-width:96%;margin-top:4px}
  .nls-chip{display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);cursor:pointer;font-size:11px;color:#cfe0ff;max-width:180px}
  .nls-chip:hover{background:rgba(255,255,255,.16)}
  .nls-chip .cc{width:18px;height:18px;border-radius:5px;background-size:cover;background-position:center;flex:0 0 auto}
  .nls-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  /* lyrics viewer */
  .nls-lyrics{position:relative;flex-direction:column;padding:0;overflow:hidden}
  .nls-lyrbg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(26px) brightness(.45) saturate(1.2);transform:scale(1.18);transition:background-image .6s}
  .nls-lyrbg::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,14,24,.55),rgba(12,14,24,.82))}
  .nls-lyrscroll{position:relative;z-index:1;flex:1 1 auto;overflow-y:auto;padding:40% 26px;text-align:center;scroll-behavior:smooth;-ms-overflow-style:none;scrollbar-width:none}
  .nls-lyrscroll::-webkit-scrollbar{width:0;height:0}
  .nls-lrc-line{padding:7px 0;font-size:18px;font-weight:700;line-height:1.5;color:rgba(255,255,255,.42);transition:color .25s,opacity .25s,transform .25s;cursor:pointer}
  .nls-lrc-line:hover{color:rgba(255,255,255,.7)}
  .nls-lrc-line.cur{color:#fff;text-shadow:0 0 18px rgba(52,232,158,.55);transform:scale(1.04)}
  .nls-lrc-line.plain{cursor:default}
  .nls-lyrempty{position:relative;z-index:1;flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:rgba(255,255,255,.6)}
  .nls-lyrfade{position:absolute;left:0;right:0;height:80px;z-index:2;pointer-events:none}
  .nls-lyrfade.top{top:0;background:linear-gradient(rgba(12,14,24,.65),transparent)}
  .nls-lyrfade.bot{bottom:64px;background:linear-gradient(transparent,rgba(12,14,24,.65))}
  .nls-lyrhead{position:absolute;left:0;right:0;bottom:0;z-index:3;display:flex;align-items:center;gap:10px;padding:10px 16px;background:linear-gradient(transparent,rgba(0,0,0,.4))}
  .nls-lyrhead .lc{width:40px;height:40px;border-radius:9px;background-size:cover;background-position:center;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;overflow:hidden}
  .nls-lyrhead .lt{overflow:hidden}.nls-lyrhead .lt b{display:block;font-size:13px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .nls-lyrhead .lt span{font-size:11px;color:#b9c8ea}
  /* visualizer */
  .nls-viz{align-items:stretch;justify-content:center;padding:12px}
  .nls-viz canvas{width:100%;height:100%;border-radius:10px;background:rgba(0,0,0,.25)}
  /* eq */
  .nls-eq{flex-direction:column;padding:14px;gap:12px}
  .nls-eqtop{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .nls-eqbands{display:flex;justify-content:space-around;align-items:flex-end;flex:1 1 auto;gap:6px;min-height:150px}
  .nls-eqband{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:10px;color:#a9bbe0;height:100%}
  .nls-eqband input[type=range]{writing-mode:vertical-lr;direction:rtl;width:22px;height:120px;accent-color:var(--accent)}
  .nls-eqcurve{height:60px;width:100%;border-radius:8px;background:rgba(0,0,0,.25)}
  /* info */
  .nls-info{flex-direction:column;padding:20px;gap:6px;line-height:1.8;overflow:auto}
  .nls-info h3{margin:10px 0 4px;color:#fff;font-size:14px}
  .nls-info .row{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(255,255,255,.08);padding:5px 0}
  .nls-info .k{color:#9fb2d8}
  .nls-info .v{text-align:right;overflow:hidden;text-overflow:ellipsis}
  /* controls */
  .nls-bar{flex:0 0 auto;border-radius:14px;margin:0 10px 10px;padding:8px 12px;display:flex;flex-direction:column;gap:8px}
  .nls-seekwrap{position:relative;height:24px;display:flex;align-items:center;padding:0 2px}
  .nls-seekwrap::before{content:'';position:absolute;left:2px;right:2px;top:50%;transform:translateY(-50%);height:7px;border-radius:999px;background:rgba(255,255,255,.10);box-shadow:inset 0 1px 2px rgba(0,0,0,.45),inset 0 -1px 0 rgba(255,255,255,.06);backdrop-filter:blur(6px);pointer-events:none}
  .nls-buffered{position:absolute;left:2px;top:50%;transform:translateY(-50%);height:7px;background:rgba(255,255,255,.18);border-radius:999px;width:0;pointer-events:none}
  .nls-seekfill{position:absolute;left:2px;top:50%;transform:translateY(-50%);height:7px;border-radius:999px;background:linear-gradient(90deg,var(--accent),var(--accent2));width:0;pointer-events:none;box-shadow:0 0 10px rgba(52,232,158,.45)}
  .nls-seek{position:relative;width:100%;height:24px;margin:0;background:transparent;-webkit-appearance:none;appearance:none;cursor:pointer;z-index:2}
  .nls-seek:focus{outline:none}
  .nls-seek::-webkit-slider-runnable-track{height:24px;background:transparent}
  .nls-seek::-moz-range-track{height:24px;background:transparent}
  .nls-seek::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#dfe8ff);border:0;box-shadow:0 2px 7px rgba(0,0,0,.55),0 0 0 4px rgba(255,255,255,.16);margin-top:3.5px;transition:transform .12s}
  .nls-seekwrap:hover .nls-seek::-webkit-slider-thumb{transform:scale(1.22)}
  .nls-seek::-moz-range-thumb{width:17px;height:17px;border-radius:50%;background:#fff;border:0;box-shadow:0 2px 7px rgba(0,0,0,.55),0 0 0 4px rgba(255,255,255,.16)}
  .nls-ctlrow{display:flex;align-items:center;gap:7px}
  .nls-time{font-variant-numeric:tabular-nums;color:#bcd0f5;min-width:40px;text-align:center}
  .nls-btn{min-width:32px;height:32px;padding:0 8px;border-radius:9px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#eaf2ff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .14s}
  .nls-btn:hover{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.3)}
  .nls-btn:active{transform:translateY(1px)}
  .nls-btn.on{color:#10131f;background:linear-gradient(135deg,var(--accent),var(--accent2));border-color:transparent}
  .nls-btn.play{min-width:48px;height:40px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#10131f;border-color:transparent;box-shadow:0 6px 18px rgba(255,122,26,.4)}
  .nls-vol{width:92px;accent-color:var(--accent)}
  .nls-sel{height:30px;border-radius:9px;background:rgba(0,0,0,.32);color:#eaf2ff;border:1px solid rgba(255,255,255,.2);font-size:11px;padding:0 6px}
  .nls-spacer{flex:1 1 auto}
  .nls-root ::-webkit-scrollbar{width:11px;height:11px}
  .nls-root ::-webkit-scrollbar-thumb{background:linear-gradient(var(--accent),var(--accent2));border-radius:6px;border:2px solid transparent;background-clip:content-box}
  .nls-root ::-webkit-scrollbar-track{background:rgba(0,0,0,.18)}
  @media (max-width:640px){ .nls-side{flex-basis:200px} .nls-art{width:150px;height:150px;font-size:46px} }
  `;
  document.head.appendChild(st);
  stylesInjected = true;
}

// ---------- main ----------
export function initNLSpotify(win, showNotification){
  injectStyles();
  const notify = (m)=>{ try { showNotification && showNotification(m); } catch(e){} };
  const content = win.querySelector('.window-content');
  if (!content) return;

  // ---- build library (116 built-in + manifest) ----
  function normTrack(r, i){
    return {
      key: r.url, id: r.id!=null?r.id:(i+1), file: r.file||'',
      title: r.title||'Unknown Track', artist: r.artist||'Unknown Artist',
      album: r.album||'', genre: r.genre||'', year: r.year||'',
      duration: r.duration||r.durationSec||0,
      url: r.url, cover: r.cover||r.coverUrl||null
    };
  }
  let LIB = NL_FV_TRACKS.map(normTrack);
  let displayOrder = shuffleInPlace(LIB.map((_,i)=>i));   // random list order
  let view = displayOrder.slice();                        // filtered indices (into LIB)

  // ---- persistent state ----
  let vol = typeof _state.volume==='number'?_state.volume:0.8;
  let muted=!!_state.muted, shuffle=!!_state.shuffle, repeat=_state.repeat||'off', speed=_state.speed||1;
  let eqBands = Array.isArray(_state.eqBands)&&_state.eqBands.length===10?_state.eqBands.slice():EQ_PRESETS.Flat.slice();
  let eqBypass=!!_state.eqBypass, favorites=_state.favorites||{}, playCounts=_state.playCounts||{};

  // ---- DOM ----
  content.innerHTML = `
  <div class="nls-root" tabindex="-1">
    <div class="nls-tabs">
      <span class="nls-tab active" data-view="now">${ICONS.now({size:15})}<span>Now Playing</span></span>
      <span class="nls-tab" data-view="lyrics">${ICONS.lyrics({size:15})}<span>Lyrics</span></span>
      <span class="nls-tab" data-view="viz">${ICONS.viz({size:15})}<span>Visualizer</span></span>
      <span class="nls-tab" data-view="eq">${ICONS.eq({size:15})}<span>EQ</span></span>
      <span class="nls-tab" data-view="info">${ICONS.info({size:15})}<span>Info</span></span>
    </div>
    <div class="nls-main">
      <div class="nls-side nls-glass">
        <div class="nls-searchwrap">${ICONS.search({size:15})}<input class="nls-search" type="text" placeholder="Search title or artist..."></div>
        <div class="nls-listhead"><span class="nls-count"></span><span class="nls-favtoggle">${ICONS.heart({size:13})}<span>Favorites</span></span></div>
        <div class="nls-listvp"><div class="nls-sizer"></div></div>
      </div>
      <div class="nls-center nls-glass">
        <div class="nls-view nls-now show">
          <div class="nls-art"></div>
          <div class="nls-title">NL spotify</div>
          <div class="nls-artist">pick a track to begin</div>
          <div class="nls-sub"></div>
          <div class="nls-related"></div>
        </div>
        <div class="nls-view nls-lyrics">
          <div class="nls-lyrbg"></div>
          <div class="nls-lyrfade top"></div>
          <div class="nls-lyrscroll"></div>
          <div class="nls-lyrfade bot"></div>
          <div class="nls-lyrhead"><div class="lc"></div><div class="lt"><b></b><span></span></div></div>
        </div>
        <div class="nls-view nls-viz"><canvas></canvas></div>
        <div class="nls-view nls-eq">
          <div class="nls-eqtop">
            <select class="nls-sel nls-eqpreset"></select>
            <button class="nls-btn nls-eqbypass" style="width:auto;padding:0 12px">Bypass</button>
            <span style="color:#9fb2d8">10-band \u00B112dB</span>
          </div>
          <div class="nls-eqbands"></div>
          <canvas class="nls-eqcurve"></canvas>
        </div>
        <div class="nls-view nls-info"></div>
      </div>
    </div>
    <div class="nls-bar nls-glass">
      <div class="nls-seekwrap"><div class="nls-buffered"></div><div class="nls-seekfill"></div><input class="nls-seek" type="range" min="0" max="100" value="0" step="0.1"></div>
      <div class="nls-ctlrow">
        <span class="nls-time nls-cur">0:00</span>
        <button class="nls-btn nls-prev" title="Previous">${ICONS.prev({size:16})}</button>
        <button class="nls-btn nls-back" title="-10s">${ICONS.back10({size:16})}</button>
        <button class="nls-btn play nls-play" title="Play/Pause">${ICONS.play({size:20})}</button>
        <button class="nls-btn nls-next" title="Next">${ICONS.next({size:16})}</button>
        <span class="nls-time nls-dur">0:00</span>
        <span class="nls-spacer"></span>
        <button class="nls-btn nls-dl" title="Download (NL)">${DL_SVG16}</button>
        <button class="nls-btn nls-shuffle" title="Shuffle">${ICONS.shuffle({size:16})}</button>
        <button class="nls-btn nls-repeat" title="Repeat">${ICONS.repeat({size:16})}</button>
        <select class="nls-sel nls-speed" title="Speed"></select>
        <button class="nls-btn nls-mute" title="Mute">${ICONS.vol({size:16})}</button>
        <input class="nls-vol" type="range" min="0" max="1" step="0.01">
      </div>
    </div>
  </div>`;

  const root = content.querySelector('.nls-root');
  const $ = (s)=>root.querySelector(s);
  const audio = new Audio();
  audio.preload='metadata'; audio.crossOrigin='anonymous'; audio.volume=muted?0:vol; audio.playbackRate=speed;

  // ---- web audio graph (lazy) ----
  let actx, srcNode, eqNodes=[], panNode, gainNode, analyser, graphReady=false, vizRAF=null;
  function setupGraph(){
    if (graphReady) return;
    try {
      const AC = window.AudioContext||window.webkitAudioContext; if(!AC) return;
      actx=new AC(); srcNode=actx.createMediaElementSource(audio);
      eqNodes=EQ_FREQS.map((f,i)=>{ const n=actx.createBiquadFilter(); n.type=i===0?'lowshelf':(i===EQ_FREQS.length-1?'highshelf':'peaking'); n.frequency.value=f; n.Q.value=1; n.gain.value=0; return n; });
      panNode=actx.createStereoPanner?actx.createStereoPanner():null;
      gainNode=actx.createGain(); gainNode.gain.value=1;
      analyser=actx.createAnalyser(); analyser.fftSize=256; analyser.smoothingTimeConstant=0.85;
      let node=srcNode; eqNodes.forEach(n=>{ node.connect(n); node=n; });
      if(panNode){ node.connect(panNode); node=panNode; }
      node.connect(gainNode); gainNode.connect(analyser); analyser.connect(actx.destination);
      graphReady=true; applyEq();
    } catch(e){ graphReady=false; }
  }
  function applyEq(){ if(!graphReady) return; const b=eqBypass?new Array(10).fill(0):eqBands; eqNodes.forEach((n,i)=>n.gain.value=clamp(b[i],-12,12)); drawEqCurve(); }

  // ---- playback ----
  let current=-1; // index into LIB
  function trackArtCss(t){ const h=hashHue((t.artist||'')+(t.title||'')); return `linear-gradient(135deg,hsl(${h},58%,46%),hsl(${(h+38)%360},52%,26%))`; }
  function coverStyle(t){ return t && t.cover ? `background-image:url('${esc(t.cover)}')` : `background:${trackArtCss(t||{})}`; }

  function play(idx){
    if (idx<0||idx>=LIB.length) return;
    current=idx; const t=LIB[idx];
    audio.src=t.url; audio.playbackRate=speed; setupGraph();
    if(actx&&actx.state==='suspended') actx.resume();
    audio.play().catch(()=>{});
    playCounts[t.key]=(playCounts[t.key]||0)+1;
    saveState({ currentKey:t.key, playCounts });
    updateNow(); renderRows(); updateMediaSession();
    loadLyricsFor(t); prefetchNext();
  }
  function viewPos(){ return view.indexOf(current); }
  function nextIndexInView(step){
    if (shuffle){ if(view.length<=1) return view[0]!=null?view[0]:-1; let r; do { r=view[Math.floor(Math.random()*view.length)]; } while(r===current&&view.length>1); return r; }
    const p=viewPos(); if(p<0) return view[0]!=null?view[0]:-1;
    let np=p+step;
    if(np>=view.length){ if(repeat==='all') np=0; else return -1; }
    if(np<0){ np=view.length-1; }
    return view[np];
  }
  function next(auto){ if(auto&&repeat==='one'){ audio.currentTime=0; audio.play().catch(()=>{}); return; } const ni=nextIndexInView(1); if(ni<0){ audio.pause(); return; } play(ni); }
  function prev(){ if(audio.currentTime>3){ audio.currentTime=0; return; } const pi=nextIndexInView(-1); play(pi<0?current:pi); }

  // ---- now playing ----
  const artEl=$('.nls-art'), titleEl=$('.nls-title'), artistEl=$('.nls-artist'), subEl=$('.nls-sub'), relatedEl=$('.nls-related');
  function setArt(el,t){ if(t&&t.cover){ el.style.background=''; el.style.backgroundImage=`url("${t.cover}")`; el.textContent=''; } else { el.style.backgroundImage=''; el.style.background=trackArtCss(t||{}); el.textContent=initials(t?t.title:'NL'); } }
  function updateNow(){
    if(current<0) return; const t=LIB[current];
    setArt(artEl,t);
    titleEl.textContent=t.title; titleEl.dir=isRTL(t.title)?'rtl':'ltr';
    artistEl.textContent=t.artist; artistEl.dir=isRTL(t.artist)?'rtl':'ltr';
    const bits=[]; if(t.album) bits.push(t.album); if(t.year) bits.push(t.year); if(t.genre) bits.push(t.genre); bits.push('played '+(playCounts[t.key]||0)+'\u00D7');
    subEl.textContent=bits.join('  \u00B7  ');
    renderRelated(t); buildInfo();
  }
  function renderRelated(t){
    const rel=[]; const seen={};
    if(t.artist){ LIB.forEach((o,i)=>{ if(rel.length<6&&o.artist===t.artist&&i!==current&&!seen[i]){ seen[i]=1; rel.push(i); } }); }
    if(t.album){ LIB.forEach((o,i)=>{ if(rel.length<8&&o.album&&o.album===t.album&&i!==current&&!seen[i]){ seen[i]=1; rel.push(i); } }); }
    if(!rel.length){ relatedEl.innerHTML=''; return; }
    relatedEl.innerHTML=rel.map(i=>{ const o=LIB[i]; const cs=o.cover?`background-image:url('${esc(o.cover)}')`:`background:${trackArtCss(o)}`; return `<span class="nls-chip" data-i="${i}"><span class="cc" style="${cs}"></span><span dir="${isRTL(o.title)?'rtl':'ltr'}">${esc(o.title)}</span></span>`; }).join('');
  }
  relatedEl.addEventListener('click',(e)=>{ const c=e.target.closest('.nls-chip'); if(!c) return; const i=parseInt(c.dataset.i,10); if(view.indexOf(i)<0){ view=displayOrder.slice(); } play(i); });

  // ---- virtualized list ----
  const vp=$('.nls-listvp'), sizer=$('.nls-sizer'), countEl=$('.nls-count'), searchEl=$('.nls-search'), favToggle=$('.nls-favtoggle');
  let filter='', favOnly=false;
  function rebuildView(){
    const q=filter.trim().toLowerCase();
    view = displayOrder.filter(i=>{
      const t=LIB[i];
      if(favOnly && !favorites[t.key]) return false;
      if(q && !((t.title||'').toLowerCase().includes(q) || (t.artist||'').toLowerCase().includes(q))) return false;
      return true;
    });
    sizer.style.height=(view.length*ROW_H)+'px';
    countEl.textContent=view.length+' / '+LIB.length+' songs';
    renderRows();
  }
  function renderRows(){
    const scrollTop=vp.scrollTop, h=vp.clientHeight;
    let start=Math.max(0,Math.floor(scrollTop/ROW_H)-OVERSCAN);
    let end=Math.min(view.length,Math.ceil((scrollTop+h)/ROW_H)+OVERSCAN);
    let html='';
    for(let p=start;p<end;p++){
      const i=view[p]; const t=LIB[i];
      const cs=t.cover?`background-image:url('${esc(t.cover)}')`:`background:${trackArtCss(t)}`;
      const covInner=t.cover?'':esc(initials(t.title));
      html+=`<div class="nls-li${i===current?' active':''}${favorites[t.key]?' isfav':''}" data-i="${i}" style="top:${p*ROW_H}px">`+
        `<span class="cov" style="${cs}">${covInner}</span>`+
        `<span class="meta"><span class="t" dir="${isRTL(t.title)?'rtl':'ltr'}">${esc(t.title)}</span><span class="a" dir="${isRTL(t.artist)?'rtl':'ltr'}">${esc(t.artist)}</span></span>`+
        `<span class="dur">${t.duration?fmtTime(t.duration):''}</span>`+
        `<span class="dl" title="Download">${DL_SVG}</span>`+
        `<span class="fav">${ICONS.heartFill({size:13})}</span>`+
      `</div>`;
    }
    sizer.innerHTML=html;
    schedulePrefetchVisible(start,end);
  }
  let _scrollRAF=null;
  vp.addEventListener('scroll',()=>{ if(_scrollRAF) return; _scrollRAF=requestAnimationFrame(()=>{ _scrollRAF=null; renderRows(); }); });
  sizer.addEventListener('click',(e)=>{
    const fav=e.target.closest('.fav'); const dl=e.target.closest('.dl'); const li=e.target.closest('.nls-li'); if(!li) return;
    const i=parseInt(li.dataset.i,10);
    if(dl){ downloadTrack(LIB[i]); return; }
    if(fav){ const k=LIB[i].key; if(favorites[k]) delete favorites[k]; else favorites[k]=1; saveState({favorites}); if(favOnly) rebuildView(); else renderRows(); if(i===current) updateNow(); return; }
    if(view.indexOf(i)<0){ view=displayOrder.slice(); } play(i);
  });
  searchEl.addEventListener('input',()=>{ filter=searchEl.value; clearTimeout(searchEl._t); searchEl._t=setTimeout(rebuildView,140); });
  favToggle.addEventListener('click',()=>{ favOnly=!favOnly; favToggle.classList.toggle('on',favOnly); vp.scrollTop=0; rebuildView(); });

  // ---- tabs ----
  root.querySelectorAll('.nls-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      root.querySelectorAll('.nls-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const v=tab.dataset.view;
      root.querySelectorAll('.nls-view').forEach(el=>el.classList.remove('show'));
      $('.nls-'+v).classList.add('show');
      if(v==='viz') startViz();
      if(v==='eq') drawEqCurve();
      if(v==='lyrics') scrollCurLyric(true);
    });
  });

  // ---- controls ----
  const playBtn=$('.nls-play'), seek=$('.nls-seek'), buffered=$('.nls-buffered'), seekFill=$('.nls-seekfill');
  function setSeekFill(pct){ if(seekFill) seekFill.style.width=Math.max(0,Math.min(100,pct))+'%'; }
  const curEl=$('.nls-cur'), durEl=$('.nls-dur'), volEl=$('.nls-vol'), muteBtn=$('.nls-mute');
  const shuffleBtn=$('.nls-shuffle'), repeatBtn=$('.nls-repeat'), speedSel=$('.nls-speed');
  SPEEDS.forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s+'\u00D7'; if(s===speed)o.selected=true; speedSel.appendChild(o); });
  volEl.value=muted?0:vol; shuffleBtn.classList.toggle('on',shuffle);
  function repeatGlyph(){ repeatBtn.innerHTML = repeat==='one'?ICONS.repeatOne({size:16}):ICONS.repeat({size:16}); repeatBtn.classList.toggle('on',repeat!=='off'); }
  repeatGlyph();
  function muteGlyph(){ muteBtn.innerHTML=(muted||vol===0)?ICONS.mute({size:16}):ICONS.vol({size:16}); }
  muteGlyph();
  playBtn.addEventListener('click',()=>{ if(current<0){ play(view[0]!=null?view[0]:0); return; } if(audio.paused){ if(actx&&actx.state==='suspended')actx.resume(); audio.play().catch(()=>{}); } else audio.pause(); });
  $('.nls-prev').addEventListener('click',prev);
  $('.nls-next').addEventListener('click',()=>next(false));
  $('.nls-back').addEventListener('click',()=>{ audio.currentTime=Math.max(0,audio.currentTime-10); });
  $('.nls-fwd')&&$('.nls-fwd').addEventListener('click',()=>{ audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10); });
  shuffleBtn.addEventListener('click',()=>{ shuffle=!shuffle; shuffleBtn.classList.toggle('on',shuffle); saveState({shuffle}); });
  repeatBtn.addEventListener('click',()=>{ repeat=repeat==='off'?'all':(repeat==='all'?'one':'off'); repeatGlyph(); saveState({repeat}); });
  speedSel.addEventListener('change',()=>{ speed=parseFloat(speedSel.value); audio.playbackRate=speed; saveState({speed}); });
  muteBtn.addEventListener('click',()=>{ muted=!muted; audio.volume=muted?0:vol; muteGlyph(); saveState({muted}); });
  volEl.addEventListener('input',()=>{ vol=parseFloat(volEl.value); muted=false; audio.volume=vol; muteGlyph(); saveState({volume:vol,muted:false}); });

  let seeking=false;
  seek.addEventListener('input',()=>{ seeking=true; setSeekFill(parseFloat(seek.value)); if(audio.duration){ curEl.textContent=fmtTime(audio.duration*(seek.value/100)); } });
  seek.addEventListener('change',()=>{ if(audio.duration){ audio.currentTime=audio.duration*(seek.value/100); } seeking=false; });
  audio.addEventListener('timeupdate',()=>{ if(!seeking&&audio.duration){ const pct=(audio.currentTime/audio.duration)*100; seek.value=pct; setSeekFill(pct); } curEl.textContent=fmtTime(audio.currentTime); syncLyrics(); saveTimeThrottled(); });
  audio.addEventListener('loadedmetadata',()=>{ durEl.textContent=fmtTime(audio.duration); });
  audio.addEventListener('progress',()=>{ try{ if(audio.buffered.length&&audio.duration){ buffered.style.width=(audio.buffered.end(audio.buffered.length-1)/audio.duration*100)+'%'; } }catch(e){} });
  audio.addEventListener('play',()=>{ playBtn.innerHTML=ICONS.pause({size:20}); startViz(); updateMediaSession(); });
  audio.addEventListener('pause',()=>{ playBtn.innerHTML=ICONS.play({size:20}); });
  audio.addEventListener('ended',()=>next(true));
  audio.addEventListener('error',()=>{ notify('Skipping unplayable track'); setTimeout(()=>next(true),300); });
  let _saveT=0; function saveTimeThrottled(){ const n=Date.now(); if(n-_saveT>4000){ _saveT=n; saveState({currentKey:current>=0?LIB[current].key:null,currentTime:audio.currentTime}); } }

  // ---- visualizer ----
  const vizCanvas=$('.nls-viz canvas');
  function startViz(){ if(!analyser||vizRAF) return; const ctx=vizCanvas.getContext('2d'); const buf=new Uint8Array(analyser.frequencyBinCount);
    function frame(){ if(audio.paused){ vizRAF=null; return; } const w=vizCanvas.width=vizCanvas.clientWidth, h=vizCanvas.height=vizCanvas.clientHeight; analyser.getByteFrequencyData(buf); ctx.clearRect(0,0,w,h); const n=buf.length, bw=w/n; for(let i=0;i<n;i++){ const v=buf[i]/255; const bh=v*h; const g=ctx.createLinearGradient(0,h,0,h-bh); g.addColorStop(0,'#FF7A1A'); g.addColorStop(1,'#34E89E'); ctx.fillStyle=g; ctx.fillRect(i*bw,h-bh,bw*0.82,bh); } vizRAF=requestAnimationFrame(frame); }
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
  function drawEqCurve(){ if(!eqCurve.clientWidth) return; const ctx=eqCurve.getContext('2d'); const w=eqCurve.width=eqCurve.clientWidth, h=eqCurve.height=eqCurve.clientHeight; ctx.clearRect(0,0,w,h); const g=ctx.createLinearGradient(0,0,w,0); g.addColorStop(0,'#FF7A1A'); g.addColorStop(1,'#34E89E'); ctx.beginPath(); ctx.strokeStyle=g; ctx.lineWidth=2; const b=eqBypass?new Array(10).fill(0):eqBands; for(let i=0;i<b.length;i++){ const x=i/(b.length-1)*w; const y=h/2-(b[i]/12)*(h/2-6); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke(); ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke(); }

  // ---- LYRICS (LRClib runtime + cache + prefetch) ----
  const lyrScroll=$('.nls-lyrscroll'), lyrBg=$('.nls-lyrbg'), lyrHeadC=root.querySelector('.nls-lyrhead .lc'), lyrHeadB=root.querySelector('.nls-lyrhead .lt b'), lyrHeadS=root.querySelector('.nls-lyrhead .lt span');
  const lrcCache=new Map();      // key -> {lines:[{t,text}], synced:bool} | null (null = none found)
  const lrcInflight=new Map();   // key -> Promise
  let lrcLines=[], curLrc=-1, lrcToken=0, lrcSynced=false;
  const prefetchQueue=[]; let prefetchActive=0;

  function parseLrc(text){ const out=[]; const re=/\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g; (text||'').split(/\r?\n/).forEach(line=>{ let m; const tags=[]; re.lastIndex=0; while((m=re.exec(line))){ const t=parseInt(m[1])*60+parseInt(m[2])+(m[3]?parseInt(m[3].padEnd(3,'0'))/1000:0); tags.push(t); } const txt=line.replace(re,'').replace(/<\d{1,2}:\d{2}(?:[.:]\d{1,3})?>/g,'').trim(); if(tags.length){ tags.forEach(t=>out.push({t,text:txt})); } else if(txt){ out.push({t:-1,text:txt}); } }); out.sort((a,b)=>a.t-b.t); return out; }
  function lrcStore(key,val){ if(lrcCache.size>=LRC_CACHE_MAX){ const fk=lrcCache.keys().next().value; lrcCache.delete(fk); } lrcCache.set(key,val); }

  function fetchLyrics(t){
    if(!t) return Promise.resolve(null);
    if(lrcCache.has(t.key)) return Promise.resolve(lrcCache.get(t.key));
    if(lrcInflight.has(t.key)) return lrcInflight.get(t.key);
    const params=new URLSearchParams(); params.set('track_name',t.title||''); if(t.artist&&t.artist!=='Unknown Artist') params.set('artist_name',t.artist); if(t.album) params.set('album_name',t.album); if(t.duration) params.set('duration',String(Math.round(t.duration)));
    const getUrl=`${LRCLIB_API}/get?`+params.toString();
    const searchParams=new URLSearchParams(); searchParams.set('track_name',t.title||''); if(t.artist&&t.artist!=='Unknown Artist') searchParams.set('artist_name',t.artist);
    const searchUrl=`${LRCLIB_API}/search?`+searchParams.toString();
    const p=fetch(getUrl).then(r=>r.ok?r.json():Promise.reject()).catch(()=>fetch(searchUrl).then(r=>r.ok?r.json():Promise.reject()).then(arr=>Array.isArray(arr)&&arr.length?(arr.find(x=>x.syncedLyrics)||arr[0]):Promise.reject()))
      .then(d=>{ const syn=d&&d.syncedLyrics, pln=d&&d.plainLyrics; let val=null; if(syn){ val={lines:parseLrc(syn),synced:true}; } else if(pln){ val={lines:pln.split(/\r?\n/).filter(s=>s.trim()!=='').map(s=>({t:-1,text:s})),synced:false}; } if(val&&!val.lines.length) val=null; lrcStore(t.key,val); return val; })
      .catch(()=>{ lrcStore(t.key,null); return null; })
      .finally(()=>{ lrcInflight.delete(t.key); });
    lrcInflight.set(t.key,p); return p;
  }
  function pumpPrefetch(){ while(prefetchActive<PREFETCH_MAX && prefetchQueue.length){ const t=prefetchQueue.shift(); if(!t||lrcCache.has(t.key)||lrcInflight.has(t.key)) continue; prefetchActive++; fetchLyrics(t).finally(()=>{ prefetchActive--; pumpPrefetch(); }); } }
  function queuePrefetch(t){ if(!t||lrcCache.has(t.key)||lrcInflight.has(t.key)) return; prefetchQueue.push(t); }
  function schedulePrefetchVisible(start,end){ const idle=window.requestIdleCallback||function(f){return setTimeout(f,200);}; idle(()=>{ for(let p=start;p<end;p++){ const i=view[p]; if(i!=null) queuePrefetch(LIB[i]); } pumpPrefetch(); }); }
  function prefetchNext(){ const ni=nextIndexInView(1); if(ni>=0) queuePrefetch(LIB[ni]); const p=viewPos(); if(p>=0&&view[p+1]!=null) queuePrefetch(LIB[view[p+1]]); pumpPrefetch(); }

  function renderLrc(){
    if(!lrcLines.length){ lyrScroll.innerHTML=`<div class="nls-lyrempty">${ICONS.music({size:30})}<div>No lyrics available</div></div>`; return; }
    lyrScroll.innerHTML=lrcLines.map((l,i)=>`<div class="nls-lrc-line${lrcSynced?'':' plain'}" data-i="${i}" data-t="${l.t}" dir="${isRTL(l.text)?'rtl':'ltr'}">${esc(l.text)||'\u00A0'}</div>`).join('');
  }
  lyrScroll.addEventListener('click',(e)=>{ const ln=e.target.closest('.nls-lrc-line'); if(!ln||!lrcSynced) return; const tt=parseFloat(ln.dataset.t); if(isFinite(tt)&&tt>=0&&audio.duration){ audio.currentTime=tt; } });
  function scrollCurLyric(force){ if(!lrcSynced||curLrc<0) return; const lines=lyrScroll.querySelectorAll('.nls-lrc-line'); if(lines[curLrc]){ const el=lines[curLrc]; lyrScroll.scrollTo({top:el.offsetTop-lyrScroll.clientHeight/2+el.clientHeight/2, behavior:force?'auto':'smooth'}); } }
  function syncLyrics(){ if(!lrcLines.length||!lrcSynced) return; let idx=-1; for(let i=0;i<lrcLines.length;i++){ if(lrcLines[i].t<=audio.currentTime) idx=i; else break; } if(idx!==curLrc){ curLrc=idx; const lines=lyrScroll.querySelectorAll('.nls-lrc-line'); lines.forEach(el=>el.classList.remove('cur')); if(idx>=0&&lines[idx]){ lines[idx].classList.add('cur'); scrollCurLyric(false); } } }
  function loadLyricsFor(t){
    const tok=++lrcToken; lrcLines=[]; curLrc=-1; lrcSynced=false;
    // header + background reflect current cover
    if(t.cover){ lyrBg.style.backgroundImage=`url("${t.cover}")`; lyrHeadC.style.backgroundImage=`url("${t.cover}")`; lyrHeadC.textContent=''; }
    else { lyrBg.style.backgroundImage=''; lyrBg.style.background=trackArtCss(t); lyrHeadC.style.backgroundImage=''; lyrHeadC.style.background=trackArtCss(t); lyrHeadC.textContent=initials(t.title); }
    lyrHeadB.textContent=t.title; lyrHeadB.dir=isRTL(t.title)?'rtl':'ltr'; lyrHeadS.textContent=t.artist;
    lyrScroll.innerHTML=''; // clean, no fetching note
    fetchLyrics(t).then(val=>{ if(tok!==lrcToken) return; if(val&&val.lines.length){ lrcLines=val.lines; lrcSynced=!!val.synced; renderLrc(); curLrc=-1; syncLyrics(); } else { lrcLines=[]; renderLrc(); } });
  }

  // ---- info ----
  function buildInfo(){ const el=$('.nls-info'); const artists=new Set(LIB.map(t=>t.artist)); const favCount=Object.keys(favorites).filter(k=>favorites[k]).length; const t=current>=0?LIB[current]:null;
    el.innerHTML=`<h3>NL spotify</h3>`+
      `<div class="row"><span class="k">Library</span><span class="v">${LIB.length} songs \u00B7 ${artists.size} artists</span></div>`+
      `<div class="row"><span class="k">Favorites</span><span class="v">${favCount}</span></div>`+
      `<div class="row"><span class="k">Lyrics</span><span class="v">LRClib (live)</span></div>`+
      (t?`<h3>Now playing</h3>`+
        `<div class="row"><span class="k">Title</span><span class="v" dir="${isRTL(t.title)?'rtl':'ltr'}">${esc(t.title)}</span></div>`+
        `<div class="row"><span class="k">Artist</span><span class="v" dir="${isRTL(t.artist)?'rtl':'ltr'}">${esc(t.artist)}</span></div>`+
        (t.album?`<div class="row"><span class="k">Album</span><span class="v">${esc(t.album)}</span></div>`:'')+
        (t.genre?`<div class="row"><span class="k">Genre</span><span class="v">${esc(t.genre)}</span></div>`:'')+
        (t.year?`<div class="row"><span class="k">Year</span><span class="v">${esc(t.year)}</span></div>`:'')+
        (t.duration?`<div class="row"><span class="k">Duration</span><span class="v">${fmtTime(t.duration)}</span></div>`:'')+
        `<div class="row"><span class="k">Plays</span><span class="v">${playCounts[t.key]||0}</span></div>`
      :'');
  }

  // ---- MediaSession ----
  function updateMediaSession(){ if(!('mediaSession'in navigator)||current<0) return; const t=LIB[current]; try{ const art=t.cover?[{src:t.cover,sizes:'512x512',type:'image/webp'}]:[]; navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:t.album||'NL spotify',artwork:art}); navigator.mediaSession.setActionHandler('play',()=>audio.play()); navigator.mediaSession.setActionHandler('pause',()=>audio.pause()); navigator.mediaSession.setActionHandler('previoustrack',prev); navigator.mediaSession.setActionHandler('nexttrack',()=>next(false)); }catch(e){} }

  // ---- keyboard ----
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

  $('.nls-dl').addEventListener('click',()=>{ if(current>=0) downloadTrack(LIB[current]); });

  // ---- download (NL-named, site cover embedded when possible) ----
  let _ffmpeg=null, _ffmpegLoading=null, _dlBusy=false;
  function dlName(t,ext){ return ('NL '+((t&&t.title)||'track')).replace(/[\\/:*?"<>|]+/g,'_').trim()+(ext||'.mp3'); }
  function saveBlob(blob,name){ const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),5000); }
  async function siteCoverJpeg(){
    const img=await new Promise((res,rej)=>{ const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>res(im); im.onerror=rej; im.src=PROFILE_IMG; });
    const S=600, c=document.createElement('canvas'); c.width=S; c.height=S; const ctx=c.getContext('2d');
    ctx.fillStyle='#0c0e18'; ctx.fillRect(0,0,S,S);
    const r=Math.max(S/img.width,S/img.height), w=img.width*r, h=img.height*r; ctx.drawImage(img,(S-w)/2,(S-h)/2,w,h);
    const blob=await new Promise(res=>c.toBlob(res,'image/jpeg',0.9)); return new Uint8Array(await blob.arrayBuffer());
  }
  async function ensureFfmpeg(){
    if(_ffmpeg) return _ffmpeg;
    if(_ffmpegLoading) return _ffmpegLoading;
    _ffmpegLoading=(async()=>{
      const ffMod=await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
      const util=await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js');
      const ff=new ffMod.FFmpeg(); const base='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      await ff.load({ coreURL: await util.toBlobURL(base+'/ffmpeg-core.js','text/javascript'), wasmURL: await util.toBlobURL(base+'/ffmpeg-core.wasm','application/wasm') });
      ff._util=util; _ffmpeg=ff; return ff;
    })();
    return _ffmpegLoading;
  }
  async function embedAndDownload(t){
    const ff=await ensureFfmpeg(); const util=ff._util;
    await ff.writeFile('in.m4a', await util.fetchFile(t.url));
    let haveCover=false;
    try{ await ff.writeFile('c.jpg', await siteCoverJpeg()); haveCover=true; }catch(e){}
    try{
      const a = haveCover
        ? ['-i','in.m4a','-i','c.jpg','-map','0:a:0','-map','1:v:0','-c:a','libmp3lame','-b:a','192k','-id3v2_version','3','-metadata:s:v','title=Cover','-metadata:s:v','comment=Cover (front)','-disposition:v:0','attached_pic','out.mp3']
        : ['-i','in.m4a','-c:a','libmp3lame','-b:a','192k','out.mp3'];
      await ff.exec(a);
      const data=await ff.readFile('out.mp3');
      saveBlob(new Blob([data.buffer],{type:'audio/mpeg'}), dlName(t,'.mp3'));
    }catch(e){
      const a = haveCover
        ? ['-i','in.m4a','-i','c.jpg','-map','0:a','-map','1:v','-c','copy','-disposition:v:0','attached_pic','out.m4a']
        : ['-i','in.m4a','-c','copy','out.m4a'];
      await ff.exec(a);
      const data=await ff.readFile('out.m4a');
      saveBlob(new Blob([data.buffer],{type:'audio/mp4'}), dlName(t,'.m4a'));
    }
    try{ ff.deleteFile('in.m4a'); ff.deleteFile('out.mp3'); ff.deleteFile('out.m4a'); ff.deleteFile('c.jpg'); }catch(e){}
  }
  async function downloadTrack(t){
    if(!t||!t.url||_dlBusy) return; _dlBusy=true;
    const btns=root.querySelectorAll('.nls-li[data-i="'+LIB.indexOf(t)+'"] .dl'); btns.forEach(b=>b.classList.add('busy'));
    notify('Preparing download\u2026');
    try{ await embedAndDownload(t); notify('Downloaded: '+t.title); }
    catch(e){ try{ const r=await fetch(t.url); saveBlob(await r.blob(), dlName(t,'.m4a')); notify('Downloaded: '+t.title); }catch(e2){ notify('Download failed'); } }
    finally{ _dlBusy=false; btns.forEach(b=>b.classList.remove('busy')); }
  }

  // ---- cleanup ----
  const closeBtn=win.querySelector('.title-bar-controls button[aria-label="Close"]');
  function cleanup(){ try{ audio.pause(); audio.src=''; }catch(e){} if(vizRAF){ cancelAnimationFrame(vizRAF); vizRAF=null; } try{ if(actx) actx.close(); }catch(e){} }
  if(closeBtn) closeBtn.addEventListener('click',cleanup);
  const mo=new MutationObserver(()=>{ if(!document.body.contains(win)){ cleanup(); mo.disconnect(); } });
  try{ mo.observe(win.parentNode||document.body,{childList:true}); }catch(e){}

  // ---- initial render ----
  rebuildView(); buildInfo();
  function resumeOrFirst(){
    let ri=0; if(_state.currentKey){ const f=LIB.findIndex(t=>t.key===_state.currentKey); if(f>=0) ri=f; }
    current=ri; updateNow(); renderRows();
    const t0=LIB[ri];
    if(t0){ audio.src=t0.url; if(typeof _state.currentTime==='number'){ audio.addEventListener('loadedmetadata',function once(){ try{ audio.currentTime=Math.min(_state.currentTime,(audio.duration||0)-1); }catch(e){} audio.removeEventListener('loadedmetadata',once); }); } loadLyricsFor(t0); }
  }
  resumeOrFirst();
  notify('NL spotify ready \u00B7 '+LIB.length+' songs');

  // ---- load manifest (new songs) ----
  fetch(MANIFEST_URL).then(r=>r.ok?r.json():Promise.reject()).then(data=>{
    const arr=Array.isArray(data)?data:(data&&(data.songs||data.tracks)); if(!Array.isArray(arr)||!arr.length) return;
    const existing={}; LIB.forEach(t=>existing[t.key]=1);
    const add=[]; arr.forEach((r,i)=>{ const t=normTrack(r,LIB.length+i); if(t.url&&!existing[t.url]){ existing[t.url]=1; add.push(t); } });
    if(!add.length) return;
    const base=LIB.length; LIB=LIB.concat(add);
    const newIdx=add.map((_,i)=>base+i); shuffleInPlace(newIdx);
    // weave new tracks into the existing random order
    displayOrder=shuffleInPlace(displayOrder.concat(newIdx));
    const curKey=current>=0?LIB[current].key:null;
    rebuildView();
    if(curKey){ const f=LIB.findIndex(t=>t.key===curKey); if(f>=0) current=f; }
    buildInfo();
    notify('NL spotify \u00B7 '+LIB.length+' songs loaded');
  }).catch(()=>{});
}

// optional external entry
if (typeof window!=='undefined'){
  window.openNLSpotify = function(){ if(window.createWindow) window.createWindow('NL spotify'); };
}
