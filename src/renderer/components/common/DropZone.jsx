import React, { useState, useEffect } from 'react';
import useStore from '../../stores';

export default function DropZone({ onDrop }) {
  const [drag, setDrag] = useState(false);
  const importing = useStore(s => s.importing);
  const progress = useStore(s => s.importProgress);

  useEffect(() => {
    const onEnter = e => { e.preventDefault(); if (e.dataTransfer.types.includes('Files')) setDrag(true); };
    const onOver = e => { e.preventDefault(); };
    const onLeave = e => { if (e.clientX <= 0 || e.clientY <= 0) setDrag(false); };
    const onDropEv = e => {
      e.preventDefault(); setDrag(false);
      const files = Array.from(e.dataTransfer.files).map(f => f.path).filter(Boolean);
      if (files.length && onDrop) onDrop(files);
    };
    document.addEventListener('dragenter', onEnter);
    document.addEventListener('dragover', onOver);
    document.addEventListener('dragleave', onLeave);
    document.addEventListener('drop', onDropEv);
    return () => {
      document.removeEventListener('dragenter', onEnter);
      document.removeEventListener('dragover', onOver);
      document.removeEventListener('dragleave', onLeave);
      document.removeEventListener('drop', onDropEv);
    };
  }, [onDrop]);

  if (!drag && !importing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
      {importing ? (
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">⏳</div>
          <p className="text-lg text-slate-200 mb-2">导入中...</p>
          <div className="w-64 h-2 bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-accent-500 rounded-full transition-all"
              style={{ width: progress.total ? `${Math.round(progress.current / progress.total * 100)}%` : '0%' }} />
          </div>
          <p className="text-sm text-slate-500 mt-2">{progress.current} / {progress.total}</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-5xl mb-4">📥</div>
          <p className="text-xl text-slate-200 mb-1">拖放图片到此处导入</p>
          <p className="text-sm text-slate-500">JPG / PNG / WebP / TIFF / GIF</p>
        </div>
      )}
    </div>
  );
}
