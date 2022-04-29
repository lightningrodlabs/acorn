import React from 'react'
import { ComputedAchievementStatus } from '../../types'
import Icon from '../Icon/Icon'
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
          {/* More info icon */}
          <div>
            <Icon name="info.svg" className="light-grey" size="small" />
          </div>
        </>
      )}
      {childrenCount > 0 && (
        <>
          {/* case: Big (certain, not small), always has children */}
          {computedAchievementStatus.uncertains === 0 && (
            <>
              {computedAchievementStatus.smallsAchieved.toString()}/
              {computedAchievementStatus.smallsTotal.toString()}
            </>
          )}
          {/* case: Uncertain with Children */}
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

      {childrenCount > 0 && (
        <>
          {/* case: Uncertain with Children */}
          {computedAchievementStatus.uncertains !== 0 && (
            // TODO: add progress indicator here
            <>
              <div className="descendants-wrapper smalls">
                <Icon name="leaf.svg" />
                8/28
                {/* {computedAchievementStatus.smallsAchieved.toString()}/
                {computedAchievementStatus.smallsTotal.toString()} */}
              </div>

              <div className="descendants-wrapper uncertains">
                <Icon name="uncertain.svg" />
                12
                {/* {computedAchievementStatus.uncertains.toString()} */}
              </div>

              {/* More info icon */}
              <div className="more-info-icon-wrapper">
                <Icon name="info.svg" className="light-grey" size="small" />
              </div>
            </>
          )}

          {/* case: Big (certain, not small), always has children */}
          {computedAchievementStatus.uncertains === 0 && (
            // TODO: add progress indicator here
            <div className="descendants-wrapper smalls">
              <Icon name="leaf.svg" />
              8/28
              {/* {computedAchievementStatus.smallsAchieved.toString()}/
              {computedAchievementStatus.smallsTotal.toString()} */}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DescendantsAchievementStatus
