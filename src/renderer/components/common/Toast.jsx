import React from 'react';
import useStore from '../../stores';

export default function Toast() {
  const toasts = useStore(s => s.toasts);
  const remove = useStore(s => s.removeToast);
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)}
          className={`toast-enter pointer-events-auto px-4 py-2 rounded-lg text-sm shadow-lg cursor-pointer
            ${t.type === 'success' ? 'bg-emerald-600 text-white' : ''}
            ${t.type === 'error' ? 'bg-red-600 text-white' : ''}
            ${t.type === 'info' ? 'bg-surface-800 text-slate-200 border border-surface-700' : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
