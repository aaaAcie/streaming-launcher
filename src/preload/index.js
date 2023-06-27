/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-05-30 09:46:04
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-16 17:46:58
 * @FilePath: \mx\UE-launcher3\electron-app\src\preload\index.js
 * @Description: 
 * 
 */
import { contextBridge,ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      addTab : (url,params) => ipcRenderer.invoke('addTab', url, params),
      openEXE : (cmdStr,cmdPath,cmdArray) => ipcRenderer.invoke('openEXE',cmdStr,cmdPath,cmdArray),
      sendConfig : (configType,path) => ipcRenderer.invoke('sendConfig',configType,path),
      killProcess: (pid) => ipcRenderer.invoke('killProcess',pid),
      writeJSON: (data,path) => ipcRenderer.invoke('writeJSON',data,path),
      getDirectory: (name) => ipcRenderer.invoke('getDirectory',name),
      getExeFile: (folderPath,suffix) => ipcRenderer.invoke('getDirectory',folderPath,suffix),
      notifyIPC: (command,clientId,data) => ipcRenderer.invoke('notifyIPC',command,clientId,data),
      addPid : (cmdStr,pid) => ipcRenderer.invoke('addPid', cmdStr, pid),
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
