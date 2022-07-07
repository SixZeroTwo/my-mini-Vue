import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const instance: any = getCurrentInstance()
  const { parent } = instance
  if (parent) {
    const parentProvides = parent.provides
    if (key in parentProvides) {
      instance.provides = Object.create(parentProvides)
      instance.provides[key] = value
    }
    else {
      parentProvides[key] = value
    }
  }
  else instance.provides[key] = value
}

export function inject(key, value) {
  const { parent }: any = getCurrentInstance()
  if (parent) {
    const parentProvides = parent.provides
    let res = parentProvides[key]
    if (res == undefined) {
      if (typeof value == 'function') {
        res = value()
      }
      else {
        res = value
      }
    }
    return res
  }
}