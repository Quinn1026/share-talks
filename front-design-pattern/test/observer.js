/**
 * 观察者模式：当一个对象的状态发生改变时，所有关联的对象会得到通知并自动更新
 * 观察者模式只有两个角色：观察者 和 被观察者
 * 1. 观察者 Observer 和 目标对象 Subject 耦合度比较高
 * 2. 观察者要实现 update 方法，在目标对象通知更新时调用
 * 3. 目标对象需要维护观察者列表，自身状态改变时，通过 notify 方法遍历观察者列表 通知所有观察者执行 update
 */
// 观察者收集
class Subject {
  constructor () {
    this.observers = []
  }
  addObserver (ob) {
    this.observers.push(ob)
  }
  notify (val) {
    this.observers.forEach(observer => {
      observer.update(val)
    })
  }
}
// 观察者
class Observe {
  constructor (cb) {
    let callback = typeof cb === 'function' ? cb : () => {}
    this.callback = callback
  }
  update (data) {
    // 目标对象通知时执行
    this.callback(data)
  }
}
const subject = new Subject()
const observerCallback = (data) => {
  console.log(`新值：${data}`)
}
let obj = {
  name: 'Tifa',
  age: 18
}
let value = obj.name
Object.defineProperty(obj, "name", {
  get () {
    let watcher = new Observe(observerCallback)
    subject.addObserver(watcher)
    return value
  },
  set (value) {
    subject.notify(value)
  },
})
console.log(`旧值：${obj.name}`)
obj.name = 'Aerith'