import React, { useEffect } from 'react'

import {
  ComputedOutcome,
  ComputedScope,
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
  childrenList?: React.ReactElement
  taskList?: React.ReactElement
  attachments?: React.ReactElement
}

const EVMiddleColumn: React.FC<EVMiddleColumnProps> = ({
  activeTab,
  details,
  comments,
  childrenList,
  taskList,
  outcome,
  attachments,
}) => {
  // a default in case of loading/transitioning
  const computedScope = outcome ? outcome.computedScope : ComputedScope.Small
  const computedAchievementStatus = outcome
    ? outcome.computedAchievementStatus
    : {
        uncertains: 0,
        smallsAchieved: 0,
        smallsTotal: 0,
        tasksAchieved: 0,
        tasksTotal: 0,
        simple: ComputedSimpleAchievementStatus.NotAchieved,
      }
  const childrenCount = outcome ? outcome.children.length : 0
  return (
    <div className="ev-middle-column-wrapper">
      <DescendantsAchievementStatus
        childrenCount={childrenCount}
        computedScope={computedScope}
        computedAchievementStatus={computedAchievementStatus}
      />
      {activeTab === ExpandedViewTab.Details && details}
      {activeTab === ExpandedViewTab.Comments && comments}
      {activeTab === ExpandedViewTab.ChildrenList && childrenList}
      {activeTab === ExpandedViewTab.TaskList && taskList}
      {activeTab === ExpandedViewTab.Attachments && attachments}
    </div>
  )
}

export default EVMiddleColumn
