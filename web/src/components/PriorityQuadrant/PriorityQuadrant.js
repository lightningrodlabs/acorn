import React from 'react'
import './PriorityQuadrant.scss'
import PriorityGoal from '../PriorityGoal/PriorityGoal'

function PriorityQuadrant({
  projectId,
  title,
  titleClassname,
  goals,
  setPriorityPickerAddress,
}) {
  return (
    <div className='priority-quadrant'>
      <div className={`priority-quadrant-title ${titleClassname}`}>{title}</div>
      <div className='priority-quadrant-goals'>
        {goals.map((goal, index) => {
          return (
            <PriorityGoal
              projectId={projectId}
              key={index}
              goal={goal}
              setPriorityPickerAddress={setPriorityPickerAddress}
            />
          )
        })}
      </div>
    </div>
  )
}

export default PriorityQuadrant
