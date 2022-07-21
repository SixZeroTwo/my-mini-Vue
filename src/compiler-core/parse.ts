import { NodeType } from "./ast"
const enum TagType {
  START,
  END,
}

export function baseParse(content) {
  const context = createParseContext(content)
  return createRoot(parseChildren(context, []))
}

function createParseContext(content) {
  return {
    source: content
  }
}
function createRoot(children) {
  return {
    children
  }
}

function parseChildren(context, ancestors) {
  let nodes: any = []
  let node
  while (!isEnd(context, ancestors)) {
    if (context.source.startsWith('{{')) {
      node = parseInterplotation(context)

    }
    else if (/^<[a-z]+>/i.test(context.source)) {
      node = parseElement(context, ancestors)
    }
    else {
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}

function parseInterplotation(context) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'
  let closeIndex = context.source.indexOf(closeDelimiter)
  let rawContentLength = closeIndex - openDelimiter.length
  //掐头
  advanceBy(context, openDelimiter.length)
  //取中
  let content = context.source.slice(0, rawContentLength).trim()
  //去尾
  advanceBy(context, rawContentLength + closeDelimiter.length)
  return {
    type: NodeType.INTERPLOTATION,
    content: {
      type: NodeType.SIMPLE_EXPRESSION,
      content,
    }
  }
}

function advanceBy(context, length) {
  context.source = context.source.slice(length)
}

function parseElement(context, ancestors) {
  //取出tag，并将头和尾去掉
  //去头
  const tag = parseTag(context, TagType.START)
  ancestors.push(tag)
  //得到children
  const children = parseChildren(context, ancestors)
  //去尾之前判断尾部标签是否与pop出来的标签一致
  const popTag = ancestors.pop()
  if (!startsWithEndTag(context.source, popTag)) {
    throw new Error(`缺少结束标签</${popTag}>`)
  }
  //去尾
  parseTag(context, TagType.END)
  return {
    type: NodeType.ELEMENT,
    tag,
    children,

  }
}

function parseTag(context, tagType) {
  const match: any = /^<\/?([a-z]+)>/i.exec(context.source)
  const tag = match[1]
  const content = match[0]
  advanceBy(context, content.length)
  return tag
}

function parseText(context: any): any {
  const symbols = ['{{', '</', '<']
  let endIndex = Infinity
  for (let sym of symbols) {
    let index = context.source.indexOf(sym)
    index == -1 ? index = Infinity : index
    endIndex = Math.min(index, endIndex)
  }
  endIndex == Infinity ? context.source.length : endIndex
  const content = context.source.slice(0, endIndex)
  advanceBy(context, endIndex)
  return {
    type: NodeType.TEXT,
    content,
  }
}

function isEnd(context, ancestors: any[]) {
  //当字符串空了或遇到parentTag时可以返回true
  const s = context.source
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      let parentTag = ancestors[i]
      if (startsWithEndTag(s, parentTag)) return true
    }
    //结束标签开头的情况下没有匹配的开始标签
    const curEndTagArray: any = /^<\/([a-z]+)>/i.exec(s)
    const curEndTag = curEndTagArray[1]
    throw new Error(`缺少开始标签<${curEndTag}>`)
  }
  return s == ''
}

function startsWithEndTag(s, parentTag) {
  return s.slice(0, parentTag.length + 3) == `</${parentTag}>`
}
