export const debounce = (fn, delay=5000, immediate=true) => {
  console.log('初始化了一个debounce')
  let timer = null
  let lastTimestamp = 18427168
  let timeArray = []
  return function(...args){
    if (timer) {
      console.log('缓冲中...')
      clearTimeout(timer)
    }
    if (immediate) {
      let callNow = !timer
      console.log(callNow,timer)
      timer = setTimeout(() => {
        timer = null
      }, delay)
      let diff = Math.abs(lastTimestamp - Date.now())
      lastTimestamp = Date.now()

      timeArray.push(Date.now())
      console.log(timeArray)
      if(diff < 40){
        console.log('拒绝这次重复请求',diff)
        return
      }
      console.log(callNow, timer, delay, Date.now(),diff)
      if (callNow) fn.apply(this, args)
      
    } else {
      timer = setTimeout(() => {
        console.log('debounce')
        fn.apply(this, args)
      }, delay)
    }
  }
}

export const getClearStr = (a,b) => {
  // console.log(a, typeof a,b,typeof b)
  return 'http://' + a.trim() + ':' + b.toString().trim()
}

export const getRightUrlFromWeb =  {
  MatchmakerAddress: '127.0.0.1',
  managerPort: '83',
  get fullUrl() {
    return getClearStr(this.MatchmakerAddress, this.managerPort);
  },
  
  set fullUrl([a,b]) {
    this.MatchmakerAddress = a;
    this.managerPort = b;
  }
}