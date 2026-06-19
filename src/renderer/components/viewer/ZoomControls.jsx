import React from 'react';
import Icon from '../common/Icon';

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomFit, onZoom100, onFullscreen }) {
  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
      <div className="flex items-center glass rounded-xl border border-surface-300 overflow-hidden shadow-ios">
        <button onClick={onZoomOut} className="px-2.5 py-1.5 text-xs text-surface-900 hover:text-surface-950 hover:bg-surface-200/50 transition-colors"><Icon name="minus" size={14} /></button>
        <span onClick={onZoomFit} className="px-2 py-1.5 text-xs text-surface-900 cursor-pointer hover:text-surface-950 min-w-[44px] text-center tabular-nums">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="px-2.5 py-1.5 text-xs text-surface-900 hover:text-surface-950 hover:bg-surface-200/50 transition-colors"><Icon name="plus" size={14} /></button>
      </div>
      <button onClick={onZoom100} className="px-2.5 py-1.5 text-xs text-surface-900 glass rounded-xl border border-surface-300 hover:text-surface-950 shadow-ios">1:1</button>
      <button onClick={onFullscreen} className="px-2.5 py-1.5 text-xs text-surface-900 glass rounded-xl border border-surface-300 hover:text-surface-950 shadow-ios">
        <Icon name="fullscreen" size={14} />
      </button>
    </div>
  );
}
