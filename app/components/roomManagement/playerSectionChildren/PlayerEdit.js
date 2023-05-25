import React, { useContext, useEffect, useState } from "react"
import Axios from "axios"
import StateContext from "../../../StateContext"
import DispatchContext from "../../../DispatchContext"
import CustomMaterialSymbol from "../../CustomMaterialSymbol"
import { Link } from "react-router-dom"
import Skill from "./Skill"
import { useImmer } from "use-immer"
import User from "./User"
import Loading from "../../Loading"

function PlayerEdit(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const roomMembers = props.room.members
  const roomId = props.room.id
  const linkedRoomUserInitValue = props.player.linkedRoomUser
  const [editState, setEditState] = useImmer({
    linkedRoomUser: props.player.linkedRoomUser,
    firstName: props.player.firstName,
    lastName: props.player.lastName,
    sex: props.player.sex,
    generalOverall: props.player.generalOverall,
    skillsArray: []
  })
  const [state, setState] = useImmer({
    player: props.player,
    renderBasicInfoView: true,
    renderLinkPlayerWithUser: false,
    skillsArrayLoading: true,
    submitUpdate: false
  })

  useEffect(() => {
    async function fetchPlayerSkills() {
      try {
        const response = await Axios.get(`/api/skill/all-by-playerId?playerId=${state.player.id}`, { headers: { Authorization: `Bearer ${appState.user.token}` } })
        if (response.data) {
          setEditState(draft => {
            draft.skillsArray = response.data
          })
          setState(draft => {
            draft.skillsArrayLoading = false
          })
        }
      } catch (e) {
        console.log("There was a problem fetching player skills " + e)
        return
      }
    }
    fetchPlayerSkills()
  }, [])

  function renderPlayerSkills() {
    return state.skillsArrayLoading ? (
      <Loading />
    ) : (
      <>
        <div style={{ display: "flex" }}>
          <div style={{ width: "50%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Name</div>
          <div style={{ width: "50%", borderBottom: "1px solid black" }}>Points</div>
        </div>
        {editState.skillsArray.map(skill => {
          return <Skill key={skill.id} skill={skill} editMode={true} updateSkill={setEditState} />
        })}
      </>
    )
  }

  function renderRoomMembers() {
    return (
      <>
        <div style={{ display: "flex" }}>
          <div style={{ width: "40%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Username</div>
          <div style={{ width: "20%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>First Name</div>
          <div style={{ width: "20%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Last Name</div>
          <div style={{ width: "20%", borderBottom: "1px solid black" }}>Linked</div>
        </div>
        {roomMembers.map(user => {
          if (user.id != (linkedRoomUserInitValue ? linkedRoomUserInitValue.id : null)) {
            return <User key={user.id} user={user} roomId={roomId} setLinkedUser={user => setPlayerBaseOnLinkedUser(user)} linkedUser={editState.linkedRoomUser} />
          }
        })}
      </>
    )
  }

  function renderLinkPlayerWithUser() {
    setState(draft => {
      draft.renderBasicInfoView = false
      draft.renderLinkPlayerWithUser = true
    })
  }

  function unlinkPlayerFromUser() {
    setEditState(draft => {
      draft.linkedRoomUser = null
    })
  }

  function setPlayerBaseOnLinkedUser(user) {
    setEditState(draft => {
      draft.firstName = user.firstName
      draft.lastName = user.lastName
      draft.sex = user.sex
      draft.linkedRoomUser = user
    })
  }

  useEffect(() => {
    if (state.submitUpdate) {
      props.updatePlayer(state.player)
    }
  }, [state.submitUpdate, state.player])

  async function submitUpdate() {
    try {
      const response = await Axios.put(
        `/api/player/${state.player.id}`,
        {
          roomId: roomId,
          roomAdminId: appState.user.id,
          firstName: editState.firstName,
          lastName: editState.lastName,
          sex: editState.sex,
          userToLinkWithId: editState.linkedRoomUser ? editState.linkedRoomUser.id : null,
          updatedSkillsList: editState.skillsArray
        },
        { headers: { Authorization: `Bearer ${appState.user.token}` } }
      )

      if (response.data) {
        setEditState(draft => {
          draft.generalOverall = response.data.updatedSkillsDto.updatedPlayerGeneralOverall
        })

        setState(draft => {
          draft.player.firstName = editState.firstName
          draft.player.lastName = editState.lastName
          draft.player.sex = editState.sex
          draft.player.linkedRoomUser = editState.linkedRoomUser
          draft.player.generalOverall = response.data.updatedSkillsDto.updatedPlayerGeneralOverall
          draft.submitUpdate = true
        })

        appDispatch({
          type: "flashMessage",
          value: "Player updated successfully !",
          messageType: "message-green"
        })
      }
    } catch (e) {
      if (e.response && e.response.data.reason && e.response.data.reason.includes("User already linked")) {
        console.log("There was a problem updating the player - user already linked! " + e)
        appDispatch({
          type: "flashMessage",
          value: "Player update abandoned - provided user is already linked !",
          messageType: "message-orange"
        })
        return
      } else if (e.response && e.response.data.reason && e.response.data.reason.includes("Skills mismatch")) {
        console.log("There was a problem updating the player - provided skills do not match room's skill set! " + e)
        appDispatch({
          type: "flashMessage",
          value: "Player update abandoned - provided skills do not match room's skill set !",
          messageType: "message-orange"
        })
        return
      } else {
        console.log("There was a problem updating the player " + e)
        return
      }
    }
  }

  return (
    <>
      <CustomMaterialSymbol name="undo" fontSize={"20px"} position="center" onClick={() => props.resetRender()} />
      {state.renderBasicInfoView && (
        <>
          {editState.linkedRoomUser && <div className="custom-info-box">This player is linked with room's member. If you want to edit basic information about this player then please unlink this player and provide new information or link it with another user.</div>}
          <div className="player-info-box">
            <table>
              {editState.linkedRoomUser ? (
                <tbody>
                  <tr>
                    <td>Firstname</td>
                    <td>
                      <span style={{ color: "white" }}>{editState.firstName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Lastname</td>
                    <td>
                      <span style={{ color: "white" }}>{editState.lastName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Sex</td>
                    <td>
                      <span style={{ color: "white" }}>{editState.sex}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>General overall score</td>
                    <td>
                      <span style={{ color: "white" }}>{editState.generalOverall}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Linked user</td>
                    <td>
                      <Link style={{ color: "#19c9e5" }} to={`/profile/${editState.linkedRoomUser.username}`}>
                        {editState.linkedRoomUser.username + " (" + editState.linkedRoomUser.firstName + " " + editState.linkedRoomUser.lastName + ")"}
                      </Link>
                      <button className="ml-2" onClick={() => unlinkPlayerFromUser()} type="button">
                        UNLINK
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <button className="delete">DELETE PLAYER</button>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td>Firstname</td>
                    <td>
                      <input
                        onChange={e =>
                          setEditState(draft => {
                            draft.firstName = e.target.value
                          })
                        }
                        id="input-1"
                        type="text"
                        value={editState.firstName}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Lastname</td>
                    <td>
                      <input
                        onChange={e =>
                          setEditState(draft => {
                            draft.lastName = e.target.value
                          })
                        }
                        id="input-1"
                        type="text"
                        value={editState.lastName}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Sex</td>
                    <td>
                      <label style={{ color: "white" }}>MALE</label>
                      <input
                        type="checkbox"
                        onChange={() =>
                          setEditState(draft => {
                            draft.sex = "MALE"
                          })
                        }
                        checked={editState.sex == "MALE"}
                        style={{ verticalAlign: "middle", marginLeft: "5px", marginRight: "10px" }}
                      />
                      <label style={{ color: "white" }}>FEMALE</label>
                      <input
                        type="checkbox"
                        onChange={() =>
                          setEditState(draft => {
                            draft.sex = "FEMALE"
                          })
                        }
                        checked={editState.sex == "FEMALE"}
                        style={{ verticalAlign: "middle", marginLeft: "5px" }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>General overall score</td>
                    <td>
                      <span style={{ color: "white" }}>{editState.generalOverall}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Linked user</td>
                    <td>
                      <span style={{ color: "white" }}>N/A</span>
                      <button className="ml-2" onClick={() => renderLinkPlayerWithUser()} type="button">
                        LINK
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <button className="delete">DELETE PLAYER</button>
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <div className="list-item" style={{ height: "170px", width: "50%" }}>
            {renderPlayerSkills()}
          </div>
          <div>
            <button className="mt-2" onClick={() => submitUpdate()} type="button">
              UPDATE
            </button>
          </div>
        </>
      )}
      {state.renderLinkPlayerWithUser && (
        <div className="player-link-box" style={{ color: "wheat", textAlign: "-webkit center" }}>
          <div>Select room member to link with:</div>
          {linkedRoomUserInitValue && (
            <div className="custom-info-box mt-2">
              First unlinked user (<span style={{ color: "#a4eeff" }}> {linkedRoomUserInitValue.username + " | " + linkedRoomUserInitValue.firstName + " " + linkedRoomUserInitValue.lastName} </span>) is not visible here.
              <br /> If you want to restore unlinked user please re-enter edit page.
            </div>
          )}
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
                  draft.renderBasicInfoView = true
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

export default PlayerEdit
