// All IPC channel name constants
// Pattern: domain:action

export const IPC = {
  PROJECT_LIST: 'project:list',
  PROJECT_CREATE: 'project:create',
  PROJECT_OPEN: 'project:open',
  PROJECT_CLOSE: 'project:close',
  PROJECT_DELETE: 'project:delete',
  PROJECT_GET_INFO: 'project:getInfo',

  IMAGE_IMPORT_FILES: 'image:importFiles',
  IMAGE_IMPORT_FOLDER: 'image:importFolder',
  IMAGE_IMPORT_CLIPBOARD: 'image:importClipboard',
  IMAGE_GET_BATCH_STATUS: 'image:getBatchStatus',

  IMAGE_LIST: 'image:list',
  IMAGE_GET: 'image:get',
  IMAGE_GET_NEIGHBORS: 'image:getNeighbors',
  IMAGE_DELETE: 'image:delete',
  IMAGE_BATCH_DELETE: 'image:batchDelete',
  IMAGE_UPDATE_RATING: 'image:updateRating',
  IMAGE_TOGGLE_FAVORITE: 'image:toggleFavorite',

  THUMBNAIL_GET_PATH: 'thumbnail:getPath',
  THUMBNAIL_GENERATE_BATCH: 'thumbnail:generateBatch',
  THUMBNAIL_CLEAR_CACHE: 'thumbnail:clearCache',

  TAG_DIMENSION_LIST: 'tag:dimensionList',
  TAG_DIMENSION_CREATE: 'tag:dimensionCreate',
  TAG_DIMENSION_UPDATE: 'tag:dimensionUpdate',
  TAG_DIMENSION_DELETE: 'tag:dimensionDelete',
  TAG_DIMENSION_REORDER: 'tag:dimensionReorder',
  TAG_LIST: 'tag:list',
  TAG_CREATE: 'tag:create',
  TAG_UPDATE: 'tag:update',
  TAG_DELETE: 'tag:delete',
  TAG_TOGGLE_ON_IMAGE: 'tag:toggleOnImage',
  TAG_BATCH_APPLY: 'tag:batchApply',
  TAG_GET_FOR_IMAGE: 'tag:getForImage',

  SEARCH_IMAGES: 'search:images',
  SEARCH_TAG_COUNTS: 'search:tagCounts',
  FILTER_PRESET_SAVE: 'filter:presetSave',
  FILTER_PRESET_LOAD: 'filter:presetLoad',
  FILTER_PRESET_DELETE: 'filter:presetDelete',
  FILTER_PRESET_LIST: 'filter:presetList',

  ANNOTATION_LIST: 'annotation:list',
  ANNOTATION_CREATE: 'annotation:create',
  ANNOTATION_UPDATE: 'annotation:update',
  ANNOTATION_DELETE: 'annotation:delete',

  EXPORT_COPY_FILES: 'export:copyFiles',
  EXPORT_MOVE_FILES: 'export:moveFiles',
  EXPORT_HTML_CATALOG: 'export:htmlCatalog',
  EXPORT_CSV_DATA: 'export:csvData',
  EXPORT_CANCEL: 'export:cancel',

  STATS_TAG_FREQUENCY: 'stats:tagFrequency',
  STATS_CO_OCCURRENCE: 'stats:coOccurrence',
  STATS_TAGGING_PROGRESS: 'stats:taggingProgress',
  STATS_RATING_DISTRIBUTION: 'stats:ratingDistribution',
  STATS_SYNC_RATING_TAGS: 'stats:syncRatingTags',
  STATS_IMPORT_HISTORY: 'stats:importHistory',

  SHORTCUT_LIST: 'shortcut:list',
  SHORTCUT_UPDATE: 'shortcut:update',
  SHORTCUT_RESET: 'shortcut:reset',
  SHORTCUT_RESET_ALL: 'shortcut:resetAll',

  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  APP_GET_VERSION: 'app:getVersion',
  APP_OPEN_EXTERNAL: 'app:openExternal',
  APP_SHOW_IN_FOLDER: 'app:showInFolder',
  APP_GET_PLATFORM: 'app:getPlatform',

  DIALOG_OPEN_FILE: 'dialog:openFile',
  DIALOG_OPEN_FOLDER: 'dialog:openFolder',
  DIALOG_SAVE_FILE: 'dialog:saveFile',
  DIALOG_CONFIRM: 'dialog:confirm',

  EVENT_IMPORT_PROGRESS: 'event:importProgress',
  EVENT_IMPORT_COMPLETE: 'event:importComplete',
  EVENT_EXPORT_PROGRESS: 'event:exportProgress',
  EVENT_EXPORT_COMPLETE: 'event:exportComplete',
  EVENT_SHORTCUT_TRIGGERED: 'event:shortcutTriggered',
  EVENT_PROJECT_CHANGED: 'event:projectChanged',
};
