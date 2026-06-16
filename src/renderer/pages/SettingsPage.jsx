import React from 'react';
import useStore from '../stores';

const KEYS = [
  ['1', '评分 1★'], ['2', '评分 2★'], ['3', '评分 3★'], ['4', '评分 4★'], ['5', '评分 5★'],
  ['0', '清除评分'], ['`', '收藏'], ['Ctrl+1~8', '构图标签'], ['Alt+1~8', '光影标签'],
  ['Ctrl+Shift+1~8', '情绪标签'], ['← →', '切换图片'], ['F', '全屏'],
  ['Ctrl+=/-', '缩放'], ['Delete', '移除图片'], ['Ctrl+I', '导入'],
];

const DIMS = [
  { name: '构图', color: '#8b5cf6', keys: 'Ctrl+1~8', tags: '三分法 对称 引导线 框架 留白 对角线 中心 散点' },
  { name: '光影', color: '#f59e0b', keys: 'Alt+1~8', tags: '顺光 侧光 逆光 柔光 硬光 剪影 低调 高调' },
  { name: '情绪', color: '#06b6d4', keys: 'Ctrl+Shift+1~8', tags: '宁静 热烈 忧郁 神秘 欢快 庄重 孤独 温暖' },
];

export default function SettingsPage() {
  const autoAdvance = useStore(s => s.autoAdvance);
  const setAutoAdvance = useStore(s => s.setAutoAdvance);
  const cellSize = useStore(s => s.cellSize);
  const setCellSize = useStore(s => s.setCellSize);
  const addToast = useStore(s => s.addToast);

  return (
    <div className="h-full overflow-y-auto p-6 bg-surface-950">
      <h2 className="text-xl font-bold text-slate-100 mb-6">⚙ 设置</h2>

      {/* Toggles */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-surface-800">偏好</h3>
        <div className="flex items-center justify-between py-2">
          <div><div className="text-sm text-slate-300">打标签后自动跳下一张</div></div>
          <button onClick={async () => {
            const v = !autoAdvance; setAutoAdvance(v);
            await window.api.invoke('settings:set', 'autoAdvance', String(v));
          }}
            className={`w-11 h-6 rounded-full transition-colors relative ${autoAdvance ? 'bg-accent-500' : 'bg-surface-700'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${autoAdvance ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <div className="py-2">
          <div className="text-sm text-slate-300 mb-2">缩略图大小: {cellSize}px</div>
          <input type="range" min="100" max="400" step="20" value={cellSize}
            onChange={e => setCellSize(Number(e.target.value))}
            onMouseUp={async () => { await window.api.invoke('settings:set', 'gridCellSize', String(cellSize)); addToast('已保存', 'success'); }}
            className="w-full max-w-xs accent-accent-500" />
        </div>
      </section>

      {/* Dimensions */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-surface-800">分类维度</h3>
        {DIMS.map(d => (
          <div key={d.name} className="flex items-start gap-3 px-3 py-2 mb-1 bg-surface-900 rounded-lg border border-surface-800">
            <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: d.color }} />
            <div>
              <span className="text-sm text-slate-300 font-medium">{d.name}</span>
              <span className="ml-2 text-2xs text-slate-500 font-mono">{d.keys}</span>
              <div className="text-2xs text-slate-600 mt-0.5">{d.tags}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Shortcut reference */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-surface-800">快捷键速查</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {KEYS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1">
              <span className="text-sm text-slate-400">{v}</span>
              <kbd className="px-1.5 py-0.5 bg-surface-800 text-xs text-slate-300 rounded border border-surface-700 font-mono">{k}</kbd>
            </div>
          ))}
        </div>
      </section>

      {/* Migrate old projects */}
      <section>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-surface-800">维护</h3>
        <p className="text-2xs text-slate-500 mb-2">如果打开的是旧项目，标签维度可能不正确。点击升级以移除旧维度并更新快捷键。</p>
        <button
          onClick={async () => {
            const c = await window.api.invoke('dialog:confirm', '将移除非构图/光影/情绪/评分的维度，并更新所有快捷键。确定？', '升级项目');
            if (!c.data) return;
            const r = await window.api.invoke('project:migrate');
            if (r.error) { addToast('升级失败: ' + r.error, 'error'); return; }
            addToast(`已移除: ${r.data.removed.join(', ') || '无'}，保留: ${r.data.kept.join(', ')}`, 'success');
          }}
          className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm rounded-lg hover:bg-amber-500/20 transition-colors"
        >
          🔄 升级旧项目
        </button>
      </section>
    </div>
  );
}
