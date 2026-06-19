import React from 'react';
import TagChip from './TagChip';

export default function DimensionGroup({ dimension, tags, activeTagIds, onTagToggle }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: dimension.color }}
        />
        <span className="text-xs font-medium text-surface-900">{dimension.name}</span>
        {dimension.is_multiselect === 0 && (
          <span className="text-2xs text-surface-700">(单选)</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            tag={tag}
            isActive={activeTagIds.has(tag.id)}
            onClick={() => onTagToggle(tag.id)}
            dimensionColor={dimension.color}
            shortcutKey={tag.shortcut_key}
          />
        ))}
      </div>
    </div>
  );
}
