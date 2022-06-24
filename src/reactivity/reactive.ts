import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHandlers } from "./baseHandlers"

export function reactive(obj) {
  return createActiveObject(obj, mutableHandlers)
}

export function readonly(obj) {
  return createActiveObject(obj, readonlyHandlers)
}

function createActiveObject(obj: any, handlers) {
  return new Proxy(obj, handlers)
}
export const enum ReactiveFlags {
  IS_REACTIVE = '_v_isReactive',
  IS_READONLY = '_v_isReadonly',
  IS_PROXY = '_v_isProxy'
}
export function isReactive(target) {
  return Boolean(target[ReactiveFlags.IS_REACTIVE])
}

export function isReadonly(target) {
  return Boolean(target[ReactiveFlags.IS_READONLY])
}

export function isProxy(target) {
  return Boolean(target[ReactiveFlags.IS_PROXY])
}
export function shallowReactive(obj) {
  return createActiveObject(obj, shallowReactiveHandlers)
}

export function shallowReadonly(obj) {
  return createActiveObject(obj, shallowReadonlyHandlers)
}