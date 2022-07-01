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
    window.self = this
    // ui
    return h(
      "div",
      {
        id: "root",
        class: "red",
      },
      `hello ${this.msg}`,
    );
  },
}