import React, { useEffect, useState, useRef } from 'react';
import Icon from '../common/Icon';

export default function NotePanel({ imageId }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { if (imageId) load(); }, [imageId]);

  async function load() {
    const r = await window.api.invoke('annotation:list', imageId);
    if (r.data) setNotes(r.data);
  }

  async function add() {
    if (!text.trim() || !imageId) return;
    await window.api.invoke('annotation:create', imageId, 'note', text.trim());
    setText('');
    await load();
  }

  async function remove(id) {
    await window.api.invoke('annotation:delete', id);
    await load();
  }

  return (
    <div className="p-3">
      <h4 className="text-xs font-medium text-surface-900 mb-2 flex items-center gap-1">
        <Icon name="note" size={14} /> 笔记
      </h4>
      <div className="flex gap-1 mb-2">
        <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
          placeholder="添加笔记..." className="flex-1 px-2 py-1.5 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-900 placeholder:text-surface-700 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
        <button onClick={add} className="px-2.5 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs rounded-lg transition-colors">
          <Icon name="plus" size={14} />
        </button>
      </div>
      {notes.map(n => (
        <div key={n.id} className="flex items-start gap-2 px-2.5 py-2 bg-surface-100 rounded-lg mb-1 group">
          <span className="text-xs text-surface-900 flex-1 break-all">{n.content}</span>
          <button onClick={() => remove(n.id)} className="text-2xs text-surface-700 hover:text-ios-red opacity-0 group-hover:opacity-100 transition-all">
            <Icon name="close" size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
