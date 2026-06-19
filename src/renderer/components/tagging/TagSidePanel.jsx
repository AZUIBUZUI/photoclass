import React, { useEffect, useState, useRef } from 'react';
import useStore from '../../stores';
import QuickTagBar from './QuickTagBar';
import Icon from '../common/Icon';

export default function TagSidePanel({ imageId }) {
  const [dims, setDims] = useState([]);
  const [tagsByDim, setTagsByDim] = useState({});
  const [activeIds, setActiveIds] = useState(new Set());
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const tagVersion = useStore(s => s.tagVersion);
  const noteInputRef = useRef(null);

  useEffect(() => { loadTags(); loadNotes(); }, [imageId, tagVersion]);

  async function loadTags() {
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
    } catch (e) { console.error('TagSidePanel load error:', e); }
  }

  async function loadNotes() {
    if (!imageId) { setNotes([]); return; }
    const r = await window.api.invoke('annotation:list', imageId);
    if (r.data) setNotes(r.data);
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

  async function addNote() {
    if (!noteText.trim() || !imageId) return;
    await window.api.invoke('annotation:create', imageId, 'note', noteText.trim());
    setNoteText('');
    await loadNotes();
  }

  async function removeNote(id) {
    await window.api.invoke('annotation:delete', id);
    await loadNotes();
  }

  const tagDims = dims.filter(d => !d.is_rating);

  return (
    <div className="w-[260px] shrink-0 bg-white border-l border-surface-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-surface-100 shrink-0">
        <h4 className="text-xs font-semibold text-surface-900 flex items-center gap-1.5">
          <Icon name="tag" size={14} /> 标签
        </h4>
      </div>

      {/* Scrollable tag area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Quick tag shortcuts */}
        <QuickTagBar dims={tagDims} tagsByDim={tagsByDim} activeIds={activeIds} onToggle={toggle} />

        {/* Tag dimensions */}
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

        {tagDims.length === 0 && (
          <p className="text-2xs text-surface-700 text-center py-4">暂无标签维度</p>
        )}
      </div>

      {/* Notes section */}
      <div className="border-t border-surface-200 shrink-0">
        <div className="px-3 py-2 border-b border-surface-100">
          <h4 className="text-xs font-semibold text-surface-900 flex items-center gap-1.5">
            <Icon name="note" size={14} /> 笔记
          </h4>
        </div>
        <div className="p-2.5">
          <div className="flex gap-1 mb-2">
            <input
              ref={noteInputRef}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addNote(); }}
              placeholder="添加笔记..."
              className="flex-1 px-2 py-1.5 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-900 placeholder:text-surface-700 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
            <button
              onClick={addNote}
              className="px-2.5 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs rounded-lg transition-colors shrink-0"
            >
              <Icon name="plus" size={14} />
            </button>
          </div>
          {notes.map(n => (
            <div key={n.id} className="flex items-start gap-2 px-2.5 py-2 bg-surface-100 rounded-lg mb-1 group">
              <span className="text-xs text-surface-900 flex-1 break-all">{n.content}</span>
              <button
                onClick={() => removeNote(n.id)}
                className="text-2xs text-surface-700 hover:text-ios-red opacity-0 group-hover:opacity-100 transition-all shrink-0"
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
