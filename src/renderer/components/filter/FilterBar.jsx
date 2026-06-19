import React, { useEffect, useState } from 'react';
import useStore from '../../stores';
import Icon from '../common/Icon';

const FILTER_CONTAINER = 'bg-white border-b border-surface-200';

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
    <div className={`px-4 py-2 shrink-0 flex items-start gap-4 flex-wrap ${FILTER_CONTAINER}`}>
      {[0, 1, 2, 3, 4, 5].map(r => (
        <button key={r} onClick={() => setFilterMinRating(filterMinRating === r ? 0 : r)}
          className={`px-2 py-0.5 text-xs rounded-lg border transition-all duration-200 ${filterMinRating === r ? 'bg-ios-orange/10 text-ios-orange border-ios-orange/30' : 'text-surface-800 hover:text-surface-900 border-transparent hover:bg-surface-200'}`}>
          {r === 0 ? '全部' : `${r}★+`}
        </button>
      ))}
      <button onClick={() => setFilterFavOnly(!filterFavOnly)}
        className={`px-2 py-0.5 text-xs rounded-lg border transition-all duration-200 ${filterFavOnly ? 'bg-ios-red/10 text-ios-red border-ios-red/30' : 'text-surface-800 border-transparent hover:bg-surface-200'}`}>
        <Icon name="heart" size={12} className="inline mr-0.5" />收藏
      </button>
      <button onClick={() => setFilterUntagged(!filterUntagged)}
        className={`px-2 py-0.5 text-xs rounded-lg border transition-all duration-200 ${filterUntagged ? 'bg-accent-500/10 text-accent-500 border-accent-500/30' : 'text-surface-800 border-transparent hover:bg-surface-200'}`}>
        未分类
      </button>
      {dims.map(d => (
        <div key={d.id} className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
          <span className="text-2xs text-surface-800">{d.name}</span>
          {(tagsByDim[d.id] || []).map(t => (
            <button key={t.id} onClick={() => toggleFilterTag(t.id)}
              className={`px-1.5 py-0.5 text-xs rounded-lg border transition-all duration-200 ${filterTagIds.includes(t.id) ? 'text-white border-transparent shadow-sm' : 'text-surface-800 border-surface-300 hover:border-surface-700'}`}
              style={filterTagIds.includes(t.id) ? { background: d.color } : {}}>{t.name}</button>
          ))}
        </div>
      ))}
      {(filterTagIds.length > 0 || filterMinRating > 0 || filterFavOnly) && (
        <button onClick={doClear} className="px-2 py-0.5 text-xs text-ios-red hover:bg-ios-red/10 rounded-lg transition-colors flex items-center gap-1">
          <Icon name="close" size={12} />清除
        </button>
      )}
    </div>
  );
}
