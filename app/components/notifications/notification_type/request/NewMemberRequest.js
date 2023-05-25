import React, { useEffect, useContext } from "react"
import Axios from "axios"
import StateContext from "../../../../StateContext"
import DispatchContext from "../../../../DispatchContext"

function NewMemberRequest(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  useEffect(() => {
    if (props.handleAccept) {
      handleAccept()
    }
    if (props.handleReject) {
      handleReject()
    }
  }, [props.handleAccept, props.handleReject])

  function handleAccept() {
    async function acceptRequest() {
      try {
        const response = await Axios.post(
          `/api/room/request/accept-new-member-request`,
          {
            userId: props.notification.senderId,
            roomAdminId: appState.user.id,
            roomId: props.notification.recipientId
          },
          { headers: { Authorization: `Bearer ${appState.user.token}` } }
        )
        if (response.request.status === 204) {
          handleMarkAsProcessed()
        }
      } catch (e) {
        console.log("There was a problem processing the request " + e)
        if (e.response.status === 409) {
          appDispatch({
            type: "flashMessage",
            value: "Request has been already processed !",
            messageType: "message-red"
          })
          props.notification.isProcessed = true
        }
        return
      }
    }
    acceptRequest()
  }

  function handleReject() {
    async function rejectRequest() {
      try {
        const response = await Axios.post(
          `/api/room/request/reject-new-member-request`,
          {
            userId: props.notification.senderId,
            roomAdminId: appState.user.id,
            roomId: props.notification.recipientId
          },
          { headers: { Authorization: `Bearer ${appState.user.token}` } }
        )
        if (response.request.status === 204) {
          handleMarkAsProcessed()
        }
      } catch (e) {
        console.log("There was a problem processing the request " + e)
        if (e.response.status === 409) {
          appDispatch({
            type: "flashMessage",
            value: "Request has been already processed !",
            messageType: "message-red"
          })
          props.notification.isProcessed = true
        }
        return
      }
    }
    rejectRequest()
  }

  function handleMarkAsProcessed() {
    async function markAsProcessed() {
      try {
        const response = await Axios.patch(`/api/notification/from-db/room/as-admin/mark-as-processed?roomId=${props.notification.recipientId}&adminId=${appState.user.id}&notificationId=${props.notification.id}`, {}, { headers: { Authorization: `Bearer ${appState.user.token}` } })
        if (response.request.status === 200) {
          props.notification.isProcessed = true
        }
      } catch (e) {
        console.log("There was a problem marking the request as processed " + e)
        return
      }
    }
    markAsProcessed()
  }

  return <a key={props.index}>{props.notification.message}</a>
}

export default NewMemberRequest
