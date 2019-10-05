import { updateActiveConfigTabs } from "../model/syncConfiguration"
import { createAction, createReducer } from "../helpers"

const SAVE_TAB_CHANGES = "SAVE_TAB_CHANGES"

export const saveTabChangesAction = createAction(SAVE_TAB_CHANGES)

const reducer = createReducer({
  SAVE_TAB_CHANGES: updateActiveConfigTabs
})

export default reducer
