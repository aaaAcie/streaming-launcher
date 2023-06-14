import {watchEffect} from 'vue'

export default (msg) => {
  let keyMsg = ref('')
  watchEffect(async cleanup => {
    const key = ["Cirrus connected to Matchmaker","serverPublicIp", "WebSocket listening for Streamer connections"]
    const rawMsg = msg.value
    if (!rawMsg) {
      console.log('000000000000000000000');
      return
    }
    for (let index = 0; index < key.length; index++) {
      let k = key[index];
      if (rawMsg.includes(k)) {
        // console.log(msg)
        keyMsg.value = rawMsg.replaceAll('\\x1B[1m\\x1B[32m','')
        break
      }
    }
  })

  return keyMsg.value
}