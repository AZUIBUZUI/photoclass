import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

export function getUserDataPath() {
  const p = path.join(app.getPath('userData'), 'PhotoClass');
  fs.mkdirSync(p, { recursive: true });
  return p;
}

export function getRegistryDbPath() {
  return path.join(getUserDataPath(), 'projects.db');
}

export function getThumbnailCachePath() {
  const p = path.join(getUserDataPath(), 'thumbnails');
  fs.mkdirSync(p, { recursive: true });
  return p;
}

export function getLogsPath() {
  const p = path.join(getUserDataPath(), 'logs');
  fs.mkdirSync(p, { recursive: true });
  return p;
}

export function getDefaultProjectsPath() {
  const p = path.join(app.getPath('pictures'), 'PhotoClass');
  fs.mkdirSync(p, { recursive: true });
  return p;
}
