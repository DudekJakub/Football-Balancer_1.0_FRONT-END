import React, { useEffect, useContext } from "react"
import { Link, useParams } from "react-router-dom"
import ReactTooltip from "react-tooltip"
import { useImmer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import { RoomContext } from "./RoomContext"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import Loading from "./Loading"
import RenderAvatar from "./Avatar"
import EditRoomBasic from "./EditRoomBasic"
import CustomMaterialSymbol from "./CustomMaterialSymbol"
import EditRoomDates from "./EditRoomDates"
import Map from "./Map"
import Axios from "axios"
import RoomManagement from "./roomManagement/RoomManagement"
import RoomAdminNotificationBox from "./notifications/RoomAdminNotificationBox"
import RoomUserNotificationBox from "./notifications/RoomUserNotificationBox"
import PasswordOverlay from "./PasswordOverlay"

function ViewSingleRoom() {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const roomId = useParams().id
  const { room, roomMetaInfo, roomDates, setRoom, readyToEnter, setReadyToEnter } = useContext(RoomContext)
  const [state, setState] = useImmer({
    renderNotificationBox: false,
    renderEditDates: false,
    renderMap: false,
    renderDescription: true,
    renderEditSubPage: false,
    renderBalancerSubPage: false,
    renderManagementSubPage: false,
    renderPasswordOverlay: false,
    isLoading: true
  })

  useEffect(() => {
    if (readyToEnter) {
      setState(draft => {
        draft.isLoading = false
      })
    } else {
      setState(draft => {
        draft.renderPasswordOverlay = true
      })
    }
  }, [readyToEnter])

  function getStyleForBasicInfoSpan(color) {
    return { color: color, whiteSpace: "nowrap", fontVariant: "all-small-caps" }
  }

  function renderUploadPhotoButton() {
    if (roomMetaInfo.isUserAdmin) {
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
    if (roomMetaInfo.isUserAdmin || roomMetaInfo.isUserMember) {
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
    if (roomMetaInfo.isUserAdmin) {
      return <RoomAdminNotificationBox roomId={room.id} isRoomAdmin={roomMetaInfo.isUserAdmin} />
    }
    if (roomMetaInfo.isUserMember) {
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

  async function handleAddUserRequest() {
    if (!roomMetaInfo.isUserMember) {
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

  if (state.renderPasswordOverlay)
    return (
      <PasswordOverlay
        roomId={roomId}
        onSubmit={() =>
          setState(draft => {
            draft.renderPasswordOverlay = false
          })
        }
      />
    )
  if (state.isLoading) return <Loading />
  return (
    <div className={state.renderPasswordOverlay ? "search-overlay-top shadow-sm" : ""}>
      <div className="main d-flex flex-column container">
        <div className="mt-5"></div>
        <Link className="text-primary medium font-weight-bold" to={`/`} onClick={() => setReadyToEnter(false)}>
          &laquo; Back HOME
        </Link>
        {renderNotificationBoxButton()}
        <CSSTransition in={state.renderNotificationBox} timeout={400} classNames="add-room-text" unmountOnExit>
          <>{renderNotifificationBox()}</>
        </CSSTransition>
        <div className="mobile-toggle">
          <h2 className="d-flex ml-auto mobile-toggle">
            <div className="d-flex p-2 align-items-center" data-tip={roomMetaInfo.isUserMember ? "YOU'RE MEMBER" : "YOU AREN'T MEMBER YET. SEND REQUEST NOW!"} data-for={"acccess"}>
              <span className="material-symbols-outlined" style={{ fontSize: "25px", color: roomMetaInfo.isUserMember ? "darkgreen" : "darkred", cursor: "pointer" }} onClick={handleAddUserRequest}>
                {roomMetaInfo.isUserMember ? "person" : "person_add"}
              </span>
              <ReactTooltip id={"acccess"} className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={500} />
            </div>
            <div className="d-flex p-2 align-items-center" data-tip={room.public ? "ROOM IS PUBLIC" : "ROOM IS PRIVATE"} data-for={"acccess"}>
              <span className="material-symbols-outlined mr-2" style={{ fontSize: "25px", color: room.public ? "darkgreen" : "darkred", cursor: "pointer" }}>
                {room.public ? "lock_open" : "lock"}
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
                    onSubmit={() =>
                      setState(draft => {
                        draft.renderEditDates = false
                      })
                    }
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
          {roomMetaInfo.isUserAdmin && (
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
        {
          <EditRoomBasic
            onSubmit={() =>
              setState(draft => {
                draft.renderEditSubPage = false
              })
            }
          />
        }
      </CSSTransition>
      <CSSTransition in={state.renderManagementSubPage} timeout={400} classNames="add-room-text" unmountOnExit>
        {<RoomManagement room={room} setRoom={setRoom} />}
      </CSSTransition>
    </div>
  )
}

export default ViewSingleRoom
