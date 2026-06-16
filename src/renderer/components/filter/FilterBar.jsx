import React, { useEffect, useState } from 'react';
import useStore from '../../stores';

export default function FilterBar({ onRefresh }) {
  const filterTagIds = useStore(s => s.filterTagIds);
  const toggleFilterTag = useStore(s => s.toggleFilterTag);
  const filterMinRating = useStore(s => s.filterMinRating);
  const setFilterMinRating = useStore(s => s.setFilterMinRating);
  const filterFavOnly = useStore(s => s.filterFavOnly);
  const setFilterFavOnly = useStore(s => s.setFilterFavOnly);
  const filterUntagged = useStore(s => s.filterUntagged);
  const setFilterUntagged = useStore(s => s.setFilterUntagged);
  const clearFilters = useStore(s => s.clearFilters);

  const [dims, setDims] = useState([]);
  const [tagsByDim, setTagsByDim] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    const dr = await window.api.invoke('tag:dimensionList');
    if (!dr.data) return;
    const td = dr.data.filter(d => !d.is_rating);
    setDims(td);
    const tbd = {};
    for (const d of td) {
      const tr = await window.api.invoke('tag:list', d.id);
      tbd[d.id] = tr.data || [];
    }
    setTagsByDim(tbd);
  }

  const doClear = () => { clearFilters(); onRefresh?.(); };

  return (
    <div className="px-4 py-2 bg-surface-900 border-b border-surface-800 shrink-0 flex items-start gap-4 flex-wrap">
      {[0, 1, 2, 3, 4, 5].map(r => (
        <button key={r} onClick={() => setFilterMinRating(filterMinRating === r ? 0 : r)}
          className={`px-1.5 py-0.5 text-xs rounded border ${filterMinRating === r ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'text-slate-500 hover:text-slate-300 border-transparent'}`}>
          {r === 0 ? '全部' : `${r}★+`}
        </button>
      ))}
      <button onClick={() => setFilterFavOnly(!filterFavOnly)}
        className={`px-1.5 py-0.5 text-xs rounded border ${filterFavOnly ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'text-slate-500 border-transparent'}`}>♥ 收藏</button>
      <button onClick={() => setFilterUntagged(!filterUntagged)}
        className={`px-1.5 py-0.5 text-xs rounded border ${filterUntagged ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 'text-slate-500 border-transparent'}`}>未分类</button>
      {dims.map(d => (
        <div key={d.id} className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
          <span className="text-2xs text-slate-500">{d.name}</span>
          {(tagsByDim[d.id] || []).map(t => (
            <button key={t.id} onClick={() => toggleFilterTag(t.id)}
              className={`px-1.5 py-0.5 text-xs rounded border ${filterTagIds.includes(t.id) ? 'text-white border-transparent' : 'text-slate-500 border-surface-700'}`}
              style={filterTagIds.includes(t.id) ? { background: d.color } : {}}>{t.name}</button>
          ))}
        </div>
      ))}
      {(filterTagIds.length > 0 || filterMinRating > 0 || filterFavOnly) && (
        <button onClick={doClear} className="px-2 py-0.5 text-xs text-red-400 hover:text-red-300">✕ 清除</button>
      )}
    </div>
  );
}
