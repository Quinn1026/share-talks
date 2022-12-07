class Subject { // 发布者
  constructor () {
    this.observers = []
  }
  addObserver (ob) { // 收集观察者
    this.observers.push(ob)
  }
  notify () { // 通知观察者update
    this.observers.forEach(observer => {
      observer.update()
    })
  }
}
class Observe { // 观察者
  constructor (cb = Function.prototype) {
    this.callback = cb
  }
  update () { // 更新函数
    this.callback()
  }
}
const ob = new Observe(() => console.log('更新了！'))
const sub = new Subject()
sub.addObserver(ob)
sub.notify()