<template>
  <div class="topbox">
    <n-alert v-if="alertMsg.done" :title="alertMsg.title" :type="alertMsg.type" closable>
      {{ alertMsg.content }}
    </n-alert>
    <div @click="router.push('/')" class="back">返回 /</div>
  </div>
  <div style="width: 100%;position: relative;top:50px;">
    <div class="cards-box">
      <n-card
        closable
        v-for="(client, index) in clients"
        :key="index"
        :title="`${client.address}:${client.port}`"
        style="--n-title-text-color: #f4; --n-padding-left: 10px;margin-bottom: 20px;"
        @close="handleClose(client)"
      >
        <template #cover>
          <img src="@/assets/img/bg.png" />
        </template>
        <div>
          <span :style="{backgroundColor: client.streamConnected ? '#18a058' : '#c2f5ff'}" class="ball"></span>
          连接数：{{ client.numConnectedClients }}个
          <span @click="(showModal = true), (curtClient = client)" class="link-detail">
            查看连接详情
          </span>
        </div>
      </n-card>
    </div>
    <n-modal
      v-model:show="showModal"
      class="custom-card"
      preset="card"
      :style="bodyStyle"
      title="连接详情"
      size="huge"
      :bordered="false"
    >
      <div class="playerbox" style="background-color: #5e5e63">
        <span>用户ID</span>
        <span style="flex: 1">来源</span>
        <span>操作</span>
      </div>
      <div
        v-for="(player, index) in curtClient.playerList"
        :key="index"
        class="playerbox"
      >
        <span>{{ player.playerId }}</span>
        <span style="flex: 1">{{ player.playerSocket }}</span>
        <span class="kick" @click="kick(player.playerId)">踢出</span>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { NCard, NModal, NAlert, NDataTable } from "naive-ui";
import { useRouter } from "vue-router";
import { queryClientList, killClientPlayer } from "@/api/server";
import { ref, reactive } from "vue";
import { killProcess } from '@/utils/core.js'
const alertMsg = ref({
  done: false,
  title: '打开成功',
  content: '打开成功',
  reason: '',
  exe: ''
});
const bodyStyle = {
  "--n-font-color": "#f4f4f4",
  "--n-color-modal": "#2c2c32",
  "--n-title-text-color": "#e0e0e1",
  "--n-text-color": "red",
};
const router = useRouter();
const clients = ref([]);
const curtClient = ref({});
const showModal = ref(false);
const getClients = async (isRefresh = 0) => {
  const { data } = await queryClientList();
  if (data.code === 1001) {
    clients.value = data.value.cirrusServersArray;
    console.log(clients.value);
    if (isRefresh == 1) {
      refresh()
    }
  }
};
getClients();
const refresh = () => {
  if(Object.keys(curtClient.value).length == 0 ){
    return
  }
  let xx = clients.value.filter(
    (i) => i.address === curtClient.value.address && i.port === curtClient.value.port
  )[0];
  curtClient.value = xx;
}
const kick = async (playerid) => {
  console.log(playerid);
  const { data } = await killClientPlayer({
    address: curtClient.value.address,
    port: curtClient.value.port,
    playerId: playerid,
  });
  console.log(data);
  getClients(1);
  // refreshData()
};

const handleClose = async(client) => {
  let serverRes, clientRes
  let exeType = '推流服务器'
  // 关闭该client下的所有pid
  console.log(client);
  if (client.clientPid){
    clientRes = await killProcess(client.clientPid)
    exeType = '底座'
    dealAlert(exeType, clientRes)
  }
  serverRes = await killProcess(client.serverPid)
  dealAlert(exeType, serverRes)
  return
};
const dealAlert = (exeType, res) => {
  console.log('alert收到====',res);
  if (res===1) {
    alertMsg.value = {
      done: true,
      type: 'success',
      title: `${exeType}关闭成功`,
      content: '该进程已被杀死',
      reason: '',
    }
    getClients()
  }else{
    alertMsg.value = {
      done: true,
      type: 'success',
      title: `${exeType}关闭失败`,
      content: '该进程未被杀死 请手动关闭',
      reason: '',
    }
  }
}

const timer = ref(null);

timer.value = setInterval(() => {
  getClients(1)
}, 1000);

watchEffect(() => {
  if (alertMsg.value.done) {
    setTimeout(() => {
      alertMsg.value.done = false;
    }, 2000)
  }
})
onUnmounted(() => {
  clearInterval(timer.value);
  timer.value = null

})
</script>

<style lang="less" scoped>
.topbox{
  position: fixed;
  left: 30px;
  z-index: 9999;
  background-color: #2f3241;
  width: 100%;
}
.back {
  cursor: pointer;
  // position: fixed;
  // left: 30px;
  width: 40px;
  border: 1px #86a5a4 solid;
  padding: 5px 10px;
  z-index: 9999;
  background-color: #2f3241;
}
.n-alert {
  position: absolute;
  width: 92%;
  min-width: 600px;
  z-index: 999999;
}
.cards-box {
  // padding-top: 50px;
  display: flex;
  // width: 100%;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-content: space-around;
  align-items: center;
  ::-webkit-scrollbar{
    width: 4px;
    height: 16px;
  }
  ::-webkit-scrollbar-thumb
  {
    background-color: rgba(46, 151, 255, 1);
    height: 4px;
  }
}
.ball{
  display: inline-block;
  width: 15px;
  height: 15px;
  position: relative;
  top: 3px;
  // background-color: red;
  border-radius: 50%; /* 将矩形边框半径设置为50%，从而变成圆形 */
  // border: 1px #c2f5ff solid;
}
.n-card {
  background: #1f2027;
  color: #f4f4f4;
  border: none;
  width: 282px;
  margin-right: 40px;

  img {
    width: 282px;
    height: 160px;
  }
}

.n-button__content {
  color: #f4f4f4;
}

.playerbox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 1px #1f2027 solid;

  span {
    // margin-left: 20px;
    text-align: center;
    box-sizing: border-box;
    height: 35px;
    line-height: 35px;
    color: #e0e0e1;
    min-width: 80px;
  }

  .kick {
    border: 1px #86a5a4 solid;
    padding: 0px 4px;
    margin: 6px 0;
    height: 25px;
    line-height: 25px;
    cursor: pointer;
  }
}

.link-detail {
  color: #7993a1;
  float: right;
  cursor: pointer;
}
</style>
