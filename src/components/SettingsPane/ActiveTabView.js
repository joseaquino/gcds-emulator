import React, { useMemo } from "react"
import List from "crocks/List"

import compose from "crocks/helpers/compose"
import concat from "crocks/pointfree/concat"
import constant from "crocks/combinators/constant"
import converge from "crocks/combinators/converge"
import either from "crocks/pointfree/either"
import getProp from "crocks/Maybe/getProp"
import isObject from "crocks/predicates/isObject"
import listToArray from "crocks/List/listToArray"
import map from "crocks/pointfree/map"
import option from "crocks/pointfree/option"
import pick from "crocks/helpers/pick"
import safe from "crocks/Maybe/safe"

/**
 * pickPropsFromActiveTab :: Object -> List Object
 *
 * Picks a set of properties from the given object and returns the object wrapped in a List
 */
const pickPropsFromActiveTab = compose(
  List,
  pick(["id", "configs", "data"])
)

/**
 * emptyViewAndProps :: () -> [() -> null, Object]
 *
 * Returns an array containing an empty React view and an empty props Object
 * used as default for when no view was provided.
 */
const emptyViewAndProps = constant([constant(null), {}])

/**
 * getViewFromActiveTab :: Object -> List Object
 *
 * It retrives the component to render for the active tab
 * and if none is found it will return an empty component.
 *
 * The result will be returned wrapped in a List
 */
const getViewFromActiveTab = compose(
  List,
  option(constant(null)),
  getProp("component")
)

/**
 * getViewAndPropsFromActiveTab :: Object -> [ReactComponent, ReactProps]
 *
 * Retrieves the component and props for the active tab view and returns it
 * in a tuple with the view first and the props second
 */
const getViewAndPropsFromActiveTab = compose(
  either(emptyViewAndProps, listToArray),
  map(converge(concat, pickPropsFromActiveTab, getViewFromActiveTab)),
  safe(isObject)
)

const ActiveTabView = ({ activeTab, updateConfig }) => {
  const getActiveTab = () => activeTab

  const [View, props] = useMemo(
    compose(
      getViewAndPropsFromActiveTab,
      getActiveTab
    ),
    [activeTab]
  )

  return (
    <div id="tab-content">
      <View {...props} updateConfig={updateConfig} />
    </div>
  )
}

export default ActiveTabView
