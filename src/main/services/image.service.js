import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { computeFileHash } from '../utils/hash.js';
import { isImageFile, getFileType } from '../utils/fileTypes.js';
import { THUMBNAIL_SIZE, THUMBNAIL_QUALITY } from '../../shared/constants.js';
import { getThumbnailCachePath } from '../utils/paths.js';
import { getMainWindow } from '../windows.js';

export async function importFiles(filePaths, projectDb) {
  if (!projectDb) return { error: 'No project open' };

  const imageFiles = filePaths.filter(isImageFile);
  if (imageFiles.length === 0) {
    return { data: { imported: 0, skipped: 0, total: 0 } };
  }

  const batchId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  let imported = 0;
  let skipped = 0;

  const insertImage = projectDb.prepare(`
    INSERT INTO image (file_path, file_name, file_size, file_hash, width, height, format, thumbnail_hash, import_batch)
    VALUES (@file_path, @file_name, @file_size, @file_hash, @width, @height, @format, @thumbnail_hash, @import_batch)
  `);

  const checkDup = projectDb.prepare('SELECT id FROM image WHERE file_hash = ?');
  const win = getMainWindow();

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i];
    const fileName = path.basename(filePath);

    try {
      const fileHash = await computeFileHash(filePath);
      const existing = checkDup.get(fileHash);
      if (existing) { skipped++; continue; }

      const stats = fs.statSync(filePath);
      let width = 0, height = 0, fmt = '';
      try {
        const metadata = await sharp(filePath).metadata();
        width = metadata.width || 0;
        height = metadata.height || 0;
        fmt = metadata.format || getFileType(filePath);
      } catch (e) {
        fmt = getFileType(filePath);
      }

      await generateThumbnail(filePath, fileHash, projectDb);

      insertImage.run({
        file_path: filePath, file_name: fileName, file_size: stats.size,
        file_hash: fileHash, width, height, format: fmt,
        thumbnail_hash: fileHash, import_batch: batchId,
      });

      imported++;
    } catch (err) {
      console.error(`Failed to import: ${filePath}`, err.message);
    }

    if (win && !win.isDestroyed()) {
      win.webContents.send('event:importProgress', {
        current: i + 1, total: imageFiles.length, imported, skipped,
      });
    }
  }

  const count = projectDb.prepare('SELECT COUNT(*) as count FROM image').get();
  projectDb.prepare('UPDATE project SET image_count = ?, updated_at = datetime(\'now\')').run(count.count);

  return { data: { imported, skipped, total: imageFiles.length, batchId } };
}

export async function importFolder(folderPath, projectDb) {
  if (!projectDb) return { error: 'No project open' };

  const files = [];
  function walkDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walkDir(fullPath);
        else if (entry.isFile() && isImageFile(fullPath)) files.push(fullPath);
      }
    } catch (err) {
      console.error(`Error reading directory: ${dir}`, err.message);
    }
  }

  walkDir(folderPath);
  return importFiles(files, projectDb);
}

export async function generateThumbnail(filePath, fileHash, projectDb) {
  const cachePath = getThumbnailCachePath();
  const thumbFileName = `${fileHash}.webp`;
  const thumbPath = path.join(cachePath, thumbFileName);

  const existing = projectDb.prepare(
    'SELECT thumb_path FROM thumbnail_cache WHERE file_hash = ?'
  ).get(fileHash);

  if (existing && fs.existsSync(path.join(cachePath, existing.thumb_path))) {
    projectDb.prepare(
      'UPDATE thumbnail_cache SET last_accessed = datetime(\'now\') WHERE file_hash = ?'
    ).run(fileHash);
    return;
  }

  try {
    const metadata = await sharp(filePath).metadata();
    await sharp(filePath)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toFile(thumbPath);

    const thumbStats = fs.statSync(thumbPath);
    projectDb.prepare(`
      INSERT OR REPLACE INTO thumbnail_cache (file_hash, thumb_path, thumb_size, source_width, source_height)
      VALUES (?, ?, ?, ?, ?)
    `).run(fileHash, thumbFileName, thumbStats.size, metadata.width, metadata.height);
  } catch (err) {
    console.error(`Thumbnail generation failed for ${filePath}:`, err.message);
  }
}

export async function generateBatchThumbnails(imageIds, projectDb) {
  const win = getMainWindow();
  let completed = 0;
  const CONCURRENCY = 4;

  const placeholders = imageIds.map(() => '?').join(',');
  const imageData = projectDb.prepare(
    `SELECT id, file_path, file_hash FROM image WHERE id IN (${placeholders})`
  ).all(...imageIds);

  // Simple concurrency limiter
  const queue = [...imageData];
  async function worker() {
    while (queue.length > 0) {
      const img = queue.shift();
      await generateThumbnail(img.file_path, img.file_hash, projectDb);
      completed++;
      if (win && !win.isDestroyed()) {
        win.webContents.send('event:importProgress', { current: completed, total: imageData.length });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker()));
  return { data: { generated: completed } };
}
