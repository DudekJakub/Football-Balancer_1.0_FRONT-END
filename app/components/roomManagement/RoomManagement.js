import React from "react"
import FormationSection from "./FormationSection"
import PlayerSection from "./PlayerSection"
import SkillSection from "./SkillSection"

function RoomManagement(props) {
  const room = props.room

  return (
    <form className="d-flex flex-column">
      <div className="main d-flex flex-column container">
        <div className="room-management-layout">
          <PlayerSection room={room} setRoom={props.setRoom} />
          <SkillSection />
          <FormationSection />
        </div>
      </div>
    </form>
  )
}

export default RoomManagement
