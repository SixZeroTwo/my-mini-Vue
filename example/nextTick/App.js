import { getCurrentInstance, h, ref } from "../../lib/mini-vue.esm.js";
import { nextTick } from "../../lib/mini-vue.esm.js";
export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const instance = getCurrentInstance()
    const onClick = () => {

      for (let i = 1; i <= 100; i++) {
        count.value++
      }
      nextTick(() => {
        console.log(instance);
      })
    };

    return {
      count,
      onClick,
    };
  },
  render() {
    return h(
      "div",
      {
        id: "root",
      },
      [
        h("div", {}, "count:" + this.count), // 依赖收集
        h(
          "button",
          {
            onClick: this.onClick,
          },
          "click"
        ),
      ]
    );
  },
};