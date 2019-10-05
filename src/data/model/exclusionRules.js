import Pred from "crocks/Pred"
import Max from "crocks/Max"

import append from "ramda/src/append"
import applyTo from "crocks/combinators/applyTo"
import assign from "crocks/helpers/assign"
import chain from "crocks/pointfree/chain"
import compose from "crocks/helpers/compose"
import constant from "crocks/combinators/constant"
import converge from "crocks/combinators/converge"
import curry from "crocks/helpers/curry"
import either from "crocks/pointfree/either"
import findIndex from "ramda/src/findIndex"
import getProp from "crocks/Maybe/getProp"
import getPropOr from "crocks/helpers/getPropOr"
import gte from "ramda/src/gt"
import identity from "crocks/combinators/identity"
import ifElse from "crocks/logic/ifElse"
import inc from "ramda/src/inc"
import isArray from "crocks/predicates/isArray"
import isNumber from "crocks/predicates/isNumber"
import isObject from "crocks/predicates/isObject"
import isString from "crocks/predicates/isString"
import liftA2 from "crocks/helpers/liftA2"
import map from "crocks/pointfree/map"
import mapProps from "crocks/helpers/mapProps"
import mreduceMap from "crocks/helpers/mreduceMap"
import pick from "crocks/helpers/pick"
import option from "crocks/pointfree/option"
import propEq from "crocks/predicates/propEq"
import safe from "crocks/Maybe/safe"
import setProp from "crocks/helpers/setProp"
import trim from "ramda/src/trim"
import unsetProp from "crocks/helpers/unsetProp"

import { put } from "crocks/State"

import {
  assignBy,
  getState,
  getStateProp,
  isNotEmpty,
  mapStateProp,
  setStateProp
} from "../helpers"

// allowedPropsToInitialize :: [String]
const allowedPropsToInitialize = [
  "exclusionRules",
  "matchTypes",
  "exclusionTypes"
]

// editableRuleWritableProps :: [String]
const editableRuleWritableProps = ["rule", "matchType", "exclusionType"]

// defaultExclusionRulesState :: ExclusionRulesState
const defaultExclusionRulesState = constant({
  matchTypes: [],
  exclusionTypes: [],
  exclusionRules: [],
  ruleBeingEdited: {},
  nextRuleId: 0
})

// defaultExclusionRule :: () -> ExclusionRule
const defaultExclusionRule = constant({
  id: null,
  matchType: "",
  exclusionType: "",
  rule: "",
  saved: false
})

// getRuleBeingEdited :: () -> State ExclusionRulesState ExclusionRule
const getRuleBeingEdited = () => getStateProp("ruleBeingEdited").map(option({}))

// setRuleBeingEdited :: ExclusionRule -> State ExclusionRulesState ()
const setRuleBeingEdited = setStateProp("ruleBeingEdited")

// getExclusionRules :: () -> State ExclusionRulesState [ExclusionRule]
const getExclusionRules = () => getStateProp("exclusionRules").map(option([]))

// setExclusionRules :: [ExclusionRule] -> State ExclusionRulesState ()
const setExclusionRules = setStateProp("exclusionRules")

// getNextRuleId :: () -> State ExclusionRulesState Number
const getNextRuleId = () => getStateProp("nextRuleId").map(option(0))

// getMatchTypes :: () -> State ExclusionRulesState [MatchType]
const getMatchTypes = () => getStateProp("matchTypes").map(option([]))

// getExclusionTypes :: () -> State ExclusionRulesState [ExclusionType]
const getExclusionTypes = () => getStateProp("exclusionTypes").map(option([]))

// mapOverExclusionRules :: (ExclusionRule -> ExclusionRule) -> State ExclusionRuleState ()
const mapOverExclusionRules = fn =>
  getExclusionRules()
    .map(fn)
    .chain(setStateProp("exclusionRules"))

// ruleHasBeenSaved :: ExclusionRule -> Boolean
const ruleHasBeenSaved = compose(
  option(false),
  getProp("saved")
)

// markEditedRuleSaved :: () -> State ExclusionRuleState ()
const markEditedRuleSaved = () =>
  mapStateProp("ruleBeingEdited", setProp("saved", true))

// addExclusionRuleToList :: ExclusionRule -> State ExclusionRulesState ()
const addExclusionRuleToList = compose(
  chain(markEditedRuleSaved),
  mapOverExclusionRules,
  append,
  unsetProp("saved")
)

// mergeWithEqualRule :: ExclusionRule -> ExclusionRule -> ExclusionRule
const mergeWithEqualRule = converge(
  assignBy,
  compose(
    propEq("id"),
    option(""),
    getProp("id")
  ),
  unsetProp("saved")
)

// updateExclusionRuleInList :: ExclusionRule -> State ExclusionRuleState ()
const updateExclusionRuleInList = compose(
  mapOverExclusionRules,
  map,
  mergeWithEqualRule
)

// hasValidId :: Pred ExclusionRule
const hasValidId = Pred(
  compose(
    option(false),
    map(isNumber),
    getProp("id")
  )
)

// checkPropIsNotEmptyString :: String -> Pred Object
const checkPropIsNotEmptyString = key =>
  Pred(
    compose(
      option(false),
      chain(safe(isNotEmpty)),
      map(trim),
      chain(safe(isString)),
      getProp(key)
    )
  )

// canEditedRuleBeSaved :: ExclusionRule -> Boolean
const canEditedRuleBeSaved = hasValidId
  .concat(checkPropIsNotEmptyString("rule"))
  .concat(checkPropIsNotEmptyString("matchType"))
  .concat(checkPropIsNotEmptyString("exclusionType"))

// increaseNextRuleId :: Number -> State ExclusionRulesState Number
const increaseNextRuleId = id =>
  setStateProp("nextRuleId", inc(id)).map(constant(id))

// generateNextRuleId :: () -> State ExclusionRulesState Number
const generateNextRuleId = () => getNextRuleId().chain(increaseNextRuleId)

// assignNextRuleId :: ExclusionRule -> State ExclusionRulesState ExclusionRule
const assignNextRuleId = rule =>
  generateNextRuleId()
    .map(setProp("id"))
    .map(applyTo(rule))

// assignFirstExclusionOption :: String -> ExclusionRule -> [ExclusionOption] -> ExclusionRule
const assignFirstExclusionOption = curry((optionKey, rule) =>
  compose(
    applyTo(rule),
    setProp(optionKey),
    option(""),
    chain(getProp("id")),
    getProp(0)
  )
)

// findLargestId :: [ExclusionRule] -> Number
const findLargestId = mreduceMap(Max, getPropOr(0, "id"))

// assignDefaultMatchType :: ExclusionRule -> State ExclusionRulesState ExclusionRule
const assignDefaultMatchType = rule =>
  getMatchTypes().map(assignFirstExclusionOption("matchType", rule))

// assignDefaultExclusionType :: ExclurionRule -> State ExclusionRulesState ExclusionRule
const assignDefaultExclusionType = rule =>
  getExclusionTypes().map(assignFirstExclusionOption("exclusionType", rule))

// safePickAllowedProps :: Object -> InitialState
const safePickAllowedProps = compose(
  mapProps({
    matchTypes: compose(
      option([]),
      safe(isArray)
    ),
    exclusionTypes: compose(
      option([]),
      safe(isArray)
    ),
    exclusionRules: compose(
      option([]),
      safe(isArray)
    )
  }),
  pick(allowedPropsToInitialize)
)

// initializeValidProps :: InitialState -> ExclusionRulesState
const initializeValidProps = ifElse(
  isObject,
  converge(assign, safePickAllowedProps, defaultExclusionRulesState),
  defaultExclusionRulesState
)

// greaterThanZero :: Number -> Boolean
const greaterThanZero = num => gte(num, 0)

// initializeNextRuleId :: ExclusionRulesState -> ExclusionRulesState
const initializeNextRuleId = converge(
  setProp("nextRuleId"),
  compose(
    either(
      constant(0),
      compose(
        inc,
        findLargestId
      )
    ),
    chain(safe(isNotEmpty)),
    getProp("exclusionRules")
  ),
  identity
)

// newExclusionRule :: () -> State ExclusionRulesState ()
export const editNewExclusionRule = compose(
  chain(setRuleBeingEdited),
  chain(assignDefaultExclusionType),
  chain(assignDefaultMatchType),
  assignNextRuleId,
  defaultExclusionRule
)

// updateRuleBeingEdited :: ExclusionRule -> State ExclusionRulesState ()
export const updateRuleBeingEdited = compose(
  either(getState, mapStateProp("ruleBeingEdited")),
  map(assign),
  map(pick(editableRuleWritableProps)),
  safe(isObject)
)

// saveRuleBeingEdited :: () -> State ExclusionRulesState ()
export const saveRuleBeingEdited = compose(
  chain(
    either(
      getState,
      ifElse(
        ruleHasBeenSaved,
        updateExclusionRuleInList,
        addExclusionRuleToList
      )
    )
  ),
  map(safe(canEditedRuleBeSaved)),
  getRuleBeingEdited
)

// initializeState :: () -> State ExclusionRulesState ()
export const initializeState = compose(
  chain(put),
  map(initializeNextRuleId),
  map(initializeValidProps),
  getState
)

// deleteExclusionRule :: Number -> State ExclusionRulesState ()
export const deleteExclusionRule = id =>
  getExclusionRules()
    .map(
      converge(
        liftA2(unsetProp),
        compose(
          chain(safe(greaterThanZero)),
          map(findIndex(propEq("id", id))),
          safe(constant(isNumber(id)))
        ),
        safe(isArray)
      )
    )
    .chain(either(getState, setExclusionRules))
