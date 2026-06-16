import { app, BrowserWindow } from 'electron';
import { createMainWindow, getMainWindow } from './windows.js';
import { registerProtocol } from './protocol.js';
import { setupKeyboardHook } from './globalShortcuts.js';
import { registerAllHandlers } from './ipc/index.js';
import { closeRegistryDb } from './db/connection.js';

// ---- App Lifecycle ----

app.whenReady().then(() => {
  registerProtocol();
  registerAllHandlers();
  const mainWindow = createMainWindow();
  setupKeyboardHook(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  closeRegistryDb();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}
