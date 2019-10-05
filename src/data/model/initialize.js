import constant from "crocks/combinators/constant"

import googleDomainConfiguration from "./googleDomainConfiguration"
import ldapConfiguration from "./ldapConfiguration"
import generalSettings from "./generalSettings"
import orgUnits from "./orgUnits"
import userAccounts from "./userAccounts"
import groups from "./groups"
import userProfiles from "./userProfiles"
import customSchemas from "./customSchemas"
import sharedContacts from "./sharedContacts"
import calendarResources from "./calendarResources"
import licenses from "./licenses"
import notifications from "./notifications"
import logging from "./logging"
import sync from "./sync"

const initialState = constant({
  activeConfig: null,
  data: [
    googleDomainConfiguration(),
    ldapConfiguration(),
    generalSettings(),
    orgUnits(),
    userAccounts(),
    groups(),
    userProfiles(),
    customSchemas(),
    sharedContacts(),
    calendarResources(),
    licenses(),
    notifications(),
    logging(),
    sync()
  ]
})

export { initialState }
