import { NodeType } from "./ast"
import { CREATE_ELEMENT_BLOCK, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function transform(ast, options?) {
  const context = createTransformContext(ast, options ? options : {})
  traverseNodes(context.root, context)
  createCodegenNode(ast)
  ast.helpers = Array.from(context.helpers.keys())
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms ? options.nodeTransforms : [],
    helpers: new Map,
    setHelpers(key) {
      if (!context.helpers.has(key)) {
        context.helpers.set(key, 1)
      }
    },
  }
  return context
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

  setHelpersByType(node, context)

  traverseChildren(node, context)
}

function traverseChildren(node, context) {
  if (node.children) {
    for (let child of node.children) traverseNodes(child, context)
  }
}

function setHelpersByType(node, context) {
  switch (node.type) {
    case NodeType.INTERPLOTATION:
      context.setHelpers(TO_DISPLAY_STRING)
      break
    case NodeType.ELEMENT:
      context.setHelpers(CREATE_ELEMENT_BLOCK)
      break
  }
}

