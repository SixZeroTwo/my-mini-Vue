import { ref } from "../../lib/mini-vue.esm.js";
export const App = {
  name: "App",
  setup() {
    const message = ref('mini-vue')
    window.message = message
    return {
      message,
    };
  },
  template: `<div>hi,{{message}}</div>`
};