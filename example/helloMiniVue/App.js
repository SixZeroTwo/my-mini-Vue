import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  setup() {
    const testFn = (testStr) => { console.log(testStr); }
    const testAddFn = (fn) => fn()
    return {
      msg: 'world',
      testFn,
      testAddFn
    }
  },
  render() {
    // ui
    return h(
      "div",
      {
        id: "root",
        class: "red",
      },
      h(Foo, { count: 1, onTest: this.testFn, onTestAdd: this.testAddFn })
    );
  },
} 
