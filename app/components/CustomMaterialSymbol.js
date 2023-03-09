import React, { useRef, useEffect } from "react"
import ReactTooltip from "react-tooltip"

function CustomMaterialSymbol(props) {
  var color = props.fontColor === undefined ? "#3336da" : props.fontColor
  var fontSize = props.fontSize === undefined ? "25px" : props.fontSize
  return (
    <div className="d-flex ml-3 p-2 align-items-center" data-tip={props.dataTip} data-for={props.dataTip}>
      <span className="material-symbols-outlined mr-2" style={{ fontSize: fontSize, color: color, cursor: props.cursor }} onClick={props.onClick}>
        {" "}
        {props.name}{" "}
      </span>{" "}
      {props.data}
      <ReactTooltip id={props.dataTip} className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={500} />
    </div>
  )
}

export default CustomMaterialSymbol
