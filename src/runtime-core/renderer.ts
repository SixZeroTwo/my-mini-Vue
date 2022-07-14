import { effect } from "../reactivity/effect"
import { isArrayChildren, isElement, isStatefulComponent, isTextChild } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"

export const Fragment = Symbol('Fragment')
export const TextNode = Symbol('TextNode')


export function createRenderer({ createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText }) {
  function render(vnode: any, rootContainer: any) {
    patch(null, vnode, rootContainer, null, null)
  }

  function patch(n1, n2, rootContainer: any, parentComponent, anchor) {
    const { type } = n2
    switch (type) {
      case Fragment: processFragment(n1, n2, rootContainer, parentComponent, anchor); break
      case TextNode: processText(n1, n2, rootContainer); break
      default: {
        if (isElement(n2)) {
          processElement(n1, n2, rootContainer, parentComponent, anchor)
        }
        else if (isStatefulComponent(n2)) {
          processComponent(n1, n2, rootContainer, parentComponent, anchor)
        }
      }
    }
  }



  function processFragment(n1, n2, container, parentComponent, anchor) {
    //只需要渲染Fragment的children即可
    const { children } = n2
    if (Array.isArray(children)) {
      mountChildren(children, container, parentComponent, anchor)
    }
    else patch(null, children, container, parentComponent, null)
  }

  function processText(n1, n2: any, rootContainer: any) {
    const { children } = n2
    const el = n2.el = document.createTextNode(children)
    rootContainer.append(el)
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      //如果是第一次挂载阶段
      mountComponent(n2, container, parentComponent, anchor)
    }
    else {
      //更新

    }
  }

  function mountComponent(vnode, container, parentComponent, anchor) {
    //将数据收集之后放在实例上统一处理
    const instance = createComponentInstance(vnode, parentComponent)
    //初始化Component
    setupComponent(instance, container, vnode)
    //对子节点做挂载操作
    setupRenderEffect(instance, container, vnode, anchor)
  }

  function processElement(n1, n2: any, container: any, parentComponent, anchor) {
    if (!n1) {
      // 如果是第一次挂载
      mountElement(n2, container, parentComponent, anchor)
    }
    else {
      // update
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    //解构
    const { type, props, children } = vnode
    //创建元素、配置元素、递归调用patch，添加到容器
    const el = hostCreateElement(type)
    //挂到el上
    vnode.el = el
    //props
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, props[key])
      }
    }
    //children
    if (children) {
      if (isArrayChildren(vnode)) mountChildren(children, el, parentComponent, anchor)
      else if (isTextChild(vnode)) el.textContent = children
    }
    //将当前生成好的el添加到container上
    hostInsert(el, container, anchor)
  }

  function mountChildren(children, el, parentComponent, anchor) {
    for (let child of children) {
      patch(null, child, el, parentComponent, anchor)
    }
  }
  function patchElement(n1, n2, container, parentComponent, anchor) {
    //给新节点设置el
    const el = (n2.el = n1.el)
    patchProps(n1, n2, el)
    patchChildren(n1, n2, parentComponent, anchor)
  }

  function patchProps(n1, n2, el) {
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    //属性的值发生改变或新增了属性
    for (let key in newProps) {
      if (oldProps[key] != newProps[key]) {
        //调用patchProp接口，将新属性挂载
        hostPatchProp(el, key, newProps[key])
      }
    }
    //检查旧属性是否有删除
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, undefined)
      }
    }
  }
  function patchChildren(n1, n2, parentComponent, anchor) {
    //Array -> Text
    if (isArrayChildren(n1) && isTextChild(n2)) {
      unMountChildren(n1.children)
      const text = n2.children
      const el = n2.el
      hostSetElementText(el, text)
    }
    else if (isTextChild(n1) && isArrayChildren(n2)) {
      const el = n2.el
      hostSetElementText(el, '')
      mountChildren(n2.children, el, parentComponent, anchor)
    }
    else if (isTextChild(n1) && isTextChild(n2)) {
      const text = n2.children
      const el = n2.el
      hostSetElementText(el, text)
    }
    else if (isArrayChildren(n1) && isArrayChildren(n2)) {
      const el = n2.el
      const c1 = n1.children
      const c2 = n2.children
      patchKeyedChildren(c1, c2, el, parentComponent, anchor)
    }
  }
  function unMountChildren(children) {
    for (let child of children) {
      const childEl = child.el
      hostRemove(childEl)
    }
  }
  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    console.log('ArrayToArray');

    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    //左端对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      console.log('n1', n1);
      console.log('n2', n2);
      console.log(i, e1, e2);
      if (isSameVnode(n1, n2)) {
        //如果相同，则两个子节点进行进一步比较
        patch(n1, n2, container, parentComponent, parentAnchor)
      }
      else break
      i++
    }

    //右端对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnode(n1, n2)) {
        //如果相同，则两个子节点进行进一步比较
        patch(n1, n2, container, parentComponent, parentAnchor)
      }
      else break
      e1--
      e2--
    }

    //第一种情况：新序列有非公共部分，旧序列没有公共部分
    if (i > e1 && e2 > e1) {

      while (i <= e2) {
        //从右向左依次插入
        let nextPos = e2 + 1
        //当nextPos在c2的范围内时，说明是有锚点的，获得nextPos位置vnode的el
        let anchor = nextPos < c2.length ? c2[nextPos].el : null
        const n2 = c2[e2]
        patch(null, n2, container, parentComponent, anchor)
        e2--
      }
    }
    //第二种情况：旧序列有非公共部分，新序列没有非公共部分
    else if (i > e2 && e1 > e2) {
      while (i <= e1) {
        //从右向左依次删除
        const delEl = c1[e1].el
        hostRemove(delEl)
        e1--
      }
    }
    //第三种情况，新旧序列都有公共部分，可能会有三种操作——删除、新增、移动
    else {
      //首先对非公共部分根据key属性来做缓存
      const s1 = i
      const s2 = i
      const toBePatched = e2 - s2 + 1
      let patched = 0
      const KeyToNewIndexMap = new Map
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0)//0代表需要新增
      for (let i = s2; i <= e2; i++) {
        if (c2[i].key) {
          KeyToNewIndexMap.set(c2[i].key, i)
        }
      }

      //旧序列中的key是否在map中有对应的index
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        let newIndex
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }
        if (prevChild.key != null) {
          newIndex = KeyToNewIndexMap.get(prevChild.key)
          //根据newIndex去设置newIndexToOldIndexMap
          newIndexToOldIndexMap[newIndex - s2] = i - s1 + 1
        } else {
          //如果没有key就只能一个个比对
          for (let j = s2; j <= e2; j++) {
            const newChild = c2[j]
            if (isSameVnode(prevChild, newChild)) {
              newIndex = j
              break
            }
          }
        }
        //newIndex在新序列中没有，删除即可
        if (newIndex == undefined) {
          hostRemove(prevChild.el)
        } else {
          //否则继续递归比对
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }
      //对newIndexToOldIndexMap做最长递增子序列，得到最长递增子序列的序号
      const newSequenceIndex = getSequence(newIndexToOldIndexMap)
      for (let i = e2 - s2; i >= 0; i--) {
        const nextPos = i + s2 + 1//锚点在c2中的位置
        const curPos = i + s2//当前非公共序列元素在c2中的位置
        const anchor = nextPos < c2.length ? c2[nextPos].el : null
        //不在递增子序列中且在旧序列中存在的节点需要移动
        if (newIndexToOldIndexMap[i] > 0 && newSequenceIndex.indexOf(newIndexToOldIndexMap[i]) == -1) {
          //移动（插入锚点之前）
          const el = c2[curPos].el
          hostInsert(el, container, anchor)
        }
        //标记为0的节点需要新增
        else if (newIndexToOldIndexMap[i] == 0) {
          //新增
          patch(null, c2[curPos], container, parentComponent, anchor)
        }
      }
    }
  }
  function isSameVnode(c1: any, c2: any) {
    return c1.type == c2.type && c1.key == c2.key
  }
  function setupRenderEffect(instance: any, container, vnode, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        //子vnode数组
        const subTree = (instance.subTree = instance.render.call(instance.proxy))
        //记录parent
        patch(null, subTree, container, instance, anchor)
        vnode.el = subTree.el
        instance.isMounted = true
      }
      else {
        //子vnode数组
        const subTree = instance.render.call(instance.proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        //记录parent
        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }
  return {
    createApp: createAppApi(render)
  }
}

function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}