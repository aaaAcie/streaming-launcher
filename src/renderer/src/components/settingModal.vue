<!--
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-19 15:29:37
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-20 10:29:21
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\components\settingModal.vue
 * @Description: 
 * 
-->
<template>
<!-- <n-config-provider :theme="darkTheme"> -->
  <n-modal :style="bodyStyle">
    <n-card style="width: 600px" title="设置" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <slot name="content"></slot>
      <slot name="footer"></slot>
    </n-card>
  </n-modal>
<!-- </n-config-provider> -->
</template>
<style lang="less" scoped></style>
<script setup>
import { NCard, NModal, NAlert, NConfigProvider } from "naive-ui";
import { ref, reactive } from "vue";
import { darkTheme } from "naive-ui";
const showModal = ref(true);
const bodyStyle = {
  "--n-font-color": "#f4f4f4",
  "--n-color-modal": "#3e4654",
  "--n-title-text-color": "#e0e0e1",
  "--n-text-color": "#fff",
};


</script>


