import { createTextVNode, getCurrentInstance, h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  setup() {
    console.log(getCurrentInstance());
    return {
    }
  },
  render() {
    const app = h('div', {}, 'App')
    const foo = h(Foo,
      {},
      {
        header: ({ msg }) => h('p', {}, '插槽1' + msg),
        footer: () => [
          h('p', {}, '插槽2'),
          h('p', {}, '插槽3'),
          createTextVNode('一个文本节点')]
      })
    // ui
    return h('div', {}, [app, foo])
  },
} 
