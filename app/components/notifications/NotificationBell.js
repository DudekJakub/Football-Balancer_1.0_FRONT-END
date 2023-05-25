import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import { Badge, List, Popover } from "antd"
import { BellOutlined } from "@ant-design/icons"
import useWebSocket from "react-use-websocket"
import StateContext from "../../StateContext"

export const NotificationBell = ({ currentUser }) => {
  const appState = useContext(StateContext)
  const [userPrivateUnreadNotifications, setUserPrivateUnreadNotifications] = useState([])
  const [userPrivateReadNotifications, setUserPrivateReadNotifications] = useState([])
  const socketUrl = `ws://localhost:8083/websocket/api/notification/stream/private-user/${currentUser.id}`
  const socket =
    currentUser &&
    useWebSocket(socketUrl, {
      queryParams: { Bearer: `${appState.user.token}` },
      onOpen: e => console.log("opened", e),
      onClose: e => console.log("closed", e),
      onMessage: e => getRealtimeData(JSON.parse(e.data))
    })

  function getRealtimeData(data) {
    setUserPrivateUnreadNotifications(notifications => [data, ...notifications])
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function getNotificationsFromDb() {
      try {
        const response = await Axios.get(`/api/notification/from-db/private-user?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${appState.user.token}` } }, { cancelToken: ourRequest.token })
        const unreadNotifications = response.data.filter(notification => !notification.isRead)
        const readNotifications = response.data.filter(notification => notification.isRead)
        setUserPrivateUnreadNotifications(userPrivateUnreadNotifications => [...userPrivateUnreadNotifications, ...unreadNotifications])
        setUserPrivateReadNotifications(userPrivateReadNotifications => [...userPrivateReadNotifications, ...readNotifications])
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

  function markNotificationAsRead(notificationId) {
    const notificationIndex = userPrivateUnreadNotifications.findIndex(notification => notification.id === notificationId)
    if (notificationIndex !== -1) {
      const notification = userPrivateUnreadNotifications[notificationIndex]
      setUserPrivateUnreadNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notificationId))
      setUserPrivateReadNotifications(prevNotifications => [notification, ...prevNotifications])
    }

    const ourRequest = Axios.CancelToken.source()
    async function updateNotificationInDb() {
      try {
        await Axios.patch(`/api/notification/from-db/private-user?userId=${currentUser.id}&notificationId=${notificationId}`, {}, { headers: { Authorization: `Bearer ${appState.user.token}` } }, { cancelToken: ourRequest.token })
      } catch (e) {
        console.log("There was a problem fetching notifications", e)
        return
      }
    }
    updateNotificationInDb()

    return () => {
      ourRequest.cancel()
    }
  }

  function formatDate(notification) {
    const date = notification.sendTime
    const dateValues = [date[0], date[1], date[2], date[3], date[4], date[5]]
    const newDate = new Date(...dateValues)
    const year = newDate.getFullYear()
    const month = newDate.getMonth().toString().padStart(2, "0")
    const day = newDate.getDate().toString().padStart(2, "0")
    const hours = newDate.getHours().toString().padStart(2, "0")
    const minutes = newDate.getMinutes().toString().padStart(2, "0")

    return <a style={{ fontSize: "11px" }}>{`${year}-${month}-${day} ${hours}:${minutes}`}</a>
  }

  const rendererBadge = () => {
    return (
      <Badge offset={[-4, 6]} count={userPrivateUnreadNotifications.length}>
        <BellOutlined style={{ fontSize: "34px", color: "", cursor: "pointer" }} />
      </Badge>
    )
  }

  const notificationTitle = (
    <span>
      <b>Notifications</b>
    </span>
  )

  const notificationList = (
    <div
      style={{
        height: 350,
        width: 300,
        overflow: "auto"
      }}
    >
      <div style={{ fontVariant: "all-small-caps", textAlign: "center" }}>UNREAD</div>
      <List
        dataSource={userPrivateUnreadNotifications}
        renderItem={notification => (
          <List.Item className="item-not-read mt-2" style={{ display: "grid" }}>
            {formatDate(notification)}
            <span
              onClick={() => {
                markNotificationAsRead(notification.id)
              }}
            >
              <a>{notification.message}</a>
            </span>
          </List.Item>
        )}
      />
      <div style={{ fontVariant: "all-small-caps", textAlign: "center" }}>READ</div>
      <List
        dataSource={userPrivateReadNotifications}
        renderItem={notification => (
          <List.Item className="item-read mt-2" style={{ display: "grid" }}>
            {formatDate(notification)}
            <span>{notification.message}</span>
          </List.Item>
        )}
      />
    </div>
  )

  return (
    <>
      <Popover placement="bottomRight" title={notificationTitle} content={notificationList}>
        {" "}
        {rendererBadge()}
      </Popover>
    </>
  )
}
