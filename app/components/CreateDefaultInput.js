import React, { useState, useContext, useEffect } from "react"
import { CSSTransition } from "react-transition-group"
import PropTypes from "prop-types"

function CreateDefaultInput(props) {
  function getMainDivStyle() {
    if (props.mainStyle === undefined) {
      return {
        paddingTop: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    }
    return props.mainStyle
  }

  function getTransitionTrigger() {
    if (props.transitionTrigger === undefined) {
      return null
    }
    return props.transitionTrigger
  }

  function getTransactionConditionWithMessage() {
    if (props.transactionConditionAndMessage === undefined) {
      return null
    }
    return props.transactionConditionAndMessage
  }

  function getInputStyle() {
    if (props.inputStyle === undefined) {
      return null
    }
    return props.inputStyle
  }

  function getType() {
    if (props.type === undefined) {
      return "text"
    }
    return props.type
  }

  function getAutoFocus() {
    if (props.autoFocus === undefined) {
      return false
    }
    return props.autoFocus
  }

  return (
    <div className={props.className} style={getMainDivStyle()}>
      <span
        style={{
          fontSize: "18px",
          fontVariant: "all-small-caps",
          marginBottom: "10px"
        }}
      >
        {props.name}:
      </span>
      <input
        value={props.initialValue}
        style={getInputStyle()}
        autoFocus={getAutoFocus()}
        onChange={e => {
          props.onChange(e.target.value)
        }}
        type={getType()}
      />
      <span
        className="form-group d-flex"
        style={{
          fontSize: "13px",
          justifyContent: "center",
          whiteSpace: "nowrap"
        }}
      >
        <CSSTransition in={getTransitionTrigger()} timeout={330} classNames="liveValidateMessage" unmountOnExit>
          <div className="alert alert-danger liveValidateMessage mt-2">{getTransactionConditionWithMessage()}</div>
        </CSSTransition>
      </span>
    </div>
  )
}

CreateDefaultInput.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default CreateDefaultInput
