/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-07 16:10:30
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-15 12:37:05
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\hooks\useFeebackDealer.js
 * @Description: 
 * 
 */
import {reactive, watchEffect} from 'vue'
import useMsgDealer from './useMsgDealer'
// 推流服务器 ue的config设置
// publicip获取
export default (keyMsg,alertMsg) => {
  let first = 0
  window.electron.ipcRenderer.on('sendMsg', (event, type, message, cmdStr) => {
    console.log('type',type)
    if (type.startsWith('success')) {
      ++first
      if (first < 2) {
        alertMsg.value = {
          done: true,
          type: 'success',
          title: '打开成功',
          content: `${cmdStr}打开成功`,
          reason: '',
          exe: cmdStr
        }
      }
      let str = useMsgDealer(message,cmdStr).trim()
      if (str.length > 0) {
        keyMsg.value.push(str)
        console.log('=======', keyMsg.value)
      }
    } else {
      alertMsg.value = {
        done: true,
        type: 'error',
        title: `${cmdStr}打开失败`,
        content: new Error(message).message,
        reason: '',
        exe: cmdStr
      }
      console.log('error', message)
    }
  });
  watchEffect(async cleanup => {
    
  })

  // return alertMsg.value
}