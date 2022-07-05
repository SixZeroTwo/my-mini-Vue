import { shallowReadonly } from "../../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstanceProxyHandlers"
import { patch } from "./renderer"

export function createComponentInstance(vnode: any) {
  return {
    vnode,
    type: vnode.type,
  }
}

export function setupComponent(instance: any, container, vnode) {
  //Todo
  //初始化props、slots
  initProps(instance, vnode)
  //初始化具有状态的的component（区别于无状态的函数式组件）
  setupStatefulComponent(instance)
  //将proxy代理对象挂在到instance上
  setupProxy(instance)
  //对子节点做挂载操作
  setupRenderEffect(instance, container, vnode)
}

function setupProxy(instance) {
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)
}
function setupStatefulComponent(instance: any) {
  const setup = instance.type.setup
  if (setup) {
    const props = instance.props

    const context = { 'emit': emit.bind(null, instance) }
    const setupResult = setup(shallowReadonly(props), context)
    //处理结果，将结果挂载到instance上
    handleSetupResult(instance, setupResult)
  }
  //结束初始化阶段，将component上的render挂载到instance上    
  finishSetupComponent(instance)
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
function setupRenderEffect(instance: any, container, vnode) {
  //子vnode数组
  const subTree = instance.render.call(instance.proxy)
  patch(subTree, container)
  instance.el = subTree.el
}


