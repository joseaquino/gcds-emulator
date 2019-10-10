import First from "crocks/First"
import State, { get, modify } from "crocks/State"

import applyTo from "crocks/combinators/applyTo"
import assign from "crocks/helpers/assign"
import chain from "crocks/pointfree/chain"
import compose from "crocks/helpers/compose"
import concat from "crocks/pointfree/concat"
import constant from "crocks/combinators/constant"
import converge from "crocks/combinators/converge"
import curry from "crocks/helpers/curry"
import equals from "crocks/pointfree/equals"
import find from 'crocks/Maybe/find'
import flip from "crocks/combinators/flip"
import getPath from "crocks/Maybe/getPath"
import getProp from "crocks/Maybe/getProp"
import ifElse from "crocks/logic/ifElse"
import isArray from "crocks/predicates/isArray"
import isEmpty from "crocks/predicates/isEmpty"
import isNil from "crocks/predicates/isNil"
import liftA2 from "crocks/helpers/liftA2"
import mapProps from "crocks/helpers/mapProps"
import mreduceMap from "crocks/helpers/mreduceMap"
import not from "crocks/logic/not"
import setPath from "crocks/helpers/setPath"
import setProp from "crocks/helpers/setProp"
import objOf from "crocks/helpers/objOf"
import option from "crocks/pointfree/option"
import prop from "crocks/Maybe/prop"
import safe from "crocks/Maybe/safe"
import when from "crocks/logic/when"

// Remove the over function and rename to mapStateProp
// over :: (String, (a -> b)) -> Object -> State Object ()
export const over = curry((key, fn) => modify(mapProps({ [key]: fn })))
export const mapStateProp = over

// Action a :: { type: String, payload: a }
// Reducer :: Action a -> Maybe (State AppState ())
// ActionReducer :: Object (a -> State AppState ())

// createAction :: String -> a -> Action a
export const createAction = type => payload => ({ type, payload })

// createReducer :: ActionReducer -> Reducer
export const createReducer = actionReducers => ({ type, payload }) =>
  prop(type, actionReducers).map(applyTo(payload))

// combineReducers :: [ Reducer ] -> Reducer
export const combineReducers = flip(
  compose(
    mreduceMap(First),
    applyTo
  )
)

export const assignBy = curry((pred, obj) => when(pred, assign(obj)))

// isCheckbox :: HTMLElement -> Boolean
export const isCheckbox = compose(
  equals("checkbox"),
  option(""),
  getProp("type")
)

// findById :: String -> [ExclusionRule] -> ExclusionRule
export const findById = curry(id => find(
	compose(
		equals(id),
		option(""),
		getProp("id")
	)
))

// getState :: () -> State AppState ()
export const getState = () => State.get()

// getStateProp :: String -> State ComponentState (Maybe a)
export const getStateProp = compose(
  get,
  getProp
)

// getStatePath :: [String | Number] -> State ComponentState (Maybe a)
export const getStatePath = compose(
  get,
  getPath
)

// setStateProp :: String -> a -> State ComponentState ()
export const setStateProp = curry(key =>
  compose(
    modify,
    setProp(key)
  )
)

// setStatePath :: [String | Number] -> a -> State ComponentState ()
export const setStatePath = curry(path =>
  compose(
    modify,
    setPath(path)
  )
)

// liftToState :: (a -> b) -> a -> State s b
export const liftToState = curry(fn =>
  compose(
    State.of,
    fn
  )
)

// length :: [a] -> Integer
export const length = arr =>
  safe(isArray, arr)
    .map(xs => xs.length)
    .option(0)

// append :: [a] -> a -> [a]
export const append = curry((arr, item) =>
  safe(isArray, arr)
    .map(concat([item]))
    .option([item])
)

// isNotEmpty :: a -> Boolean
export const isNotEmpty = not(isEmpty)

// safeGetInputName :: HTMLInputElement -> Maybe String
export const safeGetInputName = compose(
  chain(safe(isNotEmpty)),
  getProp("name")
)

// safeGetInputVal :: HTMLEvent -> Maybe Object
export const safeGetInputVal = compose(
  chain(
    converge(
      liftA2(objOf),
      safeGetInputName,
      ifElse(isCheckbox, getProp("isChecked"), getProp("value"))
    )
  ),
  getProp("target")
)

// preventDefault :: HTMLEvent -> HTMLEvent
export const preventDefault = evt =>
  safe(not(isNil), evt.preventDefault)
    .map(_ => evt.preventDefault())
    .map(constant(evt))
    .option(evt)

// head :: [a] -> Maybe a
export const head = prop(0)
