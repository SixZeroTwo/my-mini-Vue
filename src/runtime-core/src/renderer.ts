import { isArrayChildren, isElement, isStatefulComponent, isTextChild } from "../../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode: any, rootContainer: any) {
  patch(vnode, rootContainer)
}


export function patch(vnode: any, rootContainer: any) {
  if (isElement(vnode)) {
    processElement(vnode, rootContainer)
  }
  else if (isStatefulComponent(vnode)) {
    processComponent(vnode, rootContainer)
  }
}

function processComponent(vnode, container) {

  //如果是第一次挂载阶段
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  //将数据收集之后放在实例上统一处理
  const instance = createComponentInstance(vnode)
  //初始化Component
  setupComponent(instance, container, vnode)
}

function processElement(vnode: any, container: any) {

  // 如果是第一次挂载
  mountElement(vnode, container)
  // TODO
  // update
}

function mountElement(vnode: any, container: any) {
  //解构
  const { type, props, children } = vnode
  //创建元素、配置元素、递归调用patch，添加到容器
  const el = document.createElement(type)
  //挂到el上
  vnode.el = el
  //props
  if (props) {
    const isOn = (key) => new RegExp('^on[A-Z]').test(key)
    for (let key in props) {
      if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, props[key])
      }
      el.setAttribute(key, props[key])
    }
  }
  //children
  if (children) {
    if (isArrayChildren(vnode)) mountChildren(children, el)
    else if (isTextChild(vnode)) el.textContent = children
    else {
      patch(children, el)
    }
  }
  //将当前生成好的el添加到container上
  container.append(el)
}


function mountChildren(children, el) {
  for (let child of children) {
    patch(child, el)
  }
}

