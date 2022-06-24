import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { extend } from "./shared/extend";
import { isObject } from "./shared/isObject";

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const readonlySet = createSetter(true)
const shallowReactiveGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)
export const mutableHandlers = {
  get,
  set
}
export const readonlyHandlers = {
  get: readonlyGet,
  set: readonlySet
}
export const shallowReactiveHandlers = extend({}, mutableHandlers, { get: shallowReactiveGet })
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, { get: shallowReadonlyGet })

function createGetter(isReadonly: boolean = false, isShallow: boolean = false) {
  return function get(target, key) {
    if (key == ReactiveFlags.IS_REACTIVE) return !isReadonly
    else if (key == ReactiveFlags.IS_READONLY) return isReadonly
    else if (key == ReactiveFlags.IS_PROXY) return true
    const res = Reflect.get(target, key);
    if (!isShallow && isObject(res)) return isReadonly ? readonly(res) : reactive(res)
    if (!isReadonly) {
      //收集依赖
      //track函数传入target和key，通过targetsMap找到target对应的依赖depsMap，再根据key设置对应的deps的fn
      track(target, key);
    }
    return res;
  };
}
function createSetter(isReadonly: boolean = false) {
  return function set(target, key, value) {
    if (!isReadonly) {
      const res = Reflect.set(target, key, value);
      //触发依赖
      //同样是通过targetsMap和depsMap，依次触发deps中的回调函数
      trigger(target, key, value);
      return res
    }
    else {
      //抛出警告
      console.warn(`${target}为readonly对象，不能对${key.toString()}做修改`);
      return true
    }
  };
}
