import and from "crocks/logic/and"
import append from "ramda/src/append"
import applyTo from "crocks/combinators/applyTo"
import compose from "crocks/helpers/compose"
import concat from "crocks/pointfree/concat"
import constant from "crocks/combinators/constant"
import curry from "crocks/helpers/curry"
import either from "crocks/pointfree/either"
import flip from "crocks/combinators/flip"
import init from "ramda/src/init"
import isArray from "crocks/predicates/isArray"
import isString from "crocks/predicates/isString"
import join from "ramda/src/join"
import last from "ramda/src/last"
import map from "crocks/pointfree/map"
import not from "crocks/logic/not"
import safe from "crocks/Maybe/safe"
import trim from "ramda/src/trim"
import when from "crocks/logic/when"

const isNotArray = not(isArray)
const isNotString = not(isString)

const errorMsg = curry((fnName, msg) => {
  when(
    and(isNotString, isNotArray),
    () => {
      throw new TypeError(
        "errorMsg(): Failed to create ErrorMsg as the second argument must be a String or an Array of Strings."
      )
    },
    msg
  )

  if (isNotArray(msg)) msg = [msg]

  // appendToError :: String -> ErrorMsg
  const appendToError = compose(
    either(
      () => {
        throw new TypeError(
          "errorMsg.append(): Failed to append to error message as given value is not a String."
        )
      },
      compose(
        errorMsg(fnName),
        applyTo(init(msg)),
        append,
        applyTo(last(msg)),
        concat,
        flip(concat, " "),
        trim
      )
    ),
    safe(isString)
  )

  // newLine :: String -> ErrorMsg
  const newLine = compose(
    either(() => {
      throw new TypeError(
        "errorMsg.newLine(): Failed to append new line to error message as given value is not a String."
      )
    }, errorMsg(fnName)),
    map(applyTo(msg)),
    map(append),
    safe(isString)
  )

  // print :: () -> String
  const print = compose(
    join("\n"),
    concat(msg),
    constant([fnName])
  )

  return {
    append: appendToError,
    newLine,
    print
  }
})

export default errorMsg
