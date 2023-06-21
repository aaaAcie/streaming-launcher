<!--
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-19 15:53:23
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-19 16:37:48
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\views\home\components\EVRModal.vue
 * @Description: 
 * 
-->
<template>
  <settingModel>
    <template #content>
      <div class="box">
        <span style="width: 70px;">底座文件：</span>
        <div class="des">{{props.defaultConfig.ueDefaultDir}}</div>
        <span @click="chooseFile('ue')" class="choose">选择底座目录</span>
      </div>
      <br />
      <div class="box">
        <span style="width: 70px;">场景文件：</span>
        <div class="des">{{props.defaultConfig.evrDefaultDir}}</div>
        <span @click="chooseFile('scene')" class="choose">选择场景目录</span>
      </div>
    </template>
  </settingModel>

</template>

<script setup>
  import { ref } from 'vue'
  import settingModel from '@/components/settingModal.vue'
  import { tabAdd, openEXE, getCofig,writeJson,getDirectory,notifyIPC } from '@/utils/core.js'
  const props = defineProps({
    defaultConfig: {
      type: Object,
      required: true
    },
    UEfile: {
      type: Object,
      required: true
    }
  })
  // 触发父组件
  const chooseFile = (name) => {
    if(name==='ue'){
      // 选择ue的windows文件夹 将会自动寻找到/MxWorld/Binaries/Win64里的exe文件，才能做到关闭启动器，把ue一起关闭。
      getCofig('DIALOG').then(fileData => {
        props.UEfile.value = fileData
        props.defaultConfig.ueDefaultDir = fileData.selectedDir
        console.log(props.UEfile.value)
      })
    }else if(name==='scene'){
      getDirectory(name).then(fileData => {
        // 存在本地
        window.localStorage.setItem('ueScene',JSON.stringify(fileData))
        props.defaultConfig.evrDefaultDir = fileData.selectedDir
        getCofig('SecenePath',fileData.selectedDir).then(fileData => {
          console.log(fileData,'发送成功')
        })
      })
    }
  }
</script>

<style lang="less" scoped>
.box{
  display: flex;
  .des{
    flex: 1;
    height: 100px;
    border: 1px #2f3241 solid;
    padding: 5px;
    margin-right: 10px;
    background-color: #2f3241;
    color: #a6f5ff;

  }
  .choose {
    color: #d4e8ef;
  }
}
</style>
