// 发布者，观察者收集
class Dep {
  constructor () {
    this.subs = []
  }
  addSub (watcher) {
    this.subs.push(watcher)
  }
  notify () {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}
// 观察者
class Watcher {
  constructor (obj, key, cb) {
    this.obj = obj
    this.key = key
    this.cb = cb
    // Dep.target 指向当前的 watcher 实例
    Dep.target = this
    // obj[key] 触发 get 操作时 dep.addSub(Dep.target)
    this.oldValue = obj[key]
    // 在最后对 target 进行回收操作以避免多次添加
    Dep.target = null
  }
  update () {
    let newValue = this.obj[this.key]
    let oldValue = this.oldValue
    if (this.oldValue === newValue) {
      return
    }
    this.cb(newValue, oldValue)
  }
}
// 数据劫持转换
class Observer {
  constructor (data) {
    this.walk(data)
  }
  walk (data) {
    // 1. 判断data是否为对象
    if (!data || typeof data !== 'object') return
    // 2. 遍历data中的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive (data, key, value) {
    let self = this
    // 创建时生成一个收集观察者的实例
    let dep = new Dep()
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get () {
        // 判断我们的 Dep 实例中是否有 target 属性，并将 target 加入到我们的发布者存储中
        // 后续在 Watcher 中为 Dep 添加 target 属性
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set (newVal) {
        if (newVal === value) {
          return
        }
        value = newVal
        // 当我们去设置新的值的时候 发送通知
        dep.notify()
      }
    })
  }
}
// 解析指令
class Compiler {
  constructor (el, vm) {
    this.el = el
    this.vm = vm
    this.compile(this.el)
  }
  compile (el) {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 1) {
        // 元素节点
        this.compileElement(node)
      } else if (node.nodeType === 3) {
        // 文本节点
        this.compileText(node)
      }
      node.childNodes?.length && this.compile(node)
    })
  }
  compileElement (node) {
    Array.from(node.attributes).forEach(attr => {
      if (attr.name === 'v-model') {
        const key = attr.value
        this.modelUpdate(node, this.vm[key], key)
      }
    })
  }
  // 处理v-model指令
  modelUpdate (node, val, key) {
    node.value = val
    // 创建 watcher 对象 属性改变时候更新视图
    new Watcher(this.vm, key, newVal => {
      node.value = newVal
    })
    // 监听input事件 值改变时更新对象
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  // 处理插值表达式
  compileText (node) {
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])
      // 创建 watcher 对象 属性改变时候更新视图
      new Watcher(this.vm, key, newVal => {
        node.textContent = newVal
      })
    }
  }
}
// vue
class Vue {
  constructor (options) {
    const {
      el,
      ...data
    } = options
    this.el = typeof el === "string"
      ? document.querySelector(el)
      : el
    this.data = data
    // 监听数据的变化
    new Observer(this.data)
    // 解析指令和插值表达式
    new Compiler(this.el, this.data)
  }
}
