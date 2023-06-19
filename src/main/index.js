/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-05-30 09:46:04
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-08 12:24:24
 * @FilePath: \mx\UE-launcher3\electron-app\src\main\index.js
 * @Description: 
 * 
 */
import { app, shell, BrowserWindow,ipcMain,session  } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {createTab,createEXE3,getIp,readJson,openDialog,killProcess} from './createWin'
import { handleData } from './handleData'
var workerProcessList = []
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.webContents.openDevTools();

  handleData(workerProcessList,mainWindow)


  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  
  app.on('web-contents-created', (_, contents) => {
    contents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // 'Content-Security-Policy': ["default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'"]
          'Content-Security-Policy': ["default-src 'self' * http://192.168.6.227:83 http://192.168.2.128 data:; script-src * 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' * data:"]

          // default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
        }
      })
    })
  })
  
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  try {
    for (let i = 0; i < workerProcessList.length; i++) {
      // console.log(workerProcessList[i]);
      // console.log('pid ',workerProcessList[i].pid);

      workerProcessList[i].kill()
      // process.kill(workerProcessList[i].pid);
    }
  } catch (error) {
    console.log(error)
  }
})
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
