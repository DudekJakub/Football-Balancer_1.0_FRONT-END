import React, { useContext, useEffect, useState } from "react"
import CustomMaterialSymbol from "../../CustomMaterialSymbol"
import { useImmer } from "use-immer"
import Axios from "axios"
import StateContext from "../../../StateContext"
import DispatchContext from "../../../DispatchContext"
import Skill from "./Skill"

function CreatePlayerSkillPointsStep(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    player: props.player,
    skillsArray: []
  })

  useEffect(() => {
    async function fetchPlayerSkills() {
      try {
        const response = await Axios.get(`/api/skill/all-by-playerId?playerId=${state.player.id}`, { headers: { Authorization: `Bearer ${appState.user.token}` } })
        if (response.data) {
          setState(draft => {
            draft.skillsArray = response.data
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
    return (
      <>
        <div style={{ display: "flex" }}>
          <div style={{ width: "50%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Name</div>
          <div style={{ width: "50%", borderBottom: "1px solid black" }}>Points</div>
        </div>
        {state.skillsArray.map(skill => {
          return <Skill key={skill.id} skill={skill} editMode={true} updateSkill={setState} />
        })}
      </>
    )
  }

  async function submitSkillsList() {
    try {
      const response = await Axios.put(
        `/api/skill/all-for-player-by-playerId`,
        {
          roomId: props.room.id,
          roomAdminId: appState.user.id,
          playerId: state.player.id,
          updatedSkillsList: state.skillsArray
        },
        { headers: { Authorization: `Bearer ${appState.user.token}` } }
      )

      if (response.data) {
        setState(draft => {
          draft.player.generalOverall = response.data.updatedPlayerGeneralOverall
        })
        props.submitSkillsListStep(state.player)
        appDispatch({
          type: "flashMessage",
          value: "Player's skills list successfully filled out !",
          messageType: "message-green"
        })
      }
    } catch (e) {
      console.log("There was a problem submiting new player skills list " + e)
      return
    }
  }

  return (
    <>
      <CustomMaterialSymbol name="cancel" position="center" fontSize="20px" onClick={() => props.resetRender()} />
      <div style={{ color: "wheat", textAlign: "-webkit center" }}>
        <div>Step 2</div>
        <div>Fill out the skills list:</div>
        <div className="list-item" style={{ height: "170px", width: "50%" }}>
          {renderPlayerSkills()}
        </div>
        <div>
          <button className="mt-4" onClick={() => submitSkillsList()} type="button">
            SUBMIT &raquo;
          </button>
        </div>
      </div>
    </>
  )
}

export default CreatePlayerSkillPointsStep
