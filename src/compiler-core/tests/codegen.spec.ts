import { generate } from "../codegen";
import { baseParse } from "../parse";
import { transform, } from "../transform";
import { transformExpression } from "../transforms/transformExpression";
import { transformText } from "../transforms/transformText";

describe('generate code', () => {
  test('text ast generate  code', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  });

  test('interplotation ast generate code', () => {
    const ast = baseParse('{{message}}')
    transform(ast, { nodeTransforms: [transformExpression] })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  });

  test('element ast generate code', () => {
    const ast = baseParse('<div></div>')
    transform(ast, { nodeTransforms: [] })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  });

  test('three types to generate code', () => {
    const ast = baseParse('<div>hi,{{message}}</div>')
    transform(ast, { nodeTransforms: [transformText] })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  });
});