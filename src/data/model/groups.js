import constant from "crocks/combinators/constant"

const groups = constant({
  title: "Groups",
  id: "groups",
  menu: {
    visible: false,
    canBeDisabled: true,
    position: 6,
    text: "Groups",
    active: false
  },
  tabs: [
    {
      heading: "Search Rules",
      active: true
    },
    {
      heading: "Exclusion Rules"
    }
  ]
})

export default groups
