import Effect from "../Effect"

import compose from "crocks/helpers/compose"
import either from "crocks/pointfree/either"
import isString from "crocks/predicates/isString"
import safe from "crocks/Maybe/safe"
import tryCatch from "crocks/Result/tryCatch"

import doc from "./doc"

// createElement :: String -> Effect String HTMLElement
const createElement = tagName =>
  doc.chain(d =>
    Effect((err, succ) =>
      safe(isString, tagName).either(
        () =>
          err(
            "createElement()\nFailed to create HTML Element because the given tag name value is not a String"
          ),
        compose(
          either(err, succ),
          tryCatch(t => d.createElement(t))
        )
      )
    )
  )

export default createElement
