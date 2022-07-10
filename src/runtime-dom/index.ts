import { createRenderer } from '../runtime-core/renderer'
function createElement(type) {
  return document.createElement(type)
}
function patchProp(el, key, value) {
  const isOn = (key) => new RegExp('^on[A-Z]').test(key)
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, value)
  }
  if (value == undefined || value == null) {
    el.removeAttribute(key)
  }
  else {
    el.setAttribute(key, value)
  }
}

function insert(el, container) {
  container.append(el)
}

const render: any = createRenderer({ createElement, patchProp, insert })
export function createApp(...args) {
  return render.createApp(...args)
}
export * from '../runtime-core'
