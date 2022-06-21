import { effect } from '../effect'
import { reactive } from "../reactive"
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)
    //update
    user.age++
    expect(nextAge).toBe(12)
  })
  //测试返回runner的功能
  it('return runner', () => {
    let foo = 1
    let fn = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(2)
    const n = fn()
    expect(foo).toBe(3)
    expect(n).toBe('foo')
  });
})