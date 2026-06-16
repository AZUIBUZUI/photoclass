import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../stores';

const NAV = [
  { path: '/browse', label: '浏览', icon: '🖼' },
  { path: '/compare', label: '对比', icon: '⚖' },
  { path: '/stats', label: '统计', icon: '📊' },
  { path: '/settings', label: '设置', icon: '⚙' },
];

export default function Sidebar() {
  const nav = useNavigate();
  const loc = useLocation();
  const project = useStore(s => s.project);
  const total = useStore(s => s.images.length);
  const sel = useStore(s => s.selectedIds.length);

  return (
    <aside className="w-[220px] shrink-0 bg-surface-900 border-r border-surface-800 flex flex-col">
      <div className="p-3 border-b border-surface-800">
        <h2 className="text-sm font-semibold text-slate-200 truncate">{project?.name || '未命名'}</h2>
        <p className="text-2xs text-slate-500 mt-0.5">{total} 张{sel > 0 && ` · ${sel} 选中`}</p>
      </div>
      <nav className="flex-1 py-1">
        {NAV.map(item => (
          <button
            key={item.path}
            onClick={() => nav(item.path)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
              ${loc.pathname === item.path ? 'bg-accent-500/10 text-accent-400 border-r-2 border-accent-500' : 'text-slate-400 hover:bg-surface-800 hover:text-slate-200'}`}
          >
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-surface-800">
        <button
          onClick={async () => {
            const r = await window.api.invoke('dialog:openFolder', { title: '选择图片文件夹' });
            if (r.data?.length) window.dispatchEvent(new CustomEvent('import-folder', { detail: r.data[0] }));
          }}
          className="w-full py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          📥 导入图片
        </button>
      </div>
    </aside>
  );
}
