import { h, renderSlots } from "../../lib/mini-vue.esm.js";

export const Foo = {
  setup() {
    return {
      msg: 'hello App'
    }
  },
  render() {
    // ui
    console.log(this.$slots);
    return h('div',
      {},
      [
        renderSlots(this.$slots, 'header', { msg: this.msg }),
        h('p', {}, 'Foo'),
        renderSlots(this.$slots, 'footer')
      ])
  },
}