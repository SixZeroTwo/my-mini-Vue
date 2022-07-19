
export function transform(ast, options?) {
  const context = createTransformContext(ast, options ? options : {})
  createCodegenNode(ast)
  traverseNodes(context.root, context)
}

function createTransformContext(root, options) {
  return {
    root,
    nodeTransforms: options.nodeTransforms ? options.nodeTransforms : []
  }
}

function createCodegenNode(ast) {
  ast.codegenNode = ast.children[0]
}

function traverseNodes(node, context) {
  const { nodeTransforms } = context
  if (nodeTransforms.length) {
    for (let nodeTransform of nodeTransforms) {
      nodeTransform(node)
    }
  }
  traverseChildren(node, context)

}

function traverseChildren(node, context) {
  if (node.children) {
    for (let child of node.children) traverseNodes(child, context)
  }
}

