class EventEmitter { // 事件中心
  constructor () {
    this.events = {}
  }
  subscribe (type, cb) { // 订阅函数
    if (!Array.isArray(this.events[type])) {
      this.events[type] = []
    }
    this.events[type].push(cb)
    return this
  }
  publish (type, ...args) { // 发布函数
    if (Array.isArray(this.events[type])) {
      this.events[type].forEach(cb => cb(...args))
    }
    return this
  }
}
new EventEmitter()
  .subscribe('fire', (msg) => console.log(`订阅的消息：${msg}`))
  .publish('fire', '给大佬端茶！')