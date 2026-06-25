// Solitaire (Klondike) — original vanilla-JS implementation for the NL XP system.
// Integration: registered in system.js (C:/Games/Solitaire), icon in icons.js
// ("solitaire"), launched via createWindow('Solitaire') -> window.initSolitaire.
//
// Design notes:
// - Click/tap to move (touch-friendly + works at any window size). Double-click
//   (or double-tap) auto-sends a card to its foundation.
// - Pure client-side, no external assets. Relays out on window resize.

export function initSolitaire(win, showNotification) {
  const content = win.querySelector('.window-content') || win.querySelector('.window-body');
  if (!content) return;
  content.innerHTML = '';
  content.style.cssText = 'display:flex;flex-direction:column;height:100%;width:100%;background:#0a7a3c;overflow:hidden;font-family:Tahoma,"Segoe UI",Arial,sans-serif;';

  // ---- Toolbar ----
  const bar = document.createElement('div');
  bar.style.cssText = 'flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:5px 8px;background:linear-gradient(#f5f6f8,#dfe4ec);border-bottom:1px solid #9aa3b0;font-size:12px;';
  const btnCss = 'height:24px;padding:0 10px;border:1px solid #8a93a0;border-radius:4px;background:linear-gradient(#ffffff,#e4e8ef);cursor:pointer;font-size:12px;color:#222;';
  const newBtn = document.createElement('button'); newBtn.textContent = 'لعبة جديدة'; newBtn.style.cssText = btnCss;
  const drawBtn = document.createElement('button'); drawBtn.style.cssText = btnCss;
  const status = document.createElement('div'); status.style.cssText = 'margin-inline-start:auto;color:#1a3c66;font-weight:bold;';
  bar.append(newBtn, drawBtn, status);

  // ---- Board ----
  const board = document.createElement('div');
  board.style.cssText = 'position:relative;flex:1 1 auto;min-height:0;overflow:hidden;';
  content.append(bar, board);

  const SUITS = [ { s: '♠', c: 'black' }, { s: '♥', c: 'red' }, { s: '♦', c: 'red' }, { s: '♣', c: 'black' } ];
  const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  let stock, waste, foundations, tableau, draw3 = false, selection = null, moves = 0;

  function setDrawLabel() { drawBtn.textContent = draw3 ? 'سحب: 3' : 'سحب: 1'; }

  function makeDeck() {
    const d = [];
    for (let si = 0; si < 4; si++) {
      for (let r = 1; r <= 13; r++) {
        d.push({ suit: SUITS[si].s, color: SUITS[si].c, rank: r, faceUp: false, id: si + '-' + r });
      }
    }
    return d;
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function deal() {
    const deck = shuffle(makeDeck());
    stock = []; waste = []; foundations = [[], [], [], []]; tableau = [[], [], [], [], [], [], []];
    for (let col = 0; col < 7; col++) {
      for (let n = 0; n <= col; n++) {
        const card = deck.pop();
        card.faceUp = (n === col);
        tableau[col].push(card);
      }
    }
    stock = deck; // remaining 24, all face down
    selection = null; moves = 0;
    render();
  }

  // ---- Rules ----
  function canStackTableau(card, destTop) {
    if (!destTop) return card.rank === 13;            // only King on empty column
    return destTop.faceUp && destTop.color !== card.color && destTop.rank === card.rank + 1;
  }
  function canStackFoundation(card, found) {
    if (found.length === 0) return card.rank === 1;   // Ace starts
    const top = found[found.length - 1];
    return top.suit === card.suit && card.rank === top.rank + 1;
  }
  function isValidRun(pile, index) {
    for (let i = index; i < pile.length - 1; i++) {
      const a = pile[i], b = pile[i + 1];
      if (!a.faceUp || a.color === b.color || a.rank !== b.rank + 1) return false;
    }
    return pile[index] && pile[index].faceUp;
  }

  // ---- Moves ----
  function drawFromStock() {
    if (stock.length === 0) {
      // recycle waste back into stock (face down, reversed)
      while (waste.length) { const c = waste.pop(); c.faceUp = false; stock.push(c); }
    } else {
      const n = draw3 ? 3 : 1;
      for (let i = 0; i < n && stock.length; i++) { const c = stock.pop(); c.faceUp = true; waste.push(c); }
    }
    selection = null; moves++; render();
  }

  function tryAutoFoundation(card, fromPile, fromIndex) {
    // only the single top card can go to a foundation
    if (fromIndex !== fromPile.length - 1) return false;
    for (let f = 0; f < 4; f++) {
      if (canStackFoundation(card, foundations[f])) {
        fromPile.pop(); foundations[f].push(card);
        flipIfNeeded(fromPile); afterMove(); return true;
      }
    }
    return false;
  }

  function flipIfNeeded(pile) {
    if (pile.length && !pile[pile.length - 1].faceUp) pile[pile.length - 1].faceUp = true;
  }

  function afterMove() {
    selection = null; moves++; render();
    if (foundations.every(f => f.length === 13)) {
      status.textContent = 'فزت! 🎉';
      if (showNotification) showNotification('Solitaire: مبروك، لقد فزت!');
    }
  }

  // Attempt to move the current selection onto a destination pile descriptor.
  function moveSelectionTo(dest) {
    if (!selection) return false;
    const { pile, index, kind } = selection;
    const moving = pile.slice(index);
    if (dest.kind === 'foundation') {
      if (moving.length === 1 && canStackFoundation(moving[0], dest.pile)) {
        pile.splice(index); dest.pile.push(moving[0]);
        if (kind === 'tableau') flipIfNeeded(pile);
        afterMove(); return true;
      }
      return false;
    }
    if (dest.kind === 'tableau') {
      const destTop = dest.pile[dest.pile.length - 1];
      if (canStackTableau(moving[0], destTop)) {
        pile.splice(index); dest.pile.push(...moving);
        if (kind === 'tableau') flipIfNeeded(pile);
        afterMove(); return true;
      }
      return false;
    }
    return false;
  }

  // ---- Rendering / layout ----
  let cardW, cardH, gap, padX, padY, fanUp, fanDown;
  function computeLayout() {
    const W = board.clientWidth || 700;
    gap = Math.max(6, Math.round(W * 0.012));
    cardW = Math.max(40, Math.floor((W - gap * 8) / 7));
    cardW = Math.min(cardW, 96);
    cardH = Math.round(cardW * 1.4);
    padX = gap; padY = gap;
    fanUp = Math.round(cardH * 0.30);
    fanDown = Math.round(cardH * 0.14);
  }

  function cardEl(card, faceUpOverride) {
    const up = faceUpOverride != null ? faceUpOverride : card.faceUp;
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;width:' + cardW + 'px;height:' + cardH + 'px;border-radius:' + Math.round(cardW * 0.09) + 'px;box-sizing:border-box;cursor:pointer;user-select:none;';
    if (!up) {
      el.style.background = 'repeating-linear-gradient(45deg,#1450b4,#1450b4 6px,#0e3c8a 6px,#0e3c8a 12px)';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 1px 2px rgba(0,0,0,.4)';
    } else {
      el.style.background = '#fff';
      el.style.border = '1px solid #999';
      el.style.boxShadow = '0 1px 2px rgba(0,0,0,.35)';
      el.style.color = card.color === 'red' ? '#c0392b' : '#111';
      const r = RANKS[card.rank];
      const fs = Math.max(10, Math.round(cardW * 0.26));
      const cs = Math.max(12, Math.round(cardW * 0.42));
      el.innerHTML =
        '<div style="position:absolute;top:2px;left:4px;font-size:' + fs + 'px;font-weight:bold;line-height:1;">' + r + '<br>' + card.suit + '</div>' +
        '<div style="position:absolute;bottom:2px;right:4px;font-size:' + fs + 'px;font-weight:bold;line-height:1;transform:rotate(180deg);">' + r + '<br>' + card.suit + '</div>' +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:' + cs + 'px;">' + card.suit + '</div>';
    }
    return el;
  }

  function slotEl(x, y) {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;width:' + cardW + 'px;height:' + cardH + 'px;border-radius:' + Math.round(cardW * 0.09) + 'px;border:2px dashed rgba(255,255,255,.5);box-sizing:border-box;left:' + x + 'px;top:' + y + 'px;';
    return el;
  }

  function place(el, x, y, z) { el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.zIndex = z; board.appendChild(el); }

  function highlight(el) { el.style.outline = '3px solid #ffd700'; el.style.outlineOffset = '-1px'; }

  function render() {
    computeLayout();
    board.innerHTML = '';
    setDrawLabel();
    status.textContent = status.textContent && status.textContent.indexOf('فزت') === 0 ? status.textContent : ('النقلات: ' + moves);

    const topY = padY;
    // Stock (col 0) and Waste (col 1)
    const stockX = padX, wasteX = padX + cardW + gap;
    // Foundations at columns 3..6
    const foundX = c => padX + (3 + c) * (cardW + gap);

    // Stock
    const stockSlot = slotEl(stockX, topY); stockSlot.style.cursor = 'pointer';
    stockSlot.onclick = drawFromStock; board.appendChild(stockSlot);
    if (stock.length) {
      const c = cardEl(stock[stock.length - 1], false);
      place(c, stockX, topY, 5); c.onclick = drawFromStock;
    } else {
      stockSlot.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-size:18px;">↻</div>';
    }

    // Waste (show up to 3 fanned when draw3)
    board.appendChild(slotEl(wasteX, topY));
    if (waste.length) {
      const showN = draw3 ? Math.min(3, waste.length) : 1;
      const start = waste.length - showN;
      for (let i = start; i < waste.length; i++) {
        const off = (i - start) * Math.round(cardW * 0.28);
        const c = cardEl(waste[i], true);
        place(c, wasteX + off, topY, 6 + i);
        if (i === waste.length - 1) {
          c.onclick = () => onCardClick({ pile: waste, index: waste.length - 1, kind: 'waste' });
          c.ondblclick = () => tryAutoFoundation(waste[waste.length - 1], waste, waste.length - 1);
        }
      }
    }

    // Foundations
    for (let f = 0; f < 4; f++) {
      const x = foundX(f);
      const sl = slotEl(x, topY);
      sl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,.7);font-size:' + Math.round(cardW * 0.4) + 'px;">' + SUITS[f].s + '</div>';
      sl.onclick = () => onDestClick({ pile: foundations[f], kind: 'foundation' });
      board.appendChild(sl);
      if (foundations[f].length) {
        const c = cardEl(foundations[f][foundations[f].length - 1], true);
        place(c, x, topY, 5);
        c.onclick = () => onDestClick({ pile: foundations[f], kind: 'foundation' });
      }
    }

    // Tableau (7 columns)
    const tabTop = topY + cardH + gap;
    for (let col = 0; col < 7; col++) {
      const x = padX + col * (cardW + gap);
      const pile = tableau[col];
      const sl = slotEl(x, tabTop);
      sl.onclick = () => onDestClick({ pile, kind: 'tableau' });
      board.appendChild(sl);
      let y = tabTop;
      for (let i = 0; i < pile.length; i++) {
        const card = pile[i];
        const el = cardEl(card, card.faceUp);
        place(el, x, y, 10 + i);
        if (card.faceUp) {
          el.onclick = () => onCardClick({ pile, index: i, kind: 'tableau' });
          el.ondblclick = () => tryAutoFoundation(card, pile, i);
          if (selection && selection.pile === pile && i >= selection.index) highlight(el);
        }
        y += card.faceUp ? fanUp : fanDown;
      }
      if (pile.length === 0 && selection) sl.style.cursor = 'pointer';
    }

    // re-highlight waste selection
    if (selection && selection.kind === 'waste') {
      const last = board.querySelectorAll('div');
    }
  }

  // ---- Interaction ----
  function onCardClick(sel) {
    // If we already have a selection, treat this click as a destination first.
    if (selection) {
      const destKind = sel.kind === 'waste' ? null : 'tableau';
      if (destKind === 'tableau' && sel.pile !== selection.pile) {
        if (moveSelectionTo({ pile: sel.pile, kind: 'tableau' })) return;
      }
      // otherwise change selection (or deselect if same)
      if (selection.pile === sel.pile && selection.index === sel.index) { selection = null; render(); return; }
    }
    // Try instant auto-foundation on single click of a top card (quality-of-life)
    // but keep selection behavior primary: select instead.
    if (sel.kind === 'tableau' && !isValidRun(sel.pile, sel.index)) { return; }
    selection = sel; render();
  }
  function onDestClick(dest) {
    if (!selection) return;
    moveSelectionTo(dest);
  }

  // ---- Wire up ----
  newBtn.onclick = () => { status.textContent = ''; deal(); };
  drawBtn.onclick = () => { draw3 = !draw3; selection = null; render(); };

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => render());
    ro.observe(board);
  } else {
    window.addEventListener('resize', render);
  }

  deal();
}
