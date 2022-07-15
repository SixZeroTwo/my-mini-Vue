const queue: any[] = []
let queueFlushPending = true
const p = Promise.resolve()
export function nextTick(fn) {
  return fn ? p.then(fn) : p
}

export function queueJobs(instance) {
  //进入scheduler，通过instance得到更新任务放入队列
  const update = instance.update
  if (!queue.includes(update)) {
    queue.push(update)
  }
  if (queueFlushPending) {
    queueFlushPending = false
    //微任务中统一处理queue中的更新任务
    queueFlush()
  }
}

function queueFlush() {
  nextTick(flushJobs)
}

function flushJobs() {
  while (queue.length) {
    const update = queue.shift()
    update()
  }
  queueFlushPending = true
}

