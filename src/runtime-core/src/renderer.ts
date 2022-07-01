import { createComponentInstance, setupComponent } from "./component"
import { createVNode } from "./vnode"

export function render(vnode: any, rootContainer: any) {
  patch(vnode, rootContainer)
}


export function patch(vnode: any, rootContainer: any) {
  const type = vnode.type

  if (typeof type == 'string') {

    processElement(vnode, rootContainer)
  }
  else if (typeof type == 'object') {
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
    for (let key in props) {
      el.setAttribute(key, props[key])
    }
  }
  //children
  if (children) mountChildren(children, el)

  //将当前生成好的el添加到container上
  container.append(el)

}


function mountChildren(children, el) {
  //判断子元素是单个还是多个
  if (Array.isArray(children)) {
    for (let child of children) {
      mountChild(child, el)
    }
  }
  else {
    //判断是单个
    mountChild(children, el)
  }
}

function mountChild(child, el) {
  //判断该子元素是string、是一个vnode还是一个组件对象
  if (typeof child == "string") {
    const textNode = document.createTextNode(child)
    el.append(textNode)
  }
  else if (typeof child == 'object' && child.type) {
    //传入vnode
    patch(child, el)
  }
  //组件对象
  else if (typeof child == 'object' && !child.type) {
    const vnode = createVNode(child)
    //得到vnode再传入
    patch(vnode, el)
  }
}

