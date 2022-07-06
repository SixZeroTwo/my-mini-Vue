import { h } from "./h"

export function initSlots(instance, vnode) {
  const children = vnode.children
  instance.slots = children
}

export function renderSlots(slots, name, slotsProps?) {
  //判断一下有没有插槽内容
  const slot = slots[name]
  if (Array.isArray(slot)) {
    return h('div', {}, slot.map(item => handleSlot(item, slotsProps)))
  }
  else if (typeof slot == 'function') return handleSlot(slot, slotsProps)
}

function handleSlot(slot, slotsProps) {
  if (typeof slot == 'function') {
    return slot(slotsProps)
  }
}
