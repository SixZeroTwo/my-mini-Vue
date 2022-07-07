const extend = Object.assign;

const targetsMap = new Map;
function track(target, key) {
    //读取targetsMap中target对应的depsMap
    if (!targetsMap.has(target))
        targetsMap.set(target, new Map());
    let depsMap = targetsMap.get(target);
    if (!depsMap.has(key))
        depsMap.set(key, new Set);
    depsMap.get(key);
}
function trigger(target, key, value) {
    //读取targetsMap中target对应的depsMap
    if (!targetsMap.has(target))
        targetsMap.set(target, new Map());
    let depsMap = targetsMap.get(target);
    if (!depsMap.has(key))
        depsMap.set(key, new Set);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    //通知依赖
    for (let effect of dep) {
        if (effect.scheduler)
            effect.scheduler();
        else
            effect.run();
    }
}

const isObject = function (obj) {
    return obj != null && typeof obj == 'object';
};

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const readonlySet = createSetter(true);
const shallowReactiveGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set: readonlySet
};
extend({}, mutableHandlers, { get: shallowReactiveGet });
const shallowReadonlyHandlers = extend({}, readonlyHandlers, { get: shallowReadonlyGet });
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        if (key == "_v_isReactive" /* ReactiveFlags.IS_REACTIVE */)
            return !isReadonly;
        else if (key == "_v_isReadonly" /* ReactiveFlags.IS_READONLY */)
            return isReadonly;
        else if (key == "_v_isProxy" /* ReactiveFlags.IS_PROXY */)
            return true;
        const res = Reflect.get(target, key);
        if (!isShallow && isObject(res))
            return isReadonly ? readonly(res) : reactive(res);
        if (!isReadonly) {
            //收集依赖
            //track函数传入target和key，通过targetsMap找到target对应的依赖depsMap，再根据key设置对应的deps的fn
            track(target, key);
        }
        return res;
    };
}
function createSetter(isReadonly = false) {
    return function set(target, key, value) {
        if (!isReadonly) {
            const res = Reflect.set(target, key, value);
            //触发依赖
            //同样是通过targetsMap和depsMap，依次触发deps中的回调函数
            trigger(target, key);
            return res;
        }
        else {
            //抛出警告
            console.warn(`${target}为readonly对象，不能对${key.toString()}做修改`);
            return true;
        }
    };
}

function reactive(obj) {
    return createActiveObject(obj, mutableHandlers);
}
function readonly(obj) {
    return createActiveObject(obj, readonlyHandlers);
}
function createActiveObject(obj, handlers) {
    return new Proxy(obj, handlers);
}
function shallowReadonly(obj) {
    return createActiveObject(obj, shallowReadonlyHandlers);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handler = props[eventToHandler(event)];
    handler && handler(...args);
    function eventToHandler(event) {
        event = event.replace(/-\w/g, str => str[1].toUpperCase());
        return 'on' + event[0].toUpperCase() + event.slice(1);
    }
}

function initProps(instance, vnode) {
    instance.props = vnode.props || {};
}

const publicInstanceProxyHandlers = {
    get({ _ }, key) {
        const instance = _;
        if (key in instance.props) {
            return instance.props[key];
        }
        if (key in instance.setupState) {
            return instance.setupState[key];
        }
        if (key == '$el') {
            return instance.el;
        }
        if (key == '$slots') {
            return instance.slots;
        }
    },
};

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
function isTextChild(vnode) {
    return vnode.shapeFlags & shapeFlags.TEXT_CHILDREN;
}
function isArrayChildren(vnode) {
    return vnode.shapeFlags & shapeFlags.ARRAY_CHILDREN;
}

const Fragment = Symbol('Fragment');
const TextNode = Symbol('TextNode');
function render(vnode, rootContainer) {
    patch(vnode, rootContainer);
}
function patch(vnode, rootContainer) {
    const { type } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, rootContainer);
            break;
        case TextNode:
            processText(vnode, rootContainer);
            break;
        default: {
            if (isElement(vnode)) {
                processElement(vnode, rootContainer);
            }
            else if (isStatefulComponent(vnode)) {
                processComponent(vnode, rootContainer);
            }
        }
    }
}
function processFragment(vnode, container) {
    //只需要渲染Fragment的children即可
    const { children } = vnode;
    if (Array.isArray(children)) {
        mountChildren(children, container);
    }
    else
        patch(children, container);
}
function processText(vnode, rootContainer) {
    const { children } = vnode;
    const el = vnode.el = document.createTextNode(children);
    rootContainer.append(el);
}
function processComponent(vnode, container) {
    //如果是第一次挂载阶段
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    //将数据收集之后放在实例上统一处理
    const instance = createComponentInstance(vnode);
    //初始化Component
    setupComponent(instance, container, vnode);
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
        const isOn = (key) => new RegExp('^on[A-Z]').test(key);
        for (let key in props) {
            if (isOn(key)) {
                const event = key.slice(2).toLowerCase();
                el.addEventListener(event, props[key]);
            }
            el.setAttribute(key, props[key]);
        }
    }
    //children
    if (children) {
        if (isArrayChildren(vnode))
            mountChildren(children, el);
        else if (isTextChild(vnode))
            el.textContent = children;
        else {
            patch(children, el);
        }
    }
    //将当前生成好的el添加到container上
    container.append(el);
}
function mountChildren(children, el) {
    for (let child of children) {
        patch(child, el);
    }
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
    return res;
}
function createTextVNode(text) {
    return createVNode(TextNode, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function initSlots(instance, vnode) {
    const children = vnode.children;
    instance.slots = children;
}
function renderSlots(slots, name, slotsProps) {
    //判断一下有没有插槽内容
    const slot = slots[name];
    if (slot)
        return h(Fragment, {}, handleSlot(slot, slotsProps));
}
function handleSlot(slot, slotsProps) {
    if (typeof slot == 'function') {
        return slot(slotsProps);
    }
}

function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode.type,
    };
}
function setupComponent(instance, container, vnode) {
    //Todo
    //初始化props、slots
    initProps(instance, vnode);
    initSlots(instance, vnode);
    //初始化具有状态的的component（区别于无状态的函数式组件）
    setupStatefulComponent(instance);
    //将proxy代理对象挂在到instance上
    setupProxy(instance);
    //对子节点做挂载操作
    setupRenderEffect(instance, container);
}
function setupStatefulComponent(instance) {
    setCurrentInstance(instance);
    const setup = instance.type.setup;
    if (setup) {
        const props = instance.props;
        const context = { 'emit': emit.bind(null, instance) };
        const setupResult = setup(shallowReadonly(props), context);
        //处理结果，将结果挂载到instance上
        handleSetupResult(instance, setupResult);
    }
    //结束初始化阶段，将component上的render挂载到instance上    
    finishSetupComponent(instance);
    setCurrentInstance(null);
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
function setupProxy(instance) {
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
}
function setupRenderEffect(instance, container, vnode) {
    //子vnode数组
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    instance.el = subTree.el;
}
let currentInstance = null;
function getCurrentInstance() {
    debugger;
    return currentInstance;
}
function setCurrentInstance(val) {
    currentInstance = val;
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

export { createApp, createTextVNode, getCurrentInstance, h, renderSlots };
