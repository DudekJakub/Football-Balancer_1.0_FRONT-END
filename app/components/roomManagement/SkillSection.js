import React, { useContext, useEffect, useState } from "react"
import CustomMaterialSymbol from "../CustomMaterialSymbol"

function SkillSection(props) {
  const [renderContent, setRenderContent] = useState(true)

  return (
    <div style={{ textAlign: "center" }}>
      <h2 className="align-items-center" style={{ display: "inline-flex" }}>
        SKILL SECTION
        <CustomMaterialSymbol name={"arrow_drop_down_circle"} mainClassName={"d-flex align-items-center"} style={{ fontSize: "20px", color: "wheat", marginLeft: "5px", verticalAlign: "bottom", fontVariant: "initial" }} onClick={() => setRenderContent(prev => !prev)} />
      </h2>
    </div>
  )
}

export default SkillSection
