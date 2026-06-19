import React from 'react';
import TitleBar from './TitleBar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import Toast from '../common/Toast';
import useStore from '../../stores';

export default function AppShell({ children }) {
  const open = useStore(s => s.isProjectOpen);

  return (
    <div className="h-full w-full flex flex-col bg-surface-100">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100% - 36px)' }}>
        {open && <Sidebar />}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-hidden">{children}</div>
          {open && <StatusBar />}
        </main>
      </div>
      <Toast />
    </div>
  );
}
