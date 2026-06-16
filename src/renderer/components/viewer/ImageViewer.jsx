import React, { useEffect, useState, useRef } from 'react';
import useStore from '../../stores';
import TagPanel from '../tagging/TagPanel';
import NotePanel from '../annotation/NotePanel';
import ZoomControls from './ZoomControls';
import { getImageUrl } from '../../hooks/useThumbnail';

export default function ImageViewer() {
  const currentId = useStore(s => s.currentId);
  const zoom = useStore(s => s.zoom);
  const setZoom = useStore(s => s.setZoom);
  const fullscreen = useStore(s => s.fullscreen);
  const setFullscreen = useStore(s => s.setFullscreen);

  const [image, setImage] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!currentId) { setImage(null); return; }
    (async () => {
      try {
        const r = await window.api.invoke('image:get', currentId);
        console.log('[Viewer] loaded image:', r.data?.file_path);
        setImage(r.data);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } catch (e) { /* ignore */ }
    })();
  }, [currentId]);

  const onWheel = (e) => {
    e.preventDefault();
    setZoom(Math.max(0.1, Math.min(5, zoom + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setDragging(false);

  if (!currentId) {
    return (
      <div className="h-full flex items-center justify-center text-slate-600">
        <div className="text-center"><div className="text-5xl mb-3">📷</div><p>选择一张图片开始浏览</p></div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-surface-950 flex items-center justify-center"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(Math.min(5, zoom + 0.25))}
          onZoomOut={() => setZoom(Math.max(0.1, zoom - 0.25))}
          onZoomFit={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          onZoom100={() => setZoom(1)}
          onFullscreen={() => setFullscreen(!fullscreen)}
        />
        <img
          src={getImageUrl(image.file_path)}
          alt={image.file_name}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: dragging ? 'none' : 'transform 0.15s ease',
          }}
          draggable={false}
          onLoad={() => console.log('[Viewer] image loaded:', image.file_path)}
          onError={(e) => { console.error('[Viewer] image load FAILED:', image.file_path, 'URL:', getImageUrl(image.file_path)); }}
        />
        <div className="absolute bottom-2 left-2 text-2xs text-slate-600 bg-surface-950/80 px-2 py-1 rounded">
          {image.file_name} · {image.width}×{image.height} · {(image.file_size / 1024 / 1024).toFixed(1)} MB
        </div>
      </div>

      <div className="h-[180px] shrink-0 bg-surface-900 border-t border-surface-800 overflow-y-auto flex">
        <div className="flex-1"><TagPanel imageId={currentId} /></div>
        <div className="w-px bg-surface-800" />
        <div className="w-[220px] shrink-0"><NotePanel imageId={currentId} /></div>
      </div>
    </div>
  );
}
