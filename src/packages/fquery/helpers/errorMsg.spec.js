import isObject from "crocks/predicates/isObject"
import isString from "crocks/predicates/isString"

import errorMsg from "./errorMsg"

describe("errorMsg()", () => {
  test("Should be a curried function which takes 2 arguments.", () => {
    let curried = errorMsg("test")
    let result = curried("Error message")

    expect(curried).toBeInstanceOf(Function)
    expect(isObject(result)).toEqual(true)
  })

  describe("print()", () => {
    test("It should always return a string", () => {
      let error = errorMsg("print()", "Something went wrong.")
      let result = error.print()

      expect(isString(result)).toEqual(true)
    })

    test("It should return the formatted error message", () => {
      let error = errorMsg("print()", "Something went wrong.")
      let expected = "print()\nSomething went wrong."

      expect(error.print()).toEqual(expected)
    })
  })

  describe("append()", () => {
    test("It should return a new errorMsg", () => {
      let error = errorMsg("append()", "Something went")
      let result = error.append("wrong")

      expect(result).not.toEqual(error)
    })

    test("It should append the given value at the end of the error message", () => {
      let error = errorMsg("append()", "Something went")
      let result = error.append("wrong.").print()
      let expected = "append()\nSomething went wrong."

      expect(result).toEqual(expected)
    })

    test("It should throw an error when given value is not a string", () => {
      let error = errorMsg("append()", "Something went wrong")
      let result = () => error.append(null)

      expect(result).toThrowError(TypeError)
    })
  })

  describe("newLine()", () => {
    test("It should append a new line to the error message", () => {
      let result = errorMsg("newLine()", "Something went wrong.").newLine(
        "Please check your settings"
      )
      let expected =
        "newLine()\nSomething went wrong.\nPlease check your settings"

      expect(result.print()).toEqual(expected)
    })

    test("It should throw a TypeError when the given value is not a String", () => {
      let result = errorMsg("newLine()", "Something went wrong.")
      let throwsError = () => result.newLine(null)

      expect(throwsError).toThrowError(TypeError)
    })
  })
})
