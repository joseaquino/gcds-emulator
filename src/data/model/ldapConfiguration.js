import constant from "crocks/combinators/constant"

const ldapConfiguration = constant({
  title: "LDAP Configuration",
  id: "ldapConfiguration",
  menu: {
    visible: true,
    canBeDisabled: false,
    position: 2,
    text: "LDAP Configuration",
    active: false
  },
  tabs: [
    {
      heading: "Connection Settings",
      active: true
    }
  ]
})

export default ldapConfiguration
