import { effect } from "../reactivity/effect"
import { isArrayChildren, isElement, isStatefulComponent, isTextChild } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"

export const Fragment = Symbol('Fragment')
export const TextNode = Symbol('TextNode')


export function createRenderer({ createElement, patchProp, insert }) {
  function render(vnode: any, rootContainer: any) {
    patch(null, vnode, rootContainer, null)
  }

  function patch(n1, n2, rootContainer: any, parentComponent) {
    const { type } = n2
    switch (type) {
      case Fragment: processFragment(n1, n2, rootContainer, parentComponent); break
      case TextNode: processText(n1, n2, rootContainer); break
      default: {
        if (isElement(n2)) {
          processElement(n1, n2, rootContainer, parentComponent)
        }
        else if (isStatefulComponent(n2)) {
          processComponent(n1, n2, rootContainer, parentComponent)
        }
      }
    }
  }



  function processFragment(n1, n2, container, parentComponent) {
    //只需要渲染Fragment的children即可
    const { children } = n2
    if (Array.isArray(children)) {
      mountChildren(children, container, parentComponent)
    }
    else patch(null, children, container, parentComponent)
  }

  function processText(n1, n2: any, rootContainer: any) {
    const { children } = n2
    const el = n2.el = document.createTextNode(children)
    rootContainer.append(el)
  }

  function processComponent(n1, n2, container, parentComponent) {
    if (!n1) {
      //如果是第一次挂载阶段
      mountComponent(n2, container, parentComponent)
    }
    else {
      //更新

    }
  }

  function mountComponent(vnode, container, parentComponent) {
    //将数据收集之后放在实例上统一处理
    const instance = createComponentInstance(vnode, parentComponent)
    //初始化Component
    setupComponent(instance, container, vnode)
    //对子节点做挂载操作
    setupRenderEffect(instance, container, vnode)
  }

  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      // 如果是第一次挂载
      mountElement(n2, container, parentComponent)
    }
    else {
      // update
      patchElement(n1, n2, container)
    }
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
    }
    //将当前生成好的el添加到container上
    insert(el, container)
  }

  function mountChildren(children, el, parentComponent) {
    for (let child of children) {
      patch(null, child, el, parentComponent)
    }
  }
  function patchElement(n1, n2, container) {
    console.log("patchElement");
    console.log("n1", n1);
    console.log("n2", n2);
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    //给新节点设置el
    const el = (n2.el = n1.el)
    patchProps(oldProps, newProps, el)
  }

  function patchProps(oldProps, newProps, el) {
    //属性的值发生改变或新增了属性
    for (let key in newProps) {
      if (oldProps[key] != newProps[key]) {
        //调用patchProp接口，将新属性挂载
        patchProp(el, key, newProps[key])
      }
    }
    //检查旧属性是否有删除
    for (let key in oldProps) {
      if (!(key in newProps)) {
        patchProp(el, key, undefined)
      }
    }
  }
  function setupRenderEffect(instance: any, container, vnode) {
    effect(() => {
      if (!instance.isMounted) {
        //子vnode数组
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        //记录parent
        patch(null, subTree, container, instance)
        vnode.el = subTree.el
        instance.isMounted = true
      }
      else {
        //子vnode数组
        const subTree = instance.render.call(instance.proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        //记录parent
        patch(prevSubTree, subTree, container, instance)
      }
    })
  }
  return {
    createApp: createAppApi(render)
  }
}
