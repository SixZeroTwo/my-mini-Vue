'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    setupRenderEffect(instance);
}
function setupStatefulComponent(instance) {
    const setup = instance.type.setup;
    if (setup) {
        const setupResult = setup();
        //处理结果，将结果挂载到instance上
        handleSetupResult(instance, setupResult);
        //结束初始化阶段，将component上的render挂载到instance上    
        finishSetupComponent(instance);
    }
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
    patch(subTree);
}

function render(vnode, rootContainer) {
    patch(vnode);
}
function patch(vnode, rootContainer) {
    //根据vnode类型判断
    processComponent(vnode);
    //TODO
    //processElement
    //mount
}
function processComponent(vnode, container) {
    //如果是第一次挂载阶段
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    //将数据收集之后放在实例上统一处理
    const instance = createComponentInstance(vnode);
    //初始化Component
    setupComponent(instance);
}

function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
}

const createApp = function (rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
};

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
