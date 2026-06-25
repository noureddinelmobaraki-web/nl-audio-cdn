// WannaCry virus logic (simulated encryption)

export function encryptAllFiles() {
  try {
    const desktop = document.querySelector('.desktop');
    if (desktop) {
      desktop.style.backgroundImage = "url('wannacry_bg.png')";
    }

    const root = window.fileSystem && window.fileSystem['C:'];
    if (!root || !root.children) return;
    
    // Recursively traverse folders and encrypt files
    function recurse(folder) {
      if (!folder || !folder.children) return;
      const keys = Object.keys(folder.children);
      for (const key of keys) {
        const item = folder.children[key];
        if (!item) continue;
        if (item.type === 'folder') {
          recurse(item);
        } else if (item.type === 'file' || item.type === 'app') {
          // Don't encrypt the virus itself or the decryptor
          if (item.program === 'WannaCrypt0r' || item.program === '@WanaDecryptor@') continue;

          // Don't encrypt the readme
          if (key === '@Please_Read_Me@.txt') continue;

          // Don't encrypt system utilities
          const excludedPrograms = [
            'My Computer', 
            'Recycle Bin', 
            'Command Prompt', 
            'Control Panel', 
            'Task Manager',
            'Internet Explorer',
            'Notepad',
            'Paint',
            'Calculator',
            'File Explorer',
            'Run',
            'BSOD Creator',
            'Information'
          ];
          if (item.program && excludedPrograms.includes(item.program)) continue;

          // Rename to add .WNCRY if not already
          const newKey = key.toLowerCase().endsWith('.wncry') ? key : `${key}.WNCRY`;
          // Scramble content to look encrypted
          let original = '';
          if (item.type === 'file') {
            original = typeof item.content === 'string' ? item.content : '';
          } else {
            original = "Executable binary content...";
          }

          const scrambled = pseudoEncrypt(original);
          // Replace entry (handle key rename)
          folder.children[newKey] = { type: 'file', content: scrambled };
          if (newKey !== key) {
            delete folder.children[key];
          }
        }
        // Leave shortcuts alone for now
      }
    }
    recurse(root);

    // Create the decryptor executable on the desktop
    const desktopFolder = window.fileSystem['C:'].children['Desktop'];
    if (desktopFolder && desktopFolder.children) {
      desktopFolder.children['@WanaDecryptor@.exe'] = {
        type: 'app',
        program: '@WanaDecryptor@'
      };

      // Add the Read Me text file
      desktopFolder.children['@Please_Read_Me@.txt'] = {
        type: 'file',
        content: `Q:  What's wrong with my files?

A:  Ooops, your important files are encrypted. It means you will not be able to access them anymore until they are decrypted.
    If you follow our instructions, we guarantee that you can decrypt all your files quickly and safely!
    Let's start decrypting!

Q:  What do I do?

A:  First, you need to pay service fees for the decryption.
    Please send $300 worth of bitcoin to this bitcoin address: 12t9YDPgwueZ9NyMgw519p7AA8isjr6SMw

    Next, please find an application file named "@WanaDecryptor@.exe". It is the decrypt software.
    Run and follow the instructions! (You may need to disable your antivirus for a while.)

Q:  How can I trust?

A:  Don't worry about decryption.
    We will decrypt your files surely because nobody will trust us if we cheat users.

*   If you need our assistance, send a message by clicking <Contact Us> on the decryptor window.`
      };

      if (window.updateDesktopIcons) window.updateDesktopIcons();
    }

    // Refresh file explorer if open
    if (window.currentFileExplorer) {
      const explorerPathInput = window.currentFileExplorer.querySelector('input[type="text"]');
      if (explorerPathInput) {
        window.updateFileExplorer(window.currentFileExplorer, explorerPathInput.value);
      }
    }

    // Open the decryptor window immediately
    setTimeout(() => {
      if (window.openItem) {
        window.openItem("C:/Desktop/@WanaDecryptor@.exe");
      }
    }, 1000);

  } catch (e) {
    console.warn("Encryption routine failed:", e);
  }
}

function pseudoEncrypt(text) {
  // Simple obfuscation to simulate encryption
  const header = "=== WANNACRY ENCRYPTED FILE ===\n";
  const base = (typeof text === 'string' && text.length) ? text : Math.random().toString(36).repeat(50);
  let out = '';
  for (let i = 0; i < base.length; i++) {
    const ch = base.charCodeAt(i);
    // XOR with a rotating key, then convert to hex
    const x = ch ^ (91 + (i % 13));
    out += x.toString(16).padStart(2, '0');
    if (i % 64 === 63) out += '\n';
  }
  return header + out;
}

export function initWannaCry(win) {
  const content = win.querySelector('.window-content');
  win.style.backgroundColor = '#8e0000';
  content.style.padding = '0';
  content.style.display = 'flex';
  content.style.flexDirection = 'row'; // Changed to row for sidebar layout
  content.style.fontFamily = 'Arial, sans-serif';
  content.style.color = 'white';
  content.style.overflow = 'hidden';

  // Set initial timer values
  // Payment raise date (e.g., 3 days from now)
  const date1 = new Date();
  date1.setDate(date1.getDate() + 3);
  // Lost files date (e.g., 7 days from now)
  const date2 = new Date();
  date2.setDate(date2.getDate() + 7);

  const formatDate = (d) => {
    return `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
  };

  content.innerHTML = `
    <!-- Left Sidebar -->
    <div style="width: 240px; background-color: #8e0000; padding: 15px; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box; border-right: 1px solid #600;">
      
      <!-- Lock Icon -->
      <div style="background: transparent; padding: 15px 0; text-align: center; margin-bottom: 10px;">
        <img src="wannacry_lock.webp" style="width: 55%; margin: 0 auto; display: block;">
      </div>
      
      <!-- Timer 1 -->
      <div style="border: 1px solid white; background: transparent; padding: 5px; display: flex; gap: 5px;">
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 12px; font-weight: bold; margin-bottom: 2px; color: yellow;">Payment will be raised on</div>
          <div style="font-size: 11px; color: white; margin-bottom: 5px;">${formatDate(date1)}</div>
          <div style="font-size: 12px; color: white;">Time Left</div>
          <div style="font-size: 24px; color: white; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 1px;" id="wc-timer-1">00:00:00:00</div>
        </div>
        <div style="width: 10px; background-color: #300; border: 1px solid #777; position: relative;">
          <div id="wc-bar-1" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, #00ff00, #ff0000); transition: height 1s linear;"></div>
        </div>
      </div>
      
      <!-- Timer 2 -->
      <div style="border: 1px solid white; background: transparent; padding: 5px; display: flex; gap: 5px;">
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 12px; font-weight: bold; margin-bottom: 2px; color: yellow;">Your files will be lost on</div>
          <div style="font-size: 11px; color: white; margin-bottom: 5px;">${formatDate(date2)}</div>
          <div style="font-size: 12px; color: white;">Time Left</div>
          <div style="font-size: 24px; color: white; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 1px;" id="wc-timer-2">00:00:00:00</div>
        </div>
        <div style="width: 10px; background-color: #300; border: 1px solid #777; position: relative;">
          <div id="wc-bar-2" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, #00ff00, #ff0000); transition: height 1s linear;"></div>
        </div>
      </div>

      <!-- Links -->
      <div style="margin-top: auto; text-align: left; font-size: 12px; display: flex; flex-direction: column; gap: 8px;">
        <a href="#" style="color: white; text-decoration: underline;">About bitcoin</a>
        <a href="#" style="color: white; text-decoration: underline;">How to buy bitcoins?</a>
        <a href="#" style="color: #89CFF0; font-size: 14px; font-weight: bold; text-decoration: underline;">Contact Us</a>
      </div>
    </div>

    <!-- Right Content -->
    <div style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
      
      <!-- Top Header -->
      <div style="background-color: #8e0000; color: white; padding: 15px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: bold;">Ooops, your files have been encrypted!</h2>
      </div>
      
      <!-- Scrollable Content -->
      <div style="flex: 1; background-color: white; padding: 20px; overflow-y: auto; color: black; font-size: 13px; line-height: 1.4;">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: bold;">What Happened to My Computer?</h3>
        <p>Your important files are encrypted.<br>
        Many of your documents, photos, videos, databases and other files are no longer accessible because they have been encrypted. Maybe you are busy looking for a way to recover your files, but do not waste your time. Nobody can recover your files without our decryption service.</p>
        
        <h3 style="font-size: 16px; font-weight: bold;">Can I Recover My Files?</h3>
        <p>Sure. We guarantee that you can recover all your files safely and easily. But you have not so enough time.<br>
        You can decrypt some of your files for free. Try now by clicking &lt;Decrypt&gt;.<br>
        But if you want to decrypt all your files, you need to pay.<br>
        You only have 3 days to submit the payment. After that the price will be doubled.<br>
        Also, if you don't pay in 7 days, you won't be able to recover your files forever.<br>
        We will have free events for users who are so poor that they couldn't pay in 6 months.</p>

        <h3 style="font-size: 16px; font-weight: bold;">How Do I Pay?</h3>
        <p>Payment is accepted in Bitcoin only. For more information, click &lt;About bitcoin&gt;.<br>
        Please check the current price of Bitcoin and buy some bitcoins. For more information, click &lt;How to buy bitcoins&gt;.<br>
        And send the correct amount to the address specified in this window.<br>
        After your payment, click &lt;Check Payment&gt;. Best time to check: 9:00am - 11:00am GMT from Monday to Friday.<br>
        Once the payment is checked, you can start decrypting your files immediately.</p>

        <h3 style="font-size: 16px; font-weight: bold;">Contact</h3>
        <p>If you need our assistance, send a message by clicking &lt;Contact Us&gt;.</p>
        
        <p style="color: red; font-weight: bold;">We strongly recommend you to not remove this software, and disable your anti-virus for a while, until you pay and the payment gets processed. If your anti-virus gets updated and removes this software automatically, it will not be able to recover your files even if you pay!</p>
      </div>

      <!-- Bottom Payment Section -->
      <div style="background-color: #8e0000; padding: 10px; display: flex; flex-direction: column; gap: 10px;">
        
        <div style="display: flex; gap: 15px; align-items: center;">
           <div style="background: white; padding: 2px; height: 50px; width: 150px; display: flex; align-items: center; justify-content: center;">
              <span style="color: orange; font-weight: bold; font-size: 20px;">₿ bitcoin</span>
           </div>
           <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: center;">
              <div style="color: yellow; font-weight: bold; font-size: 14px; margin-bottom: 5px;">Send $300 worth of bitcoin to this address:</div>
              <input type="text" value="12t9YDPgwueZ9NyMgw519p7AA8isjr6SMw" readonly style="width: 100%; padding: 5px; font-family: monospace; font-size: 14px; text-align: center;">
           </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 5px; padding: 0 20px;">
          <button id="wc-check-payment" style="padding: 5px 30px; font-weight: bold; font-size: 14px; cursor: pointer;">Check Payment</button>
          <button id="wc-decrypt" style="padding: 5px 30px; font-weight: bold; font-size: 14px; cursor: pointer;">Decrypt</button>
        </div>
      </div>
    </div>
  `;

  // Initialize timers
  const maxTime1 = 3 * 24 * 60 * 60;
  const maxTime2 = 7 * 24 * 60 * 60;
  let timeLeft = maxTime1; // 3 days in seconds
  let timeLeft2 = maxTime2; // 7 days in seconds
  const timer1 = win.querySelector('#wc-timer-1');
  const timer2 = win.querySelector('#wc-timer-2');
  const bar1 = win.querySelector('#wc-bar-1');
  const bar2 = win.querySelector('#wc-bar-2');
  
  const updateTimers = () => {
    if (!win.isConnected) return; // Stop if window closed
    timeLeft--;
    timeLeft2--;
    
    // Helper to format time as DD:HH:MM:SS
    const fmt = (t) => {
       if (t < 0) t = 0;
       const d = Math.floor(t / (24*3600));
       const h = Math.floor((t % (24*3600)) / 3600);
       const m = Math.floor((t % 3600) / 60);
       const s = t % 60;
       return `${d.toString().padStart(2,'0')}:${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };
    
    if(timer1) timer1.textContent = fmt(timeLeft);
    if(timer2) timer2.textContent = fmt(timeLeft2);

    // Update bars
    if (bar1) {
      const pct = Math.max(0, timeLeft / maxTime1);
      bar1.style.height = (pct * 100) + '%';
    }
    if (bar2) {
      const pct = Math.max(0, timeLeft2 / maxTime2);
      bar2.style.height = (pct * 100) + '%';
    }
    
    setTimeout(updateTimers, 1000);
  };
  updateTimers();

  // Button interactions
  const checkBtn = win.querySelector('#wc-check-payment');
  const decryptBtn = win.querySelector('#wc-decrypt');

  checkBtn.addEventListener('click', () => {
    window.openErrorWindow("Payment not found. Please send bitcoin to the address specified.");
  });

  decryptBtn.addEventListener('click', () => {
    window.openErrorWindow("Decryption failed. Payment verification required.");
  });
}


