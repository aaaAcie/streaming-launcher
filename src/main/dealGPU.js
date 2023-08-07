/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-07-19 10:24:20
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-07-19 10:46:43
 * @FilePath: \mx\UE-launcher3\electron-app\src\main\dealGPU.js
 * @Description: 
 * 
 */
const cuda = require('node-cuda');

// 指定要使用的 GPU 设备索引
const gpuIndex = 0;

// 初始化 CUDA
cuda.init();

// 获取 GPU 设备数量
const deviceCount = cuda.getDeviceCount();
console.log(`可用的 GPU 设备数量：${deviceCount}`);

if (gpuIndex < deviceCount) {
  // 设置当前要使用的 GPU 设备
  cuda.setDevice(gpuIndex);
  console.log(`当前使用的 GPU 设备索引：${gpuIndex}`);

  // 在这里执行您的 GPU 加速代码
  // ...
} else {
  console.error('指定的 GPU 索引无效');
}
