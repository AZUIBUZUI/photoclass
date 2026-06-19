import React from 'react';

export default function TagChip({ tag, isActive, onClick, dimensionColor, shortcutKey }) {
  return (
    <button
      onClick={onClick}
      className={`
        tag-chip inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all duration-200
        ${isActive
          ? 'text-white border-transparent shadow-sm'
          : 'text-surface-800 border-surface-300 hover:border-surface-700 hover:bg-surface-100'
        }
      `}
      style={isActive ? { backgroundColor: dimensionColor } : {}}
      title={shortcutKey ? `快捷键: ${shortcutKey}` : tag.name}
    >
      {tag.name}
      {shortcutKey && (
        <span className={`text-2xs ${isActive ? 'opacity-70' : 'text-surface-700'}`}>
          {shortcutKey}
        </span>
      )}
    </button>
  );
}
