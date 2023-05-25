import React, { useEffect, useState } from "react"
import ReactTooltip from "react-tooltip"
import NotificationRequestTypeDispatcher from "./notification_type/request/NotificationRequestTypeDispatcher"
import SimpleMessage from "./notification_type/simple_message/SimpleMessage"

function NotificationTypeDispatcher(props) {
  const isRoomAdmin = props.isRoomAdmin
  const notification = props.notification
  const index = props.index
  const [additionalElements, setAdditionalElements] = useState(null)

  function dispatchNotificationByType() {
    switch (notification.messageType) {
      case "REQUEST":
        return <NotificationRequestTypeDispatcher key={index} notification={notification} onRenderAdditionalElements={setAdditionalElements} onDeleteNotification={props.onDeleteNotification} />
      case "SIMPLE_MESSAGE":
        return <SimpleMessage key={index} notification={notification} onRenderAdditionalElements={setAdditionalElements} onDeleteNotification={props.onDeleteNotification} />
    }
  }

  function renderAdditionalElements() {
    if (isRoomAdmin) {
      return additionalElements ? additionalElements : setDefaultADditionalElements()
    }
  }

  function setDefaultADditionalElements() {
    return (
      <>
        <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariant: "full-width", backgroundColor: "darkred", color: "white", marginLeft: "5px" }} data-tip="Remove notification permanently." data-for="remove" onClick={() => props.onDeleteNotification(notification.id)}>
          delete
        </span>
        <ReactTooltip id="remove" className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={200} />
      </>
    )
  }

  function renderDateIcon(notification) {
    const formattedDate = formatDate(notification)
    return (
      <>
        <span className="material-symbols-outlined mr-3 p-0" data-tip={formattedDate} data-for="date">
          info
        </span>
        <ReactTooltip id="date" className="custom-tooltip" delayShow={500} />
      </>
    )
  }

  function formatDate(notification) {
    const date = notification.sendTime
    const dateValues = [date[0], date[1] - 1, date[2], date[3], date[4], date[5]] //substracting 1 month from current date as JS date starts from 0 index
    return new Date(...dateValues).toLocaleString()
  }

  return (
    <div className="notification-container">
      <div>{renderDateIcon(notification)}</div>
      <div>{dispatchNotificationByType()}</div>
      <div>{renderAdditionalElements()}</div>
    </div>
  )
}

export default NotificationTypeDispatcher
