import React, { useEffect, useState } from "react"
import ReactTooltip from "react-tooltip"
import NewMemberRequest from "./NewMemberRequest"

function NotificationRequestTypeDispatcher(props) {
  const notification = props.notification
  const index = props.key
  const [accept, setAccept] = useState(false)
  const [reject, setReject] = useState(false)

  function dispatchRequestBySubType(index, notification) {
    switch (notification.messageSubType) {
      case "NEW_MEMBER":
        return (
          <>
            <NewMemberRequest key={index} notification={notification} handleAccept={accept} handleReject={reject} />
          </>
        )
    }
  }

  function handleDeleteRequest() {
    props.onDeleteNotification(notification.id)
  }

  useEffect(() => {
    if (props.onRenderAdditionalElements) {
      if (!notification.isProcessed) {
        props.onRenderAdditionalElements(
          <>
            <span
              className="material-symbols-outlined"
              onClick={() => {
                setAccept(true)
              }}
              style={{ fontSize: "20px", fontVariant: "full-width", backgroundColor: "green", color: "white" }}
            >
              check
            </span>
            <span
              className="material-symbols-outlined"
              onClick={() => {
                setReject(true)
              }}
              style={{ fontSize: "20px", fontVariant: "full-width", backgroundColor: "darkred", color: "white", marginLeft: "5px" }}
            >
              close
            </span>
          </>
        )
      } else {
        props.onRenderAdditionalElements(
          <>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariant: "full-width", backgroundColor: "green", color: "white", cursor: "help" }} data-tip="Request has been already processed." data-for="info">
              published_with_changes
            </span>
            <ReactTooltip id="info" className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={200} />
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariant: "full-width", backgroundColor: "darkred", color: "white", marginLeft: "5px" }} data-tip="Remove request permanently." data-for="remove" onClick={handleDeleteRequest}>
              delete
            </span>
            <ReactTooltip id="remove" className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={200} />
          </>
        )
      }
    }
  }, [notification.isProcessed])

  return <>{dispatchRequestBySubType(index, notification, props.handleAccept, props.handleReject)}</>
}

export default NotificationRequestTypeDispatcher
