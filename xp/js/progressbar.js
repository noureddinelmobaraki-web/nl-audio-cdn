import { showContextMenu } from "./contextMenu.js";
import { showBSOD as showGlobalBSOD } from './bsod.js';

export function initProgressbar(showNotification) {
  if (window.progressbarActive) {
    showNotification("Progressbar is already running!");
    return;
  }

  window.progressbarActive = true;

  const desktop = document.querySelector('.desktop');

  const gameContainer = document.createElement('div');
  gameContainer.id = 'progressbar-game';
  gameContainer.style.position = 'absolute';
  gameContainer.style.top = '0';
  gameContainer.style.left = '0';
  gameContainer.style.width = '100%';
  gameContainer.style.height = '100%';
  gameContainer.style.zIndex = '900'; 
  gameContainer.style.pointerEvents = 'none'; 
  desktop.appendChild(gameContainer);

  const scoreDisplay = document.createElement('div');
  scoreDisplay.id = 'progressbar-score';
  scoreDisplay.style.position = 'absolute';
  scoreDisplay.style.top = '50px';
  scoreDisplay.style.left = '50%';
  scoreDisplay.style.transform = 'translateX(-50%)';
  scoreDisplay.style.color = 'white';
  scoreDisplay.style.fontSize = '24px';
  scoreDisplay.style.fontWeight = 'bold';
  scoreDisplay.style.textShadow = '2px 2px 4px black';
  gameContainer.appendChild(scoreDisplay);

  const levelDisplay = document.createElement('div');
  levelDisplay.id = 'progressbar-level';
  levelDisplay.style.position = 'absolute';
  levelDisplay.style.top = '20px';
  levelDisplay.style.left = '50%';
  levelDisplay.style.transform = 'translateX(-50%)';
  levelDisplay.style.color = 'white';
  levelDisplay.style.fontSize = '18px';
  levelDisplay.style.textShadow = '2px 2px 4px black';
  gameContainer.appendChild(levelDisplay);

  const progressBarContainer = document.createElement('div');
  progressBarContainer.id = 'progressbar-player';
  progressBarContainer.style.position = 'absolute';
  progressBarContainer.style.width = '200px';
  progressBarContainer.style.height = '20px';
  progressBarContainer.style.border = '2px solid white';
  progressBarContainer.style.backgroundColor = '#333';
  progressBarContainer.style.left = 'calc(50% - 100px)';
  progressBarContainer.style.bottom = '50px';
  progressBarContainer.style.cursor = 'grab';
  progressBarContainer.style.pointerEvents = 'auto'; 
  gameContainer.appendChild(progressBarContainer);

  const progressBarFill = document.createElement('div');
  progressBarFill.id = 'progressbar-fill';
  progressBarFill.style.display = 'flex'; // Use flexbox for segments
  progressBarFill.style.width = '0%'; // Start at 0 width
  progressBarFill.style.height = '100%';
  progressBarFill.style.backgroundColor = '#0000ff'; // Fallback color
  progressBarContainer.appendChild(progressBarFill);
  
  const startMessage = document.createElement('div');
  startMessage.id = 'progressbar-start-message';
  startMessage.style.position = 'absolute';
  startMessage.style.top = '50%';
  startMessage.style.left = '50%';
  startMessage.style.transform = 'translate(-50%, -50%)';
  startMessage.style.color = 'white';
  startMessage.style.fontSize = '32px';
  startMessage.style.textAlign = 'center';
  startMessage.style.textShadow = '2px 2px 4px black';
  startMessage.style.display = 'none'; // Initially hidden
  startMessage.style.pointerEvents = 'auto'; // Make it clickable
  gameContainer.appendChild(startMessage);

  let level = 1;
  let score = 0;
  let progress = 0;
  let isGameOver = false;
  let gameLoopId;
  let fallingBars = [];
  let isGameRunning = false;
  let spawnInterval = 1000;
  let segments = [];

  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function updateUI() {
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
    
    // Update the total width of the progress bar fill container
    progressBarFill.style.width = `${progress}%`;
    
    // Rebuild the segments inside
    progressBarFill.innerHTML = '';
    if (progress > 0) {
      segments.forEach(segment => {
        const segmentDiv = document.createElement('div');
        segmentDiv.style.height = '100%';
        // The width of each segment is relative to the total progress.
        // E.g., if progress is 20 and a segment width is 5, it should be 5/20 = 25% of the filled bar.
        segmentDiv.style.width = `${(segment.width / progress) * 100}%`;
        segmentDiv.style.backgroundColor = segment.color;
        progressBarFill.appendChild(segmentDiv);
      });
    }
  }

  function spawnBar() {
    if (!isGameRunning) return;

    // Create a container for the falling item (text + bar)
    const fallingItemContainer = document.createElement('div');
    fallingItemContainer.style.position = 'absolute';
    fallingItemContainer.style.left = `${Math.random() * (desktop.clientWidth - 20)}px`;
    fallingItemContainer.style.top = '-40px'; // Start higher to accommodate text
    fallingItemContainer.style.display = 'flex';
    fallingItemContainer.style.flexDirection = 'column';
    fallingItemContainer.style.alignItems = 'center';

    const bar = document.createElement('div');
    const barTypeRoll = Math.random() * 100;
    let type = 'blue';
    let color = '#0000ff'; 
    let bonusAmount = 0;

    if (barTypeRoll < 2) { 
        type = 'green';
        color = '#2ecc71';
    } else if (barTypeRoll < 12) { 
        type = 'red';
        color = '#e74c3c';
    } else if (barTypeRoll < 27) { 
        type = 'yellow';
        color = '#f1c40f';
    } else if (barTypeRoll < 42) { 
        type = 'lightblue';
        color = '#34d5db';
        bonusAmount = Math.random() < 0.5 ? 2 : 3;
    }
    
    bar.style.width = '10px';
    bar.style.height = '20px';
    bar.style.backgroundColor = color;
    
    if (type === 'lightblue') {
        const textLabel = document.createElement('div');
        textLabel.textContent = `x${bonusAmount}`;
        textLabel.style.color = 'white';
        textLabel.style.textAlign = 'center';
        textLabel.style.lineHeight = '20px';
        textLabel.style.fontSize = '12px';
        textLabel.style.fontWeight = 'bold';
        textLabel.style.textShadow = '1px 1px 2px black';
        fallingItemContainer.appendChild(textLabel);
    }
    
    fallingItemContainer.appendChild(bar);
    gameContainer.appendChild(fallingItemContainer);
    fallingBars.push({ element: fallingItemContainer, type: type, y: -40, speed: 2 + level * 0.5, bonus: bonusAmount });
  }

  function gameLoop() {
    if (isGameOver) return;
    fallingBars.forEach((bar, index) => {
      bar.y += bar.speed;
      bar.element.style.top = `${bar.y}px`;

      const barRect = bar.element.getBoundingClientRect();
      const playerRect = progressBarContainer.getBoundingClientRect();
      
      if (
        barRect.bottom >= playerRect.top &&
        barRect.top <= playerRect.bottom &&
        barRect.left <= playerRect.right &&
        barRect.right >= playerRect.left
      ) {
        handleCollision(bar, index);
      }

      if (bar.y > desktop.clientHeight) {
        bar.element.remove();
        fallingBars.splice(index, 1);
      }
    });

    gameLoopId = requestAnimationFrame(gameLoop);
  }

  function handleCollision(bar, index) {
    switch (bar.type) {
      case 'blue':
        progress = Math.min(100, progress + 5);
        segments.push({ width: 5, color: '#0000ff' });
        score += 10;
        break;
      case 'yellow':
        progress = Math.min(100, progress + 5);
        segments.push({ width: 5, color: '#f1c40f' });
        break;
      case 'red':
        endGame('You hit a red bar!');
        return;
      case 'green':
        progress = 100;
        segments.push({ width: 100 - progress, color: '#2ecc71' });
        score += 50;
        break;
      case 'lightblue':
        const bonus = bar.bonus * 5;
        const remainingProgress = 100 - progress;
        const actualBonus = Math.min(bonus, remainingProgress);
        progress += actualBonus;
        for (let i = 0; i < actualBonus / 5; i++) {
          segments.push({ width: 5, color: '#0000ff' });
        }
        score += 25;
        break;
    }
    
    bar.element.remove();
    fallingBars.splice(index, 1);
    updateUI();
    
    if (progress >= 100) {
      nextLevel();
    }
  }

  function nextLevel() {
    level++;
    progress = 0;
    segments = [];
    spawnInterval = Math.max(200, 1000 - level * 50);
    showNotification(`Level ${level}!`);
    updateUI();
  }

  function winGame() {
    endGame("YOU WIN! CONGRATULATIONS!");
  }

  function showBSOD() {
    // Hide the game container to show BSOD on top of a clean desktop
    gameContainer.style.display = 'none';

    const bsodContent = `A problem has been detected and Progressbar has been shut down to prevent damage
to your computer.

GAME_OVER_EXCEPTION

If this is the first time you've seen this error screen,
try to avoid the red bars next time. If this screen appears again, follow
these steps:

Check your reflexes and try again.
If problems continue, maybe take a break.

Technical information:

*** STOP: 0x000000DEAD (0xBAD_SCORE, 0xRED_BAR, 0xTRY_AGAIN, 0x00000000)`;

    showGlobalBSOD(bsodContent, () => {
        // After closing BSOD, show the end game menu again, but without triggering another BSOD.
        gameContainer.style.display = 'block'; 
        endGame('You lost!', true); // Pass a flag to prevent re-triggering the BSOD
    }, 'Close');
  }

  function endGame(message, fromBSOD = false) {
    isGameOver = true;
    isGameRunning = false;
    cancelAnimationFrame(gameLoopId);
    
    // If a red bar was hit, show BSOD first, but not if we came from the BSOD itself
    if (message.includes('red bar') && !fromBSOD && !document.getElementById('progressbar-bsod')) {
      showBSOD();
      return;
    }

    showNotification(message);
    
    startMessage.innerHTML = `
      ${message}<br>
      <div style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
        <button id="progressbar-start-btn" style="font-size: 20px; padding: 10px 20px;">Play Again</button>
        <button id="progressbar-exit-btn" style="font-size: 20px; padding: 10px 20px;">Exit</button>
      </div>
    `;
    startMessage.style.display = 'block';
    
    const startBtn = document.getElementById('progressbar-start-btn');
    if (startBtn) {
      startBtn.onclick = startGame;
    }
    
    const exitBtn = document.getElementById('progressbar-exit-btn');
    if (exitBtn) {
      exitBtn.onclick = cleanup;
    }
  }
  
  function cleanup() {
    isGameRunning = false;
    isGameOver = true;
    cancelAnimationFrame(gameLoopId);
    gameContainer.remove();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchend', onTouchEnd);
    window.progressbarActive = false; 
  }

  progressBarContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - progressBarContainer.offsetLeft;
    dragOffsetY = e.clientY - progressBarContainer.offsetTop;
    progressBarContainer.style.cursor = 'grabbing';
  });

  progressBarContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.showContextMenu(e.clientX, e.clientY, [
      {
        label: 'Exit',
        action: cleanup
      }
    ]);
  });

  progressBarContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    dragOffsetX = e.touches[0].clientX - progressBarContainer.offsetLeft;
    dragOffsetY = e.touches[0].clientY - progressBarContainer.offsetTop;
  }, { passive: true });

  const onMouseMove = (e) => {
    if (!isDragging) return;
    let newLeft = e.clientX - dragOffsetX;
    let newTop = e.clientY - dragOffsetY;
    const visibleWidth = 20;
    const visibleHeight = 5;
    newLeft = Math.max(-(progressBarContainer.offsetWidth - visibleWidth), Math.min(desktop.clientWidth - visibleWidth, newLeft));
    newTop = Math.max(-(progressBarContainer.offsetHeight - visibleHeight), Math.min(desktop.clientHeight - visibleHeight, newTop));
    progressBarContainer.style.left = `${newLeft}px`;
    progressBarContainer.style.top = `${newTop}px`;
    progressBarContainer.style.bottom = 'auto'; // Override bottom style
  };
  const onTouchMove = (e) => {
    if (!isDragging) return;
    let newLeft = e.touches[0].clientX - dragOffsetX;
    let newTop = e.touches[0].clientY - dragOffsetY;
    const visibleWidth = 20;
    const visibleHeight = 5;
    newLeft = Math.max(-(progressBarContainer.offsetWidth - visibleWidth), Math.min(desktop.clientWidth - visibleWidth, newLeft));
    newTop = Math.max(-(progressBarContainer.offsetHeight - visibleHeight), Math.min(desktop.clientHeight - visibleHeight, newTop));
    progressBarContainer.style.left = `${newLeft}px`;
    progressBarContainer.style.top = `${newTop}px`;
    progressBarContainer.style.bottom = 'auto'; // Override bottom style
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      progressBarContainer.style.cursor = 'grab';
    }
  };

  const onTouchEnd = () => {
    if (isDragging) {
      isDragging = false;
    }
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('touchend', onTouchEnd);

  function startGame() {
    startMessage.style.display = 'none';
    isGameRunning = true;
    isGameOver = false;
    level = 1;
    score = 0;
    progress = 0;
    segments = [];
    fallingBars.forEach(bar => bar.element.remove());
    fallingBars = [];
    spawnInterval = 1000;
    updateUI();
    
    function scheduleSpawn() {
        if (!isGameRunning) return;
        spawnBar();
        setTimeout(scheduleSpawn, spawnInterval);
    }

    scheduleSpawn();
    gameLoop();
  }
  
  // Start the game immediately
  startGame();

  window.progressbarCleanup = cleanup;
}