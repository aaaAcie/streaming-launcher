<!--
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-05-30 15:31:30
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-27 10:52:50
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\views\home\index.vue
 * @Description: 
 * 
-->
<template>
  <Versions></Versions>
  <n-alert
    v-if="alertMsg.done"
    :title="alertMsg.title"
    :type="alertMsg.type"
    closable
    style="--n-color: rgba(237, 247, 242, 1)"
  >
    {{ alertMsg.content }}
  </n-alert>
  <!-- <router-view></router-view> -->
  <mangage v-model:show="showModalMangage" v-model:alertMsg="alertMsg" :isShow="showModalMangage"></mangage>
  <svg class="hero-logo" viewBox="0 0 900 300">
    <use xlink:href="@/assets/icons.svg#electron" />
  </svg>
  <h2 class="hero-text">美象数字孪生平台</h2>
  <p class="hero-tagline">
    当前IP为
    <code>{{ ip }}</code>
    <!-- <span @click="router.push('/mangage')" style="cursor: pointer;padding-left: 20px; text-decoration: underline;">管理后台</span> -->
    <!-- <a @click="copyToClipboard()" style="cursor: pointer;margin-left: 20px;">点击复制推流接口</a> -->

  </p>

  <div class="features">
    <div class="feature-item">
      <article>
        <h2 class="title">MXDATA</h2>
        <div class="btns">
          <n-button @click="handleJump('MXDATA')">启动</n-button>
        </div>
      </article>
    </div>
    <div class="feature-item">
      <article>
        <h2 class="title">EVR</h2>
        <div class="btns">
          <n-button @click="handleJump('EVR')">启动</n-button>
          <n-button @click="setModal('EVR')">设置</n-button>
        </div>
        <!-- <p class="detail">
          <span @click="chooseFile('ue')" class="choose">选择底座目录</span>
          <br/>
          <span @click="chooseFile('scene')" class="choose">选择场景目录</span>
        </p> -->
      </article>
    </div>
    <div class="feature-item">
      <article style="position: relative;">
        <h2 class="title">推流服务器</h2>
        <div class="checkbox">
          <n-checkbox v-model:checked="openUE" class="info" style="--n-text-color: #c2f5ff;--n-color:#2f3241;--n-border: 1px solid #c2f5ff">同步开启底座</n-checkbox>
          <!-- <span @click="chooseFile('ue')" class="choose">选择目录</span> -->
        </div>
        <div class="btns">
          <n-button @click="handleJump('推流服务器')">启动</n-button>
          <n-button @click="setModal('ue')">设置</n-button>
          <!-- <n-button @click="router.push({name: 'mangage'})">列表</n-button> -->
          
          <n-button @click="showModalMangage = true">列表</n-button>

        </div>
        <!--<p class="detail">
          <div v-for="(k, v) in defaultConfig" :key="k">
            <n-checkbox v-if="v === 'TurnPort'" v-model:checked="openTurn" style="--n-text-color: #c2f5ff;--n-color:#2f3241;--n-border: 1px solid #c2f5ff;padding-right: 3px;"></n-checkbox>
            <span style="color: #73a5b1;">{{ v }}:</span>
            <input class="config-input" type="text" v-model="defaultConfig[v]" />
          </div>
        </p> -->
      </article>
    </div>
  </div>
  <div>
    <EVRModal v-model:show="showModalEVR" :UEfile="UEfile" :defaultConfig="defaultConfig"></EVRModal>
    <!-- <UEModal v-model:show="showModalUE" :UEfile="UEfile" :defaultConfig="defaultConfig" :openTurn="openTurn.value"></UEModal> -->
    <UEModal v-model:show="showModalUE" :showModal="showModalUE"  @setShowValue="setShowValue" :UEfile="UEfile" :defaultConfig="defaultConfig" :openTurn="openTurn.value">
    <template #checkbox>
      <n-checkbox v-model:checked="openTurn" :style="checkboxStyle" style="padding-right: 2px;"></n-checkbox>
    </template>
    </UEModal>
    <!--<settingModel v-model:show="showModalEVR" >
      <template #content>
        <div class="box">
          <span style="width: 70px;">底座文件：</span>
          <div class="des">{{defaultConfig.ueDefaultDir}}</div>
          <span @click="chooseFile('ue')" class="choose">选择底座目录</span>
        </div>
        <br />
        <div class="box">
          <span style="width: 70px;">场景文件：</span>
          <div class="des">{{defaultConfig.evrDefaultDir}}</div>
          <span @click="chooseFile('scene')" class="choose">选择场景目录</span>
        </div>
      </template>
    </settingModel> -->
  </div>
</template>

<script setup>
import Versions from "@/components/Versions.vue";
import { NAlert, NCheckbox,NButton } from 'naive-ui'
import { ref, reactive } from "vue";
import useMsgDealer from "@/hooks/useMsgDealer";
import useFeebackDealer from "@/hooks/useFeebackDealer";
import { tabAdd, addPid, openEXE, getCofig,writeJson,getDirectory,notifyIPC,updateData } from '@/utils/core.js'
import { useRouter } from 'vue-router'
import EVRModal from "./components/EVRModal.vue";
import UEModal from "./components/UEModal.vue";
import mangage from "../mangage/index.vue";

import { queryClientList } from "@/api/server";
import {debounce,getRightUrlFromWeb} from "@/utils/fns.js";
import settingModel from '@/components/settingModal.vue'

// const router = useRouter()
const msg = ref("");
const keyMsg = ref([]);

const showModalEVR = ref(false)
const showModalUE = ref(false)
const showModalMangage = ref(false)
const openUE = ref(true)
const openTurn = ref(false)
// const serverPath = ".\\resources\\推流综合服务器"
const serverPath = "..\\推流综合服务器"

const serverJSONPath = serverPath + "\\config.json"
const checkboxStyle = {
    "--n-text-color": "#fff",
    "--n-color": "2f3241",
    // "--n-color": "#2f3241",
    // "--n-border": "1px solid #c2f5ff",
  }
const UEfile = ref({
  exeFile: 'MxWorld.exe',
  fullPath: '.\\resources\\Windows', // 完整的相对路径
  selectedDir: '', // 当前选择的目录
  relativePath: '' // 残缺的相对路径
})
const alertMsg = ref({
  done: false,
  title: '打开成功',
  content: '打开成功',
  reason: '',
  exe: ''
});
const ip = ref('127.0.0.1')
const defaultConfig = ref({})

const keyUrl = ref('')
const clientId = ref(0)
useFeebackDealer(keyMsg, alertMsg)

const dealWS = (data) => {
  console.log(data)
  if(data.name === 'evr') {
    // openEXE2("mxxx.exe", ".\\resources\\win-unpacked", []);
    // openEXE2("LauncherEVR.exe", defaultConfig.value.ueDefaultDir || "..\\Windows", []);
    openEXE2(UEfile.value.exeFile, UEfile.value.fullPath, ['-EVR']);
  }else if(data.name === 'ue'){
    console.log('--------------执行dealOpenServer：',data)
    clientId.value = data.clientId
    // return
    // 若已有进行中的实例，直接通知前端连接
    if(!dealOpenServer()){
      // 提醒前端可以开始推流连接
      notifyIPC('startStreaming',clientId.value,defaultConfig.value.HttpPort)
    }
  }
}
// 这里做个防抖
const useDebounce = debounce((data) => dealWS(data), 6000, true)
// const useDebounce = debounce((data) => console.log('88888888888888888'), 6000, true)

// { type: 'openExe',  name: 'ue', clientId: '' }
window.electron.ipcRenderer.on('receiveFromWeb', (event, data) => {
  console.log('-----receiveFromWeb-------',event)

  useDebounce(data)
  // dealWS(data)
});


watchEffect(async() => {
  let leng = keyMsg.value.length
  if(leng<1) {
    return 
  }
  if (keyMsg.value[leng-1].includes('Streamer connected:')) {
    console.log(keyMsg.value[leng-1])
    console.log('---------------------------------------')
    // 提醒前端可以开始推流连接
    notifyIPC('startStreaming',clientId.value,defaultConfig.value.HttpPort)
  } else if (keyMsg.value[leng-1].includes('PID:')) {
    let str = keyMsg.value[leng-1]
    let pidInfo = str.split('--')
    let pid = pidInfo[1].split(" ")[1]
    console.log('----------- PID: -------------  ', pidInfo)
    // 提醒前端可以开始推流连接
    // notifyIPC('startStreaming',clientId.value,defaultConfig.value.HttpPort)
    if (pidInfo[0].startsWith('cirrus')) {
      // 让主线程知道这个pid app关闭的时候kill掉
      addPid('cirrus', pid)
      const data  = await updateData({
        address: defaultConfig.value.PublicIp,
        port: defaultConfig.value.HttpPort,
        serverPid: pid,
      })
      console.log(data)
    }else if(pidInfo[0].startsWith('turnserver')){
      // 让主线程知道这个pid app关闭的时候kill掉
      addPid('turnserver', pid)
      const data  = await updateData({
        address: defaultConfig.value.PublicIp,
        port: defaultConfig.value.HttpPort,
        turnPid: pid
      })
      console.log(data)
    }
  }
})
const initConfig = () => {
  // getCofig('IP').then(d => ip.value = d)
  console.log('init----------------->')
  getCofig('CONFIG', serverJSONPath).then(d => {
    ip.value = d.LocalIP

    // 这里还有ueDefaultDir, evrDefaultDir的数据 可以用来回显
    defaultConfig.value = d
    // defaultConfig.value.MatchmakerAddress = "192.168.2.128"
    console.log("defaultConfig: ",defaultConfig.value)
    keyUrl.value = 'http://' + d.MatchmakerAddress + ':' + d.managerPort
    getRightUrlFromWeb.fullUrl = [d.MatchmakerAddress, d.managerPort]
    
    getCofig('SecenePath', defaultConfig.value.evrDefaultDir).then(fileData => {
      console.log(fileData,'发送成功')
    })
  })

  // 选择ue的windows文件夹 将会自动寻找到/MxWorld/Binaries/Win64里的exe文件，才能做到关闭启动器，把ue一起关闭。
  getCofig('defaultPath').then(fileData => {
    // 根据ueDefaultDir去设置UEfile
    UEfile.value = fileData
    console.log(UEfile.value)
  })


}
initConfig()
watchEffect(() => {
  if (alertMsg.value.done) {
    setTimeout(() => {
      alertMsg.value.done = false;
    }, 3000)
  }
})
const handleJump = async(data) => {
  if (data === "MXDATA") {
    console.log("MXDATA");
    tabAdd("http://115.238.181.246:18288/customPage/mxdata?menu=project", "ddd");
    // tabAdd(keyUrl.value + "/server/redirectBlankPushStreamServerURL", "ddd");

  } else if (data === "EVR") {
    console.log("EVR", defaultConfig.evrDefaultDir);
    openEXE2(UEfile.value.exeFile, UEfile.value.fullPath, ['-EVR']);
    // openEXE2("LauncherEVR.exe", defaultConfig.evrDefaultDir || "..\\Windows", []);
  } else {
    console.log('defaultConfig: ',defaultConfig.value)
    dealOpenServer()
  }
};


const chooseFile = (name) => {
  if(name==='ue'){
    // 选择ue的windows文件夹 将会自动寻找到/MxWorld/Binaries/Win64里的exe文件，才能做到关闭启动器，把ue一起关闭。
    getCofig('DIALOG').then(fileData => {
      UEfile.value = fileData
      defaultConfig.ueDefaultDir = fileData.selectedDir
      console.log(UEfile.value)
    })
  }else if(name==='scene'){
    getDirectory(name).then(fileData => {
      // 存在本地
      window.localStorage.setItem('ueScene',JSON.stringify(fileData))
      defaultConfig.evrDefaultDir = fileData.selectedDir
      getCofig('SecenePath',fileData.selectedDir).then(fileData => {
        console.log(fileData,'发送成功')
      })
    })
  }
}

const copyToClipboard = () => {
  let text = keyUrl.value + '/server/queryBlankPushStreamServer'

  console.log('keyUrl: ',text)
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('复制成功')
      alertMsg.value = {
        done: true,
        type: 'success',
        title: '复制成功',
        content: `${text} 已经粘贴到你的剪贴板，请使用 GET 方法使用该接口获取当前可用的推流地址`,
        reason: ''
      }
    })
    .catch(err => {
      console.error('复制失败', err)
      alertMsg.value = {
        done: true,
        type: 'warning',
        title: '复制失败',
        content: `请到控制台查看推流接口，并使用 GET 方法使用该接口获取当前可用的推流地址`,
        reason: ''
      }
    });
}
const getClients = async () => {
  const { data } = await queryClientList();
  if (data.code === 1001) {
    let nmberOfCirrusServers = data.value.cirrusServersArray.length
    return nmberOfCirrusServers;
  }
};
const dealOpenServer = async() => {

  defaultConfig.value['SFUPort'] = defaultConfig.value.StreamerPort - '10'
  // console.log('defaultConfig: ',defaultConfig.value)

  // 覆盖json文件
  // let finalJson = { ...defaultConfig.value, ...portConfig}
  let finalJson = defaultConfig.value
  console.log('finalJson: ',finalJson)

  let res = await writeJson(finalJson, serverJSONPath)
  console.log(res)


  console.log('openTurn,openUE : ',openTurn.value,openUE.value)

  // 若当前有推流服务器开启 return
  let nb = await getClients()
  console.log('nmberOfCirrusServers:',nb)
  if( nb > 0){
    alertMsg.value = {
      done: true,
      type: 'warning',
      title: '开启失败',
      content: `试用版仅支持一路并发，请关闭已有连接后再次启动`,
      reason: ''
    }

    return false
  }

  if (openTurn.value) {
    // test.ps1 会去打开cirrus3
    openEXE2("powershell.exe", serverPath,['-ExecutionPolicy', 'Bypass', '-File','test6.ps1'], {port:defaultConfig.value.HttpPort, address:ip.value}).then(
      ({pid}) => {
        dealOpenUE(pid)
      }
    );
  }else{
    // 直接进入这里
    openEXE2("cirrus3.3.exe", serverPath, [], {port:defaultConfig.value.HttpPort, address:ip.value}).then(
      ({pid}) => {
        dealOpenUE(pid)
      }
    )
  }


  return true
}
const dealOpenUE = (pid) => {
  let cmdArray2 = ['-AudioMixer', '-PixelStreamingIP=127.0.0.1', '-PixelStreamingPort=8888', '-LocalTest']
  cmdArray2[2] = '-PixelStreamingPort=' + defaultConfig.value.StreamerPort
  if (openUE.value) {
    // openEXE2("MxWorld.exe", ".\\resources\\Windows", cmdArray2);
    console.log('打开ue----------',UEfile.value,' cirrus已开在：',pid);
    openEXE2(UEfile.value.exeFile, UEfile.value.fullPath, cmdArray2, {port:defaultConfig.value.HttpPort, address:ip.value});
  }
}

const setModal = (type='EVR') => {
  if (type ==='EVR') {
    showModalEVR.value = true
  } else {
    showModalUE.value = true
  }
}
const setShowValue = () => {
  showModalUE.value = false
}
const openEXE2 = (cmdStr, cmdPath = "", cmdArray = [], updateConfig={}) => {

  return openEXE(cmdStr, cmdPath, cmdArray, updateConfig).then(
    (res) => {
      console.log('exe打开消息：',res); // prints out 'pong'

      alertMsg.value = {
        done: true,
        type: 'success',
        title: '打开成功',
        content: `${cmdStr}打开成功 ${JSON.stringify(res)}`,
        reason: '',
      }
      return res
    }
    
  ).catch((err) => {
    console.log('exe打开warning消息：',err); // prints out 'pong'
    alertMsg.value = {
      done: true,
      type: 'warning',
      title: '打开失败',
      content: `${cmdStr}打开失败 ${JSON.stringify(err)}`,
      reason: '',
    }
  })
}
</script>

<style lang="less">
@import "@/assets/css/styles.less";
.detail{
  margin-top: 15px;
}
.n-alert {
  position: absolute;
  width: 92%;
  z-index: 9999999999;
}

.config-input {
  margin-left: 5px;
  // width: auto;
  max-width: 48px;
  padding: 0 4px;
  box-sizing: border-box;
  outline: none;
  border-radius: 10%;
  border: none;
  height: 80%;
  background-color: #2f3241;
  color: #c2f5ff;
}

.checkbox {
  float: right;
  position: absolute;
  top: 88px;
  right: 7px;
}
.choose {
  text-decoration: underline;
  cursor: pointer;
}
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
