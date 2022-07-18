import { transform } from "../transform";
import { NodeType } from "../ast";
import { baseParse } from "../parse";
describe('transform', () => {
  test('simple transform -- add \',mini-vue\'', () => {
    const ast = baseParse('<div>hello<p>你好</p>{{ message }}</div>')
    const nodeTransforms = [(node) => {
      if (node.type == NodeType.TEXT) {
        node.content += ',mini-vue'
      }
    }]
    transform(ast, { nodeTransforms })
    expect(ast.children[0]).toStrictEqual({
      type: NodeType.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeType.TEXT,
          content: 'hello,mini-vue'
        },
        {
          type: NodeType.ELEMENT,
          tag: 'p',
          children: [
            {
              type: NodeType.TEXT,
              content: '你好,mini-vue'
            }
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
});