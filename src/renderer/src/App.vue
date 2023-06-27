<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { openEXE } from '@/utils/core.js'

// 启动manager  
// openEXE 会自己判断路径
openEXE("manager.exe", "..\\manager");

// 应该在这里监听window.electron.ipcRenderer.once('receiveFromWeb', (event, arg) => {})



</script>

<style scoped>

</style>