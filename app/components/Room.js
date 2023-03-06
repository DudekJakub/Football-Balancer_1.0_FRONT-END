import React, { useContext } from "react"
import ReactTooltip from "react-tooltip"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
import { useImmer } from "use-immer"
import { Link, useNavigate } from "react-router-dom"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function Room(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const navigate = useNavigate()
  const [state, setState] = useImmer({
    roomId: props.room.id,
    usersSize: props.room.usersInRoomQuantity,
    city: props.room.city,
    isUserInRoom: props.room.userInRoom,
    isPublic: props.room.public,
    showPasswordInput: false,
    providedRoomPassword: "",
    wrongPasswordMessage: ""
  })

  function getSymbol(name, fontColor, cursor, source, dataTip, actionOnClick) {
    var color = fontColor == 0 || fontColor == "defaultColor" ? "#3336da" : fontColor
    return (
      <div className="d-flex ml-3 p-2 align-items-center" data-tip={dataTip} data-for={dataTip}>
        <span className="material-symbols-outlined mr-2" style={{ fontSize: "25px", color: color, cursor: cursor }} onClick={actionOnClick}>
          {" "}
          {name}{" "}
        </span>{" "}
        {source}
        <ReactTooltip id={dataTip} className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={500} />
      </div>
    )
  }

  function getColorForIsUserInRoomIcon() {
    return state.isUserInRoom ? "darkgreen" : "darkred"
  }

  function getSymbolForIsUserInRoomIcon() {
    return state.isUserInRoom ? "door_open" : "door_front"
  }

  function getDescriptionForIsUserInRoomDataTip() {
    return state.isUserInRoom ? "YOU'RE THE MEMBER OF THE ROOM : ACCESS GRANTED" : "YOU AREN'T THE MEMBER OF THE ROOM : ACCESS DENIED"
  }

  function getColorForIsPublicIcon() {
    return state.isPublic ? "darkgreen" : "darkred"
  }

  function getSymbolForIsPublicIcon() {
    return state.isPublic ? "lock_open" : "lock"
  }

  function getDescriptionForIsPublicIcon() {
    return state.isPublic ? "ROOM IS PUBLIC" : "ROOM IS PRIVATE"
  }

  async function enterTheRoom() {
    try {
      const response = await Axios.post(
        `/api/room/enter`,
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

  function showPasswordInputActionOrJustEnter() {
    if (!appState.loggedIn) {
      {
        appDispatch({
          type: "flashMessage",
          value: "Please log in first.",
          messageType: "message-red"
        })
        return
      }
    } else if (!state.isUserInRoom) {
      setState(draft => {
        draft.showPasswordInput = true
      })
      return
    }
    enterTheRoom()
  }

  function renderPasswordInput() {
    return (
      <div className="ml-auto d-flex">
        {renderWrongPasswordMessage()}
        <input
          type="password"
          className="room-password-input placeholder-color"
          style={{ textAlign: "center" }}
          placeholder="enter password"
          onChange={e =>
            setState(draft => {
              draft.providedRoomPassword = e.target.value
              draft.wrongPasswordMessage = ""
            })
          }
        />
        {renderPasswordSubmitButton()}
      </div>
    )
  }

  function renderPasswordSubmitButton() {
    return (
      <button className="btn-secondary ml-2 pr-2 pl-2" onClick={() => enterTheRoom()}>
        JOIN
      </button>
    )
  }

  function renderWrongPasswordMessage() {
    return (
      <a
        style={{
          position: "relative",
          width: "50px",
          textAlign: "center",
          fontVariant: "all-small-caps",
          whiteSpace: "nowrap"
        }}
      >
        <CSSTransition in={state.wrongPasswordMessage.length > 0} timeout={330} classNames="liveValidateMessage" unmountOnExit>
          <div className="alert alert-danger small liveValidateMessage" style={{ top: "-37px", left: "83px" }}>
            wrong password
          </div>
        </CSSTransition>
      </a>
    )
  }

  return (
    <div className="single-room container mt-4">
      <div className="single-room-content container d-flex ml-3 p-2 align-items-center">
        <div id="room-name">
          <Link to={`room/${props.room.id}`}>{props.room.name}</Link>
        </div>
        <div className="ml-auto d-flex">{state.showPasswordInput && !state.isUserInRoom && renderPasswordInput()}</div>
        <div className="ml-auto d-flex">
          {props.showAccessLevel && getSymbol(getSymbolForIsPublicIcon(), getColorForIsPublicIcon(), "help", null, getDescriptionForIsPublicIcon())}
          {getSymbol("login", 0, "pointer", null, "ENTER", showPasswordInputActionOrJustEnter)}
          {props.showPermission && appState.loggedIn && getSymbol(getSymbolForIsUserInRoomIcon(), getColorForIsUserInRoomIcon(), "help", null, getDescriptionForIsUserInRoomDataTip())}
          {getSymbol("person", 0, "help", state.usersSize, "USERS QUANTITY")}
          {getSymbol("map", 0, "help", "", state.city)}
        </div>
      </div>
    </div>
  )
}

export default Room
