import React from 'react';
import useStore from '../../stores';
import Icon from '../common/Icon';

const SORTS = [
  { v: 'created_at', l: '导入时间' },
  { v: 'file_name', l: '文件名' },
  { v: 'file_size', l: '大小' },
  { v: 'rating', l: '评分' },
];

export default function GridToolbar() {
  const total = useStore(s => s.images.length);
  const sel = useStore(s => s.selectedIds.length);
  const sortBy = useStore(s => s.sortBy);
  const sortDir = useStore(s => s.sortDir);
  const setSortBy = useStore(s => s.setSortBy);
  const setSortDir = useStore(s => s.setSortDir);
  const cellSize = useStore(s => s.cellSize);
  const setCellSize = useStore(s => s.setCellSize);
  const showFilter = useStore(s => s.showFilterBar);
  const setShowFilter = useStore(s => s.setShowFilterBar);
  const filterTagIds = useStore(s => s.filterTagIds);
  const clearFilters = useStore(s => s.clearFilters);

  const hasFilters = filterTagIds.length > 0;

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-surface-200 shrink-0 gap-2">
      <div className="flex items-center gap-2">
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-900 focus:outline-none focus:border-accent-500">
          {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-800 hover:bg-surface-200 transition-colors">
          <Icon name={sortDir === 'asc' ? 'sort-up' : 'sort-down'} size={14} />
        </button>
        <button onClick={() => setShowFilter(!showFilter)}
          className={`px-2 py-1 border rounded-lg text-xs transition-all duration-200 ${showFilter || hasFilters ? 'bg-accent-500/10 border-accent-500/30 text-accent-500' : 'bg-surface-100 border-surface-300 text-surface-800 hover:bg-surface-200'}`}>
          <Icon name="filter" size={14} className="inline mr-0.5" />
          {hasFilters ? `(${filterTagIds.length})` : ''}
        </button>
        {hasFilters && <button onClick={clearFilters} className="px-2 py-1 text-xs text-ios-red hover:bg-ios-red/10 rounded-lg transition-colors">清除</button>}
      </div>
      <div className="flex items-center gap-2 text-2xs text-surface-800">
        <input type="range" min="100" max="400" step="20" value={cellSize}
          onChange={e => setCellSize(Number(e.target.value))} className="w-20 accent-accent-500" />
        <span>{cellSize}px · {total} 张{sel > 0 ? ` / ${sel} 选` : ''}</span>
      </div>
    </div>
  );
}
