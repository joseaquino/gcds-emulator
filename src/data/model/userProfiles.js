import constant from "crocks/combinators/constant"

const userProfiles = constant({
  title: "User Profiles",
  id: "userProfiles",
  menu: {
    visible: false,
    canBeDisabled: true,
    position: 7,
    text: "User Profiles",
    active: false
  },
  tabs: [
    {
      heading: "User Profile Attributes",
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

export default userProfiles
