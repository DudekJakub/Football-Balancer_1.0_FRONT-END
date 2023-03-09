import React, { useEffect, useContext } from "react"
import { useState } from "react"
import StateContext from "../StateContext"
import { CSSTransition } from "react-transition-group"

function SubmitOrCancelButton(props) {
  function handleSubmit() {
    props.handleSubmit()
  }

  function handleCancel() {
    props.handleCancel()
  }

  return (
    <div className="d-flex flex-row mt-3 justify-content-center">
      <div className="d-flex flex-row mr-3" style={{ backgroundColor: "#2f3061", border: "solid #2f3061", borderRadius: "10px", padding: "5px", animation: "animateButton 5s 2s", animationIterationCount: "infinite" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "25px", color: "lightgreen", cursor: "pointer" }} onClick={handleSubmit}>
          task_alt{" "}
        </span>
      </div>
      <span
        className="form-group d-flex mt-1"
        style={{
          fontSize: "13px",
          justifyContent: "center",
          whiteSpace: "nowrap"
        }}
      >
        <CSSTransition in={props.errorCondition} timeout={330} classNames="liveValidateMessage" unmountOnExit>
          <div className="alert alert-danger liveValidateMessage mt-5">{props.errorMessage}</div>
        </CSSTransition>
      </span>
      <div className="d-flex flex-row" style={{ backgroundColor: "#2f3061", border: "solid #2f3061", borderRadius: "10px", padding: "5px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "25px", color: "red", cursor: "pointer" }} onClick={handleCancel}>
          cancel{" "}
        </span>
      </div>
    </div>
  )
}

export default SubmitOrCancelButton
