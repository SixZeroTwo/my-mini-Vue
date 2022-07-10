import { createVNode } from "./vnode";
export function h(type, props?, children?) {
  //对children做判断
  if (isVNode(children)) {
    return createVNode(type, props, [children])
  }
  return createVNode(type, props, children)
}
function isVNode(value: any) {
  return value ? value.__v_isVNode === true : false
}