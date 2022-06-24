import { isProxy, isReactive, reactive, readonly, shallowReactive } from "../reactive"
describe('reactive', () => {
  it('happy path', () => {
    const obj = { a: 1, b: { val: 3 } }
    const reactiveObj = reactive(obj)
    expect(reactiveObj).not.toBe(obj)//源对象和reactive对象不是同一个对象
    expect(reactiveObj.a).toBe(1)
  })
  test('nested reactive', () => {
    const original = {
      nested: {
        foo: 1
      },
      arr: [{ bar: 1 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.arr[0])).toBe(true)
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
describe('isProxy', () => {
  it('happy path', () => {
    const dummy = { bar: 1 }
    const foo = reactive(dummy)
    const bee = readonly(dummy)
    expect(isProxy(foo)).toBe(true)
    expect(isProxy(bee)).toBe(true)
    expect(isProxy(dummy)).toBe(false)
  });
});
describe('shallowReactive', () => {
  test('nested reactive', () => {
    const original = {
      nested: {
        foo: 1
      },
      arr: [{ bar: 1 }]
    }
    const observed = shallowReactive(original)
    expect(isReactive(observed.nested)).toBe(false)
    expect(isReactive(observed.arr[0])).toBe(false)
  })
});
