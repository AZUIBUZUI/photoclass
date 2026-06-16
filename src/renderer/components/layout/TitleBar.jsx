import React from 'react';
import useStore from '../../stores';

export default function TitleBar() {
  const project = useStore(s => s.project);
  return (
    <div className="drag-region flex items-center h-9 px-3 bg-surface-950 border-b border-surface-800 shrink-0">
      <span className="text-sm font-semibold text-accent-400">PhotoClass</span>
      {project && <span className="ml-2 text-sm text-slate-400">— {project.name}</span>}
    </div>
  );
}
