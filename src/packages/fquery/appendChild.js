import Effect from "../Effect"

import curry from "crocks/helpers/curry"
import hasProp from "crocks/predicates/hasProp"
import not from "crocks/logic/not"

import isNode from "./helpers/isNode"

const doesntHaveProp = not(hasProp)
const isNotHTMLNode = not(isNode)

// appendChild :: HTMLNode -> HTMLNode -> Effect String HTMLNode
const appendChild = curry((parent, child) =>
  Effect((err, succ) => {
    if (doesntHaveProp("appendChild", parent))
      return err(
        "appendChild():\nFailed to append to parent because given parent is missing `appendChild` method."
      )

    if (isNotHTMLNode(child))
      return err(
        "appendChild():\nFailed to append child because given child is not an HTMLNode element."
      )

    try {
      parent.appendChild(child)
    } catch (error) {
      return err(error)
    }

    return succ(parent)
  })
)

export default appendChild
