import React, { useEffect, useState, useContext } from "react"
import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import ReactTooltip from "react-tooltip"
import Axios from "axios"
import { useImmer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import Loading from "./Loading"
import NotFound from "./NotFound"
import moment from "moment/moment"
import LikeButton from "./LikeButton"
import RenderAvatar from "./Avatar"
import DeleteModal from "./DeleteModal"
import RefreshButton from "./RefreshButton"
import EditRoomBasic from "./EditRoomBasic"
import Calendar from "./Calendar"
import SubmitOrCancelButton from "./SubmitOrCancelButton"

function ViewSingleRoom(props) {
  const location = useLocation()
  const [navigated, setNavigated] = useState(false)
  const { id } = useParams()
  const [admins, setAdmins] = useState([])
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [refreshRequest, setRefreshRequest] = useState(false)
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const [room, setRoom] = useImmer({
    id: "",
    name: "",
    description: "",
    isPublic: false,
    nextMatchDate: "",
    nextMatchTime: {
      hour: "",
      minute: ""
    },
    location: {
      city: "",
      zipCode: "",
      street: "",
      number: ""
    }
  })
  const [state, setState] = useImmer({
    renderCalendar: false,
    renderEditSubPage: false,
    renderBalancerSubPage: false,
    renderPlayerSubPage: false,
    renderSettingsSubPage: false
  })

  useEffect(() => {
    function fetchData() {
      if (location.state === undefined || location.state == null) return
      if (location.state.navigated) {
        const responseData = location.state.responseData
        const adminsArray = responseData.admins

        setNavigated(true)
        setRoom(draft => {
          draft.id = responseData.id
          draft.name = responseData.name
          draft.description = responseData.description == null ? "" : responseData.description
          draft.isPublic = responseData.public
          draft.location.city = responseData.location.city
          draft.location.zipCode = responseData.location.zipCode
          draft.location.street = responseData.location.street
          draft.location.number = responseData.location.number

          if (responseData.nextMatchDate) {
            draft.nextMatchDate = responseData.nextMatchDate.split("T")[0]
            draft.nextMatchTime.hour = responseData.nextMatchDate.split("T")[1].split(":")[0]
            draft.nextMatchTime.minute = responseData.nextMatchDate.split("T")[1].split(":")[1]
          }
        })
        setAdmins(admins)
        setIsUserAdmin(adminsArray.filter(admin => admin.id == appState.user.id).length > 0)
      }
    }
    fetchData()
  }, [])

  function showUploadPhotoButton() {
    if (isUserAdmin) {
      return (
        <div className="d-flex flex-row mt-3 ml-3">
          <Link to={""} data-tip="Upload" data-for="upload" className="text-primary mr-2">
            <span className="material-symbols-outlined link-black ml-auto"> upload </span>
          </Link>
          <ReactTooltip id="upload" className="custom-tooltip" />
        </div>
      )
    }
  }

  function resetRenderedSubPages() {
    setState(draft => {
      draft.renderEditSubPage = false
      draft.renderBalancerSubPage = false
      draft.renderPlayerSubPage = false
      draft.renderSettingsSubPage = false
    })
  }

  function handleNextMatchDateEdit(data) {
    if (isUserAdmin) {
      setRoom(draft => {
        draft.nextMatchDate = data
      })
    }
  }

  function handleNextMatchHourEdit(e) {
    if (isUserAdmin) {
      const newHours = parseInt(e.target.value).toString().padStart(0, "0")
      setRoom(draft => {
        draft.nextMatchTime.hour = newHours
      })
    }
  }

  function handleNextMatchMinuteEdit(e) {
    if (isUserAdmin) {
      const newMinutes = parseInt(e.target.value).toString().padStart(0, "0")
      setRoom(draft => {
        draft.nextMatchTime.minute = newMinutes
      })
    }
  }

  async function handleSubmitNewMatchDate() {
    if (isUserAdmin) {
      const nextMatchDateTimeString = `${room.nextMatchDate}T${room.nextMatchTime.hour}:${room.nextMatchTime.minute}:00.000Z`

      try {
        await Axios.patch(`/api/room/next-match-date/${room.id}?adminId=${appState.user.id}&date=${nextMatchDateTimeString}`, {}, { headers: { Authorization: `Bearer ${appState.user.token}` } })
      } catch (e) {
        console.log("There was a problem or the request was cancelled." + e)
        return
      }
      appDispatch({
        type: "flashMessage",
        value: "New date for next match set successfully!",
        messageType: "message-green"
      })
      setState(draft => {
        draft.renderCalendar = false
      })
    }
  }

  function handleRoomEdit(data) {
    setRoom(draft => {
      draft.name = data.name
      draft.description = data.description
      draft.isPublic = data.isPublic
      draft.location = data.location
    })
    setState(draft => {
      draft.renderEditSubPage = false
    })
  }

  function renderTimeSelector() {
    return (
      <div className="mt-2">
        <select className="ml-2" value={room.nextMatchTime.hour} onChange={handleNextMatchHourEdit}>
          {Array.from(Array(24).keys()).map(value => (
            <option key={value} value={value}>
              {value.toString().padStart(2, "0")}
            </option>
          ))}
        </select>{" "}
        <select className="ml-2" value={room.nextMatchTime.minute} onChange={handleNextMatchMinuteEdit}>
          {Array.from(Array(60).keys()).map(value => (
            <option key={value} value={value}>
              {value.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
        <SubmitOrCancelButton
          handleSubmitNewMatchDate={handleSubmitNewMatchDate}
          handleCancelNewMatchDate={() =>
            setState(draft => {
              draft.renderCalendar = false
            })
          }
        />
      </div>
    )
  }

  if (!navigated) return <NotFound />
  if (state.isLoading) return <Loading />
  return (
    <div>
      test
      <div className="main d-flex flex-column container">
        <div className="mt-5"></div>
        <Link className="text-primary medium font-weight-bold" to={`/`}>
          &laquo; Back HOME
        </Link>

        <div className="mobile-toggle">
          <h2 className="d-flex ml-auto mobile-toggle">
            <div className="d-flex ml-3 p-2 align-items-center" data-tip={room.isPublic ? "ROOM IS PUBLIC" : "ROOM IS PRIVATE"} data-for={"acccess"}>
              <span className="material-symbols-outlined mr-2" style={{ fontSize: "25px", color: room.isPublic ? "darkgreen" : "darkred", cursor: "pointer" }}>
                {room.isPublic ? "lock_open" : "lock"}
              </span>
              <ReactTooltip id={"acccess"} className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={500} />
            </div>
            <text className="d-flex" style={{ fontSize: "20px", fontFamily: "Georgia" }}>
              <a
                style={{
                  fontSize: "20px",
                  fontVariantCaps: "small-caps"
                }}
              >
                {room.name}
              </a>
            </text>
          </h2>
        </div>
        <div className="content d-flex flex-column mt-1">
          <div className="content single-room-layout">
            <div className="single-room-layout-row">
              <div className="profile-avatar d-flex flex-column align-items-center">
                <RenderAvatar />{" "}
              </div>
              <div className="d-flex flex-row" style={{ marginLeft: "3rem" }}>
                {showUploadPhotoButton()}
              </div>
            </div>
            <div className="room-content container mr-3">{room.description}</div>
            <CSSTransition in={state.renderCalendar} timeout={700} classNames="add-room-text" unmountOnExit>
              <div className="d-flex flex-column mt-3 justify-content-center">
                <Calendar chosenDate={handleNextMatchDateEdit} />
                {isUserAdmin && renderTimeSelector()}
              </div>
            </CSSTransition>
            <div className="d-flex flex-column mr-2 ml-4 align-items-center">
              <span style={{ color: "white", whiteSpace: "nowrap", fontVariant: "all-small-caps" }}>Next match on:</span>
              <span style={{ color: "wheat", whiteSpace: "nowrap", fontVariant: "all-small-caps" }}>{room.nextMatchDate ? room.nextMatchDate : "N/A"}</span>
              <span style={{ color: "wheat", whiteSpace: "nowrap", fontVariant: "all-small-caps" }}>{room.nextMatchTime.hour ? room.nextMatchTime.hour + " : " + room.nextMatchTime.minute : "N/A"}</span>
              <span
                style={{ color: "#2f3061" }}
                className="material-symbols-outlined mt-3"
                data-tip={"CHECK NEXT MATCH DATE"}
                data-for={"calendar"}
                onClick={() =>
                  setState(draft => {
                    draft.renderCalendar = !draft.renderCalendar
                  })
                }
              >
                calendar_month
              </span>
              <ReactTooltip id={"calendar"} className="custom-tooltip" delayShow={500} />
            </div>
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
                  draft.renderPlayerSubPage = true
                })
              }}
            >
              Player List
            </a>
          </li>
          <li>
            <a
              onClick={() => {
                resetRenderedSubPages()
                setState(draft => {
                  draft.renderSettingsSubPage = true
                })
              }}
            >
              Settings
            </a>
          </li>
          {isUserAdmin && (
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
    </div>
  )
}

export default ViewSingleRoom
