---
class: 'text-center'
highlighter: shiki
background: '/bg.jpg'
lineNumbers: true
---

# 发布订阅与观察者模式

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    开 始 <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="text-xl icon-btn opacity-50 !border-none !hover:text-white">
    <carbon:edit />
  </button>
</div>

---
layout: center
---

<div class="grid grid-cols-[2fr,3fr] gap-4">
<div class="border-l border-gray-400 border-opacity-25 !all:leading-12 !all:list-none my-auto">

- 发布订阅模式
- 观察者模式
- Vue响应式原理

</div>
</div>

---

# 发布订阅模式

订阅者把自己想要订阅的事件注册到调度中心，当发布者发布事件到调度中心时，再由调度中心统一处理

#### 发布订阅有三个角色：发布者、订阅者 和 调度中心

- 发布订阅是松耦合的
- 发布者通过调度中心发布消息 不关心谁订阅消息
- 订阅者通过调度中心订阅消息 只关心想要的消息

<div grid="~ cols-2 gap-4">
  <div>
    <v-click>
      <img src="/publish.png" />
    </v-click>
  </div>
</div>

---

# 简易的发布订阅模型

<img src="/publish-subscribe.png" />

---

# 实现一个简易的发布订阅

```js {1-18|19-21|all}
class EventEmitter { // 调度中心
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
```

---

# 观察者模式

当目标对象的状态发生改变时，所有关联的观察者会得到通知并自动更新

#### 观察者有两个角色：观察者和目标对象

- 观察者和目标对象耦合度比较高
- 观察者要实现 update 方法，在目标对象通知更新时调用
- 目标对象要维护观察者列表，自身状态改变时，通过 notify 遍历观察者列表并通知所有观察者执行 update

<div grid="~ cols-2 gap-4">
  <div>
    <v-click>
      <img src="/subject-observer.png" />
    </v-click>
  </div>
</div>

---

<img src="/observe.png" />

---

# 实现一个简易的观察者

```js {1-19|20-23|all}
class Subject { // 发布者
  constructor () {
    this.observers = []
  }
  addObserver (ob) { // 收集观察者
    this.observers.push(ob)
  }
  notify () { // 通知观察者update
    this.observers.forEach(observer => observer.update())
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
```

---
layout: two-cols
---

<template v-slot:default>

# Vue的响应式原理浅析

  - 数据的劫持
    1. 数据变化会反馈给 Dep 实例
    2. Dep (目标发布者)会给我们的 Watcher (观察者)发送通知
    3. Watcher 在接到通知后调用相关的函数去更新视图
  - 指令的解析
    1. 解析插值表达式和v-xx指令
    2. 将插值表达式和指令替换掉并更新视图
    3. 监听数据变化并绑定更新函数

</template>

<template v-slot:right>

  <img src="/vue.png" />

</template>

---

# 实现一个简易的响应式系统

- 发布者 Dep
- 观察者 Watcher
- 数据劫持转换 Observer
- 指令解析 Compiler

```js
// 发布者
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
```

---

```js
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
```

---

```js
// 数据劫持转换
class Observer {
  constructor (data) {
    this.walk(data)
  }
  walk (data) {
    if (!data || typeof data !== 'object') return
    Object.keys(data).forEach(key => { // 遍历data中的所有属性
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive (data, key, value) {
    let dep = new Dep() // 创建时生成一个收集观察者的实例
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get () { // 后续在 Watcher 中为 Dep 添加 target 属性
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set (newVal) {
        if (newVal === value) return
        value = newVal // 设置新值的时候 发送通知
        dep.notify()
      }
    })
  }
}
```

---

```js
// 解析指令
class Compiler {
  constructor (el, vm) {
    this.el = el
    this.vm = vm
    this.compile(this.el)
  }
  compile (el) {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 1) { // 元素节点
        this.compileElement(node)
      } else if (node.nodeType === 3) { // 文本节点
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
  
```

---

```js
  // 处理v-model指令
  modelUpdate (node, val, key) {
    node.value = val
    // 属性改变时候更新视图
    new Watcher(this.vm, key, newVal => {
      node.value = newVal
    })
    // 监听事件 值改变时更新对象
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
      new Watcher(this.vm, key, newVal => {
        node.textContent = newVal
      })
    }
  }
}
```

---

```js
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
```

**总结：**
1. 创建Vue类，调用Observer监听所有属性的变化，调用Compiler解析指令/表达式
2. 创建Observer类，将Vue中的属性设置setter和getter，并绑定更新函数，数据变化发送通知
3. 创建Compiler类，编译模板，解析指令和插值表达式，负责页面的首次渲染，数据变化重新渲染视图
4. 这其中通过观察者模式Watcher和Dep发送通知，更新函数