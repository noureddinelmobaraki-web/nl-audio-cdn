export function renderProperties(win, { name, path, item, isRecycle = false }) {
  const container = win.querySelector('.window-content');
  container.innerHTML = '';
  // Ensure proper layout for Properties window
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.overflow = 'hidden';
  win.style.width = '420px';
  win.style.height = '420px';
  win.style.maxHeight = 'calc(100vh - 60px)'; // keep within viewport

  const root = document.createElement('div');
  root.style.fontFamily = 'Tahoma, sans-serif';
  root.style.fontSize = '12px';
  root.style.padding = '10px';
  root.style.height = '100%';
  root.style.minHeight = '0';
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  container.appendChild(root);

  const tabsBar = document.createElement('div');
  tabsBar.style.display = 'flex';
  tabsBar.style.gap = '4px';
  tabsBar.style.marginBottom = '8px';
  root.appendChild(tabsBar);

  const panel = document.createElement('div');
  panel.style.flex = '1';
  panel.style.border = '1px solid #808080';
  panel.style.background = 'white';
  panel.style.padding = '10px';
  panel.style.overflow = 'auto';
  panel.style.minHeight = '0';
  root.appendChild(panel);

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'flex-end';
  footer.style.gap = '6px';
  footer.style.marginTop = '8px';
  footer.style.flexShrink = '0';
  root.appendChild(footer);

  function tabButton(label, selected = false) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.padding = '2px 10px';
    b.style.border = '1px solid #808080';
    b.style.borderBottom = selected ? '1px solid white' : '1px solid #808080';
    b.style.borderRadius = '3px 3px 0 0';
    b.style.background = selected ? '#ece9d8' : '#d4d0c8';
    b.style.position = 'relative';
    b.style.top = selected ? '1px' : '0';
    b.dataset.selected = selected ? '1' : '0';
    b.addEventListener('click', () => {
      tabsBar.querySelectorAll('button').forEach(btn => {
        btn.style.background = '#d4d0c8';
        btn.style.borderBottom = '1px solid #808080';
        btn.dataset.selected = '0';
      });
      b.style.background = '#ece9d8';
      b.style.borderBottom = '1px solid white';
      b.dataset.selected = '1';
      renderPanel(label);
    });
    return b;
  }

  const showShortcut = item && item.type === 'shortcut';
  tabsBar.appendChild(tabButton('General', true));
  if (showShortcut) tabsBar.appendChild(tabButton('Shortcut'));

  function getIconFor(pathOrName) {
    try { return window.getIcon ? window.getIcon(pathOrName) : 'Default.png'; } catch { return 'Default.png'; }
  }
  function humanSize(bytes) {
    if (!bytes || isNaN(bytes)) return '—';
    const units = ['bytes','KB','MB','GB'];
    let i = 0, n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
  }
  function estimateSize(it) {
    if (!it) return 0;
    if (it.type === 'file') return (it.content && typeof it.content === 'string') ? it.content.length : 0;
    if (it.type === 'folder' && it.children) return Object.keys(it.children).length;
    return 0;
  }
  function getLocation(p) {
    if (!p) return '';
    const parts = p.split('/');
    parts.pop();
    return parts.join('/').replace(/\/$/, '');
  }

  function renderGeneral() {
    panel.innerHTML = '';
    const top = document.createElement('div');
    top.style.display = 'flex';
    top.style.gap = '10px';
    top.style.marginBottom = '12px';

    const icon = document.createElement('img');
    icon.src = getIconFor(path || name);
    icon.style.width = '48px';
    icon.style.height = '48px';
    icon.style.flexShrink = '0';

    const titleBox = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = name || 'Unknown';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '4px';
    const typeLine = document.createElement('div');
    const niceType =
      item?.type === 'folder' ? 'File Folder' :
      item?.type === 'file' ? 'File' :
      item?.type === 'shortcut' ? 'Shortcut' :
      item?.type === 'app' ? `Application (${item.program || name || ''})` : 'Item';
    typeLine.textContent = `Type of file: ${niceType}`;

    titleBox.appendChild(title);
    titleBox.appendChild(typeLine);
    top.appendChild(icon);
    top.appendChild(titleBox);
    panel.appendChild(top);

    const info = document.createElement('div');
    info.style.display = 'grid';
    info.style.gridTemplateColumns = '140px 1fr';
    info.style.rowGap = '6px';
    info.style.columnGap = '10px';

    const addRow = (label, value) => {
      const l = document.createElement('div'); l.textContent = label; l.style.color = '#404040';
      const v = document.createElement('div'); v.textContent = value;
      info.appendChild(l); info.appendChild(v);
    };

    addRow('Location:', getLocation(path) || 'C:/');
    if (item?.type === 'file') {
      const sz = estimateSize(item);
      addRow('Size:', humanSize(sz));
    } else if (item?.type === 'folder') {
      const count = item.children ? Object.keys(item.children).length : 0;
      addRow('Contains:', `${count} item(s)`);
    } else if (showShortcut) {
      addRow('Target:', item.target || '(missing)');
    } else if (item?.type === 'app') {
      addRow('Description:', item.program || name || '');
    }

    if (isRecycle) {
      addRow('Original path:', path || '');
      addRow('Status:', 'In Recycle Bin');
    }

    panel.appendChild(info);

    const attrs = document.createElement('div');
    attrs.style.marginTop = '12px';
    const hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '1px solid #c0c0c0';
    hr.style.margin = '8px 0';
    panel.appendChild(hr);
    const aLabel = document.createElement('div');
    aLabel.textContent = 'Attributes:';
    aLabel.style.marginBottom = '6px';
    const checks = document.createElement('div');
    checks.style.display = 'flex';
    checks.style.gap = '12px';
    const ro = document.createElement('label'); ro.innerHTML = `<input type="checkbox" disabled> Read-only`;
    const hid = document.createElement('label'); hid.innerHTML = `<input type="checkbox" disabled> Hidden`;
    checks.appendChild(ro); checks.appendChild(hid);
    attrs.appendChild(aLabel); attrs.appendChild(checks);
    panel.appendChild(attrs);
  }

  function renderShortcut() {
    panel.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '120px 1fr';
    grid.style.rowGap = '6px';
    grid.style.columnGap = '10px';

    const addRow = (label, valueNode) => {
      const l = document.createElement('div'); l.textContent = label; l.style.color = '#404040';
      grid.appendChild(l); grid.appendChild(valueNode);
    };

    const targetBox = document.createElement('div');
    targetBox.textContent = item?.target || '(missing)';
    addRow('Target:', targetBox);

    const startIn = document.createElement('div');
    startIn.textContent = getLocation(item?.target || '') || 'C:/';
    addRow('Start in:', startIn);

    panel.appendChild(grid);
  }

  function renderPanel(which) {
    if (which === 'Shortcut') renderShortcut();
    else renderGeneral();
  }
  renderPanel('General');

  const btnOK = document.createElement('button'); btnOK.textContent = 'OK';
  const btnCancel = document.createElement('button'); btnCancel.textContent = 'Cancel';
  const btnApply = document.createElement('button'); btnApply.textContent = 'Apply'; btnApply.disabled = true;
  [btnOK, btnCancel, btnApply].forEach(b => { b.style.minWidth = '70px'; b.style.padding = '4px 10px'; });

  btnOK.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click(); else win.remove();
  });
  btnCancel.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click(); else win.remove();
  });

  footer.appendChild(btnOK);
  footer.appendChild(btnCancel);
  footer.appendChild(btnApply);
}