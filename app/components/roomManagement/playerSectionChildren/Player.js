import React, { useContext, useEffect, useState } from "react"
import CustomMaterialSymbol from "../../CustomMaterialSymbol"

function Player(props) {
  const player = props.player

  return (
    <div style={{ display: "flex", marginTop: "8px", verticalAlign: "top" }}>
      <div style={{ width: "40%", borderRight: "1px solid black", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.firstName + " " + player.lastName}</div>
      <div style={{ width: "20%", borderRight: "1px solid black" }}>{player.sex}</div>
      <div style={{ width: "20%", borderRight: "1px solid black" }}>{player.generalOverall}</div>
      <div style={{ width: "10%", borderRight: "1px solid black" }}>
        <CustomMaterialSymbol name={"info"} mainClassName={"d-flex align-items-center"} position={"center"} style={{ fontSize: "20px" }} onClick={() => props.setRenderPlayerInfo()} />
      </div>
      <div style={{ width: "10%" }}>
        <CustomMaterialSymbol name={"edit"} mainClassName={"d-flex align-items-center"} position={"center"} style={{ fontSize: "20px" }} onClick={() => props.setRenderPlayerEdit()} />
      </div>
    </div>
  )
}

export default Player
