class ReactiveEffect {
  private fn: Function
  constructor(fn) {
    this.fn = fn
  }
  run() {
    activeEffect = this
    this.fn()
    return this.fn
  }
}

export function effect(fn: Function) {
  //构造一个ReactiveEffect实例
  let _effect = new ReactiveEffect(fn)
  return _effect.run().bind(_effect)
}
let activeEffect: ReactiveEffect
const targetsMap = new Map
export function track(target, key) {
  //读取targetsMap中target对应的depsMap
  if (!targetsMap.has(target)) targetsMap.set(target, new Map())
  let depsMap = targetsMap.get(target)
  if (!depsMap.has(key)) depsMap.set(key, new Set)
  let deps = depsMap.get(key)
  //将现在的effect对象放入deps
  deps.add(activeEffect)
}

export function trigger(target, key, value) {
  //读取targetsMap中target对应的depsMap
  if (!targetsMap.has(target)) targetsMap.set(target, new Map())
  let depsMap = targetsMap.get(target)
  if (!depsMap.has(key)) depsMap.set(key, new Set)
  let deps = depsMap.get(key)
  //通知依赖
  for (let dep of deps) {
    dep.run()
  }
}