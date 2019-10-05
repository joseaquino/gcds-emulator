import Effect from "../Effect"

import curry from "crocks/helpers/curry"

import isFunction from "crocks/predicates/isFunction"
import isString from "crocks/predicates/isString"
import not from "crocks/logic/not"

const isNotString = not(isString)
const isNotFunction = not(isFunction)

const errors = {
  invalidAttributeName: "the given attribute name is not a valid String.",
  invalidAttributeValue: "the given attribute value is not a valid String.",
  missingSetAttribute:
    "the given element object is missing the function setAttribute."
}

const makeError = reason =>
  [
    "setElementAttribute()",
    "Failed to add attribute to element because " + reason.trim()
  ].join("\n")

// setElementAttribute :: String -> a -> HTMLElement -> Effect String HTMLElement
const setElementAttribute = curry((attrName, val, elem) =>
  Effect((err, succ) => {
    if (isNotString(attrName))
      return err(makeError(errors.invalidAttributeName))

    if (isNotString(val)) return err(makeError(errors.invalidAttributeValue))

    if (isNotFunction(elem.setAttribute))
      return err(makeError(errors.missingSetAttribute))

    try {
      elem.setAttribute(attrName, val)
    } catch (error) {
      return err(error)
    }

    return succ(elem)
  })
)

export default setElementAttribute
