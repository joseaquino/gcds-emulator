import Effect from "./index"
import Result from "crocks/Result"

import constant from "crocks/combinators/constant"
import identity from "crocks/combinators/identity"
import isFunction from "crocks/predicates/isFunction"
import isObject from "crocks/predicates/isObject"
import isSameType from "crocks/predicates/isSameType"
import unit from "crocks/helpers/unit"

describe("Effect :: (() -> Result e a) -> Effect e a", () => {
  test("Construction", () => {
    let eff = Effect(constant(Result.Ok(1)))

    // Effect should be a function
    expect(isFunction(Effect)).toEqual(true)
    // After calling Effect it should return an object
    expect(isObject(eff)).toEqual(true)
    // Provides TypeRep on constructor of Effect
    expect(eff.constructor).toEqual(Effect)
    // Should provide an of function
    expect(isFunction(Effect.of)).toEqual(true)
    // Should provide a type function
    expect(isFunction(Effect.type)).toEqual(true)
    // Should provide a Success function
    expect(isFunction(Effect.Success)).toEqual(true)
    // Provided Success function should be alias of Result.Ok
    expect(Effect.Success).toEqual(Result.Ok)
    // Should provide a Failed function
    expect(isFunction(Effect.Failed)).toEqual(true)
    // Provided Failed function should be alias of Result.Err
    expect(Effect.Failed).toEqual(Result.Err)

    let mockedFn = jest.fn((_, succ) => succ(20))
    Effect(mockedFn).run(identity)

    // The wrapped effectful function must be called with the first arg being the error Result constructor
    expect(isSameType(mockedFn.mock.calls[0][0], Result.Err)).toEqual(true)
    // The wrapped effectful function must be called with the second arg being the success Resuls contructor
    expect(isSameType(mockedFn.mock.calls[0][1], Result.Ok)).toEqual(true)
  })

  test("Construction errors", () => {
    let eff = x => () => Effect(x)
    let err = /^Effect:.+given value is not a function/

    expect(eff(undefined)).toThrowError(err)
    expect(eff(null)).toThrowError(err)
    expect(eff(0)).toThrowError(err)
    expect(eff(1)).toThrowError(err)
    expect(eff("")).toThrowError(err)
    expect(eff("string")).toThrowError(err)
    expect(eff(true)).toThrowError(err)
    expect(eff(false)).toThrowError(err)
    expect(eff([])).toThrowError(err)
    expect(eff({})).toThrowError(err)

    expect(eff(unit)).not.toThrowError()
  })

  test("map() functionality", () => {
    let val = 37
    let mockMappingFn = jest.fn(x => x + 10)
    let errorHandle = jest.fn(constant("Something went wrong!"))
    let successfulEffect = Effect((_, succ) => succ(val)).map(mockMappingFn)

    // Should deffer the calling of the mapped function until the effect runs
    expect(mockMappingFn).not.toHaveBeenCalled()
    // The map function should return a new Effect
    expect(successfulEffect.constructor).toEqual(Effect)

    let successResult = successfulEffect.run(errorHandle)

    // After the effect runs, it should have called the mapped function
    expect(mockMappingFn).toHaveBeenCalledTimes(1)
    // The mapped function should be called with the value returned by previous effect
    expect(mockMappingFn).toHaveBeenCalledWith(val)
    // The final value of the effect should be the one returned by the mapped function
    expect(successResult).toEqual(mockMappingFn(val))

    let neverCalledFn = jest.fn(constant("This should not be called"))
    let failedEffect = Effect((err, _) => err("FAILED"))
      .map(neverCalledFn)
      .map(neverCalledFn)

    let failureResult = failedEffect.run(errorHandle)

    // When an error is returned by previous effect it should not call the mapped function
    expect(neverCalledFn).not.toHaveBeenCalled()
    // Error handler should be called when the effect has returned a failure
    expect(errorHandle).toHaveBeenCalledTimes(1)
    // Error handler should be called with the value returned inside the failure
    expect(errorHandle).toHaveBeenCalledWith("FAILED")
    // The final value should be the one returned by the error handler
    expect(failureResult).toEqual("Something went wrong!")
  })

  test("map() errors", () => {
    let map = x => () => Effect((_, succ) => succ(1)).map(x)
    let err = /^Effect\.map\(\):.+value given to map is not a function\./

    expect(map(undefined)).toThrowError(err)
    expect(map(null)).toThrowError(err)
    expect(map(0)).toThrowError(err)
    expect(map(1)).toThrowError(err)
    expect(map("")).toThrowError(err)
    expect(map("string")).toThrowError(err)
    expect(map(true)).toThrowError(err)
    expect(map(false)).toThrowError(err)
    expect(map([])).toThrowError(err)
    expect(map({})).toThrowError(err)
    expect(map(unit)).not.toThrowError()

    let run = x => () =>
      Effect(constant(x))
        .map(identity)
        .run(unit)
    let errorNotResultType = /^Effect\.map\(\):.+the value returned by the wrapped effect is not of type Result\./

    expect(run(undefined)).toThrowError(errorNotResultType)
    expect(run(null)).toThrowError(errorNotResultType)
    expect(run(0)).toThrowError(errorNotResultType)
    expect(run(1)).toThrowError(errorNotResultType)
    expect(run("")).toThrowError(errorNotResultType)
    expect(run("string")).toThrowError(errorNotResultType)
    expect(run(true)).toThrowError(errorNotResultType)
    expect(run(false)).toThrowError(errorNotResultType)
    expect(run([])).toThrowError(errorNotResultType)
    expect(run({})).toThrowError(errorNotResultType)
    expect(run(Result.Ok(1))).not.toThrowError()
  })

  test("fork() functionality", () => {
    let ok = jest.fn(constant("Success"))
    let err = jest.fn(constant("Failed"))

    let successEffect = Effect(() => Result.Ok(37)).fork(err, ok)

    // It should call the second function given to fork when effects runs successfully
    expect(ok.mock.calls.length).toEqual(1)
    // Successfull function should be called with the value wrapped in the effect
    expect(ok.mock.calls[0][0]).toEqual(37)
    // The final value should be the return value of the successful function
    expect(successEffect).toEqual("Success")
    // It should not call the first function given to fork when effect was successful
    expect(err.mock.calls.length).toEqual(0)

    ok.mockClear()
    err.mockClear()

    let failedEffect = Effect(() => Result.Err("Something went wrong!")).fork(
      err,
      ok
    )

    // It should call the first function given to fork when effect failed
    expect(err.mock.calls.length).toEqual(1)
    // It should call the first function with the failure value wrapped in the effect
    expect(err.mock.calls[0][0]).toEqual("Something went wrong!")
    // The final returned value should be the value returned by the failure function
    expect(failedEffect).toEqual("Failed")
    // It should not call the second function given to fork when effect failed
    expect(ok.mock.calls.length).toEqual(0)
  })

  test("fork() errors", () => {
    let result = Effect(() => Result.Ok(37))
    let callFork = (x, y) => () => result.fork(x, y)
    let callEffect = x => () => Effect(x).fork(unit, unit)

    let errFail = /^Effect\.fork\(\):.+the first value given to fork is not a function/
    let errSucc = /^Effect\.fork\(\):.+the second value given to fork is not a function/
    let errNotResultType = /^Effect\.fork\(\):.+returned value by wrapped effect is not of type Result/

    expect(callFork(undefined, unit)).toThrowError(errFail)
    expect(callFork(null, unit)).toThrowError(errFail)
    expect(callFork(0, unit)).toThrowError(errFail)
    expect(callFork(1, unit)).toThrowError(errFail)
    expect(callFork("", unit)).toThrowError(errFail)
    expect(callFork("string", unit)).toThrowError(errFail)
    expect(callFork(true, unit)).toThrowError(errFail)
    expect(callFork(false, unit)).toThrowError(errFail)
    expect(callFork([], unit)).toThrowError(errFail)
    expect(callFork({}, unit)).toThrowError(errFail)

    expect(callFork(unit, undefined)).toThrowError(errSucc)
    expect(callFork(unit, null)).toThrowError(errSucc)
    expect(callFork(unit, 0)).toThrowError(errSucc)
    expect(callFork(unit, 1)).toThrowError(errSucc)
    expect(callFork(unit, "")).toThrowError(errSucc)
    expect(callFork(unit, "string")).toThrowError(errSucc)
    expect(callFork(unit, true)).toThrowError(errSucc)
    expect(callFork(unit, false)).toThrowError(errSucc)
    expect(callFork(unit, [])).toThrowError(errSucc)
    expect(callFork(unit, {})).toThrowError(errSucc)

    expect(callEffect(unit)).toThrowError(errNotResultType)
    expect(callEffect(constant(Result.Ok(1)))).not.toThrowError()

    expect(callFork(unit, unit)).not.toThrowError()
  })

  test("run() functionality", () => {
    let add = x => y => x + y
    let errMsg = "Something went wrong"
    let successfulEffect = jest.fn((_, succ) => succ(10))
    let failedEffect = jest.fn((err, _) => err(errMsg))
    let errorHandle = jest.fn(constant(-1))
    let neverCalled = jest.fn(constant("This should never be returned"))

    // run should be a function
    expect(isFunction(Effect(successfulEffect).run)).toEqual(true)
    // It should returned the final value when there are no returned errors in the effect
    expect(Effect(successfulEffect).run(errorHandle)).toEqual(10)
    // The wrapped function should have been called once
    expect(successfulEffect).toHaveBeenCalledTimes(1)
    // The wrapped function should have been called with error and success Result constructors
    expect(successfulEffect).toHaveBeenCalledWith(Result.Err, Result.Ok)
    // When effect has been mapped it should return the value returned by applying the last map
    expect(
      Effect(successfulEffect)
        .map(add(20))
        .map(add(10))
        .run(errorHandle)
    ).toEqual(40)
    // It should not call the provided error function when there is no error
    expect(errorHandle).not.toHaveBeenCalled()
    // Final returned value should the the value returned by failure handler
    expect(
      Effect(failedEffect)
        .map(neverCalled)
        .run(errorHandle)
    ).toEqual(-1)
    // Error function given to run should be called when an error has ocurred
    expect(errorHandle).toHaveBeenCalledTimes(1)
    // Error function given to run must be called with the returned error
    expect(errorHandle).toBeCalledWith(errMsg)
    // When effect returned an error it should not called the mapped functions
    expect(neverCalled).not.toHaveBeenCalled()
  })

  test("run() errors", () => {
    let run = eff => x => () => eff.run(x)
    let validEffect = run(Effect((_, succ) => succ(10)))
    let invalidEffect = run(Effect(constant(10)))

    let errorNotAFunction = /^Effect\.run\(\):.+value given to run is not a function\./
    let errorNotAResultType = /^Effect\.run\(\):.+the value returned by the wrapped effect is not of type Result\./

    expect(validEffect(undefined)).toThrowError(errorNotAFunction)
    expect(validEffect(null)).toThrowError(errorNotAFunction)
    expect(validEffect(0)).toThrowError(errorNotAFunction)
    expect(validEffect(1)).toThrowError(errorNotAFunction)
    expect(validEffect("")).toThrowError(errorNotAFunction)
    expect(validEffect("string")).toThrowError(errorNotAFunction)
    expect(validEffect(true)).toThrowError(errorNotAFunction)
    expect(validEffect(false)).toThrowError(errorNotAFunction)
    expect(validEffect([])).toThrowError(errorNotAFunction)
    expect(validEffect({})).toThrowError(errorNotAFunction)

    expect(invalidEffect(unit)).toThrowError(errorNotAResultType)
    expect(validEffect(unit)).not.toThrowError()
  })

  test("chain() functionality", () => {
    let initialValue = 10
    let succEffect = Effect((_, succ) => succ(initialValue))
    let failEffect = Effect((err, _) => err("FAILED"))
    let chainableEffect = jest.fn(x => Effect((_, succ) => succ(x + 1)))
    let failureHandler = jest.fn(_ => -1)
    let successHandler = jest.fn(x => x + 1)

    let result = succEffect.chain(chainableEffect)

    // Function given to chain shouldn't be called until effect runs
    expect(chainableEffect).not.toHaveBeenCalled()
    // A new Effect should be returned by chain
    expect(result).not.toEqual(succEffect)
    expect(isSameType(result, Effect)).toEqual(true)

    result = result.fork(failureHandler, successHandler)

    // Function given to chain should have been called after effect runs
    expect(chainableEffect).toHaveBeenCalledTimes(1)
    // Function given to chain should be called with value returned by previous effect
    expect(chainableEffect).toHaveBeenCalledWith(initialValue)
    // Error function should not be called when successful effect
    expect(failureHandler).not.toHaveBeenCalled()
    // Success function should be called once when successful effect
    expect(successHandler).toHaveBeenCalledTimes(1)
    // Success function should be called with the returned value by the chain
    expect(successHandler).toHaveBeenCalledWith(11)
    // The final returned value should be what the successful function returns
    expect(result).toEqual(12)

    chainableEffect.mockClear()
    failureHandler.mockClear()
    successHandler.mockClear()

    result = failEffect
      .chain(chainableEffect)
      .fork(failureHandler, successHandler)

    // Function given to chain should not be called when previous effect returns a failure
    expect(chainableEffect).not.toHaveBeenCalled()
    // Function handling failure should be called when effect returns afailure
    expect(failureHandler).toHaveBeenCalledTimes(1)
    // Function handling failure should be called with value returned by the faiiled effect
    expect(failureHandler).toHaveBeenCalledWith("FAILED")
    // The final value should the one returned by the failure handling function
    expect(result).toEqual(-1)
    // Function given to handle successful effect should not be called on failed effect
    expect(successHandler).not.toHaveBeenCalled()

    chainableEffect.mockClear()
    failureHandler.mockClear()
    successHandler.mockClear()

    result = succEffect
      .chain(chainableEffect)
      .chain(constant(failEffect))
      .chain(chainableEffect)
      .fork(failureHandler, successHandler)

    // Function given to chain should have been called only when previous effect is not a failure
    expect(chainableEffect).toHaveBeenCalledTimes(1)
    // When a failed effect is returned through the chain it should call the failure handler
    expect(failureHandler).toHaveBeenCalledTimes(1)
    // Function given to handle failure should be called with value returned by the failed effect
    expect(failureHandler).toHaveBeenCalledWith("FAILED")
    // The function given to handle success should not be called on failure
    expect(successHandler).not.toHaveBeenCalled()
  })
})
