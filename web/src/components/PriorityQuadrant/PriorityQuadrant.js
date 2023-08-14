import React from 'react'
import './PriorityQuadrant.scss'
import PriorityOutcome from '../PriorityOutcome/PriorityOutcome.connector'

function PriorityQuadrant({
  projectId,
  title,
  titleClassname,
  outcomes,
  setPriorityPickerAddress,
}) {
  return (
    <div className="priority-quadrant">
      <div className={`priority-quadrant-title ${titleClassname}`}>{title}</div>
      <div className="priority-quadrant-outcomes">
        {outcomes.map((outcome, index) => {
          return (
            <PriorityOutcome
              projectId={projectId}
              key={index}
              outcome={outcome}
              setPriorityPickerAddress={setPriorityPickerAddress}
            />
          )
        })}
      </div>
    </div>
  )
}

export default PriorityQuadrant
