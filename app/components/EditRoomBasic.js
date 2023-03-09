import React, { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import { useImmer } from "use-immer"
import Axios from "axios"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import CreateDefaultInput from "./CreateDefaultInput"
import CreateDefaultTextArea from "./CreateDefaultTextArea"
import CreateDefaultOptionMenu from "./CreateDefaultOptionMenu"

function EditRoomBasic(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useState({
    name: props.room.name,
    description: props.room.description,
    isPublic: props.room.isPublic
  })
  const [isLocationAddAreaVisible, setIsLocationAddAreaVisible] = useState(false)
  const [location, setLocation] = useState({
    city: props.room.location.city,
    zipCode: props.room.location.zipCode,
    street: props.room.location.street,
    number: props.room.location.number
  })

  function handleNameChange(newValue) {
    setState(prevState => ({
      ...prevState,
      name: newValue
    }))
  }

  function handleDescriptionChange(newValue) {
    setState(prevState => ({
      ...prevState,
      description: newValue
    }))
  }

  function handleAccessChange(newValue) {
    newValue == "PUBLIC"
      ? setState(prevState => ({
          ...prevState,
          isPublic: true
        }))
      : setState(prevState => ({
          ...prevState,
          isPublic: false
        }))
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

  function handleSubmit(e) {
    e.preventDefault()

    if (!state.name || state.name.length >= 50 || state.name.length < 4 || (isLocationAddAreaVisible && (!/^[a-zA-Z]+$/.test(location.city) || !/^((\d{2}-\d{3}))$/.test(location.zipCode) || !/^\d+$/.test(location.number)))) {
      appDispatch({
        type: "flashMessage",
        value: "Invalid data! Please check provided information once more.",
        messageType: "message-red"
      })
      return
    }

    const ourRequest = Axios.CancelToken.source()
    async function updateRoom() {
      try {
        await Axios.put(
          `/api/room/${props.room.id}`,
          {
            userRequestSenderId: appState.user.id,
            name: state.name,
            description: state.description,
            public: state.isPublic,
            location: location
          },
          { headers: { Authorization: `Bearer ${appState.user.token}` } },
          { cancelToken: ourRequest.token }
        )
        appDispatch({
          type: "flashMessage",
          value: "Room successfully updated !",
          messageType: "message-green"
        })
      } catch (e) {
        console.log("There was a problem updating room" + e)
        return
      }
    }
    updateRoom()
    props.onSubmit({ name: state.name, description: state.description, isPublic: state.isPublic, location: location })

    return () => {
      ourRequest.cancel()
    }
  }

  return (
    <form className="d-flex flex-column" onSubmit={handleSubmit} style={{ fontVariant: "all-small-caps" }}>
      <div className="main d-flex flex-column container" style={{ color: "white", paddingBottom: "30px", backgroundColor: "" }}>
        <div className="content-light-blue mt-4">
          <div className="d-flex flex-column">
            <CreateDefaultInput className={"ml-4 mr-4 add-room-text"} initialValue={state.name} name={"edit name"} onChange={handleNameChange} autoFocus={true} transitionTrigger={!state.name || state.name.length < 3 || state.name.length > 50} transactionConditionAndMessage={!state.name || state.name.length > 50 ? "Empty name or too long (max. 50 sings)" : "Name too short (min. 3 signs)"} />
            <CreateDefaultTextArea className={"ml-4 mr-4 add-room-text"} initialValue={state.description} name={"edit description"} onChange={handleDescriptionChange} transitionTrigger={state.description.length > 500} transactionConditionAndMessage={state.description.length > 500 ? "Description too long (max. 500 sings)" : ""} />
            <CreateDefaultOptionMenu
              name="Access"
              className="ml-3 add-room-text"
              onChange={handleAccessChange}
              optionElements={() => (
                <>
                  <option selected disabled>
                    CURRENT: {props.room.isPublic ? "PUBLIC" : "PRIVATE"}
                  </option>
                  <option>{"PUBLIC"}</option>
                  <option>{"PRIVATE"}</option>
                </>
              )}
            />
            <div
              className="ml-3 mt-3 add-room-text"
              style={{
                paddingTop: "30px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <button
                className="btn-info "
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
                {isLocationAddAreaVisible ? "CANCEL CHANGE LOCATION" : "CHANGE LOCATION"}
              </button>
            </div>
            <CSSTransition in={isLocationAddAreaVisible} timeout={700} classNames="add-room-text" unmountOnExit>
              <CreateDefaultInput name="City" className="add-room-text" initialValue={location.city} onChange={handleCityChange} transitionTrigger={!/^[a-zA-Z]+$/.test(location.city)} transactionConditionAndMessage={!/^[a-zA-Z]+$/.test(location.city) && "Incorrect (only eng. alphabet) or empty city name"} inputStyle={{ width: "200px" }} />
            </CSSTransition>
            <CSSTransition in={isLocationAddAreaVisible} timeout={700} classNames="add-room-text" unmountOnExit>
              <CreateDefaultInput name="Zip-Code" className="add-room-text" initialValue={location.zipCode} onChange={handleZipCodeChange} transitionTrigger={!/^((\d{2}-\d{3}))$/.test(location.zipCode)} transactionConditionAndMessage={!/^((\d{2}-\d{3}))$/.test(location.zipCode) && "Incorrect format (valid: e.g. 60-688) or empty zip-code"} inputStyle={{ width: "200px" }} />
            </CSSTransition>
            <CSSTransition in={isLocationAddAreaVisible} timeout={700} classNames="add-room-text" unmountOnExit>
              <CreateDefaultInput name="Street" className="add-room-text" initialValue={location.street} onChange={handleStreetChange} inputStyle={{ width: "200px" }} />
            </CSSTransition>
            <CSSTransition in={isLocationAddAreaVisible} timeout={700} classNames="add-room-text" unmountOnExit>
              <CreateDefaultInput name="Number" className="add-room-text" initialValue={location.number} onChange={handleNumberChange} transitionTrigger={!/^\d+$/.test(location.number)} transactionConditionAndMessage={!/^\d+$/.test(location.number) && "Incorrect format (only digits) or empty number"} inputStyle={{ width: "200px" }} />
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
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default EditRoomBasic
