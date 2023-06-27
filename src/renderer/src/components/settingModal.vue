<!--
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-19 15:29:37
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-26 10:19:29
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\components\settingModal.vue
 * @Description: 
 * 
-->
<template>
  <n-modal :style="bodyStyle">
    <n-card :title="title" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <slot name="content"></slot>
      <slot name="footer"></slot>
    </n-card>
  </n-modal>
</template>

<style lang="less" scoped>
.n-card {
  width: var(--cardWidth, 600px);
}
</style>

<script setup>
import { NCard, NModal } from "naive-ui";
const bodyStyle = {
  "--n-font-color": "#f4f4f4",
  "--n-color-modal": "#3e4654",
  "--n-title-text-color": "#e0e0e1",
  "--n-text-color": "#fff",
};
const {title} = defineProps({
  title: {
    type: String,
    default: '设置'
  },
})

</script>


