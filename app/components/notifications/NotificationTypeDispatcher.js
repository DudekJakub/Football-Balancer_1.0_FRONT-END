import React, { useEffect, useState } from "react"
import RequestNotification from "./notification_type/RequestNotification"

function NotificationTypeDispatcher(props) {
  const notification = props.notification
  const index = props.index

  function dispatchNotificationByType() {
    if (notification.messageType == "REQUEST") {
      const [accept, setAccept] = useState(false)
      const [reject, setReject] = useState(false)
      return (
        <div className="notification-container">
          <RequestNotification key={index} notification={notification} handleAccept={accept} handleReject={reject} />
          <div className="button-container">
            <button onClick={() => setAccept(true)}>V</button>
            <button onClick={() => setReject(true)}>X</button>
          </div>
        </div>
      )
    }
  }

  return dispatchNotificationByType()
}

export default NotificationTypeDispatcher
