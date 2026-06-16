import React, { useState } from 'react';
import useStore from '../stores';
import { getImageUrl } from '../hooks/useThumbnail';

export default function ComparePage() {
  const images = useStore(s => s.images);
  const [cols, setCols] = useState(2);
  const [slots, setSlots] = useState([null, null, null, null]);

  const setSlot = (i, id) => { const s = [...slots]; s[i] = id; setSlots(s); };
  const clear = () => setSlots([null, null, null, null]);

  const active = slots.slice(0, cols);

  return (
    <div className="h-full flex flex-col bg-surface-950">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-300">对比</span>
          <div className="flex gap-1">
            {[2, 4].map(n => (
              <button key={n} onClick={() => setCols(n)}
                className={`px-3 py-1 text-xs rounded ${cols === n ? 'bg-accent-500 text-white' : 'bg-surface-800 text-slate-400'}`}>
                {n} 张
              </button>
            ))}
          </div>
        </div>
        <button onClick={clear} className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 bg-surface-800 rounded">清空</button>
      </div>
      <div className="flex-1 grid gap-1 p-1 bg-surface-800" style={{ gridTemplateColumns: `repeat(${cols === 4 ? 2 : 2}, 1fr)` }}>
        {active.map((imgId, i) => {
          const img = imgId ? images.find(x => x.id === imgId) : null;
          return (
            <div key={i} className="bg-surface-900 rounded flex flex-col items-center justify-center relative overflow-hidden">
              {img ? (
                <>
                  <img src={getImageUrl(img.file_path)}
                    alt={img.file_name} className="max-w-full max-h-full object-contain" draggable={false} />
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-surface-950/80 text-2xs text-slate-400">
                    {img.file_name}{img.rating > 0 && ` · ${'★'.repeat(img.rating)}`}
                  </div>
                </>
              ) : (
                <select value="" onChange={e => setSlot(i, e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-1.5 bg-surface-800 border border-surface-700 rounded text-xs text-slate-300">
                  <option value="">选择图片</option>
                  {images.map(x => <option key={x.id} value={x.id}>{x.file_name}</option>)}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
