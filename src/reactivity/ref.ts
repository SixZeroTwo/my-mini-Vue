import { trackEffect, triggerEffect } from "./effect"
import { reactive } from "./reactive"
import { hasChanged } from "./shared/hasChanged"
import { isObject } from "./shared/isObject"

class RefImpl {
  private _value
  private dep: Set<any>
  private rawValue
  readonly _v_isRef = true
  constructor(value) {
    createRefValue(this, value)
    this.rawValue = value
    this.dep = new Set
  }
  get value() {
    //收集依赖
    trackEffect(this.dep)
    return this._value
  }
  set value(newValue) {
    //判断是新值还是旧值
    if (hasChanged(newValue, this.rawValue)) return
    createRefValue(this, newValue)
    this.rawValue = newValue
    //触发依赖
    triggerEffect(this.dep)
  }
}
function createRefValue(ref, value) {
  //判断是普通值还是对象
  ref._value = isObject(value) ? reactive(value) : value
}
export function ref(value) {
  return new RefImpl(value)
}
export function isRef(obj) {
  return Boolean(obj._v_isRef)
}
export function unRef(obj) {
  return isRef(obj) ? obj.value : obj
}

export function proxyRefs(objWithRefs) {
  return new Proxy(objWithRefs, objWithRefsHandlers)
}
export const objWithRefsHandlers = {
  get(target, key) {
    return unRef(Reflect.get(target, key))
  },
  set(target, key, value) {
    return isRef(target[key]) && !isRef(value)
      ? target[key].value = value
      : Reflect.set(target, key, value)
  }
}