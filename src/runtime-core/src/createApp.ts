import { render } from "./renderer"
import { createVNode } from "./vnode"

export const createApp = function (rootComponent) {
  return {
    mount(rootContainer) {
      const vnode = createVNode(rootComponent)
      render(vnode, rootContainer)
    }
  }
}






