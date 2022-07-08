import { isArrayChildren, isElement, isStatefulComponent, isTextChild } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"

export const Fragment = Symbol('Fragment')
export const TextNode = Symbol('TextNode')


export function createRenderer({ createElement, patchProp, insert }) {
  function render(vnode: any, rootContainer: any) {
    patch(vnode, rootContainer, null)
  }

  function patch(vnode: any, rootContainer: any, parentComponent) {
    const { type } = vnode
    switch (type) {
      case Fragment: processFragment(vnode, rootContainer, parentComponent); break
      case TextNode: processText(vnode, rootContainer); break
      default: {
        if (isElement(vnode)) {
          processElement(vnode, rootContainer, parentComponent)
        }
        else if (isStatefulComponent(vnode)) {
          processComponent(vnode, rootContainer, parentComponent)
        }
      }
    }
  }



  function processFragment(vnode, container, parentComponent) {
    //只需要渲染Fragment的children即可
    const { children } = vnode
    if (Array.isArray(children)) {
      mountChildren(children, container, parentComponent)
    }
    else patch(children, container, parentComponent)
  }

  function processText(vnode: any, rootContainer: any) {
    const { children } = vnode
    const el = vnode.el = document.createTextNode(children)
    rootContainer.append(el)
  }

  function processComponent(vnode, container, parentComponent) {

    //如果是第一次挂载阶段
    mountComponent(vnode, container, parentComponent)
  }

  function mountComponent(vnode, container, parentComponent) {
    //将数据收集之后放在实例上统一处理
    const instance = createComponentInstance(vnode, parentComponent)
    //初始化Component
    setupComponent(instance, container, vnode)
    //对子节点做挂载操作
    setupRenderEffect(instance, container, vnode)
  }

  function processElement(vnode: any, container: any, parentComponent) {

    // 如果是第一次挂载
    mountElement(vnode, container, parentComponent)
    // TODO
    // update
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    //解构
    const { type, props, children } = vnode
    //创建元素、配置元素、递归调用patch，添加到容器
    const el = createElement(type)
    //挂到el上
    vnode.el = el
    //props
    if (props) {
      for (let key in props) {
        patchProp(el, key, props[key])
      }
    }
    //children
    if (children) {
      if (isArrayChildren(vnode)) mountChildren(children, el, parentComponent)
      else if (isTextChild(vnode)) el.textContent = children
      else {
        patch(children, el, parentComponent)
      }
    }
    //将当前生成好的el添加到container上
    insert(el, container)
  }

  function mountChildren(children, el, parentComponent) {
    for (let child of children) {
      patch(child, el, parentComponent)
    }
  }
  function setupRenderEffect(instance: any, container, vnode) {
    //子vnode数组
    const subTree = instance.render.call(instance.proxy)
    //记录parent
    patch(subTree, container, instance)
    instance.el = subTree.el
  }
  return {
    createApp: createAppApi(render)
  }
}