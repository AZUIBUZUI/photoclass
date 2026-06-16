// Upgrade old project databases to current tag schema
// Removes deprecated dimensions (色调, 题材, etc.) and updates shortcuts

import { DEFAULT_DIMENSIONS, RATING_DIMENSION, DEFAULT_SHORTCUTS } from '../../shared/tagDefaults.js';

// Names of dimensions to KEEP (all others will be removed)
const KEEP_DIMS = ['构图', '光影', '情绪', '评分'];

export function upgradeProject(db) {
  // 1. Find dimensions to remove
  const allDims = db.prepare('SELECT * FROM tag_dimension').all();
  const toRemove = allDims.filter(d => !KEEP_DIMS.includes(d.name));
  const existing = new Set(allDims.map(d => d.name));

  const transaction = db.transaction(() => {
    // 2. Delete removed dimensions (cascades to tags and image_tag)
    for (const dim of toRemove) {
      db.prepare('DELETE FROM tag_dimension WHERE id = ?').run(dim.id);
      console.log('[Migrate] Removed dimension:', dim.name);
    }

    // 3. Re-order surviving dimensions to match new sort order
    const survDims = db.prepare('SELECT * FROM tag_dimension ORDER BY sort_order').all();
    const keepOrder = ['构图', '光影', '情绪', '评分'];
    survDims.forEach((d, i) => {
      const newOrder = keepOrder.indexOf(d.name);
      if (newOrder >= 0 && d.sort_order !== newOrder) {
        db.prepare('UPDATE tag_dimension SET sort_order = ? WHERE id = ?').run(newOrder, d.id);
      }
    });

    // 4. Update tag shortcuts for existing dimensions to match new defaults
    const updateShortcutStmt = db.prepare('UPDATE tag SET shortcut_key = ? WHERE id = ?');
    for (const dim of DEFAULT_DIMENSIONS) {
      const existingDim = db.prepare('SELECT id FROM tag_dimension WHERE name = ?').get(dim.name);
      if (!existingDim) continue;

      const existingTags = db.prepare(
        'SELECT * FROM tag WHERE dimension_id = ? ORDER BY sort_order'
      ).all(existingDim.id);

      // Update shortcut keys for matching tags
      for (let i = 0; i < Math.min(existingTags.length, dim.keys.length); i++) {
        updateShortcutStmt.run(dim.keys[i], existingTags[i].id);
        console.log('[Migrate] Updated tag shortcut:', dim.name, dim.tags[i], '→', dim.keys[i]);
      }
    }

    // 5. Rebuild shortcut_binding table
    db.prepare('DELETE FROM shortcut_binding').run();
    const insertShortcut = db.prepare(
      'INSERT OR REPLACE INTO shortcut_binding (action_id, key_combo, updated_at) VALUES (?, ?, datetime(\'now\'))'
    );
    for (const [actionId, keyCombo] of Object.entries(DEFAULT_SHORTCUTS)) {
      insertShortcut.run(actionId, keyCombo);
    }
    console.log('[Migrate] Shortcuts rebuilt with', Object.keys(DEFAULT_SHORTCUTS).length, 'bindings');
  });

  transaction();
  return {
    removed: toRemove.map(d => d.name),
    kept: KEEP_DIMS.filter(d => existing.has(d)),
  };
}
