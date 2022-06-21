import { track, trigger } from "./effect"
export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const res = Reflect.get(target, key)
      //收集依赖
      //track函数传入target和key，通过targetsMap找到target对应的依赖depsMap，再根据key设置对应的deps的fn
      track(target, key)
      return res
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      //触发依赖
      //同样是通过targetsMap和depsMap，依次触发deps中的回调函数
      trigger(target, key, value)
      return res
    }
  })
}