import { h } from '../../lib/mini-vue.esm.js'
const Foo = {
  render() {
    // ui
    return h(
      "div",
      {
        class: "blue",
      },
      '我是Foo'
    );
  },
}
export const App = {
  setup() {
    return {
      msg: 'world'
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
      // "hi, " + this.msg
      // string
      // "hi, mini-vue"
      // Array
      ['hi',
        h("p", { class: "green" }, "this is"),
        h("p", { class: "yellow" }, "mini-vue"),
        Foo
      ]
    );
  },
}