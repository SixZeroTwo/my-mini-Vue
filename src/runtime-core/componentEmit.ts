export function emit(instance, event, ...args) {
  const { props } = instance
  const handler = props[eventToHandler(event)]
  handler && handler(...args)
  function eventToHandler(event: string): string {
    event = event.replace(/-\w/g, str => str[1].toUpperCase())
    return 'on' + event[0].toUpperCase() + event.slice(1)
  }
}





