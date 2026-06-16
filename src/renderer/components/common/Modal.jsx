import React, { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, wide = false }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`bg-surface-900 rounded-xl border border-surface-700 shadow-2xl max-h-[85vh] flex flex-col ${
        wide ? 'w-[720px]' : 'w-[480px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800">
          <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
