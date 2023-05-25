import React, { useEffect, useContext } from "react"
import Axios from "axios"
import moment from "moment/moment"
import { useImmer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import SubmitOrCancelButton from "./SubmitOrCancelButton"
import Calendar from "./Calendar"
import TimeSelector from "./TimeSelector"
import { RoomContext } from "./RoomContext"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function EditRoomDates(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const { room, setRoomDates } = useContext(RoomContext)
  const [roomEditDates, setRoomEditDates] = useImmer({
    nextMatchDate: "",
    nextMatchTime: {
      hour: "00",
      minute: "00"
    },
    nextMatchRegistrationOpenDate: "",
    nextMatchRegistrationOpenTime: {
      hour: "00",
      minute: "00"
    },
    nextMatchRegistrationEndDate: "",
    nextMatchRegistrationEndTime: {
      hour: "00",
      minute: "00"
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
    const nextMatchDateFormated = mapDateInOneFormat(roomEditDates.nextMatchDate, roomEditDates.nextMatchTime.hour, roomEditDates.nextMatchTime.minute)
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
    setRoomEditDates(draft => {
      draft.nextMatchDateFormated = nextMatchDateFormated
    })
    setTimeout(() => {
      setState(draft => {
        draft.setRegistrationOpenDateStage = true
      })
    }, 1010)
  }

  function goToRegistrationEndDateStage() {
    const nextMatchRegistrationOpenDateFormated = mapDateInOneFormat(roomEditDates.nextMatchRegistrationOpenDate, roomEditDates.nextMatchRegistrationOpenTime.hour, roomEditDates.nextMatchRegistrationOpenTime.minute)

    if (nextMatchRegistrationOpenDateFormated > roomEditDates.nextMatchDateFormated) {
      setError(draft => {
        draft.registrationOpenDateMessage = "Registration open date cannot be after the match!"
        draft.withRegistrationOpenDate = true
      })
      return
    }

    setState(draft => {
      draft.setRegistrationOpenDateStage = false
    })
    setRoomEditDates(draft => {
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
          const response = await Axios.patch(
            `/api/room/basic-management/next-match-all-dates/${room.id}`,
            {
              nextMatchDate: roomEditDates.nextMatchDateFormated,
              nextMatchRegistrationStartDate: roomEditDates.nextMatchRegistrationOpenDateFormated,
              nextMatchRegistrationEndDate: roomEditDates.nextMatchRegistrationEndDateFormated,
              roomAdminId: appState.user.id
            },
            { headers: { Authorization: `Bearer ${appState.user.token}` } },
            { cancelToken: ourRequest.token }
          )

          if (response.status === 204) {
            setRoomDates(draft => {
              draft.nextMatchDate = roomEditDates.nextMatchDate
              draft.nextMatchTime.hour = roomEditDates.nextMatchTime.hour
              draft.nextMatchTime.minute = roomEditDates.nextMatchTime.minute
              draft.nextMatchRegistrationOpenDate = roomEditDates.nextMatchRegistrationOpenDate
              draft.nextMatchRegistrationOpenTime.hour = roomEditDates.nextMatchRegistrationOpenTime.hour
              draft.nextMatchRegistrationOpenTime.minute = roomEditDates.nextMatchRegistrationOpenTime.minute
              draft.nextMatchRegistrationEndDate = roomEditDates.nextMatchRegistrationEndDate
              draft.nextMatchRegistrationEndTime.hour = roomEditDates.nextMatchRegistrationEndTime.hour
              draft.nextMatchRegistrationEndTime.minute = roomEditDates.nextMatchRegistrationEndTime.minute
            })
            props.onSubmit()
          }
        } catch (e) {
          console.log("There was a problem updating next match dates " + e)
          return
        }
        appDispatch({
          type: "flashMessage",
          value: "Next match dates updated successfuly !",
          messageType: "message-green"
        })
      }
      submitDatesChange()

      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.setAllStagesComplete])

  function finalizeStages() {
    const nextMatchRegistrationEndDateFormated = mapDateInOneFormat(roomEditDates.nextMatchRegistrationEndDate, roomEditDates.nextMatchRegistrationEndTime.hour, roomEditDates.nextMatchRegistrationEndTime.minute)

    if (nextMatchRegistrationEndDateFormated < roomEditDates.nextMatchRegistrationOpenDateFormated) {
      setError(draft => {
        draft.registrationEndDateMessage = "Registration end date cannot be before the registration open date!"
        draft.withRegistrationEndDate = true
      })
      return
    }
    if (nextMatchRegistrationEndDateFormated > roomEditDates.nextMatchDateFormated) {
      setError(draft => {
        draft.registrationEndDateMessage = "Registration end date cannot be after the next match date!"
        draft.withRegistrationEndDate = true
      })
      return
    }

    setRoomEditDates(draft => {
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
  }, [roomEditDates.nextMatchDate, roomEditDates.nextMatchTime, roomEditDates.nextMatchRegistrationOpenDate, roomEditDates.nextMatchRegistrationOpenTime, roomEditDates.nextMatchRegistrationEndDate, roomEditDates.nextMatchRegistrationEndTime])

  return (
    <div style={{ display: "table-caption" }}>
      {renderStageTitle("next match date", state.setNextMatchDateStage)}
      <CSSTransition in={state.setNextMatchDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <a>
          <Calendar
            chosenDate={newDate =>
              setRoomEditDates(draft => {
                draft.nextMatchDate = newDate
              })
            }
          />
          <TimeSelector
            hour={roomEditDates.nextMatchTime.hour}
            minute={roomEditDates.nextMatchTime.minute}
            onChangeHour={newHour =>
              setRoomEditDates(draft => {
                draft.nextMatchTime.hour = newHour.target.value
              })
            }
            onChangeMinute={newMinute =>
              setRoomEditDates(draft => {
                draft.nextMatchTime.minute = newMinute.target.value
              })
            }
          />
          <SubmitOrCancelButton handleSubmit={goToRegistrationOpenDateStage} handleCancel={unrenderComponent} errorCondition={error.withNextMatchDate} errorMessage={error.nextMatchDateMessage} />
        </a>
      </CSSTransition>

      {renderStageTitle("registration open date", state.setRegistrationOpenDateStage)}
      <CSSTransition in={state.setRegistrationOpenDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <a>
          <Calendar
            chosenDate={newDate =>
              setRoomEditDates(draft => {
                draft.nextMatchRegistrationOpenDate = newDate
              })
            }
          />
          <TimeSelector
            hour={roomEditDates.nextMatchRegistrationOpenTime.hour}
            minute={roomEditDates.nextMatchRegistrationOpenTime.minute}
            onChangeHour={newHour =>
              setRoomEditDates(draft => {
                draft.nextMatchRegistrationOpenTime.hour = newHour.target.value
              })
            }
            onChangeMinute={newMinute =>
              setRoomEditDates(draft => {
                draft.nextMatchRegistrationOpenTime.minute = newMinute.target.value
              })
            }
          />
          <SubmitOrCancelButton handleSubmit={goToRegistrationEndDateStage} handleCancel={unrenderComponent} errorCondition={error.withRegistrationOpenDate} errorMessage={error.registrationOpenDateMessage} />
        </a>
      </CSSTransition>

      {renderStageTitle("registration end date", state.setRegistrationEndDateStage)}
      <CSSTransition in={state.setRegistrationEndDateStage} timeout={1000} classNames="add-calendar" unmountOnExit>
        <a>
          <Calendar
            chosenDate={newDate =>
              setRoomEditDates(draft => {
                draft.nextMatchRegistrationEndDate = newDate
              })
            }
          />
          <TimeSelector
            hour={roomEditDates.nextMatchRegistrationEndTime.hour}
            minute={roomEditDates.nextMatchRegistrationEndTime.minute}
            onChangeHour={newHour =>
              setRoomEditDates(draft => {
                draft.nextMatchRegistrationEndTime.hour = newHour.target.value
              })
            }
            onChangeMinute={newMinute =>
              setRoomEditDates(draft => {
                draft.nextMatchRegistrationEndTime.minute = newMinute.target.value
              })
            }
          />
          <SubmitOrCancelButton handleSubmit={finalizeStages} handleCancel={unrenderComponent} errorCondition={error.withRegistrationEndDate} errorMessage={error.registrationEndDateMessage} />
        </a>
      </CSSTransition>
    </div>
  )
}

export default EditRoomDates
