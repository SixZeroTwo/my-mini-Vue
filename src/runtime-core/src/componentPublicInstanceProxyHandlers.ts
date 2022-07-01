export const publicInstanceProxyHandlers = {
  get({ _ }, key) {
    const instance = _
    if (key in instance.setupState) {
      return instance.setupState[key]
    }
    if (key == '$el') {
      return instance.el
    }
  },
}