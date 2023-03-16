import React, { useEffect, useState } from "react"
import ReactTooltip from "react-tooltip"

function RequestNotification(props) {
  const notification = props.notification
  const index = props.key

  useEffect(() => {
    if (props.handleAccept) {
      handleAccept()
    }
    if (props.handleReject) {
      handleReject()
    }
  }, [props.handleAccept, props.handleReject])

  function handleAccept() {
    console.log("accepted!")
  }

  function handleReject() {
    console.log("rejected!")
  }

  return (
    <div data-tip="Check sender" data-for="info">
      <div key={index}>{notification.message}</div>
      <ReactTooltip id="info" className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={500} />
    </div>
  )
}

export default RequestNotification
