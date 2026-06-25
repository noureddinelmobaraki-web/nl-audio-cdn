// Antivirus 2003 - Fake antivirus application

export function initAntivirus(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = `
    <div style="display: flex; height: 100%; font-family: Tahoma, sans-serif; font-size: 12px; background-color: #ece9d8;">
      <!-- Left Panel -->
      <div style="width: 150px; background-color: #f0f0f0; border-right: 1px solid #ccc; padding: 10px; display: flex; flex-direction: column; gap: 10px;">
        <button id="av-scan-btn" style="display: flex; align-items: center; gap: 5px; padding: 8px;"><img src="antivirus_icon.png" width="20" height="20"> Scan Computer</button>
        <button id="av-update-btn" disabled>Update</button>
        <button id="av-quarantine-btn" disabled>Quarantine</button>
        <button id="av-settings-btn" disabled>Settings</button>
      </div>
      <!-- Right Panel -->
      <div style="flex: 1; padding: 15px; display: flex; flex-direction: column;">
        <h3 style="margin-top: 0;">System Status</h3>
        <div id="av-status" style="border: 1px inset #ccc; padding: 10px; background-color: white; flex-grow: 1; margin-bottom: 10px;">
          <p><strong>Status:</strong> Ready to scan.</p>
          <div id="av-results" style="margin-top: 10px;"></div>
        </div>
        <div id="av-progress-container" style="display: none; margin-bottom: 10px;">
          <p id="av-progress-label">Scanning...</p>
          <div style="width: 100%; background-color: #ccc; border: 1px solid #888;">
            <div id="av-progress-bar" style="width: 0%; height: 20px; background-color: #0078d7;"></div>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="av-remove-btn" disabled>Remove Viruses</button>
        </div>
      </div>
    </div>
  `;
  win.style.width = '550px';
  win.style.height = '400px';

  const scanBtn = contentArea.querySelector('#av-scan-btn');
  const removeBtn = contentArea.querySelector('#av-remove-btn');
  const statusEl = contentArea.querySelector('#av-status p');
  const resultsEl = contentArea.querySelector('#av-results');
  const progressContainer = contentArea.querySelector('#av-progress-container');
  const progressBar = contentArea.querySelector('#av-progress-bar');
  const progressLabel = contentArea.querySelector('#av-progress-label');

  function findViruses() {
    let virusCount = 0;
    const virusPaths = [];

    function traverse(folder, currentPath) {
      if (!folder || !folder.children) return;
      for (const key in folder.children) {
        const item = folder.children[key];
        const newPath = currentPath === 'C:' ? `C:/${key}` : `${currentPath}/${key}`;
        if (item.virus) {
          virusCount++;
          virusPaths.push(newPath);
        }
        if (item.type === 'folder') {
          traverse(item, newPath);
        }
      }
    }

    traverse(window.fileSystem['C:'], 'C:');
    return { count: virusCount, paths: virusPaths };
  }

  scanBtn.addEventListener('click', () => {
    scanBtn.disabled = true;
    removeBtn.disabled = true;
    statusEl.innerHTML = '<strong>Status:</strong> Scanning in progress...';
    resultsEl.innerHTML = '';
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressLabel.textContent = "Scanning C:/...";

    let progress = 0;
    const scanInterval = setInterval(() => {
      progress += 5;
      progressBar.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(scanInterval);
        progressContainer.style.display = 'none';
        scanBtn.disabled = false;

        const { count, paths } = findViruses();
        if (count > 0) {
          statusEl.innerHTML = `<strong style="color: red;">Status:</strong> Your computer is infected!`;
          resultsEl.innerHTML = `
            <p><strong>Viruses Found: ${count}</strong></p>
            <ul>
              ${paths.map(p => `<li>${p}</li>`).join('')}
            </ul>
          `;
          removeBtn.disabled = false;
        } else {
          statusEl.innerHTML = `<strong style="color: green;">Status:</strong> Your computer is clean.`;
          resultsEl.innerHTML = '<p>No threats were detected.</p>';
        }
      }
    }, 150);
  });

  removeBtn.addEventListener('click', () => {
    const { count } = findViruses();
    window.openErrorWindow(`To remove the ${count} detected threats, please upgrade to Antivirus 2003 Premium for only $49.99!`);
  });
}