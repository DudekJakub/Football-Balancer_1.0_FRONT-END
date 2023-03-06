import React, { useEffect, useContext } from "react"
import { useState } from "react"
import StateContext from "../StateContext"

function SubmitOrCancelButton(props) {
  function handleSubmit() {
    props.handleSubmitNewMatchDate()
  }

  function handleCancel() {
    props.handleCancelNewMatchDate()
  }

  return (
    <div className="d-flex flex-row mt-3 justify-content-center">
      <div className="d-flex flex-row mr-3" style={{ backgroundColor: "#2f3061", border: "solid #2f3061", borderRadius: "10px", padding: "5px", animation: "animateButton 5s 2s", animationIterationCount: "infinite" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "25px", color: "lightgreen", cursor: "pointer" }} onClick={handleSubmit}>
          task_alt{" "}
        </span>
      </div>
      <div className="d-flex flex-row" style={{ backgroundColor: "#2f3061", border: "solid #2f3061", borderRadius: "10px", padding: "5px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "25px", color: "red", cursor: "pointer" }} onClick={handleCancel}>
          cancel{" "}
        </span>
      </div>
    </div>
  )
}

export default SubmitOrCancelButton
