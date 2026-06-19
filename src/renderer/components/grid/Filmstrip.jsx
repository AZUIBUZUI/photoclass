import React, { useRef, useEffect } from 'react';
import useStore from '../../stores';
import { getThumbnailUrl } from '../../hooks/useThumbnail';

export default function Filmstrip() {
  const images = useStore(s => s.images);
  const currentId = useStore(s => s.currentId);
  const setCurrentId = useStore(s => s.setCurrentId);
  const selectedIds = useStore(s => s.selectedIds);
  const toggleSelect = useStore(s => s.toggleSelect);
  const scrollRef = useRef(null);

  // Auto-scroll to current image
  useEffect(() => {
    if (!currentId || !scrollRef.current) return;
    const idx = images.findIndex(img => img.id === currentId);
    if (idx < 0) return;
    const child = scrollRef.current.children[idx];
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentId, images.length]);

  const onClick = (id, e) => {
    if (e.ctrlKey) {
      toggleSelect(id);
      return;
    }
    setCurrentId(id);
  };

  if (!images.length) return null;

  return (
    <div className="h-[72px] shrink-0 bg-surface-100 border-t border-surface-200 select-none">
      <div
        ref={scrollRef}
        className="flex items-center h-full px-2 gap-1.5 overflow-x-auto overflow-y-hidden"
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        {images.map((img) => {
          const isCurrent = img.id === currentId;
          const isSelected = selectedIds.includes(img.id);
          return (
            <div
              key={img.id}
              onClick={(e) => onClick(img.id, e)}
              className={`shrink-0 relative cursor-pointer rounded-lg overflow-hidden transition-all duration-150
                ${isCurrent
                  ? 'ring-2 ring-accent-500 ring-offset-1 ring-offset-surface-100 shadow-md scale-105'
                  : 'ring-1 ring-surface-300 hover:ring-surface-700 hover:scale-105'}`}
              style={{ width: 48, height: 56 }}
            >
              <img
                src={getThumbnailUrl(img.file_hash)}
                alt={img.file_name}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
              {isSelected && (
                <div className="absolute inset-0 bg-accent-500/20 flex items-center justify-center">
                  <div className="w-4 h-4 bg-accent-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </div>
                </div>
              )}
              {img.rating > 0 && (
                <div className="absolute bottom-0.5 left-0.5 text-2xs text-ios-orange drop-shadow-sm">
                  {'★'.repeat(img.rating)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
