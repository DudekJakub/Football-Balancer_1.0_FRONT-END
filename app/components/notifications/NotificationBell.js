import React, { useEffect, useState } from "react"
import { Badge, List, Popover } from "antd"
import { BellOutlined } from "@ant-design/icons"

export const NotificationBell = ({ currentUser }) => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const sse = new EventSource(`http://localhost:8085/api/notification/stream/user/private/${currentUser.id}`)

    function getRealtimeData(data) {
      setMessages(messages => [...messages, data])
    }

    sse.onmessage = e => getRealtimeData(JSON.parse(e.data))
    sse.onerror = () => {
      sse.close()
    }
    return () => {
      sse.close()
    }
  }, [])

  const rendererBadge = () => {
    return (
      <Badge offset={[-4, 6]} count={messages.length}>
        <BellOutlined style={{ fontSize: "34px", color: "" }} />
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
      <List
        // loading={initLoading}
        dataSource={messages}
        renderItem={message => (
          <List.Item className="item-not-read mt-2">
            <b>{message.requestType} for </b> {message.requesterUsername}
          </List.Item>
        )}
      />
    </div>
  )

  return (
    <>
      <Popover placement="bottomRight" title={notificationTitle} content={notificationList} trigger="click">
        {rendererBadge()}
      </Popover>
    </>
  )
}
