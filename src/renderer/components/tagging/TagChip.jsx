import React from 'react';

export default function TagChip({ tag, isActive, onClick, dimensionColor, shortcutKey }) {
  return (
    <button
      onClick={onClick}
      className={`
        tag-chip inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border
        ${isActive
          ? 'text-white border-transparent'
          : 'text-slate-400 border-surface-700 hover:border-surface-600 hover:text-slate-300'
        }
      `}
      style={isActive ? { backgroundColor: dimensionColor } : {}}
      title={shortcutKey ? `快捷键: ${shortcutKey}` : tag.name}
    >
      {tag.name}
      {shortcutKey && (
        <span className={`text-2xs ${isActive ? 'opacity-70' : 'text-slate-600'}`}>
          {shortcutKey}
        </span>
      )}
    </button>
  );
}
