// VLC media player — a native, VLC-skinned HTML5 player for the XP system.
// Plays EVERY media file in the virtual filesystem (all songs + any video),
// gathered recursively from window.fileSystem. Audio + video, with .m3u8 (HLS)
// support via the global window.Hls (already loaded in index.html).
//
// Public surface:
//   - export function initVLC(win, showNotification)
//   - window.openVLC({ url, title })  -> opens/feeds a media URL into VLC
//
// No external dependencies. Classic orange-cone branding via inline SVG.

const AUDIO_RE = /\.(mp3|wav|ogg|aac|flac|m4a)$/i;
const VIDEO_RE = /\.(mp4|webm|ogv|mov|mkv)$/i;
const HLS_RE   = /\.m3u8(\?|#|$)/i;
const MEDIA_RE = /\.(mp3|wav|ogg|aac|flac|m4a|mp4|webm|ogv|mov|mkv|m3u8)$/i;

// Classic VLC traffic-cone logo (inline SVG, scalable, no external asset).
const CONE_SVG = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M32 4 L31 7 L33 7 Z" fill="#3a3a3a"/>
  <path d="M30 7 h4 l8 40 h-20 Z" fill="#e8650e"/>
  <path d="M30 7 h4 l1.6 8 h-7.2 Z" fill="#f4f4f4"/>
  <path d="M27.4 23 h9.2 l1.4 7 h-12 Z" fill="#f4f4f4"/>
  <path d="M24.6 39 h14.8 l1.2 6 h-17.2 Z" fill="#f4f4f4"/>
  <ellipse cx="32" cy="50" rx="22" ry="6" fill="#d8d8d8"/>
  <ellipse cx="32" cy="49" rx="22" ry="5" fill="#f0f0f0"/>
</svg>`;

let stylesInjected = false;
function injectStyles() {
	if (stylesInjected || document.getElementById('vlc-xp-style')) { stylesInjected = true; return; }
	const style = document.createElement('style');
	style.id = 'vlc-xp-style';
	style.textContent = `
	.vlc-root{display:flex;flex-direction:column;height:100%;width:100%;background:#ece9d8;font-family:Tahoma,'Segoe UI',sans-serif;font-size:12px;color:#000;overflow:hidden}
	.vlc-menubar{display:flex;gap:2px;padding:2px 4px;background:#f5f4ea;border-bottom:1px solid #aca899;flex:0 0 auto}
	.vlc-menubar span{padding:2px 8px;cursor:default;border-radius:2px}
	.vlc-menubar span:hover{background:#e8650e;color:#fff}
	.vlc-body{display:flex;flex:1 1 auto;min-height:0}
	.vlc-stage{position:relative;flex:1 1 auto;min-width:0;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden}
	.vlc-stage video{max-width:100%;max-height:100%;width:100%;height:100%;background:#000;object-fit:contain}
	.vlc-cone{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#bbb;pointer-events:none}
	.vlc-cone svg{width:110px;height:110px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5))}
	.vlc-cone.hidden{display:none}
	.vlc-cone-title{font-size:13px;color:#ddd;max-width:80%;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
	.vlc-playlist{flex:0 0 200px;background:#fff;border-left:1px solid #aca899;display:flex;flex-direction:column;min-height:0}
	.vlc-playlist.hidden{display:none}
	.vlc-playlist-head{padding:4px 8px;background:#e8650e;color:#fff;font-weight:bold;flex:0 0 auto}
	.vlc-playlist ul{list-style:none;margin:0;padding:0;overflow-y:auto;flex:1 1 auto}
	.vlc-playlist li{padding:4px 8px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-bottom:1px solid #f0efe6}
	.vlc-playlist li:hover{background:#fde9d9}
	.vlc-playlist li.active{background:#e8650e;color:#fff}
	.vlc-playlist li .ic{margin-right:6px;opacity:.7}
	.vlc-seek{display:flex;align-items:center;gap:6px;padding:3px 8px;background:#dedbcd;flex:0 0 auto}
	.vlc-seek input[type=range]{flex:1 1 auto;accent-color:#e8650e}
	.vlc-time{font-variant-numeric:tabular-nums;min-width:84px;text-align:center}
	.vlc-controls{display:flex;align-items:center;gap:4px;padding:4px 8px;background:#ece9d8;border-top:1px solid #fff;flex:0 0 auto}
	.vlc-btn{width:30px;height:26px;border:1px solid #aca899;background:linear-gradient(#fff,#e6e3d6);border-radius:3px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;color:#333;padding:0}
	.vlc-btn:hover{border-color:#e8650e;background:linear-gradient(#fff,#fde0cd)}
	.vlc-btn.play{width:40px;color:#e8650e;font-size:16px}
	.vlc-spacer{flex:1 1 auto}
	.vlc-vol{display:flex;align-items:center;gap:4px}
	.vlc-vol input[type=range]{width:80px;accent-color:#e8650e}
	.vlc-status{padding:2px 8px;background:#f5f4ea;border-top:1px solid #aca899;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:0 0 auto}
	`;
	document.head.appendChild(style);
	stylesInjected = true;
}

function fmtTime(s) {
	if (!s || isNaN(s) || !isFinite(s)) return '0:00';
	s = Math.floor(s);
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
	return (h > 0 ? h + ':' : '') + mm + ':' + String(sec).padStart(2, '0');
}

// Recursively gather every media file in the filesystem, de-duped by src.
function gatherMedia() {
	const items = [];
	const seen = new Set();
	function walk(children) {
		if (!children) return;
		Object.entries(children).forEach(([name, node]) => {
			if (!node) return;
			if (node.type === 'file' && MEDIA_RE.test(name)) {
				const src = node.content;
				if (!src || seen.has(src)) return;
				seen.add(src);
				items.push({
					title: name.replace(MEDIA_RE, ''),
					src,
					kind: VIDEO_RE.test(name) ? 'video' : (HLS_RE.test(name) ? 'video' : 'audio'),
				});
			} else if (node.type === 'folder' && node.children) {
				walk(node.children);
			}
		});
	}
	try { walk(window.fileSystem?.['C:']?.children); } catch (e) { console.warn('[VLC] gather failed', e); }
	return items;
}

export function initVLC(win, showNotification, specificTrack = null) {
	injectStyles();
	const content = win.querySelector('.window-content');
	if (!content) return;
	content.innerHTML = `
	<div class="vlc-root">
		<div class="vlc-menubar">
			<span>Media</span><span>Playback</span><span>Audio</span><span>Video</span><span>Tools</span><span>Help</span>
		</div>
		<div class="vlc-body">
			<div class="vlc-stage">
				<video class="vlc-video" playsinline></video>
				<div class="vlc-cone"><div>${CONE_SVG}</div><div class="vlc-cone-title">VLC media player</div></div>
			</div>
			<div class="vlc-playlist">
				<div class="vlc-playlist-head">Playlist</div>
				<ul class="vlc-list"></ul>
			</div>
		</div>
		<div class="vlc-seek">
			<span class="vlc-time vlc-cur">0:00</span>
			<input type="range" class="vlc-progress" min="0" max="1000" value="0" step="1">
			<span class="vlc-time vlc-dur">0:00</span>
		</div>
		<div class="vlc-controls">
			<button class="vlc-btn vlc-prev" title="Previous">⏮</button>
			<button class="vlc-btn play vlc-play" title="Play/Pause">▶</button>
			<button class="vlc-btn vlc-stop" title="Stop">⏹</button>
			<button class="vlc-btn vlc-next" title="Next">⏭</button>
			<div class="vlc-vol">
				<button class="vlc-btn vlc-mute" title="Mute">🔊</button>
				<input type="range" class="vlc-volume" min="0" max="100" value="100">
			</div>
			<div class="vlc-spacer"></div>
			<button class="vlc-btn vlc-pl" title="Toggle playlist">☰</button>
			<button class="vlc-btn vlc-full" title="Fullscreen">⛶</button>
		</div>
		<div class="vlc-status">Ready</div>
	</div>`;

	const root = content.querySelector('.vlc-root');
	const video = root.querySelector('.vlc-video');
	const cone = root.querySelector('.vlc-cone');
	const coneTitle = root.querySelector('.vlc-cone-title');
	const listEl = root.querySelector('.vlc-list');
	const playlistEl = root.querySelector('.vlc-playlist');
	const progress = root.querySelector('.vlc-progress');
	const curEl = root.querySelector('.vlc-cur');
	const durEl = root.querySelector('.vlc-dur');
	const playBtn = root.querySelector('.vlc-play');
	const stopBtn = root.querySelector('.vlc-stop');
	const prevBtn = root.querySelector('.vlc-prev');
	const nextBtn = root.querySelector('.vlc-next');
	const muteBtn = root.querySelector('.vlc-mute');
	const volEl = root.querySelector('.vlc-volume');
	const plBtn = root.querySelector('.vlc-pl');
	const fullBtn = root.querySelector('.vlc-full');
	const statusEl = root.querySelector('.vlc-status');
	const notify = (m) => { try { (showNotification || window.showNotification)?.(m); } catch (e) {} };

	let playlist = gatherMedia();
	let idx = playlist.length ? 0 : -1;
	let hls = null;
	let loadedSrc = '';

	// If a specific track/url was requested, put it at the front.
	function injectTrack(track) {
		if (!track || !track.src) return;
		const existing = playlist.findIndex(p => p.src === track.src);
		if (existing !== -1) { idx = existing; return; }
		playlist.unshift({
			title: track.title || track.src.split('/').pop().replace(MEDIA_RE, ''),
			src: track.src,
			kind: VIDEO_RE.test(track.src) || HLS_RE.test(track.src) ? 'video' : 'audio',
		});
		idx = 0;
	}
	// Allow opening a file via the window dataset (set by openItem.js), exactly like Windows Media Player.
	if (!specificTrack && win.dataset && win.dataset.filecontent) {
		const fp = win.dataset.filePath || win.dataset.filecontent;
		const nm = String(fp).split('/').pop();
		specificTrack = { src: win.dataset.filecontent, title: nm ? nm.replace(MEDIA_RE, '') : undefined };
	}
	if (specificTrack) injectTrack(typeof specificTrack === 'string' ? { src: specificTrack } : specificTrack);

	function detachHls() { if (hls) { try { hls.destroy(); } catch (e) {} hls = null; } }

	function loadSource(src, kind) {
		detachHls();
		const isVideo = kind === 'video';
		cone.classList.toggle('hidden', isVideo);
		if (HLS_RE.test(src) && window.Hls && window.Hls.isSupported()) {
			hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
			hls.on(window.Hls.Events.ERROR, (_e, data) => { if (data && data.fatal) console.warn('[VLC][HLS]', data.type, data.details); });
			hls.loadSource(src);
			hls.attachMedia(video);
		} else {
			video.src = src;
		}
		loadedSrc = src;
	}

	function renderList() {
		listEl.innerHTML = '';
		playlist.forEach((p, i) => {
			const li = document.createElement('li');
			if (i === idx) li.className = 'active';
			const ic = document.createElement('span');
			ic.className = 'ic';
			ic.textContent = p.kind === 'video' ? '🎬' : '🎵';
			li.appendChild(ic);
			li.appendChild(document.createTextNode(p.title));
			li.title = p.title;
			li.addEventListener('click', () => { idx = i; play(); });
			listEl.appendChild(li);
		});
	}

	function setStatus(m) { statusEl.textContent = m; }

	function play() {
		if (idx < 0 || idx >= playlist.length) { setStatus('No media'); return; }
		const item = playlist[idx];
		coneTitle.textContent = item.title;
		if (loadedSrc !== item.src) loadSource(item.src, item.kind);
		video.play().then(() => {
			playBtn.textContent = '⎉';
			setStatus('Playing — ' + item.title);
			notify('Playing: ' + item.title);
			renderList();
		}).catch(err => {
			console.warn('[VLC] play prevented', err);
			setStatus('Could not play — ' + item.title);
			notify('Error playing: ' + item.title);
		});
	}

	function togglePlay() {
		if (idx < 0) { play(); return; }
		if (video.paused) {
			if (!loadedSrc) { play(); return; }
			video.play().then(() => { playBtn.textContent = '⎉'; }).catch(() => {});
		} else {
			video.pause();
		}
	}

	function stop() {
		video.pause();
		try { video.currentTime = 0; } catch (e) {}
		playBtn.textContent = '▶';
		setStatus('Stopped');
	}

	function next() { if (!playlist.length) return; idx = (idx + 1) % playlist.length; play(); }
	function prev() { if (!playlist.length) return; idx = (idx - 1 + playlist.length) % playlist.length; play(); }

	// Wire events
	playBtn.addEventListener('click', togglePlay);
	stopBtn.addEventListener('click', stop);
	nextBtn.addEventListener('click', next);
	prevBtn.addEventListener('click', prev);
	plBtn.addEventListener('click', () => playlistEl.classList.toggle('hidden'));
	fullBtn.addEventListener('click', () => {
		const stage = root.querySelector('.vlc-stage');
		if (!document.fullscreenElement) stage.requestFullscreen?.().catch(() => {});
		else document.exitFullscreen?.();
	});
	muteBtn.addEventListener('click', () => {
		video.muted = !video.muted;
		muteBtn.textContent = video.muted ? '🔇' : '🔊';
	});
	volEl.addEventListener('input', () => {
		video.volume = Math.max(0, Math.min(1, volEl.value / 100));
		if (video.volume > 0 && video.muted) { video.muted = false; muteBtn.textContent = '🔊'; }
	});
	progress.addEventListener('input', () => {
		if (video.duration && isFinite(video.duration)) {
			video.currentTime = (progress.value / 1000) * video.duration;
		}
	});
	video.addEventListener('play', () => { playBtn.textContent = '⎉'; });
	video.addEventListener('pause', () => { playBtn.textContent = '▶'; });
	video.addEventListener('ended', next);
	video.addEventListener('timeupdate', () => {
		if (video.duration && isFinite(video.duration)) {
			progress.value = (video.currentTime / video.duration) * 1000;
			curEl.textContent = fmtTime(video.currentTime);
			durEl.textContent = fmtTime(video.duration);
		}
	});
	video.addEventListener('error', () => {
		if (idx >= 0 && playlist[idx]) setStatus('Error loading — ' + playlist[idx].title);
	});

	// Cleanup on window close.
	const closeBtn = win.querySelector('button[aria-label="Close"]');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			try { video.pause(); detachHls(); video.removeAttribute('src'); video.load(); } catch (e) {}
		}, { capture: true });
	}

	// Expose a bridge so other apps can hand a URL to VLC.
	window.openVLC = function (opts) {
		try {
			const o = typeof opts === 'string' ? { src: opts } : (opts || {});
			const src = o.src || o.url;
			if (!src) return;
			injectTrack({ src, title: o.title });
			renderList();
			play();
		} catch (e) { console.warn('[VLC] openVLC failed', e); }
	};

	renderList();
	if (specificTrack) play();
	else if (playlist.length) { coneTitle.textContent = playlist[0].title; setStatus(playlist.length + ' item(s) in playlist — press Play'); }
	else setStatus('No media found');
}
