import { ReactiveEffect } from './effect'
import { extend } from './shared/extend'
class ComputedRefImpl {
  private _value
  private dirty = false
  private effect: ReactiveEffect
  constructor(getter) {
    this.effect = new ReactiveEffect(getter)
    const scheduler = () => {
      this.dirty = false
    }
    extend(this.effect, { scheduler })
  }
  get value() {
    if (!this.dirty) {
      this._value = this.effect.run()
      this.dirty = true
    }
    return this._value
  }
}
export function computed(getter) {
  return new ComputedRefImpl(getter)
}