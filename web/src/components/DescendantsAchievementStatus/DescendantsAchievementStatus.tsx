import React from 'react'
import { ComputedAchievementStatus } from '../../types'
import Icon from '../Icon/Icon'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
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
      {/* case: No Children (uncertain) */}
      {childrenCount === 0 && (
        <>
          {/* TODO: set typography */}
          <Typography style="caption2">
            This outcome has no children.
          </Typography>{' '}
        </>
      )}

      {/* case: With Children */}
      {childrenCount > 0 && (
        <>
          {/* Smalls */}
          {computedAchievementStatus.smallsTotal !== 0 && (
            <div className="descendants-wrapper smalls">
              <Icon name="leaf.svg" />
              {/* TODO: pass real progress here */}
              <ProgressIndicator progress={40} />
              {computedAchievementStatus.smallsAchieved.toString()}/
              {computedAchievementStatus.smallsTotal.toString()}
            </div>
          )}

          {/* Uncertains */}
          {computedAchievementStatus.uncertains !== 0 && (
            <div className="descendants-wrapper uncertains">
              <Icon name="uncertain.svg" />
              {computedAchievementStatus.uncertains.toString()}
            </div>
          )}
        </>
      )}

      {/* More info icon */}
      <div>
        <Icon name="info.svg" className="light-grey" size="small" />
      </div>
    </div>
  )
}

export default DescendantsAchievementStatus
