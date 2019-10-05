import React from "react"

import and from "crocks/logic/and"
import apply from "ramda/src/apply"
import chain from "crocks/pointfree/chain"
import compose from "crocks/helpers/compose"
import constant from "crocks/combinators/constant"
import curry from "crocks/helpers/curry"
import either from "crocks/pointfree/either"
import hasProps from "crocks/predicates/hasProps"
import isArray from "crocks/predicates/isArray"
import isFunction from "crocks/predicates/isFunction"
import map from "crocks/pointfree/map"
import props from "ramda/src/props"
import propSatisfies from "crocks/predicates/propSatisfies"
import safe from "crocks/Maybe/safe"

/**
 * emptyComponent :: () -> (() -> null)
 *
 * A function which returns an empty react component
 */
const emptyComponent = constant(null)

/**
 * checkPropTypes :: Object -> Boolean
 *
 * A predicate function that checks that certain props are of the required type
 */
const checkPropTypes = and(
  propSatisfies("tabs", isArray),
  propSatisfies("changeTab", isFunction)
)

/**
 * createTab :: (Tab -> _) -> Tab -> ReactComponent
 *
 * Creates the tab component
 */
const createTab = curry((changeTab, tab) => (
  <span
    key={tab.id}
    className={tab.active ? "active" : ""}
    onClick={() => changeTab(tab)}
  >
    {tab.heading}
  </span>
))

/**
 * createTabComponents :: (Tab -> _) -> [Tab] -> [ReactComponent]
 *
 * Processes a list of tab data and returns a new list of tab components
 */
const createTabComponents = curry(changeTab =>
  map(
    compose(
      either(emptyComponent, createTab(changeTab)),
      safe(hasProps(["heading", "id"]))
    )
  )
)

const TabBar = compose(
  tabs => <div id="tab-bar">{tabs}</div>,
  either(constant([]), apply(createTabComponents)),
  map(props(["changeTab", "tabs"])),
  chain(safe(checkPropTypes)),
  safe(hasProps(["changeTab", "tabs"]))
)

export default TabBar
