/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-08 12:03:39
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-12 11:57:36
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\api\server.js
 * @Description: 
 * 
 */
import request from '@/utils/request.js'

// 查询客户端
export const queryClientList = (params) =>{
  return request({
    method: 'get',
    // url: '/server/queryClientList',
    url: '/server/queryPushStreamServerList',
    params
  })
}

// 查询连接数为0的客户端
export const queryBlankClientList = (params) =>{
  return request({
    method: 'get',
    // url: '/server/queryBlankClientList',
    url: '/server/queryBlankPushStreamServer',
    params
  })
}

// 踢出客户端玩家
export const killClientPlayer = (data) =>{
  return request({
    method: 'post',
    url: '/server/killClientPlayer',
    data
  })
}

// 更新和manager连接的推流服务端信息
export const updatePushStreamServer = (data) =>{
  return request({
    method: 'post',
    url: '/server/updatePushStreamServer',
    data
  })
}

// 下线推流服务器
export const killPushStreamServer = (data) =>{
  return request({
    method: 'post',
    url: '/server/killPushStreamServer',
    data
  })
}