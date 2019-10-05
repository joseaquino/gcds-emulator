import React from "react"
import InfoBox from "../InfoBox"
import "./GeneralSettings.scss"

import compose from "crocks/helpers/compose"
import filter from "crocks/pointfree/filter"
import map from "crocks/pointfree/map"
import objOf from "crocks/helpers/objOf"
import option from "crocks/pointfree/option"
import prop from "crocks/Maybe/prop"
import pathEq from "crocks/predicates/pathEq"

import { connect } from "react-redux"
import { toggleMenuItem } from "../../data/reducers/navigation"

const GeneralSettings = ({ configurableServices, toggleConfig }) => (
  <div id="general-settings-tab">
    <InfoBox title="Choose what to synchronize">
      {configurableServices.map((setting, idx) => (
        <label key={idx}>
          <input
            type="checkbox"
            key={idx}
            onClick={() => toggleConfig(setting.id)}
            defaultChecked={setting.menu.visible}
          />
          <span>{setting.menu.text}</span>
        </label>
      ))}
    </InfoBox>
  </div>
)

const mapProps = compose(
  objOf("configurableServices"),
  option([]),
  map(filter(pathEq(["menu", "canBeDisabled"], true))),
  prop("data")
)

const mapDispatch = dispatch => ({
  toggleConfig: id => dispatch(toggleMenuItem(id))
})

export default connect(
  mapProps,
  mapDispatch
)(GeneralSettings)
