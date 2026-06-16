import fs from 'node:fs';
import path from 'node:path';
import { getMainWindow } from '../windows.js';

export async function copyFiles(imageIds, destFolder, projectDb) {
  fs.mkdirSync(destFolder, { recursive: true });
  const win = getMainWindow();
  let completed = 0;

  const placeholders = imageIds.map(() => '?').join(',');
  const images = projectDb.prepare(
    `SELECT * FROM image WHERE id IN (${placeholders})`
  ).all(...imageIds);

  for (const img of images) {
    if (!fs.existsSync(img.file_path)) continue;
    const destPath = path.join(destFolder, img.file_name);
    let finalPath = destPath;
    let counter = 1;
    while (fs.existsSync(finalPath)) {
      const ext = path.extname(img.file_name);
      const base = path.basename(img.file_name, ext);
      finalPath = path.join(destFolder, `${base}_${counter}${ext}`);
      counter++;
    }
    fs.copyFileSync(img.file_path, finalPath);
    completed++;
    if (win && !win.isDestroyed()) {
      win.webContents.send('event:exportProgress', { current: completed, total: images.length });
    }
  }

  return { data: { copied: completed, total: images.length } };
}

export async function moveFiles(imageIds, destFolder, projectDb) {
  fs.mkdirSync(destFolder, { recursive: true });
  const win = getMainWindow();
  let completed = 0;

  const placeholders = imageIds.map(() => '?').join(',');
  const images = projectDb.prepare(
    `SELECT * FROM image WHERE id IN (${placeholders})`
  ).all(...imageIds);

  for (const img of images) {
    if (!fs.existsSync(img.file_path)) continue;
    const destPath = path.join(destFolder, img.file_name);
    let finalPath = destPath;
    let counter = 1;
    while (fs.existsSync(finalPath)) {
      const ext = path.extname(img.file_name);
      const base = path.basename(img.file_name, ext);
      finalPath = path.join(destFolder, `${base}_${counter}${ext}`);
      counter++;
    }
    fs.renameSync(img.file_path, finalPath);
    projectDb.prepare('UPDATE image SET file_path = ? WHERE id = ?').run(finalPath, img.id);
    completed++;
    if (win && !win.isDestroyed()) {
      win.webContents.send('event:exportProgress', { current: completed, total: images.length });
    }
  }

  return { data: { moved: completed, total: images.length } };
}

export async function generateHtmlCatalog(imageIds, destPath, projectDb) {
  const placeholders = imageIds.map(() => '?').join(',');
  const images = projectDb.prepare(
    `SELECT * FROM image WHERE id IN (${placeholders})`
  ).all(...imageIds);

  const imageTags = {};
  for (const img of images) {
    const tags = projectDb.prepare(`
      SELECT t.name, td.name as dim_name, td.color
      FROM image_tag it JOIN tag t ON t.id = it.tag_id
      JOIN tag_dimension td ON td.id = t.dimension_id WHERE it.image_id = ?
    `).all(img.id);
    imageTags[img.id] = tags;
  }

  const catalogName = path.basename(destPath, '.html');
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>${catalogName} - PhotoClass</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Microsoft YaHei',sans-serif;background:#1a1a2e;color:#e0e0e0;padding:20px}
h1{text-align:center;margin-bottom:30px;color:#a78bfa}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.card{background:#16213e;border-radius:12px;overflow:hidden;border:1px solid #2a2a4a}
.card img{width:100%;height:240px;object-fit:cover}
.card-body{padding:12px}
.card-title{font-size:14px;margin-bottom:8px}
.tags{display:flex;flex-wrap:wrap;gap:4px}
.tag{padding:2px 8px;border-radius:12px;font-size:11px;color:white}
.rating{color:#f59e0b;margin-top:6px}
</style></head>
<body>
<h1>📸 ${catalogName}</h1>
<p style="text-align:center;color:#666;margin-bottom:30px">共 ${images.length} 张 · ${new Date().toLocaleString('zh-CN')}</p>
<div class="grid">`;

  for (const img of images) {
    const tags = imageTags[img.id] || [];
    const stars = img.rating > 0 ? '⭐'.repeat(img.rating) : '';
    let imgSrc = '';
    try {
      if (fs.existsSync(img.file_path)) {
        const imgData = fs.readFileSync(img.file_path);
        const ext = path.extname(img.file_path).toLowerCase().replace('.', '');
        const mime = ext === 'jpg' ? 'jpeg' : ext;
        imgSrc = `data:image/${mime};base64,${imgData.toString('base64')}`;
      }
    } catch (e) { /* ignore */ }

    html += `
<div class="card">
  ${imgSrc ? `<img src="${imgSrc}" alt="${img.file_name}">` : '<div style="height:240px;background:#0f0f23;display:flex;align-items:center;justify-content:center;color:#666">图片丢失</div>'}
  <div class="card-body">
    <div class="card-title">${img.file_name}</div>
    ${stars ? `<div class="rating">${stars}</div>` : ''}
    <div class="tags">${tags.map(t => `<span class="tag" style="background:${t.color}">${t.dim_name}: ${t.name}</span>`).join('')}</div>
  </div>
</div>`;
  }

  html += '\n</div>\n</body>\n</html>';
  fs.writeFileSync(destPath, html, 'utf-8');
  return { data: { path: destPath } };
}

export async function generateCsv(imageIds, destPath, projectDb) {
  const placeholders = imageIds.map(() => '?').join(',');
  const images = projectDb.prepare(
    `SELECT * FROM image WHERE id IN (${placeholders})`
  ).all(...imageIds);

  const lines = [['文件名', '路径', '评分', '收藏', '标签'].map(c => `"${c}"`).join(',')];

  for (const img of images) {
    const tags = projectDb.prepare(`
      SELECT t.name, td.name as dim_name FROM image_tag it
      JOIN tag t ON t.id = it.tag_id JOIN tag_dimension td ON td.id = t.dimension_id WHERE it.image_id = ?
    `).all(img.id);
    const tagStr = tags.map(t => `${t.dim_name}:${t.name}`).join('; ');
    lines.push([`"${img.file_name}"`, `"${img.file_path}"`, img.rating, img.is_favorite ? '是' : '否', `"${tagStr}"`].join(','));
  }

  fs.writeFileSync(destPath, '﻿' + lines.join('\n'), 'utf-8');
  return { data: { path: destPath } };
}
