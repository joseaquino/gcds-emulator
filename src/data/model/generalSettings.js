import constant from "crocks/combinators/constant";
import GeneralSettings from "../../components/generalSettings/GeneralSettings";

const generalSettings = constant({
  title: "General Settings",
  id: "generalSettings",
  menu: {
    visible: true,
    canBeDisabled: false,
    position: 3,
    text: "General Settings",
    active: false
  },
  tabs: [
    {
      heading: "General Settings",
      component: GeneralSettings,
      active: true
    }
  ]
});

export default generalSettings;
