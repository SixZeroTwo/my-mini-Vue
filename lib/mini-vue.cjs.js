'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var shapeFlags;
(function (shapeFlags) {
    shapeFlags[shapeFlags["ELEMENT"] = 1] = "ELEMENT";
    shapeFlags[shapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    shapeFlags[shapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    shapeFlags[shapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
})(shapeFlags || (shapeFlags = {}));
//查
function isElement(vnode) {
    return vnode.shapeFlags & shapeFlags.ELEMENT;
}
function isStatefulComponent(vnode) {
    return vnode.shapeFlags & shapeFlags.STATEFUL_COMPONENT;
}
function isArrayChildren(vnode) {
    return vnode.shapeFlags & shapeFlags.ARRAY_CHILDREN;
}

const publicInstanceProxyHandlers = {
    get({ _ }, key) {
        const instance = _;
        if (key in instance.setupState) {
            return instance.setupState[key];
        }
        if (key == '$el') {
            return instance.el;
        }
    },
};

function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode.type,
    };
}
function setupComponent(instance, container, vnode) {
    //Todo
    //初始化props、slots
    //初始化具有状态的的component（区别于无状态的函数式组件）
    setupStatefulComponent(instance);
    //将proxy代理对象挂在到instance上
    setupProxy(instance);
    //对子节点做挂载操作
    setupRenderEffect(instance, container);
}
function setupProxy(instance) {
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
}
function setupStatefulComponent(instance) {
    const setup = instance.type.setup;
    if (setup) {
        const setupResult = setup();
        //处理结果，将结果挂载到instance上
        handleSetupResult(instance, setupResult);
    }
    //结束初始化阶段，将component上的render挂载到instance上    
    finishSetupComponent(instance);
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult == 'object') {
        instance.setupState = setupResult;
    }
}
function finishSetupComponent(instance) {
    const render = instance.type.render;
    if (render) {
        instance.render = render;
    }
}
function setupRenderEffect(instance, container, vnode) {
    //子vnode数组
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    instance.el = subTree.el;
}

function createVNode(type, props, children) {
    return {
        type,
        props,
        children,
        el: null,
        shapeFlags: createShapeFlags(type, children),
    };
}
function createShapeFlags(type, children) {
    let res = 0;
    //通过type判断是element还是component
    if (typeof type == 'string')
        res |= shapeFlags.ELEMENT;
    else if (typeof type == 'object')
        res |= shapeFlags.STATEFUL_COMPONENT;
    //通过children判断是否有多个孩子以及是不是文本类型的children
    if (children) {
        if (Array.isArray(children))
            res |= shapeFlags.ARRAY_CHILDREN;
        if (!Array.isArray(children) && typeof (children) == 'string')
            res |= shapeFlags.TEXT_CHILDREN;
    }
    debugger;
    return res;
}

function render(vnode, rootContainer) {
    patch(vnode, rootContainer);
}
function patch(vnode, rootContainer) {
    if (isElement(vnode)) {
        processElement(vnode, rootContainer);
    }
    else if (isStatefulComponent(vnode)) {
        processComponent(vnode, rootContainer);
    }
}
function processComponent(vnode, container) {
    //如果是第一次挂载阶段
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    //将数据收集之后放在实例上统一处理
    const instance = createComponentInstance(vnode);
    //初始化Component
    setupComponent(instance, container);
}
function processElement(vnode, container) {
    // 如果是第一次挂载
    mountElement(vnode, container);
    // TODO
    // update
}
function mountElement(vnode, container) {
    //解构
    const { type, props, children } = vnode;
    //创建元素、配置元素、递归调用patch，添加到容器
    const el = document.createElement(type);
    //挂到el上
    vnode.el = el;
    //props
    if (props) {
        for (let key in props) {
            el.setAttribute(key, props[key]);
        }
    }
    //children
    if (children) {
        if (isArrayChildren(vnode))
            mountChildren(children, el);
        else {
            mountChild(children, el);
        }
    }
    //将当前生成好的el添加到container上
    container.append(el);
}
function mountChildren(children, el) {
    for (let child of children) {
        mountChild(child, el);
    }
}
function mountChild(child, el) {
    //判断该子元素是string、是一个vnode还是一个组件对象
    if (typeof child == "string") {
        const textNode = document.createTextNode(child);
        el.append(textNode);
    }
    else if (typeof child == 'object' && child.type) {
        //传入vnode
        patch(child, el);
    }
    //组件对象
    else if (typeof child == 'object' && !child.type) {
        const vnode = createVNode(child);
        //得到vnode再传入
        patch(vnode, el);
    }
}

const createApp = function (rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            console.log(rootContainer);
            render(vnode, rootContainer);
        }
    };
};

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
