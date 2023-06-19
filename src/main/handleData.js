/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-12 12:27:39
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-19 11:27:47
 * @FilePath: \mx\UE-launcher3\electron-app\src\main\handleData.js
 * @Description: 
 * 
 */
import { app, shell, BrowserWindow,ipcMain,session  } from 'electron'
import { join } from 'path'
import {createTab,createEXE3,getIp,readJson,openDialog,getExePath,killProcess,writeJson,getDirectory} from './createWin'
import { webServer } from './ws'
export const handleData = (workerProcessList,mainWindow) => {
  // console.log('==mainWindow1=',mainWindow)

  const myWebServer = new webServer(8811,mainWindow)
  ipcMain.handle('notifyIPC', (e,command,clientId,rawdata) => {
    let data = JSON.parse(rawdata)
    console.log('-------------------',command,data,typeof data)
    if(command==='startStreaming'){

      myWebServer.sendToClient(clientId, {
        type:'openExe',
        name: 'ue',
        port: data
      })
    }
    
    return command
  })
  ipcMain.handle('addTab', (e,url,params) => {
    let workerProcess = createTab(mainWindow, url)
    workerProcessList.push(workerProcess)
    return url
  })
  ipcMain.handle('openEXE', (e,cmdStr,cmdPath,cmdArray) => {
    console.log(cmdArray)

    let workerProcess = createEXE3(cmdStr,cmdPath,cmdArray,mainWindow)
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
    }else if (configType == 'defaultPath') {
      const data = await getExePath()
      return data
    }else if (configType == 'SecenePath') {
      myWebServer.updateSecenePath(path)
      return path
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
  ipcMain.handle('getDirectory', (e,name) => {
    console.log(name)
    return getDirectory(name)
  })
  
  ipcMain.handle('getExeFile', (e, folderPath, suffix) => {
    console.log(folderPath,suffix)
    return getExeFile(folderPath,suffix)
  })
}
