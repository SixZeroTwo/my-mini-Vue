import { h } from "../../lib/mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    return {
      clickFn: () => {
        const testStr = 'this is a test emit'
        emit('test', testStr)
        emit('test-add', () => { console.log(1 + 2); })
      }
    }
  },
  render() {
    // ui
    const btn = h('button', { onClick: this.clickFn }, '按钮')
    return h(
      "div",
      {
        class: "blue",
      },
      btn
    );
  },
}