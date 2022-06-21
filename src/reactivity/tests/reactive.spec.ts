import { reactive } from "../reactive"
describe('reactive', () => {
  it('happy path', () => {
    const obj = { a: 1 }
    const reactiveObj = reactive(obj)
    expect(reactiveObj).not.toBe(obj)//源对象和reactive对象不是同一个对象
    expect(reactiveObj.a).toBe(1)
  })
});