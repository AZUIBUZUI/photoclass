-- ============================================================
-- PHOTOCLASS SCHEMA
-- Each .photoclass project file contains this schema
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ============================================================
-- PROJECT METADATA (self-referencing row in each project file)
-- ============================================================

CREATE TABLE IF NOT EXISTS project (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    db_path         TEXT NOT NULL UNIQUE,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    image_count     INTEGER NOT NULL DEFAULT 0,
    description     TEXT DEFAULT ''
);

-- ============================================================
-- TAG DIMENSIONS (categories of tags)
-- ============================================================

CREATE TABLE IF NOT EXISTS tag_dimension (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    color           TEXT NOT NULL DEFAULT '#6366f1',
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_multiselect  INTEGER NOT NULL DEFAULT 1,
    is_rating       INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- INDIVIDUAL TAGS WITHIN DIMENSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS tag (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    dimension_id    INTEGER NOT NULL REFERENCES tag_dimension(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    shortcut_key    TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(dimension_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tag_dimension ON tag(dimension_id);

-- ============================================================
-- IMPORTED IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS image (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path       TEXT NOT NULL UNIQUE,
    file_name       TEXT NOT NULL,
    file_size       INTEGER NOT NULL,
    file_hash       TEXT NOT NULL,
    width           INTEGER,
    height          INTEGER,
    format          TEXT,
    thumbnail_hash  TEXT,
    import_batch    TEXT,
    is_favorite     INTEGER NOT NULL DEFAULT 0,
    rating          INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_image_hash ON image(file_hash);
CREATE INDEX IF NOT EXISTS idx_image_batch ON image(import_batch);
CREATE INDEX IF NOT EXISTS idx_image_rating ON image(rating);
CREATE INDEX IF NOT EXISTS idx_image_favorite ON image(is_favorite);

-- ============================================================
-- IMAGE-TAG ASSOCIATIONS (many-to-many)
-- ============================================================

CREATE TABLE IF NOT EXISTS image_tag (
    image_id        INTEGER NOT NULL REFERENCES image(id) ON DELETE CASCADE,
    tag_id          INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (image_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_image_tag_image ON image_tag(image_id);
CREATE INDEX IF NOT EXISTS idx_image_tag_tag ON image_tag(tag_id);

-- ============================================================
-- NOTES AND ANNOTATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS annotation (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id        INTEGER NOT NULL REFERENCES image(id) ON DELETE CASCADE,
    type            TEXT NOT NULL DEFAULT 'note',
    content         TEXT,
    position_x      REAL,
    position_y      REAL,
    overlay_data    TEXT,
    color           TEXT DEFAULT '#FFD700',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_annotation_image ON annotation(image_id);

-- ============================================================
-- FILTER PRESETS (saved searches)
-- ============================================================

CREATE TABLE IF NOT EXISTS filter_preset (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    filter_json     TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- SHORTCUT CUSTOMIZATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS shortcut_binding (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id       TEXT NOT NULL UNIQUE,
    key_combo       TEXT NOT NULL,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- APP SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS app_settings (
    key             TEXT PRIMARY KEY,
    value           TEXT NOT NULL
);

-- ============================================================
-- THUMBNAIL CACHE TRACKING (per-project)
-- ============================================================

CREATE TABLE IF NOT EXISTS thumbnail_cache (
    file_hash       TEXT PRIMARY KEY,
    thumb_path      TEXT NOT NULL,
    thumb_size      INTEGER NOT NULL,
    source_width    INTEGER,
    source_height   INTEGER,
    generated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    last_accessed   TEXT NOT NULL DEFAULT (datetime('now'))
);
