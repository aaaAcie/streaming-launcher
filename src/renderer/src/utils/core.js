/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-14 17:48:38
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-21 17:41:48
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\utils\core.js
 * @Description: 
 * 
 */
import { updatePushStreamServer } from "@/api/server";


// 跳转页面tab
export const tabAdd = async (url, params = {}) => {
  const response = await window.electron.addTab(url, params);
  console.log(response); // prints out 'pong'
};
// openEXE
export const openEXE = (cmdStr, cmdPath = "", cmdArray = [], updateConfig={}) => {
  return new Promise(async(resolve, reject) => {
    let port, address
    const response = await window.electron.openEXE(cmdStr, cmdPath, cmdArray);
    // console.log('exe打开消息：',response); // prints out 'pong'
    const {pid} = response
    if (cmdStr.startsWith('cirrus')) {
      // port = cmdArray[1]
      // address = cmdArray[7]
      port = updateConfig['port']
      address = updateConfig['address']
      // 调用接口，更新cirrus的 [serverPid]
      const data = await updateData({
        address,
        port,
        serverPid: pid
      })
      console.log(data)
    }else if(cmdStr.startsWith('MxWorld')){
      port = updateConfig['port']
      address = updateConfig['address']
      // 调用接口，更新cirrus的 [clientPid] [clientPath]
      const data = await updateData({
        address,
        port,
        clientPid: pid,
        clientPath: cmdPath
      })
      console.log(data)
    }
    if (pid) {
      resolve(response)
    }else{
      reject(response)
    }
  })
};

export const getCofig = async (configType, path='') => {
  const response = await window.electron.sendConfig(configType, path);
  
  console.log(`----config ${configType}------`,response); // prints out 'pong'
  // 把MatchmakerAddress存在本地
  if (configType==='CONFIG') {
    window.localStorage.setItem('MatchmakerAddress',response.MatchmakerAddress)
    window.localStorage.setItem('managerPort',response.managerPort)
  }

  // return response
  return new Promise((resolve, reject) => {
    resolve(response)
  })
};

// killProcess
export const killProcess = async (pid) => {
  const response = await window.electron.killProcess(pid);
  // console.log(response); // prints out 'pong'
  return response
};
// writeJson
export const writeJson = async (finalJson,path) => {
  let data = JSON.parse(JSON.stringify(finalJson))
  const response = await window.electron.writeJSON(data,path);
  // const response = await window.electron.writeJSON(path,finalJson);

  // console.log(response); // prints out 'pong'
  return response
};

export const getExeFile = async (folderPath,suffix) => {
  const response = await window.electron.getExeFile(folderPath,suffix);
  return response
};
export const getDirectory = async (name) => {
  const response = await window.electron.getDirectory(name);
  return response
};

export const notifyIPC = async (command,clientId,data) => {
  const response = await window.electron.notifyIPC(command,clientId,data);
  return response
};

export const updateData = async(streamData,tryTime=1,time=3000) => {
  if (tryTime > 2) {
    // 每隔5s尝试一次 尝试5次
    console.log('与manager建立连接失败')
    return streamData + '与manager建立连接失败'
  }
  setTimeout(() => {
    return new Promise(async (resolve, reject) => {
      console.log('updateData=========', tryTime)
      const {data} = await updatePushStreamServer({
        ...streamData
      })
      console.log('updateData====data===',data)
      if (data.code===1001) {
        resolve(data)
      }else{
        updateData(streamData,tryTime+1,5000)
      }
    })
  }, time)
  
}

// 给主线程通知pid
export const addPid = async (cmdStr,pid) => {
  const response = await window.electron.addPid(cmdStr,pid);
  console.log(response); // prints out 'pong'
};