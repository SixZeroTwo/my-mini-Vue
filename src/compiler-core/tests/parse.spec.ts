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
        children: [],
      })
    });
  });

  describe('text', () => {
    test('a simple text', () => {
      const ast = baseParse(`some text`)
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.TEXT,
        content: 'some text',
      })
    });
  });

  describe('joined case', () => {
    test('case of three types joined', () => {
      const ast = baseParse(`<div>hello{{ message }}</div>`)
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: 'div',
        children: [
          {
            type: NodeType.TEXT,
            content: 'hello',
          },
          {
            type: NodeType.INTERPLOTATION,
            content: {
              type: NodeType.SIMPLE_EXPRESSION,
              content: 'message',
            }
          }
        ]
      })
    });
  });
});