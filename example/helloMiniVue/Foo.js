import { h } from "../../lib/mini-vue.esm.js";
export const Foo = {
  setup(props) {
    props.count += 1
  },
  render() {
    // ui
    return h(
      "div",
      {
        class: "blue",
        onClick: () => {
          this.count += 1
        }
      },
      'count的值是' + this.count
    );
  },
}