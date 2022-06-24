import { ref } from "../../ref";
import { effect } from "../effect";

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
});
