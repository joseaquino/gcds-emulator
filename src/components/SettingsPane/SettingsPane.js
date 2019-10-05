import React, { useState, useMemo, useRef } from "react"

import { connect } from "react-redux"
import "./SettingsPane.scss"

import alt from "crocks/pointfree/alt"
import and from "crocks/logic/and"
import assign from "crocks/helpers/assign"
import compose from "crocks/helpers/compose"
import constant from "crocks/combinators/constant"
import converge from "crocks/combinators/converge"
import equals from "crocks/pointfree/equals"
import find from "crocks/Maybe/find"
import getProp from "crocks/Maybe/getProp"
import ifElse from "crocks/logic/ifElse"
import isArray from "crocks/predicates/isArray"
import isEmpty from "crocks/predicates/isEmpty"
import isNil from "crocks/predicates/isNil"
import isObject from "crocks/predicates/isObject"
import isString from "crocks/predicates/isString"
import isTrue from "crocks/predicates/isTrue"
import map from "crocks/pointfree/map"
import mapProps from "crocks/helpers/mapProps"
import not from "crocks/logic/not"
import objOf from "crocks/helpers/objOf"
import option from "crocks/pointfree/option"
import propEq from "crocks/predicates/propEq"
import safe from "crocks/Maybe/safe"
import tap from "crocks/helpers/tap"
import when from "crocks/logic/when"

import { saveTabChangesAction } from "../../data/reducers/syncConfiguration"
import ActiveTabView from "./ActiveTabView"
import TabBar from "./TabBar"

// findActiveTab :: [a] -> Maybe a
const findActiveTab = converge(alt, getProp(0), find(propEq("active", true)))

const SettingsPane = ({ tabs, id, saveTabChanges }) => {
  const [tabsState, setTabsState] = useState(tabs)
  const configHasChangedRef = useRef(false)
  const activeConfigIdRef = useRef(id)
  const activeTabRef = useRef(null)

  // getConfigHasChangedRef :: () -> Boolean
  const getConfigHasChangedRef = compose(
    option(false),
    getProp("current"),
    _ => configHasChangedRef
  )

  // getTabsProp :: () -> [a]
  const getTabsProp = () => safe(isArray, tabs).option([])

  // getTabsState :: () -> Object
  const getTabsState = () => tabsState

  // getActiveConfigIdRef :: () -> String
  const getActiveConfigIdRef = compose(
    option(""),
    getProp("current"),
    _ => activeConfigIdRef
  )

  // updateActiveConfigId :: String -> ReactRef
  const updateActiveConfigId = compose(
    _ => activeConfigIdRef,
    id => (activeConfigIdRef.current = id),
    option(""),
    safe(isString)
  )

  // updateActiveTabRef :: Object -> Object
  const updateActiveTabRef = tab => (activeTabRef.current = tab)

  // getActiveTabRef :: () -> Object
  const getActiveTabRef = compose(
    getProp("current"),
    constant(activeTabRef)
  )

  // resetConfigChangesFlag :: () -> Boolean
  const resetConfigChangesFlag = () => (configHasChangedRef.current = false)

  // commitChangesToState :: () -> Object
  const commitChangesToState = compose(
    when(
      and(
        compose(
          not(isEmpty),
          option(""),
          getProp("id")
        ),
        compose(
          not(isNil),
          option(null),
          getProp("tabs")
        )
      ),
      compose(
        _ => updateActiveConfigId(id),
        resetConfigChangesFlag,
        saveTabChanges
      )
    ),
    converge(
      assign,
      compose(
        objOf("tabs"),
        map(
          when(
            compose(
              equals(getProp("id", getActiveTabRef().option(null))),
              getProp("id")
            ),
            compose(
              option({}),
              getActiveTabRef
            )
          )
        ),
        getTabsState
      ),
      compose(
        objOf("id"),
        getActiveConfigIdRef
      )
    )
  )

  // hasConfigurationChanged :: () -> Boolean
  const hasConfigurationChanged = compose(
    isTrue,
    getConfigHasChangedRef
  )

  useMemo(
    compose(
      _ => updateActiveConfigId(id),
      updateActiveTabRef,
      option(null),
      findActiveTab,
      tap(setTabsState),
      getTabsProp,
      when(hasConfigurationChanged, commitChangesToState)
    ),
    [tabs]
  )

  const updateLocalConfig = newConfig =>
    getProp("current", activeTabRef)
      .chain(safe(and(not(isNil), _ => isObject(newConfig))))
      .map(mapProps({ configs: assign(newConfig) }))
      .map(updateActiveTabRef)
      .map(_ => (configHasChangedRef.current = true))

  const changeTab = tab =>
    safe(isArray, getTabsState())
      .map(
        map(
          ifElse(
            and(
              compose(
                not(equals(getProp("id", tab))),
                getProp("id")
              ),
              compose(
                isTrue,
                option(false),
                getProp("active")
              )
            ),
            compose(
              option({}),
              map(when(isObject, assign({ active: false }))),
              getActiveTabRef
            ),
            when(
              compose(
                equals(getProp("id", tab)),
                getProp("id")
              ),
              assign({ active: true })
            )
          )
        )
      )
      .map(tap(setTabsState))
      .map(
        compose(
          updateActiveTabRef,
          option(null),
          findActiveTab
        )
      )

  return (
    <div id="settings-pane">
      <TabBar tabs={tabsState} changeTab={changeTab} />
      <ActiveTabView
        activeTab={activeTabRef.current}
        updateConfig={updateLocalConfig}
      />
    </div>
  )
}

const mapStateProps = compose(
  converge(
    assign,
    compose(
      objOf("id"),
      option(""),
      getProp("id")
    ),
    compose(
      objOf("tabs"),
      option([]),
      getProp("tabs")
    )
  ),
  option({}),
  getProp("activeConfig")
)

const mapDispatch = dispatch => ({
  saveTabChanges: tab => dispatch(saveTabChangesAction(tab))
})

export default connect(
  mapStateProps,
  mapDispatch
)(SettingsPane)
