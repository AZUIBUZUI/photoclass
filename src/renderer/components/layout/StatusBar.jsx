import React from 'react';
import useStore from '../../stores';

export default function StatusBar() {
  const images = useStore(s => s.images);
  const currentId = useStore(s => s.currentId);
  const selectedIds = useStore(s => s.selectedIds);
  const filterTagIds = useStore(s => s.filterTagIds);

  const idx = currentId ? images.findIndex(i => i.id === currentId) + 1 : 0;

  return (
    <div className="h-7 shrink-0 bg-surface-900 border-t border-surface-800 flex items-center justify-between px-3 text-2xs text-slate-500">
      <span>共 {images.length} 张{currentId ? ` · ${idx}/${images.length}` : ''}{selectedIds.length > 0 ? ` · ${selectedIds.length} 选中` : ''}</span>
      <span>{filterTagIds.length > 0 ? `筛选: ${filterTagIds.length} 条件` : ''}</span>
    </div>
  );
}
