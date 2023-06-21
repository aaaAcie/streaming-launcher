<template>
  <div class="app">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!-- <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <component :is="Component"></component>
        </keep-alive>
      </transition>
    </router-view> -->
  </div>
</template>

<script setup>
import { openEXE } from '@/utils/core.js'

// 启动manager  
// openEXE 会自己判断路径
openEXE("manager.exe", "..\\manager");
</script>

<style scoped>

</style>