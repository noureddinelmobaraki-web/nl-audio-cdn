export function showContextMenu(x, y, options) {
  hideContextMenu();
  const contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu';
  contextMenu.style.top = y + "px";
  contextMenu.style.left = x + "px";
  options.forEach(opt => {
    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu-item';
    menuItem.textContent = opt.label;
    menuItem.addEventListener('click', () => {
      opt.action();
      hideContextMenu();
    });
    contextMenu.appendChild(menuItem);
  });
  document.body.appendChild(contextMenu);

  // Keep the menu fully on screen (long-presses near the edge on phones).
  const rect = contextMenu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    contextMenu.style.left = Math.max(0, window.innerWidth - rect.width - 2) + "px";
  }
  if (rect.bottom > window.innerHeight) {
    contextMenu.style.top = Math.max(0, window.innerHeight - rect.height - 2) + "px";
  }
}

export function hideContextMenu() {
  const existing = document.querySelectorAll('.context-menu');
  existing.forEach(menu => menu.remove());
}

// Close any open context menu when clicking outside of it.
document.addEventListener('click', (e) => {
  if (!e.target.closest('.context-menu')) {
    hideContextMenu();
  }
});