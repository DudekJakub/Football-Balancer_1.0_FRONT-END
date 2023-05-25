import React, { useContext, useEffect, useState } from "react"
import StateContext from "../../StateContext"
import Axios from "axios"
import { useImmer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import Player from "./playerSectionChildren/Player"
import CreatePlayerBasicStep from "./playerSectionChildren/CreatePlayerBasicStep"
import CreatePlayerSkillPointsStep from "./playerSectionChildren/CreatePlayerSkillPointsStep"
import CustomMaterialSymbol from "../CustomMaterialSymbol"
import PlayerInfo from "./playerSectionChildren/PlayerInfo"
import PlayerEdit from "./playerSectionChildren/PlayerEdit"
import Loading from "../Loading"

function PlayerSection(props) {
  const roomId = props.room.id
  const isUserAdmin = props.room.isUserAdmin
  const appState = useContext(StateContext)
  const [renderContent, setRenderContent] = useState(true)
  const [players, setPlayers] = useImmer({
    playersArray: []
  })
  const [state, setState] = useImmer({
    renderBasicInfo: true,
    renderCreatePlayerBasicStep: false,
    renderCreatePlayerSkillPointsStep: false,
    renderPlayerEdit: false,
    renderPlayerInfo: false,
    playersListLoading: true
  })
  const [newPlayer, setNewPlayer] = useState()
  const [playerInfo, setPlayerInfo] = useState()
  const [playerEdit, setPlayerEdit] = useState()

  useEffect(() => {
    async function fetchPlayersList() {
      try {
        const response = await Axios.get(`/api/player/all-by-room-id?roomId=${roomId}`, { headers: { Authorization: `Bearer ${appState.user.token}` } })
        if (response.data) {
          setPlayers(draft => {
            draft.playersArray = response.data
          })
          setState(draft => {
            draft.playersListLoading = false
          })
        }
      } catch (e) {
        console.log("There was a problem fetching players list " + e)
        return
      }
    }
    fetchPlayersList()
  }, [])

  function renderPlayersList() {
    return state.playersListLoading ? (
      <Loading />
    ) : (
      <>
        <div style={{ display: "flex" }}>
          <div style={{ width: "40%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Name</div>
          <div style={{ width: "20%", borderRight: "1px solid black", borderBottom: "1px solid black" }}>Sex</div>
          <div style={{ width: "20%", borderRight: "1px solid black", borderBottom: "1px solid black", display: "inline-flex", justifyContent: "center" }}>
            <a style={{ marginLeft: "5px" }}>OA</a>
            <CustomMaterialSymbol name={"help"} mainClassName={"d-flex align-items-center"} style={{ color: "darkorange", fontSize: "20px", verticalAlign: "top", marginLeft: "5px" }} />
          </div>
          <div style={{ width: "20%" }}></div>
        </div>
        {players.playersArray.map(player => {
          return (
            <Player
              key={player.id}
              player={player}
              setRenderPlayerInfo={() => {
                renderCloser()
                setPlayerInfo(player)
                setState(draft => {
                  draft.renderPlayerInfo = true
                })
              }}
              setRenderPlayerEdit={() => {
                renderCloser()
                setPlayerEdit(player)
                setState(draft => {
                  draft.renderPlayerEdit = true
                })
              }}
            />
          )
        })}
      </>
    )
  }

  function renderTargetContentBox() {
    return (
      <>
        {state.renderBasicInfo && <a>Player section is an area where you can check list of all players belong to the room, inspect each of them, edit or create new one!</a>}
        {state.renderCreatePlayerBasicStep && (
          <CreatePlayerBasicStep
            room={props.room}
            setRoom={props.setRoom}
            resetRender={resetRender}
            submitBasicStep={newPlayer => {
              setState(draft => {
                draft.renderCreatePlayerBasicStep = false
                draft.renderCreatePlayerSkillPointsStep = true
              })
              setPlayers(draft => {
                draft.playersArray.push(newPlayer)
              })
              setNewPlayer(newPlayer)
            }}
          />
        )}
        {state.renderCreatePlayerSkillPointsStep && (
          <CreatePlayerSkillPointsStep
            room={props.room}
            resetRender={resetRender}
            player={newPlayer}
            submitSkillsListStep={updatedPlayer => {
              submitUpdatePlayer(updatedPlayer)
            }}
          />
        )}
        {state.renderPlayerInfo && <PlayerInfo resetRender={resetRender} player={playerInfo} />}
        {state.renderPlayerEdit && <PlayerEdit resetRender={resetRender} player={playerEdit} room={props.room} updatePlayer={updatedPlayer => submitUpdatePlayer(updatedPlayer)} />}
      </>
    )
  }

  function submitUpdatePlayer(updatedPlayer) {
    setPlayerInfo(updatedPlayer)
    setPlayers(draft => {
      const updatedPlayersArray = draft.playersArray.map(p => {
        if (p.id === updatedPlayer.id) {
          return updatedPlayer
        }
        return p
      })
      draft.playersArray = updatedPlayersArray
    })
    renderCloser()
    setState(draft => {
      draft.renderPlayerInfo = true
    })
  }

  function renderCloser() {
    setState(draft => {
      ;(draft.renderBasicInfo = false), (draft.renderCreatePlayerBasicStep = false), (draft.renderPlayerInfo = false), (draft.renderPlayerEdit = false)
    })
  }

  function resetRender() {
    renderCloser()
    setState(draft => {
      draft.renderBasicInfo = true
    })
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2 className="align-items-center" style={{ display: "inline-flex" }}>
        PLAYER SECTION
        <CustomMaterialSymbol name={"arrow_drop_down_circle"} mainClassName={"d-flex align-items-center"} style={{ fontSize: "20px", color: "wheat", marginLeft: "5px", verticalAlign: "bottom", fontVariant: "initial" }} onClick={() => setRenderContent(prev => !prev)} />
      </h2>
      <CSSTransition in={renderContent} timeout={400} classNames="add-room-text" unmountOnExit>
        <div className="room-management-player-section">
          <div className="player-list-area">
            PLAYERS LIST <div className="list-item">{renderPlayersList()}</div>
          </div>
          <div className="main-content-area">
            {state.renderBasicInfo && (
              <div>
                {isUserAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      renderCloser()
                      setState(draft => {
                        draft.renderCreatePlayerBasicStep = !draft.renderCreatePlayerBasicStep
                      })
                    }}
                  >
                    CREATE PLAYER
                  </button>
                )}
              </div>
            )}
            <div className="basic-content">{renderTargetContentBox()}</div>
          </div>
        </div>
      </CSSTransition>
    </div>
  )
}

export default PlayerSection
