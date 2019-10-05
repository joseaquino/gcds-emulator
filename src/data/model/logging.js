import constant from "crocks/combinators/constant"

const logging = constant({
  title: "Logging",
  id: "logging",
  menu: {
    visible: true,
    canBeDisabled: false,
    position: 13,
    text: "Logging",
    active: false
  },
  tabs: [
    {
      heading: "Logging Settings",
      active: true
    }
  ]
})

export default logging
