import { effect, stop } from '../effect'
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
  //测试scheduler功能
  it('scheduler ', () => {
    let run: any
    let scheduler = function () {
      run = runner
    }
    let foo = reactive({ bar: 1 })
    let bee
    let runner = effect(() => {
      bee = foo.bar + 1
      return 'runner'
    }, {
      scheduler: scheduler
    })
    expect(bee).toBe(2)
    //trigger，执行的不是fn，而是scheduler
    foo.bar++//foo.bar == 2 ，没有执行fn，所以bee还是2 ，执行了scheduler，所以run可以使用
    expect(bee).toBe(2)
    const n = run()//执行run，即执行fn函数，此时bee == foo.bar +1 ==3，且n为fn的返回值
    expect(bee).toBe(3)
    expect(n).toBe('runner')
  });
  //测试stop和onStop
  it('stop and onStop', () => {
    let foo = reactive({ bar: 1 })
    let dummy
    let str = ''
    let onStop = jest.fn(() => { str += 'stop!' })
    let runner = effect(() => {
      dummy = foo.bar
    }, { onStop })
    expect(dummy).toBe(1)
    stop(runner)
    foo.bar++
    //foo.bar++ 如果是这种写法，测试不通过
    expect(dummy).toBe(1)//dummy失去了响应性
    expect(onStop).toBeCalledTimes(1)//onStop被调用
    runner()
    expect(dummy).toBe(2)//dummy恢复响应性
  });
})