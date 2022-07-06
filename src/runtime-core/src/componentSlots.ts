import { h } from "./h"

export function initSlots(instance, vnode) {
  const children = vnode.children
  instance.slots = children
}

export function renderSlots(slots) {
  //判断一下有没有插槽内容
  if (slots) {
    return h('div', {}, slots)
  }
}