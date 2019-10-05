import {
  markMenuItemSelected,
  toggleMenuItemVisibility,
  updateActivePane
} from "../model/navigation"
import { createAction, createReducer } from "../helpers"

const SELECT_MENU_ITEM = "SELECT_MENU_ITEM"
const UPDATE_ACTIVE_PANE = "UPDATE_ACTIVE_PANE"
const TOGGLE_MENU_ITEM_VISIBILITY = "TOGGLE_MENU_ITEM_VISIBILITY"

// selectMenuItem :: String -> Action String
export const selectMenuItem = createAction(SELECT_MENU_ITEM)

// changeActivePane :: () -> Action ()
export const changeActivePane = createAction(UPDATE_ACTIVE_PANE)

// toggleMenuItem :: String -> Action ()
export const toggleMenuItem = createAction(TOGGLE_MENU_ITEM_VISIBILITY)

// reducer :: Reducer
const reducer = createReducer({
  SELECT_MENU_ITEM: markMenuItemSelected,
  UPDATE_ACTIVE_PANE: updateActivePane,
  TOGGLE_MENU_ITEM_VISIBILITY: toggleMenuItemVisibility
})

export default reducer
