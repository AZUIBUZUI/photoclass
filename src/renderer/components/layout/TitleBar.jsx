import React from 'react';
import useStore from '../../stores';
import Icon from '../common/Icon';

export default function TitleBar() {
  const project = useStore(s => s.project);
  return (
    <div className="h-9 shrink-0 glass-strong border-b border-surface-300 flex items-center px-3 drag-region select-none z-10">
      <div className="flex items-center gap-2 no-drag">
        <Icon name="app-logo" size={18} className="text-accent-500" />
        <span className="text-xs font-semibold text-surface-950">PhotoClass</span>
        {project && <span className="text-xs text-surface-900">— {project.name}</span>}
      </div>
    </div>
  );
}
