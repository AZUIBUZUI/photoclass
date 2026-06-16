import React, { useState } from 'react';
import { getImageUrl } from '../../hooks/useThumbnail';

export default function CompareCell({ image, syncZoom, onZoomChange, index }) {
  const [localZoom, setLocalZoom] = useState(1);
  const zoom = syncZoom || localZoom;

  if (!image) {
    return (
      <div className="bg-surface-900 rounded flex items-center justify-center text-slate-600">
        <div className="text-center">
          <div className="text-3xl mb-2">📷</div>
          <p className="text-sm">空</p>
        </div>
      </div>
    );
  }

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    setLocalZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  return (
    <div className="bg-surface-900 rounded overflow-hidden flex flex-col relative">
      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
      >
        <img
          src={getImageUrl(image.file_path)}
          alt={image.file_name}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-150"
          style={{ transform: `scale(${zoom})` }}
          draggable={false}
        />
      </div>

      {/* Info bar */}
      <div className="px-3 py-1.5 bg-surface-800 flex items-center justify-between text-2xs text-slate-500 shrink-0">
        <span className="truncate flex-1">{image.file_name}</span>
        <span className="ml-2 shrink-0">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
