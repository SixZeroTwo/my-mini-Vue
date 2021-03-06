import { shallowReadonly } from "../reactivity/reactive"
import { proxyRefs } from "../reactivity/ref"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstanceProxyHandlers"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode: any, parent) {
  return {
    vnode,
    type: vnode.type,
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: {},
    next: null,
  }
}

export function setupComponent(instance: any, container, vnode) {
  //Todo
  //初始化props、slots
  initProps(instance, vnode)
  initSlots(instance, vnode)
  //初始化具有状态的的component（区别于无状态的函数式组件）
  setupStatefulComponent(instance)
  //将proxy代理对象挂在到instance上
  setupProxy(instance)
}


function setupStatefulComponent(instance: any) {

  const setup = instance.type.setup
  if (setup) {
    const props = instance.props
    const context = { 'emit': emit.bind(null, instance) }
    setCurrentInstance(instance)
    const setupResult = proxyRefs(setup(shallowReadonly(props), context) || {})
    setCurrentInstance(null)
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
  const { render, template } = instance.type
  if (render) {
    instance.render = render
  }
  else if (template) {
    instance.render = compiler(template)
  }
}
function setupProxy(instance) {
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)
}


let currentInstance = null

export function getCurrentInstance() {
  return currentInstance
}
function setCurrentInstance(val) {
  currentInstance = val
}

let compiler
export function registerRuntimeCompiler(_compiler) {
  compiler = _compiler
}