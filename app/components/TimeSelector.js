import React, { useEffect } from "react"

function TimeSelector(props) {
  return (
    <div className="d-flex flex-row justify-content-center mt-2">
      <select className="ml-2" value={props.hour} onChange={props.onChangeHour}>
        {Array.from(Array(24).keys()).map(value => (
          <option key={value} value={value}>
            {value.toString().padStart(2, "0")}
          </option>
        ))}
      </select>{" "}
      <select className="ml-2" value={props.minute} onChange={props.onChangeMinute}>
        {Array.from(Array(60).keys()).map(value => (
          <option key={value} value={value}>
            {value.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  )
}

export default TimeSelector
