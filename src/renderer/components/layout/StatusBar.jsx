import React from 'react';
import useStore from '../../stores';

export default function StatusBar() {
  const images = useStore(s => s.images);
  const currentId = useStore(s => s.currentId);
  const selectedIds = useStore(s => s.selectedIds);
  const filterTagIds = useStore(s => s.filterTagIds);
  const importing = useStore(s => s.importing);
  const importProgress = useStore(s => s.importProgress);

  const idx = currentId ? images.findIndex(i => i.id === currentId) + 1 : 0;
  const filters = filterTagIds.length;

  return (
    <div className="h-7 shrink-0 bg-white/90 backdrop-blur border-t border-surface-200 flex items-center justify-between px-3 text-2xs text-surface-900 z-10">
      <div className="flex items-center gap-3">
        {importing ? (
          <span>{importProgress.current}/{importProgress.total} 导入中...</span>
        ) : (
          <span>共 {images.length} 张{currentId ? ` · ${idx}/${images.length}` : ''}{selectedIds.length > 0 ? ` · ${selectedIds.length} 选中` : ''}</span>
        )}
      </div>
      <span>{filters > 0 ? <span className="text-accent-500">筛选: {filters} 条件</span> : ''}</span>
    </div>
  );
}
