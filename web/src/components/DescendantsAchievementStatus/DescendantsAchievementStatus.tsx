import React from 'react'
import { ComputedAchievementStatus, ComputedScope } from '../../types'
import Icon from '../Icon/Icon'
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator'
import Typography from '../Typography/Typography'
import './DescendantsAchievementStatus.scss'

export type DescendantsAchievementStatusProps = {
  childrenCount: number
  computedScope: ComputedScope
  computedAchievementStatus: ComputedAchievementStatus
}

const DescendantsAchievementStatus: React.FC<DescendantsAchievementStatusProps> = ({
  childrenCount,
  computedScope,
  computedAchievementStatus,
}) => {
  return (
    <div className="descendants-achievement-status">
      {/* case: No Children + Uncertain scope */}
      {computedScope === ComputedScope.Uncertain && childrenCount === 0 && (
        <>
          <Typography style="caption2">
            This outcome has no children.
          </Typography>{' '}
        </>
      )}

      {/* case: Small scope & With No Tasks */}
      {computedScope === ComputedScope.Small &&
        computedAchievementStatus.tasksTotal === 0 && (
          <>
            <Typography style="caption2">This outcome has no tasks.</Typography>{' '}
          </>
        )}

      {/* case: Small scope & With Tasks */}
      {computedScope === ComputedScope.Small &&
        computedAchievementStatus.tasksTotal > 0 && (
          <>
            {/* tasks */}
            <div
              className={`descendants-wrapper tasks ${computedAchievementStatus.tasksAchieved ===
                computedAchievementStatus.tasksTotal
                ? 'achieved'
                : ''
                }`}
            >
              <ProgressIndicator
                progress={Math.round(
                  (computedAchievementStatus.tasksAchieved /
                    computedAchievementStatus.tasksTotal) *
                  100
                )}
              />
              {/* number of achieved and total tasks */}
              {computedAchievementStatus.tasksAchieved.toString()}/
              {computedAchievementStatus.tasksTotal.toString()} task{computedAchievementStatus.tasksTotal !== 1 ? 's' : ''}
              {/* achievement progress percentage */}
              <div className="descendants-progress-percentage">
                (
                {Math.round(
                  (computedAchievementStatus.tasksAchieved /
                    computedAchievementStatus.tasksTotal) *
                  100
                )}
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
              className={`descendants-wrapper smalls ${computedAchievementStatus.uncertains === 0 &&
                computedAchievementStatus.smallsAchieved ===
                computedAchievementStatus.smallsTotal
                ? 'achieved'
                : ''
                }`}
            >
              {computedAchievementStatus.uncertains === 0 && (
                <ProgressIndicator
                  progress={Math.round(
                    (computedAchievementStatus.smallsAchieved /
                      computedAchievementStatus.smallsTotal) *
                    100
                  )}
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
                  {Math.round(
                    (computedAchievementStatus.smallsAchieved /
                      computedAchievementStatus.smallsTotal) *
                    100
                  )}
                  % )
                </div>
              )}
            </div>
          )}

          {/* Uncertain children */}
          {computedAchievementStatus.uncertains !== 0 && (
            <div className="descendants-wrapper uncertains">
              <div className="descendants-scope-wrapper">
                <Icon name="uncertain.svg" />
              </div>
              {computedAchievementStatus.uncertains.toString()}
            </div>
          )}
        </>
      )}

      {/* More info icon */}
      {/* Don't show more info icon if it's small scope */}
      {computedScope !== ComputedScope.Small && (
        <div className="more-info-wrapper">
          <div>
            <a href="https://docs.acorn.software/outcomes/progress-indicator" target="_blank">
              <Icon name="info.svg" className="light-grey" size="small" />
            </a>
          </div>
        </div>
      )
      }
    </div >
  )
}

export default DescendantsAchievementStatus
