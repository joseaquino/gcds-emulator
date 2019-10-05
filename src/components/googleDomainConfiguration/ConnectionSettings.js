import React, { useState } from "react"

import assign from "crocks/helpers/assign"
import chain from "crocks/pointfree/chain"
import compose from "crocks/helpers/compose"
import converge from "crocks/combinators/converge"
import equals from "crocks/pointfree/equals"
import getProp from "crocks/Maybe/getProp"
import ifElse from "crocks/logic/ifElse"
import isEmpty from "crocks/predicates/isEmpty"
import liftA2 from "crocks/helpers/liftA2"
import map from "crocks/pointfree/map"
import objOf from "crocks/helpers/objOf"
import option from "crocks/pointfree/option"
import safe from "crocks/Maybe/safe"
import unit from "crocks/helpers/unit"

import InfoBox from "../InfoBox"

import "./ConnectionSettings.scss"
import { isNotEmpty } from "../../data/helpers"

const ConnectionSettings = ({ configs, updateConfig }) => {
  const [configsState, setConfigsState] = useState(configs)

  const handleInput = compose(
    map(converge(unit, updateConfig, setConfigsState)),
    map(
      x =>
        console.log(
          "ConnectionSettings:\n\tUpdating configuration local and parent state"
        ) || x
    ),
    map(val => assign(val, configsState)),
    chain(
      converge(
        liftA2(objOf),
        compose(
          chain(safe(isNotEmpty)),
          getProp("name")
        ),
        ifElse(
          compose(
            equals("checkbox"),
            option(""),
            getProp("type")
          ),
          getProp("checked"),
          getProp("value")
        )
      )
    ),
    getProp("target")
  )

  return (
    <div className="layout-grid-full-height layout-main-and-description">
      <div className="settings-pane-main">
        <InfoBox
          title="Specify Google Domain Account Information"
          headingCentered={true}
        >
          <form>
            <div className="field-group">
              <label htmlFor="primaryDomainName">Primary Domain Name:</label>
              <input
                id="primaryDomainName"
                name="primaryDomainName"
                type="text"
                defaultValue={configsState.primaryDomainName}
                onBlur={handleInput}
              />
            </div>

            <div className="field-group checkbox-field">
              <input
                id="replaceDomain"
                name="replaceDomain"
                type="checkbox"
                defaultChecked={configsState.replaceDomain}
                onChange={handleInput}
              />
              <label htmlFor="replaceDomain">
                Replace domain names in LDAP email addresses (of users and
                groups) with this domain name
              </label>
            </div>

            <div className="field-group">
              <label htmlFor="altEmailDomain">Alternative Email Domain:</label>
              <input
                type="text"
                name="altEmailDomain"
                id="altEmailDomain"
                defaultValue={configsState.altEmailDomain}
                disabled={configsState.replaceDomain !== true}
                onBlur={handleInput}
              />
            </div>

            <div className="field-group">
              <label htmlFor="readTimeout">Read Timeout (in seconds):</label>
              <input
                type="number"
                name="readTimeout"
                id="readTimeout"
                defaultValue={configsState.readTimeout}
                onBlur={handleInput}
              />
            </div>

            <div className="field-group auth-section">
              <label>Authorize using OAuth:</label>
              <div className="auth-section__status-feedback">
                <button
                  className="btn btn-primary"
                  type="button"
                  name="authorized"
                  value={true}
                  disabled={isEmpty(configsState.primaryDomainName)}
                  onClick={handleInput}
                >
                  Authorize Now
                </button>
                {configsState.authorized ? (
                  <span className="auth-section__success-msg">
                    <span className="auth-section__icon">✓</span> Authorized
                  </span>
                ) : (
                  <span className="auth-section__error-msg">
                    <span className="auth-section__icon">✗</span> Not
                    Authorized, click on Authorize Now
                  </span>
                )}
              </div>
            </div>
          </form>
        </InfoBox>
      </div>

      <div className="settings-pane-description">
        <h4>Description</h4>
        <p>
          Enter connection information for your Google domain account. You can
          synchronize to all the domain your Google Account is configured to
          administer. <a href="/">See example</a>
        </p>
      </div>
    </div>
  )
}

export default ConnectionSettings
