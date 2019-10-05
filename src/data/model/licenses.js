import constant from "crocks/combinators/constant"

const licenses = constant({
  title: "Licenses",
  id: "licenses",
  menu: {
    visible: false,
    canBeDisabled: true,
    position: 11,
    text: "Licenses",
    active: false
  },
  tabs: [
    {
      heading: "LDAP License Rules",
      active: true
    }
  ]
})

export default licenses
