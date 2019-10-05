import constant from "crocks/combinators/constant"

const customSchemas = constant({
  title: "Custom Schemas",
  id: "customSchemas",
  menu: {
    visible: false,
    canBeDisabled: true,
    position: 8,
    text: "Custom Schemas",
    active: false
  },
  tabs: [
    {
      heading: "Custom Schemas",
      active: true
    }
  ]
})

export default customSchemas
