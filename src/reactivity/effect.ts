import { extend } from "./shared/extend"

class ReactiveEffect {
  private fn: Function
  public scheduler?
  public onStop?: Function
  public deps: Set<any> = new Set
  active: boolean = true
  constructor(fn) {
    this.fn = fn
  }
  run() {
    activeEffect = this
    this.active = true
    return this.fn()
  }
  stop() {
    if (this.active) {
      cleanEffect(this)
      //执行onStop回调
      this.onStop && this.onStop()
      this.active = false
    }
  }
}
function cleanEffect(effect) {

  //找到deps并一一删除
  effect.deps.forEach(dep => dep.delete(effect))

  //清空活动对象
  activeEffect = null
}
export function effect(fn: Function, options?: any) {
  //构造一个ReactiveEffect实例
  let _effect = new ReactiveEffect(fn)
  //将options的属性赋予_effect
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner._effect = _effect
  return runner
}
let activeEffect: ReactiveEffect | null
const targetsMap = new Map

export function track(target, key) {
  //读取targetsMap中target对应的depsMap
  if (!targetsMap.has(target)) targetsMap.set(target, new Map())
  let depsMap = targetsMap.get(target)
  if (!depsMap.has(key)) depsMap.set(key, new Set)
  let dep = depsMap.get(key)
  //当前如果没有活动对象
  if (!activeEffect) return
  //将现在的effect对象放入deps
  dep.add(activeEffect)
  //反向记录，每个Effect对象都会记录自己所在的deps
  activeEffect.deps.add(dep)
}

export function trigger(target, key, value) {
  //读取targetsMap中target对应的depsMap
  if (!targetsMap.has(target)) targetsMap.set(target, new Map())
  let depsMap = targetsMap.get(target)
  if (!depsMap.has(key)) depsMap.set(key, new Set)
  let dep = depsMap.get(key)
  //通知依赖
  for (let effect of dep) {
    if (effect.scheduler) effect.scheduler()
    else effect.run()
  }
}

export function stop(runner) {
  runner._effect.stop()
}