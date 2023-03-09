import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import moment from "moment/moment"
import { useImmer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import SubmitOrCancelButton from "./SubmitOrCancelButton"
import Calendar from "./Calendar"
import TimeSelector from "./TimeSelector"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function EditRoomDates(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const roomId = useState(props.roomId)
  const [roomDates, setRoomDates] = useImmer({
    nextMatchDate: props.dates.nextMatchDate,
    nextMatchTime: {
      hour: props.dates.nextMatchTime.hour,
      minute: props.dates.nextMatchTime.minute
    },
    nextMatchRegistrationOpenDate: props.dates.nextMatchRegistrationOpenDate,
    nextMatchRegistrationOpenTime: {
      hour: props.dates.nextMatchRegistrationOpenTime.hour,
      minute: props.dates.nextMatchRegistrationOpenTime.minute
    },
    nextMatchRegistrationEndDate: props.dates.nextMatchRegistrationEndDate,
    nextMatchRegistrationEndTime: {
      hour: props.dates.nextMatchRegistrationEndTime.hour,
      minute: props.dates.nextMatchRegistrationEndTime.minute
    },
    nextMatchDateFormated: "",
    nextMatchRegistrationOpenDateFormated: "",
    nextMatchRegistrationEndDateFormated: ""
  })
  const [state, setState] = useImmer({
    setNextMatchDateStage: false,
    setRegistrationOpenDateStage: false,
    setRegistrationEndDateStage: false,
    setAllStagesComplete: false
  })
  const [error, setError] = useImmer({
    withNextMatchDate: false,
    nextMatchDateMessage: "",
    withRegistrationOpenDate: false,
    registrationOpenDateMessage: "",
    withRegistrationEndDate: false,
    registrationEndDateMessage: ""
  })

  useEffect(() => {
    if (props.renderCondition)
      setState(draft => {
        draft.setNextMatchDateStage = true
      })
  }, [props.renderCondition])

  function mapDateInOneFormat(date, hour, minute) {
    const formattedDate = moment(`${date}T${hour}:${minute}:00+00:00`, "MMMM DD YYYYTHH:mm:ssZ").toISOString()
    return new Date(formattedDate)
  }

  function goToRegistrationOpenDateStage() {
    const nextMatchDateFormated = mapDateInOneFormat(roomDates.nextMatchDate, roomDates.nextMatchTime.hour, roomDates.nextMatchTime.minute)
    const now = new Date()

    if (nextMatchDateFormated < now) {
      setError(draft => {
        draft.nextMatchDateMessage = "The next match date must be in the future!"
        draft.withNextMatchDate = true
      })
      return
    }

    setState(draft => {
      draft.setNextMatchDateStage = false
    })
    setRoomDates(draft => {
      draft.nextMatchDateFormated = nextMatchDateFormated
    })
    setTimeout(() => {
      setState(draft => {
        draft.setRegistrationOpenDateStage = true
      })
    }, 1010)
  }

  function goToRegistrationEndDateStage() {
    const nextMatchRegistrationOpenDateFormated = mapDateInOneFormat(roomDates.nextMatchRegistrationOpenDate, roomDates.nextMatchRegistrationOpenTime.hour, roomDates.nextMatchRegistrationOpenTime.minute)

    if (nextMatchRegistrationOpenDateFormated > roomDates.nextMatchDateFormated) {
      setError(draft => {
        draft.registrationOpenDateMessage = "Registration open date cannot be after the match!"
        draft.withRegistrationOpenDate = true
      })
      return
    }

    setState(draft => {
      draft.setRegistrationOpenDateStage = false
    })
    setRoomDates(draft => {
      draft.nextMatchRegistrationOpenDateFormated = nextMatchRegistrationOpenDateFormated
    })
    setTimeout(() => {
      setState(draft => {
        draft.setRegistrationEndDateStage = true
      })
    }, 1010)
  }

  useEffect(() => {
    if (state.setAllStagesComplete) {
      const ourRequest = Axios.CancelToken.source()
      async function submitDatesChange() {
        try {
          await Axios.patch(
            `/api/room/next-match-all-dates/${props.roomId}?adminId=${appState.user.id}`,
            {
              nextMatchDate: roomDates.nextMatchDateFormated,
              nextMatchRegistrationStartDate: roomDates.nextMatchRegistrationOpenDateFormated,
              nextMatchRegistrationEndDate: roomDates.nextMatchRegistrationEndDateFormated
            },
            { headers: { Authorization: `Bearer ${appState.user.token}` } },
            { cancelToken: ourRequest.token }
          )
          appDispatch({
            type: "flashMessage",
            value: "Next match dates updated successfuly !",
            messageType: "message-green"
          })
        } catch (e) {
          console.log("There was a problem updating next match dates " + e)
          return
        }
      }
      submitDatesChange()
      props.onSubmit(roomDates)
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.setAllStagesComplete])

  function finalizeStages() {
    const nextMatchRegistrationEndDateFormated = mapDateInOneFormat(roomDates.nextMatchRegistrationEndDate, roomDates.nextMatchRegistrationEndTime.hour, roomDates.nextMatchRegistrationEndTime.minute)

    if (nextMatchRegistrationEndDateFormated < roomDates.nextMatchRegistrationOpenDateFormated) {
      setError(draft => {
        draft.registrationEndDateMessage = "Registration end date cannot be before the registration open date!"
        draft.withRegistrationEndDate = true
      })
      return
    }

    setRoomDates(draft => {
      draft.nextMatchRegistrationEndDateFormated = nextMatchRegistrationEndDateFormated
    })
    setState(draft => {
      draft.setRegistrationEndDateStage = false
      draft.setAllStagesComplete = true
    })
  }

  function unrenderComponent() {
    props.onCancel()
  }

  function renderStageTitle(text, transitionCondition) {
    return (
      <CSSTransition in={transitionCondition} timeout={1000} classNames="add-calendar" unmountOnExit>
        <span className="d-flex flex-row justify-content-center" style={{ fontVariant: "all-small-caps", color: "white", fontSize: "15px" }}>
          {text}:
        </span>
      </CSSTransition>
    )
  }

  useEffect(() => {
    setError(draft => {
      ;(draft.withNextMatchDate = false), (draft.nextMatchDateMessage = ""), (draft.withRegistrationOpenDate = false), (draft.registrationOpenDateMessage = ""), (draft.withRegistrationEndDate = false), (draft.registrationEndDateMessage = "")
    })
  }, [roomDates.nextMatchDate, roomDates.nextMatchTime, roomDates.nextMatchRegistrationOpenDate, roomDates.nextMatchRegistrationOpenTime, roomDates.nextMatchRegistrationEndDate, roomDates.nextMatchRegistrationEndTime])

  return (
    <div style={{ display: "table-caption" }}>
      {renderStageTitle("next match date", state.setNextMatchDateStage)}
      <CSSTransition in={state.setNextMatchDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <Calendar
          chosenDate={newDate =>
            setRoomDates(draft => {
              draft.nextMatchDate = newDate
            })
          }
        />
      </CSSTransition>
      <CSSTransition in={state.setNextMatchDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <TimeSelector
          hour={roomDates.nextMatchTime.hour}
          minute={roomDates.nextMatchTime.minute}
          onChangeHour={newHour =>
            setRoomDates(draft => {
              draft.nextMatchTime.hour = newHour.target.value
            })
          }
          onChangeMinute={newMinute =>
            setRoomDates(draft => {
              draft.nextMatchTime.minute = newMinute.target.value
            })
          }
        />
      </CSSTransition>
      <CSSTransition in={state.setNextMatchDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <SubmitOrCancelButton handleSubmit={goToRegistrationOpenDateStage} handleCancel={unrenderComponent} errorCondition={error.withNextMatchDate} errorMessage={error.nextMatchDateMessage} />
      </CSSTransition>

      {renderStageTitle("registration open date", state.setRegistrationOpenDateStage)}
      <CSSTransition in={state.setRegistrationOpenDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <Calendar
          chosenDate={newDate =>
            setRoomDates(draft => {
              draft.nextMatchRegistrationOpenDate = newDate
            })
          }
        />
      </CSSTransition>
      <CSSTransition in={state.setRegistrationOpenDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <TimeSelector
          hour={roomDates.nextMatchRegistrationOpenTime.hour}
          minute={roomDates.nextMatchRegistrationOpenTime.minute}
          onChangeHour={newHour =>
            setRoomDates(draft => {
              draft.nextMatchRegistrationOpenTime.hour = newHour.target.value
            })
          }
          onChangeMinute={newMinute =>
            setRoomDates(draft => {
              draft.nextMatchRegistrationOpenTime.minute = newMinute.target.value
            })
          }
        />
      </CSSTransition>
      <CSSTransition in={state.setRegistrationOpenDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <SubmitOrCancelButton handleSubmit={goToRegistrationEndDateStage} handleCancel={unrenderComponent} errorCondition={error.withRegistrationOpenDate} errorMessage={error.registrationOpenDateMessage} />
      </CSSTransition>

      {renderStageTitle("registration end date", state.setRegistrationEndDateStage)}
      <CSSTransition in={state.setRegistrationEndDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <Calendar
          chosenDate={newDate =>
            setRoomDates(draft => {
              draft.nextMatchRegistrationEndDate = newDate
            })
          }
        />
      </CSSTransition>
      <CSSTransition in={state.setRegistrationEndDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <TimeSelector
          hour={roomDates.nextMatchRegistrationEndTime.hour}
          minute={roomDates.nextMatchRegistrationEndTime.minute}
          onChangeHour={newHour =>
            setRoomDates(draft => {
              draft.nextMatchRegistrationEndTime.hour = newHour.target.value
            })
          }
          onChangeMinute={newMinute =>
            setRoomDates(draft => {
              draft.nextMatchRegistrationEndTime.minute = newMinute.target.value
            })
          }
        />
      </CSSTransition>
      <CSSTransition in={state.setRegistrationEndDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <SubmitOrCancelButton handleSubmit={finalizeStages} handleCancel={unrenderComponent} errorCondition={error.withRegistrationEndDate} errorMessage={error.registrationEndDateMessage} />
      </CSSTransition>
    </div>
  )
}

export default EditRoomDates
