import React, { useEffect, useState, useContext } from "react"
import { RoomContext } from "./RoomContext"
import { useNavigate } from "react-router-dom"
import CustomMaterialSymbol from "./CustomMaterialSymbol"

const PasswordOverlay = props => {
  const { roomId, onSubmit } = props
  const [password, setPassword] = useState("")
  const { setRoomId, setRoomPassword, readyToEnter } = useContext(RoomContext)
  const navigate = useNavigate()

  const handleSubmit = e => {
    e.preventDefault()
    if (roomId) {
      setRoomId(roomId)
      setRoomPassword(password)
    }
  }

  useEffect(() => {
    if (readyToEnter) {
      onSubmit()
    }
  }, [readyToEnter])

  return (
    <div className="password-overlay">
      <form onSubmit={handleSubmit}>
        <label>
          ROOM PASSWORD: <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">SUBMIT</button>{" "}
        <button
          type="reset"
          className="home"
          onClick={() => {
            navigate(`/`)
          }}
        >
          HOME
        </button>
        <div className="info-box">
          <CustomMaterialSymbol name={"warning"} mainClassName={"mr-3"} fontColor={"currentColor"} />
          If you are member of the room, just click submit button.
        </div>
      </form>
    </div>
  )
}

export default PasswordOverlay
