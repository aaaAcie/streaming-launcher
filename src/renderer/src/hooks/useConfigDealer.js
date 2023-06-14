import {reactive, watchEffect} from 'vue'
// 推流服务器 ue的config设置
// publicip获取
export default (defaultConfig) => {
  let keyMsg = ref('')
  const portConfig = reactive({})
  watchEffect(async cleanup => {
    
  })

  return portConfig
}