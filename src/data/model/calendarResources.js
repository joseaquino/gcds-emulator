import constant from "crocks/combinators/constant"

const calendarResources = constant({
  title: "Calendar Resources",
  id: "calendarResources",
  menu: {
    visible: false,
    canBeDisabled: true,
    position: 10,
    text: "Calendar Resources",
    active: false
  },
  tabs: [
    {
      heading: "Calendar Resource Attributes",
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

export default calendarResources
