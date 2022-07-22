import { transform } from "./transform"
import { generate } from "./codegen"
import { baseParse } from "./parse"
import { transformExpression } from "./transforms/transformExpression"
import { transformText } from "./transforms/transformText"

export function baseCompile(template) {
  const ast = baseParse(template)
  transform(ast, { nodeTransforms: [transformExpression, transformText] })
  const { code } = generate(ast)
  return code
}