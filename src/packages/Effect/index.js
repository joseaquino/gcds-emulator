import Result from "crocks/Result"

import identity from "crocks/combinators/identity"
import isFunction from "crocks/predicates/isFunction"
import isSameType from "crocks/predicates/isSameType"
import not from "crocks/logic/not"
import typeToString from "crocks/core/type"

const isNotFunction = not(isFunction)
const isNotResultType = not(isSameType(Result))
const isNotEffect = not(isSameType(Effect))

const type = () => "Effect"

/**
 * Todo:
 * - [X] Revert back for map function to require a Result value to be returned
 * - [X] Make that wrapped function receives two params, one for error and another for success
 * - [ ] Implement the ap functionality
 * - [ ] Implement the bimap functionality
 * - [X] Provie static propery for Success and Failed
 */
function Effect(fn) {
  if (isNotFunction(fn)) {
    throw new TypeError(
      `Effect: Failed to construct Effect as given value is not a function.\nExpected: Function\nReceived: ${typeToString(
        fn
      )}`
    )
  }

  // bind the given function with the error and success functions for when it needs to be called
  // they are already populated
  fn = fn.bind(null, Result.Err, Result.Ok)

  // chain :: (a -> Effect e b) -> Effect e b
  function chain(mappingFn) {
    let error = "Effect.chain(): Failed to chain over effect because"

    if (isNotFunction(mappingFn)) {
      throw new TypeError(
        `${error} the value given to chain is not a function.\nExpected: Function\nReceived: ${typeToString(
          mappingFn
        )}`
      )
    }

    return Effect(() => {
      let returnedVal = fn()

      if (isNotResultType(returnedVal)) {
        throw new TypeError(
          `${error} the value returned by the wrapped effect is not of type Result.\nExpected: Result\nReceived: ${typeToString(
            mappingFn
          )}`
        )
      }

      returnedVal = returnedVal.either(
        e => Effect((err, _) => err(e)),
        mappingFn
      )

      if (isNotEffect(returnedVal)) {
        throw new TypeError(
          `${error} function given to chain did not return an Effect type.\nExpected: Effect\nReceived: ${typeToString(
            returnedVal
          )}`
        )
      }

      return returnedVal.fork(Result.Err, Result.Ok)
    })
  }

  // fork :: (e -> b) -> (a -> b) -> b
  function fork(failure, successful) {
    const error = "Effect.fork(): Failed to fork effect because"
    if (isNotFunction(failure)) {
      throw new TypeError(
        `${error} the first value given to fork is not a function.\nExpected: Function\nReveceived: ${typeToString(
          failure
        )}`
      )
    }

    if (isNotFunction(successful)) {
      throw new TypeError(
        `${error} the second value given to fork is not a function.\nExpected: Function\nReceived: ${typeToString(
          successful
        )}`
      )
    }

    let result = fn()

    if (isNotResultType(result)) {
      throw new TypeError(
        `${error} returned value by wrapped effect is not of type Result.\nExpected: Result\nReceived: ${typeToString(
          result
        )}`
      )
    }

    return result.either(failure, successful)
  }

  // map :: (a -> b) -> Effect e b
  function map(mappingFn) {
    const error = "Effect.map(): Failed to map over effect because"

    if (isNotFunction(mappingFn)) {
      throw new TypeError(
        `${error} the value given to map is not a function.\nExpected: Function\nReceived: ${typeToString(
          mappingFn
        )}`
      )
    }

    return Effect(() => {
      let returnedVal = fn()

      if (isNotResultType(returnedVal)) {
        throw new TypeError(
          `${error} the value returned by the wrapped effect is not of type Result.\nExpected: Result\nReceived: ${typeToString(
            returnedVal
          )}`
        )
      }

      return returnedVal.map(mappingFn)
    })
  }

  // run :: (e -> a) -> a
  function run(errFn) {
    const error = "Effect.run(): Failed to run effect because"

    if (isNotFunction(errFn)) {
      throw new TypeError(
        `${error} value given to run is not a function.\nExpected: Function\nReceived: ${typeToString(
          errFn
        )}`
      )
    }

    let returnedVal = fn()

    if (isNotResultType(returnedVal)) {
      throw new TypeError(
        `${error} the value returned by the wrapped effect is not of type Result.\nExpected: Result\nReceived: ${typeToString(
          returnedVal
        )}`
      )
    }

    return returnedVal.either(errFn, identity)
  }

  return {
    fork,
    map,
    chain,
    run,
    constructor: Effect,
    type
  }
}

// of :: a -> Effect _ a
Effect.of = val => Effect((_, succ) => succ(val))

// type :: () -> String
Effect.type = type

// Success :: a -> Result _ a
Effect.Success = Result.Ok

// Failed :: e -> Result e _
Effect.Failed = Result.Err

export default Effect
