import { NodeType } from "../ast";
import { baseParse } from "../parse";

describe('parse', () => {
  describe('interplotation', () => {
    test('a simple interplotation', () => {
      const ast = baseParse(`{{ message }}`)
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.INTERPLOTATION,
        content: {
          type: NodeType.SIMPLE_EXPRESSION,
          content: 'message',
        }
      })
    });
  });
  describe('element', () => {
    test('a simple element', () => {
      const ast = baseParse(`<div></div>`)
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: 'div',
      })
    });
  });
});