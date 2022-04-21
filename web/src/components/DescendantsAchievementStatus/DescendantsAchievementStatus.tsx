import React from 'react'
import { ComputedAchievementStatus } from '../../types'
import Typography from '../Typography/Typography'
import './DescendantsAchievementStatus.scss'

export type DescendantsAchievementStatusProps = {
  childrenCount: number
  computedAchievementStatus: ComputedAchievementStatus
}

const DescendantsAchievementStatus: React.FC<DescendantsAchievementStatusProps> = ({
  childrenCount,
  computedAchievementStatus,
}) => {
  return (
    <div className="descendants-achievement-status">
      {/* case: No Children */}
      {childrenCount === 0 && (
        <>
          {/* TODO: set typography */}
          <Typography style="caption1">
            This outcome has no children.
          </Typography>{' '}
          <div>i</div>
        </>
      )}
      {childrenCount > 0 && (
        <>
          {/* case: No Uncertains */}
          {computedAchievementStatus.uncertains === 0 && (
            <>
              {computedAchievementStatus.smallsAchieved.toString()}/
              {computedAchievementStatus.smallsTotal.toString()}
            </>
          )}
          {/* case: With Uncertains */}
          {computedAchievementStatus.uncertains !== 0 && (
            <>
              <div>
                {computedAchievementStatus.smallsAchieved.toString()}/
                {computedAchievementStatus.smallsTotal.toString()}
              </div>
              <div className="descendants-achievement-status-uncertains">
                {computedAchievementStatus.uncertains.toString()}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default DescendantsAchievementStatus
