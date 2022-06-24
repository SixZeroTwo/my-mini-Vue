import { isReadonly, readonly, shallowReadonly } from "../reactive";

describe('readonly', () => {
  it('happy path', () => {
    const raw = { foo: 1 }
    let dummy = readonly(raw)
    expect(dummy).not.toBe(raw)
    expect(dummy.foo).toBe(1)
    console.warn = jest.fn()
    dummy.foo = 2
    expect(console.warn).toBeCalledTimes(1)
  });
  test('nested readonly', () => {
    const original = {
      nested: {
        foo: 1
      },
      arr: [{ bar: 1 }]
    }
    const observed = readonly(original)
    expect(isReadonly(observed.nested)).toBe(true)
    expect(isReadonly(observed.arr[0])).toBe(true)
    observed.nested.foo = 2
    expect(observed.nested.foo).not.toBe(2)
  })
});

describe('isReadonly', () => {
  it('happy path', () => {
    const foo = readonly({ bar: 1 })
    const dummy = {}
    expect(isReadonly(foo)).toBe(true)
    expect(isReadonly(dummy)).toBe(false)
  });
})

describe('shallowReadonly', () => {
  test('nested readonly', () => {
    const original = {
      nested: {
        foo: 1
      },
      arr: [{ bar: 1 }]
    }
    const observed = shallowReadonly(original)
    expect(isReadonly(observed.nested)).toBe(false)
    expect(isReadonly(observed.arr[0])).toBe(false)
    observed.nested.foo = 2
    expect(observed.nested.foo).toBe(2)
  })
});