export enum shapeFlags {
  ELEMENT = 1, //0001
  STATEFUL_COMPONENT = 1 << 1, //0010
  TEXT_CHILDREN = 1 << 2,//0100
  ARRAY_CHILDREN = 1 << 3, //1000
}
//查
export function isElement(vnode) {
  return vnode.shapeFlags & shapeFlags.ELEMENT
}

export function isStatefulComponent(vnode) {
  return vnode.shapeFlags & shapeFlags.STATEFUL_COMPONENT
}

export function isTextChild(vnode) {
  return vnode.shapeFlags & shapeFlags.TEXT_CHILDREN
}

export function isArrayChildren(vnode) {
  return vnode.shapeFlags & shapeFlags.ARRAY_CHILDREN
}
