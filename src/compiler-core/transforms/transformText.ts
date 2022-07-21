import { NodeType } from "../ast";

export function transformText(node) {
  if (node.type == NodeType.ELEMENT) {
    const { children } = node
    for (let i = 0; i < children.length; i++) {
      let start = i
      let end
      const compoundNode: any = { type: NodeType.COMPOUND, children: [] }
      while (children[i] && isText(children[i])) {
        compoundNode.children.push(children[i])
        i++
      }
      end = i
      children.splice(start, end - start, compoundNode)
      i = start + 1
    }
  }
}

function isText(node) {
  return node.type == NodeType.TEXT || node.type == NodeType.INTERPLOTATION
}