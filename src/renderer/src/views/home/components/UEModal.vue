<!--
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-19 15:53:23
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-29 13:58:59
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\views\home\components\UEModal.vue
 * @Description: 
 * 
-->
<template>
  <settingModel >
    <template #content>
      <div class="box">
        <span style="width: 70px;">底座：</span>
        <div class="des" style="flex-direction: column;">
          <div style="width: 100%;" class="single-des">
            <MxInput :data="ueName" title="名称"></MxInput>
          </div>
          <div>
            <MxInput :data="props.defaultConfig.ueDefaultDir" title="目录">
              <template #suffix>
                <span @click="chooseFile('ue')" class="choose" style="margin-left: 10px;">变更</span>
              </template>
            </MxInput>
          </div>
        </div>
      </div>
      <br />
      <div class="box">
        <span style="width: 70px;">端口：</span>
        <div class="des">
          <MxInput v-model:data="props.defaultConfig.StreamerPort" title="底座端口" ></MxInput>
          <MxInput v-model:data="props.defaultConfig.HttpPort" title="推流端口" ></MxInput>
          <MxInput v-model:data="props.defaultConfig.TurnPort" title="中继端口" >
            <template #prefix>
              <!-- <span @click="chooseFile('ue')" class="choose" style="margin-left: 10px;">变更</span> -->
              <slot name="checkbox"></slot>
              <!-- <n-checkbox v-model:checked="turnRef" :style="bodyStyle"></n-checkbox> -->
            </template>
          </MxInput>
        </div>
      </div>
      <br />
      <div class="box">
        <span style="width: 300px;">
          服务器：<n-checkbox v-model:checked="openLocalServer" class="info" style="margin-left: 8px;--n-text-color: #c2f5ff;--n-color:#2f3241;--n-border: 1px solid #c2f5ff">本地</n-checkbox>
        </span>
        <div class="des">
          <MxInput v-model:data="props.defaultConfig.MatchmakerAddress" title="服务端IP" :isInput="false"></MxInput>
          <MxInput v-model:data="props.defaultConfig.managerPort" title="http端口" :isInput="false"></MxInput>
          <MxInput v-model:data="props.defaultConfig.MatchmakerPort" title="ws端口" :isInput="false"></MxInput>

        </div>
      </div>
    </template>
    <!-- <template #footer>
      <div style="float: right;margin-top: 20px;">
        <n-button @click="onNegativeClick" :style="btnStyle">取消</n-button>
        <n-button @click="onPositiveClick" type="primary" :style="btnStyle" style="position: relative;right: -10px">保存</n-button>
      </div>
    </template> -->
  </settingModel>

</template>

<script setup>
  import { ref,watch } from 'vue'
  import { NCheckbox, NButton } from 'naive-ui'
  import settingModel from '@/components/settingModal.vue'
  import { tabAdd, openEXE, getCofig,writeJson,getDirectory,notifyIPC } from '@/utils/core.js'
  import MxInput from '@/components/mxInput.vue';
  const props = defineProps({
    defaultConfig: {
      type: Object,
      required: true
    },
    UEfile: {
      type: Object,
      required: true
    },
    openTurn: {
      type: Boolean,
      default: false
    },
    showModal: [Boolean,Object],
  })
  let turnRef = ref('') // 用showRef去接收show
  let openLocalServer = ref(true) // 默认为本地
  onMounted(() => {
    turnRef.value = props.openTurn
    console.log(props.showModal)
    if(props.defaultConfig?.MatchmakerAddress?.startsWith('192')){
      openLocalServer.value = true
    }else{
      openLocalServer.value = false
    }
  })
  watch(
    () => { props.defaultConfig.MatchmakerAddress },
    (newV,oldv) => { console.log(newV) },
  )
  const emit = defineEmits(['setShowValue'])
  watchEffect(() => {
    // 不为本地
    if (!openLocalServer.value) {
      props.defaultConfig.MatchmakerAddress = "115.238.181.246"
      props.defaultConfig.MatchmakerPort = "12002"
      props.defaultConfig.managerPort = "12001"
    }else{
      props.defaultConfig.MatchmakerAddress = props.defaultConfig.LocalIP
      props.defaultConfig.MatchmakerPort = "9990"
      props.defaultConfig.managerPort = "83"
    }
    
  },{ flush: 'post' })
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
  const ueName = computed(() => {
    let str = props.defaultConfig.ueDefaultDir
    if(str){
      let strArray = str.split('\\')
      console.log(strArray)
      let name = strArray[strArray.length - 2]
      return name
    }
  })
  // const setValue = (type, data) => {
  //   console.log(type, data)
  //   // props.defaultConfig.StreamerPort = data
  // }
const onPositiveClick = () => {
  emit('setShowValue', false)
}

const onNegativeClick = () => {
  emit('setShowValue', false)
}
</script>

<style lang="less" scoped>
.box{
  display: flex;
  flex-direction: column;
  .des{
    flex: 1;
    display: flex;
    justify-content: space-around;
    height: 100px;
    border: 1px #2f3241 solid;
    padding: 5px;
    margin-right: 10px;
    background-color: #2f3241;
    color: #a6f5ff;
    width: 100%;
    padding: 10px 0 10px 10px;
    .single-des{
      margin-bottom: 10px;
    }
  }
  .choose {
    color: #d4e8ef;
  }
}
</style>
