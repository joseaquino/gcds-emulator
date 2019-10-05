import React, { useEffect, useRef } from "react"
import Maybe from "crocks/Maybe"
import { createPortal } from "react-dom"

import applyTo from "crocks/combinators/applyTo"
import constant from "crocks/combinators/constant"
import ifElse from "crocks/logic/ifElse"
import isFunction from "crocks/predicates/isFunction"
import isNil from "crocks/predicates/isNil"
import isTrue from "crocks/predicates/isTrue"
import not from "crocks/logic/not"
import safe from "crocks/Maybe/safe"

import appendChild from "../packages/fquery/appendChild"
import createElement from "../packages/fquery/createElement"
import doc from "../packages/fquery/doc"
import setElementAttribute from "../packages/fquery/setElementAttribute"

import "./SettingsModal.scss"

// isNotNull :: a -> Boolean
const isNotNull = not(isNil)

// appendToBody :: HTMLNode -> Effect String HTMLNode
const appendToBody = elem =>
  doc
    .map(d => d.body)
    .map(appendChild)
    .chain(applyTo(elem))
    .map(constant(elem))

// createBackdrop :: Effect String HTMLNode
const createBackdrop = createElement("div")
  .chain(setElementAttribute("id", "settings-modal-backdrop"))
  .chain(appendToBody)

// SettingsModal :: ReactProps -> ReactElement
const SettingsModal = ({ children, isOpen }) => (
  <SettingsModal.Backdrop isOpen={isOpen}>
    <SettingsModal.Modal>{children}</SettingsModal.Modal>
  </SettingsModal.Backdrop>
)

// Backdrop :: ReactProps -> ReactComponent
const Backdrop = ({ children, isOpen }) => {
  let backdropElem = useRef(null)

  useEffect(() => {
    if (isOpen) {
      return () => {
        safe(isNotNull, backdropElem.current).map(ref => ref.remove())
      }
    }
  }, [isOpen])

  // insertBackdrop :: () -> Maybe HTMLNode
  const insertBackdrop = () =>
    ifElse(
      isNotNull,
      elem =>
        appendToBody(elem)
          .map(Maybe.Just)
          .run(
            err =>
              console.error("Failed to append Modal backdrop.", err) ||
              Maybe.Nothing()
          ),
      () =>
        createBackdrop
          .map(elem => (backdropElem.current = elem))
          .map(Maybe.Just)
          .run(
            err =>
              console.error("Failed to create Modal backdrop.", err) ||
              Maybe.Nothing()
          ),
      backdropElem.current
    )

  return safe(isTrue, isOpen)
    .chain(insertBackdrop)
    .either(constant(null), constant(children))
}

SettingsModal.Backdrop = Backdrop

SettingsModal.Modal = ({ children }) => {
  return createPortal(
    <div id="settings-modal-container">
      <div className="settings-modal">{children}</div>
    </div>,
    document.getElementById("settings-pane")
  )
}

SettingsModal.Title = ({ text, onClose }) => (
  <div className="settings-modal__title">
    <span className="settings-modal__icon">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M2.99959 15H1V31H25.9949V29H2.99959V15Z" fill="#163499" />
        <rect x="23.9951" y="8" width="2" height="21" fill="#CBD6E5" />
        <rect x="7.99841" y="6" width="17.9963" height="2" fill="#93A5D1" />
        <path
          d="M31.6677 1.90543C29.3523 5.47857 15.1218 26.5292 13.4973 26.5292C11.4977 26.5292 6.4985 18.504 5.93802 16.9573C5.1903 14.8939 6.88003 15.0386 8.18571 16.2792C9.2637 17.3034 12.0601 20.5041 13.1222 20.5041C15.3093 20.5041 29.6023 2.68036 30.6557 1.24272C31.7092 -0.194922 32.4646 0.675746 31.6677 1.90543Z"
          fill="#E37F37"
        />
      </svg>
    </span>
    <h1>{text}</h1>
    {safe(isFunction, onClose).either(constant(null), fn => (
      <button onClick={() => fn()}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24.2918 6L25.706 7.41418L17.419 15.7011L25.706 23.9881L24.2918 25.4023L16.0048 17.1154L7.71787 25.4023L6.30366 23.9881L14.5906 15.7011L6.30366 7.41418L7.71788 6L16.0048 14.2869L24.2918 6Z"
            fill="#030303"
          />
        </svg>
      </button>
    ))}
  </div>
)

SettingsModal.Description = ({ children }) => (
  <p className="settings-modal__description">{children}</p>
)

SettingsModal.Content = ({ children }) => (
  <div className="settings-modal__content">{children}</div>
)

export default SettingsModal
