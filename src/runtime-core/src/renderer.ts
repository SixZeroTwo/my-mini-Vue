import { isArrayChildren, isElement, isStatefulComponent, isTextChild } from "../../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export const Fragment = Symbol('Fragment')
export const TextNode = Symbol('TextNode')

export function render(vnode: any, rootContainer: any) {
  patch(vnode, rootContainer)
}


export function patch(vnode: any, rootContainer: any) {
  const { type } = vnode
  switch (type) {
    case Fragment: processFragment(vnode, rootContainer); break
    case TextNode: processText(vnode, rootContainer); break
    default: {
      if (isElement(vnode)) {
        processElement(vnode, rootContainer)
      }
      else if (isStatefulComponent(vnode)) {
        processComponent(vnode, rootContainer)
      }
    }
  }
}


function processFragment(vnode, container) {
  //只需要渲染Fragment的children即可
  const { children } = vnode
  if (Array.isArray(children)) {
    mountChildren(children, container)
  }
  else patch(children, container)
}

function processText(vnode: any, rootContainer: any) {
  const { children } = vnode
  const el = vnode.el = document.createTextNode(children)
  rootContainer.append(el)
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


