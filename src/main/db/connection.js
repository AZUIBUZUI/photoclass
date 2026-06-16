import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { getRegistryDbPath } from '../utils/paths.js';

let registryDb = null;

export function getRegistryDb() {
  if (!registryDb) {
    const dbPath = getRegistryDbPath();
    registryDb = new Database(dbPath, {});
    registryDb.pragma('journal_mode = WAL');
    registryDb.pragma('foreign_keys = ON');
    registryDb.exec(`
      CREATE TABLE IF NOT EXISTS project_registry (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        db_path     TEXT NOT NULL UNIQUE,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        last_opened TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }
  return registryDb;
}

export function openProjectDb(dbPath) {
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(dbPath, {});
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function closeDb(db) {
  if (db && db.open) {
    try { db.close(); } catch (e) { /* already closed */ }
  }
}

export function closeRegistryDb() {
  if (registryDb) {
    try { registryDb.close(); } catch (e) { /* ignore */ }
    registryDb = null;
  }
}
