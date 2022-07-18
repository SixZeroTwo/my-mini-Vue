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

    test('case 2 of three types joined', () => {
      const ast = baseParse(`<div><p>hello</p>{{ message }}</div>`)
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: 'div',
        children: [
          {
            type: NodeType.ELEMENT,
            tag: 'p',
            children: [
              {
                type: NodeType.TEXT,
                content: 'hello',
              },
            ]
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
    test('case 1 of wrong use of tags', () => {
      expect(() => {
        baseParse('<div><span></div>')
      }).toThrowError('缺少结束标签</span>')
    });

    test('case 2 of wrong use of tags', () => {
      expect(() => {
        baseParse('<div></span></div>')
      }).toThrowError('缺少开始标签<span>')
    });
  });
});