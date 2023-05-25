import React, { useContext, useEffect, useState } from "react"
import Axios from "axios"
import StateContext from "../../StateContext"

const NotificationContext = React.createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const appState = useContext(StateContext)
  const currentUserId = appState.user.id

  useEffect(() => {
    if (appState.isLoggedIn) {
      Axios.get(`/api/notification/from-db/private-user?userId=${currentUserId}`, { headers: { Authorization: `Bearer ${appState.user.token}` } }).then(response => setNotifications(response.data))
    }
  }, [appState.isLoggedIn])

  return <NotificationContext.Provider value={{ notifications, setNotifications }}>{children}</NotificationContext.Provider>
}

export default NotificationContext
