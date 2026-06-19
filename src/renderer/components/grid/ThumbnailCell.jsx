import React, { memo } from 'react';
import { useObserver } from '../../hooks/useObserver';
import { getThumbnailUrl } from '../../hooks/useThumbnail';
import Icon from '../common/Icon';

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
        className={`relative w-full rounded-xl overflow-hidden cursor-pointer group border-2 transition-all duration-200
          ${cur ? 'border-accent-500 shadow-ios-md' : sel ? 'border-ios-orange shadow-ios' : 'border-transparent hover:border-surface-300 hover:shadow-ios'}`}>
        <div className="w-full bg-surface-200 flex items-center justify-center overflow-hidden rounded-t-lg" style={{ height: h }}>
          {visible ? (
            <img src={getThumbnailUrl(img.file_hash)} alt={img.file_name} className="max-w-full max-h-full object-contain" loading="lazy" draggable={false} />
          ) : <div className="w-full h-full bg-surface-200 animate-pulse" />}
        </div>
        <div className="h-6 px-1.5 flex items-center justify-between bg-white">
          <p className="text-2xs text-surface-800 truncate flex-1">{img.file_name}</p>
          {img.rating > 0 && <span className="text-[10px] text-ios-orange shrink-0 ml-1">{'★'.repeat(img.rating)}</span>}
        </div>
        {img.is_favorite === 1 && (
          <span className="absolute top-1 left-1">
            <Icon name="heart-filled" size={12} className="text-ios-red" />
          </span>
        )}
      </div>
    </div>
  );
});

export default ThumbnailCell;
