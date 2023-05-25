import React, { useContext, useEffect, useState } from "react"
import Axios from "axios"
import StateContext from "../../../StateContext"
import DispatchContext from "../../../DispatchContext"
import { RoomContext } from "../../RoomContext"
import { useImmer } from "use-immer"
import CustomMaterialSymbol from "../../CustomMaterialSymbol"
import User from "./User"

function CreatePlayerBasicStep(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const { room, roomMetaInfo, setRoom } = useContext(RoomContext)
  const [state, setState] = useImmer({
    renderBasicInfoView: true,
    renderProvideSkillPointsStep: false,
    renderLinkPlayerWithUser: false
  })
  const [player, setPlayer] = useImmer({
    firstName: "",
    lastName: "",
    sex: "",
    linkedUser: ""
  })

  console.log(room)

  function renderRoomMembers() {
    return (
      <>
        <div style={{ display: "flex" }}>
          <div style={{ width: "40%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Username</div>
          <div style={{ width: "20%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>First Name</div>
          <div style={{ width: "20%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Last Name</div>
          <div style={{ width: "20%", borderBottom: "1px solid black" }}>Linked</div>
        </div>
        {room.users.map(user => {
          return <User key={user.id} user={user} roomId={room.id} setLinkedUser={user => setPlayerBaseOnLinkedUser(user)} linkedUser={player.linkedUser} />
        })}
      </>
    )
  }

  function setPlayerBaseOnLinkedUser(user) {
    setPlayer(draft => {
      draft.firstName = user.firstName
      draft.lastName = user.lastName
      draft.sex = user.sex
      draft.linkedUser = user
    })
  }

  function unlinkPlayerFromUser() {
    setPlayer(draft => {
      draft.firstName = ""
      draft.lastName = ""
      draft.sex = ""
      draft.linkedUser = ""
    })
  }

  async function submitNewPlayer() {
    if (player.firstName.length == 0 || player.lastName.length == 0 || player.sex.length == 0) {
      appDispatch({
        type: "flashMessage",
        value: "Provided information for new player are incorrect !",
        messageType: "message-orange"
      })
      return
    }

    try {
      const response = await Axios.post(
        `api/player`,
        {
          firstName: player.firstName,
          lastName: player.lastName,
          sex: player.sex,
          roomId: room.id,
          roomAdminId: appState.user.id,
          userToLinkId: player.linkedUser.id
        },
        { headers: { Authorization: `Bearer ${appState.user.token}` } }
      )

      if (response.data) {
        props.submitBasicStep(response.data)
        setRoom(draft => {
          draft.members
            .filter(user => user.id === player.linkedUser.id)
            .forEach(user => {
              user.linkedRoomPlayer = player
            })
        })
        appDispatch({
          type: "flashMessage",
          value: "Player successfully created !",
          messageType: "message-green"
        })
      }
    } catch (e) {
      console.log("There was a problem creating new player " + e)
      return
    }
  }

  function renderBasicInfoView() {
    return (
      <>
        {!state.renderLinkPlayerWithUser ? (
          <>
            <div className="player-info-box">
              <div style={{ color: "wheat" }}>
                <div>Step 1</div>
                <div>
                  Provide basic information or fetch them <br /> by linking player with room member{" "}
                  <span>
                    <button
                      onClick={() =>
                        setState(draft => {
                          draft.renderLinkPlayerWithUser = true
                        })
                      }
                      type="button"
                    >
                      LINK
                    </button>
                  </span>{" "}
                  :
                </div>
              </div>
              <div className="create-player-input-row mt-4 justify-content-center">
                <div>
                  <label>First Name</label>
                  <div>
                    <input
                      disabled={player.linkedUser}
                      onChange={e =>
                        setPlayer(draft => {
                          draft.firstName = e.target.value
                        })
                      }
                      id="input-1"
                      type="text"
                      value={player.firstName}
                    />
                  </div>
                </div>
                <div>
                  <label>Last Name</label>
                  <div>
                    <input
                      disabled={player.linkedUser}
                      onChange={e =>
                        setPlayer(draft => {
                          draft.lastName = e.target.value
                        })
                      }
                      id="input-2"
                      type="text"
                      value={player.lastName}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label>Sex</label>
                <div>
                  <label>MALE</label>
                  <input
                    disabled={player.linkedUser}
                    type="checkbox"
                    onChange={() =>
                      setPlayer(draft => {
                        draft.sex = "MALE"
                      })
                    }
                    checked={player.sex == "MALE"}
                    style={{ verticalAlign: "middle", marginLeft: "5px", marginRight: "10px" }}
                  />
                  <label>FEMALE</label>
                  <input
                    disabled={player.linkedUser}
                    type="checkbox"
                    onChange={() =>
                      setPlayer(draft => {
                        draft.sex = "FEMALE"
                      })
                    }
                    checked={player.sex == "FEMALE"}
                    style={{ verticalAlign: "middle", marginLeft: "5px" }}
                  />
                </div>
              </div>
              <div>
                <button className="mt-4" onClick={() => submitNewPlayer()} type="button">
                  SUBMIT &raquo;
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="player-info-box" style={{ color: "wheat", textAlign: "-webkit center" }}>
            <div>Step 1</div>
            <div>Select room member to link with:</div>
            <div className="list-item" style={{ height: "215px", width: "90%" }}>
              {renderRoomMembers()}
            </div>
            <div>
              <button className="mt-4" onClick={() => unlinkPlayerFromUser()} type="button">
                UNLINK
              </button>
              <button
                className="mt-4 ml-2"
                onClick={() =>
                  setState(draft => {
                    draft.renderLinkPlayerWithUser = false
                  })
                }
                type="button"
              >
                ACCEPT
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {!state.renderLinkPlayerWithUser ? (
        <CustomMaterialSymbol name="cancel" position="center" fontSize="20px" onClick={() => props.resetRender()} />
      ) : (
        <CustomMaterialSymbol
          name="undo"
          position="center"
          fontSize="20px"
          onClick={() =>
            setState(draft => {
              draft.renderLinkPlayerWithUser = false
            })
          }
        />
      )}
      {renderBasicInfoView()}
    </>
  )
}

export default CreatePlayerBasicStep
