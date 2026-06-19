import React, { useEffect, useState, useRef } from 'react';
import useStore from '../../stores';
import TagPanel from '../tagging/TagPanel';
import NotePanel from '../annotation/NotePanel';
import ZoomControls from './ZoomControls';
import Histogram from './Histogram';
import Icon from '../common/Icon';
import { getImageUrl } from '../../hooks/useThumbnail';

export default function ImageViewer() {
  const currentId = useStore(s => s.currentId);
  const zoom = useStore(s => s.zoom);
  const setZoom = useStore(s => s.setZoom);
  const fullscreen = useStore(s => s.fullscreen);
  const setFullscreen = useStore(s => s.setFullscreen);
  const showHistogram = useStore(s => s.showHistogram);
  const setShowHistogram = useStore(s => s.setShowHistogram);

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
      <div className="h-full flex items-center justify-center text-surface-700 bg-white">
        <div className="text-center">
          <Icon name="camera" size={48} className="mx-auto mb-3 text-surface-400" />
          <p className="text-sm">选择一张图片开始浏览</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-white flex items-center justify-center"
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
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => setShowHistogram(!showHistogram)}
            className={`px-2.5 py-1.5 text-xs rounded-xl border transition-all duration-200
              ${showHistogram ? 'bg-accent-500/10 text-accent-500 border-accent-500/30' : 'glass text-surface-900 border-surface-300 hover:text-surface-950'}`}
          >
            直方图
          </button>
        </div>
        {showHistogram && image && (
          <div className="absolute bottom-10 left-2 z-10">
            <Histogram imagePath={image.file_path} />
          </div>
        )}
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
        <div className="absolute bottom-2 left-2 text-2xs text-surface-800 bg-white/80 backdrop-blur px-2 py-1 rounded-lg">
          {image.file_name} · {image.width}×{image.height} · {(image.file_size / 1024 / 1024).toFixed(1)} MB
        </div>
      </div>

      <div className="h-[180px] shrink-0 bg-white border-t border-surface-200 overflow-y-auto flex">
        <div className="flex-1"><TagPanel imageId={currentId} /></div>
        <div className="w-px bg-surface-200" />
        <div className="w-[220px] shrink-0"><NotePanel imageId={currentId} /></div>
      </div>
    </div>
  );
}
