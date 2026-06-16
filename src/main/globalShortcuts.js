import { getMainWindow } from './windows.js';

// combo → actionId map, rebuilt on project open
const shortcutMap = new Map();

// === Public API ===

export function loadShortcutMap(db) {
  shortcutMap.clear();

  // Step 1: tag table (lower priority)
  const tags = db.prepare(`
    SELECT t.id, t.shortcut_key FROM tag t
    JOIN tag_dimension td ON td.id = t.dimension_id
    WHERE t.shortcut_key IS NOT NULL AND td.is_rating = 0
  `).all();
  for (const t of tags) {
    shortcutMap.set(norm(t.shortcut_key), `__tag:${t.id}`);
  }

  // Step 2: shortcut_binding table (higher priority, overwrites tags)
  const bindings = db.prepare('SELECT action_id, key_combo FROM shortcut_binding').all();
  for (const b of bindings) {
    shortcutMap.set(norm(b.key_combo), b.action_id);
  }

  console.log('[Shortcuts] Loaded', shortcutMap.size, 'bindings');
}

export function clearShortcutMap() {
  shortcutMap.clear();
}

// === Keyboard hook ===

let lastTime = 0;
let lastCombo = '';

export function setupKeyboardHook(win) {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.control && ['c','v','x','a','z','y'].includes(input.key.toLowerCase())) return;

    const combo = norm(buildCombo(input));
    const actionId = shortcutMap.get(combo);
    if (!actionId) return;

    // Dedupe: ignore same combo within 150ms (prevents keyDown+keyPress double fire)
    const now = Date.now();
    if (combo === lastCombo && now - lastTime < 150) return;
    lastCombo = combo;
    lastTime = now;

    if (input.control || input.alt || input.meta) event.preventDefault();

    console.log('[Shortcuts]', combo, '→', actionId);
    win.webContents.send('event:shortcutTriggered', actionId);
  });
}

// === Helpers ===

function norm(combo) {
  if (!combo) return '';
  const parts = combo.split('+').map(p => p.trim()).filter(Boolean);
  const mods = parts.filter(p => ['Ctrl','Shift','Alt','Meta'].includes(p)).sort();
  const key = parts.filter(p => !['Ctrl','Shift','Alt','Meta'].includes(p));
  return [...mods, ...key].join('+');
}

function codeName(code) {
  const m = {
    Digit0:'0',Digit1:'1',Digit2:'2',Digit3:'3',Digit4:'4',
    Digit5:'5',Digit6:'6',Digit7:'7',Digit8:'8',Digit9:'9',
    KeyA:'A',KeyB:'B',KeyC:'C',KeyD:'D',KeyE:'E',KeyF:'F',
    KeyG:'G',KeyH:'H',KeyI:'I',KeyJ:'J',KeyK:'K',KeyL:'L',
    KeyM:'M',KeyN:'N',KeyO:'O',KeyP:'P',KeyQ:'Q',KeyR:'R',
    KeyS:'S',KeyT:'T',KeyU:'U',KeyV:'V',KeyW:'W',KeyX:'X',
    KeyY:'Y',KeyZ:'Z',
    Backquote:'`',Minus:'-',Equal:'=',
    BracketLeft:'[',BracketRight:']',Backslash:'\\\\',
    Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',
    Space:'Space',Backspace:'Backspace',Delete:'Delete',
    Home:'Home',End:'End',PageUp:'PageUp',PageDown:'PageDown',
    ArrowUp:'ArrowUp',ArrowDown:'ArrowDown',
    ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight',
    Escape:'Escape',Tab:'Tab',Enter:'Enter',
  };
  return m[code] || '';
}

function buildCombo(input) {
  const p = [];
  if (input.control) p.push('Ctrl');
  if (input.shift)  p.push('Shift');
  if (input.alt)    p.push('Alt');
  if (input.meta)   p.push('Meta');
  const k = codeName(input.code);
  if (k && !['Control','Shift','Alt','Meta'].includes(k)) p.push(k);
  return p.join('+');
}
