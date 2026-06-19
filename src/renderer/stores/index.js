import { create } from 'zustand';

const useStore = create((set, get) => ({

  // ==================== PROJECT ====================
  project: null,
  isProjectOpen: false,
  projects: [],

  setProject: (p) => set({ project: p, isProjectOpen: !!p }),
  setProjects: (ps) => set({ projects: ps }),

  // ==================== IMAGES ====================
  images: [],
  currentId: null,
  selectedIds: [],
  sortBy: 'created_at',
  sortDir: 'desc',
  cellSize: 200,
  zoom: 1,
  fullscreen: false,
  importing: false,
  importProgress: { current: 0, total: 0 },

  setImages: (imgs) => set({ images: imgs }),
  setCurrentId: (id) => set({ currentId: id }),
  setSortBy: (by) => set({ sortBy: by }),
  setSortDir: (d) => set({ sortDir: d }),
  setCellSize: (s) => set({ cellSize: s }),
  setZoom: (z) => set({ zoom: z }),
  setFullscreen: (f) => set({ fullscreen: f }),
  setImporting: (v) => set({ importing: v }),
  setImportProgress: (p) => set({ importProgress: p }),

  updateImage: (id, patch) => set(s => ({
    images: s.images.map(img => img.id === id ? { ...img, ...patch } : img),
  })),

  toggleSelect: (id) => {
    const sel = get().selectedIds;
    set({ selectedIds: sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id] });
  },
  clearSelection: () => set({ selectedIds: [] }),

  nextImage: () => {
    const { images, currentId } = get();
    const i = images.findIndex(img => img.id === currentId);
    if (i >= 0 && i < images.length - 1) set({ currentId: images[i + 1].id });
  },
  prevImage: () => {
    const { images, currentId } = get();
    const i = images.findIndex(img => img.id === currentId);
    if (i > 0) set({ currentId: images[i - 1].id });
  },

  // ==================== FILTERS ====================
  filterTagIds: [],
  filterMinRating: 0,
  filterFavOnly: false,
  filterUntagged: false,
  showFilterBar: false,

  setFilterTagIds: (ids) => set({ filterTagIds: ids }),
  toggleFilterTag: (id) => {
    const cur = get().filterTagIds;
    set({ filterTagIds: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  },
  setFilterMinRating: (r) => set({ filterMinRating: r }),
  setFilterFavOnly: (f) => set({ filterFavOnly: f }),
  setFilterUntagged: (u) => set({ filterUntagged: u }),
  setShowFilterBar: (v) => set({ showFilterBar: v }),
  clearFilters: () => set({ filterTagIds: [], filterMinRating: 0, filterFavOnly: false, filterUntagged: false }),

  // ==================== SETTINGS ====================
  autoAdvance: true,

  setAutoAdvance: (v) => set({ autoAdvance: v }),

  // ==================== TAG REFRESH ====================
  tagVersion: 0,
  bumpTagVersion: () => set(s => ({ tagVersion: s.tagVersion + 1 })),

  // ==================== UI ====================
  toasts: [],
  showHistogram: false,

  addToast: (msg, type) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    set(s => ({ toasts: [...s.toasts, { id, msg, type: type || 'info' }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 2500);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  setShowHistogram: (v) => set({ showHistogram: v }),
}));

export default useStore;
