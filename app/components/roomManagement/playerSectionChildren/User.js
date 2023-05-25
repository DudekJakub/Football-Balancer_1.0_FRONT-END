import React, { useEffect, useState } from "react"
import CustomMaterialSymbol from "../../CustomMaterialSymbol"

function User(props) {
  const user = props.user
  const userLinkedPlayer = props.user.linkedRoomPlayer
  const [IsLinkedButtonClicked, setIsLinkedButtonClicked] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsLinkedButtonClicked(false)
    }, 5000)
  }, [IsLinkedButtonClicked])

  return (
    <div style={{ display: "flex", marginTop: "8px", verticalAlign: "top" }}>
      <div style={{ width: "40%", borderRight: "1px solid black" }}>{user.username}</div>
      <div style={{ width: "20%", borderRight: "1px solid black", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.firstName}</div>
      <div style={{ width: "20%", borderRight: "1px solid black", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.lastName}</div>
      <div style={{ width: "20%" }}>
        {userLinkedPlayer ? (
          <CustomMaterialSymbol name={"check"} fontSize={"18px"} cursor={"auto"} position={"center"} />
        ) : (
          <CustomMaterialSymbol
            name={props.linkedUser === user ? "check_box" : "compare_arrows"}
            fontSize={"18px"}
            fontColor={props.linkedUser === user ? "green" : "darkorange"}
            animation={props.linkedUser === user && "animateButtonShake 3s"}
            position={"center"}
            onClick={() => {
              props.setLinkedUser(user)
              setIsLinkedButtonClicked(true)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default User
