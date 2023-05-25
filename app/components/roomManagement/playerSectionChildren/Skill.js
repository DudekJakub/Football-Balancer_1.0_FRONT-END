import React, { useEffect, useState } from "react"

function Skill(props) {
  const skill = props.skill
  const editMode = props.editMode
  const [points, setPoints] = useState(props.skill.points ? props.skill.points : 0)

  function updateSkill() {
    if (typeof props.updateSkill === "function") {
      props.updateSkill(draft => {
        draft.skillsArray.filter(skillFromArray => skillFromArray.id === skill.id)[0].points = points
      })
    }
  }

  useEffect(() => {
    updateSkill()
  }, [points])

  return (
    <div style={{ display: "flex", marginTop: "8px", verticalAlign: "top" }}>
      <div style={{ width: "50%", borderRight: "1px solid black", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{skill.skillTemplate.name}</div>
      <div style={{ width: "50%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {!editMode ? (
          skill.points
        ) : (
          <select className="ml-2" defaultValue={points} style={{ padding: "0px" }} onChange={e => setPoints(e.target.value)}>
            {Array.from(Array(21).keys()).map(value => (
              <option key={value} value={value}>
                {value.toString().padStart(1, "0")}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}

export default Skill
