export function generate(ast) {
  const context = createCodegenContext(ast)
  const { push } = context
  const functionName = 'render'
  const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
  const signature = args.join(',')

  push(`return function ${functionName} (${signature})`)
  push(`{ return `)
  genNode(ast, context)
  push(` }`)

  return {
    code: context.code
  }
}
function createCodegenContext(ast) {
  const context = {
    code: '',
    push: (s: string) => {
      context.code += s
    },
  }
  return context
}
function genNode(ast, context) {
  const { push } = context
  push(ast.codegenNode.content)
}

