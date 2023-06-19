/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-15 09:40:25
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-16 18:02:44
 * @FilePath: \mx\UE-launcher3\electron-app\src\main\ws.js
 * @Description: 
 * 
 */
const { BrowserWindow  } = require('electron')
// import { BrowserWindow } from 'electron'

import { createEXE3, getExeFile } from './createWin'
import WebSocket from 'ws'
const getServer = (clientMap, port,that,mainWindow) => {
  const server = new WebSocket.Server({ port: port });

  server.on('connection', (ws, req) => {
    console.log('A new client has connected!');
    const clientId = extractIPv4Address(req.socket.remoteAddress) + ':' + req.socket.remotePort;
    console.log(clientId)
    clientMap.set(clientId, ws);
    
    ws.on('message', (msgRaw) => {
      console.log(`Received message ${msgRaw} from client ${clientId}`);
      var message;
      try {
        message = JSON.parse(msgRaw);
      } catch(err) {
        console.error(`cannot parse Streamer message: ${msgRaw}\nError: ${err}`);
        // ws.close(1008, 'Cannot parse');
        return;
      }
      // { type: 'openExe',  name: 'ue' }
      if (message.type === 'openExe') {
        console.log(message);
        message.clientId = clientId
        mainWindow.webContents.send('receiveFromWeb', message);

      }else if(message.type === 'getData'){
        if (message.name === 'scene') {
          // console.log(that)
          let scenePath = that.getScenePath()
          getExeFile(scenePath,'.mxmap').then((fileArray) => {
            console.log(fileArray)
            ws.send(JSON.stringify({type: 'getData', name: 'scene', fileArray}))
          })
        }
      }
      // 广播消息至所有客户端
      // server.clients.forEach((client) => {
      //   if (client.readyState === WebSocket.OPEN) {
      //     client.send(JSON.stringify(message));
      //   }
      // });
    });
    ws.on('close', function(code, reason) {
      // 当客户端断开连接时删除其映射关系
      clientMap.delete(clientId);
      console.error(`客户端 disconnected: ${code} - ${reason}`);
    });
  
    ws.on('error', function(error) {
      console.error(`客户端 connection error: ${error}`);
      try {
        ws.close(1006 /* abnormal closure */, error);
      } catch(err) {
        console.error(`ERROR: ws.on error: ${err.message}`);
      }
    });
  
  });
  return server;
}

const extractIPv4Address = (ipv6Address) => {
  return ipv6Address.split(':ffff:')[1] || 'localhost';
}


export const webServer = class {
  constructor(port, mainWindow,scenePath) {
    this.clientMap = new Map(); // 存储客户端ID和WebSocket连接之间的映射关系的Map
    this.server = getServer(this.clientMap, port,this,mainWindow)
    this.scenePath = scenePath
  }
  sendToClient(clientId, message){
    // 获取目标客户端的WebSocket连接，并向其发送消息
    const socket = this.clientMap.get(clientId);
    // console.log('------fasongl--',clientId,socket)
    if (socket) {
      socket.send(JSON.stringify(message));
    }

  }
  updateSecenePath(scenePath){
    this.scenePath = scenePath
    console.log('111111', this.getScenePath())
    
  }
  getScenePath(){
    console.log('gettttt',this.scenePath)
    return this.scenePath
  }
}