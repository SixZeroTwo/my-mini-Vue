import { isRef, ref, unRef } from "../../ref";
import { effect } from "../effect";
import { reactive } from "../reactive";

describe('ref', () => {
  test('happy path', () => {
    const foo = ref(1)
    expect(foo.value).toBe(1)
  })
  test('ref make value reactive', () => {
    const foo = ref(1)
    let dummy
    let fn = jest.fn(() => {
      dummy = foo.value
    })
    effect(fn)
    expect(dummy).toBe(1)
    expect(fn).toBeCalledTimes(1)
    foo.value = 2
    expect(dummy).toBe(2)
    expect(fn).toBeCalledTimes(2)
    //赋旧值不触发依赖
    foo.value = 2
    expect(dummy).toBe(2)
    expect(fn).toBeCalledTimes(2)
  })
  test('make nested properties reactive', () => {
    const foo = ref({ bar: 1 })
    let dummy
    effect(() => {
      dummy = foo.value.bar
    })
    foo.value.bar++
    expect(dummy).toBe(2)
  })
  test('deconstruct', () => {
    const foo = ref({ bar: 1 })
    const bee = ref(1)
    let dummy
    const fn = jest.fn(() => {
      dummy = foo.value.bar
      dummy = bee.value + 1
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    let a = foo.value
    let b = bee.value
    a.bar = 2
    expect(fn).toBeCalledTimes(2)
    b = 3
    expect(fn).toBeCalledTimes(2)
  })
  test('isRef and unRef', () => {
    const foo = ref(1)
    const bar = reactive({ a: 1 })
    expect(isRef(foo)).toBe(true)
    expect(isRef(bar)).toBe(false)
    expect(unRef(foo)).toBe(1)
  })
});
