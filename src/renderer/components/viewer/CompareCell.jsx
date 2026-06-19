import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../hooks/useThumbnail';
import Icon from '../common/Icon';

export default function CompareCell({ image, syncEnabled, syncZoom, syncPan, onZoomChange, onPanChange, index }) {
  const [localZoom, setLocalZoom] = useState(1);
  const [localPan, setLocalPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoom = syncEnabled ? (syncZoom ?? 1) : localZoom;
  const pan = syncEnabled ? (syncPan ?? { x: 0, y: 0 }) : localPan;

  useEffect(() => {
    if (syncEnabled) {
      onZoomChange?.(1);
      onPanChange?.({ x: 0, y: 0 });
    } else {
      setLocalZoom(1);
      setLocalPan({ x: 0, y: 0 });
    }
  }, [image?.id]);

  if (!image) {
    return (
      <div className="bg-surface-100 rounded-2xl flex items-center justify-center text-surface-700">
        <div className="text-center">
          <Icon name="camera" size={32} className="mx-auto mb-2 text-surface-400" />
          <p className="text-sm">空</p>
        </div>
      </div>
    );
  }

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    if (syncEnabled) {
      onZoomChange?.(newZoom);
    } else {
      setLocalZoom(newZoom);
    }
  };

  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const newPan = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
    if (syncEnabled) {
      onPanChange?.(newPan);
    } else {
      setLocalPan(newPan);
    }
  };

  const onMouseUp = () => setDragging(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col relative shadow-ios">
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={getImageUrl(image.file_path)}
          alt={image.file_name}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: dragging ? 'none' : 'transform 0.15s ease',
          }}
          draggable={false}
        />
      </div>

      <div className="px-3 py-1.5 bg-surface-100 flex items-center justify-between text-2xs text-surface-800 shrink-0">
        <span className="truncate flex-1">{image.file_name}</span>
        <span className="ml-2 shrink-0">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
