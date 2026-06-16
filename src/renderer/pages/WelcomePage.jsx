import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores';

export default function WelcomePage() {
  const nav = useNavigate();
  const setProject = useStore(s => s.setProject);
  const addToast = useStore(s => s.addToast);
  const [recents, setRecents] = useState([]);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadRecents(); }, []);

  async function loadRecents() {
    const r = await window.api.invoke('project:list');
    if (r.data) setRecents(r.data);
  }

  async function openProject(dbPath) {
    setBusy(true); setErr('');
    const r = await window.api.invoke('project:open', dbPath);
    if (r.error) { setErr(r.error); setBusy(false); return; }
    setProject(r.data);
    addToast(`已打开: ${r.data.name}`, 'success');
    // 记忆功能：恢复到上次的页面
    const lastRoute = await window.api.invoke('settings:get', 'lastRoute');
    nav(lastRoute.data || '/browse');
  }

  async function createProject() {
    if (!name.trim()) { setErr('请输入项目名称'); return; }
    setBusy(true); setErr('');
    const save = await window.api.invoke('dialog:saveFile', { title: '保存项目文件', defaultPath: name.trim() });
    if (!save.data) { setBusy(false); return; }
    const r = await window.api.invoke('project:create', name.trim(), save.data);
    if (r.error) { setErr(r.error); setBusy(false); return; }
    await openProject(r.data.db_path);
  }

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">📸</div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">PhotoClass</h1>
          <p className="text-slate-400 text-sm">审美样片分类 — 建立你的参考库</p>
        </div>

        {err && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">{err}</div>}

        {showCreate ? (
          <div className="bg-surface-900 rounded-xl p-5 border border-surface-800 mb-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">新建项目</h3>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="项目名称" autoFocus
              onKeyDown={e => e.key === 'Enter' && createProject()}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-slate-200 text-sm placeholder:text-slate-600 focus:border-accent-500 focus:outline-none mb-3"
            />
            <div className="flex gap-2">
              <button onClick={createProject} disabled={busy}
                className="flex-1 py-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                {busy ? '创建中...' : '选择位置并创建'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-slate-400 rounded-lg text-sm">取消</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCreate(true)}
            className="w-full py-3 mb-4 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-lg font-medium">
            ＋ 新建项目
          </button>
        )}

        <button onClick={async () => {
          const r = await window.api.invoke('dialog:openFile', { title: '打开项目', filters: [{ name: 'PhotoClass', extensions: ['photoclass'] }] });
          if (r.data?.length) openProject(r.data[0]);
        }}
          className="w-full py-3 mb-6 bg-surface-800 hover:bg-surface-750 text-slate-300 rounded-xl text-lg font-medium border border-surface-700">
          📂 打开已有项目
        </button>

        {recents.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-slate-500 mb-2">最近</h3>
            <div className="space-y-0.5">
              {recents.map(p => (
                <button key={p.id} onClick={() => openProject(p.db_path)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-800 text-sm text-slate-300 transition-colors">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
