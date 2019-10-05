import React from "react"
import { create } from "react-test-renderer"

import TabBar from "../../../components/SettingsPane/TabBar"

describe("TabBar component:", () => {
  test.skip("Matches the snapshot", () => {
    let tabBar = create(<TabBar />)
    expect(tabBar.toJSON()).toMatchSnapshot()
  })
})
