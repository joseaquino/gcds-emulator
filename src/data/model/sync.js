import constant from "crocks/combinators/constant"

const sync = constant({
  title: "Sync",
  id: "sync",
  menu: {
    visible: true,
    canBeDisabled: false,
    position: 14,
    text: "Sync",
    active: false
  },
  tabs: [
    {
      heading: "Validation Results & Sync",
      active: true
    }
  ]
})

export default sync
