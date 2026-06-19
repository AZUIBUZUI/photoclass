import React, { useEffect, useCallback, useRef } from 'react';
import useStore from '../stores';
import ImageViewer from '../components/viewer/ImageViewer';
import RatingStrip from '../components/viewer/RatingStrip';
import TagSidePanel from '../components/tagging/TagSidePanel';
import Filmstrip from '../components/grid/Filmstrip';
import FilterBar from '../components/filter/FilterBar';
import DropZone from '../components/common/DropZone';
import { useShortcuts } from '../features/shortcuts/useShortcuts';

export default function BrowsePage() {
  const open = useStore(s => s.isProjectOpen);
  const images = useStore(s => s.images);
  const setImages = useStore(s => s.setImages);
  const currentId = useStore(s => s.currentId);
  const setCurrentId = useStore(s => s.setCurrentId);
  const sortBy = useStore(s => s.sortBy);
  const sortDir = useStore(s => s.sortDir);
  const filterTagIds = useStore(s => s.filterTagIds);
  const filterMinRating = useStore(s => s.filterMinRating);
  const filterFavOnly = useStore(s => s.filterFavOnly);
  const filterUntagged = useStore(s => s.filterUntagged);
  const fullscreen = useStore(s => s.fullscreen);
  const showFilterBar = useStore(s => s.showFilterBar);
  const setImporting = useStore(s => s.setImporting);
  const setImportProgress = useStore(s => s.setImportProgress);
  const addToast = useStore(s => s.addToast);
  const setAutoAdvance = useStore(s => s.setAutoAdvance);
  const setCellSize = useStore(s => s.setCellSize);

  const restoredRef = useRef(false);
  const hasFilters = filterTagIds.length > 0 || filterMinRating > 0 || filterFavOnly || filterUntagged;

  useShortcuts();

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [a, c] = await Promise.all([
        window.api.invoke('settings:get', 'autoAdvance'),
        window.api.invoke('settings:get', 'gridCellSize'),
      ]);
      if (a.data !== null) setAutoAdvance(a.data === 'true');
      if (c.data !== null) setCellSize(Number(c.data));
    })();
  }, [open]);

  const load = useCallback(async () => {
    if (!open) return;
    const r = await window.api.invoke('image:list', {
      tagIds: filterTagIds.length ? filterTagIds : undefined,
      minRating: filterMinRating || undefined,
      favoriteOnly: filterFavOnly || undefined,
      untaggedOnly: filterUntagged || undefined,
      sortBy, sortDirection: sortDir,
    });
    if (r.data) {
      setImages(r.data);
      if (!restoredRef.current && r.data.length) {
        restoredRef.current = true;
        if (!hasFilters) {
          const saved = await window.api.invoke('settings:get', 'lastImageId');
          if (saved.data) {
            const savedId = Number(saved.data);
            if (r.data.some(img => img.id === savedId)) {
              setCurrentId(savedId);
              return;
            }
          }
        }
      }
      if (!currentId && r.data.length) setCurrentId(r.data[0].id);
    }
  }, [open, filterTagIds, filterMinRating, filterFavOnly, filterUntagged, sortBy, sortDir, hasFilters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (images.length && !currentId) setCurrentId(images[0].id);
  }, [images]);

  useEffect(() => {
    if (!open || !currentId || !restoredRef.current) return;
    window.api.invoke('settings:set', 'lastImageId', String(currentId));
  }, [currentId, open]);

  async function doImportFiles(filePaths) {
    setImporting(true);
    setImportProgress({ current: 0, total: filePaths.length });
    const unsub = window.api.onImportProgress(p => setImportProgress(p));
    const r = await window.api.invoke('image:importFiles', filePaths);
    unsub();
    setImporting(false);
    if (r.error) { addToast('导入失败: ' + r.error, 'error'); return; }
    addToast(`导入: ${r.data.imported} 新增, ${r.data.skipped} 跳过`, 'success');
    load();
  }

  async function doImportFolder(folderPath) {
    setImporting(true);
    const unsub = window.api.onImportProgress(p => setImportProgress(p));
    const r = await window.api.invoke('image:importFolder', folderPath);
    unsub();
    setImporting(false);
    if (r.error) { addToast('导入失败: ' + r.error, 'error'); return; }
    addToast(`导入: ${r.data.imported} 新增, ${r.data.skipped} 跳过`, 'success');
    load();
  }

  useEffect(() => {
    const h = e => doImportFolder(e.detail);
    window.addEventListener('import-folder', h);
    return () => window.removeEventListener('import-folder', h);
  }, []);

  if (!open) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {showFilterBar && <FilterBar onRefresh={load} />}

      {fullscreen ? (
        /* Fullscreen: only the image viewer, no chrome */
        <div className="flex-1 overflow-hidden">
          <ImageViewer />
        </div>
      ) : (
        <>
          {/* Main area: viewer + rating strip (center) + tag panel (right) */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <ImageViewer />
              <RatingStrip imageId={currentId} />
            </div>
            <TagSidePanel imageId={currentId} />
          </div>

          {/* Bottom filmstrip */}
          <Filmstrip />
        </>
      )}

      <DropZone onDrop={doImportFiles} />
    </div>
  );
}
