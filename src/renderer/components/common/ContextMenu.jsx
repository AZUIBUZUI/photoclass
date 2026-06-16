import React, { useEffect, useRef, useState } from 'react';

// Simple context menu that appears at mouse position
export default function ContextMenu({ items, x, y, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 36);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[160px] bg-surface-800 border border-surface-700 rounded-lg shadow-xl py-1"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, idx) => (
        item.separator ? (
          <div key={`sep-${idx}`} className="my-1 border-t border-surface-700" />
        ) : (
          <button
            key={item.label || idx}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            disabled={item.disabled}
            className={`
              w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors
              ${item.disabled
                ? 'text-slate-600 cursor-not-allowed'
                : item.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-slate-300 hover:bg-surface-700'
              }
            `}
          >
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="ml-auto text-2xs text-slate-500">{item.shortcut}</span>
            )}
          </button>
        )
      ))}
    </div>
  );
}
