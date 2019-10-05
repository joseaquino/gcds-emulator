import React from "react"

import "./InfoBox.scss"

const InfoBox = ({ title, headingCentered, children }) => (
  <div className="info-box-container">
    <h4
      className={headingCentered ? "info-box-title centered" : "info-box-title"}
    >
      {title}
    </h4>
    {children}
  </div>
)

export default InfoBox
