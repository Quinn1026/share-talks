/**
 * 发布订阅模式：订阅者把自己想要订阅的事件注册到调度中心，当发布者发布事件到调度中心（就是该事件被触发），再由调度中心统一调度订阅者注册到调度中心的处理代码。
 * 发布订阅有：发布者、订阅者 和 调度中心
 * 1. 发布订阅是松耦合
 * 2. 发布者通过事件中心的publish发布消息
 * 3. 订阅者通过事件中心的subscribe订阅消息
 */
class EventEmitter {
  constructor () {
    // 事件中心
    // 格式：task: []
    // task中存放订阅者回调函数
    this.events = {}
  }
  subscribe (type, cb) {
    // 订阅方法
    if (!Array.isArray(this.events[type])) {
      this.events[type] = []
    }
    this.events[type].push(cb)
    return this
  }
  publish (type, ...args) {
    // 发布方法
    if (Array.isArray(this.events[type])) {
      this.events[type].forEach(cb => cb(...args))
    }
    return this
  }
  unsubscribe (type, cb) {
    // 取消订阅
    if (Array.isArray(this.events[type])) {
      const i = this.events[type].findIndex(fn => fn === cb)
      i > -1
        ? this.events[type].splice(i, 1)
        : this.events[type] = null
    }
    return this
  }
}

const events = new EventEmitter()
events.subscribe('fire', (msg) => {
  console.log(`订阅者-1：${msg}`)
})
events.subscribe('fire', (msg) => {
  console.log(`订阅者-2：${msg}`)
})
events.publish('fire', '第一次发送！')
setTimeout(() => {
  events.publish('fire', '一秒后再次发送！')
}, 1000)

