import React, { useContext, useEffect, useState } from "react"
import Axios from "axios"
import StateContext from "../../../StateContext"
import CustomMaterialSymbol from "../../CustomMaterialSymbol"
import { Link } from "react-router-dom"
import Skill from "./Skill"

function PlayerInfo(props) {
  const appState = useContext(StateContext)
  const player = props.player
  const linkedRoomUser = player.linkedRoomUser
  const [playerSkills, setPlayerSkills] = useState([])

  useEffect(() => {
    async function fetchPlayerSkills() {
      try {
        const response = await Axios.get(`/api/skill/all-by-playerId?playerId=${player.id}`, { headers: { Authorization: `Bearer ${appState.user.token}` } })
        if (response.data) {
          setPlayerSkills(response.data)
        }
      } catch (e) {
        console.log("There was a problem fetching player skills " + e)
        return
      }
    }
    fetchPlayerSkills()
  }, [player])

  function renderPlayerSkills() {
    return (
      <>
        <div style={{ display: "flex" }}>
          <div style={{ width: "50%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Name</div>
          <div style={{ width: "50%", borderBottom: "1px solid black" }}>Points</div>
        </div>
        {playerSkills.map(skill => {
          return <Skill key={skill.id} skill={skill} />
        })}
      </>
    )
  }

  return (
    <>
      <CustomMaterialSymbol name="undo" fontSize={"20px"} position="center" onClick={() => props.resetRender()} />
      <div className="player-info-box">
        <table>
          <tbody>
            <tr>
              <td>Firstname</td>
              <td>
                <span style={{ color: "white" }}>{player.firstName}</span>
              </td>
            </tr>
            <tr>
              <td>Lastname</td>
              <td>
                <span style={{ color: "white" }}>{player.lastName}</span>
              </td>
            </tr>
            <tr>
              <td>Sex</td>
              <td>
                <span style={{ color: "white" }}>{player.sex}</span>
              </td>
            </tr>
            <tr>
              <td>General overall score</td>
              <td>
                <span style={{ color: "white" }}>{player.generalOverall}</span>
              </td>
            </tr>
            <tr>
              <td>Linked user</td>
              <td style={{ minWidth: "200px" }}>
                {linkedRoomUser ? (
                  <Link style={{ color: "#19c9e5" }} to={`/profile/${linkedRoomUser.username}`}>
                    {linkedRoomUser.username + " (" + linkedRoomUser.firstName + " " + linkedRoomUser.lastName + ")"}
                  </Link>
                ) : (
                  <span style={{ color: "white" }}>N/A</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="list-item" style={{ height: "170px", width: "50%" }}>
        {renderPlayerSkills()}
      </div>
    </>
  )
}

export default PlayerInfo
