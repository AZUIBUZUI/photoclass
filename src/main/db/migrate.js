import { SCHEMA_SQL } from './schema.js';
import { DEFAULT_DIMENSIONS, RATING_DIMENSION, DEFAULT_SHORTCUTS } from '../../shared/tagDefaults.js';

export function runMigrations(db) {
  db.exec(SCHEMA_SQL);
}

export function seedDefaults(db) {
  const insertDim = db.prepare(`
    INSERT INTO tag_dimension (name, color, sort_order, is_multiselect, is_rating)
    VALUES (@name, @color, @sort_order, @is_multiselect, @is_rating)
  `);
  const insertTag = db.prepare(`
    INSERT INTO tag (dimension_id, name, shortcut_key, sort_order)
    VALUES (@dimension_id, @name, @shortcut_key, @sort_order)
  `);
  const insertShortcut = db.prepare(`
    INSERT OR REPLACE INTO shortcut_binding (action_id, key_combo, updated_at)
    VALUES (@action_id, @key_combo, datetime('now'))
  `);
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO app_settings (key, value) VALUES (@key, @value)
  `);

  const transaction = db.transaction(() => {
    // Tag dimensions with shortcuts
    for (const dim of DEFAULT_DIMENSIONS) {
      const { lastInsertRowid: dimId } = insertDim.run({
        name: dim.name, color: dim.color, sort_order: dim.sort_order,
        is_multiselect: dim.is_multiselect, is_rating: 0,
      });
      for (let i = 0; i < dim.tags.length; i++) {
        insertTag.run({
          dimension_id: dimId,
          name: dim.tags[i],
          shortcut_key: dim.keys[i],
          sort_order: i,
        });
      }
    }

    // Rating dimension
    const { lastInsertRowid: ratingDimId } = insertDim.run({
      name: RATING_DIMENSION.name, color: RATING_DIMENSION.color,
      sort_order: RATING_DIMENSION.sort_order, is_multiselect: 0, is_rating: 1,
    });
    for (let i = 0; i < RATING_DIMENSION.tags.length; i++) {
      insertTag.run({ dimension_id: ratingDimId, name: RATING_DIMENSION.tags[i], shortcut_key: null, sort_order: i });
    }

    // App shortcuts
    for (const [actionId, keyCombo] of Object.entries(DEFAULT_SHORTCUTS)) {
      insertShortcut.run({ action_id: actionId, key_combo: keyCombo });
    }

    // Default settings
    insertSetting.run({ key: 'autoAdvance', value: 'true' });
    insertSetting.run({ key: 'gridCellSize', value: '200' });
  });

  transaction();
}
