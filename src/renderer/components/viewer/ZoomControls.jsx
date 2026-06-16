import React from 'react';

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomFit, onZoom100, onFullscreen }) {
  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
      <div className="flex items-center bg-surface-900/90 backdrop-blur rounded-lg border border-surface-700 overflow-hidden">
        <button onClick={onZoomOut} className="px-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-surface-700">−</button>
        <span onClick={onZoomFit} className="px-2 py-1.5 text-xs text-slate-400 cursor-pointer hover:text-white min-w-[44px] text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="px-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-surface-700">＋</button>
      </div>
      <button onClick={onZoom100} className="px-2 py-1.5 text-xs text-slate-400 bg-surface-900/90 rounded-lg border border-surface-700 hover:text-white">1:1</button>
      <button onClick={onFullscreen} className="px-2 py-1.5 text-xs text-slate-400 bg-surface-900/90 rounded-lg border border-surface-700 hover:text-white">⛶</button>
    </div>
  );
}
