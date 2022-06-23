import { mutableHandlers, reaonlyHandlers } from "./baseHandlers"

export function reactive(obj) {
  return createActiveObject(obj, mutableHandlers)
}

export function readonly(obj) {
  return createActiveObject(obj, reaonlyHandlers)
}

function createActiveObject(obj: any, handlers) {
  return new Proxy(obj, handlers)
}
/* export const enum ReactiveFlags {
  IS_REACTIVE = '_v_isReactive',
  IS_READONLY = '_v_isReadonly',
}
export function isReactive(target) {
  return target[ReactiveFlags.IS_REACTIVE]
} */

