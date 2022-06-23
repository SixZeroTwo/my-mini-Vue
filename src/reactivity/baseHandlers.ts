import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const readonlySet = createSetter(true)
export const mutableHandlers = {
  get,
  set
}
export const readonlyHandlers = {
  get: readonlyGet,
  set: readonlySet
}
export function createGetter(isReadonly: boolean = false) {
  return function get(target, key) {
    if (key == ReactiveFlags.IS_REACTIVE) return !isReadonly
    else if (key == ReactiveFlags.IS_READONLY) return isReadonly
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      //收集依赖
      //track函数传入target和key，通过targetsMap找到target对应的依赖depsMap，再根据key设置对应的deps的fn
      track(target, key);
    }
    return res;
  };
}
export function createSetter(isReadonly: boolean = false) {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    if (!isReadonly) {
      //触发依赖
      //同样是通过targetsMap和depsMap，依次触发deps中的回调函数
      trigger(target, key, value);
    }
    else {
      //抛出警告
      console.warn(`${target}为readonly对象，不能对${key.toString()}做修改`);
    }
    return res;
  };
}
