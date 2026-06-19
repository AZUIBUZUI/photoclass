import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores';
import Icon from '../components/common/Icon';

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
    <div className="h-full flex items-center justify-center p-8 bg-surface-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Icon name="app-logo" size={64} className="text-accent-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-surface-900 mb-1">PhotoClass</h1>
          <p className="text-surface-800 text-sm">审美样片分类 — 建立你的参考库</p>
        </div>

        {err && <div className="mb-4 p-3 bg-ios-red/10 border border-ios-red/30 rounded-xl text-ios-red text-sm text-center">{err}</div>}

        {showCreate ? (
          <div className="bg-white rounded-2xl p-5 shadow-ios-md border border-surface-200 mb-4">
            <h3 className="text-sm font-semibold text-surface-900 mb-3">新建项目</h3>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="项目名称" autoFocus
              onKeyDown={e => e.key === 'Enter' && createProject()}
              className="w-full px-3 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-900 text-sm placeholder:text-surface-700 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 mb-3"
            />
            <div className="flex gap-2">
              <button onClick={createProject} disabled={busy}
                className="flex-1 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                {busy ? '创建中...' : '选择位置并创建'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 bg-surface-200 hover:bg-surface-300 text-surface-800 rounded-xl text-sm transition-colors">取消</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCreate(true)}
            className="w-full py-3.5 mb-4 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl text-base font-semibold shadow-ios-md transition-all duration-200 flex items-center justify-center gap-2">
            <Icon name="plus" size={20} /> 新建项目
          </button>
        )}

        <button onClick={async () => {
          const r = await window.api.invoke('dialog:openFile', { title: '打开项目', filters: [{ name: 'PhotoClass', extensions: ['photoclass'] }] });
          if (r.data?.length) openProject(r.data[0]);
        }}
          className="w-full py-3.5 mb-6 bg-white hover:bg-surface-100 text-surface-900 rounded-2xl text-base font-medium border border-surface-200 shadow-ios transition-colors">
          打开已有项目
        </button>

        {recents.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-surface-800 mb-2 px-1">最近</h3>
            <div className="space-y-0.5">
              {recents.map(p => (
                <button key={p.id} onClick={() => openProject(p.db_path)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white text-sm text-surface-900 transition-colors">
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
