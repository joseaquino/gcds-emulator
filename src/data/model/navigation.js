import alt from "crocks/pointfree/alt"
import and from "crocks/logic/and"
import chain from "crocks/pointfree/chain"
import compose from "crocks/helpers/compose"
import composeK from "crocks/helpers/composeK"
import constant from "crocks/combinators/constant"
import converge from "crocks/combinators/converge"
import either from "crocks/pointfree/either"
import find from "crocks/Maybe/find"
import identity from "crocks/combinators/identity"
import isNil from "crocks/predicates/isNil"
import map from "crocks/pointfree/map"
import mapProps from "crocks/helpers/mapProps"
import not from "crocks/logic/not"
import pathEq from "crocks/predicates/pathEq"
import propEq from "crocks/predicates/propEq"
import safe from "crocks/Maybe/safe"
import when from "crocks/logic/when"
import { getState, head, over, getStateProp } from "../helpers"

/**
 * Checks each config object in the `data` prop in the state
 * and toggles the `menu.active` Boolean flag for the config with
 * the matching ID.
 *
 * toggleMenuItem :: String -> State AppState ()
 */
export const toggleMenuItem = nextActiveId =>
  over(
    "data",
    map(
      when(
        propEq("id", nextActiveId),
        mapProps({ menu: { active: not(identity) } })
      )
    )
  )

/**
 * Toggle the `menu.active` for the `activeConfig` in the state
 * then searches the `data` array for the config object with the
 * matching ID and toggles their `menu.active` Boolean flag
 *
 * markMenuItemSelected :: String -> State AppState String
 */
export const markMenuItemSelected = id =>
  over(
    "activeConfig",
    when(not(propEq("id", id)), mapProps({ menu: { active: not(identity) } }))
  ).chain(_ => toggleMenuItem(id))

/**
 * This function saves the activeConfig back to the `data`
 * property in the state to preserve changes done to it through
 * user actions, as the `activeConfig` prop is replaced by a menu
 * change.
 *
 * commitActiveConfig :: () -> State AppState ()
 */
const commitActiveConfig = () =>
  getStateProp("activeConfig")
    .map(chain(safe(not(isNil))))
    .chain(
      either(getState, config =>
        over("data", map(when(propEq("id", config.id), constant(config))))
      )
    )

/**
 * Retrieves the first configuration object which has the prop
 * `menu.active` set to `true` and places it as the new `activeConfig`
 * prop in the state, if none is found it will take the head of the `data`
 * prop from the state.
 *
 * findNextActiveConfig :: () -> State AppState ()
 */
const findNextActiveConfig = () =>
  getStateProp("data")
    .map(chain(converge(alt, head, find(pathEq(["menu", "active"], true)))))
    .chain(
      either(
        compose(
          over("activeConfig"),
          constant(null)
        ),
        compose(
          over("activeConfig"),
          constant
        )
      )
    )

/**
 * Commits the current `activeConfig` to the `data` state if
 * there is any `activeConfig` and it will pick the next active
 * configuration from the `data` prop of the state and replace the
 * current `activeConfig` with the new one
 *
 * updateActivePane :: () -> State AppState ()
 */
export const updateActivePane = composeK(
  findNextActiveConfig,
  commitActiveConfig
)

// toggleMenuItemVisibility :: String -> State AppState ()
export const toggleMenuItemVisibility = id =>
  over(
    "data",
    map(
      when(
        and(propEq("id", id), pathEq(["menu", "canBeDisabled"], true)),
        mapProps({
          menu: {
            visible: not(identity)
          }
        })
      )
    )
  )
