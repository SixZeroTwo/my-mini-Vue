export const publicInstanceProxyHandlers = {
  get({ _ }, key) {
    const instance = _
    if (key in instance.props) {
      return instance.props[key]
    }
    if (key in instance.setupState) {
      return instance.setupState[key]
    }
    if (key == '$el') {
      return instance.el
    }
    if (key == '$slots') {
      return instance.slots
    }
    if (key == '$props') {
      return instance.props
    }
  },
}