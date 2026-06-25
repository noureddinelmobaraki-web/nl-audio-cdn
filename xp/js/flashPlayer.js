import { getItemByPath } from "./system.js";
import { openItem } from "./openItem.js";

export function initFlashPlayer(win, showNotification, swfPath = null) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.backgroundColor = '#f0f0f0';
  contentArea.style.display = 'flex';
  contentArea.style.flexDirection = 'column';
  contentArea.style.overflow = 'hidden';

  const ruffleContainer = document.createElement('div');
  ruffleContainer.id = 'ruffle-container';
  ruffleContainer.style.flexGrow = '1';
  ruffleContainer.style.display = 'flex';
  ruffleContainer.style.justifyContent = 'center';
  ruffleContainer.style.alignItems = 'center';
  contentArea.appendChild(ruffleContainer);

  // This is necessary for Ruffle to work.
  window.RufflePlayer = window.RufflePlayer || {};
  window.RufflePlayer.config = {
    "publicPath": "https://unpkg.com/@ruffle-rs/ruffle",
  };

  function playSwf(path) {
    ruffleContainer.innerHTML = '';
    const ruffle = window.RufflePlayer.newest();
    const player = ruffle.createPlayer();
    ruffleContainer.appendChild(player);
    player.style.width = '100%';
    player.style.height = '100%';
    player.load(path);
  }

  if (swfPath) {
    const item = getItemByPath(swfPath);
    if (item && item.content) {
      playSwf(item.content);
    } else {
      ruffleContainer.innerHTML = `<p>Error: Could not load SWF file at ${swfPath}</p>`;
    }
  } else {
    // Show list of games (XP-styled)
    ruffleContainer.style.cssText='flex:1;display:flex;flex-direction:column;padding:0;align-items:stretch;background:#ece9d8;';
    ruffleContainer.innerHTML=`<div style="padding:6px 10px;border-bottom:1px solid #808080;background:#ece9d8;font-weight:bold;font-family:Tahoma, sans-serif;">Flash Games</div><div style="margin:8px;border:2px inset #808080;background:#fff;overflow:auto;height:100%;"><ul id="flash-game-list" style="list-style:none;margin:0;padding:0;"></ul></div><style>#flash-game-list li{display:flex;align-items:center;gap:8px;padding:6px 8px;cursor:pointer;font-family:Tahoma, sans-serif;font-size:12px;border-bottom:1px solid #f0f0f0}#flash-game-list li:hover{background:#316AC5;color:#fff}#flash-game-list img{width:18px;height:18px;flex-shrink:0}</style>`;
    const gamesFolder=getItemByPath("C:/Games/Flash Games/"); const list=ruffleContainer.querySelector('#flash-game-list');
    if(gamesFolder&&gamesFolder.children){Object.keys(gamesFolder.children).forEach(gameName=>{const li=document.createElement('li');li.innerHTML=`<img src="Flash_icon.png" alt=""><span>${gameName.replace('.swf','')}</span>`;li.addEventListener('click',()=>{ruffleContainer.style.padding='0';ruffleContainer.style.flexDirection='row';ruffleContainer.style.overflow='hidden';ruffleContainer.style.alignItems='center';ruffleContainer.style.justifyContent='center';playSwf(gamesFolder.children[gameName].content);const tb=win.querySelector('.title-bar-text');if(tb)tb.textContent=`${gameName} - Flash Player`;});list.appendChild(li);});}else{list.innerHTML='<li style="padding:8px;">Could not find the Flash Games folder.</li>';}
  }
}