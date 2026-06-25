// Windows Media Player — plays audio from C:/Users/User/Music and its
// subfolders (e.g. "My Songs"). Supports local files (.mp3/.ogg/.wav) and HLS
// streams (.m3u8) via hls.js (global window.Hls, loaded in index.html). On
// Safari, HLS plays natively even without hls.js.
export function initMusicPlayer(win, showNotification, specificTrack = null) {
  const contentArea = win.querySelector('.window-content');
  const instanceId = Math.random().toString(36).substr(2, 9);
  contentArea.innerHTML = `
    <div style="padding: 10px;" id="mp-container-${instanceId}">
      <div id="mp-song-info-${instanceId}" style="margin-bottom: 10px;">No song playing</div>
      <div id="mp-controls-${instanceId}" style="margin-bottom: 10px; display: flex; flex-wrap: nowrap; justify-content: space-around;">
        <button id="mp-prev-${instanceId}">Prev</button>
        <button id="mp-play-${instanceId}">Play</button>
        <button id="mp-pause-${instanceId}">Pause</button>
        <button id="mp-next-${instanceId}">Next</button>
      </div>
      <div style="margin-bottom:10px;">
        <input id="mp-progress-${instanceId}" type="range" min="0" max="100" value="0" style="width:100%; pointer-events: none;">
      </div>
      <div style="height: 240px; overflow-y: auto; border: 1px solid #ccc;">
        <ul id="mp-playlist-${instanceId}" style="list-style-type: none; padding: 0; margin: 0;"></ul>
      </div>
    </div>
  `;

  // ── Gather songs from the Music folder AND its subfolders (e.g. "My Songs") ──
  const AUDIO_RE = /\.(mp3|wav|ogg|m3u8)$/i;
  const songs = [];
  const musicFolder = window.fileSystem['C:']?.children['Users']?.children['User']?.children['Music']?.children;

  function collectSongs(folderChildren) {
    if (!folderChildren) return;
    Object.entries(folderChildren).forEach(([filename, fileData]) => {
      if (!fileData) return;
      if (fileData.type === "file" && AUDIO_RE.test(filename)) {
        songs.push({ title: filename.replace(AUDIO_RE, ''), src: fileData.content });
      } else if (fileData.type === "folder" && fileData.children) {
        collectSongs(fileData.children);
      }
    });
  }
  if (musicFolder) collectSongs(musicFolder);
  else console.warn("Music folder not found in filesystem.");

  const audio = new Audio();
  audio.preload = 'auto';

  // ── HLS (.m3u8) support via hls.js ─────────────────────────────────
  let hls = null;
  let currentLoadedSrc = "";
  const isHlsUrl = (src) => /\.m3u8(\?|#|$)/i.test(src || "");

  function detachHls() {
    if (hls) {
      try { hls.destroy(); } catch (e) { /* ignore */ }
      hls = null;
    }
  }

  function loadSource(src) {
    detachHls();
    if (isHlsUrl(src) && window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
      hls.on(window.Hls.Events.ERROR, (_evt, data) => {
        if (data && data.fatal) {
          console.warn('[HLS] fatal error:', data.type, data.details);
        }
      });
      hls.loadSource(src);
      hls.attachMedia(audio);
    } else {
      // Local files, or native HLS playback on Safari.
      audio.src = src;
    }
    currentLoadedSrc = src;
  }

  const container = win.querySelector(`#mp-container-${instanceId}`);
  const songInfo = container.querySelector(`#mp-song-info-${instanceId}`);
  const progressBar = container.querySelector(`#mp-progress-${instanceId}`);
  const playlistEl = container.querySelector(`#mp-playlist-${instanceId}`);
  const playBtn = container.querySelector(`#mp-play-${instanceId}`);
  const pauseBtn = container.querySelector(`#mp-pause-${instanceId}`);
  const nextBtn = container.querySelector(`#mp-next-${instanceId}`);
  const prevBtn = container.querySelector(`#mp-prev-${instanceId}`);

  let currentSongIndex = 0;

  // If a specific track was passed (double-click on a file), handle it.
  if (specificTrack) {
    const existingIndex = songs.findIndex(song => song.src === specificTrack);
    if (existingIndex !== -1) {
      currentSongIndex = existingIndex;
    } else {
      const filePath = win.dataset.filePath || "Unknown Track";
      const filename = filePath.split('/').pop().replace(AUDIO_RE, '');
      songs.unshift({ title: filename, src: specificTrack });
      currentSongIndex = 0;
    }
  }

  function renderPlaylist() {
    playlistEl.innerHTML = '';
    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song.title;
      li.style.padding = '5px';
      li.style.cursor = 'pointer';
      li.style.backgroundColor = (currentLoadedSrc === song.src && !audio.paused) ? '#ccc' : index === currentSongIndex ? '#ddd' : 'transparent';
      li.addEventListener('click', () => {
        currentSongIndex = index;
        playSong();
      });
      playlistEl.appendChild(li);
    });
  }

  function updateSongInfo() {
    if (songs.length > 0 && currentSongIndex >= 0 && currentSongIndex < songs.length) {
      songInfo.textContent = "Now Playing: " + songs[currentSongIndex].title;
    } else {
      songInfo.textContent = "No song selected";
    }
    renderPlaylist();
  }

  function playSong() {
    const song = songs[currentSongIndex];
    if (!song) return;
    // If same song is already loaded and playing, do nothing.
    if (currentLoadedSrc === song.src && !audio.paused) {
      updateSongInfo();
      return;
    }
    if (currentLoadedSrc !== song.src) {
      loadSource(song.src);
    }
    audio.play().then(() => {
      updateSongInfo();
      showNotification(`Playing: ${song.title}`);
    }).catch(err => {
      console.warn(`Audio play prevented: ${err.message}`);
      showNotification(`Error playing song: ${err.message}`);
      updateSongInfo();
    });
  }

  audio.addEventListener('play', renderPlaylist);
  audio.addEventListener('pause', renderPlaylist);

  audio.addEventListener('timeupdate', () => {
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      progressBar.value = (audio.currentTime / audio.duration) * 100;
    } else {
      progressBar.value = 0;
    }
  });

  playBtn.addEventListener('click', () => {
    if (!audio.paused) return;
    if (currentLoadedSrc) {
      audio.play().catch(err => {
        console.warn(`Audio play prevented: ${err.message}`);
        showNotification(`Error playing song: ${err.message}`);
      });
    } else {
      playSong();
    }
  });

  pauseBtn.addEventListener('click', () => {
    if (!audio.paused) {
      audio.pause();
      if (songs.length > 0) {
        showNotification(`Paused: ${songs[currentSongIndex]?.title || 'Unknown Track'}`);
      }
    }
  });

  nextBtn.addEventListener('click', () => {
    if (songs.length > 0) {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      playSong();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (songs.length > 0) {
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      playSong();
    }
  });

  audio.addEventListener('ended', () => {
    if (songs.length > 1) {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      playSong();
    } else {
      progressBar.value = 0;
      updateSongInfo();
    }
  });

  // Stop audio + release the HLS instance when the player window closes.
  const closeBtn = win.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    const originalCloseHandler = closeBtn.onclick;
    closeBtn.onclick = null;
    closeBtn.addEventListener('click', (e) => {
      audio.pause();
      detachHls();
      audio.removeAttribute('src');
      audio.load();
      if (typeof originalCloseHandler === 'function') {
        originalCloseHandler(e);
      } else {
        win.remove();
        const taskbarButtons = document.querySelector('.taskbar-buttons');
        const btnToRemove = taskbarButtons.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
        if (btnToRemove) btnToRemove.remove();
        if (window.currentActiveWindowId === win.dataset.id) {
          window.currentActiveWindowId = null;
        }
      }
    });
  }

  renderPlaylist();

  if (specificTrack && songs.length > 0) {
    currentSongIndex = songs.findIndex(song => song.src === specificTrack);
    if (currentSongIndex !== -1) {
      playSong();
    } else {
      currentSongIndex = 0;
      updateSongInfo();
    }
  } else if (songs.length > 0) {
    updateSongInfo();
  } else {
    songInfo.textContent = "No music found in My Music";
  }
}
