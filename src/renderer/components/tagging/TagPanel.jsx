import React, { useEffect, useState } from 'react';
import useStore from '../../stores';
import RatingStars from './RatingStars';
import QuickTagBar from './QuickTagBar';

export default function TagPanel({ imageId }) {
  const [dims, setDims] = useState([]);
  const [tagsByDim, setTagsByDim] = useState({});
  const [activeIds, setActiveIds] = useState(new Set());
  const tagVersion = useStore(s => s.tagVersion);

  useEffect(() => { load(); }, [imageId, tagVersion]);

  async function load() {
    try {
      const [dr, tr] = await Promise.all([
        window.api.invoke('tag:dimensionList'),
        imageId ? window.api.invoke('tag:getForImage', imageId) : Promise.resolve({ data: [] }),
      ]);
      if (!dr.data) return;

      const dimsData = dr.data;
      setDims(dimsData);

      const tbd = {};
      for (const d of dimsData) {
        if (d.is_rating) continue;
        const tr2 = await window.api.invoke('tag:list', d.id);
        tbd[d.id] = tr2.data || [];
      }
      setTagsByDim(tbd);

      const ids = new Set((tr.data || []).map(t => t.id));
      setActiveIds(ids);
    } catch (e) { console.error('TagPanel load error:', e); }
  }

  async function toggle(tagId) {
    if (!imageId) return;
    try {
      const r = await window.api.invoke('tag:toggleOnImage', imageId, tagId);
      const newIds = new Set(activeIds);
      if (r.data) newIds.add(tagId); else newIds.delete(tagId);
      setActiveIds(newIds);
    } catch (e) { /* ignore */ }
  }

  const tagDims = dims.filter(d => !d.is_rating);

  return (
    <div className="p-3 space-y-3">
      <RatingStars imageId={imageId} />
      <QuickTagBar dims={tagDims} tagsByDim={tagsByDim} activeIds={activeIds} onToggle={toggle} />
      {tagDims.map(d => (
        <div key={d.id}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-xs font-medium text-surface-900">{d.name}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(tagsByDim[d.id] || []).map(t => (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all duration-200 tag-chip
                  ${activeIds.has(t.id) ? 'text-white border-transparent shadow-sm' : 'text-surface-800 border-surface-300 hover:border-surface-700 hover:bg-surface-100'}`}
                style={activeIds.has(t.id) ? { background: d.color } : {}}
                title={t.shortcut_key || ''}
              >
                <span className={`font-mono text-2xs ${activeIds.has(t.id) ? 'opacity-70' : 'text-surface-700'}`}>
                  {t.shortcut_key}
                </span>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
