import { trackEffect, triggerEffect } from "./reactivity/effect"
import { reactive } from "./reactivity/reactive"
import { hasChanged } from "./reactivity/shared/hasChanged"
import { isObject } from "./reactivity/shared/isObject"

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
