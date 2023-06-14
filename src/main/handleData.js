import { app, shell, BrowserWindow,ipcMain,session  } from 'electron'
import { join } from 'path'
import {createTab,createEXE3,getIp,readJson,openDialog,killProcess,writeJson} from './createWin'

export const handleData = (workerProcessList,mainWindow) => {
  ipcMain.handle('addTab', (e,url,params) => {
    let workerProcess = createTab(mainWindow, url)
    workerProcessList.push(workerProcess)
    return url
  })
  ipcMain.handle('openEXE', (e,cmdStr,cmdPath,cmdArray) => {
    console.log(cmdArray)

    let workerProcess = createEXE3(cmdStr,cmdPath,cmdArray)
    workerProcessList.push(workerProcess)
    
    return {cmdStr, cmdPath, pid:workerProcess.pid}
  })
  ipcMain.handle('sendConfig', async(e,configType,path) => {
    if (configType=='IP') {
      const address = getIp()
      return address
    }else if (configType=='CONFIG') {
      const config = await readJson(path)
      return config
    }else if (configType=='DIALOG') {
      const fileObj = await openDialog()
      return fileObj
    }
  })
  ipcMain.handle('killProcess', (e,pid) => {

    let res = killProcess(pid)
    
    return res
  })
  ipcMain.handle('writeJSON', (e,finalJson,path) => {
    console.log(path)
    let res = writeJson(finalJson,path)
    
    return res
  })
}
