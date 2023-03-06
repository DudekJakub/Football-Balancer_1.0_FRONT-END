import moment from "moment/moment"
import React, { useState } from "react"

function Calendar(props) {
  const [currentDate, setCurrentDate] = useState(moment())
  const daysInMonth = currentDate.daysInMonth()
  const firstDayOfMonth = moment(currentDate).startOf("month").format("d")

  const handleDateClick = day => {
    setCurrentDate(moment(currentDate).date(day))
    props.chosenDate(moment(currentDate).date(day).format("MMMM DD YYYY"))
  }

  const handlePrevMonthClick = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month"))
  }

  const handleNextMonthClick = () => {
    setCurrentDate(moment(currentDate).add(1, "month"))
  }

  const renderDays = () => {
    const daysArray = []

    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(<div className="day empty" key={`empty-${i}`} />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = moment().isSame(currentDate, "day") && moment(currentDate).date() === day
      const isSelectedDay = moment(currentDate).date() === day

      daysArray.push(
        <div className={`day ${isCurrentDay ? "today" : ""} ${isSelectedDay ? "selected" : ""}`} key={day} onClick={() => handleDateClick(day)}>
          {day}
        </div>
      )
    }

    return daysArray
  }

  return (
    <div className="calendar">
      <div className="header">
        <div>
          <button style={{ border: "none", background: "none", color: "#2f3061" }} onClick={handlePrevMonthClick}>
            {"<"}
          </button>
          <span className="ml-1 mr-1">{currentDate.format("MMMM YYYY")}</span>
          <button style={{ border: "none", background: "none", color: "#2f3061" }} onClick={handleNextMonthClick}>
            {">"}
          </button>
        </div>
      </div>
      <div className="days mt-2">
        <div className="day">Sun</div>
        <div className="day">Mon</div>
        <div className="day">Tue</div>
        <div className="day">Wed</div>
        <div className="day">Thu</div>
        <div className="day">Fri</div>
        <div className="day">Sat</div>
        {renderDays()}
      </div>
    </div>
  )
}

export default Calendar
