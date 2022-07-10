import { h, ref } from "../../lib/mini-vue.esm.js"

export const App = {
  name: 'App',
  setup() {
    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })
    const changeFoo = () => { props.value.foo = 'new_foo' }
    const delFoo = () => { props.value = { bar: 'bar' } }
    const setBarUd = () => { props.value.bar = undefined }
    return {
      props,
      changeFoo,
      delFoo,
      setBarUd
    }
  },
  render() {
    return h('div',
      { ...this.props },
      [
        h('button', { onClick: this.changeFoo }, '改变foo属性的值'),
        h('button', { onClick: this.delFoo }, '删除foo属性'),
        h('button', { onClick: this.setBarUd }, '改变bar属性的值为undefined'),
      ])
  }
}