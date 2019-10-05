import constant from "crocks/combinators/constant"

const sharedContacts = constant({
  title: "Shared Contacts",
  id: "sharedContacts",
  menu: {
    visible: false,
    canBeDisabled: true,
    position: 9,
    text: "Shared Contacts",
    active: false
  },
  tabs: [
    {
      heading: "Shared Contact Attributes",
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

export default sharedContacts
