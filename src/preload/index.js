import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipcChannels.js';

const INVOKE_CHANNELS = Object.values(IPC).filter(c => !c.startsWith('event:'));
const EVENT_CHANNELS = Object.values(IPC).filter(c => c.startsWith('event:'));

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, ...args) => {
    if (INVOKE_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`Blocked IPC channel: ${channel}`));
  },

  on: (channel, callback) => {
    if (EVENT_CHANNELS.includes(channel)) {
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    console.warn(`Blocked IPC event channel: ${channel}`);
    return () => {};
  },

  onShortcut: (callback) => {
    const channel = IPC.EVENT_SHORTCUT_TRIGGERED;
    const subscription = (_event, actionId, combo) => callback(actionId, combo);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },

  onImportProgress: (callback) => {
    const channel = IPC.EVENT_IMPORT_PROGRESS;
    const subscription = (_event, progress) => callback(progress);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },

  onImportComplete: (callback) => {
    const channel = IPC.EVENT_IMPORT_COMPLETE;
    const subscription = (_event, result) => callback(result);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },

  onProjectChanged: (callback) => {
    const channel = IPC.EVENT_PROJECT_CHANGED;
    const subscription = (_event, project) => callback(project);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
});
