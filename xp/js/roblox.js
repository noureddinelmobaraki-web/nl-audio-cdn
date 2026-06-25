import * as THREE from 'https://esm.sh/three@0.132.2';
import { PointerLockControls } from 'https://esm.sh/three@0.132.2/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OBB } from 'https://esm.sh/three@0.132.2/examples/jsm/math/OBB.js';

export async function initRoblox(win, showNotification) {
  const contentArea = win.querySelector('.window-content') || win.querySelector('.window-body');
  contentArea.innerHTML = "";
  contentArea.style.flex = "1";
  contentArea.style.position = "relative";
  contentArea.style.height = "100%";
  contentArea.style.padding = "0";

  const rendererContainer = document.createElement('div');
  rendererContainer.style.width = "100%";
  rendererContainer.style.height = "100%";
  rendererContainer.style.position = "absolute";
  contentArea.appendChild(rendererContainer);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
  rendererContainer.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const skybox = cubeTextureLoader.load([
    'null_plainsky512_rt.jpg',
    'null_plainsky512_lf.jpg',
    'null_plainsky512_up.jpg',
    'null_plainsky512_dn.jpg',
    'null_plainsky512_ft.jpg',
    'null_plainsky512_bk.jpg'
  ]);
  scene.background = skybox;

  // Initialize OBB map early to avoid temporal dead zone on first registerOBB call
  const obbLocals = new Map();

  const camera = new THREE.PerspectiveCamera(
    75,
    rendererContainer.clientWidth / rendererContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(50, 50, 25);
  scene.add(directionalLight);

  const room = new WebsimSocket();
  await room.initialize();
  const otherPlayers = new Map();

  const textureLoader = new THREE.TextureLoader();
  const topTexture = textureLoader.load('roblox-stud.png');
  topTexture.magFilter = THREE.LinearFilter;
  topTexture.minFilter = THREE.LinearMipMapLinearFilter;
  topTexture.wrapS = THREE.RepeatWrapping;
  topTexture.wrapT = THREE.RepeatWrapping;
  topTexture.repeat.set(4, 4);

  const bottomTexture = textureLoader.load('roblox-stud-underside.png');
  bottomTexture.magFilter = THREE.LinearFilter;
  bottomTexture.minFilter = THREE.LinearMipMapLinearFilter;
  bottomTexture.wrapS = THREE.RepeatWrapping;
  bottomTexture.wrapT = THREE.RepeatWrapping;
  bottomTexture.repeat.set(4, 4);

  function createBlockMaterials(baseColor) {
    return [
      new THREE.MeshPhongMaterial({ color: baseColor }),
      new THREE.MeshPhongMaterial({ color: baseColor }),
      new THREE.MeshPhongMaterial({ map: topTexture, color: baseColor, transparent: true }),
      new THREE.MeshPhongMaterial({ map: bottomTexture, color: baseColor, transparent: true }),
      new THREE.MeshPhongMaterial({ color: baseColor }),
      new THREE.MeshPhongMaterial({ color: baseColor })
    ];
  }

  const groundGeo = new THREE.BoxGeometry(50, 1, 50);
  const groundMaterials = createBlockMaterials(0x00aa00);
  const ground = new THREE.Mesh(groundGeo, groundMaterials);
  ground.position.set(25, -0.5, 25);
  scene.add(ground);
  registerOBB(ground);

  const platforms = [];

  let startX = 2, startZ = 2;
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.BoxGeometry(4, 1, 4);
    const platformMaterials = createBlockMaterials(0x00aa00);
    const platform = new THREE.Mesh(geo, platformMaterials);
    platform.position.set(startX, i * 2 + 1, startZ);
    platforms.push(platform);
    scene.add(platform);
    registerOBB(platform);
    startX += 3;
    startZ += 3;
  }

  const islandPositions = [
    { x: 30, y: 10, z: 10, size: 8 },
    { x: 40, y: 15, z: 30, size: 6 },
    { x: 15, y: 12, z: 35, size: 7 },
    { x: 8, y: 8, z: 45, size: 5 }
  ];

  islandPositions.forEach(island => {
    const geo = new THREE.BoxGeometry(island.size, 1, island.size);
    const platformMaterials = createBlockMaterials(0x00aa00);
    const platform = new THREE.Mesh(geo, platformMaterials);
    platform.position.set(island.x, island.y, island.z);
    platforms.push(platform);
    scene.add(platform);
    registerOBB(platform);
  });
  // Extra approach platforms toward the goal
  const approachIslands = [
    { x: 20, y: 12, z: 45, size: 4 },
    { x: 30, y: 16, z: 45, size: 4 },
    { x: 40, y: 18, z: 45, size: 4 },
  ];
  approachIslands.forEach(island => {
    const geo = new THREE.BoxGeometry(island.size, 1, island.size);
    const mats = createBlockMaterials(0x00aa00);
    const mesh = new THREE.Mesh(geo, mats);
    mesh.position.set(island.x, island.y, island.z);
    platforms.push(mesh); scene.add(mesh); registerOBB(mesh);
  });

  const bridges = [
    { start: { x: 30, y: 10, z: 10 }, end: { x: 40, y: 15, z: 30 }, width: 2 },
    { start: { x: 40, y: 15, z: 30 }, end: { x: 15, y: 12, z: 35 }, width: 2 },
    { start: { x: 15, y: 12, z: 35 }, end: { x: 8, y: 8, z: 45 }, width: 2 },
    { start: { x: 8, y: 8, z: 45 }, end: { x: 20, y: 12, z: 45 }, width: 2 },
    { start: { x: 20, y: 12, z: 45 }, end: { x: 30, y: 16, z: 45 }, width: 2 },
    { start: { x: 30, y: 16, z: 45 }, end: { x: 40, y: 18, z: 45 }, width: 2 }
  ];

  bridges.forEach(bridge => {
    const dx = bridge.end.x - bridge.start.x;
    const dy = bridge.end.y - bridge.start.y;
    const dz = bridge.end.z - bridge.start.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    const slope = Math.atan2(dy, length);

    const geo = new THREE.BoxGeometry(length, 0.5, bridge.width);
    const bridgeMaterials = createBlockMaterials(0xaaaaaa);
    const bridgeMesh = new THREE.Mesh(geo, bridgeMaterials);

    bridgeMesh.position.set(
      bridge.start.x + dx/2,
      bridge.start.y + dy/2,
      bridge.start.z + dz/2
    );

    bridgeMesh.rotation.y = angle;
    bridgeMesh.rotation.x = slope;

    platforms.push(bridgeMesh);
    scene.add(bridgeMesh);
    registerOBB(bridgeMesh);
  });

  const hazards = [];

  for (let i = 0; i < 6; i++) {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const hazardMaterials = createBlockMaterials(0xff0000);
    const hazard = new THREE.Mesh(geo, hazardMaterials);
    hazard.position.set(5 + i * 3, i * 2 + 2, 5 + i * 3);
    hazards.push(hazard);
    scene.add(hazard);
    registerOBB(hazard);
  }

  const hazardFields = [
    { x: 25, y: 11, z: 15, count: 5 },
    { x: 35, y: 16, z: 25, count: 4 },
    { x: 20, y: 13, z: 40, count: 6 }
  ];

  hazardFields.forEach(field => {
    for (let i = 0; i < field.count; i++) {
      const geo = new THREE.BoxGeometry(2, 2, 2);
      const hazardMaterials = createBlockMaterials(0xff0000);
      const hazard = new THREE.Mesh(geo, hazardMaterials);
      hazard.position.set(
        field.x + (Math.random() - 0.5) * 8,
        field.y,
        field.z + (Math.random() - 0.5) * 8
      );
      hazards.push(hazard);
      scene.add(hazard);
      registerOBB(hazard);
    }
  });

  const movingHazards = [];
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const hazardMaterials = createBlockMaterials(0xff4500);
    const hazard = new THREE.Mesh(geo, hazardMaterials);
    hazard.position.set(20 + i * 10, 10 + i * 2, 20 + i * 5);
    hazard.userData.speed = 0.05;
    hazard.userData.distance = 5;
    hazard.userData.originalX = hazard.position.x;
    hazard.userData.originalZ = hazard.position.z;
    hazard.userData.angle = Math.random() * Math.PI * 2;
    movingHazards.push(hazard);
    hazards.push(hazard);
    scene.add(hazard);
    registerOBB(hazard);
  }

  const goalGeo = new THREE.BoxGeometry(6, 1, 6);
  const goalMaterials = createBlockMaterials(0x0000ff);
  const goal = new THREE.Mesh(goalGeo, goalMaterials);
  goal.position.set(40, 20, 45);
  scene.add(goal);

  const decorations = [];
  const decorativePositions = [
    { x: 10, y: 0.5, z: 10 },
    { x: 20, y: 10.5, z: 20 },
    { x: 35, y: 15.5, z: 35 },
    { x: 5, y: 0.5, z: 40 }
  ];

  decorativePositions.forEach(pos => {
    const geo = new THREE.CylinderGeometry(0.5, 1, 3, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const decoration = new THREE.Mesh(geo, material);
    decoration.position.set(pos.x, pos.y, pos.z);
    decoration.rotation.y = Math.random() * Math.PI;
    decorations.push(decoration);
    scene.add(decoration);
  });

  let playerModel;
  const playerObject = new THREE.Object3D();
  const startPosition = new THREE.Vector3(1, 5, 1);
  playerObject.position.copy(startPosition);
  scene.add(playerObject);

  const loader = new GLTFLoader();
  loader.load('roblox_noob.glb', (gltf) => {
    playerModel = gltf.scene;
    playerModel.scale.set(0.4, 0.4, 0.4);
    playerModel.position.y = 0;
    playerObject.add(playerModel);

    broadcastPresence();
    showNotification("Roblox character loaded!");
  });

  async function createPlayerModel() {
    return new Promise((resolve) => {
      loader.load('roblox_noob.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.4, 0.4, 0.4);
        model.position.y = 0;
        resolve(model);
      });
    });
  }

  // Raycaster for ground snapping
  const raycaster = new THREE.Raycaster();
  const collidableGround = [...platforms, ground]; // exclude hazards

  function snapToGroundIfClose(position) {
    // Don't snap while moving upward (e.g., just jumped)
    if (velocityY > 0.001) return false;
    if (snapLockMs > 0) return false;
    // Lower origin to reduce grabbing high tops at edges
    const origin = new THREE.Vector3(position.x, position.y + 0.6, position.z);
    raycaster.set(origin, new THREE.Vector3(0, -1, 0));
    const intersects = raycaster.intersectObjects(collidableGround, false);
    if (intersects.length > 0) {
      const hit = intersects[0];
      // Only snap to mostly upward-facing surfaces
      const upDot = hit.face?.normal?.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)).y ?? 1;
      if (upDot < 0.6) return false;
      const stepThreshold = 0.8; // max rise allowed per step
      const targetY = hit.point.y;
      const deltaY = targetY - position.y;
      // Must be near vertically and horizontally to prevent edge over-snap
      const horizDist = Math.hypot(hit.point.x - position.x, hit.point.z - position.z);
      if (deltaY > -0.05 && deltaY <= stepThreshold && horizDist <= 0.6) {
        const maxSnapUp = 0.35;
        if (deltaY > 0) {
          position.y += Math.min(deltaY, maxSnapUp);
        } else {
          position.y = targetY;
        }
        velocityY = 0;
        canJump = true;
        return true;
      }
    }
    return false;
  }

  const cameraTarget = new THREE.Vector3(0, 0, 0);
  const cameraTargetOffset = new THREE.Vector3(0, 1, 0);
  const cameraOffset = new THREE.Vector3();
  let isRightMouseDown = false;
  let mouseX = 0, mouseY = 0;
  let cameraAngle = 0;
  let cameraVerticalAngle = 0;
  let cameraDistance = 5;

  const moveSpeed = 7.0;
  const GRAVITY = -30;
  const jumpSpeed = 12;
  let velocityY = 0;
  let canJump = false;
  const playerRadius = 0.3;
  const playerHeight = 2;
  const stepHeight = 0.8; // allow stepping up small ledges/slopes
  let snapLockMs = 0; // prevent snapping shortly after jumping

  /* OBB setup for accurate collisions */
  function registerOBB(mesh) {
    const geom = mesh.geometry;
    if (!geom.boundingBox) geom.computeBoundingBox();
    const bb = geom.boundingBox;
    const center = bb.getCenter(new THREE.Vector3());
    const halfSize = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);
    obbLocals.set(mesh, new OBB(center.clone(), halfSize.clone()));
  }

  function collidesWithObject(position, objects) {
    // Capsule-like: sample along vertical segment from feet to head
    const footY = position.y + playerRadius;
    const headY = position.y + (playerHeight - playerRadius);
    const samples = 5;
    const centers = [];
    for (let i = 0; i < samples; i++) {
      const t = samples === 1 ? 0 : i / (samples - 1);
      centers.push(new THREE.Vector3(position.x, footY + t * (headY - footY), position.z));
    }
    for (const mesh of objects) {
      const localOBB = obbLocals.get(mesh);
      if (!localOBB) continue;
      const worldOBB = localOBB.clone(); worldOBB.applyMatrix4(mesh.matrixWorld);
      for (const c of centers) { if (worldOBB.intersectsSphere(new THREE.Sphere(c, playerRadius))) return true; }
    }
    for (const [id, otherModel] of otherPlayers) {
      if (id !== room.clientId) {
        const box = new THREE.Box3().setFromObject(otherModel);
        for (const c of centers) { if (box.containsPoint(c)) return true; }
      }
    }
    return false;
  }

  // Kill-block detection using OBB intersection
  function touchesHazard(position) { return collidesWithObject(position, hazards); }

  function broadcastPresence() {
    if (playerObject && playerModel && isWindowOpen) { 
      room.updatePresence({
        position: {
          x: playerObject.position.x,
          y: playerObject.position.y,
          z: playerObject.position.z
        },
        rotation: playerModel.rotation.y
      });
    }
  }

  const unsubscribePresence = room.subscribePresence(async (currentPresence) => {
    const currentPeerIds = Object.keys(currentPresence); 
    const handledPlayerIds = new Set();

    for (const clientId in currentPresence) {
      if (clientId === room.clientId) continue; 

      handledPlayerIds.add(clientId);
      const playerData = currentPresence[clientId];

      if (playerData && playerData.position && playerData.rotation !== undefined) {
        if (!otherPlayers.has(clientId)) {
          const newPlayerModel = await createPlayerModel();
          scene.add(newPlayerModel);
          otherPlayers.set(clientId, newPlayerModel);
          console.log(`Player ${clientId} joined/appeared`);
        }

        const model = otherPlayers.get(clientId);
        if (model) {
          model.position.set(playerData.position.x, playerData.position.y, playerData.position.z);
          model.rotation.y = playerData.rotation;
        }
      } else {
        if (otherPlayers.has(clientId)) {
          const modelToRemove = otherPlayers.get(clientId);
          scene.remove(modelToRemove);
          otherPlayers.delete(clientId);
          console.log(`Player ${clientId} left/disappeared (invalid data)`);
        }
      }
    }

    otherPlayers.forEach((model, clientId) => {
      if (!handledPlayerIds.has(clientId)) {
        scene.remove(model);
        otherPlayers.delete(clientId);
        console.log(`Player ${clientId} left/disappeared (removed from presence)`);
      }
    });
  });

  const oofSound = new Audio("oof.mp3");
  const jumpSound = new Audio("roblox-classic-jump.mp3");

  const keysPressed = {};
  const onKeyDown = (e) => {
    keysPressed[e.code] = true;
    // Handle jump separately
    if (e.code === 'Space' && canJump) {
      velocityY = jumpSpeed;
      canJump = false;
      snapLockMs = 250; // lock snapping for 250ms after jump
      jumpSound.play().catch(err => {
        console.warn('Could not play jump sound:', err);
      });
    }
    // Map arrow keys to WASD keys for movement
    switch (e.code) {
      case 'ArrowUp': keysPressed['KeyW'] = true; break;
      case 'ArrowDown': keysPressed['KeyS'] = true; break;
      case 'ArrowLeft': keysPressed['KeyA'] = true; break;
      case 'ArrowRight': keysPressed['KeyD'] = true; break;
    }
  };
  const onKeyUp = (e) => { 
    keysPressed[e.code] = false; 
    // Also unset the mapped WASD key when arrow key is released
    switch (e.code) {
      case 'ArrowUp': keysPressed['KeyW'] = false; break;
      case 'ArrowDown': keysPressed['KeyS'] = false; break;
      case 'ArrowLeft': keysPressed['KeyA'] = false; break;
      case 'ArrowRight': keysPressed['KeyD'] = false; break;
    }
  };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
      isRightMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
      isRightMouseDown = false;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isRightMouseDown) {
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      cameraAngle -= deltaX * 0.01;
      cameraVerticalAngle += deltaY * 0.01;
      cameraVerticalAngle = Math.max(-Math.PI / 2 + 0.2, Math.min(Math.PI / 2 - 0.2, cameraVerticalAngle));
    }
  });

  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  // Add wheel listener for zoom
  renderer.domElement.addEventListener('wheel', (e) => {
    cameraDistance += e.deltaY * 0.01;
    cameraDistance = Math.max(2, Math.min(15, cameraDistance));
  });

  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  });
  resizeObserver.observe(rendererContainer);

  let lastBroadcastTime = 0;
  const BROADCAST_INTERVAL = 50;

  let animationFrameId = null; 
  let isWindowOpen = true; 

  let prevTime = performance.now();
  function animate() {
    if (!isWindowOpen) {
      cancelAnimationFrame(animationFrameId);
      return;
    }

    animationFrameId = requestAnimationFrame(animate); 

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;
    if (snapLockMs > 0) snapLockMs = Math.max(0, snapLockMs - delta * 1000);

    movingHazards.forEach(hazard => {
      hazard.userData.angle += hazard.userData.speed;
      hazard.position.x = hazard.userData.originalX + Math.cos(hazard.userData.angle) * hazard.userData.distance;
      hazard.position.z = hazard.userData.originalZ + Math.sin(hazard.userData.angle) * hazard.userData.distance;
    });

    let moveX = 0, moveZ = 0;
    const speed = moveSpeed * delta;

    if (keysPressed['KeyW']) {
      moveX -= Math.sin(cameraAngle) * speed;
      moveZ -= Math.cos(cameraAngle) * speed;
    }
    if (keysPressed['KeyS']) {
      moveX += Math.sin(cameraAngle) * speed;
      moveZ += Math.cos(cameraAngle) * speed;
    }
    if (keysPressed['KeyA']) {
      moveX -= Math.cos(cameraAngle) * speed;
      moveZ += Math.sin(cameraAngle) * speed;
    }
    if (keysPressed['KeyD']) {
      moveX += Math.cos(cameraAngle) * speed;
      moveZ -= Math.sin(cameraAngle) * speed;
    }

    const newPosition = playerObject.position.clone();

    // Horizontal X with slight lift to avoid ground false-positive
    newPosition.x += moveX;
    const colliders = [...platforms, ground];
    const testX = newPosition.clone(); testX.y += 0.05;
    if (!collidesWithObject(testX, colliders)) {
      playerObject.position.x = newPosition.x;
    } else {
      // only allow step-up when grounded and not right after a jump
      if (canJump && snapLockMs === 0 && velocityY <= 0.001) {
        const stepX = testX.clone(); stepX.y += stepHeight;
        if (!collidesWithObject(stepX, colliders)) { playerObject.position.y += stepHeight; playerObject.position.x = newPosition.x; }
      }
    }

    // Horizontal Z with slight lift and step-up
    newPosition.z += moveZ;
    const testZ = newPosition.clone(); testZ.y += 0.05;
    if (!collidesWithObject(testZ, colliders)) {
      playerObject.position.z = newPosition.z;
    } else {
      // only allow step-up when grounded and not right after a jump
      if (canJump && snapLockMs === 0 && velocityY <= 0.001) {
        const stepZ = testZ.clone(); stepZ.y += stepHeight;
        if (!collidesWithObject(stepZ, colliders)) { playerObject.position.y += stepHeight; playerObject.position.z = newPosition.z; }
      }
    }

    // Try snapping to ground before applying gravity, enables walking up slopes
    velocityY += GRAVITY * delta;
    const newY = playerObject.position.y + velocityY * delta;
    const posYTest = playerObject.position.clone(); posYTest.y = newY;
    if (!collidesWithObject(posYTest, [...platforms, ground])) {
      playerObject.position.y = newY;
      canJump = false;
    } else {
      if (velocityY < 0) { canJump = true; snapToGroundIfClose(playerObject.position); }
      velocityY = 0;
    }
    // After vertical resolution, allow snapping only when falling/not jumping
    if (velocityY <= 0.001) { snapToGroundIfClose(playerObject.position); }

    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(moveX, moveZ);
      if (playerModel) {
        playerModel.rotation.y = angle;
      }
    }

    cameraOffset.x = Math.sin(cameraAngle) * Math.cos(cameraVerticalAngle) * cameraDistance;
    cameraOffset.y = Math.sin(cameraVerticalAngle) * cameraDistance;
    cameraOffset.z = Math.cos(cameraAngle) * Math.cos(cameraVerticalAngle) * cameraDistance;

    cameraTarget.copy(playerObject.position).add(cameraTargetOffset);
    camera.position.copy(cameraTarget).add(cameraOffset);
    camera.lookAt(cameraTarget);

    // replace distance check with OBB touch detection
    if (touchesHazard(playerObject.position)) {
      oofSound.play().catch(err => { console.warn('Could not play oof sound:', err); });
      showNotification("You died! Restarting...");
      playerObject.position.copy(startPosition);
      velocityY = 0;
      canJump = false;
    }

    if (playerObject.position.y < -10) {
      oofSound.play().catch(err => { console.warn('Could not play oof sound:', err); });
      showNotification("You fell off the world! Restarting...");
      playerObject.position.copy(startPosition);
      velocityY = 0;
      canJump = false;
    }

    const goalBox = new THREE.Box3().setFromObject(goal);
    if (goalBox.containsPoint(playerObject.position)) {
      showNotification("Congratulations! You reached the goal! Restarting...");
      playerObject.position.copy(startPosition);
      velocityY = 0;
      canJump = false;
    }

    if (time - lastBroadcastTime > BROADCAST_INTERVAL) {
      broadcastPresence();
      lastBroadcastTime = time;
    }

    renderer.render(scene, camera);
  }

  animate();

  const closeBtn = win.querySelector('button[aria-label="Close"]');
  const originalCloseAction = closeBtn ? closeBtn.onclick : null; 

  if (closeBtn) {
    closeBtn.onclick = null; 
    closeBtn.addEventListener('click', () => {
      isWindowOpen = false; 
      
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      resizeObserver.disconnect();
      unsubscribePresence();
      otherPlayers.forEach(model => scene.remove(model));
      otherPlayers.clear();
      if (animationFrameId) cancelAnimationFrame(animationFrameId); 

      room.updatePresence({}); 

      const realCloseBtn = win.querySelector('.title-bar-controls button[aria-label="Close"]');
      if (realCloseBtn && realCloseBtn !== closeBtn) {
        realCloseBtn.click(); 
      } else {
        win.remove(); 
      }
      const taskbarButtons = document.querySelector('.taskbar-buttons');
      const btnToRemove = taskbarButtons.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
      if(btnToRemove) btnToRemove.remove();
      if (window.currentActiveWindowId === win.dataset.id) {
        window.currentActiveWindowId = null;
      }
    });
  }
}