import React, { useEffect, useState, useRef } from 'react';

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
      <h4 className="text-xs font-medium text-slate-400 mb-2">📝 笔记</h4>
      <div className="flex gap-1 mb-2">
        <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
          placeholder="添加笔记..." className="flex-1 px-2 py-1 bg-surface-800 border border-surface-700 rounded text-xs text-slate-300 placeholder:text-slate-600 focus:border-accent-500 focus:outline-none" />
        <button onClick={add} className="px-2 py-1 bg-accent-500 hover:bg-accent-600 text-white text-xs rounded">+</button>
      </div>
      {notes.map(n => (
        <div key={n.id} className="flex items-start gap-2 px-2 py-1.5 bg-surface-800 rounded mb-1 group">
          <span className="text-xs text-slate-300 flex-1 break-all">{n.content}</span>
          <button onClick={() => remove(n.id)} className="text-2xs text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}
