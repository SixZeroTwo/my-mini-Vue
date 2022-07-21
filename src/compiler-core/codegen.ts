import { NodeType } from "./ast"
import { CREATE_ELEMENT_BLOCK, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context
  const functionName = 'render'
  const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
  const signature = args.join(',')

  genFunctionPreamble(ast, context)


  push(`return function ${functionName} (${signature})`)
  push(`{ return `)
  genNode(ast.codegenNode, context)
  push(` }`)

  return {
    code: context.code
  }
}
function createCodegenContext() {
  const context = {
    code: '',
    push: (s: string) => {
      context.code += s
    },
    helper(str) {
      return `_${str}`
    }
  }
  return context
}

function genFunctionPreamble(ast, context) {
  const helpers = ast.helpers
  if (helpers.length == 0) return
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = helper => `${helper}: _${helper}`
  push(`const { ${helpers.map(helper => aliasHelper(helper)).join(',')} } = ${VueBinging}`)
  push('\n')
}

function genNode(node, context) {
  switch (node.type) {
    case NodeType.TEXT:
      genText(node, context)
      break
    case NodeType.INTERPLOTATION:
      genInterplotation(node, context)
      break
    case NodeType.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeType.ELEMENT:
      genElement(node, context)
      break
    case NodeType.COMPOUND:
      genCompound(node, context)
      break
  }
}

function genText(node, context) {
  const { push } = context
  push(`"${node.content}"`)
}

function genInterplotation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(`)`)
}

function genExpression(node, context) {
  const { push } = context
  push(node.content)
}

function genElement(node, context) {
  const { push, helper } = context
  const { props, children } = node
  push(`${helper(CREATE_ELEMENT_BLOCK)}(`)
  push(`"${node.tag}"`)
  if (children.length) {
    genElementProps(props, context)
    genNodeList(children, context)
  }
  push(`)`)
}

function genNodeList(nodes, context) {
  const { push } = context
  if (nodes.length > 1) {
    push('[')
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i]
      genNode(child, context)
    }
    push(']')
  } else {
    genNode(nodes[0], context)
  }
}

function genElementProps(props, context) {
  const { push } = context
  push(`,${props || null},`)
}

function genCompound(node, context) {
  const { children } = node
  const { push } = context
  for (let i = 0; i < children.length; i++) {
    genNode(children[i], context)
    if (i < children.length - 1) push('+')
  }
}

