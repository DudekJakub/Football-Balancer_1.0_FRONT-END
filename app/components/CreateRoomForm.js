import React, { useContext, useEffect, useState } from "react"
import Axios from "axios"
import { useNavigate } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import Loading from "./Loading"
import UnauthorizedAccessView from "./UnauthorizedAccessView"
import CreateDefaultInput from "./CreateDefaultInput"
import CreateDefaultOptionMenu from "./CreateDefaultOptionMenu"

function CreateRoom() {
  const [roomName, setRoomName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordEqual, setIsPasswordEqual] = useState(true)
  const [isPublicAccess, setIsPublicAccess] = useState(true)
  const [location, setLocation] = useState({
    city: "",
    zipCode: "",
    street: "",
    number: 0
  })
  const [isLocationAddAreaVisible, setIsLocationAddAreaVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  useEffect(() => {
    appDispatch({ type: "closeMenu" })
  }, [])

  const handleSubmit = e => {
    e.preventDefault()
    const ourRequest = Axios.CancelToken.source()

    if (!roomName || roomName.length >= 50 || roomName.length < 4 || !password || !(password == confirmPassword) || (isLocationAddAreaVisible && (!/^[a-zA-Z]+$/.test(location.city) || !/^((\d{2}-\d{3}))$/.test(location.zipCode) || !/^\d+$/.test(location.number)))) {
      appDispatch({
        type: "flashMessage",
        value: "Invalid data! Please check provided information once more.",
        messageType: "message-red"
      })
      return
    }

    async function fetchData() {
      try {
        const response = await Axios.post(
          "/api/room",
          {
            userRequestSenderId: appState.user.id,
            roomName,
            roomPassword: password,
            public: isPublicAccess,
            location: isLocationAddAreaVisible ? location : null
          },
          { headers: { Authorization: `Bearer ${appState.user.token}` } },
          { cancelToken: ourRequest.token }
        )
        appDispatch({
          type: "flashMessage",
          value: "Room successfully created !",
          messageType: "message-green"
        })
        handleNavigate(response)
      } catch (e) {
        console.log("There was a problem creating room")
        return
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }

  if (!appState.loggedIn) {
    return <UnauthorizedAccessView />
  } else if (isLoading) {
    return <Loading />
  }

  function handleNavigate(response) {
    navigate(`/room/${response.data.id}`, { state: { responseData: response.data, navigated: true } })
  }

  function handleRoomNameChange(newValue) {
    setRoomName(newValue)
  }

  function handlePasswordChange(newValue) {
    setPassword(newValue)
  }

  function handleRepeatPasswordChange(newValue) {
    setConfirmPassword(newValue)
  }

  function handleAccessChange(newValue) {
    newValue == "PUBLIC" ? setIsPublicAccess(true) : setIsPublicAccess(false)
  }

  function handleCityChange(newValue) {
    setLocation(prevState => ({
      ...prevState,
      city: newValue
    }))
  }

  function handleZipCodeChange(newValue) {
    setLocation(prevState => ({
      ...prevState,
      zipCode: newValue
    }))
  }

  function handleStreetChange(newValue) {
    setLocation(prevState => ({
      ...prevState,
      street: newValue
    }))
  }

  function handleNumberChange(newValue) {
    setLocation(prevState => ({
      ...prevState,
      number: newValue
    }))
  }

  useEffect(() => {
    if (!(password == confirmPassword)) {
      setIsPasswordEqual(false)
    } else {
      setIsPasswordEqual(true)
    }
  }, [password, confirmPassword])

  return (
    <form className="d-flex flex-column" onSubmit={handleSubmit}>
      <div className="main room-create-contener" style={{ color: "white", padding: "0 365px", paddingBottom: "30px" }}>
        <span
          style={{
            paddingTop: "30px",
            fontSize: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "black",
            fontVariant: "all-small-caps"
          }}
        >
          ROOM CREATOR
        </span>
        <div className="content mt-4">
          <div className="d-flex flex-row">
            <div>
              <CreateDefaultInput name="Name" className="ml-3 add-room-text" onChange={handleRoomNameChange} autoFocus={true} transitionTrigger={!roomName || roomName.length < 3 || roomName.length > 50} transactionConditionAndMessage={!roomName || roomName.length > 50 ? "Empty name or too long (max. 50 sings)" : "Name too short (min. 3 signs)"} />
              <CreateDefaultInput name="Password" className="ml-3 add-room-text" onChange={handlePasswordChange} type={"password"} transitionTrigger={!password} transactionConditionAndMessage={!password && "Empty password"} />
              <CreateDefaultInput name="Repeat password" className="ml-3 add-room-text" onChange={handleRepeatPasswordChange} type={"password"} transitionTrigger={!confirmPassword} transactionConditionAndMessage={!confirmPassword && "Empty password"} />
              <CSSTransition in={confirmPassword.length > 0 && !isPasswordEqual} timeout={1000} classNames="add-room-text" unmountOnExit>
                <div
                  className="add-room-text"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontVariant: "all-small-caps"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "darkred" }}>
                    warning
                  </span>{" "}
                  <u>Passwords don't match</u>
                </div>
              </CSSTransition>
              <CreateDefaultOptionMenu
                name="Access"
                className="ml-3 add-room-text"
                onChange={handleAccessChange}
                optionElements={() => (
                  <>
                    <option default>{"PUBLIC"}</option>
                    <option>{"PRIVATE"}</option>
                  </>
                )}
              />

              <div
                className="ml-3 add-room-text"
                style={{
                  paddingTop: "30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <span style={{ fontVariant: "all-small-caps" }}>optional</span>
                <button
                  className="btn-info"
                  type="button"
                  style={{
                    fontSize: "18px",
                    fontVariant: "all-small-caps",
                    marginBottom: "10px",
                    marginTop: "1px",
                    padding: "7px"
                  }}
                  onClick={() => setIsLocationAddAreaVisible(prevIsVisible => !prevIsVisible)}
                >
                  {isLocationAddAreaVisible ? "remove location" : "add location"}
                </button>
              </div>
              <CSSTransition in={isLocationAddAreaVisible} timeout={700} classNames="add-room-text" unmountOnExit>
                <CreateDefaultInput name="City" className="add-room-text" onChange={handleCityChange} transitionTrigger={!/^[a-zA-Z]+$/.test(location.city)} transactionConditionAndMessage={!/^[a-zA-Z]+$/.test(location.city) && "Incorrect (only eng. alphabet) or empty city name"} inputStyle={{ width: "200px" }} />
              </CSSTransition>
              <CSSTransition in={isLocationAddAreaVisible} timeout={700} classNames="add-room-text" unmountOnExit>
                <CreateDefaultInput name="Zip-Code" className="add-room-text" onChange={handleZipCodeChange} transitionTrigger={!/^((\d{2}-\d{3}))$/.test(location.zipCode)} transactionConditionAndMessage={!/^((\d{2}-\d{3}))$/.test(location.zipCode) && "Incorrect format (valid: e.g. 60-688) or empty zip-code"} inputStyle={{ width: "200px" }} />
              </CSSTransition>
              <CSSTransition in={isLocationAddAreaVisible} timeout={700} classNames="add-room-text" unmountOnExit>
                <CreateDefaultInput name="Street" className="add-room-text" onChange={handleStreetChange} inputStyle={{ width: "200px" }} />
              </CSSTransition>
              <CSSTransition in={isLocationAddAreaVisible} timeout={700} classNames="add-room-text" unmountOnExit>
                <CreateDefaultInput name="Number" className="add-room-text" onChange={handleNumberChange} transitionTrigger={!/^\d+$/.test(location.number)} transactionConditionAndMessage={!/^\d+$/.test(location.number) && "Incorrect format (only digits) or empty number"} inputStyle={{ width: "200px" }} />
              </CSSTransition>
              <div
                className="ml-3 add-room-text"
                style={{
                  paddingTop: "30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <div className="d-flex flex-colum">
                  <div className="mobile-toggle ml-auto">
                    <button
                      className="nav-button"
                      type="submit"
                      style={{
                        fontSize: "20px",
                        fontVariant: "all-small-caps"
                      }}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default CreateRoom
