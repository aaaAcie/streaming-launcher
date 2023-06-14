import { updatePushStreamServer } from "@/api/server";


// 跳转页面tab
export const tabAdd = async (url, params = {}) => {
  const response = await window.electron.addTab(url, params);
  console.log(response); // prints out 'pong'
};
// openEXE
export const openEXE = async (cmdStr, cmdPath = "", cmdArray = [], updateConfig={}) => {
  let port, address
  const response = await window.electron.openEXE(cmdStr, cmdPath, cmdArray);
  console.log(response); // prints out 'pong'
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
  return response
};

export const getCofig = async (configType, path='') => {
  const response = await window.electron.sendConfig(configType, path);
  
  console.log(`----config ${configType}------`,response); // prints out 'pong'
  // 把MatchmakerAddress存在本地
  window.localStorage.setItem('MatchmakerAddress',response.MatchmakerAddress)
  window.localStorage.setItem('managerPort',response.managerPort)

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
const updateData = async(streamData,tryTime=1,time=3000) => {
  if (tryTime > 5) {
    // 每隔5s尝试一次 尝试5次
    console.log('与manager建立连接失败')
    return streamData + '与manager建立连接失败'
  }
  setTimeout(() => {
    return new Promise(async (resolve, reject) => {
      console.log('updateData=========', tryTime)
      const {data}  = await updatePushStreamServer({
        ...streamData
      })
      console.log(data)
      if (data.code===1001) {
        resolve(data)
      }else{
        updateData(streamData,tryTime+1,5000)
      }
    })
  }, time)
  
}