function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode.type,
    };
}
function setupComponent(instance, container) {
    //Todo
    //初始化props、slots
    //初始化具有状态的的component（区别于无状态的函数式组件）
    setupStatefulComponent(instance);
    //对子节点做挂载操作
    setupRenderEffect(instance, container);
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
function setupRenderEffect(instance, container) {
    //子vnode数组
    const subTree = instance.render();
    patch(subTree, container);
}

function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
}

function render(vnode, rootContainer) {
    patch(vnode, rootContainer);
}
function patch(vnode, rootContainer) {
    const type = vnode.type;
    if (typeof type == 'string') {
        processElement(vnode, rootContainer);
    }
    else if (typeof type == 'object') {
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
    //props
    if (props) {
        for (let key in props) {
            el.setAttribute(key, props[key]);
        }
    }
    //children
    if (children)
        mountChildren(children, el);
    //将当前生成好的el添加到container上
    container.append(el);
}
function mountChildren(children, el) {
    //判断子元素是单个还是多个
    if (Array.isArray(children)) {
        for (let child of children) {
            mountChild(child, el);
        }
    }
    else {
        //判断是单个
        mountChild(children, el);
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

export { createApp, h };
