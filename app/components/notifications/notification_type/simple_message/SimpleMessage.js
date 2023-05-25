import React, { useEffect } from "react"
import ReactTooltip from "react-tooltip"

function SimpleMessage(props) {
  // function handleDeleteNotification() {
  //   props.onDeleteNotification(props.notification.id)
  // }

  // useEffect(() => {
  //   if (props.onRenderAdditionalElements) {
  //     props.onRenderAdditionalElements(
  //       <>
  //         <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariant: "full-width", backgroundColor: "darkred", color: "white", marginLeft: "5px" }} data-tip="Remove notification permanently." data-for="remove" onClick={handleDeleteNotification}>
  //           delete
  //         </span>
  //         <ReactTooltip id="remove" className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={200} />
  //       </>
  //     )
  //   }
  // }, [])

  return <a key={props.index}>{props.notification.message}</a>
}

export default SimpleMessage
