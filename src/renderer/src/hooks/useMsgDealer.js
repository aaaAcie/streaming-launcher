import {watchEffect} from 'vue'

export default (msg,cmdStr) => {
  let keyMsg = ref('')
  watchEffect(async cleanup => {
    const key = ["Cirrus connected to Matchmaker","serverPublicIp", "WebSocket listening for Streamer connections","Streamer connected:","PID:"]
    if (!msg) {
      console.log('000000000000000000000');
      return
    }
    // console.log(cmdStr,': ',msg)
    for (let index = 0; index < key.length; index++) {
      let k = key[index];
      if (msg.includes(k)) {
        // console.log(msg)
        keyMsg.value = msg.replaceAll('\\x1B[1m\\x1B[32m','')
        break
      }
    }
  })

  return keyMsg.value
}