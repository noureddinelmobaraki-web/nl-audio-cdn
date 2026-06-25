let stickFigures = [];
let loopRunning = false;
let attackTarget = null;

// Helper to get desktop boundaries and window obstacles
function getObstacles() {
  const desktop = document.querySelector('.desktop');
  const windows = Array.from(document.querySelectorAll('.window')).filter(w => w.style.display !== 'none').map(w => {
    return {
      left: w.offsetLeft,
      right: w.offsetLeft + w.offsetWidth,
      top: w.offsetTop,
      bottom: w.offsetTop + w.offsetHeight,
      el: w
    };
  });
  return { 
    desktop: { width: desktop.clientWidth, height: desktop.clientHeight }, 
    windows 
  };
}

class StickFigure {
  constructor(color, isHollow = false) {
    this.color = color;
    this.x = Math.random() * (document.querySelector('.desktop').clientWidth - 60) + 30;
    this.y = 50;
    this.vx = 0;
    this.vy = 0;
    this.dir = Math.random() < 0.5 ? 1 : -1;
    this.state = 'fall'; // 'fall', 'walk', 'idle', 'climb', 'drag', 'attack'
    this.stateTimer = 0;
    this.animTime = 0;
    this.currentWindow = null;
    this.climbTarget = null;
    this.isDragging = false;
    this.attackCooldown = 0;

    // Create SVG element
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "60");
    this.svg.setAttribute("height", "80");
    this.svg.setAttribute("viewBox", "-30 -80 60 80");
    this.svg.style.position = "absolute";
    this.svg.style.pointerEvents = "auto";
    this.svg.style.cursor = "grab";
    this.svg.style.zIndex = "9998";
    
    const headFill = isHollow ? 'transparent' : color;
    
    // Create SVG elements using createElementNS for proper namespace handling
    const svgNS = "http://www.w3.org/2000/svg";
    
    this.bodyGroup = document.createElementNS(svgNS, "g");
    this.bodyGroup.id = "bodyGroup";
    
    const head = document.createElementNS(svgNS, "circle");
    head.setAttribute("cx", "0");
    head.setAttribute("cy", "-64");
    head.setAttribute("r", "10");
    head.setAttribute("fill", headFill);
    head.setAttribute("stroke", color);
    head.setAttribute("stroke-width", "4");
    
    const body = document.createElementNS(svgNS, "line");
    body.setAttribute("x1", "0");
    body.setAttribute("y1", "-54");
    body.setAttribute("x2", "0");
    body.setAttribute("y2", "-30");
    body.setAttribute("stroke", color);
    body.setAttribute("stroke-width", "6");
    body.setAttribute("stroke-linecap", "round");
    
    this.armL = document.createElementNS(svgNS, "g");
    this.armL.setAttribute("transform", "translate(0, -46)");
    this.armL.className.baseVal = "armL";
    const armLLine = document.createElementNS(svgNS, "line");
    armLLine.setAttribute("x1", "0");
    armLLine.setAttribute("y1", "0");
    armLLine.setAttribute("x2", "0");
    armLLine.setAttribute("y2", "20");
    armLLine.setAttribute("stroke", color);
    armLLine.setAttribute("stroke-width", "6");
    armLLine.setAttribute("stroke-linecap", "round");
    this.armL.appendChild(armLLine);
    
    this.armR = document.createElementNS(svgNS, "g");
    this.armR.setAttribute("transform", "translate(0, -46)");
    this.armR.className.baseVal = "armR";
    const armRLine = document.createElementNS(svgNS, "line");
    armRLine.setAttribute("x1", "0");
    armRLine.setAttribute("y1", "0");
    armRLine.setAttribute("x2", "0");
    armRLine.setAttribute("y2", "20");
    armRLine.setAttribute("stroke", color);
    armRLine.setAttribute("stroke-width", "6");
    armRLine.setAttribute("stroke-linecap", "round");
    this.armR.appendChild(armRLine);
    
    this.legL = document.createElementNS(svgNS, "g");
    this.legL.setAttribute("transform", "translate(0, -30)");
    this.legL.className.baseVal = "legL";
    const legLLine = document.createElementNS(svgNS, "line");
    legLLine.setAttribute("x1", "0");
    legLLine.setAttribute("y1", "0");
    legLLine.setAttribute("x2", "0");
    legLLine.setAttribute("y2", "30");
    legLLine.setAttribute("stroke", color);
    legLLine.setAttribute("stroke-width", "6");
    legLLine.setAttribute("stroke-linecap", "round");
    this.legL.appendChild(legLLine);
    
    this.legR = document.createElementNS(svgNS, "g");
    this.legR.setAttribute("transform", "translate(0, -30)");
    this.legR.className.baseVal = "legR";
    const legRLine = document.createElementNS(svgNS, "line");
    legRLine.setAttribute("x1", "0");
    legRLine.setAttribute("y1", "0");
    legRLine.setAttribute("x2", "0");
    legRLine.setAttribute("y2", "30");
    legRLine.setAttribute("stroke", color);
    legRLine.setAttribute("stroke-width", "6");
    legRLine.setAttribute("stroke-linecap", "round");
    this.legR.appendChild(legRLine);
    
    this.bodyGroup.appendChild(head);
    this.bodyGroup.appendChild(body);
    this.bodyGroup.appendChild(this.armL);
    this.bodyGroup.appendChild(this.armR);
    this.bodyGroup.appendChild(this.legL);
    this.bodyGroup.appendChild(this.legR);
    
    this.svg.appendChild(this.bodyGroup);
    
    document.querySelector('.desktop').appendChild(this.svg);

    // Make draggable
    const startDrag = (clientX, clientY) => {
      this.isDragging = true;
      this.state = 'drag';
      this.vy = 0;
      this.vx = 0;
      this.dragOffsetX = this.x - clientX;
      this.dragOffsetY = this.y - clientY;
      this.svg.style.cursor = "grabbing";
      this.svg.style.zIndex = "10002";
    };

    this.svg.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      startDrag(e.clientX, e.clientY);
      e.stopPropagation();
    });

    this.svg.addEventListener('touchstart', (e) => {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
      e.stopPropagation();
    }, {passive: false});

    this.mouseMoveHandler = (e) => {
      if (this.isDragging) {
        this.x = e.clientX + this.dragOffsetX;
        this.y = e.clientY + this.dragOffsetY;
      }
    };
    
    this.touchMoveHandler = (e) => {
      if (this.isDragging) {
        this.x = e.touches[0].clientX + this.dragOffsetX;
        this.y = e.touches[0].clientY + this.dragOffsetY;
      }
    };

    this.mouseUpHandler = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.state = 'fall';
        this.currentWindow = null; // Clear window reference when dropped
        this.svg.style.cursor = "grab";
        this.svg.style.zIndex = "9998";
      }
    };

    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('touchmove', this.touchMoveHandler, {passive: false});
    window.addEventListener('mouseup', this.mouseUpHandler);
    window.addEventListener('touchend', this.mouseUpHandler);
  }

  destroy() {
    this.svg.remove();
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('touchmove', this.touchMoveHandler);
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('touchend', this.mouseUpHandler);
  }

  update(dt, obs) {
    if (this.isDragging) {
      this.updateAnimation(dt);
      this.render();
      return;
    }

    // Track if we're in attack mode
    const inAttackMode = attackTarget && document.body.contains(attackTarget);
    let targetX, targetY, dx, dy, dist;
    
    if (inAttackMode) {
      const targetRect = attackTarget.getBoundingClientRect();
      targetX = targetRect.left + targetRect.width / 2;
      targetY = targetRect.top + targetRect.height / 2;
      
      dx = targetX - this.x;
      dy = targetY - this.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      
      // Set direction towards target
      this.dir = dx > 0 ? 1 : -1;
      
      // If close enough, attack
      if (dist < 80) {
        this.state = 'attack';
        
        // Attack cooldown
        if (this.attackCooldown <= 0) {
          this.attackCooldown = 0.5; // Attack every 0.5 seconds
          
          // Damage bonzi by shaking it and trigger dialogue
          if (attackTarget && attackTarget.style) {
            const origTransform = attackTarget.style.transform || '';
            attackTarget.style.transform = 'translate(' + (Math.random() * 20 - 10) + 'px, ' + (Math.random() * 20 - 10) + 'px)';
            setTimeout(() => {
              if (attackTarget && attackTarget.style) attackTarget.style.transform = origTransform;
            }, 100);
            
            // Trigger Bonzi's attacked dialogue
            if (attackTarget && attackTarget.onAttacked) {
              attackTarget.onAttacked();
            }
          }
        }
      } else {
        // Move towards target horizontally
        this.x += this.dir * 180 * dt;
        
        // Set animation state based on movement
        if (this.vy !== 0) {
          // Jumping or falling
          this.state = 'fall';
        } else {
          // Moving on ground
          this.state = 'walk';
        }
        
        // Jump towards target if it's higher
        if (dy < -50 && this.vy === 0 && Math.abs(dx) < 150) {
          this.vy = -1200; // Jump much higher to reach Bonzi/Kinito
        }
      }
    }
    
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    const oldX = this.x;
    const oldY = this.y;

    // Apply gravity and physics for attack mode and normal fall state
    if (this.state === 'fall' || (inAttackMode && this.state !== 'climb')) {
      this.currentWindow = null; // Clear window reference when falling
      this.vy += 1600 * dt; // Gravity
      this.y += this.vy * dt;
      this.x += this.vx * dt;

      // Check ground
      const groundY = obs.desktop.height - 30; // 30px taskbar
      if (this.y >= groundY) {
        this.y = groundY;
        this.vy = 0;
        this.vx = 0;
        if (!inAttackMode) {
          this.state = 'idle';
          this.stateTimer = 1;
        }
      }

      // Check windows for landing
      if (this.vy > 0) {
        for (let win of obs.windows) {
          if (oldY <= win.top && this.y >= win.top) {
            if (this.x >= win.left && this.x <= win.right) {
              this.y = win.top;
              this.vy = 0;
              this.vx = 0;
              if (!inAttackMode) {
                this.state = 'idle';
                this.stateTimer = 1;
              }
              this.currentWindow = win.el;
              break;
            }
          }
        }
      }
    }
    else if (!inAttackMode && (this.state === 'walk' || this.state === 'idle' || this.state === 'attack')) {
      this.stateTimer -= dt;
      
      // State switching
      if (this.stateTimer <= 0) {
        if (this.state === 'idle') {
          this.state = 'walk';
          this.dir = Math.random() < 0.5 ? 1 : -1;
          this.stateTimer = 2 + Math.random() * 3;
        } else {
          this.state = 'idle';
          this.stateTimer = 1 + Math.random() * 2;
        }
      }

      // Walk in non-attack mode
      if (this.state === 'walk') {
        this.x += this.dir * 120 * dt;
      }

      // Boundary checks
      if (this.x < 0) { this.x = 0; this.dir = 1; }
      if (this.x > obs.desktop.width) { this.x = obs.desktop.width; this.dir = -1; }

      // Check surface validity (skip for attack state as it handles its own movement)
      let onSurface = false;
      const groundY = obs.desktop.height - 30;
      
      if (this.currentWindow) {
        // Find current window rect
        const winInfo = obs.windows.find(w => w.el === this.currentWindow);
        if (winInfo) {
          this.y = winInfo.top; // Stick to the moving roof
          if (this.x >= winInfo.left && this.x <= winInfo.right) {
            onSurface = true;
          }
        }
      } else {
        if (this.y >= groundY - 5) {
          this.y = groundY;
          onSurface = true;
        }
      }

      if (!onSurface && !inAttackMode) {
        this.state = 'fall';
        this.currentWindow = null;
      } else if (this.state === 'walk' && !inAttackMode) {
        // Check hitting window walls to climb
        for (let win of obs.windows) {
          if (this.y > win.top && this.y <= win.bottom) {
            if (this.dir > 0 && oldX <= win.left && this.x >= win.left) {
              this.x = win.left;
              this.state = 'climb';
              this.climbTarget = win.el;
              break;
            }
            if (this.dir < 0 && oldX >= win.right && this.x <= win.right) {
              this.x = win.right;
              this.state = 'climb';
              this.climbTarget = win.el;
              break;
            }
          }
        }
      }
    }
    else if (this.state === 'climb') {
      this.y -= 140 * dt;
      const winInfo = obs.windows.find(w => w.el === this.climbTarget);
      
      if (!winInfo) {
        this.state = 'fall'; // Window disappeared
      } else {
        // Keep attached to the side horizontally
        if (this.dir > 0) this.x = winInfo.left;
        if (this.dir < 0) this.x = winInfo.right;

        // Reached the top?
        if (this.y <= winInfo.top) {
          this.y = winInfo.top;
          this.x += this.dir * 20; // Hop onto the roof
          this.state = 'walk';
          this.stateTimer = 2;
          this.currentWindow = winInfo.el;
        }
      }
    }

    this.updateAnimation(dt);
    this.render();
  }

  updateAnimation(dt) {
    this.animTime += dt;
    this.bodyGroup.setAttribute('transform', this.dir < 0 ? 'scale(-1, 1)' : 'scale(1, 1)');

    let aL = 0, aR = 0, lL = 0, lR = 0;

    if (this.state === 'walk') {
      const angle = Math.sin(this.animTime * 15) * 45;
      aL = -angle; aR = angle;
      lL = angle; lR = -angle;
    } else if (this.state === 'idle') {
      const angle = Math.sin(this.animTime * 2) * 5;
      aL = 10 + angle; aR = -10 - angle;
      lL = 5; lR = -5;
    } else if (this.state === 'fall' || this.state === 'drag') {
      const angle = Math.sin(this.animTime * 25) * 40;
      aL = 140 + angle; aR = -140 - angle;
      lL = 20 + angle/2; lR = -20 - angle/2;
    } else if (this.state === 'climb') {
      const angle = Math.sin(this.animTime * 15) * 30;
      aL = -160 + angle; aR = -120 - angle;
      lL = -40 + angle; lR = -40 - angle;
    } else if (this.state === 'attack') {
      const angle = Math.sin(this.animTime * 20) * 60;
      aL = -90 + angle; aR = -90 - angle;
      lL = 10; lR = -10;
    }

    this.armL.setAttribute('transform', `translate(0, -46) rotate(${aL})`);
    this.armR.setAttribute('transform', `translate(0, -46) rotate(${aR})`);
    this.legL.setAttribute('transform', `translate(0, -30) rotate(${lL})`);
    this.legR.setAttribute('transform', `translate(0, -30) rotate(${lR})`);
  }

  render() {
    this.svg.style.left = `${this.x - 30}px`;
    this.svg.style.top = `${this.y - 80}px`;
  }
}

function startPhysicsLoop() {
  if (loopRunning) return;
  loopRunning = true;
  let lastTime = performance.now();
  
  function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1); // cap dt
    lastTime = time;
    
    if (stickFigures.length > 0) {
      const obs = getObstacles();
      stickFigures.forEach(f => f.update(dt, obs));
      requestAnimationFrame(loop);
    } else {
      loopRunning = false;
    }
  }
  requestAnimationFrame(loop);
}

export function spawnStickFigure(color, isHollow = false) {
  stickFigures.push(new StickFigure(color, isHollow));
  startPhysicsLoop();
}

export function clearStickFigures() {
  stickFigures.forEach(f => f.destroy());
  stickFigures = [];
  attackTarget = null;
}

// Global functions for bonzi to trigger attack mode
window.stickFiguresAttackTarget = (target) => {
  attackTarget = target;
  startPhysicsLoop(); // Ensure loop is running
};

window.stickFiguresStopAttack = () => {
  attackTarget = null;
};

export function initStickFigures(win, showNotification) {
  win.style.height = '430px';
  const content = win.querySelector('.window-content');
  content.innerHTML = `
    <div style="padding: 10px; display: flex; flex-direction: column; gap: 10px; font-family: Tahoma, sans-serif;">
      <p style="margin: 0; font-size: 13px;">Spawn Alan Becker-style stick figures to roam your desktop!</p>
      
      <fieldset style="padding: 8px; border: 1px solid #ccc; margin: 0;">
        <legend style="font-weight: bold; font-size: 12px;">Alan Becker Characters</legend>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
          <button class="char-btn" data-c="#000000" data-h="true" style="padding: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="20" viewBox="-10 -10 20 20">
              <circle cx="0" cy="0" r="8" fill="transparent" stroke="#000000" stroke-width="3"/>
            </svg>
            The Chosen One
          </button>
          <button class="char-btn" data-c="#FF0000" data-h="true" style="padding: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="20" viewBox="-10 -10 20 20">
              <circle cx="0" cy="0" r="8" fill="transparent" stroke="#FF0000" stroke-width="3"/>
            </svg>
            The Dark Lord
          </button>
          <button class="char-btn" data-c="#ff6600" data-h="true" style="padding: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="20" viewBox="-10 -10 20 20">
              <circle cx="0" cy="0" r="8" fill="transparent" stroke="#ff6600" stroke-width="3"/>
            </svg>
            The Second Coming
          </button>
          <button class="char-btn" data-c="#CC0000" data-h="false" style="padding: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="20" viewBox="-10 -10 20 20">
              <circle cx="0" cy="0" r="8" fill="#CC0000" stroke="#CC0000" stroke-width="3"/>
            </svg>
            Red
          </button>
          <button class="char-btn" data-c="#33CCFF" data-h="false" style="padding: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="20" viewBox="-10 -10 20 20">
              <circle cx="0" cy="0" r="8" fill="#33CCFF" stroke="#33CCFF" stroke-width="3"/>
            </svg>
            Blue
          </button>
          <button class="char-btn" data-c="#66CC00" data-h="false" style="padding: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="20" viewBox="-10 -10 20 20">
              <circle cx="0" cy="0" r="8" fill="#66CC00" stroke="#66CC00" stroke-width="3"/>
            </svg>
            Green
          </button>
          <button class="char-btn" data-c="#FFCC00" data-h="false" style="padding: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="20" viewBox="-10 -10 20 20">
              <circle cx="0" cy="0" r="8" fill="#FFCC00" stroke="#FFCC00" stroke-width="3"/>
            </svg>
            Yellow
          </button>
          <button class="char-btn" data-c="#980098" data-h="false" style="padding: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="20" viewBox="-10 -10 20 20">
              <circle cx="0" cy="0" r="8" fill="#980098" stroke="#980098" stroke-width="3"/>
            </svg>
            Purple
          </button>
        </div>
      </fieldset>
      
      <fieldset style="padding: 8px; border: 1px solid #ccc; margin: 0;">
        <legend style="font-weight: bold; font-size: 12px;">Custom Stick Figure</legend>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 13px;">Color:</label>
            <input type="color" id="custom-color" value="#000000" style="cursor: pointer; width: 50px; height: 24px;">
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <input type="checkbox" id="custom-hollow" style="cursor: pointer;">
            <label for="custom-hollow" style="font-size: 13px; cursor: pointer;">Hollow Head</label>
          </div>
        </div>
        <button id="spawn-custom-btn" style="width: 100%; padding: 5px; font-weight: bold; cursor: pointer;">Spawn Custom</button>
      </fieldset>
      
      <button id="clear-btn" style="width: 100%; padding: 6px; cursor: pointer;">Clear All Stick Figures</button>
      
      <div style="margin-top: 0; border: 1px inset #ccc; padding: 6px; background: white;">
        <strong>Tips:</strong>
        <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 11px;">
          <li>You can pick them up and drag them around!</li>
          <li>They will walk on the taskbar and open windows.</li>
          <li>They will climb the sides of windows.</li>
        </ul>
      </div>
    </div>
  `;

  content.querySelectorAll('.char-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.c;
      const isHollow = btn.dataset.h === 'true';
      spawnStickFigure(color, isHollow);
      showNotification(`Spawned ${btn.textContent}!`);
    });
  });

  const spawnCustomBtn = content.querySelector('#spawn-custom-btn');
  const colorInput = content.querySelector('#custom-color');
  const hollowInput = content.querySelector('#custom-hollow');
  
  spawnCustomBtn.addEventListener('click', () => {
    spawnStickFigure(colorInput.value, hollowInput.checked);
    showNotification("Spawned a custom stick figure!");
  });

  const clearBtn = content.querySelector('#clear-btn');
  clearBtn.addEventListener('click', () => {
    clearStickFigures();
    showNotification("Cleared all stick figures.");
  });
}