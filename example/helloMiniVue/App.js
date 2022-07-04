import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  setup() {
    return {
      msg: 'world'
    }
  },
  render() {
    window.self = this
    // ui
    return h(
      "div",
      {
        id: "root",
        class: "red",
      },
      h(Foo, { count: 1 })
    );
  },
} 
