import { isReactive, reactive } from "../reactive"
describe('reactive', () => {
  it('happy path', () => {
    const obj = { a: 1, b: { val: 3 } }
    const reactiveObj = reactive(obj)
    expect(reactiveObj).not.toBe(obj)//源对象和reactive对象不是同一个对象
    expect(reactiveObj.a).toBe(1)
  })
});

describe('isReactive', () => {
  it('happy path', () => {
    const foo = reactive({ bar: 1 })
    const dummy = {}
    expect(isReactive(foo)).toBe(true)
    expect(isReactive(dummy)).toBe(false)
  });
}) 