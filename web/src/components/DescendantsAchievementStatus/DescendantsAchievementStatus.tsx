import React from 'react'
import { ComputedAchievementStatus, ComputedOutcome } from '../../types'
import Icon from '../Icon/Icon'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import Typography from '../Typography/Typography'
import './DescendantsAchievementStatus.scss'

export type DescendantsAchievementStatusProps = {
  childrenCount: number
  tasklistCount: number
  computedAchievementStatus: ComputedAchievementStatus
}

const DescendantsAchievementStatus: React.FC<DescendantsAchievementStatusProps> = ({
  childrenCount,
  tasklistCount,
  computedAchievementStatus,
}) => {
  return (
    <div className="descendants-achievement-status">
      {/* case: No Children + Uncertain scope */}
      {childrenCount === 0 && (
        <>
          <Typography style="caption2">
            This outcome has no children.
          </Typography>{' '}
        </>
      )}

      {/* case: No Children + Small scope */}
      {tasklistCount === 0 && (
        <>
          <Typography style="caption2">This outcome has no tasks.</Typography>{' '}
        </>
      )}

      {/* case: With Children + Small scope */}
      {tasklistCount > 0 && (
        <>
          {/* tasks */}
          <div
            className={`descendants-wrapper tasks ${
              computedAchievementStatus.smallsAchieved ===
              computedAchievementStatus.smallsTotal
                ? 'achieved'
                : ''
            }`}
          >
            {/* TODO: display real total and achieved tasks */}
            <ProgressIndicator
              progress={
                (computedAchievementStatus.smallsAchieved /
                  computedAchievementStatus.smallsTotal) *
                100
              }
            />
            {/* TODO: display real total and achieved tasks */}
            {/* number of achived and total tasks */}
            {computedAchievementStatus.smallsAchieved.toString()}/
            {computedAchievementStatus.smallsTotal.toString()} tasks
            {/* achievement progress percentage */}
            <div className="descendants-progress-percentage">
              (
              {(computedAchievementStatus.smallsAchieved /
                computedAchievementStatus.smallsTotal) *
                100}
              % )
            </div>
          </div>
        </>
      )}

      {/* case: With Children + Not Small scope (Uncertain and Big scopes) */}
      {childrenCount > 0 && (
        <>
          {/* Small children */}
          {computedAchievementStatus.smallsTotal !== 0 && (
            <div
              className={`descendants-wrapper smalls ${
                computedAchievementStatus.uncertains === 0 &&
                computedAchievementStatus.smallsAchieved ===
                  computedAchievementStatus.smallsTotal
                  ? 'achieved'
                  : ''
              }`}
            >
              {computedAchievementStatus.uncertains === 0 && (
                <ProgressIndicator
                  progress={
                    (computedAchievementStatus.smallsAchieved /
                      computedAchievementStatus.smallsTotal) *
                    100
                  }
                />
              )}
              <div className="descendants-scope-wrapper">
                {/* @ts-ignore */}
                <Icon name="leaf.svg" />
              </div>
              {computedAchievementStatus.smallsAchieved.toString()}/
              {computedAchievementStatus.smallsTotal.toString()}
              {/* achievement progress percentage */}
              {/* won't display if outcome is uncertain scope */}
              {computedAchievementStatus.uncertains === 0 && (
                <div className="descendants-progress-percentage">
                  (
                  {(computedAchievementStatus.smallsAchieved /
                    computedAchievementStatus.smallsTotal) *
                    100}
                  % )
                </div>
              )}
            </div>
          )}

          {/* Uncertain children */}
          {computedAchievementStatus.uncertains !== 0 && (
            <div className="descendants-wrapper uncertains">
              <div className="descendants-scope-wrapper">
                {/* @ts-ignore */}
                <Icon name="uncertain.svg" />
              </div>
              {computedAchievementStatus.uncertains.toString()}
            </div>
          )}
        </>
      )}

      {/* More info icon */}
      {/* TODO: Don't show more info icon if it's small scope */}
      <div className="more-info-wrapper">
        <div>
          {/* @ts-ignore */}
          <Icon name="info.svg" className="light-grey" size="small" />
        </div>
      </div>
    </div>
  )
}

export default DescendantsAchievementStatus
