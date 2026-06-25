export function showBSOD(content, onclose, buttonText = "Close", color = "#0000aa") {
  // Hide game container if it exists
  const gameContainer = document.getElementById('progressbar-game');
  if (gameContainer) {
    gameContainer.style.display = 'none';
  }

  // Remove any existing BSOD
  const existingBsod = document.getElementById('bsod-screen');
  if (existingBsod) {
    existingBsod.remove();
  }

  const bsod = document.createElement('div');
  bsod.id = 'bsod-screen';
  bsod.style.position = "fixed";
  bsod.style.top = "0";
  bsod.style.left = "0";
  bsod.style.width = "100%";
  bsod.style.height = "100%";
  bsod.style.backgroundColor = color;
  bsod.style.color = "white";
  bsod.style.fontFamily = "Courier New, monospace";
  bsod.style.fontSize = "16px";
  bsod.style.padding = "50px";
  bsod.style.boxSizing = "border-box";
  bsod.style.zIndex = "10000";
  bsod.style.cursor = "default";
  bsod.style.pointerEvents = 'all';

  bsod.innerHTML = `<div style="white-space: pre-wrap; background-color: transparent;">${content}</div>`;
  
  if (onclose) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = "30px";
    buttonContainer.style.textAlign = "center";
    
    const closeBtn = document.createElement('button');
    closeBtn.id = "bsod-close-btn";
    closeBtn.textContent = buttonText;
    closeBtn.style.padding = "10px 20px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "16px";
    closeBtn.style.background = color;
    closeBtn.style.color = 'white';
    closeBtn.style.border = '1px solid white';
    
    buttonContainer.appendChild(closeBtn);
    bsod.appendChild(buttonContainer);

    closeBtn.addEventListener('click', () => {
        bsod.remove();
        onclose();
    });
  }
  
  document.body.appendChild(bsod);
  return bsod; // return the element for further manipulation if needed
}