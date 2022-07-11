// 新的是 text
// 老的是 array
import { ref, h } from "../../lib/mini-vue.esm.js";


const prevChildren = [h("div", {}, "A"), h("div", {}, "B")];
const nextChildren = "newChild";
export default {
  name: "TextToArray",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    return {
      isChange,
    };
  },
  render() {
    const self = this;

    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};