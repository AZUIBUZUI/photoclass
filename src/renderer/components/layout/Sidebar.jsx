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
  const collapsed = useStore(s => s.sidebarCollapsed);
  const setCollapsed = useStore(s => s.setSidebarCollapsed);

  return (
    <aside
      className={`shrink-0 glass border-r border-surface-300 flex flex-col z-10 overflow-hidden transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[52px]' : 'w-[220px]'}`}
    >
      {/* Header */}
      <div className={`p-3 border-b border-surface-200 ${collapsed ? 'px-2' : ''}`}>
        {collapsed ? (
          <div className="flex items-center justify-center">
            <Icon name="app-logo" size={20} className="text-accent-500" />
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-surface-950 truncate">{project?.name || '未命名'}</h2>
            <p className="text-2xs text-surface-900 mt-0.5">{total} 张{sel > 0 && ` · ${sel} 选中`}</p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-1 ${collapsed ? 'px-1' : 'px-1.5'} overflow-y-auto`}>
        {NAV.map(item => {
          const active = loc.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => nav(item.path)}
              title={collapsed ? item.label : ''}
              className={`flex items-center gap-2.5 rounded-lg my-0.5 transition-colors duration-200
                ${collapsed
                  ? 'w-full justify-center px-0 py-2.5'
                  : 'w-full px-3 py-2.5'}
                ${active
                  ? 'bg-accent-500/10 text-accent-500 font-medium'
                  : 'text-surface-900 hover:bg-surface-200 hover:text-surface-950'}`}
            >
              <Icon name={item.icon} size={18} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Import button */}
      <div className={`p-3 border-t border-surface-200 ${collapsed ? 'px-1.5' : ''}`}>
        <button
          onClick={async () => {
            const r = await window.api.invoke('dialog:openFolder', { title: '选择图片文件夹' });
            if (r.data?.length) window.dispatchEvent(new CustomEvent('import-folder', { detail: r.data[0] }));
          }}
          title={collapsed ? '导入图片' : ''}
          className={`bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-xl transition-all duration-200 shadow-ios flex items-center justify-center gap-1.5
            ${collapsed ? 'w-full py-2.5' : 'w-full py-2.5 text-sm'}`}
        >
          <Icon name="import" size={collapsed ? 18 : 16} />
          {!collapsed && '导入图片'}
        </button>
      </div>

      {/* Collapse toggle */}
      <div className="p-1.5 border-t border-surface-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg text-surface-700 hover:text-surface-950 hover:bg-surface-200 transition-all duration-200"
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={16} />
        </button>
      </div>
    </aside>
  );
}
