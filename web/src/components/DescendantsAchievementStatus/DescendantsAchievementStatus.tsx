import React from 'react'
import { ComputedAchievementStatus } from '../../types'
import './DescendantsAchievementStatus.scss'

export type DescendantsAchievementStatusProps = {
  childrenCount: number
  computedAchievedmentStatus: ComputedAchievementStatus
}

const DescendantsAchievementStatus: React.FC<DescendantsAchievementStatusProps> = ({
  childrenCount,
  computedAchievedmentStatus,
}) => {
  return (
    <div className="descendants-achievement-status">
      {/* case: No Children */}
      {childrenCount === 0 && (
        <>
          This outcome has no children.<div>i</div>
        </>
      )}
      {childrenCount > 0 && (
        <>
          {/* case: No Uncertains */}
          {computedAchievedmentStatus.uncertains === 0 && (
            <>
              {computedAchievedmentStatus.smallsAchieved.toString()}/
              {computedAchievedmentStatus.smallsTotal.toString()}
            </>
          )}
          {/* case: With Uncertains */}
          {computedAchievedmentStatus.uncertains !== 0 && (
            <>
              <div>
                {computedAchievedmentStatus.smallsAchieved.toString()}/
                {computedAchievedmentStatus.smallsTotal.toString()}
              </div>
              <div className="descendants-achievement-status-uncertains">
                {computedAchievedmentStatus.uncertains.toString()}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default DescendantsAchievementStatus
