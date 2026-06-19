import React from 'react';

export default function QuickTagBar({ dims, tagsByDim, activeIds, onToggle }) {
  const groups = dims.map(d => ({
    dim: d,
    tags: (tagsByDim[d.id] || []).filter(t => t.shortcut_key),
  })).filter(g => g.tags.length > 0);

  if (!groups.length) return null;

  return (
    <div>
      <div className="text-2xs text-surface-700 mb-1.5">快捷键速查</div>
      <div className="space-y-1">
        {groups.map(({ dim, tags }) => (
          <div key={dim.id} className="flex items-start gap-1.5">
            <span
              className="shrink-0 text-2xs font-medium w-10 text-right pt-0.5"
              style={{ color: dim.color }}
            >
              {dim.name}
            </span>
            <div className="flex flex-wrap gap-0.5 flex-1">
              {tags.map(t => (
                <span
                  key={t.id}
                  onClick={() => onToggle(t.id)}
                  className={`cursor-pointer inline-flex items-center gap-0.5 px-1.5 rounded-md text-2xs border transition-all duration-200
                    ${activeIds.has(t.id)
                      ? 'text-white border-transparent shadow-sm'
                      : 'text-surface-800 border-surface-300 hover:border-surface-700'}`}
                  style={activeIds.has(t.id) ? { background: dim.color } : {}}
                >
                  <kbd className={`font-mono ${activeIds.has(t.id) ? 'opacity-70' : 'text-surface-700'}`}>
                    {t.shortcut_key}
                  </kbd>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
