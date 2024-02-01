import React, { useState, useEffect } from 'react'

export type GanttViewTimelineProps = {
  tasks?: Array<{
    name: string
    startDate: Date
    endDate: Date
  }>
}

const dayWidth = 28 // Width for each day

const GanttViewTimeline: React.FC<GanttViewTimelineProps> = ({
  tasks = [],
}) => {
  // State for days in the timeline
  const [days, setDays] = useState<Date[]>([])

  useEffect(() => {
    // Determine the start and end of the current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const dates = []

    // Loop through all days in the month and add them to state
    for (
      let day = new Date(startOfMonth);
      day <= endOfMonth;
      day.setDate(day.getDate() + 1)
    ) {
      dates.push(new Date(day))
    }

    setDays(dates)
  }, []) // Empty dependency array means this effect will only run once

  return (
    <div
      className="gantt-view-timeline"
      style={{ position: 'relative', overflowX: 'scroll', width: '100%' }}
    >
      {/* Render the days */}
      <div className="gantt-view-time-display">
        <div className="gantt-view-month">
          {days.length > 0 &&
            days[0].toLocaleDateString('default', { month: 'long' })}
        </div>
        <div className="gantt-view-dates">
          {days.map((day, index) => (
            <div
              className="gantt-view-date"
              key={index}
              style={{
                width: `${dayWidth}px`,
              }}
            >
              {day.getDate()}
            </div>
          ))}
        </div>
      </div>

      {/* Render the tasks */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          width: `${days.length * dayWidth}px`,
        }}
      >
        {' '}
        {/* Adjust positioning as needed */}
        {tasks.map((task, index) => {
          const startDayIndex = days.findIndex(
            (d) => d.toDateString() === task.startDate.toDateString()
          )
          const endDayIndex = days.findIndex(
            (d) => d.toDateString() === task.endDate.toDateString()
          )
          const duration = endDayIndex - startDayIndex + 1 // Include the end day in the duration
          const left = startDayIndex * dayWidth
          const width = duration * dayWidth

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${left}px`,
                width: `${width}px`,
                height: '20px', // Adjust height as needed
                backgroundColor: 'blue', // Adjust color as needed
                textAlign: 'center',
                color: 'white',
              }}
            >
              {task.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GanttViewTimeline
