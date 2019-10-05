import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"

import "./global-styles/main.scss"

import store from "./data/store"
import App from "./components/App"

const rootElement = document.getElementById("root")
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
