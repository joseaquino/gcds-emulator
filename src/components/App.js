import React from "react"
import { connect } from "react-redux"
import AppWindowMenu from "./AppWindowMenu"
import SidebarNavigation from "./SidebarNavigation"
import SettingsPane from "./SettingsPane"
import { changeActivePane } from "../data/reducers/navigation"
import pick from "crocks/helpers/pick"
import prop from "crocks/Maybe/prop"
import "./App.scss"

class App extends React.Component {
  componentDidMount() {
    this.props.updateActiveConfig()
  }

  render() {
    return (
      <div className="App">
        <AppWindowMenu />
        <div id="app-header">
          <h1>Google Cloud Directory Sync</h1>
          <img src="/images/google-cloud-logo.svg" alt="Google Cloud logo" />
        </div>
        <h3 id="active-pane-title">
          {prop("title", this.props.activeConfig).option("")}
        </h3>
        <div id="main-container">
          <SidebarNavigation />
          <SettingsPane />
        </div>
      </div>
    )
  }
}

const mapProps = pick(["activeConfig"])

const mapDispatch = dispatch => ({
  updateActiveConfig: () => dispatch(changeActivePane())
})

export default connect(
  mapProps,
  mapDispatch
)(App)
