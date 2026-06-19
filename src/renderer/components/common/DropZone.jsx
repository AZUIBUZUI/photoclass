import React, { useState, useEffect } from 'react';
import useStore from '../../stores';
import Icon from './Icon';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      {importing ? (
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-medium text-surface-900 mb-3">导入中...</p>
          <div className="w-64 h-2 bg-surface-200 rounded-full overflow-hidden">
            <div className="h-full bg-accent-500 rounded-full transition-all duration-300"
              style={{ width: progress.total ? `${Math.round(progress.current / progress.total * 100)}%` : '0%' }} />
          </div>
          <p className="text-sm text-surface-800 mt-2">{progress.current} / {progress.total}</p>
        </div>
      ) : (
        <div className="text-center">
          <Icon name="import" size={48} className="text-accent-500 mx-auto mb-4" />
          <p className="text-xl font-medium text-surface-900 mb-1">拖放图片到此处导入</p>
          <p className="text-sm text-surface-800">JPG / PNG / WebP / TIFF / GIF</p>
        </div>
      )}
    </div>
  );
}
