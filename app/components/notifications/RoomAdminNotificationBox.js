import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"
import { Badge } from "antd"
import NotificationTypeDispatcher from "./NotificationTypeDispatcher"
import useWebSocket from "react-use-websocket"

function RoomAdminNotificationBox(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [notificationsForAdmin, setNotificationsForAdmin] = useState([])
  const [notificationsForRoom, setNotificationsForRoom] = useState([])
  const [activeTab, setActiveTab] = useState("ADMIN")
  const [adminBadgeCount, setAdminBadgeCount] = useState(0)
  const [roomBadgeCount, setRoomBadgeCount] = useState(0)
  const adminSocketUrl = `ws://localhost:8083/websocket/api/notification/stream/room/as-admin/${props.roomId}`
  const roomSocketUrl = `ws://localhost:8083/websocket/api/notification/stream/room/as-user/${props.roomId}`
  const adminSocket = useWebSocket(adminSocketUrl, {
    queryParams: { userId: appState.user.id, Bearer: `${appState.user.token}` },
    onOpen: e => console.log("opened", e),
    onClose: e => console.log("closed", e),
    onMessage: e => getRealtimeDataFromAdminsStream(JSON.parse(e.data))
  })
  const roomSocket = useWebSocket(roomSocketUrl, {
    queryParams: { userId: appState.user.id, Bearer: `${appState.user.token}` },
    onOpen: e => console.log("opened", e),
    onClose: e => console.log("closed", e),
    onMessage: e => getRealtimeDataFromRoomStream(JSON.parse(e.data))
  })

  function getRealtimeDataFromAdminsStream(data) {
    setNotificationsForAdmin(notificationsForAdmin => [data, ...notificationsForAdmin])
    setAdminBadgeCount(adminBadgeCount => adminBadgeCount + 1)
  }

  function getRealtimeDataFromRoomStream(data) {
    setNotificationsForRoom(notificationsForRoom => [data, ...notificationsForRoom])
    setRoomBadgeCount(roomBadgeCount => roomBadgeCount + 1)
  }

  const handleTabClick = tab => {
    setActiveTab(tab)
    resetBadgeCountForTab(tab)
  }

  const rendererAdminBadge = () => {
    return <Badge offset={[8, 0]} size={"small"} count={adminBadgeCount}></Badge>
  }

  const rendererRoomBadge = () => {
    return <Badge offset={[8, 0]} size={"small"} count={roomBadgeCount}></Badge>
  }

  const resetBadgeCountForTab = tab => {
    if (tab === "ADMIN") {
      setAdminBadgeCount(0)
    } else if (tab === "ROOM") {
      setRoomBadgeCount(0)
    }
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function getNotificationsFromDb() {
      try {
        const response = await Axios.get(`/api/notification/from-db/room/as-admin?roomId=${props.roomId}&adminId=${appState.user.id}`, { headers: { Authorization: `Bearer ${appState.user.token}` } }, { cancelToken: ourRequest.token })
        const notifications = response.data.map(notification => notification)
        setNotificationsForAdmin(notificationsForAdmin => [...notificationsForAdmin, ...notifications])
      } catch (e) {
        console.log("There was a problem fetching notifications", e)
        return
      }
    }
    getNotificationsFromDb()

    return () => {
      ourRequest.cancel()
    }
  }, [])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function getNotificationsFromDb() {
      try {
        const response = await Axios.get(`/api/notification/from-db/room/as-user?roomId=${props.roomId}&userId=${appState.user.id}`, { headers: { Authorization: `Bearer ${appState.user.token}` } }, { cancelToken: ourRequest.token })
        const notifications = response.data.map(notification => notification)
        setNotificationsForRoom(notificationsForRoom => [...notificationsForRoom, ...notifications])
      } catch (e) {
        console.log("There was a problem fetching notifications", e)
        return
      }
    }
    getNotificationsFromDb()

    return () => {
      ourRequest.cancel()
    }
  }, [])

  const handleDeleteNotification = notificationId => {
    const notificationIndexFromAdminArrayToDelete = notificationsForAdmin.findIndex(notification => notification.id === notificationId)
    const notificationIndexFromRoomArrayToDelete = notificationsForRoom.findIndex(notification => notification.id === notificationId)
    var targetRepository = ""

    if (notificationIndexFromAdminArrayToDelete !== -1) {
      targetRepository = "as-admin"
    } else if (notificationIndexFromRoomArrayToDelete !== -1) {
      targetRepository = "as-user"
    } else {
      console.log("Notification with given ID not found!")
      return
    }

    function deleteNotificationFromArray(targetRepository) {
      switch (targetRepository) {
        case "as-admin":
          setNotificationsForAdmin(prevNotifications => prevNotifications.filter(n => n.id !== notificationId))
          break
        case "as-user":
          setNotificationsForRoom(prevNotifications => prevNotifications.filter(n => n.id !== notificationId))
          break
      }
      appDispatch({
        type: "flashMessage",
        value: "Notification has been deleted permanently!",
        messageType: "message-green"
      })
    }

    async function deleteNotificationFromDb() {
      try {
        const response = await Axios.delete(`/api/notification/from-db/room/${targetRepository}?roomId=${props.roomId}&adminId=${appState.user.id}&notificationId=${notificationId}`, { headers: { Authorization: `Bearer ${appState.user.token}` } })
        if (response.request.status === 200) {
          deleteNotificationFromArray(targetRepository)
        }
      } catch (e) {
        console.log("There was a problem deleting the notification from data-base with given id: " + notificationId + " | ", e)
        if (e.response.status === 404) {
          console.log("Notification could not be deleted from data-base but it was deleted locally!")
          deleteNotificationFromArray(targetRepository)
        }
        return
      }
    }
    deleteNotificationFromDb()
  }

  return (
    <div className="notifications-box-container">
      <div className="notifications-box" style={{ width: "60%" }}>
        <div className="tabs">
          <div className={`tab admin-tab ${activeTab === "ADMIN" ? "active" : ""}`} onClick={() => handleTabClick("ADMIN")}>
            ADMIN
            {rendererAdminBadge()}
          </div>
          <div className={`tab room-tab ${activeTab === "ROOM" ? "active" : ""}`} onClick={() => handleTabClick("ROOM")}>
            ROOM
            {rendererRoomBadge()}
          </div>
          <div className={`tab chat-tab ${activeTab === "CHAT" ? "active" : ""}`} onClick={() => handleTabClick("CHAT")}>
            CHAT
          </div>
        </div>
        <div className="notifications" style={{ fontVariant: "all-small-caps", color: "whitesmoke" }}>
          {activeTab === "ADMIN" && notificationsForAdmin.map((notification, index) => <NotificationTypeDispatcher key={index} notification={notification} isRoomAdmin={props.isRoomAdmin} onDeleteNotification={handleDeleteNotification} />)}
          {activeTab === "ROOM" && notificationsForRoom.map((notification, index) => <NotificationTypeDispatcher key={index} notification={notification} isRoomAdmin={props.isRoomAdmin} onDeleteNotification={handleDeleteNotification} />)}
        </div>
      </div>
    </div>
  )
}

export default RoomAdminNotificationBox
