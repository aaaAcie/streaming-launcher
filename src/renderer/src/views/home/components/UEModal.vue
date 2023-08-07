<!--
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-06-19 15:53:23
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-07-17 10:14:50
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
          服务器：
          <!-- <n-checkbox v-model:checked="openLocalServer" class="info" style="margin-left: 8px;--n-text-color: #c2f5ff;--n-color:#2f3241;--n-border: 1px solid #c2f5ff">本地</n-checkbox> -->
          <n-radio-group v-model:value="value" name="radiogroup" style="margin-left: 8px;" @update:value="handleChangeRaido">
            <n-space>
              <n-radio v-for="s in serverOptions" :key="s.value" :value="s.value" style="--n-text-color: #c2f5ff;--n-color: #2f3241;--n-box-shadow:none;">
                {{ s.label }}
              </n-radio>
            </n-space>
            <!-- <n-radio-button
              v-for="s in serverOptions"
              :key="s.value"
              :value="s.value"
              :label="s.label"
              style="--n-button-text-color: #c2f5ff;--n-button-text-color-active: #c2f5ff;--n-button-color-active: #2f3241;--n-box-shadow:none;">
            </n-radio-button> -->
          </n-radio-group>
        </span>
        <div class="des">
          <MxInput v-model:data="props.defaultConfig.MatchmakerAddress" title="服务端IP" :isInput="value==='customize' ? true : false"></MxInput>
          <MxInput v-model:data="props.defaultConfig.managerPort" title="http端口" :isInput="value==='customize' ? true : false"></MxInput>
          <MxInput v-model:data="props.defaultConfig.MatchmakerPort" title="ws端口" :isInput="value==='customize' ? true : false"></MxInput>
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
  import { NCheckbox, NRadioGroup, NSpace, NRadio,NRadioButton } from 'naive-ui'
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
  const value = ref('local')
  const serverOptions = [{
    value: "local",
    label: "本地"
  },{
    value: "mx",
    label: "美象"
  },{
    value: "customize",
    label: "自定义"
  }]
  onMounted(() => {
    turnRef.value = props.openTurn
    console.log(props.defaultConfig?.MatchmakerType)
    // 如果有MatchmakerType
    if(props.defaultConfig?.MatchmakerType){
      value.value = props.defaultConfig?.MatchmakerType
    }else{
      if(props.defaultConfig?.MatchmakerAddress?.startsWith('192')){
        value.value = 'local'
        props.defaultConfig.MatchmakerType = 'local'
      }else{
        value.value = 'mx'
        props.defaultConfig.MatchmakerType = 'mx'
      }
    }
  })
  // 更新Matchmaker的配置
  const handleChangeRaido = () => {
    if (value.value === 'mx') {
      props.defaultConfig.MatchmakerAddress = "115.238.181.246"
      props.defaultConfig.MatchmakerPort = "12002"
      props.defaultConfig.managerPort = "12001"
    }else if(value.value === 'local'){
      // props.defaultConfig.MatchmakerAddress = "192.168.2.128"
      props.defaultConfig.MatchmakerAddress = props.defaultConfig.LocalIP
      props.defaultConfig.MatchmakerPort = "9990"
      props.defaultConfig.managerPort = "83"
    }
    props.defaultConfig.MatchmakerType = value.value
    console.log('将matchmakertype更新为, ', value.value)
  }
  const emit = defineEmits(['setShowValue','update:UEfile'])

  const chooseFile = (name) => {
    if(name==='ue'){
      // 选择ue的windows文件夹 将会自动寻找到/MxWorld/Binaries/Win64里的exe文件，才能做到关闭启动器，把ue一起关闭。
      getCofig('DIALOG').then(fileData => {
        // props.UEfile.value = fileData
        // props.UEfile = fileData
        emit('update:UEfile', fileData)
        props.defaultConfig.ueDefaultDir = fileData.selectedDir
        console.log(props.UEfile)
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
