import React, { memo } from 'react';
import { useObserver } from '../../hooks/useObserver';
import { getThumbnailUrl } from '../../hooks/useThumbnail';

const ThumbnailCell = memo(({ columnIndex, rowIndex, style, data }) => {
  const { images, cols, cw, cellSize, currentId, selectedIds, onClick } = data;
  const i = rowIndex * cols + columnIndex;
  if (i >= images.length) return null;

  const img = images[i];
  const [ref, visible] = useObserver();
  const cur = img.id === currentId;
  const sel = selectedIds.includes(img.id);
  const h = cellSize - 8;

  return (
    <div style={style} className="p-0.5">
      <div ref={ref} onClick={e => onClick(img.id, e)}
        className={`relative w-full rounded-md overflow-hidden cursor-pointer group border-2 transition-all
          ${cur ? 'border-accent-500' : sel ? 'border-amber-500' : 'border-transparent hover:border-surface-600'}`}>
        <div className="w-full bg-surface-800 flex items-center justify-center overflow-hidden" style={{ height: h }}>
          {visible ? (
            <img src={getThumbnailUrl(img.file_hash)} alt={img.file_name} className="max-w-full max-h-full object-contain" loading="lazy" draggable={false} />
          ) : <div className="w-full h-full bg-surface-800 animate-pulse" />}
        </div>
        <div className="h-6 px-1.5 flex items-center justify-between">
          <p className="text-2xs text-slate-400 truncate flex-1">{img.file_name}</p>
          {img.rating > 0 && <span className="text-[10px] text-amber-400 shrink-0 ml-1">{'★'.repeat(img.rating)}</span>}
        </div>
        {img.is_favorite === 1 && <span className="absolute top-1 left-1 text-[10px] text-red-400">♥</span>}
      </div>
    </div>
  );
});

export default ThumbnailCell;
