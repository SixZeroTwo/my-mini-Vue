import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  setup() {
    return {
    }
  },
  render() {
    const app = h('div', {}, 'App')
    const foo = h(Foo, {}, [h('p', {}, '插槽1'), h('p', {}, '插槽2')])
    // ui
    return h('div', {}, [app, foo])
  },
} 
