import { patch } from "./renderer"

export function createComponentInstance(vnode: any) {
  return {
    vnode,
    type: vnode.type,
  }
}

export function setupComponent(instance: any, container) {
  //Todo
  //初始化props、slots

  //初始化具有状态的的component（区别于无状态的函数式组件）
  setupStatefulComponent(instance)
  //对子节点做挂载操作
  setupRenderEffect(instance, container)
}

function setupStatefulComponent(instance: any) {
  const setup = instance.type.setup
  if (setup) {
    const setupResult = setup()
    //处理结果，将结果挂载到instance上
    handleSetupResult(instance, setupResult)
    //结束初始化阶段，将component上的render挂载到instance上    
    finishSetupComponent(instance)
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult == 'object') {
    instance.setupState = setupResult
  }
}

function finishSetupComponent(instance: any) {
  const render = instance.type.render
  if (render) {
    instance.render = render
  }
}
function setupRenderEffect(instance: any, container) {
  //子vnode数组
  const subTree = instance.render()
  patch(subTree, container)
}