<!--
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-05-30 15:31:30
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-19 12:13:50
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\views\home\index.vue
 * @Description: 
 * 
-->
<script setup>
import Versions from "@/components/Versions.vue";
import { NAlert, NCheckbox } from 'naive-ui'
import { ref, reactive } from "vue";
import useMsgDealer from "@/hooks/useMsgDealer";
import useFeebackDealer from "@/hooks/useFeebackDealer";
import { tabAdd, openEXE, getCofig,writeJson,getDirectory,notifyIPC } from '@/utils/core.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const msg = ref("");
const keyMsg = ref([]);
const openUE = ref(true)
const openTurn = ref(false)
// const serverPath = ".\\resources\\推流综合服务器"
const serverPath = "..\\推流综合服务器"

const serverJSONPath = serverPath + "\\config.json"

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
const portConfig = reactive({
  HttpPort: '',
  StreamerPort: '',
  TurnPort: ''
})
const keyUrl = ref('')
// const portConfig = useConfigDealer()
let first = 0
const clientId = ref(0)
useFeebackDealer(keyMsg, alertMsg)

// { type: 'openExe',  name: 'ue', clientId: '' }
window.electron.ipcRenderer.on('receiveFromWeb', (event, data) => {
  if(data.name === 'evr') {
    // openEXE("mxxx.exe", ".\\resources\\win-unpacked", []);
    openEXE("LauncherEVR.exe", defaultConfig.evrDefaultDir || "..\\Windows", []);
  }else if(data.name === 'ue'){
    clientId.value = data.clientId
    dealOpenServer()
  }
});
watchEffect(() => {
  let leng = keyMsg.value.length
  if (leng>1 && keyMsg.value[leng-1].includes('Streamer connected:')) {
    console.log(keyMsg.value[leng-1])
    console.log('---------------------------------------')
    // 提醒前端可以开始推流连接
    notifyIPC('startStreaming',clientId.value,portConfig.HttpPort)
  }
})
const initConfig = () => {
  getCofig('IP').then(d => ip.value = d)
  getCofig('CONFIG', serverJSONPath).then(d => {
  // getCofig('CONFIG', '..\\推流综合服务器\\config.json').then(d => {
    // 这里还有ueDefaultDir, evrDefaultDir的数据 可以用来回显
    defaultConfig.value = d
    portConfig.HttpPort = d.HttpPort
    portConfig.StreamerPort = d.StreamerPort
    portConfig.TurnPort = d.TurnPort
  
    keyUrl.value = 'http://' + d.MatchmakerAddress + ':' + d.managerPort
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
    // 开发
    // openEXE("mxxx.exe", ".\\resources\\win-unpacked", []);
    // 生产
    // openEXE('StartMxdata.bat', '..\\Windows')
    // openEXE("LauncherMxData.exe", "..\\Windows", []);
    openEXE("LauncherEVR.exe", defaultConfig.evrDefaultDir || "..\\Windows", []);
    // openEXE("LauncherEVR.exe", "..\\Windows",cmdArray);
  } else {
    console.log('shoudaoxiaoxi')
    dealOpenServer()
  }
};


const chooseFile = (name) => {
  if(name==='ue'){
    // 选择ue的windows文件夹 将会自动寻找到/MxWorld/Binaries/Win64里的exe文件，才能做到关闭启动器，把ue一起关闭。
    getCofig('DIALOG').then(fileData => {
      UEfile.value = fileData
      console.log(UEfile.value)
    })
  }else if(name==='scene'){
    getDirectory(name).then(fileData => {
      // 存在本地
      window.localStorage.setItem('ueScene',JSON.stringify(fileData))
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
        type: 'fail',
        title: '复制失败',
        content: `请到控制台查看推流接口，并使用 GET 方法使用该接口获取当前可用的推流地址`,
        reason: ''
      }
    });
}
const dealOpenServer = async() => {
  defaultConfig.value['SFUPort'] = portConfig.StreamerPort - '10'
  defaultConfig.value['PublicIp'] = ip.value
  // 覆盖json文件
  let finalJson = { ...defaultConfig.value, ...portConfig}
  console.log(finalJson)
  let res = await writeJson(finalJson, serverJSONPath)
  console.log(res)

  let cmdArray2 = ['-AudioMixer', '-PixelStreamingIP=127.0.0.1', '-PixelStreamingPort=8888', '-LocalTest']
  cmdArray2[2] = '-PixelStreamingPort=' + portConfig.StreamerPort

  if (openTurn.value) {
    // test.ps1 会去打开cirrus3
    openEXE("powershell.exe", serverPath,['-ExecutionPolicy', 'Bypass', '-File','test.ps1'], {port:portConfig.HttpPort, address:ip.value});
  }else{
    // 直接进入这里
    openEXE("cirrus3.3.exe", serverPath, [], {port:portConfig.HttpPort, address:ip.value});
  }

  if (openUE.value) {
    // openEXE("MxWorld.exe", ".\\resources\\Windows", cmdArray2);
    console.log('打开ue----------',UEfile.value);
    openEXE(UEfile.value.exeFile, UEfile.value.fullPath, cmdArray2, {port:portConfig.HttpPort, address:ip.value});
  }
}
</script>

<template>
  <Versions></Versions>
  <n-alert v-if="alertMsg.done" :title="alertMsg.title" :type="alertMsg.type" closable>
    {{ alertMsg.content }}
  </n-alert>
  <svg class="hero-logo" viewBox="0 0 900 300">
    <use xlink:href="@/assets/icons.svg#electron" />
  </svg>
  <h2 class="hero-text">美象数字孪生平台</h2>
  <p class="hero-tagline">
    当前IP为
    <code>{{ ip }}</code>
    <span @click="router.push('/mangage')" style="cursor: pointer;padding-left: 20px; text-decoration: underline;">管理后台</span>
    <a @click="copyToClipboard()" style="cursor: pointer;margin-left: 20px;">点击复制推流接口</a>

  </p>


  <div class="features">
    <div class="feature-item">
      <article>
        <h2 class="title" @click="handleJump('MXDATA')">MXDATA</h2>
      </article>
    </div>
    <div class="feature-item">
      <article>
        <h2 class="title" @click="handleJump('EVR')">EVR</h2>
        <p class="detail">
          <span @click="chooseFile('ue')" class="choose">选择底座目录</span>
          <br/>
          <span @click="chooseFile('scene')" class="choose">选择场景目录</span>
        </p>
      </article>
    </div>
    <div class="feature-item">
      <article style="position: relative;">
        <h2 class="title" @click="handleJump('推流服务器')">推流服务器</h2>
        <div class="checkbox">
          <n-checkbox v-model:checked="openUE" class="info" style="--n-text-color: #c2f5ff;--n-color:#2f3241;--n-border: 1px solid #c2f5ff">并开启底座</n-checkbox>
          <span @click="chooseFile('ue')" class="choose">选择目录</span>
        </div>

        <!-- <p class="detail" v-show="alertMsg['exe'].startsWith('cirrus')">
          <div v-for="(m, index) in keyMsg.slice(-2)" :key="index">{{ m }}</div>
        </p> -->
        <p class="detail">
          <div v-for="(k, v) in portConfig" :key="k">
            <!-- <n-checkbox v-if="v === 'TurnPort'" v-model:checked="openTurn" style="--n-text-color: #c2f5ff;--n-color:#2f3241;--n-border: 1px solid #c2f5ff;padding-right: 3px;"></n-checkbox> -->
            <span style="color: #73a5b1;">{{ v }}:</span>
            <input type="text" v-model="portConfig[v]" />
          </div>
        </p>
      </article>
    </div>
  </div>
</template>

<style lang="less">
@import "@/assets/css/styles.less";
.detail{
  margin-top: 15px;
}
.n-alert {
  position: absolute;
  width: 92%;
}

input {
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

</style>
