import React, { createContext, useState, useEffect } from "react"

export const RoomContext = createContext()

export const RoomProvider = ({ children }) => {
  // const [room, setRoom] = useState({
  //   id: "",
  //   name: "",
  //   description: "",
  //   isPublic: false
  //   // ...rest of the properties
  // })
  const [roomToFetchId, setRoomToFetchId] = useState("")
  const [room2, setRoom] = useState(() => {
    const storedRoom = localStorage.getItem("room")
    return storedRoom ? JSON.parse(storedRoom) : ""
  })

  const [roomDates, setRoomDates] = useState({
    nextMatchDate: "",
    nextMatchTime: {
      hour: "",
      minute: ""
    }
    // ...rest of the properties
  })

  useEffect(() => {
    if (roomToFetchId) {
      async function fetchRoomData() {
        try {
          const response = await Axios.post(
            `/api/room/basic-management/enter`,
            {
              password: state.providedRoomPassword,
              roomId: state.roomId,
              userId: appState.user.id
            },
            { headers: { Authorization: `Bearer ${appState.user.token}` } }
          )

          if (response.data) {
            appDispatch({
              type: "flashMessage",
              value: "Joined the room!",
              messageType: "message-green"
            })
            navigate(`/room/${state.roomId}`, { state: { responseData: response.data, navigated: true } })

            // setRoom(response.data)
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled." + e)

          if (e.response.status === 401) {
            setState(draft => {
              draft.wrongPasswordMessage = "WRONG PASSWORD"
            })
          }
        }
      }
    }
    localStorage.setItem("room", JSON.stringify(room2))
  }, [roomToFetchId])

  return <RoomContext.Provider value={{ room2, setRoom, roomDates, setRoomDates }}>{children}</RoomContext.Provider>
}
