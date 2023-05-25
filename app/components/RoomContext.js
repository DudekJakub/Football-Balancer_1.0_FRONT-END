import React, { createContext, useState, useContext, useEffect } from "react"
import Axios from "axios"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import moment from "moment/moment"
import { useImmer } from "use-immer"

export const RoomContext = createContext()

export const RoomProvider = ({ children }) => {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [roomId, setRoomId] = useState("")
  const [roomPassword, setRoomPassword] = useState("")
  const [wrongPassword, setWrongPassword] = useState(false)
  const [readyToEnter, setReadyToEnter] = useState(false)
  const [room, setRoom] = useState("")
  const [roomMetaInfo, setRoomMetaInfo] = useImmer({
    isUserAdmin: false,
    isUserMember: false,
    dataReady: false
  })
  const [roomDates, setRoomDates] = useImmer({
    nextMatchDate: "",
    nextMatchTime: {
      hour: "",
      minute: ""
    },
    nextMatchRegistrationOpenDate: "",
    nextMatchRegistrationOpenTime: {
      hour: "",
      minute: ""
    },
    nextMatchRegistrationEndDate: "",
    nextMatchRegistrationEndTime: {
      hour: "",
      minute: ""
    },
    dataReady: false
  })

  useEffect(() => {
    if (roomId) {
      async function fetchRoomData() {
        try {
          const response = await Axios.post(
            `/api/room/basic-management/enter`,
            {
              password: roomPassword,
              roomId: roomId,
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

            setRoom(response.data)
            setRoomMetaInfo(draft => {
              draft.isUserAdmin = response.data.users.filter(admin => admin.id == appState.user.id).length > 0
              draft.isUserMember = response.data.admins.filter(member => member.id == appState.user.id).length > 0
              draft.dataReady = true
            })
            setRoomDates(draft => {
              if (response.data.nextMatchDate) {
                draft.nextMatchDate = moment(response.data.nextMatchDate.split("T")[0]).format("MMMM DD YYYY")
                draft.nextMatchTime.hour = response.data.nextMatchDate.split("T")[1].split(":")[0]
                draft.nextMatchTime.minute = response.data.nextMatchDate.split("T")[1].split(":")[1]
              }
              if (response.data.nextMatchRegistrationStartDate) {
                draft.nextMatchRegistrationOpenDate = moment(response.data.nextMatchRegistrationStartDate.split("T")[0]).format("MMMM DD YYYY")
                draft.nextMatchRegistrationOpenTime.hour = response.data.nextMatchRegistrationStartDate.split("T")[1].split(":")[0]
                draft.nextMatchRegistrationOpenTime.minute = response.data.nextMatchRegistrationStartDate.split("T")[1].split(":")[1]
              }
              if (response.data.nextMatchRegistrationEndDate) {
                draft.nextMatchRegistrationEndDate = moment(response.data.nextMatchRegistrationEndDate.split("T")[0]).format("MMMM DD YYYY")
                draft.nextMatchRegistrationEndTime.hour = response.data.nextMatchRegistrationEndDate.split("T")[1].split(":")[0]
                draft.nextMatchRegistrationEndTime.minute = response.data.nextMatchRegistrationEndDate.split("T")[1].split(":")[1]
              }
              draft.dataReady = true
            })
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled." + e)
          if (e.response.status === 401) {
            setWrongPassword(true)
          }
        }
      }
      fetchRoomData()
    }
  }, [roomId])

  useEffect(() => {
    if (room && roomMetaInfo && roomMetaInfo.dataReady && roomDates && roomDates.dataReady) {
      setReadyToEnter(true)
    }
  }, [room, roomMetaInfo, roomDates])

  return (
    <RoomContext.Provider
      value={{
        setRoomId,
        setRoomPassword,
        wrongPassword,
        readyToEnter,
        setReadyToEnter,
        room,
        setRoom,
        roomMetaInfo,
        setRoomMetaInfo,
        roomDates,
        setRoomDates
      }}
    >
      {children}
    </RoomContext.Provider>
  )
}
