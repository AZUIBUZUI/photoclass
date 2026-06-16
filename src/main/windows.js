import { BrowserWindow, screen, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow = null;

export function createMainWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.floor(screenWidth * 0.8),
    height: Math.floor(screenHeight * 0.85),
    minWidth: 1024,
    minHeight: 680,
    title: 'PhotoClass',
    backgroundColor: '#0f172a',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#94a3b8',
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });

  // Show immediately to avoid invisible window on load failure
  mainWindow.show();

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.webContents.on('did-fail-load', () => {
    dialog.showErrorBox('加载失败', '应用界面加载失败，请重新安装。');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function getMainWindow() {
  return mainWindow;
}
