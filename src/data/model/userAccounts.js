import constant from "crocks/combinators/constant"

const userAccounts = constant({
  title: "User Accounts",
  id: "userAccounts",
  menu: {
    visible: false,
    canBeDisabled: true,
    position: 5,
    text: "User Accounts",
    active: false
  },
  tabs: [
    {
      heading: "User Attributes",
      component: () => "Hello world",
      active: true
    },
    {
      heading: "Additional user Attributes"
    },
    {
      heading: "Search rules",
      component: () => "Search rules"
    },
    {
      heading: "Exclusion rules",
      component: () => "Exclusion rules"
    }
  ],
  searchRules: [],
  exclusionRules: []
})

export default userAccounts
