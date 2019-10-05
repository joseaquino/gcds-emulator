import constant from "crocks/combinators/constant"

const notifications = constant({
  title: "Notifications",
  id: "notifications",
  menu: {
    visible: true,
    canBeDisabled: false,
    position: 12,
    text: "Notifications",
    active: false
  },
  tabs: [
    {
      heading: "Notification Settings",
      active: true
    }
  ]
})

export default notifications
