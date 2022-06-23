import { isReadonly, readonly } from "../reactive";

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
});

describe('isReadonly', () => {
  it('happy path', () => {
    const foo = readonly({ bar: 1 })
    const dummy = {}
    expect(isReadonly(foo)).toBe(true)
    expect(isReadonly(dummy)).toBe(false)
  });
}) 