import { generate } from "../codegen";
import { baseParse } from "../parse";
import { transform } from "../transform";

describe('generate code', () => {
  test('text ast generate  code', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  });
});