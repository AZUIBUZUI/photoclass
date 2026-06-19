import { ipcMain, dialog, shell, app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { IPC } from '../../shared/ipcChannels.js';
import { getMainWindow } from '../windows.js';
import { getRegistryDb, openProjectDb, closeDb } from '../db/connection.js';
import { runMigrations, seedDefaults } from '../db/migrate.js';
import { loadShortcutMap, clearShortcutMap } from '../globalShortcuts.js';
import * as imageService from '../services/image.service.js';
import * as exportService from '../services/export.service.js';
import { upgradeProject } from '../services/migrate.service.js';
import { getThumbnailCachePath } from '../utils/paths.js';

let currentProjectDb = null;
let currentProjectPath = null;

function sendToRenderer(channel, ...args) {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, ...args);
  }
}

export function registerAllHandlers() {
  // ==============================
  // PROJECT MANAGEMENT
  // ==============================

  ipcMain.handle(IPC.PROJECT_LIST, async () => {
    const registry = getRegistryDb();
    const projects = registry.prepare(
      'SELECT * FROM project_registry ORDER BY last_opened DESC'
    ).all();
    return { data: projects };
  });

  ipcMain.handle(IPC.PROJECT_CREATE, async (_event, name, dbPath) => {
    try {
      if (!dbPath.endsWith('.photoclass')) dbPath += '.photoclass';
      if (fs.existsSync(dbPath)) return { error: '项目文件已存在' };

      const db = openProjectDb(dbPath);
      runMigrations(db);
      seedDefaults(db);
      db.prepare('INSERT INTO project (name, db_path) VALUES (?, ?)').run(name, dbPath);

      const registry = getRegistryDb();
      registry.prepare(
        'INSERT OR REPLACE INTO project_registry (name, db_path, last_opened) VALUES (?, ?, datetime(\'now\'))'
      ).run(name, dbPath);

      closeDb(db);
      return { data: { name, db_path: dbPath } };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle(IPC.PROJECT_OPEN, async (_event, dbPath) => {
    try {
      if (!fs.existsSync(dbPath)) return { error: '项目文件不存在' };

      if (currentProjectDb) {
        clearShortcutMap();
        closeDb(currentProjectDb);
        currentProjectDb = null;
        currentProjectPath = null;
      }

      const db = openProjectDb(dbPath);
      const meta = db.prepare('SELECT * FROM project LIMIT 1').get();
      if (!meta) { closeDb(db); return { error: '无效的项目文件' }; }

      currentProjectDb = db;
      currentProjectPath = dbPath;
      loadShortcutMap(db);

      const registry = getRegistryDb();
      registry.prepare(
        'UPDATE project_registry SET last_opened = datetime(\'now\') WHERE db_path = ?'
      ).run(dbPath);

      sendToRenderer(IPC.EVENT_PROJECT_CHANGED, meta);
      return { data: meta };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle(IPC.PROJECT_CLOSE, async () => {
    if (currentProjectDb) {
      clearShortcutMap();
      closeDb(currentProjectDb);
      currentProjectDb = null;
      currentProjectPath = null;
    }
    sendToRenderer(IPC.EVENT_PROJECT_CHANGED, null);
    return { data: true };
  });

  ipcMain.handle(IPC.PROJECT_DELETE, async (_event, dbPath) => {
    try {
      if (currentProjectPath === dbPath) {
        clearShortcutMap();
        closeDb(currentProjectDb);
        currentProjectDb = null;
        currentProjectPath = null;
        sendToRenderer(IPC.EVENT_PROJECT_CHANGED, null);
      }
      const registry = getRegistryDb();
      registry.prepare('DELETE FROM project_registry WHERE db_path = ?').run(dbPath);
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
      return { data: true };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle(IPC.PROJECT_GET_INFO, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const imageCount = currentProjectDb.prepare('SELECT COUNT(*) as count FROM image').get();
    const meta = currentProjectDb.prepare('SELECT * FROM project LIMIT 1').get();
    return { data: { ...meta, image_count: imageCount.count } };
  });

  // Migrate old project to current schema (removes deprecated dimensions)
  ipcMain.handle('project:migrate', async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    try {
      const result = upgradeProject(currentProjectDb);
      loadShortcutMap(currentProjectDb);
      return { data: result };
    } catch (err) {
      return { error: err.message };
    }
  });

  // ==============================
  // DIALOGS
  // ==============================
  ipcMain.handle(IPC.DIALOG_OPEN_FILE, async (_event, options) => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: '图片', extensions: ['jpg','jpeg','png','webp','bmp','tiff','tif','gif'] }],
      ...options,
    });
    return { data: result.canceled ? [] : result.filePaths };
  });

  ipcMain.handle(IPC.DIALOG_OPEN_FOLDER, async (_event, options) => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'], ...options,
    });
    return { data: result.canceled ? [] : result.filePaths };
  });

  ipcMain.handle(IPC.DIALOG_SAVE_FILE, async (_event, options) => {
    const win = getMainWindow();
    const result = await dialog.showSaveDialog(win, {
      filters: [{ name: 'PhotoClass 项目', extensions: ['photoclass'] }], ...options,
    });
    return { data: result.canceled ? null : result.filePath };
  });

  ipcMain.handle(IPC.DIALOG_CONFIRM, async (_event, message, title) => {
    const win = getMainWindow();
    const result = await dialog.showMessageBox(win, {
      type: 'question', buttons: ['取消', '确定'], defaultId: 1,
      title: title || '确认', message,
    });
    return { data: result.response === 1 };
  });

  // ==============================
  // APP
  // ==============================
  ipcMain.handle(IPC.APP_GET_VERSION, () => ({ data: app.getVersion() }));
  ipcMain.handle(IPC.APP_OPEN_EXTERNAL, async (_event, url) => { await shell.openExternal(url); return { data: true }; });
  ipcMain.handle(IPC.APP_SHOW_IN_FOLDER, async (_event, fp) => { shell.showItemInFolder(fp); return { data: true }; });
  ipcMain.handle(IPC.APP_GET_PLATFORM, () => ({ data: process.platform }));

  // ==============================
  // SHORTCUTS
  // ==============================
  ipcMain.handle(IPC.SHORTCUT_LIST, async () => {
    if (!currentProjectDb) return { data: {} };
    const bindings = currentProjectDb.prepare('SELECT * FROM shortcut_binding').all();
    const map = {};
    for (const b of bindings) map[b.action_id] = b.key_combo;
    return { data: map };
  });

  ipcMain.handle(IPC.SHORTCUT_UPDATE, async (_event, actionId, keyCombo) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare(
      'INSERT OR REPLACE INTO shortcut_binding (action_id, key_combo, updated_at) VALUES (?, ?, datetime(\'now\'))'
    ).run(actionId, keyCombo);
    loadShortcutMap(currentProjectDb);
    return { data: true };
  });

  ipcMain.handle(IPC.SHORTCUT_RESET, async (_event, actionId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare('DELETE FROM shortcut_binding WHERE action_id = ?').run(actionId);
    loadShortcutMap(currentProjectDb);
    return { data: true };
  });

  ipcMain.handle(IPC.SHORTCUT_RESET_ALL, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare('DELETE FROM shortcut_binding').run();
    const { DEFAULT_SHORTCUTS } = await import('../../shared/tagDefaults.js');
    const insert = currentProjectDb.prepare(
      'INSERT OR REPLACE INTO shortcut_binding (action_id, key_combo, updated_at) VALUES (?, ?, datetime(\'now\'))'
    );
    for (const [actionId, keyCombo] of Object.entries(DEFAULT_SHORTCUTS)) {
      insert.run(actionId, keyCombo);
    }
    loadShortcutMap(currentProjectDb);
    return { data: true };
  });

  // ==============================
  // SETTINGS
  // ==============================
  ipcMain.handle(IPC.SETTINGS_GET, async (_event, key) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const row = currentProjectDb.prepare('SELECT value FROM app_settings WHERE key = ?').get(key);
    return { data: row ? row.value : null };
  });

  ipcMain.handle(IPC.SETTINGS_SET, async (_event, key, value) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run(key, String(value));
    return { data: true };
  });

  // ==============================
  // TAG DIMENSIONS
  // ==============================
  ipcMain.handle(IPC.TAG_DIMENSION_LIST, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const dims = currentProjectDb.prepare('SELECT * FROM tag_dimension ORDER BY sort_order').all();
    return { data: dims };
  });

  ipcMain.handle(IPC.TAG_DIMENSION_CREATE, async (_event, name, color) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const maxOrder = currentProjectDb.prepare('SELECT MAX(sort_order) as max FROM tag_dimension').get();
    const result = currentProjectDb.prepare(
      'INSERT INTO tag_dimension (name, color, sort_order) VALUES (?, ?, ?)'
    ).run(name, color || '#6366f1', (maxOrder.max || 0) + 1);
    return { data: { id: Number(result.lastInsertRowid), name, color } };
  });

  ipcMain.handle(IPC.TAG_DIMENSION_UPDATE, async (_event, id, updates) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const fields = []; const values = [];
    for (const [key, value] of Object.entries(updates)) {
      if (['name','color','is_multiselect'].includes(key)) { fields.push(`${key} = ?`); values.push(value); }
    }
    if (fields.length > 0) {
      currentProjectDb.prepare(`UPDATE tag_dimension SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
    }
    return { data: true };
  });

  ipcMain.handle(IPC.TAG_DIMENSION_DELETE, async (_event, id) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare('DELETE FROM tag_dimension WHERE id = ?').run(id);
    return { data: true };
  });

  ipcMain.handle(IPC.TAG_DIMENSION_REORDER, async (_event, orderedIds) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const update = currentProjectDb.prepare('UPDATE tag_dimension SET sort_order = ? WHERE id = ?');
    const transaction = currentProjectDb.transaction(() => {
      for (let i = 0; i < orderedIds.length; i++) update.run(i, orderedIds[i]);
    });
    transaction();
    return { data: true };
  });

  // ==============================
  // TAGS
  // ==============================
  ipcMain.handle(IPC.TAG_LIST, async (_event, dimensionId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const tags = currentProjectDb.prepare('SELECT * FROM tag WHERE dimension_id = ? ORDER BY sort_order').all(dimensionId);
    return { data: tags };
  });

  ipcMain.handle(IPC.TAG_CREATE, async (_event, dimensionId, name, shortcutKey) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const maxOrder = currentProjectDb.prepare('SELECT MAX(sort_order) as max FROM tag WHERE dimension_id = ?').get(dimensionId);
    const result = currentProjectDb.prepare(
      'INSERT INTO tag (dimension_id, name, shortcut_key, sort_order) VALUES (?, ?, ?, ?)'
    ).run(dimensionId, name, shortcutKey || null, (maxOrder?.max || 0) + 1);
    return { data: { id: Number(result.lastInsertRowid), dimension_id: dimensionId, name, shortcut_key: shortcutKey } };
  });

  ipcMain.handle(IPC.TAG_UPDATE, async (_event, id, updates) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const fields = []; const values = [];
    for (const [key, value] of Object.entries(updates)) {
      if (['name','shortcut_key','sort_order'].includes(key)) { fields.push(`${key} = ?`); values.push(value); }
    }
    if (fields.length > 0) {
      currentProjectDb.prepare(`UPDATE tag SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);
    }
    return { data: true };
  });

  ipcMain.handle(IPC.TAG_DELETE, async (_event, id) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare('DELETE FROM tag WHERE id = ?').run(id);
    return { data: true };
  });

  ipcMain.handle(IPC.TAG_TOGGLE_ON_IMAGE, async (_event, imageId, tagId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const existing = currentProjectDb.prepare(
      'SELECT 1 FROM image_tag WHERE image_id = ? AND tag_id = ?'
    ).get(imageId, tagId);

    if (existing) {
      currentProjectDb.prepare('DELETE FROM image_tag WHERE image_id = ? AND tag_id = ?').run(imageId, tagId);
    } else {
      currentProjectDb.prepare('INSERT INTO image_tag (image_id, tag_id) VALUES (?, ?)').run(imageId, tagId);
    }
    currentProjectDb.prepare('UPDATE image SET updated_at = datetime(\'now\') WHERE id = ?').run(imageId);
    return { data: !existing };
  });

  ipcMain.handle(IPC.TAG_BATCH_APPLY, async (_event, imageIds, tagId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const insert = currentProjectDb.prepare('INSERT OR IGNORE INTO image_tag (image_id, tag_id) VALUES (?, ?)');
    const transaction = currentProjectDb.transaction(() => {
      for (const imageId of imageIds) insert.run(imageId, tagId);
    });
    transaction();
    return { data: true };
  });

  ipcMain.handle(IPC.TAG_GET_FOR_IMAGE, async (_event, imageId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const tags = currentProjectDb.prepare(`
      SELECT t.*, td.name as dimension_name, td.color as dimension_color
      FROM image_tag it JOIN tag t ON t.id = it.tag_id
      JOIN tag_dimension td ON td.id = t.dimension_id WHERE it.image_id = ?
      ORDER BY td.sort_order, t.sort_order
    `).all(imageId);
    return { data: tags };
  });

  // ---- IMAGE IMPORT ----
  ipcMain.handle(IPC.IMAGE_IMPORT_FILES, async (_event, filePaths) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    return imageService.importFiles(filePaths, currentProjectDb);
  });

  ipcMain.handle(IPC.IMAGE_IMPORT_FOLDER, async (_event, folderPath) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    return imageService.importFolder(folderPath, currentProjectDb);
  });

  ipcMain.handle(IPC.IMAGE_IMPORT_CLIPBOARD, async () => ({ data: { imported: 0 } }));
  ipcMain.handle(IPC.IMAGE_GET_BATCH_STATUS, async (_event, batchId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const images = currentProjectDb.prepare('SELECT COUNT(*) as count FROM image WHERE import_batch = ?').get(batchId);
    return { data: images };
  });

  // ---- THUMBNAILS ----
  ipcMain.handle(IPC.THUMBNAIL_GET_PATH, async (_event, fileHash) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const cache = currentProjectDb.prepare('SELECT thumb_path FROM thumbnail_cache WHERE file_hash = ?').get(fileHash);
    return { data: cache?.thumb_path || null };
  });

  ipcMain.handle(IPC.THUMBNAIL_GENERATE_BATCH, async (_event, imageIds) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    return imageService.generateBatchThumbnails(imageIds, currentProjectDb);
  });

  ipcMain.handle(IPC.THUMBNAIL_CLEAR_CACHE, async () => {
    const cachePath = getThumbnailCachePath();
    try { const files = fs.readdirSync(cachePath); for (const f of files) fs.unlinkSync(path.join(cachePath, f)); } catch (err) { /* ignore */ }
    if (currentProjectDb) currentProjectDb.prepare('DELETE FROM thumbnail_cache').run();
    return { data: true };
  });

  // ---- EXPORT ----
  ipcMain.handle(IPC.EXPORT_COPY_FILES, async (_event, imageIds, destFolder) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    return exportService.copyFiles(imageIds, destFolder, currentProjectDb);
  });
  ipcMain.handle(IPC.EXPORT_MOVE_FILES, async (_event, imageIds, destFolder) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    return exportService.moveFiles(imageIds, destFolder, currentProjectDb);
  });
  ipcMain.handle(IPC.EXPORT_HTML_CATALOG, async (_event, imageIds, destPath) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    return exportService.generateHtmlCatalog(imageIds, destPath, currentProjectDb);
  });
  ipcMain.handle(IPC.EXPORT_CSV_DATA, async (_event, imageIds, destPath) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    return exportService.generateCsv(imageIds, destPath, currentProjectDb);
  });
  ipcMain.handle(IPC.EXPORT_CANCEL, async () => ({ data: true }));

  // ---- IMAGE QUERIES ----
  ipcMain.handle(IPC.IMAGE_LIST, async (_event, filters) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    let query = 'SELECT * FROM image WHERE 1=1';
    const params = [];
    if (filters?.tagIds?.length > 0) {
      const ph = filters.tagIds.map(() => '?').join(',');
      query += ` AND id IN (SELECT image_id FROM image_tag WHERE tag_id IN (${ph}))`;
      params.push(...filters.tagIds);
    }
    if (filters?.minRating > 0) { query += ' AND rating >= ?'; params.push(filters.minRating); }
    if (filters?.favoriteOnly) { query += ' AND is_favorite = 1'; }
    if (filters?.batch) { query += ' AND import_batch = ?'; params.push(filters.batch); }
    if (filters?.untaggedOnly) { query += ' AND id NOT IN (SELECT DISTINCT image_id FROM image_tag)'; }
    const allowedSorts = ['file_name','file_size','created_at','updated_at','rating'];
    const safeSort = allowedSorts.includes(filters?.sortBy) ? filters.sortBy : 'created_at';
    const safeDir = filters?.sortDirection === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${safeSort} ${safeDir}`;
    if (filters?.limit !== undefined) { query += ' LIMIT ? OFFSET ?'; params.push(filters.limit, filters.offset || 0); }
    const images = currentProjectDb.prepare(query).all(...params);
    return { data: images };
  });

  ipcMain.handle(IPC.IMAGE_GET, async (_event, imageId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const image = currentProjectDb.prepare('SELECT * FROM image WHERE id = ?').get(imageId);
    return { data: image || null };
  });

  ipcMain.handle(IPC.IMAGE_GET_NEIGHBORS, async (_event, imageId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const prev = currentProjectDb.prepare('SELECT id FROM image WHERE id < ? ORDER BY id DESC LIMIT 1').get(imageId);
    const next = currentProjectDb.prepare('SELECT id FROM image WHERE id > ? ORDER BY id ASC LIMIT 1').get(imageId);
    return { data: { prev: prev?.id || null, next: next?.id || null } };
  });

  ipcMain.handle(IPC.IMAGE_DELETE, async (_event, imageId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare('DELETE FROM image WHERE id = ?').run(imageId);
    const count = currentProjectDb.prepare('SELECT COUNT(*) as count FROM image').get();
    currentProjectDb.prepare('UPDATE project SET image_count = ?, updated_at = datetime(\'now\')').run(count.count);
    return { data: true };
  });

  ipcMain.handle(IPC.IMAGE_BATCH_DELETE, async (_event, imageIds) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const del = currentProjectDb.prepare('DELETE FROM image WHERE id = ?');
    const transaction = currentProjectDb.transaction(() => { for (const id of imageIds) del.run(id); });
    transaction();
    const count = currentProjectDb.prepare('SELECT COUNT(*) as count FROM image').get();
    currentProjectDb.prepare('UPDATE project SET image_count = ?, updated_at = datetime(\'now\')').run(count.count);
    return { data: true };
  });

  ipcMain.handle(IPC.IMAGE_UPDATE_RATING, async (_event, imageId, rating) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const transaction = currentProjectDb.transaction(() => {
      currentProjectDb.prepare('UPDATE image SET rating = ?, updated_at = datetime(\'now\') WHERE id = ?').run(rating, imageId);

      // Remove existing rating-dimension tag links for this image
      currentProjectDb.prepare(`
        DELETE FROM image_tag WHERE image_id = ? AND tag_id IN (
          SELECT t.id FROM tag t JOIN tag_dimension td ON td.id = t.dimension_id WHERE td.is_rating = 1
        )
      `).run(imageId);

      // If rating > 0, link the corresponding rating tag (1星~5星, sort_order = rating-1)
      if (rating > 0) {
        const ratingTag = currentProjectDb.prepare(`
          SELECT t.id FROM tag t JOIN tag_dimension td ON td.id = t.dimension_id
          WHERE td.is_rating = 1 AND t.sort_order = ?
        `).get(rating - 1);
        if (ratingTag) {
          currentProjectDb.prepare('INSERT INTO image_tag (image_id, tag_id) VALUES (?, ?)').run(imageId, ratingTag.id);
        }
      }
    });
    transaction();
    return { data: true };
  });

  ipcMain.handle(IPC.IMAGE_TOGGLE_FAVORITE, async (_event, imageId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare(`UPDATE image SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?`).run(imageId);
    const img = currentProjectDb.prepare('SELECT is_favorite FROM image WHERE id = ?').get(imageId);
    return { data: img?.is_favorite === 1 };
  });

  ipcMain.handle(IPC.IMAGE_GET_HISTOGRAM, async (_event, imagePath) => {
    if (!imagePath) return { error: 'No image path' };
    try {
      const { data, info } = await sharp(imagePath)
        .resize(512, 512, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const bins = { red: new Uint32Array(256), green: new Uint32Array(256), blue: new Uint32Array(256) };
      const channels = info.channels;
      for (let i = 0; i < data.length; i += channels) {
        bins.red[data[i]]++;
        bins.green[data[i + 1]]++;
        bins.blue[data[i + 2]]++;
      }

      let max = 0;
      const red = Array.from(bins.red);
      const green = Array.from(bins.green);
      const blue = Array.from(bins.blue);
      for (let j = 0; j < 256; j++) {
        max = Math.max(max, red[j], green[j], blue[j]);
      }

      return { data: { red, green, blue, max } };
    } catch (err) {
      return { error: err.message };
    }
  });

  // ---- ANNOTATIONS ----
  ipcMain.handle(IPC.ANNOTATION_LIST, async (_event, imageId) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const annotations = currentProjectDb.prepare('SELECT * FROM annotation WHERE image_id = ? ORDER BY created_at DESC').all(imageId);
    return { data: annotations };
  });
  ipcMain.handle(IPC.ANNOTATION_CREATE, async (_event, imageId, type, content) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const result = currentProjectDb.prepare('INSERT INTO annotation (image_id, type, content) VALUES (?, ?, ?)').run(imageId, type, content);
    return { data: { id: Number(result.lastInsertRowid) } };
  });
  ipcMain.handle(IPC.ANNOTATION_UPDATE, async (_event, id, content) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare('UPDATE annotation SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(content, id);
    return { data: true };
  });
  ipcMain.handle(IPC.ANNOTATION_DELETE, async (_event, id) => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    currentProjectDb.prepare('DELETE FROM annotation WHERE id = ?').run(id);
    return { data: true };
  });

  // ---- STATISTICS ----
  ipcMain.handle(IPC.STATS_TAG_FREQUENCY, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const data = currentProjectDb.prepare(`
      SELECT t.name, td.name as dimension_name, td.color, COUNT(it.image_id) as count
      FROM tag t JOIN tag_dimension td ON td.id = t.dimension_id
      LEFT JOIN image_tag it ON it.tag_id = t.id
      WHERE td.is_rating = 0
      GROUP BY t.id ORDER BY count DESC
    `).all();
    return { data };
  });
  ipcMain.handle(IPC.STATS_CO_OCCURRENCE, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const data = currentProjectDb.prepare(`
      SELECT t1.name as tag1, t2.name as tag2, COUNT(*) as count
      FROM image_tag it1 JOIN image_tag it2 ON it1.image_id = it2.image_id AND it1.tag_id < it2.tag_id
      JOIN tag t1 ON t1.id = it1.tag_id JOIN tag t2 ON t2.id = it2.tag_id
      GROUP BY it1.tag_id, it2.tag_id HAVING count > 1 ORDER BY count DESC LIMIT 100
    `).all();
    return { data };
  });
  ipcMain.handle(IPC.STATS_TAGGING_PROGRESS, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const total = currentProjectDb.prepare('SELECT COUNT(*) as count FROM image').get();
    const tagged = currentProjectDb.prepare(`
      SELECT COUNT(*) as count FROM image
      WHERE id IN (SELECT DISTINCT image_id FROM image_tag)
         OR rating > 0
    `).get();
    return { data: { total: total.count, tagged: tagged.count } };
  });

  ipcMain.handle(IPC.STATS_RATING_DISTRIBUTION, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const data = currentProjectDb.prepare(`
      SELECT rating, COUNT(*) as count FROM image WHERE rating > 0
      GROUP BY rating ORDER BY rating
    `).all();
    return { data };
  });
  ipcMain.handle(IPC.STATS_SYNC_RATING_TAGS, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    // One-time sync: link existing image ratings to rating dimension tags
    const ratingTags = currentProjectDb.prepare(`
      SELECT t.id, t.sort_order FROM tag t
      JOIN tag_dimension td ON td.id = t.dimension_id
      WHERE td.is_rating = 1 ORDER BY t.sort_order
    `).all();
    if (ratingTags.length === 0) return { data: { synced: 0 } };

    const tagByRating = {};
    for (const t of ratingTags) {
      tagByRating[t.sort_order + 1] = t.id;
    }

    let synced = 0;
    const transaction = currentProjectDb.transaction(() => {
      const insert = currentProjectDb.prepare('INSERT OR IGNORE INTO image_tag (image_id, tag_id) VALUES (?, ?)');
      const images = currentProjectDb.prepare('SELECT id, rating FROM image WHERE rating > 0').all();
      for (const img of images) {
        const tagId = tagByRating[img.rating];
        if (tagId) {
          const result = insert.run(img.id, tagId);
          if (result.changes > 0) synced++;
        }
      }
    });
    transaction();
    return { data: { synced } };
  });
  ipcMain.handle(IPC.STATS_IMPORT_HISTORY, async () => {
    if (!currentProjectDb) return { error: '没有打开的项目' };
    const data = currentProjectDb.prepare(`
      SELECT import_batch, COUNT(*) as count, MIN(created_at) as date
      FROM image WHERE import_batch IS NOT NULL GROUP BY import_batch ORDER BY date DESC
    `).all();
    return { data };
  });

  console.log('[IPC] All handlers registered');
}
