const isNode = o =>
  typeof Node === "object"
    ? o instanceof Node
    : o &&
      typeof o === "object" &&
      typeof o.nodeType === "number" &&
      typeof o.nodeName === "string"

export default isNode
