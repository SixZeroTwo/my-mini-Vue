import { h, renderSlots } from "../../lib/mini-vue.esm.js";

export const Foo = {
  setup() {
    return {

    }
  },
  render() {
    // ui
    console.log(this.$slots);
    return h('div', {}, [h('p', {}, 'Foo'), renderSlots(this.$slots)])
  },
}