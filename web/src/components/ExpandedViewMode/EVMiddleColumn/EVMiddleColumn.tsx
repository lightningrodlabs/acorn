import React from 'react'

import {
  ComputedOutcome,
  ComputedSimpleAchievementStatus,
} from '../../../types'
import { ExpandedViewTab } from '../NavEnum'
import DescendantsAchievementStatus from '../../DescendantsAchievementStatus/DescendantsAchievementStatus'

import './EVMiddleColumn.scss'

export type EVMiddleColumnProps = {
  activeTab: ExpandedViewTab
  outcome: ComputedOutcome
  details: React.ReactElement
  comments: React.ReactElement
}

const EVMiddleColumn: React.FC<EVMiddleColumnProps> = ({
  activeTab,
  details,
  comments,
  outcome,
}) => {
  // a default in case of loading/transitioning
  const computedAchievementStatus = outcome
    ? outcome.computedAchievementStatus
    : {
        uncertains: 0,
        smallsAchieved: 0,
        smallsTotal: 0,
        simple: ComputedSimpleAchievementStatus.NotAchieved,
      }
  const childrenCount = outcome ? outcome.children.length : 0
  return (
    <div className="expanded-view-content">
      <DescendantsAchievementStatus
        childrenCount={childrenCount}
        computedAchievementStatus={computedAchievementStatus}
      />
      <div className="expanded-view-inner-content">
        {activeTab === ExpandedViewTab.Details && details}
        {activeTab === ExpandedViewTab.Comments && comments}
      </div>
    </div>
  )
}

export default EVMiddleColumn
