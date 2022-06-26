import { computed } from "../computed";
import { reactive } from "../reactive";
import { effect } from '../effect'
describe('computed', () => {
  it('should return updated value', () => {
    const value = reactive({})
    const cValue = computed(() => value.foo)
    expect(cValue.value).toBe(undefined)
    value.foo = 1
    expect(cValue.value).toBe(1)
  })

  it('should compute lazily', () => {
    const value = reactive({})
    const getter = jest.fn(() => value.foo)
    const cValue = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(undefined)
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute until needed
    value.foo = 1
    expect(getter).toHaveBeenCalledTimes(1)

    // now it should compute
    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(2)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
  /* 
    it('should trigger effect', () => {
      const value = reactive({})
      const cValue = computed(() => value.foo)
      let dummy
      effect(() => {
        dummy = cValue.value
      })
      expect(dummy).toBe(undefined)
      value.foo = 1
      expect(dummy).toBe(1)
    }) */
});