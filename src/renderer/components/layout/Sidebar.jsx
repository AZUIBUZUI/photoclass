import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../stores';
import Icon from '../common/Icon';

const NAV = [
  { path: '/browse', label: '浏览', icon: 'browse' },
  { path: '/compare', label: '对比', icon: 'compare' },
  { path: '/stats', label: '统计', icon: 'chart' },
  { path: '/settings', label: '设置', icon: 'settings' },
];

export default function Sidebar() {
  const nav = useNavigate();
  const loc = useLocation();
  const project = useStore(s => s.project);
  const total = useStore(s => s.images.length);
  const sel = useStore(s => s.selectedIds.length);

  return (
    <aside className="w-[220px] shrink-0 glass border-r border-surface-300 flex flex-col z-10 overflow-hidden">
      <div className="p-3 border-b border-surface-200">
        <h2 className="text-sm font-semibold text-surface-950 truncate">{project?.name || '未命名'}</h2>
        <p className="text-2xs text-surface-900 mt-0.5">{total} 张{sel > 0 && ` · ${sel} 选中`}</p>
      </div>
      <nav className="flex-1 py-1 px-1.5 overflow-y-auto">
        {NAV.map(item => {
          const active = loc.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => nav(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg my-0.5 transition-colors duration-200
                ${active
                  ? 'bg-accent-500/10 text-accent-500 font-medium'
                  : 'text-surface-900 hover:bg-surface-200 hover:text-surface-950'}`}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-surface-200">
        <button
          onClick={async () => {
            const r = await window.api.invoke('dialog:openFolder', { title: '选择图片文件夹' });
            if (r.data?.length) window.dispatchEvent(new CustomEvent('import-folder', { detail: r.data[0] }));
          }}
          className="w-full py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-ios flex items-center justify-center gap-1.5"
        >
          <Icon name="import" size={16} />
          导入图片
        </button>
      </div>
    </aside>
  );
}
