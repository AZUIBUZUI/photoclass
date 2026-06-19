import React from 'react';
import useStore from '../../stores';
import Icon from './Icon';

export default function Toast() {
  const toasts = useStore(s => s.toasts);
  const remove = useStore(s => s.removeToast);
  if (!toasts.length) return null;

  const iconMap = { success: 'success', error: 'error', info: null };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)}
          className={`toast-enter pointer-events-auto px-4 py-2.5 rounded-xl text-sm shadow-ios-md cursor-pointer flex items-center gap-2
            ${t.type === 'success' ? 'bg-ios-green text-white' : ''}
            ${t.type === 'error' ? 'bg-ios-red text-white' : ''}
            ${t.type === 'info' ? 'bg-white text-surface-900 border border-surface-200' : ''}`}>
          {iconMap[t.type] && <Icon name={iconMap[t.type]} size={16} />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}
