import { showBSOD } from './bsod.js';

export function initBSODCreator(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = '15px';
  contentArea.style.fontFamily = 'Tahoma, sans-serif';
  contentArea.style.fontSize = '12px';
  contentArea.style.display = 'flex';
  contentArea.style.flexDirection = 'column';
  contentArea.style.gap = '10px';

  win.style.width = '450px';
  win.style.height = 'auto';

  // --- UI Elements ---

  const title = document.createElement('h3');
  title.textContent = 'Create a Custom Blue Screen of Death';
  title.style.marginTop = '0';
  contentArea.appendChild(title);

  const warning = document.createElement('p');
  warning.textContent = 'WARNING: This will take over the entire screen. Press the close button on the BSOD to exit.';
  warning.style.color = 'red';
  warning.style.fontWeight = 'bold';
  contentArea.appendChild(warning);

  // Main error message
  const errorNameLabel = document.createElement('label');
  errorNameLabel.textContent = 'Error Name (e.g., YOUR_ERROR_HERE):';
  const errorNameInput = document.createElement('input');
  errorNameInput.type = 'text';
  errorNameInput.placeholder = 'YOUR_ERROR_HERE';
  errorNameInput.value = 'CUSTOM_BSOD_EXCEPTION';
  contentArea.appendChild(errorNameLabel);
  contentArea.appendChild(errorNameInput);

  // Main text content
  const contentLabel = document.createElement('label');
  contentLabel.textContent = 'Main Content:';
  const contentTextarea = document.createElement('textarea');
  contentTextarea.rows = 4;
  contentTextarea.placeholder = 'A problem has been detected...';
  contentTextarea.value = `A problem has been detected and Windows has been shut down to prevent damage
to your computer.

This BSOD was created by you.

If this is the first time you've seen this error screen,
try not to do it again. If this screen appears again, follow
these steps:

Check to make sure any new hardware or software is properly installed.
If this is a new installation, ask your hardware or software manufacturer
for any Windows updates you might need.`;
  contentArea.appendChild(contentLabel);
  contentArea.appendChild(contentTextarea);

  // STOP Code Parameters
  const stopCodeLabel = document.createElement('label');
  stopCodeLabel.textContent = 'STOP Code Parameters (4 values):';
  const stopCodeContainer = document.createElement('div');
  stopCodeContainer.style.display = 'flex';
  stopCodeContainer.style.gap = '5px';
  const stopCodeInputs = [];
  for (let i = 0; i < 4; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `0x${'0'.repeat(8)}`;
    input.style.width = '100px';
    stopCodeInputs.push(input);
    stopCodeContainer.appendChild(input);
  }
  stopCodeInputs[0].value = '0x000000DEAD';
  stopCodeInputs[1].value = '0x0000BEEF';
  contentArea.appendChild(stopCodeLabel);
  contentArea.appendChild(stopCodeContainer);
  
  // BSOD Color
  const colorContainer = document.createElement('div');
  colorContainer.style.display = 'flex';
  colorContainer.style.alignItems = 'center';
  colorContainer.style.gap = '5px';

  const colorLabel = document.createElement('label');
  colorLabel.htmlFor = 'bsod-color-input';
  colorLabel.textContent = 'Background Color:';
  
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.id = 'bsod-color-input';
  colorInput.value = '#0000aa';
  
  colorContainer.appendChild(colorLabel);
  colorContainer.appendChild(colorInput);
  contentArea.appendChild(colorContainer);

  // Generate button
  const generateBtn = document.createElement('button');
  generateBtn.textContent = 'Generate BSOD';
  generateBtn.style.padding = '10px';
  generateBtn.style.marginTop = '10px';
  generateBtn.style.alignSelf = 'center';
  contentArea.appendChild(generateBtn);

  // --- Logic ---

  generateBtn.addEventListener('click', () => {
    // 1. Get all values from inputs
    const errorName = errorNameInput.value.trim() || 'CUSTOM_BSOD_EXCEPTION';
    const mainContent = contentTextarea.value.trim();
    const stopParams = stopCodeInputs.map(input => input.value.trim() || `0x${'0'.repeat(8)}`).join(', ');
    const color = colorInput.value;

    // 2. Construct the final BSOD content string
    const bsodContent = `${mainContent}

Technical information:

*** STOP: 0x0000008E (${stopParams})

*** ${errorName} - Address F7C7C886 base at F7C7C000, DateStamp 3b7d853b`;

    // 3. Call the global showBSOD function
    showBSOD(bsodContent, () => {
      // This onclose callback is simple: it just runs when the BSOD's close button is clicked.
      // The showBSOD function handles its own removal.
      showNotification("Custom BSOD closed.");
    }, "Close", color);
  });
}