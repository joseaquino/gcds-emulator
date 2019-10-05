import constant from "crocks/combinators/constant"

import ConnectionSettings from "../../components/googleDomainConfiguration/ConnectionSettings"
import ProxySettings from "../../components/googleDomainConfiguration/ProxySettings"
import ExclusionRules from "../../components/googleDomainConfiguration/ExclusionRules"

const googleDomainConfiguration = constant({
  title: "Google Domain Configuration",
  id: "googleDomainConfiguration",
  menu: {
    visible: true,
    canBeDisabled: false,
    position: 1,
    text: "Google Domain Configuration",
    active: true
  },
  tabs: [
    {
      id: "GoogleDomainConnectionSettings",
      heading: "Connection Settings",
      component: ConnectionSettings,
      active: true,
      configs: {
        primaryDomainName: "",
        replaceDomain: false,
        altEmailDomain: "",
        readTimeout: 20,
        authorized: false
      }
    },
    {
      id: "GoogleDomainProxySettings",
      heading: "Proxy Settings",
      component: ProxySettings,
      configs: {
        hostname: "",
        port: "",
        username: "",
        password: ""
      }
    },
    {
      id: "GoogleDomainExclusionRules",
      heading: "Exclusion Rules",
      component: ExclusionRules,
      configs: {
        exclusionRules: []
      },
      data: {
        exclusionTypes: [
          {
            id: "orgCompletePath",
            label: "Organization Complete Path"
          },
          {
            id: "userEmail",
            label: "User Email Address"
          },
          {
            id: "aliasEmail",
            label: "Alias Email Address"
          },
          {
            id: "groupEmail",
            label: "Group Email Address"
          },
          {
            id: "groupMemberEmail",
            label: "Group Member Email Address"
          },
          {
            id: "userProfileSyncKey",
            label: "User Profile Primary Sync Key"
          },
          {
            id: "sharedContactSyncKey",
            label: "Shared Contact Primary Sync Key"
          },
          {
            id: "calendarResourceId",
            label: "Calendar Resource Id"
          }
        ],
        exclusionMatchTypes: [
          {
            id: "exactMatch",
            label: "Exact Match"
          },
          {
            id: "substringMatch",
            label: "Substring Match"
          },
          {
            id: "regex",
            label: "Regular Expression"
          }
        ]
      }
    }
  ]
})

export default googleDomainConfiguration
