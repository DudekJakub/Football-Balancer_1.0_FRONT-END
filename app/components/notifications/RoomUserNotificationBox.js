import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import StateContext from "../../StateContext"
import { Badge } from "antd"
import NotificationTypeDispatcher from "./NotificationTypeDispatcher"
import useWebSocket from "react-use-websocket"

function RoomUserNotificationBox(props) {
  const appState = useContext(StateContext)
  const [notificationsForRoom, setNotificationsForRoom] = useState([])
  const [activeTab, setActiveTab] = useState("ROOM")
  const [roomBadgeCount, setRoomBadgeCount] = useState(0)
  const roomSocketUrl = `ws://localhost:8083/websocket/api/notification/stream/room/as-user/${props.roomId}`
  const roomSocket = useWebSocket(roomSocketUrl, {
    queryParams: { userId: appState.user.id, Bearer: `${appState.user.token}` },
    onOpen: e => console.log("opened", e),
    onClose: e => console.log("closed", e),
    onMessage: e => getRealtimeDataFromRoomStream(JSON.parse(e.data))
  })

  function getRealtimeDataFromRoomStream(data) {
    setNotificationsForRoom(notificationsForRoom => [data, ...notificationsForRoom])
    setRoomBadgeCount(roomBadgeCount => roomBadgeCount + 1)
  }

  const handleTabClick = tab => {
    setActiveTab(tab)
    resetBadgeCountForTab(tab)
  }

  const rendererRoomBadge = () => {
    return <Badge offset={[8, 0]} size={"small"} count={roomBadgeCount}></Badge>
  }

  const resetBadgeCountForTab = tab => {
    if (tab === "ROOM") {
      setRoomBadgeCount(0)
    }
  }

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

  return (
    <div className="notifications-box-container">
      <div className="notifications-box" style={{ width: "60%" }}>
        <div className="tabs">
          <div className={`tab room-tab ${activeTab === "ROOM" ? "active" : ""}`} onClick={() => handleTabClick("ROOM")}>
            ROOM
            {rendererRoomBadge()}
          </div>
          <div className={`tab chat-tab ${activeTab === "CHAT" ? "active" : ""}`} onClick={() => handleTabClick("CHAT")}>
            CHAT
          </div>
        </div>
        <div className="notifications" style={{ fontVariant: "all-small-caps", color: "whitesmoke" }}>
          {activeTab === "ROOM" && notificationsForRoom.map((notification, index) => <NotificationTypeDispatcher key={index} notification={notification} />)}
        </div>
      </div>
    </div>
  )
}

export default RoomUserNotificationBox
