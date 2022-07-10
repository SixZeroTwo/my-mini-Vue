import { shapeFlags } from "../shared/shapeFlags"
import { TextNode } from "./renderer"

export function createVNode(type, props?, children?) {
  return {
    type,
    props,
    children,
    el: null,
    shapeFlags: createShapeFlags(type, children),
    parent,
    __v_isVNode: true,
  }
}

function createShapeFlags(type, children) {
  let res = 0
  //通过type判断是element还是component
  if (typeof type == 'string') res |= shapeFlags.ELEMENT
  else if (typeof type == 'object') res |= shapeFlags.STATEFUL_COMPONENT

  //通过children判断是否有多个孩子以及是不是文本类型的children
  if (children) {
    if (Array.isArray(children)) res |= shapeFlags.ARRAY_CHILDREN
    if (!Array.isArray(children) && typeof (children) == 'string') res |= shapeFlags.TEXT_CHILDREN
  }
  return res
}

export function createTextVNode(text) {
  return createVNode(TextNode, {}, text)
}