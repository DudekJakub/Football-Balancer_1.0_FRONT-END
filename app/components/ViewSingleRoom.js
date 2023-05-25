import React, { useEffect, useState, useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import ReactTooltip from "react-tooltip"
import { useImmer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import { RoomContext } from "./RoomContext"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import Loading from "./Loading"
import NotFound from "./NotFound"
import RenderAvatar from "./Avatar"
import EditRoomBasic from "./EditRoomBasic"
import CustomMaterialSymbol from "./CustomMaterialSymbol"
import moment from "moment/moment"
import EditRoomDates from "./EditRoomDates"
import Map from "./Map"
import Axios from "axios"
import RoomManagement from "./roomManagement/RoomManagement"
import RoomAdminNotificationBox from "./notifications/RoomAdminNotificationBox"
import RoomUserNotificationBox from "./notifications/RoomUserNotificationBox"

function ViewSingleRoom() {
  const location = useLocation()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  // const { room2 } = useContext(RoomContext)
  const [room, setRoom] = useImmer({
    id: "",
    name: "",
    description: "",
    isPublic: false,
    isUserAdmin: false,
    isUserMember: false,
    admins: [],
    members: [],
    location: {
      city: "",
      zipCode: "",
      street: "",
      number: "",
      latitude: "",
      longitude: ""
    }
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
    }
  })
  const [state, setState] = useImmer({
    renderNotificationBox: false,
    renderEditDates: false,
    renderMap: false,
    renderDescription: true,
    renderEditSubPage: false,
    renderBalancerSubPage: false,
    renderManagementSubPage: false,
    isLoading: true
  })

  useEffect(() => {
    function fetchData() {
      if (location.state === undefined || location.state == null) return
      if (location.state.navigated) {
        const responseData = location.state.responseData
        const membersArray = responseData.users
        const adminsArray = responseData.admins

        setRoom(draft => {
          draft.id = responseData.id
          draft.name = responseData.name
          draft.description = responseData.description == null ? "" : responseData.description
          draft.isPublic = responseData.public
          draft.isUserAdmin = adminsArray.filter(admin => admin.id == appState.user.id).length > 0
          draft.isUserMember = membersArray.filter(member => member.id == appState.user.id).length > 0
          draft.admins = adminsArray
          draft.members = membersArray
          draft.location.city = responseData.location.city
          draft.location.zipCode = responseData.location.zipCode
          draft.location.street = responseData.location.street
          draft.location.number = responseData.location.number
          draft.location.latitude = responseData.location.latitude
          draft.location.longitude = responseData.location.longitude
        })

        setRoomDates(draft => {
          if (responseData.nextMatchDate) {
            draft.nextMatchDate = moment(responseData.nextMatchDate.split("T")[0]).format("MMMM DD YYYY")
            draft.nextMatchTime.hour = responseData.nextMatchDate.split("T")[1].split(":")[0]
            draft.nextMatchTime.minute = responseData.nextMatchDate.split("T")[1].split(":")[1]
          }
          if (responseData.nextMatchRegistrationStartDate) {
            draft.nextMatchRegistrationOpenDate = moment(responseData.nextMatchRegistrationStartDate.split("T")[0]).format("MMMM DD YYYY")
            draft.nextMatchRegistrationOpenTime.hour = responseData.nextMatchRegistrationStartDate.split("T")[1].split(":")[0]
            draft.nextMatchRegistrationOpenTime.minute = responseData.nextMatchRegistrationStartDate.split("T")[1].split(":")[1]
          }
          if (responseData.nextMatchRegistrationEndDate) {
            draft.nextMatchRegistrationEndDate = moment(responseData.nextMatchRegistrationEndDate.split("T")[0]).format("MMMM DD YYYY")
            draft.nextMatchRegistrationEndTime.hour = responseData.nextMatchRegistrationEndDate.split("T")[1].split(":")[0]
            draft.nextMatchRegistrationEndTime.minute = responseData.nextMatchRegistrationEndDate.split("T")[1].split(":")[1]
          }
        })

        setState(draft => {
          draft.isLoading = false
        })
      }
    }
    fetchData()
  }, [])

  function getStyleForBasicInfoSpan(color) {
    return { color: color, whiteSpace: "nowrap", fontVariant: "all-small-caps" }
  }

  function renderUploadPhotoButton() {
    if (room.isUserAdmin) {
      return (
        <div className="d-flex flex-row mt-3 ml-3">
          <Link to={""} data-tip="Upload" data-for="upload" className="text-primary mr-2">
            <span className="material-symbols-outlined link-black ml-auto" style={{ color: "#373991" }}>
              {" "}
              upload{" "}
            </span>
          </Link>
          <ReactTooltip id="upload" className="custom-tooltip" />
        </div>
      )
    }
  }

  useEffect(() => {
    if (!state.renderMap && !state.renderEditDates) {
      setTimeout(() => {
        setState(draft => {
          draft.renderDescription = true
        })
      }, 1300)
    } else {
      setState(draft => {
        draft.renderDescription = false
      })
    }
  }, [state.renderMap, state.renderEditDates])

  useEffect(() => {
    setState(draft => {
      draft.renderMap = false
      draft.renderEditDates = false
    })
  }, [state.renderEditSubPage, state.renderBalancerSubPage, state.renderManagementSubPage])

  function renderMapSwitcher() {
    setState(draft => {
      ;(draft.renderEditDates = false), (draft.renderDescription = false)
    })
    setTimeout(() => {
      setState(draft => {
        draft.renderMap = true
      })
    }, 1000)
  }

  function renderEditDatesSwitcher() {
    setState(draft => {
      ;(draft.renderMap = false), (draft.renderDescription = false)
    })
    setTimeout(() => {
      setState(draft => {
        draft.renderEditDates = true
      })
    }, 1000)
  }

  function renderNotificationBoxButton() {
    if (room.isUserAdmin || room.isUserMember) {
      return (
        <div className="notifications-box-container">
          <button
            className="notification-button"
            onClick={() =>
              setState(draft => {
                draft.renderNotificationBox = !draft.renderNotificationBox
              })
            }
          >
            NOTIFICATIONS | CHAT
          </button>
        </div>
      )
    }
  }

  function renderNotifificationBox() {
    if (room.isUserAdmin) {
      return <RoomAdminNotificationBox roomId={room.id} isRoomAdmin={room.isUserAdmin} />
    }
    if (room.isUserMember) {
      return <RoomUserNotificationBox roomId={room.id} />
    }
    return null
  }

  function resetRenderedSubPages() {
    setState(draft => {
      draft.renderEditSubPage = false
      draft.renderBalancerSubPage = false
      draft.renderManagementSubPage = false
    })
  }

  function handleRoomEdit(data) {
    setRoom(draft => {
      draft.name = data.name
      draft.description = data.description
      draft.isPublic = data.isPublic
      if (data.location) {
        draft.location = data.location
      }
    })
    setState(draft => {
      draft.renderEditSubPage = false
    })
  }

  function handleDatesUpdate(data) {
    setRoomDates(draft => {
      draft.nextMatchDate = data.nextMatchDate
      draft.nextMatchTime.hour = data.nextMatchTime.hour
      draft.nextMatchTime.minute = data.nextMatchTime.minute
      draft.nextMatchRegistrationOpenDate = data.nextMatchRegistrationOpenDate
      draft.nextMatchRegistrationOpenTime.hour = data.nextMatchRegistrationOpenTime.hour
      draft.nextMatchRegistrationOpenTime.minute = data.nextMatchRegistrationOpenTime.minute
      draft.nextMatchRegistrationEndDate = data.nextMatchRegistrationEndDate
      draft.nextMatchRegistrationEndTime.hour = data.nextMatchRegistrationEndTime.hour
      draft.nextMatchRegistrationEndTime.minute = data.nextMatchRegistrationEndTime.minute
    })
    setState(draft => {
      draft.renderEditDates = false
    })
  }

  async function handleAddUserRequest() {
    if (!room.isUserMember) {
      try {
        await Axios.post(`/api/room/request/new-member-request?roomId=${room.id}&requesterId=${appState.user.id}`, {}, { headers: { Authorization: `Bearer ${appState.user.token}` } })
      } catch (e) {
        if (e.response.status === 409) {
          console.log("There was a problem sending the request" + e)
          appDispatch({
            type: "flashMessage",
            value: "Request already sent !",
            messageType: "message-red"
          })
          return
        }
        console.log("There was a problem sending the request" + e)
        return
      }
      appDispatch({
        type: "flashMessage",
        value: "Request successfully sent !",
        messageType: "message-green"
      })
    }
  }

  // console.log(room2)

  if (!location.state || !location.state.navigated) return <NotFound />
  if (state.isLoading) return <Loading />
  return (
    <div>
      <div className="main d-flex flex-column container">
        <div className="mt-5"></div>
        <Link className="text-primary medium font-weight-bold" to={`/`}>
          &laquo; Back HOME
        </Link>
        {/* <div>{room2.name}</div>
        <div>{room2.description}</div>
        <div>{room2.public}</div> */}
        {renderNotificationBoxButton()}
        <CSSTransition in={state.renderNotificationBox} timeout={400} classNames="add-room-text" unmountOnExit>
          <>{renderNotifificationBox()}</>
        </CSSTransition>
        <div className="mobile-toggle">
          <h2 className="d-flex ml-auto mobile-toggle">
            <div className="d-flex p-2 align-items-center" data-tip={room.isUserMember ? "YOU'RE MEMBER" : "YOU AREN'T MEMBER YET. SEND REQUEST NOW!"} data-for={"acccess"}>
              <span className="material-symbols-outlined" style={{ fontSize: "25px", color: room.isUserMember ? "darkgreen" : "darkred", cursor: "pointer" }} onClick={handleAddUserRequest}>
                {room.isUserMember ? "person" : "person_add"}
              </span>
              <ReactTooltip id={"acccess"} className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={500} />
            </div>
            <div className="d-flex p-2 align-items-center" data-tip={room.isPublic ? "ROOM IS PUBLIC" : "ROOM IS PRIVATE"} data-for={"acccess"}>
              <span className="material-symbols-outlined mr-2" style={{ fontSize: "25px", color: room.isPublic ? "darkgreen" : "darkred", cursor: "pointer" }}>
                {room.isPublic ? "lock_open" : "lock"}
              </span>
              <ReactTooltip id={"acccess"} className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={500} />
            </div>
            <a className="d-flex" style={{ fontSize: "20px", fontFamily: "Georgia" }}>
              <p
                style={{
                  fontSize: "20px",
                  fontVariantCaps: "small-caps",
                  marginBottom: "0px"
                }}
              >
                {room.name}
              </p>
            </a>
          </h2>
        </div>
        <div className="content d-flex flex-column mt-1">
          <div className="content single-room-layout d-flex mb-2">
            <div className="single-room-layout-row">
              <div className="profile-avatar d-flex mr-4 flex-column align-items-center">
                <RenderAvatar />{" "}
              </div>
              <div className="d-flex flex-row" style={{ marginLeft: "3rem" }}>
                {renderUploadPhotoButton()}
              </div>
            </div>
            <div className="room-content container">
              {state.renderEditDates == false && state.renderMap == false && (
                <CSSTransition in={state.renderDescription} timeout={1300} classNames="room-description" unmountOnExit>
                  <div>{room.description}</div>
                </CSSTransition>
              )}
              <CSSTransition in={state.renderEditDates} timeout={1000} classNames="add-calendar" unmountOnExit>
                <div>
                  <EditRoomDates
                    roomId={room.id}
                    onSubmit={handleDatesUpdate}
                    onCancel={() =>
                      setState(draft => {
                        draft.renderEditDates = false
                      })
                    }
                    renderCondition={state.renderEditDates}
                  />
                </div>
              </CSSTransition>
              <CSSTransition in={state.renderMap} timeout={1000} classNames="add-map" unmountOnExit>
                <>
                  <Map location={{ lat: room.location.latitude, lng: room.location.longitude }} />
                </>
              </CSSTransition>
            </div>
            <div className="d-flex flex-column mr-2 ml-4 mt-1 align-items-center">
              <span style={getStyleForBasicInfoSpan("white")}>Next match on:</span>
              <span style={getStyleForBasicInfoSpan("wheat")}>{roomDates.nextMatchDate ? roomDates.nextMatchDate : "N/A"}</span>
              <span style={getStyleForBasicInfoSpan("wheat")}>{roomDates.nextMatchTime.hour ? roomDates.nextMatchTime.hour + " : " + roomDates.nextMatchTime.minute : "N/A"}</span>
              <span style={{ color: "#373991" }} className="material-symbols-outlined mt-2 mb-4" data-tip={"CHECK NEXT MATCH DATE"} data-for={"calendar"} onClick={renderEditDatesSwitcher}>
                calendar_month
              </span>
              <ReactTooltip id={"calendar"} className="custom-tooltip" delayShow={1000} />
              <span style={getStyleForBasicInfoSpan("white")}>Registration opens on:</span>
              <span style={getStyleForBasicInfoSpan("wheat")}>{roomDates.nextMatchRegistrationOpenDate ? roomDates.nextMatchRegistrationOpenDate : "N/A"}</span>
              <span style={getStyleForBasicInfoSpan("wheat")}>{roomDates.nextMatchRegistrationOpenTime.hour ? roomDates.nextMatchRegistrationOpenTime.hour + " : " + roomDates.nextMatchRegistrationOpenTime.minute : "N/A"}</span>
              <span style={{ marginTop: "20px" }}></span>
              <span style={getStyleForBasicInfoSpan("white")}>Registration ends on:</span>
              <span style={getStyleForBasicInfoSpan("wheat")}>{roomDates.nextMatchRegistrationEndDate ? roomDates.nextMatchRegistrationEndDate : "N/A"}</span>
              <span style={getStyleForBasicInfoSpan("wheat")}>{roomDates.nextMatchRegistrationEndTime.hour ? roomDates.nextMatchRegistrationEndTime.hour + " : " + roomDates.nextMatchRegistrationEndTime.minute : "N/A"}</span>
            </div>
          </div>
          <div className="d-flex flex-row mt-1 justify-content-center align-items-center">
            {!state.renderMap ? (
              <CustomMaterialSymbol name={"map"} fontSize={"30px"} fontColor={"#373991"} cursor={"pointer"} onClick={renderMapSwitcher} />
            ) : (
              <CustomMaterialSymbol
                name={"cancel"}
                fontSize={"30px"}
                fontColor={"#373991"}
                cursor={"pointer"}
                onClick={() =>
                  setState(draft => {
                    draft.renderMap = false
                  })
                }
              />
            )}
            <span style={getStyleForBasicInfoSpan("wheat")}>{room.location.city ? room.location.city : "N/A"}</span>
            <span style={getStyleForBasicInfoSpan("wheat")}>{room.location.street ? ", st. " + room.location.street + " " + room.location.number : ", N/A"}</span>
          </div>
        </div>
        <ul className="menu" style={{ fontVariant: "all-small-caps", cursor: "pointer" }}>
          <li>
            <a
              style={{ animation: state.renderBalancerSubPage ? "" : "animateButton 8s 1s", animationIterationCount: "infinite" }}
              onClick={() => {
                resetRenderedSubPages()
                setState(draft => {
                  draft.renderBalancerSubPage = true
                })
              }}
            >
              Balancer
            </a>
          </li>
          <li>
            <a
              onClick={() => {
                resetRenderedSubPages()
                setState(draft => {
                  draft.renderManagementSubPage = true
                })
              }}
            >
              Management
            </a>
          </li>
          {room.isUserAdmin && (
            <li>
              <a
                onClick={() => {
                  resetRenderedSubPages()
                  setState(draft => {
                    draft.renderEditSubPage = true
                  })
                }}
              >
                Edit
              </a>
            </li>
          )}
        </ul>
      </div>
      <CSSTransition in={state.renderEditSubPage} timeout={400} classNames="add-room-text" unmountOnExit>
        {<EditRoomBasic room={room} onSubmit={handleRoomEdit} />}
      </CSSTransition>
      <CSSTransition in={state.renderManagementSubPage} timeout={400} classNames="add-room-text" unmountOnExit>
        {<RoomManagement room={room} setRoom={setRoom} />}
      </CSSTransition>
    </div>
  )
}

export default ViewSingleRoom
