import { createComponentInstance, setupComponent } from "./component"

export function render(vnode: any, rootContainer: any) {
  patch(vnode, rootContainer)
}


export function patch(vnode: any, rootContainer: any) {
  //根据vnode类型判断
  processComponent(vnode, rootContainer)

  //TODO
  //processElement
  //mount
}

function processComponent(vnode, container) {
  //如果是第一次挂载阶段
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  //将数据收集之后放在实例上统一处理
  const instance = createComponentInstance(vnode)
  //初始化Component
  setupComponent(instance, container)
}

