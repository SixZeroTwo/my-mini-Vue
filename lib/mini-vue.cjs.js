'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;

class ReactiveEffect {
    constructor(fn) {
        this.deps = new Set;
        this.active = true;
        this.fn = fn;
    }
    run() {
        activeEffect = this;
        this.active = true;
        return this.fn();
    }
    stop() {
        if (this.active) {
            cleanEffect(this);
            //执行onStop回调
            this.onStop && this.onStop();
            this.active = false;
        }
    }
}
function cleanEffect(effect) {
    //找到deps并一一删除
    effect.deps.forEach(dep => dep.delete(effect));
    //清空活动对象
    activeEffect = null;
}
function effect(fn, options) {
    //构造一个ReactiveEffect实例
    let _effect = new ReactiveEffect(fn);
    //将options的属性赋予_effect
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner._effect = _effect;
    return runner;
}
let activeEffect;
const targetsMap = new Map;
function track(target, key) {
    //读取targetsMap中target对应的depsMap
    if (!targetsMap.has(target))
        targetsMap.set(target, new Map());
    let depsMap = targetsMap.get(target);
    if (!depsMap.has(key))
        depsMap.set(key, new Set);
    let dep = depsMap.get(key);
    trackEffect(dep);
}
function trackEffect(dep) {
    //当前如果没有活动对象
    if (!activeEffect)
        return;
    //将现在的effect对象放入deps
    dep.add(activeEffect);
    //反向记录，每个Effect对象都会记录自己所在的deps
    activeEffect.deps.add(dep);
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

const hasChanged = function (A, B) {
    return Object.is(A, B);
};

class RefImpl {
    constructor(value) {
        this._v_isRef = true;
        createRefValue(this, value);
        this.rawValue = value;
        this.dep = new Set;
    }
    get value() {
        //收集依赖
        trackEffect(this.dep);
        return this._value;
    }
    set value(newValue) {
        //判断是新值还是旧值
        if (hasChanged(newValue, this.rawValue))
            return;
        createRefValue(this, newValue);
        this.rawValue = newValue;
        //触发依赖
        triggerEffect(this.dep);
    }
}
function createRefValue(ref, value) {
    //判断是普通值还是对象
    ref._value = isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(obj) {
    return Boolean(obj._v_isRef);
}
function unRef(obj) {
    return isRef(obj) ? obj.value : obj;
}
function proxyRefs(objWithRefs) {
    return new Proxy(objWithRefs, objWithRefsHandlers);
}
const objWithRefsHandlers = {
    get(target, key) {
        return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
        return isRef(target[key]) && !isRef(value)
            ? target[key].value = value
            : Reflect.set(target, key, value);
    }
};

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
        if (key == '$props') {
            return instance.props;
        }
    },
};

function createVNode(type, props, children) {
    return {
        type,
        props,
        children,
        el: null,
        shapeFlags: createShapeFlags(type, children),
        parent,
        key: props ? props.key : null,
        __v_isVNode: true,
        component: null,
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
    //对children做判断
    if (isVNode(children)) {
        return createVNode(type, props, [children]);
    }
    return createVNode(type, props, children);
}
function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
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

function createComponentInstance(vnode, parent) {
    return {
        vnode,
        type: vnode.type,
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        next: null,
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
}
function setupStatefulComponent(instance) {
    const setup = instance.type.setup;
    if (setup) {
        const props = instance.props;
        const context = { 'emit': emit.bind(null, instance) };
        setCurrentInstance(instance);
        const setupResult = proxyRefs(setup(shallowReadonly(props), context) || {});
        setCurrentInstance(null);
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
    const { render, template } = instance.type;
    if (render) {
        instance.render = render;
    }
    else if (template) {
        instance.render = compiler(template);
    }
}
function setupProxy(instance) {
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(val) {
    currentInstance = val;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

const queue = [];
let queueFlushPending = true;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(instance) {
    //进入scheduler，通过instance得到更新任务放入队列
    const update = instance.update;
    if (!queue.includes(update)) {
        queue.push(update);
    }
    if (queueFlushPending) {
        queueFlushPending = false;
        //微任务中统一处理queue中的更新任务
        queueFlush();
    }
}
function queueFlush() {
    nextTick(flushJobs);
}
function flushJobs() {
    while (queue.length) {
        const update = queue.shift();
        update();
    }
    queueFlushPending = true;
}

const Fragment = Symbol('Fragment');
const TextNode = Symbol('TextNode');
function createRenderer({ createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText }) {
    function render(vnode, rootContainer) {
        patch(null, vnode, rootContainer, null, null);
    }
    function patch(n1, n2, rootContainer, parentComponent, anchor) {
        const { type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, rootContainer, parentComponent, anchor);
                break;
            case TextNode:
                processText(n1, n2, rootContainer);
                break;
            default: {
                if (isElement(n2)) {
                    processElement(n1, n2, rootContainer, parentComponent, anchor);
                }
                else if (isStatefulComponent(n2)) {
                    processComponent(n1, n2, rootContainer, parentComponent, anchor);
                }
            }
        }
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        //只需要渲染Fragment的children即可
        const { children } = n2;
        if (Array.isArray(children)) {
            mountChildren(children, container, parentComponent, anchor);
        }
        else
            patch(null, children, container, parentComponent, null);
    }
    function processText(n1, n2, rootContainer) {
        const { children } = n2;
        const el = n2.el = document.createTextNode(children);
        rootContainer.append(el);
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            //如果是第一次挂载阶段
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            //更新
            updateComponent(n1, n2);
        }
    }
    function mountComponent(vnode, container, parentComponent, anchor) {
        //将数据收集之后放在实例上统一处理
        const instance = createComponentInstance(vnode, parentComponent);
        //在vnode上记录component
        vnode.component = instance;
        //初始化Component
        setupComponent(instance, container, vnode);
        //对子节点做挂载操作
        setupRenderEffect(instance, container, vnode, anchor);
    }
    function updateComponent(n1, n2) {
        //给n2也赋值component实例和el
        n2.el = n1.el;
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            instance.vnode = n2;
        }
    }
    function shouldUpdateComponent(n1, n2) {
        const { props: prevProps } = n1;
        const { props: nextProps } = n2;
        if (Object.keys(prevProps).length != Object.keys(nextProps).length)
            return true;
        for (const key in nextProps) {
            if (nextProps[key] !== prevProps[key]) {
                return true;
            }
        }
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // 如果是第一次挂载
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            // update
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        //解构
        const { type, props, children } = vnode;
        //创建元素、配置元素、递归调用patch，添加到容器
        const el = hostCreateElement(type);
        //挂到el上
        vnode.el = el;
        //props
        if (props) {
            for (let key in props) {
                hostPatchProp(el, key, props[key]);
            }
        }
        //children
        if (children) {
            if (isArrayChildren(vnode))
                mountChildren(children, el, parentComponent, anchor);
            else if (isTextChild(vnode))
                el.textContent = children;
        }
        //将当前生成好的el添加到container上
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, el, parentComponent, anchor) {
        for (let child of children) {
            patch(null, child, el, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        //给新节点设置el
        const el = (n2.el = n1.el);
        patchProps(n1, n2, el);
        patchChildren(n1, n2, parentComponent, anchor);
    }
    function patchProps(n1, n2, el) {
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        //属性的值发生改变或新增了属性
        for (let key in newProps) {
            if (oldProps[key] != newProps[key]) {
                //调用patchProp接口，将新属性挂载
                hostPatchProp(el, key, newProps[key]);
            }
        }
        //检查旧属性是否有删除
        for (let key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProp(el, key, undefined);
            }
        }
    }
    function patchChildren(n1, n2, parentComponent, anchor) {
        //Array -> Text
        if (isArrayChildren(n1) && isTextChild(n2)) {
            unMountChildren(n1.children);
            const text = n2.children;
            const el = n2.el;
            hostSetElementText(el, text);
        }
        else if (isTextChild(n1) && isArrayChildren(n2)) {
            const el = n2.el;
            hostSetElementText(el, '');
            mountChildren(n2.children, el, parentComponent, anchor);
        }
        else if (isTextChild(n1) && isTextChild(n2)) {
            const text = n2.children;
            const el = n2.el;
            hostSetElementText(el, text);
        }
        else if (isArrayChildren(n1) && isArrayChildren(n2)) {
            const el = n2.el;
            const c1 = n1.children;
            const c2 = n2.children;
            patchKeyedChildren(c1, c2, el, parentComponent, anchor);
        }
    }
    function unMountChildren(children) {
        for (let child of children) {
            const childEl = child.el;
            hostRemove(childEl);
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        console.log('ArrayToArray');
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        //左端对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            console.log('n1', n1);
            console.log('n2', n2);
            console.log(i, e1, e2);
            if (isSameVnode(n1, n2)) {
                //如果相同，则两个子节点进行进一步比较
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else
                break;
            i++;
        }
        //右端对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVnode(n1, n2)) {
                //如果相同，则两个子节点进行进一步比较
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else
                break;
            e1--;
            e2--;
        }
        //第一种情况：新序列有非公共部分，旧序列没有公共部分
        if (i > e1 && e2 > e1) {
            while (i <= e2) {
                //从右向左依次插入
                let nextPos = e2 + 1;
                //当nextPos在c2的范围内时，说明是有锚点的，获得nextPos位置vnode的el
                let anchor = nextPos < c2.length ? c2[nextPos].el : null;
                const n2 = c2[e2];
                patch(null, n2, container, parentComponent, anchor);
                e2--;
            }
        }
        //第二种情况：旧序列有非公共部分，新序列没有非公共部分
        else if (i > e2 && e1 > e2) {
            while (i <= e1) {
                //从右向左依次删除
                const delEl = c1[e1].el;
                hostRemove(delEl);
                e1--;
            }
        }
        //第三种情况，新旧序列都有公共部分，可能会有三种操作——删除、新增、移动
        else {
            //首先对非公共部分根据key属性来做缓存
            const s1 = i;
            const s2 = i;
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            const KeyToNewIndexMap = new Map;
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0); //0代表需要新增
            for (let i = s2; i <= e2; i++) {
                if (c2[i].key) {
                    KeyToNewIndexMap.set(c2[i].key, i);
                }
            }
            //旧序列中的key是否在map中有对应的index
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                let newIndex;
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                if (prevChild.key != null) {
                    newIndex = KeyToNewIndexMap.get(prevChild.key);
                    //根据newIndex去设置newIndexToOldIndexMap
                    newIndexToOldIndexMap[newIndex - s2] = i - s1 + 1;
                }
                else {
                    //如果没有key就只能一个个比对
                    for (let j = s2; j <= e2; j++) {
                        const newChild = c2[j];
                        if (isSameVnode(prevChild, newChild)) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                //newIndex在新序列中没有，删除即可
                if (newIndex == undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    //否则继续递归比对
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            //对newIndexToOldIndexMap做最长递增子序列，得到最长递增子序列的序号
            const newSequenceIndex = getSequence(newIndexToOldIndexMap);
            for (let i = e2 - s2; i >= 0; i--) {
                const nextPos = i + s2 + 1; //锚点在c2中的位置
                const curPos = i + s2; //当前非公共序列元素在c2中的位置
                const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                //不在递增子序列中且在旧序列中存在的节点需要移动
                if (newIndexToOldIndexMap[i] > 0 && newSequenceIndex.indexOf(newIndexToOldIndexMap[i]) == -1) {
                    //移动（插入锚点之前）
                    const el = c2[curPos].el;
                    hostInsert(el, container, anchor);
                }
                //标记为0的节点需要新增
                else if (newIndexToOldIndexMap[i] == 0) {
                    //新增
                    patch(null, c2[curPos], container, parentComponent, anchor);
                }
            }
        }
    }
    function isSameVnode(c1, c2) {
        return c1.type == c2.type && c1.key == c2.key;
    }
    function setupRenderEffect(instance, container, vnode, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                //子vnode数组
                const subTree = (instance.subTree = instance.render.call(instance.proxy, instance.proxy));
                //记录parent
                patch(null, subTree, container, instance, anchor);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                //render之前更新instance
                const { next } = instance;
                if (next) {
                    updateComponentPreRender(instance);
                }
                //子vnode数组
                const subTree = instance.render.call(instance.proxy, instance.proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                //记录parent
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                queueJobs(instance);
            }
        });
    }
    function updateComponentPreRender(instance) {
        instance.vnode = instance.next;
        instance.next = null;
        instance.props = instance.vnode.props;
    }
    return {
        createApp: createAppApi(render)
    };
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
                }
                else {
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

function toDisplayString(value) {
    return String(value);
}

function provide(key, value) {
    const instance = getCurrentInstance();
    const { parent } = instance;
    if (parent) {
        const parentProvides = parent.provides;
        if (key in parentProvides) {
            instance.provides = Object.create(parentProvides);
            instance.provides[key] = value;
        }
        else {
            parentProvides[key] = value;
        }
    }
    else
        instance.provides[key] = value;
}
function inject(key, value) {
    const { parent } = getCurrentInstance();
    if (parent) {
        const parentProvides = parent.provides;
        let res = parentProvides[key];
        if (res == undefined) {
            if (typeof value == 'function') {
                res = value();
            }
            else {
                res = value;
            }
        }
        return res;
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, value) {
    const isOn = (key) => new RegExp('^on[A-Z]').test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
    }
    if (value == undefined || value == null) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, value);
    }
}
function insert(el, container, anchor) {
    container.insertBefore(el, anchor);
}
function remove(childEl) {
    const parent = childEl.parentNode;
    if (parent) {
        parent.removeChild(childEl);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const render = createRenderer({ createElement, patchProp, insert, remove, setElementText });
function createApp(...args) {
    return render.createApp(...args);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createElementBlock: createVNode,
    toDisplayString: toDisplayString,
    nextTick: nextTick,
    createRenderer: createRenderer,
    provide: provide,
    inject: inject,
    getCurrentInstance: getCurrentInstance,
    createTextVNode: createTextVNode,
    renderSlots: renderSlots,
    h: h
});

var NodeType;
(function (NodeType) {
    NodeType[NodeType["INTERPLOTATION"] = 0] = "INTERPLOTATION";
    NodeType[NodeType["SIMPLE_EXPRESSION"] = 1] = "SIMPLE_EXPRESSION";
    NodeType[NodeType["ELEMENT"] = 2] = "ELEMENT";
    NodeType[NodeType["TEXT"] = 3] = "TEXT";
    NodeType[NodeType["COMPOUND"] = 4] = "COMPOUND";
})(NodeType || (NodeType = {}));

const TO_DISPLAY_STRING = 'toDisplayString';
const CREATE_ELEMENT_BLOCK = 'createElementBlock';

function transform(ast, options) {
    const context = createTransformContext(ast, options ? options : {});
    traverseNodes(context.root, context);
    createCodegenNode(ast);
    ast.helpers = Array.from(context.helpers.keys());
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms ? options.nodeTransforms : [],
        helpers: new Map,
        setHelpers(key) {
            if (!context.helpers.has(key)) {
                context.helpers.set(key, 1);
            }
        },
    };
    return context;
}
function createCodegenNode(ast) {
    ast.codegenNode = ast.children[0];
}
function traverseNodes(node, context) {
    const { nodeTransforms } = context;
    if (nodeTransforms.length) {
        for (let nodeTransform of nodeTransforms) {
            nodeTransform(node);
        }
    }
    setHelpersByType(node, context);
    traverseChildren(node, context);
}
function traverseChildren(node, context) {
    if (node.children) {
        for (let child of node.children)
            traverseNodes(child, context);
    }
}
function setHelpersByType(node, context) {
    switch (node.type) {
        case NodeType.INTERPLOTATION:
            context.setHelpers(TO_DISPLAY_STRING);
            break;
        case NodeType.ELEMENT:
            context.setHelpers(CREATE_ELEMENT_BLOCK);
            break;
    }
}

function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    const functionName = 'render';
    const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options'];
    const signature = args.join(',');
    genFunctionPreamble(ast, context);
    push(`return function ${functionName} (${signature})`);
    push(`{ return `);
    genNode(ast.codegenNode, context);
    push(` }`);
    return {
        code: context.code
    };
}
function createCodegenContext() {
    const context = {
        code: '',
        push: (s) => {
            context.code += s;
        },
        helper(str) {
            return `_${str}`;
        }
    };
    return context;
}
function genFunctionPreamble(ast, context) {
    const helpers = ast.helpers;
    if (helpers.length == 0)
        return;
    const { push } = context;
    const VueBinging = 'Vue';
    const aliasHelper = helper => `${helper}: _${helper}`;
    push(`const { ${helpers.map(helper => aliasHelper(helper)).join(',')} } = ${VueBinging}`);
    push('\n');
}
function genNode(node, context) {
    switch (node.type) {
        case NodeType.TEXT:
            genText(node, context);
            break;
        case NodeType.INTERPLOTATION:
            genInterplotation(node, context);
            break;
        case NodeType.SIMPLE_EXPRESSION:
            genExpression(node, context);
            break;
        case NodeType.ELEMENT:
            genElement(node, context);
            break;
        case NodeType.COMPOUND:
            genCompound(node, context);
            break;
    }
}
function genText(node, context) {
    const { push } = context;
    push(`"${node.content}"`);
}
function genInterplotation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(`)`);
}
function genExpression(node, context) {
    const { push } = context;
    push(node.content);
}
function genElement(node, context) {
    const { push, helper } = context;
    const { props, children } = node;
    push(`${helper(CREATE_ELEMENT_BLOCK)}(`);
    push(`"${node.tag}"`);
    if (children.length) {
        genElementProps(props, context);
        genNodeList(children, context);
    }
    push(`)`);
}
function genNodeList(nodes, context) {
    const { push } = context;
    if (nodes.length > 1) {
        push('[');
        for (let i = 0; i < nodes.length; i++) {
            const child = nodes[i];
            genNode(child, context);
        }
        push(']');
    }
    else {
        genNode(nodes[0], context);
    }
}
function genElementProps(props, context) {
    const { push } = context;
    push(`,${props || null},`);
}
function genCompound(node, context) {
    const { children } = node;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        genNode(children[i], context);
        if (i < children.length - 1)
            push('+');
    }
}

function baseParse(content) {
    const context = createParseContext(content);
    return createRoot(parseChildren(context, []));
}
function createParseContext(content) {
    return {
        source: content
    };
}
function createRoot(children) {
    return {
        children
    };
}
function parseChildren(context, ancestors) {
    let nodes = [];
    let node;
    while (!isEnd(context, ancestors)) {
        if (context.source.startsWith('{{')) {
            node = parseInterplotation(context);
        }
        else if (/^<[a-z]+>/i.test(context.source)) {
            node = parseElement(context, ancestors);
        }
        else {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function parseInterplotation(context) {
    const openDelimiter = '{{';
    const closeDelimiter = '}}';
    let closeIndex = context.source.indexOf(closeDelimiter);
    let rawContentLength = closeIndex - openDelimiter.length;
    //掐头
    advanceBy(context, openDelimiter.length);
    //取中
    let content = context.source.slice(0, rawContentLength).trim();
    //去尾
    advanceBy(context, rawContentLength + closeDelimiter.length);
    return {
        type: NodeType.INTERPLOTATION,
        content: {
            type: NodeType.SIMPLE_EXPRESSION,
            content,
        }
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function parseElement(context, ancestors) {
    //取出tag，并将头和尾去掉
    //去头
    const tag = parseTag(context);
    ancestors.push(tag);
    //得到children
    const children = parseChildren(context, ancestors);
    //去尾之前判断尾部标签是否与pop出来的标签一致
    const popTag = ancestors.pop();
    if (!startsWithEndTag(context.source, popTag)) {
        throw new Error(`缺少结束标签</${popTag}>`);
    }
    //去尾
    parseTag(context);
    return {
        type: NodeType.ELEMENT,
        tag,
        children,
    };
}
function parseTag(context, tagType) {
    const match = /^<\/?([a-z]+)>/i.exec(context.source);
    const tag = match[1];
    const content = match[0];
    advanceBy(context, content.length);
    return tag;
}
function parseText(context) {
    const symbols = ['{{', '</', '<'];
    let endIndex = Infinity;
    for (let sym of symbols) {
        let index = context.source.indexOf(sym);
        index == -1 ? index = Infinity : index;
        endIndex = Math.min(index, endIndex);
    }
    endIndex == Infinity ? context.source.length : endIndex;
    const content = context.source.slice(0, endIndex);
    advanceBy(context, endIndex);
    return {
        type: NodeType.TEXT,
        content,
    };
}
function isEnd(context, ancestors) {
    //当字符串空了或遇到parentTag时可以返回true
    const s = context.source;
    if (s.startsWith('</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            let parentTag = ancestors[i];
            if (startsWithEndTag(s, parentTag))
                return true;
        }
        //结束标签开头的情况下没有匹配的开始标签
        const curEndTagArray = /^<\/([a-z]+)>/i.exec(s);
        const curEndTag = curEndTagArray[1];
        throw new Error(`缺少开始标签<${curEndTag}>`);
    }
    return s == '';
}
function startsWithEndTag(s, parentTag) {
    return s.slice(0, parentTag.length + 3) == `</${parentTag}>`;
}

function transformExpression(node) {
    if (node.type === NodeType.INTERPLOTATION) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function transformText(node) {
    if (node.type == NodeType.ELEMENT) {
        const { children } = node;
        for (let i = 0; i < children.length; i++) {
            let start = i;
            let end;
            const compoundNode = { type: NodeType.COMPOUND, children: [] };
            while (children[i] && isText(children[i])) {
                compoundNode.children.push(children[i]);
                i++;
            }
            end = i;
            children.splice(start, end - start, compoundNode);
            i = start + 1;
        }
    }
}
function isText(node) {
    return node.type == NodeType.TEXT || node.type == NodeType.INTERPLOTATION;
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, { nodeTransforms: [transformExpression, transformText] });
    const { code } = generate(ast);
    return code;
}

//库的出口
function compileToFunction(template) {
    const code = baseCompile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

exports.createApp = createApp;
exports.createElementBlock = createVNode;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.nextTick = nextTick;
exports.provide = provide;
exports.reactive = reactive;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.toDisplayString = toDisplayString;
