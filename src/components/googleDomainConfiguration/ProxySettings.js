import React from "react"

import assign from "crocks/helpers/assign"
import compose from "crocks/helpers/compose"
import map from "crocks/pointfree/map"

import "./ProxySettings.scss"
import { safeGetInputVal } from "../../data/helpers"

const ProxySettings = ({ configs, id, updateConfig }) => {
  const handleFormChange = compose(
    map(updateConfig),
    map(vals => (configs = vals)),
    map(vals => assign(vals, configs)),
    safeGetInputVal
  )

  return (
    <div
      id="google-domain-proxy-settings"
      className="layout-grid-full-height layout-main-and-description"
    >
      <div className="settings-pane-main">
        <h2>
          SSL Proxy <span>(used to connect to Google APIs)</span>
        </h2>

        <form onBlur={handleFormChange}>
          <div className="field-group">
            <label htmlFor="hostname">Hostname:</label>
            <input
              type="text"
              name="hostname"
              id="hostname"
              defaultValue={configs.hostname}
            />
          </div>

          <div className="field-group">
            <label htmlFor="port">Port:</label>
            <input
              type="text"
              name="port"
              id="port"
              defaultValue={configs.port}
            />
          </div>

          <div className="field-group">
            <label htmlFor="username">User Name (optional):</label>
            <input
              type="text"
              name="username"
              id="username"
              defaultValue={configs.username}
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password (optional):</label>
            <input
              type="password"
              name="password"
              id="password"
              defaultValue={configs.password}
            />
          </div>
        </form>
      </div>
      <div className="settings-pane-description">
        <h4>Description</h4>
        <p>
          If your firewall uses a proxy to access external websites, enter the
          information for the SSL Proxy. <a href="/">See Examples</a>
        </p>
      </div>
    </div>
  )
}

export default ProxySettings
