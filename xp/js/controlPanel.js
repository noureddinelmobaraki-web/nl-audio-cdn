export function initControlPanel(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "10px";
  contentArea.style.backgroundColor = "#6375d6"; // Set blue background color
  
  // Add header "Pick a category" with smaller size and light color
  const header = document.createElement('h4'); // Changed from h2 to h4 for smaller size
  header.textContent = "Pick a category";
  header.style.marginBottom = "15px";
  header.style.fontFamily = "Tahoma, sans-serif";
  header.style.color = "#d6dff5"; // Set light blue text color
  contentArea.appendChild(header);
  
  // Create a grid container with 2 columns
  contentArea.style.display = "flex";
  contentArea.style.flexDirection = "column";
  
  // Create a separate grid container for the items (to keep header above)
  const gridContainer = document.createElement('div');
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
  gridContainer.style.gap = "15px";
  contentArea.appendChild(gridContainer);
  
  // Add Control Panel items with updated names and icons
  const items = [
    { name: "Appearance and Themes", icon: "Appearance.png", action: changeDisplaySettings },
    { name: "Network and Internet Connections", icon: "Network and Internet.png", action: showNetworkSettings }, 
    { name: "Sounds, Speech, and Audio Devices", icon: "Audio Devices.png", action: changeSoundSettings },
    { name: "Add or Remove Programs", icon: "Programs.png", action: showProgramManager }
  ];
  
  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.style.display = "flex";
    itemEl.style.alignItems = "center";
    itemEl.style.cursor = "pointer";
    
    const img = document.createElement('img');
    img.src = getIcon(item.name);
    img.style.width = "32px";
    img.style.height = "32px";
    img.style.marginRight = "10px";
    
    const text = document.createElement('span');
    text.textContent = item.name;
    text.style.color = "white"; // Set text color to white
    
    itemEl.appendChild(img);
    itemEl.appendChild(text);
    
    itemEl.addEventListener('click', () => {
      // Create a new window for the submenu instead of modifying the current one
      const subWin = window.createWindow(item.name);
      item.action(subWin, showNotification);
    });
    
    gridContainer.appendChild(itemEl);
  });
  
  // Add note at the bottom about settings not working
  const noteContainer = document.createElement('div');
  noteContainer.style.marginTop = "20px";
  noteContainer.style.color = "#d6dff5";
  noteContainer.style.fontStyle = "italic";
  noteContainer.style.fontSize = "12px";
  noteContainer.style.textAlign = "center";
  noteContainer.textContent = "Note: Currently, most settings will not work.";
  contentArea.appendChild(noteContainer);
}

function showSystemInfo(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  const backButton = document.createElement('button');
  backButton.textContent = "← Back";
  backButton.style.marginBottom = "15px";
  backButton.addEventListener('click', () => {
    window.initControlPanel(win, showNotification);
  });
  contentArea.appendChild(backButton);
  
  const systemInfoContainer = document.createElement('div');
  systemInfoContainer.innerHTML = `
    <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px;">
      <h3 style="margin-top: 0;">System Properties</h3>
      <p><strong>OS:</strong> Microsoft Windows XP Professional</p>
      <p><strong>Version:</strong> 5.1.2600 Service Pack 3</p>
      <p><strong>Computer:</strong> Web Browser PC</p>
      <p><strong>Processor:</strong> JavaScript Virtual Machine</p>
      <p><strong>Memory:</strong> Limited by Browser</p>
    </div>
    <div style="border: 1px solid #ccc; padding: 15px;">
      <h3 style="margin-top: 0;">Performance</h3>
      <p>This system is performing at optimal levels.</p>
      <button>View Performance Details</button>
    </div>
  `;
  contentArea.appendChild(systemInfoContainer);
  
  showNotification("System information displayed");
}

function changeDisplaySettings(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  // Set the window title icon
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    const titleBarIcon = titleBar.querySelector('img');
    if (titleBarIcon) {
      titleBarIcon.src = getIcon("Appearance and Themes");
    }
  }
  // Update taskbar button icon
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  if (taskbarBtn) {
    const btnIcon = taskbarBtn.querySelector('img');
    if (btnIcon) {
      btnIcon.src = getIcon("Appearance and Themes");
    }
  }
  
  // Create tabbed interface
  const tabContainer = document.createElement('div');
  tabContainer.style.marginBottom = "15px";
  
  const tabMenu = document.createElement('menu');
  tabMenu.setAttribute('role', 'tablist');
  tabMenu.style.display = 'flex';
  tabMenu.style.listStyle = 'none';
  tabMenu.style.padding = '0';
  tabMenu.style.margin = '0';
  tabMenu.style.borderBottom = '1px solid #ccc';
  
  const tabs = [
    { id: 'appearance', name: 'Appearance', selected: true },
    { id: 'desktop', name: 'Desktop' },
    { id: 'themes', name: 'Themes' }
  ];
  
  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.setAttribute('aria-controls', tab.id);
    if (tab.selected) button.setAttribute('aria-selected', 'true');
    button.textContent = tab.name;
    button.style.padding = '5px 15px';
    button.style.margin = '0 2px';
    button.style.border = '1px solid #ccc';
    button.style.borderBottom = tab.selected ? 'none' : '1px solid #ccc';
    button.style.borderRadius = '4px 4px 0 0';
    button.style.backgroundColor = tab.selected ? 'white' : '#f0f0f0';
    button.style.position = 'relative';
    button.style.top = tab.selected ? '1px' : '0';
    
    button.addEventListener('click', () => {
      // Update selected state in buttons
      tabMenu.querySelectorAll('button').forEach(btn => {
        btn.removeAttribute('aria-selected');
        btn.style.backgroundColor = '#f0f0f0';
        btn.style.borderBottom = '1px solid #ccc';
        btn.style.top = '0';
      });
      button.setAttribute('aria-selected', 'true');
      button.style.backgroundColor = 'white';
      button.style.borderBottom = 'none';
      button.style.top = '1px';
      
      // Show selected panel, hide others
      tabContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        panel.hidden = true;
      });
      tabContainer.querySelector(`#${tab.id}`).hidden = false;
    });
    
    tabMenu.appendChild(button);
  });
  
  tabContainer.appendChild(tabMenu);
  
  // Create tab panels
  tabs.forEach(tab => {
    const panel = document.createElement('article');
    panel.setAttribute('role', 'tabpanel');
    panel.id = tab.id;
    panel.hidden = !tab.selected;
    panel.style.border = '1px solid #ccc';
    panel.style.borderTop = 'none';
    panel.style.padding = '15px';
    
    if (tab.id === 'appearance') {
      panel.innerHTML = `
        <div style="margin-bottom: 15px;">
          <div style="margin-bottom: 10px;">
            <label><strong>Background:</strong></label>
            <div style="display: flex; margin-top: 5px;">
              <select id="bg-list" size="4" style="width: 200px; height: 120px;">
                <option value="bg.jpg">Bliss (Default)</option>
                <option value="scarybliss.jpg">Haunted Bliss</option>
                <option value="Azul.jpg">Azul</option>
                <option value="Follow.jpeg">Follow</option>
                <option value="none">(None)</option>
              </select>
              <div style="margin-left: 10px; display: flex; flex-direction: column;">
                <button id="browse-btn" style="margin-bottom: 10px;">Browse...</button>
                <div style="margin-bottom: 10px;">
                  <label><strong>Position:</strong></label>
                  <select id="position-select">
                    <option value="center">Center</option>
                    <option value="tile">Tile</option>
                    <option value="stretch" selected>Stretch</option>
                  </select>
                </div>
                <div>
                  <label><strong>Color:</strong></label>
                  <input type="color" id="bg-color" value="#000080">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (tab.id === 'desktop') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <input type="checkbox" id="show-desktop-icons" checked>
            <label for="show-desktop-icons">Show desktop icons</label>
          </div>
          <div>
            <label><strong>Icon Size:</strong></label>
            <select>
              <option>Small</option>
              <option selected>Medium</option>
              <option>Large</option>
            </select>
          </div>
        </div>
      `;
    } else if (tab.id === 'themes') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <label><strong>Visual Style:</strong></label>
            <select>
              <option selected>Windows XP</option>
              <option>Windows Classic</option>
              <option>Modified</option>
            </select>
          </div>
          <div>
            <button>Save Theme...</button>
            <button>Delete Theme...</button>
          </div>
        </div>
      `;
    }
    
    tabContainer.appendChild(panel);
  });
  
  contentArea.appendChild(tabContainer);
  
  // Create button container at bottom right
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '5px';
  buttonContainer.style.marginTop = '15px';
  
  const okButton = document.createElement('button');
  okButton.textContent = "OK";
  okButton.addEventListener('click', () => {
    // Apply changes first (reuse the apply button's functionality)
    applyButton.click();
    // Then close the window
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const applyButton = document.createElement('button');
  applyButton.textContent = "Apply";
  applyButton.addEventListener('click', () => {
    const bgList = contentArea.querySelector('#bg-list');
    const positionSelect = contentArea.querySelector('#position-select');
    const bgColor = contentArea.querySelector('#bg-color');
    
    if (bgList && positionSelect && bgColor) {
      const value = bgList.value;
      const position = positionSelect.value;
      const color = bgColor.value;
      const desktop = document.querySelector('.desktop');
      
      if (value === 'none') {
        // Just set the background color
        desktop.style.backgroundImage = 'none';
        desktop.style.backgroundColor = color;
      } else {
        // Set the background image and positioning
        desktop.style.backgroundColor = color;
        
        if (position === 'center') {
          desktop.style.backgroundImage = `url('${value}')`;
          desktop.style.backgroundSize = 'auto';
          desktop.style.backgroundRepeat = 'no-repeat';
          desktop.style.backgroundPosition = 'center';
        } else if (position === 'tile') {
          desktop.style.backgroundImage = `url('${value}')`;
          desktop.style.backgroundSize = 'auto';
          desktop.style.backgroundRepeat = 'repeat';
          desktop.style.backgroundPosition = '0 0';
        } else if (position === 'stretch') {
          desktop.style.backgroundImage = `url('${value}')`;
          desktop.style.backgroundSize = 'cover';
          desktop.style.backgroundRepeat = 'no-repeat';
          desktop.style.backgroundPosition = 'center';
        }
      }
      
      showNotification("Background settings applied");
    }
  });
  
  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(applyButton);
  
  contentArea.appendChild(buttonContainer);
  
  // Add file input for browsing background images (hidden)
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'bg-file-input';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  contentArea.appendChild(fileInput);
  
  // Set up event listeners after elements are in the DOM
  setTimeout(() => {
    const browseBtn = contentArea.querySelector('#browse-btn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        fileInput.click();
      });
    }
    
    fileInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        try {
          const file = e.target.files[0];
          // Upload to S3 (Returns the URL of the uploaded file)
          const url = await websim.upload(file);
          
          // Add new option to the list box and select it
          const bgList = contentArea.querySelector('#bg-list');
          const newOption = document.createElement('option');
          newOption.value = url;
          newOption.textContent = file.name;
          bgList.appendChild(newOption);
          newOption.selected = true;
          
          showNotification("Custom background image uploaded");
        } catch (error) {
          console.error('Error uploading file:', error);
          showNotification("Error uploading background image");
        }
      }
    });
  }, 100);
}

function showNetworkSettings(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  // Set the window title icon
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    const titleBarIcon = titleBar.querySelector('img');
    if (titleBarIcon) {
      titleBarIcon.src = getIcon("Network and Internet Connections");
    }
  }
  // Update taskbar button icon
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  if (taskbarBtn) {
    const btnIcon = taskbarBtn.querySelector('img');
    if (btnIcon) {
      btnIcon.src = getIcon("Network and Internet Connections");
    }
  }
  
  // Create tabbed interface
  const tabContainer = document.createElement('div');
  tabContainer.style.marginBottom = "15px";
  
  const tabMenu = document.createElement('menu');
  tabMenu.setAttribute('role', 'tablist');
  tabMenu.style.display = 'flex';
  tabMenu.style.listStyle = 'none';
  tabMenu.style.padding = '0';
  tabMenu.style.margin = '0';
  tabMenu.style.borderBottom = '1px solid #ccc';
  
  const tabs = [
    { id: 'connections', name: 'Connections', selected: true },
    { id: 'setup', name: 'Network Setup' },
    { id: 'internet', name: 'Internet Options' }
  ];
  
  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.setAttribute('aria-controls', tab.id);
    if (tab.selected) button.setAttribute('aria-selected', 'true');
    button.textContent = tab.name;
    button.style.padding = '5px 15px';
    button.style.margin = '0 2px';
    button.style.border = '1px solid #ccc';
    button.style.borderBottom = tab.selected ? 'none' : '1px solid #ccc';
    button.style.borderRadius = '4px 4px 0 0';
    button.style.backgroundColor = tab.selected ? 'white' : '#f0f0f0';
    button.style.position = 'relative';
    button.style.top = tab.selected ? '1px' : '0';
    
    button.addEventListener('click', () => {
      // Update selected state in buttons
      tabMenu.querySelectorAll('button').forEach(btn => {
        btn.removeAttribute('aria-selected');
        btn.style.backgroundColor = '#f0f0f0';
        btn.style.borderBottom = '1px solid #ccc';
        btn.style.top = '0';
      });
      button.setAttribute('aria-selected', 'true');
      button.style.backgroundColor = 'white';
      button.style.borderBottom = 'none';
      button.style.top = '1px';
      
      // Show selected panel, hide others
      tabContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        panel.hidden = true;
      });
      tabContainer.querySelector(`#${tab.id}`).hidden = false;
    });
    
    tabMenu.appendChild(button);
  });
  
  tabContainer.appendChild(tabMenu);
  
  // Create tab panels
  tabs.forEach(tab => {
    const panel = document.createElement('article');
    panel.setAttribute('role', 'tabpanel');
    panel.id = tab.id;
    panel.hidden = !tab.selected;
    panel.style.border = '1px solid #ccc';
    panel.style.borderTop = 'none';
    panel.style.padding = '15px';
    
    if (tab.id === 'connections') {
      panel.innerHTML = `
        <div>
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="width: 40px; height: 40px; background-color: #00ff00; margin-right: 10px; border-radius: 5px;"></div>
            <div>
              <strong>Local Area Connection</strong>
              <div>Status: Connected</div>
            </div>
          </div>
          <button>Properties</button>
        </div>
      `;
    } else if (tab.id === 'setup') {
      panel.innerHTML = `
        <div>
          <p>Create a home or small office network</p>
          <button>Run Network Setup Wizard</button>
        </div>
      `;
    } else if (tab.id === 'internet') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <label><strong>Home Page:</strong></label>
            <input type="text" value="about:home" style="width: 250px;">
          </div>
          <div>
            <button>Clear Browser History</button>
          </div>
        </div>
      `;
    }
    
    tabContainer.appendChild(panel);
  });
  
  contentArea.appendChild(tabContainer);
  
  // Create button container at bottom right
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '5px';
  buttonContainer.style.marginTop = '15px';
  
  const okButton = document.createElement('button');
  okButton.textContent = "OK";
  okButton.addEventListener('click', () => {
    // Apply changes first (reuse the apply button's functionality)
    applyButton.click();
    // Then close the window
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const applyButton = document.createElement('button');
  applyButton.textContent = "Apply";
  
  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(applyButton);
  
  contentArea.appendChild(buttonContainer);
  
  // removed open-notification per user request
}

function changeSoundSettings(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  // Set the window title icon
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    const titleBarIcon = titleBar.querySelector('img');
    if (titleBarIcon) {
      titleBarIcon.src = getIcon("Sounds, Speech, and Audio Devices");
    }
  }
  // Update taskbar button icon
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  if (taskbarBtn) {
    const btnIcon = taskbarBtn.querySelector('img');
    if (btnIcon) {
      btnIcon.src = getIcon("Sounds, Speech, and Audio Devices");
    }
  }
  
  // Create tabbed interface
  const tabContainer = document.createElement('div');
  tabContainer.style.marginBottom = "15px";
  
  const tabMenu = document.createElement('menu');
  tabMenu.setAttribute('role', 'tablist');
  tabMenu.style.display = 'flex';
  tabMenu.style.listStyle = 'none';
  tabMenu.style.padding = '0';
  tabMenu.style.margin = '0';
  tabMenu.style.borderBottom = '1px solid #ccc';
  
  const tabs = [
    { id: 'volume', name: 'Volume', selected: true },
    { id: 'sounds', name: 'Sounds' },
    { id: 'audio', name: 'Audio Devices' }
  ];
  
  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.setAttribute('aria-controls', tab.id);
    if (tab.selected) button.setAttribute('aria-selected', 'true');
    button.textContent = tab.name;
    button.style.padding = '5px 15px';
    button.style.margin = '0 2px';
    button.style.border = '1px solid #ccc';
    button.style.borderBottom = tab.selected ? 'none' : '1px solid #ccc';
    button.style.borderRadius = '4px 4px 0 0';
    button.style.backgroundColor = tab.selected ? 'white' : '#f0f0f0';
    button.style.position = 'relative';
    button.style.top = tab.selected ? '1px' : '0';
    
    button.addEventListener('click', () => {
      // Update selected state in buttons
      tabMenu.querySelectorAll('button').forEach(btn => {
        btn.removeAttribute('aria-selected');
        btn.style.backgroundColor = '#f0f0f0';
        btn.style.borderBottom = '1px solid #ccc';
        btn.style.top = '0';
      });
      button.setAttribute('aria-selected', 'true');
      button.style.backgroundColor = 'white';
      button.style.borderBottom = 'none';
      button.style.top = '1px';
      
      // Show selected panel, hide others
      tabContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        panel.hidden = true;
      });
      tabContainer.querySelector(`#${tab.id}`).hidden = false;
    });
    
    tabMenu.appendChild(button);
  });
  
  tabContainer.appendChild(tabMenu);
  
  // Create tab panels
  tabs.forEach(tab => {
    const panel = document.createElement('article');
    panel.setAttribute('role', 'tabpanel');
    panel.id = tab.id;
    panel.hidden = !tab.selected;
    panel.style.border = '1px solid #ccc';
    panel.style.borderTop = 'none';
    panel.style.padding = '15px';
    
    if (tab.id === 'volume') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 15px;">
            <label><strong>Volume:</strong></label>
            <input type="range" min="0" max="100" value="75" id="volume-slider">
            <span id="volume-value">75%</span>
          </div>
          <div>
            <input type="checkbox" id="mute" name="mute">
            <label for="mute">Mute</label>
          </div>
        </div>
      `;
    } else if (tab.id === 'sounds') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <label><strong>Sound Scheme:</strong></label>
            <select id="sound-scheme">
              <option selected>Windows Default</option>
              <option>No Sounds</option>
              <option>Windows Classic</option>
            </select>
          </div>
          <div style="margin-top: 15px;">
            <button id="test-sound">Play Windows XP Startup Sound</button>
          </div>
        </div>
      `;
    } else if (tab.id === 'audio') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <strong>Default Device:</strong> Speakers (High Definition Audio)
          </div>
          <div>
            <button>Audio Properties</button>
          </div>
        </div>
      `;
    }
    
    tabContainer.appendChild(panel);
  });
  
  contentArea.appendChild(tabContainer);
  
  // Create button container at bottom right
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '5px';
  buttonContainer.style.marginTop = '15px';
  
  const okButton = document.createElement('button');
  okButton.textContent = "OK";
  okButton.addEventListener('click', () => {
    // Apply changes first (reuse the apply button's functionality)
    applyButton.click();
    // Then close the window
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const applyButton = document.createElement('button');
  applyButton.textContent = "Apply";
  
  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(applyButton);
  
  contentArea.appendChild(buttonContainer);
  
  // Add functionality
  const volumeSlider = contentArea.querySelector('#volume-slider');
  const volumeValue = contentArea.querySelector('#volume-value');
  const testSoundBtn = contentArea.querySelector('#test-sound');
  
  if (volumeSlider && volumeValue) {
    volumeSlider.addEventListener('input', () => {
      volumeValue.textContent = volumeSlider.value + '%';
    });
  }
  
  if (testSoundBtn) {
    testSoundBtn.addEventListener('click', () => {
      const startupSound = new Audio("Windows XP Startup.mp3");
      if (volumeSlider) {
        startupSound.volume = volumeSlider.value / 100;
      }
      startupSound.play().catch(err => {
        console.warn('Could not play startup sound:', err);
        showNotification("Error playing sound: " + err.message);
      });
      showNotification("Playing startup sound at " + (volumeSlider ? volumeSlider.value : 75) + "% volume");
    });
  }
}

function showProgramManager(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  // Set the window title icon
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    const titleBarIcon = titleBar.querySelector('img');
    if (titleBarIcon) {
      titleBarIcon.src = getIcon("Add or Remove Programs");
    }
  }
  // Update taskbar button icon
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  if (taskbarBtn) {
    const btnIcon = taskbarBtn.querySelector('img');
    if (btnIcon) {
      btnIcon.src = getIcon("Add or Remove Programs");
    }
  }
  
  // Make window wider per request
  win.style.width = '800px';
  win.style.height = '520px';
  
  // Create a flex container for the sidebar buttons and content area
  const mainContainer = document.createElement('div');
  mainContainer.style.display = 'flex';
  mainContainer.style.height = '100%';
  
  // Create left sidebar for big square buttons
  const sidebar = document.createElement('div');
  sidebar.style.width = '150px';
  sidebar.style.marginRight = '15px';
  sidebar.style.display = 'flex';
  sidebar.style.flexDirection = 'column';
  sidebar.style.gap = '10px';
  
  // Create content area (right side)
  const contentPanel = document.createElement('div');
  contentPanel.style.flex = '1';
  contentPanel.style.display = 'flex';
  contentPanel.style.flexDirection = 'column';
  
  // Define the sections/tabs
  const sections = [
    { id: 'installed', label: 'Change or Remove Programs', icon: '🗑️' },
    { id: 'new', label: 'Add New Programs', icon: '💿' },
    { id: 'windows', label: 'Windows Components', icon: '🪟' }
  ];
  
  // Create buttons and content panels
  sections.forEach((section, index) => {
    // Create the big square button
    const btn = document.createElement('button');
    btn.style.width = '120px';
    btn.style.height = '60px';
    btn.style.display = 'flex';
    btn.style.flexDirection = 'column';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.gap = '5px';
    btn.style.textAlign = 'center';
    btn.style.cursor = 'pointer';
    btn.style.backgroundColor = index === 0 ? '#e1e5f2' : '#f0f0f0';
    
    // Icon and text for button
    const icon = document.createElement('div');
    icon.textContent = section.icon;
    icon.style.fontSize = '24px';
    
    const label = document.createElement('div');
    label.textContent = section.label;
    
    btn.appendChild(icon);
    btn.appendChild(label);
    
    // Content panel for this section
    const panel = document.createElement('div');
    panel.id = section.id;
    panel.style.display = index === 0 ? 'block' : 'none';
    panel.style.flex = '1';
    
    // Handle click to switch tabs
    btn.addEventListener('click', () => {
      sections.forEach((s, i) => {
        const panelElement = document.getElementById(s.id);
        if (panelElement) {
          panelElement.style.display = i === index ? 'block' : 'none';
        }
        sidebar.children[i].style.backgroundColor = i === index ? '#e1e5f2' : '#f0f0f0';
      });
    });
    
    sidebar.appendChild(btn);
    contentPanel.appendChild(panel);
  });
  
  mainContainer.appendChild(sidebar);
  mainContainer.appendChild(contentPanel);
  contentArea.appendChild(mainContainer);
  
  // Add content for each panel
  const installedPanel = document.getElementById('installed');
  if (installedPanel) {
    installedPanel.innerHTML = '';
    // Header row
    const header = document.createElement('div');
    header.style.display = 'flex'; header.style.justifyContent = 'space-between';
    header.style.marginBottom = '6px'; header.innerHTML = `
      <span><strong>Currently installed programs:</strong></span>
      <span style="color:#70757a;font-size:11px;">Sort by: Name</span>`;
    installedPanel.appendChild(header);
    // Build list from Apps folder
    const apps = window.fileSystem['C:']?.children?.['Apps']?.children || {};
    const exclude = new Set(['Control Panel','Task Manager','BSOD Creator']);
    const list = document.createElement('div');
    installedPanel.appendChild(list);
    Object.keys(apps).sort().forEach(name => {
      const item = apps[name]; if (!item || item.type !== 'app' || exclude.has(name)) return;
      const row = document.createElement('div');
      row.style.borderBottom = '1px solid #eee'; row.style.padding = '6px 8px';
      row.style.cursor = 'pointer'; row.style.display = 'flex'; row.style.justifyContent = 'space-between';
      row.innerHTML = `<span>${name}</span><span style="color:#666">Size ~ ${Math.floor(Math.random()*9000)+1000} KB</span>`;
      const details = document.createElement('div');
      details.className = 'app-details';
      details.style.background = '#d3e5fa'; details.style.margin = '6px 0 0'; details.style.padding = '8px';
      details.style.display = 'none';
      details.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div><a href="#" style="color:#0067b8;text-decoration:underline">Click here for support information.</a></div>
            <div style="margin-top:6px;">To remove this program from your computer, click Remove.</div>
          </div>
          <button class="remove-btn">Remove</button>
        </div>`;
      row.addEventListener('click', () => {
        list.querySelectorAll('.app-details').forEach(d => { if (d !== details) d.style.display = 'none'; });
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
      });
      details.querySelector('.remove-btn').addEventListener('click', () => {
        // Close any open window of this app
        document.querySelectorAll('.window').forEach(w => {
          if ((w.dataset.title || '').toLowerCase().includes(name.toLowerCase())) {
            const closeBtn = w.querySelector('button[aria-label="Close"]'); if (closeBtn) closeBtn.click(); else w.remove();
          }
        });
        // Remove desktop shortcuts
        const desktop = window.fileSystem['C:']?.children?.['Desktop']?.children;
        if (desktop && desktop[name]) delete desktop[name];
        // Remove app from Apps folder
        // Track removed apps for installer
        window.__removedPrograms = window.__removedPrograms || [];
        try {
          const removedData = JSON.parse(JSON.stringify(window.fileSystem['C:'].children['Apps'].children[name]));
          window.__removedPrograms.push({ name, data: removedData });
        } catch (e) {}
        delete window.fileSystem['C:'].children['Apps'].children[name];
        showNotification(`Removed ${name}.`);
        // Refresh Desktop icons so shortcut disappears
        if (window.updateDesktopIcons) window.updateDesktopIcons();
        // Optionally refresh File Explorer if it's currently showing Desktop
        const explorer = window.currentFileExplorer;
        if (explorer) {
          const pathInput = explorer.querySelector('input[type="text"]');
          if (pathInput && pathInput.value.trim() === 'C:/Desktop/') {
            window.updateFileExplorer(explorer, 'C:/Desktop/');
          }
        }
        // Refresh the list
        showProgramManager(win, showNotification);
      });
      list.appendChild(row);
      list.appendChild(details);
    });
  }
  
  const newPanel = document.getElementById('new');
  if (newPanel) {
    newPanel.innerHTML = `
      <div>
        <p>To install a program from a CD-ROM or floppy disk, click Install.</p>
        <button>Install...</button>
        <hr>
        <p>To install programs from Microsoft:</p>
        <button>Add programs from Microsoft</button>
      </div>
    `;
    const installBtn = newPanel.querySelector('button');
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        const installerWin = window.createWindow("Program Installer");
        renderProgramInstaller(installerWin, showNotification);
      });
    }
  }
  
  const windowsPanel = document.getElementById('windows');
  if (windowsPanel) {
    windowsPanel.innerHTML = `
      <div>
        <p>You can add or remove components of Windows XP.</p>
        <div style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 5px;">
          <div style="padding: 5px;">
            <input type="checkbox" id="ie" checked>
            <label for="ie">Internet Explorer</label>
          </div>
          <div style="padding: 5px;">
            <input type="checkbox" id="wmp" checked>
            <label for="wmp">Windows Media Player</label>
          </div>
          <div style="padding: 5px;">
            <input type="checkbox" id="msn" checked>
            <label for="msn">MSN Explorer</label>
          </div>
          <div style="padding: 5px;">
            <input type="checkbox" id="netmeeting">
            <label for="netmeeting">NetMeeting</label>
          </div>
        </div>
        <div style="margin-top: 10px;">
          <button>Apply Changes</button>
        </div>
      </div>
    `;
  }
  
  // removed bottom OK/Cancel/Apply button container for Add or Remove Programs
  // removed open-notification per user request
}

function renderProgramInstaller(win, showNotification) {
  const content = win.querySelector('.window-content');
  content.innerHTML = '';
  content.style.padding = '15px';
  const header = document.createElement('h3');
  header.textContent = 'Program Installer';
  const desc = document.createElement('p');
  desc.textContent = 'Select programs to reinstall:';
  const list = document.createElement('div');
  list.style.border = '1px solid #ccc'; list.style.background = '#fff'; list.style.maxHeight = '250px'; list.style.overflowY = 'auto'; list.style.padding = '8px';
  const toolbar = document.createElement('div');
  toolbar.style.display = 'flex'; toolbar.style.justifyContent = 'space-between'; toolbar.style.margin = '10px 0';
  const addShortcutWrap = document.createElement('label');
  const addShortcutChk = document.createElement('input'); addShortcutChk.type = 'checkbox'; addShortcutChk.checked = true;
  addShortcutWrap.appendChild(addShortcutChk); addShortcutWrap.appendChild(document.createTextNode(' Add desktop shortcut'));
  toolbar.appendChild(addShortcutWrap);
  content.append(header, desc, list, toolbar);
  
  function refresh() {
    list.innerHTML = '';
    const removed = (window.__removedPrograms || []);
    if (!removed.length) { list.innerHTML = '<i>No removed programs found.</i>'; return; }
    removed.forEach((entry, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.justifyContent = 'space-between'; row.style.padding = '6px 4px'; row.style.borderBottom = '1px solid #eee';
      row.innerHTML = `<span>${entry.name}</span>`;
      const btn = document.createElement('button'); btn.textContent = 'Install';
      btn.addEventListener('click', () => {
        const apps = window.fileSystem['C:']?.children?.['Apps']?.children;
        if (!apps) return showNotification('Error: Apps folder missing.');
        apps[entry.name] = JSON.parse(JSON.stringify(entry.data));
        if (addShortcutChk.checked) {
          const desktop = window.fileSystem['C:']?.children?.['Desktop']?.children;
          if (desktop) desktop[entry.name] = { type: 'shortcut', target: `C:/Apps/${entry.name}` };
          if (window.updateDesktopIcons) window.updateDesktopIcons();
        }
        window.__removedPrograms.splice(idx, 1);
        showNotification(`Installed ${entry.name}.`);
        refresh();
        // If Add/Remove is open, refresh its installed list
        const addRemoveWin = Array.from(document.querySelectorAll('.window')).find(w => (w.dataset.title||'').includes('Add or Remove Programs'));
        if (addRemoveWin) showProgramManager(addRemoveWin, showNotification);
      });
      row.appendChild(btn);
      list.appendChild(row);
    });
  }
  refresh();
  win.style.width = '480px'; win.style.height = '380px';
}

// export for external use (e.g., Desktop > Properties)
export { changeDisplaySettings };