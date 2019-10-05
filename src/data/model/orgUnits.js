import constant from "crocks/combinators/constant"

const orgUnits = constant({
  title: "Org Units",
  id: "orgUnits",
  menu: {
    visible: false,
    canBeDisabled: true,
    position: 4,
    text: "Org Units",
    active: false
  },
  tabs: [
    {
      heading: "LDAP Org Unit Mappings",
      active: true
    },
    {
      heading: "Search Rules"
    },
    {
      heading: "Exclusion Rules"
    }
  ]
})

export default orgUnits
