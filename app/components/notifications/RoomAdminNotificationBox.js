import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import StateContext from "../../StateContext"
import { Badge, List, Popover } from "antd"
import NotificationTypeDispatcher from "./NotificationTypeDispatcher"
import useWebSocket from "react-use-websocket"

function RoomAdminNotificationBox(props) {
  const appState = useContext(StateContext)
  const [notificationsForAdmin, setNotificationsForAdmin] = useState([])
  const [notificationsForRoom, setNotificationsForRoom] = useState([])
  const [activeTab, setActiveTab] = useState("ADMIN")
  const [adminBadgeCount, setAdminBadgeCount] = useState(0)
  const [roomBadgeCount, setRoomBadgeCount] = useState(0)
  const adminSocketUrl = `ws://localhost:8083/api/notification/stream/room/as-admin/${props.roomId}`
  const socket = useWebSocket(adminSocketUrl, {
    onOpen: e => console.log("opened", e),
    onClose: e => console.log("closed", e),
    onMessage: e => getRealtimeData(JSON.parse(e.data))
  })

  function getRealtimeData(data) {
    setNotificationsForAdmin(notificationsForAdmin => [...notificationsForAdmin, data])
    setAdminBadgeCount(adminBadgeCount => adminBadgeCount + 1)
  }

  const handleTabClick = tab => {
    setActiveTab(tab)
    resetBadgeCountForTab(tab)
  }

  const rendererAdminBadge = () => {
    return <Badge offset={[8, 0]} size={"small"} count={adminBadgeCount}></Badge>
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
          </div>
          <div className={`tab chat-tab ${activeTab === "CHAT" ? "active" : ""}`} onClick={() => handleTabClick("CHAT")}>
            CHAT
          </div>
        </div>
        <div className="notifications" style={{ fontVariant: "all-small-caps", color: "whitesmoke" }}>
          {activeTab === "ADMIN" && notificationsForAdmin.map((notification, index) => <NotificationTypeDispatcher key={index} notification={notification} />)}
          {activeTab === "ROOM" && notificationsForRoom.map((notification, index) => <NotificationTypeDispatcher key={index} notification={notification} />)}
        </div>
      </div>
    </div>
  )
}

export default RoomAdminNotificationBox
