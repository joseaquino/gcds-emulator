import React, { useState } from "react"

import chain from "crocks/pointfree/chain"
import compose from "crocks/helpers/compose"
import constant from "crocks/combinators/constant"
import curry from "crocks/helpers/curry"
import either from "crocks/pointfree/either"
import equals from "crocks/pointfree/equals"
import evalWith from "crocks/State/evalWith"
import execWith from "crocks/State/execWith"
import find from "crocks/Maybe/find"
import getPath from "crocks/Maybe/getPath"
import getProp from "crocks/Maybe/getProp"
import isBoolean from "crocks/predicates/isBoolean"
import isString from "crocks/predicates/isString"
import map from "crocks/pointfree/map"
import mapProps from "crocks/helpers/mapProps"
import option from "crocks/pointfree/option"
import safe from "crocks/Maybe/safe"
import tap from "crocks/helpers/tap"
import trim from "ramda/es/trim"

import InfoBox from "../InfoBox"
import SettingsModal from "../SettingsModal"

import {
  getStateProp,
  isNotEmpty,
  preventDefault,
  safeGetInputVal,
  setStateProp
} from "../../data/helpers"

import {
  editNewExclusionRule,
	initializeState,
  saveRuleBeingEdited,
  updateRuleBeingEdited
} from "../../data/model/exclusionRules"

import "./ExclusionRules.scss"

/**
 * ==================================================
 *    Helper Functions
 * ==================================================
 */

// setErrorMsg :: String -> State ComponentState ()
const setErrorMsg = compose(
  setStateProp("formErrorMsg"),
  option(""),
  safe(isString)
)

// getRuleBeingEdited :: () -> State ComponentState ExclusionRule
const getRuleBeingEdited = () => getStateProp("ruleBeingEdited").map(option({}))

// clearErrorMsg :: () -> State ComponentState ()
const clearErrorMsg = compose(
  setErrorMsg,
  constant("")
)

// changeModalStatus :: Boolean -> State ComponentState ()
const changeModalStatus = compose(
  setStateProp("isModalOpen"),
  option(false),
  safe(isBoolean)
)

// openModalWindow :: () -> State ComponentState ()
const openModalWindow = () => changeModalStatus(true)

// closeModalWindow :: () -> State ComponentState ()
const closeModalWindow = () => changeModalStatus(false)

// validateRuleIsNotEmpty :: Object -> Maybe Object
const validateRuleIsNotEmpty = safe(
  compose(
    isNotEmpty,
    option(""),
    getProp("rule")
  )
)

// findById :: Number -> [ExclusionRule] -> ExclusionRule
const findById = curry(id => find(
	compose(
		equals(id),
		option(""),
		getProp("id")
	)
))

// findLabel :: String -> String -> State ComponentState String
const findLabel = curry((prop, id) =>
  getStateProp(prop)
	.map(chain(
		findById(id)
	))
    .map(chain(getProp("label")))
    .map(option(""))
)

/**
 * ==================================================
 *    Exclusion Rules Component
 * ==================================================
 * Observations:
 * - with useState you can only commit the state changes once in an update
 * -
 */

const ExclusionRules = ({ data, configs }) => {
	const initialState = {
		matchTypes: data.exclusionMatchTypes,
		exclusionTypes: data.exclusionTypes,
		exclusionRules: configs.exclusionRules
	}

	const [state, setState] = useState(compose(
		execWith(initialState),
		initializeState
	))

  console.log("STATE", state)

  const commitChanges = compose(
    setState,
    tap(x => console.log("saveChanges", x)),
    execWith(state)
  )

  const findExclusionTypeLabel = compose(
    evalWith(state),
    findLabel("exclusionTypes")
  )

  const findMatchTypeLabel = compose(
    evalWith(state),
    findLabel("matchTypes")
  )

  const handleRuleChange = compose(
    commitChanges,
    either(
      compose(
        setErrorMsg,
        constant("You must enter an exclusion rule first.")
      ),
      compose(
        chain(clearErrorMsg),
        updateRuleBeingEdited
      )
    ),
    chain(validateRuleIsNotEmpty),
    map(mapProps({ rule: trim })),
    safeGetInputVal
  )

  const handleRuleTypeChange = compose(
    map(commitChanges),
    map(updateRuleBeingEdited),
    safeGetInputVal
  )

  const openNewExclusionRule = compose(
    commitChanges,
    chain(clearErrorMsg),
    chain(editNewExclusionRule),
    openModalWindow
  )

  const cancelNewExclusionRule = compose(
    commitChanges,
    closeModalWindow
  )

  const isFormValid = compose(
    evalWith(state),
    map(option(false)),
    map(validateRuleIsNotEmpty),
    getRuleBeingEdited
  )

  const saveChanges = compose(
    map(saveRuleBeingEdited),
    safe(isFormValid)
  )

  const applyChanges = compose(
    map(commitChanges),
    saveChanges
  )

  const saveNewExclusionRule = compose(
    map(commitChanges),
    map(chain(closeModalWindow)),
    saveChanges,
    preventDefault
  )

  return (
    <div
      id="google-domain-exclusion-rules"
      className="layout-grid-full-height layout-main-actions-and-description"
    >
      {/* Main Section */}
      <div className="settings-pane-main">
        <div className="rules-table-container">
          <div className="rules-table-header rules-table-row">
            <span>Type</span>
            <span>Match Type</span>
            <span>Rule</span>
            <span className="rules-table-icon-divider" />
            <span className="rules-table-icon-divider" />
            <span className="rules-table-icon-divider" />
            <span className="rules-table-icon-divider" />
          </div>
          <div className="rules-table-content">
            {state.exclusionRules.map(rule => (
              <div className="rules-table-row rules-table-item" key={rule.id}>
                <span>
                  {getProp("exclusionType", rule)
                    .map(findExclusionTypeLabel)
                    .option("")}
                </span>
                <span>
                  {getProp("matchType", rule)
                    .map(findMatchTypeLabel)
                    .option("")}
                </span>
                <span>{getProp("rule", rule).option("")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions section */}
      <div className="settings-pane-actions">
        <InfoBox title="Actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={openNewExclusionRule}
          >
            <span className="underlined">A</span>dd Exclusion Rule
          </button>
        </InfoBox>
      </div>

      {/* Description section */}
      <div className="settings-pane-description">
        <h4>Description</h4>
        <p>
          Unless you setup Exclusion Rules, Google Cloud Directory Sync removes
          any users, groups and calendar resources that are not in your LDAP
          server. To exclude a user, group or calendar resource from
          synchronization, add an exclusion rule for it. If you have multple
          users, groups or calendar resources that match a pattern, you can
          enter a substring or regular expression, or add a separate rule for
          each item. <a href="/">See Examples</a>
        </p>
      </div>

      {/* Exclusion rule modal */}
      <SettingsModal isOpen={getProp("isModalOpen", state).option(false)}>
        <SettingsModal.Title
          text="Add Exclusion Rule"
          onClose={cancelNewExclusionRule}
        />
        <SettingsModal.Description>
          Specify a user address, group email address, or member address to
          exclude. An excluded member address is not removed from the Google
          domain group. For examples, click the "See Examples" link on the
          previous page.
        </SettingsModal.Description>
        <SettingsModal.Content>
          <form
            id="google-domain-exclusion-rule-form"
            onSubmit={saveNewExclusionRule}
          >
            <div className="exclusion-rule-fields">
              <fieldset>
                <label htmlFor="exclusion-type">Type:</label>
                <select
                  name="exclusionType"
                  id="exclusion-type"
                  defaultValue={getPath(
                    ["ruleBeingEdited", "exclusionType"],
                    state
                  ).option(null)}
                  onChange={handleRuleTypeChange}
                >
                  {data.exclusionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset>
                <label htmlFor="exclusion-match-type">Match Type:</label>
                <select
                  name="matchType"
                  id="exclusion-match-type"
                  defaultValue={getPath(
                    ["ruleBeingEdited", "matchType"],
                    state
                  ).option(null)}
                  onChange={handleRuleTypeChange}
                >
                  {data.exclusionMatchTypes.map(matchType => (
                    <option key={matchType.id} value={matchType.id}>
                      {matchType.label}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset>
                <label htmlFor="exclusion-rule">Exclusion Rule:</label>
                {getProp("formErrorMsg", state)
                  .map(err => <span>{err}</span>)
                  .option(null)}
                <textarea
                  defaultValue={getPath(["ruleBeingEdited", "rule"], state)
                    .map(trim)
                    .option("")}
                  name="rule"
                  id="exclusion-rule"
                  onBlur={handleRuleChange}
                />
              </fieldset>
            </div>

            <div className="rules-modal-footer">
              <button type="submit" className="btn btn-primary">
                OK
              </button>
              <button type="button" className="btn" onClick={applyChanges}>
                Apply
              </button>
              <button
                type="button"
                className="btn"
                onClick={cancelNewExclusionRule}
              >
                Cancel
              </button>
            </div>
          </form>
        </SettingsModal.Content>
      </SettingsModal>
    </div>
  )
}

export default ExclusionRules
