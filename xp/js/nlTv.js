// ============================================================================
//  NL TV  — native Windows-XP app that mirrors the live site's NL TV section.
//
//  Flow (identical to src/components/NlTv on the website):
//    1. Pick a country  (list from iptv-org/api/countries.json, cached)
//    2. Pick a channel  (parsed from iptv-org country .m3u playlist)
//    3. Watch the live HLS stream (hls.js, the global window.Hls)
//
//  All streams come from public iptv-org sources, exactly like the site.
// ============================================================================

const NLTV_COUNTRIES_API = 'https://iptv-org.github.io/api/countries.json';
const NLTV_COUNTRY_M3U = (code) =>
  `https://iptv-org.github.io/iptv/countries/${code.toLowerCase()}.m3u`;

const NLTV_CACHE_TTL = 3600_000 * 4; // 4h, same as the site

const NLTV_FALLBACK_COUNTRIES = [
  { name: 'Morocco', code: 'MA', flag: '\uD83C\uDDF2\uD83C\uDDE6' },
  { name: 'Algeria', code: 'DZ', flag: '\uD83C\uDDE9\uD83C\uDDFF' },
  { name: 'Tunisia', code: 'TN', flag: '\uD83C\uDDF9\uD83C\uDDF3' },
  { name: 'Egypt', code: 'EG', flag: '\uD83C\uDDEA\uD83C\uDDEC' },
  { name: 'Saudi Arabia', code: 'SA', flag: '\uD83C\uDDF8\uD83C\uDDE6' },
  { name: 'France', code: 'FR', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  { name: 'Spain', code: 'ES', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
  { name: 'United Kingdom', code: 'UK', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
  { name: 'United States', code: 'US', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { name: 'Canada', code: 'CA', flag: '\uD83C\uDDE8\uD83C\uDDE6' },
  { name: 'Germany', code: 'DE', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
  { name: 'Italy', code: 'IT', flag: '\uD83C\uDDEE\uD83C\uDDF9' },
  { name: 'Japan', code: 'JP', flag: '\uD83C\uDDEF\uD83C\uDDF5' },
  { name: 'South Korea', code: 'KR', flag: '\uD83C\uDDF0\uD83C\uDDF7' },
  { name: 'Brazil', code: 'BR', flag: '\uD83C\uDDE7\uD83C\uDDF7' },
  { name: 'Argentina', code: 'AR', flag: '\uD83C\uDDE6\uD83C\uDDF7' },
];

async function nltvFetchCountries() {
  const cacheKey = 'nltv_countries_v1';
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { time, data } = JSON.parse(cached);
      if (Date.now() - time < NLTV_CACHE_TTL * 6) return data;
    }
  } catch {}

  try {
    const res = await fetch(NLTV_COUNTRIES_API);
    if (!res.ok) throw new Error('fetch failed');
    const json = await res.json();
    const countries = json
      .filter((c) => c.name && c.code && c.flag)
      .map((c) => ({ name: c.name, code: String(c.code).toUpperCase(), flag: c.flag }))
      .sort((a, b) => a.name.localeCompare(b.name));
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data: countries }));
    } catch {}
    return countries;
  } catch (err) {
    console.warn('[NL TV] Could not fetch countries, using fallback', err);
    return NLTV_FALLBACK_COUNTRIES;
  }
}

function nltvParseM3u(text) {
  const lines = text.split(/\r?\n/);
  const channels = [];
  let meta = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')) {
      const idMatch = /tvg-id="([^"]*)"/.exec(line);
      const logoMatch = /tvg-logo="([^"]*)"/.exec(line);
      const groupMatch = /group-title="([^"]*)"/.exec(line);
      const lastComma = line.lastIndexOf(',');
      const name = lastComma !== -1 ? line.slice(lastComma + 1).trim() : 'Unknown Channel';
      meta = {
        id: idMatch ? idMatch[1] : `chan_${Math.random().toString(36).substr(2, 9)}`,
        name,
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : undefined,
      };
    } else if (!line.startsWith('#') && meta) {
      channels.push({
        id: meta.id || `chan_${Math.random().toString(36).substr(2, 9)}`,
        name: meta.name || 'Unknown Channel',
        logo: meta.logo,
        group: meta.group,
        url: line,
      });
      meta = null;
    }
  }
  return channels;
}

async function nltvFetchChannels(code) {
  const lc = code.toLowerCase();
  const cacheKey = `nltv_channels_${lc}_v1`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { time, data } = JSON.parse(cached);
      if (Date.now() - time < NLTV_CACHE_TTL) return data;
    }
  } catch {}

  const res = await fetch(NLTV_COUNTRY_M3U(lc));
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const text = await res.text();
  const channels = nltvParseM3u(text);
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data: channels }));
  } catch {}
  return channels;
}

function nltvEscape(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function initNlTv(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  if (!contentArea) return;

  // ---- per-instance state -------------------------------------------------
  let countries = [];
  let channels = [];
  let selectedCountry = null;
  let hls = null;

  contentArea.style.padding = '0';
  contentArea.style.height = '100%';
  contentArea.style.overflow = 'hidden';
  contentArea.style.background = '#0b0b0b';

  contentArea.innerHTML = `
    <div class="nltv-root" style="display:flex;flex-direction:column;height:100%;font-family:Tahoma,sans-serif;color:#eee;">
      <div class="nltv-bar" style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:#1c1c1c;border-bottom:1px solid #000;">
        <button class="nltv-back" style="display:none;">← Back</button>
        <strong class="nltv-title" style="font-size:13px;color:#ff4d4d;">NL TV</strong>
        <span class="nltv-crumb" style="font-size:11px;color:#aaa;"></span>
        <input class="nltv-search" type="text" placeholder="Search..." style="margin-left:auto;width:160px;padding:3px 6px;">
      </div>
      <div class="nltv-body" style="flex:1;position:relative;overflow:auto;"></div>
    </div>
  `;

  const backBtn = contentArea.querySelector('.nltv-back');
  const crumb = contentArea.querySelector('.nltv-crumb');
  const search = contentArea.querySelector('.nltv-search');
  const body = contentArea.querySelector('.nltv-body');

  function destroyHls() {
    if (hls) { try { hls.destroy(); } catch {} hls = null; }
  }

  // ---- cleanup when the window is closed ----------------------------------
  const desktop = win.parentNode || document.querySelector('.desktop');
  if (desktop) {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(win)) {
        destroyHls();
        observer.disconnect();
      }
    });
    observer.observe(desktop, { childList: true });
  }

  // ---- VIEW: countries ----------------------------------------------------
  function renderCountries(filter = '') {
    destroyHls();
    selectedCountry = null;
    backBtn.style.display = 'none';
    crumb.textContent = '';
    search.placeholder = 'Search countries...';
    search.value = filter;

    const term = filter.trim().toLowerCase();
    const list = term
      ? countries.filter((c) => c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term))
      : countries;

    if (!list.length) {
      body.innerHTML = `<div style="padding:20px;text-align:center;color:#888;">No countries found.</div>`;
      return;
    }

    body.innerHTML = `<div class="nltv-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;padding:10px;">${
      list.map((c) => `
        <button class="nltv-country" data-code="${nltvEscape(c.code)}" style="display:flex;align-items:center;gap:8px;padding:8px;background:#222;border:1px solid #333;border-radius:6px;color:#eee;cursor:pointer;text-align:left;font-size:12px;">
          <span style="font-size:22px;line-height:1;">${nltvEscape(c.flag)}</span>
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${nltvEscape(c.name)}</span>
        </button>`).join('')
    }</div>`;

    body.querySelectorAll('.nltv-country').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        const country = countries.find((c) => c.code === code);
        if (country) openCountry(country);
      });
    });
  }

  // ---- VIEW: channels -----------------------------------------------------
  async function openCountry(country) {
    selectedCountry = country;
    backBtn.style.display = '';
    backBtn.onclick = () => renderCountries('');
    crumb.textContent = `${country.flag} ${country.name}`;
    search.value = '';
    search.placeholder = 'Search channels...';
    body.innerHTML = `<div style="padding:20px;text-align:center;color:#888;">Loading channels...</div>`;

    try {
      channels = await nltvFetchChannels(country.code);
    } catch (e) {
      channels = [];
      body.innerHTML = `<div style="padding:20px;text-align:center;color:#e66;">Could not load channels for ${nltvEscape(country.name)}.</div>`;
      return;
    }
    if (!channels.length) {
      body.innerHTML = `<div style="padding:20px;text-align:center;color:#888;">No channels available for ${nltvEscape(country.name)}.</div>`;
      return;
    }
    renderChannels('');
  }

  function renderChannels(filter = '') {
    const term = filter.trim().toLowerCase();
    const list = term ? channels.filter((c) => c.name.toLowerCase().includes(term)) : channels;

    if (!list.length) {
      body.innerHTML = `<div style="padding:20px;text-align:center;color:#888;">No channels found.</div>`;
      return;
    }

    body.innerHTML = `<div class="nltv-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;padding:10px;">${
      list.map((c, idx) => `
        <button class="nltv-channel" data-idx="${idx}" title="${nltvEscape(c.name)}" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px;background:#222;border:1px solid #333;border-radius:6px;color:#eee;cursor:pointer;font-size:11px;">
          <div style="width:54px;height:40px;display:flex;align-items:center;justify-content:center;background:#111;border-radius:4px;overflow:hidden;">
            ${c.logo
              ? `<img src="${nltvEscape(c.logo)}" alt="" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none';this.parentNode.textContent='\uD83D\uDCFA';">`
              : '\uD83D\uDCFA'}
          </div>
          <span style="text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;">${nltvEscape(c.name)}</span>
        </button>`).join('')
    }</div>`;

    body.querySelectorAll('.nltv-channel').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (!isNaN(idx) && list[idx]) {
          const realIndex = channels.findIndex((c) => c.id === list[idx].id);
          playChannel(realIndex === -1 ? 0 : realIndex);
        }
      });
    });
  }

  // ---- VIEW: player -------------------------------------------------------
  function playChannel(index) {
    const channel = channels[index];
    if (!channel) return;
    backBtn.style.display = '';
    backBtn.onclick = () => { destroyHls(); renderChannels(''); };
    crumb.textContent = `${selectedCountry ? selectedCountry.flag + ' ' : ''}${channel.name}`;
    search.value = '';
    search.placeholder = '';

    body.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;background:#000;">
        <div style="flex:1;position:relative;min-height:0;">
          <video class="nltv-video" playsinline autoplay controls style="width:100%;height:100%;object-fit:contain;background:#000;"></video>
          <div class="nltv-status" style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.6);padding:3px 8px;border-radius:4px;font-size:10px;color:#ff4d4d;">● LIVE — buffering...</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;padding:8px;background:#1c1c1c;border-top:1px solid #000;">
          <button class="nltv-prev">⏮ Prev</button>
          <button class="nltv-next">Next ⏭</button>
          <span style="margin-left:auto;font-size:11px;color:#bbb;">${nltvEscape(channel.name)}</span>
        </div>
      </div>`;

    const video = body.querySelector('.nltv-video');
    const status = body.querySelector('.nltv-status');
    body.querySelector('.nltv-prev').onclick = () =>
      playChannel((index - 1 + channels.length) % channels.length);
    body.querySelector('.nltv-next').onclick = () =>
      playChannel((index + 1) % channels.length);

    destroyHls();
    const url = channel.url;
    const onErr = () => { if (status) { status.textContent = '⚠ Channel offline — try another'; status.style.color = '#e66'; } };
    const onOk = () => { if (status) status.style.display = 'none'; };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('playing', onOk);
      video.addEventListener('error', onErr);
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 30, maxBufferLength: 10 });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, (_e, data) => { if (data && data.fatal) onErr(); });
      video.addEventListener('playing', onOk);
    } else {
      onErr();
    }
    video.play().catch(() => {});
  }

  // ---- search box (debounced) ---------------------------------------------
  let searchTimer = null;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const v = search.value;
      if (selectedCountry && channels.length) renderChannels(v);
      else renderCountries(v);
    }, 150);
  });

  // ---- boot ---------------------------------------------------------------
  body.innerHTML = `<div style="padding:20px;text-align:center;color:#888;">Loading countries...</div>`;
  nltvFetchCountries().then((data) => {
    countries = data;
    renderCountries('');
  });
}

window.initNlTv = initNlTv;
