import allPass from "ramda/src/allPass"
import applyTo from "crocks/combinators/applyTo"
import compose from "crocks/helpers/compose"
import converge from "crocks/combinators/converge"
import curry from "crocks/helpers/curry"
import execWith from "crocks/State/execWith"
import equals from "crocks/pointfree/equals"
import getProp from "crocks/Maybe/getProp"
import hasProps from "crocks/predicates/hasProps"
import isFunction from "crocks/predicates/isFunction"
import isObject from "crocks/predicates/isObject"
import keys from "ramda/src/keys"
import length from "ramda/src/length"
import map from "crocks/pointfree/map"
import objOf from "crocks/helpers/objOf"
import option from "crocks/pointfree/option"
import propEq from "crocks/predicates/propEq"
import setProp from "crocks/helpers/setProp"
import unit from "crocks/helpers/unit"
import unsetProp from "crocks/helpers/unsetProp"

import {
	editExclusionRule,
	editNewExclusionRule,
	initializeState,
	deleteExclusionRule,
	moveExclusionRuleDown,
	moveExclusionRuleUp,
	saveRuleBeingEdited,
	updateRuleBeingEdited
} from "./exclusionRules"

/**
 * TODO:
 * [X] Initialization of exclusion rule state
 * [X] Ability to delete an exclusion rule from the list
 * [] Ability to edit an exclusion rule from the list
 * [X] Ability to move up or down an exclusion rule's priority in the list
 * [] Validation of exclusion rule and set error messages
 */

const initialState = {
	nextRuleId: 0,
	exclusionRules: [],
	ruleBeingEdited: {
		id: 8,
		rule: "An exclusion rule",
		matchType: "orgUnit",
		exclusionType: "exactMatch",
		saved: false
	}
}

const sampleExclusionRules = [
  {
    id: 18,
    matchType: "exactMatch",
    exclusionType: "orgUnit",
    rule: "saved exclusion rule"
  },
  {
    id: 5,
    matchType: "exactMatch",
    exclusionType: "groupEmailAddress",
    rule: "Another rule in the list"
  },
  {
    id: 33,
    matchType: "substringMatch",
    exclusionType: "resourceId",
    rule: "A different one"
  },
  {
    id: 13,
    matchType: "regex",
    exclusionType: "userEmailAddress",
    rule: "Changed it again"
  }
]

const sampleExclusionTypes = [
  { id: "orgUnit", label: "Organizational Unit" },
  { id: "groupEmail", label: "Group Email Address" },
  { id: "resourceId", label: "Resource ID" }
]

const sampleMatchTypes = [
  { id: "exactMatch", label: "Exact Match" },
  { id: "regex", label: "Regex" }
]

describe("Exclusion rules state management functions", () => {
  describe("saveRuleBeingEdited() functionality", () => {
    test("It should return a State instance when called", () => {
      let result = saveRuleBeingEdited()
      expect(result.type()).toEqual("State")
    })

    test("If there is no rule being edited, it should't do a thing and simply return the given state", () => {
      let newState = unsetProp("ruleBeingEdited", initialState)
      let result = saveRuleBeingEdited().execWith(newState)
      expect(isObject(result)).toEqual(true)
      expect(Object.keys(result)).toEqual(Object.keys(newState))
      expect(result.exclusionRules).toHaveLength(0)
    })

    test("It should add the rule being edited to the list of rules when it's not marked as saved.", () => {
      let result = saveRuleBeingEdited().execWith(initialState)
      expect(result.exclusionRules).toHaveLength(1)
    })

    test("It should mark the rule being edited as saved after getting added to the exclusion rules list", () => {
      let result = saveRuleBeingEdited().execWith(initialState)

      expect(result.ruleBeingEdited.saved).toEqual(true)
    })

    test("If the rule is already saved, it should update the rule with matching ID in the list of rules", () => {
      let newState = saveRuleBeingEdited().execWith(initialState)

      expect(newState.exclusionRules[0].rule).toEqual(
        initialState.ruleBeingEdited.rule
      )

      let modifiedRule = "This is a modified rule"
      newState.ruleBeingEdited.rule = modifiedRule
      let result = saveRuleBeingEdited().execWith(newState)

      expect(result.exclusionRules[0].rule).toEqual(modifiedRule)
    })

    test("The rule saved to the list of rules should not have the `saved` flag", () => {
      let result = saveRuleBeingEdited().execWith(initialState)

      expect(result.exclusionRules[0].saved).toBeUndefined()
    })
    test("When the list of rules is missing from given state, it should create a new list and assign it to the state", () => {
      let newState = unsetProp("exclusionRules", initialState)

      expect(newState.exclusionRules).toBeUndefined()

      let result = saveRuleBeingEdited().execWith(newState)

      expect(result.exclusionRules).toHaveLength(1)
    })
    test("It should not add a rule to the list if it's not a valid rule", () => {
      let validExclusionRule = initialState.ruleBeingEdited

      let setRuleAndSave = compose(
        converge(execWith, applyTo(initialState), saveRuleBeingEdited),
        setProp("ruleBeingEdited")
      )

      let getRulesLength = compose(
        option(-1),
        map(length),
        getProp("exclusionRules")
      )

      let assertRuleWith = compose(
        getRulesLength,
        setRuleAndSave
      )

      expect(assertRuleWith(null)).toEqual(0)
      expect(assertRuleWith([])).toEqual(0)
      expect(assertRuleWith({})).toEqual(0)
      expect(assertRuleWith(100)).toEqual(0)
      expect(assertRuleWith("Hello")).toEqual(0)
      expect(assertRuleWith(validExclusionRule)).toEqual(1)
    })
  })

  describe("editNewExclusionRule() functionality", () => {
    test("It should be a function", () => {
      expect(isFunction(editNewExclusionRule)).toEqual(true)
    })

    test("It should returned a State instance when called", () => {
      let result = editNewExclusionRule()
      expect(result.type()).toEqual("State")
    })

    test("When executed with a state it should return the same state structure", () => {
      let result = editNewExclusionRule().execWith(initialState)
      expect(isObject(result)).toEqual(true)
      expect(Object.keys(result)).toEqual(Object.keys(initialState))
    })

    test("Everytime a new exclusion rule is create the `id` property should be incremental", () => {
      let stateOne = editNewExclusionRule().execWith(initialState)
      let stateTwo = editNewExclusionRule().execWith(stateOne)

      expect(stateOne.ruleBeingEdited.id).not.toEqual(
        stateTwo.ruleBeingEdited.id
      )
      expect(stateOne.ruleBeingEdited.id).toEqual(0)
      expect(stateTwo.ruleBeingEdited.id).toEqual(1)
    })

    test("When the prop `nextRuleId` is missing it should be created and initiated from 0", () => {
      let newState = unsetProp("nextRuleId", initialState)
      let stateOne = editNewExclusionRule().execWith(newState)
      let stateTwo = editNewExclusionRule().execWith(stateOne)

      expect(stateOne.ruleBeingEdited.id).toEqual(0)
      expect(stateTwo.ruleBeingEdited.id).toEqual(1)
      expect(stateTwo.nextRuleId).toEqual(2)
    })

    test("The new exclusion rule should contain the required props", () => {
      let newState = setProp("ruleBeingEdited", {}, initialState)
      let result = editNewExclusionRule().execWith(newState)
      let requiredProps = ["id", "matchType", "exclusionType", "saved", "rule"]

      expect(hasProps(requiredProps, result.ruleBeingEdited)).toEqual(true)
    })

    test("Every new rule should be stored in the `ruleBeingEdited` prop of the state", () => {
      let newState = unsetProp("nextRuleId", initialState)
      let stateOne = editNewExclusionRule().execWith(newState)

      expect(stateOne.ruleBeingEdited).toBeDefined()
      expect(stateOne.ruleBeingEdited.id).toEqual(0)

      let stateTwo = editNewExclusionRule().execWith(stateOne)

      expect(stateTwo.ruleBeingEdited).toBeDefined()
      expect(stateTwo.ruleBeingEdited.id).toEqual(1)
    })

    test("The `matchType` property of the new rule should default to the first item in the array of match types in the state", () => {
      let matchTypes = [
        { id: "orgUnit", label: "Organizationatl Unit" },
        { id: "groupEmailAddress", label: "Group Email Addres" },
        { id: "resourceId", label: "Resource ID" }
      ]
      let newState = setProp("matchTypes", matchTypes, initialState)
      let result = editNewExclusionRule().execWith(newState)

      expect(result.ruleBeingEdited.matchType).toEqual("orgUnit")
    })

    test("When no default `matchtype` is found set the prop to an empty string", () => {
      let result = editNewExclusionRule().execWith(initialState)

      expect(result.ruleBeingEdited.matchType).toEqual("")
    })

    test("The `exclusionType` property of the new state should default to the first item in the array of exclusion types in the state", () => {
      let exclusionTypes = [
        { id: "exactMatch", label: "Exact Match" },
        { id: "regex", label: "Regex" },
        { id: "substringMatch", label: "Substring Match" }
      ]
      let newState = setProp("exclusionTypes", exclusionTypes, initialState)
      let result = editNewExclusionRule().execWith(newState)

      expect(result.ruleBeingEdited.exclusionType).toEqual("exactMatch")
    })

    test("When no default `exclusionType` is found set the prop to an empty string", () => {
      let result = editNewExclusionRule().execWith(initialState)

      expect(result.ruleBeingEdited.exclusionType).toEqual("")
    })
  })

  describe("updateRuleBeingEdited() functionality", () => {
    test("It should be a function", () => {
      expect(isFunction(updateRuleBeingEdited)).toEqual(true)
    })

    test("It should return an instance of State", () => {
      let result = updateRuleBeingEdited()

      expect(result.type()).toEqual("State")
    })

    test("'When given parameter is not an object it should simply return back the state unchanged'", () => {
      let runUpdateWith = val =>
        updateRuleBeingEdited(val).execWith(initialState).ruleBeingEdited
      let ruleEqualsState = propEq("rule", initialState.ruleBeingEdited.rule)
      let matchTypeEqualsState = propEq(
        "matchType",
        initialState.ruleBeingEdited.matchType
      )
      let exclusionTypeEqualsState = propEq(
        "exclusionType",
        initialState.ruleBeingEdited.exclusionType
      )
      let validateValues = allPass([
        ruleEqualsState,
        matchTypeEqualsState,
        exclusionTypeEqualsState
      ])
      let assertIfUnchanged = compose(
        validateValues,
        runUpdateWith
      )

      expect(assertIfUnchanged(null)).toEqual(true)
      expect(assertIfUnchanged(undefined)).toEqual(true)
      expect(assertIfUnchanged("something")).toEqual(true)
      expect(assertIfUnchanged([0, 1])).toEqual(true)
      expect(assertIfUnchanged(unit)).toEqual(true)
      expect(assertIfUnchanged(200)).toEqual(true)
      expect(assertIfUnchanged({ rule: "The rule has changed" })).toEqual(false)
    })

    test("When evaluated with a state, it should return the same state structure", () => {
      let result = updateRuleBeingEdited().execWith(initialState)

      expect(isObject(result)).toEqual(true)
      expect(Object.keys(result)).toEqual(Object.keys(initialState))
    })

    test("The rule being edited in the state should be updated with supplied changes", () => {
      let rule = { rule: "Rule has been changed" }
      let matchType = { matchType: "somethingDifferent" }
      let exclusionType = { exclusionType: "changeExclusionRule" }

      let runUpdate = update =>
        updateRuleBeingEdited(update).execWith(initialState).ruleBeingEdited

      expect(runUpdate(rule)).toHaveProperty("rule", rule.rule)
      expect(runUpdate(rule).rule).not.toEqual(
        initialState.ruleBeingEdited.rule
      )
      expect(runUpdate(matchType)).toHaveProperty(
        "matchType",
        matchType.matchType
      )
      expect(runUpdate(matchType).matchType).not.toEqual(
        initialState.ruleBeingEdited.matchType
      )
      expect(runUpdate(exclusionType)).toHaveProperty(
        "exclusionType",
        exclusionType.exclusionType
      )
      expect(runUpdate(exclusionType).exclusionType).not.toEqual(
        initialState.ruleBeingEdited.exclusionType
      )
    })

    test("Only the props provided to be updated should change", () => {
      let newRule = { rule: "The rule has now changed" }
      let newMatchType = { matchType: "thisIsADifferentMatchType" }
      let newExclusionType = { exclusionType: "totallyDifferentExclusionType" }

      let ruleChanged = updateRuleBeingEdited(newRule).execWith(initialState)
      let matchTypeChanged = updateRuleBeingEdited(newMatchType).execWith(
        initialState
      )
      let exclusionTypeChanged = updateRuleBeingEdited(
        newExclusionType
      ).execWith(initialState)

      expect(ruleChanged.ruleBeingEdited.rule).toEqual(newRule.rule)
      expect(ruleChanged.ruleBeingEdited.matchType).toEqual(
        initialState.ruleBeingEdited.matchType
      )
      expect(ruleChanged.ruleBeingEdited.exclusionType).toEqual(
        initialState.ruleBeingEdited.exclusionType
      )

      expect(matchTypeChanged.ruleBeingEdited.matchType).toEqual(
        newMatchType.matchType
      )
      expect(matchTypeChanged.ruleBeingEdited.rule).toEqual(
        initialState.ruleBeingEdited.rule
      )
      expect(matchTypeChanged.ruleBeingEdited.exclusionType).toEqual(
        initialState.ruleBeingEdited.exclusionType
      )

      expect(exclusionTypeChanged.ruleBeingEdited.exclusionType).toEqual(
        newExclusionType.exclusionType
      )
      expect(exclusionTypeChanged.ruleBeingEdited.matchType).toEqual(
        initialState.ruleBeingEdited.matchType
      )
      expect(exclusionTypeChanged.ruleBeingEdited.rule).toEqual(
        initialState.ruleBeingEdited.rule
      )
    })

    test("It should only update writable props in the rule being edited", () => {
      let changesToApply = {
        id: "wrong type",
        saved: null,
        rule: "Hello world"
      }
      let result = updateRuleBeingEdited(changesToApply).execWith(initialState)

      expect(result.ruleBeingEdited).toHaveProperty("id", 8)
      expect(result.ruleBeingEdited).toHaveProperty("saved", false)
      expect(result.ruleBeingEdited).toHaveProperty("rule", changesToApply.rule)
    })
  })

  describe("initializeState() functionality", () => {
    test("It should be a function", () => {
      expect(isFunction(initializeState)).toEqual(true)
    })

    test("An instance of State should be returned when called", () => {
      let result = initializeState()
      expect(result.type()).toEqual("State")
    })

    test("It should be able to initialize the list of exclusion rules", () => {
      let result = initializeState().execWith({
        exclusionRules: sampleExclusionRules
      })

      expect(result).toHaveProperty("exclusionRules", sampleExclusionRules)
    })

    test("It should be able to initialize the list of match types", () => {
      let result = initializeState().execWith({ matchTypes: sampleMatchTypes })

      expect(result).toHaveProperty("matchTypes", sampleMatchTypes)
    })

    test("It should be able to initialize the list of exclusion types", () => {
      let result = initializeState().execWith({
        exclusionTypes: sampleExclusionTypes
      })

      expect(result).toHaveProperty("exclusionTypes", sampleExclusionTypes)
    })

    test("It should initialize the `nextRuleId` to the next available value from the given list of exclusion rules", () => {
      let result = initializeState().execWith({
        exclusionRules: sampleExclusionRules
      })

      expect(result).toHaveProperty("nextRuleId", 34)
    })

    test("When no values are given for initialization it should set the proper safe defaults", () => {
      let result = initializeState().execWith(null)

      expect(result).toHaveProperty("nextRuleId", 0)
      expect(result).toHaveProperty("matchTypes", [])
      expect(result).toHaveProperty("exclusionTypes", [])
      expect(result).toHaveProperty("ruleBeingEdited", {})
      expect(result).toHaveProperty("exclusionRules", [])
    })

    test("It should only modify the props that are allowed to be externally initialized", () => {
      let propsToInitialize = {
        nextRuleId: 100,
        matchTypes: sampleMatchTypes,
        exclusionTypes: sampleExclusionTypes,
        exclusionRules: [],
        someOtherProp: "Hello there"
      }
      let result = initializeState().execWith(propsToInitialize)

      expect(result).not.toHaveProperty("someOtherProp")
      expect(result).toHaveProperty("exclusionRules", [])
      expect(result).toHaveProperty("matchTypes", sampleMatchTypes)
      expect(result).toHaveProperty("exclusionTypes", sampleExclusionTypes)
      expect(result).toHaveProperty("nextRuleId", 0)
    })

    test("Props that can be externally initialized should fallback to default when provided value is invalid", () => {
      let initPropWith = curry((prop, val) =>
        initializeState().execWith(objOf(prop, val))
      )
      let initMatchTypes = initPropWith("matchTypes")
      let initExclusionTypes = initPropWith("exclusionTypes")
      let initExclusionRules = initPropWith("exclusionRules")

      expect(initMatchTypes(null)).toHaveProperty("matchTypes", [])
      expect(initMatchTypes(undefined)).toHaveProperty("matchTypes", [])
      expect(initMatchTypes("Hello")).toHaveProperty("matchTypes", [])
      expect(initMatchTypes(150)).toHaveProperty("matchTypes", [])
      expect(initMatchTypes({})).toHaveProperty("matchTypes", [])
      expect(initMatchTypes(sampleMatchTypes)).toHaveProperty(
        "matchTypes",
        sampleMatchTypes
      )

      expect(initExclusionTypes(null)).toHaveProperty("exclusionTypes", [])
      expect(initExclusionTypes(undefined)).toHaveProperty("exclusionTypes", [])
      expect(initExclusionTypes("Hello")).toHaveProperty("exclusionTypes", [])
      expect(initExclusionTypes(150)).toHaveProperty("exclusionTypes", [])
      expect(initExclusionTypes({})).toHaveProperty("exclusionTypes", [])
      expect(initExclusionTypes(sampleExclusionTypes)).toHaveProperty(
        "exclusionTypes",
        sampleExclusionTypes
      )

      expect(initExclusionRules(null)).toHaveProperty("exclusionRules", [])
      expect(initExclusionRules(undefined)).toHaveProperty("exclusionRules", [])
      expect(initExclusionRules("Hello")).toHaveProperty("exclusionRules", [])
      expect(initExclusionRules(150)).toHaveProperty("exclusionRules", [])
      expect(initExclusionRules({})).toHaveProperty("exclusionRules", [])
      expect(initExclusionRules(sampleExclusionRules)).toHaveProperty(
        "exclusionRules",
        sampleExclusionRules
      )
    })
  })

  describe("deleteExclusionRule() functionality", () => {
    test("It should be a function", () => {
      expect(isFunction(deleteExclusionRule)).toEqual(true)
    })

    test("It should return an instance of State when called", () => {
      let result = deleteExclusionRule()

      expect(result.type()).toEqual("State")
    })

    test("It should remove the exclusion rule that matches the provided ID in the list", () => {
      let newState = setProp(
        "exclusionRules",
        sampleExclusionRules,
        initialState
      )
      let result = deleteExclusionRule(5).execWith(newState)
      let expectedLength = sampleExclusionRules.length - 1

      expect(result.exclusionRules).toHaveLength(expectedLength)
      expect(result.exclusionRules[1]).toHaveProperty("id", 33)
    })

    test("It should return the same type of state when executed", () => {
      let result = deleteExclusionRule(10).execWith(initialState)

      expect(Object.keys(result)).toEqual(Object.keys(initialState))
    })

    test("When no matching ID is found it should return the unmodified state including the list of exclusion rules", () => {
      let newState = setProp(
        "exclusionRules",
        sampleExclusionRules,
        initialState
      )
      let result = deleteExclusionRule(999).execWith(newState)

      expect(result).toHaveProperty("exclusionRules", sampleExclusionRules)
      expect(Object.keys(result)).toEqual(Object.keys(newState))
    })

    test("When an invalid value is given is should simply return back the state", () => {
      let newState = setProp(
        "exclusionRules",
        sampleExclusionRules,
        initialState
      )
      let tests = [
        propEq("exclusionRules", sampleExclusionRules),
        compose(
          equals(keys(newState)),
          keys
        )
      ]
      let testIdValue = compose(
        allPass(tests),
        execWith(newState),
        deleteExclusionRule
      )

      expect(testIdValue(null)).toEqual(true)
      expect(testIdValue(undefined)).toEqual(true)
      expect(testIdValue([1, 2, 3])).toEqual(true)
      expect(testIdValue({})).toEqual(true)
      expect(testIdValue("Hello World")).toEqual(true)
      expect(testIdValue(999)).toEqual(true)
    })
  })

	describe("moveExclusionRuleUp() functionality", () => {
		test("It should be a function", () => {
			expect(isFunction(moveExclusionRuleUp)).toEqual(true)
		})

		test("It should return an instance of State when called", () => {
			let result = moveExclusionRuleUp()

			expect(result.type()).toEqual('State')
		})

		test("It should return the same type of state when executed with a given state", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let result = moveExclusionRuleUp().execWith(newState)

			expect(keys(result)).toEqual(keys(newState))
		})

		test("It should move the rule that matches the given ID one index up in the list", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let targetIndex = 2
			let ruleToMove = sampleExclusionRules[targetIndex]
			let result = moveExclusionRuleUp(ruleToMove.id).execWith(newState)

			expect(result.exclusionRules[targetIndex - 1]).toEqual(newState.exclusionRules[targetIndex])
		})

		test("If no matches are found, it should return the same exclusion rules unmodified", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let result = moveExclusionRuleUp(999).execWith(newState)

			expect(result).toHaveProperty('exclusionRules', sampleExclusionRules)
		})

		test("Only the matching rule and the one before should switched position", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let result = moveExclusionRuleUp(33).execWith(newState)

			expect(result.exclusionRules[0]).toEqual(newState.exclusionRules[0])
			expect(result.exclusionRules[1]).toEqual(newState.exclusionRules[2])
			expect(result.exclusionRules[2]).toEqual(newState.exclusionRules[1])
			expect(result.exclusionRules[3]).toEqual(newState.exclusionRules[3])
		})
	})

	describe('moveExclusionRuleDown() functionatility', () => {
		test('It should be a function', () => {
			expect(isFunction(moveExclusionRuleDown)).toEqual(true)
		})

		test('It should return a State instace when called', () => {
			let result = moveExclusionRuleDown(99)

			expect(result.type()).toEqual('State')
		})

		test("It should return the same type of state when executed with a given state", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let result = moveExclusionRuleDown().execWith(newState)

			expect(keys(result)).toEqual(keys(newState))
		})

		test("It should move the rule that matches the given ID one index up in the list", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let targetIndex = 2
			let ruleToMove = sampleExclusionRules[targetIndex]
			let result = moveExclusionRuleDown(ruleToMove.id).execWith(newState)

			expect(result.exclusionRules[targetIndex + 1]).toEqual(ruleToMove)
		})

		test("If no matches are found, it should return the same exclusion rules unmodified", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let result = moveExclusionRuleDown(999).execWith(newState)

			expect(result).toHaveProperty('exclusionRules', sampleExclusionRules)
		})

		test("Only the matching rule and the one before should switched position", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let targetIndex = 2
			let ruleToMove = sampleExclusionRules[targetIndex]
			let result = moveExclusionRuleDown(ruleToMove.id).execWith(newState)

			expect(result.exclusionRules[0]).toEqual(newState.exclusionRules[0])
			expect(result.exclusionRules[1]).toEqual(newState.exclusionRules[1])
			expect(result.exclusionRules[2]).toEqual(newState.exclusionRules[3])
			expect(result.exclusionRules[3]).toEqual(newState.exclusionRules[2])
		})
	})

	describe('editExclusionRule() functionality', () => {
		test('It should be a function', () => {
			expect(isFunction(editExclusionRule)).toEqual(true)
		})

		test('It should return a State instace when called', () => {
			let result = editExclusionRule(99)

			expect(result.type()).toEqual('State')
		})

		test("It should return the same type of state when executed with a given state", () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let result = editExclusionRule().execWith(newState)

			expect(keys(result)).toEqual(keys(newState))
		})

		test('It should set the exclusion rule matching the given ID as the rule being edited', () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let targetID = sampleExclusionRules[2].id
			let result = editExclusionRule(targetID).execWith(newState)

			expect(result.ruleBeingEdited).toHaveProperty('id', targetID)
		})

		test('When no exclusion rule mathes the given ID it should set the rule being edited to empty', () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let result = editExclusionRule(999).execWith(newState)

			expect(result.ruleBeingEdited).not.toHaveProperty('id')
		})

		test('When no ID parameter is given it should not change the rule being edited', () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let result = editExclusionRule().execWith(newState)

			expect(result.ruleBeingEdited).not.toHaveProperty('id')
		})

		test('The rule being edited should have the same structure as a new rule', () => {
			let newState = setProp('exclusionRules', sampleExclusionRules, initialState)
			let targetID = sampleExclusionRules[2].id
			let newRule = editNewExclusionRule().execWith(newState)
			let result = editExclusionRule(targetID).execWith(newState)

			expect(keys(newRule.ruleBeingEdited)).toEqual(keys(result.ruleBeingEdited))
		})
	})
})
