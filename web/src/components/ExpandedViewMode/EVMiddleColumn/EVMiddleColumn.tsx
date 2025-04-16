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
  projectId: string
  activeTab: ExpandedViewTab
  outcome: ComputedOutcome
  details: React.ReactElement // This is EvDetails
  comments: React.ReactElement
  childrenList?: React.ReactElement
  taskList?: React.ReactElement
  attachments?: React.ReactElement
  // Accept rightColumn prop
  rightColumn?: React.ReactElement
}

const EVMiddleColumn: React.FC<EVMiddleColumnProps> = ({
  projectId,
  // Destructure rightColumn
  rightColumn,
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
  // Get attachments count from the attachments component if available
  const attachmentsCount = attachments ? 
    (attachments.props.attachmentsInfo ? attachments.props.attachmentsInfo.length : 0) : 0
  
  return (
    <div className="ev-middle-column-wrapper">
      <DescendantsAchievementStatus
        childrenCount={childrenCount}
        computedScope={computedScope}
        computedAchievementStatus={computedAchievementStatus}
        attachmentsCount={attachmentsCount}
      />
      {/* Clone EvDetails element and pass rightColumn prop only when Details tab is active */}
      {activeTab === ExpandedViewTab.Details &&
        React.cloneElement(details, { rightColumn: rightColumn })}
      {activeTab === ExpandedViewTab.Comments && comments}
      {activeTab === ExpandedViewTab.ChildrenList && childrenList}
      {activeTab === ExpandedViewTab.TaskList && taskList}
      {activeTab === ExpandedViewTab.Attachments && attachments}
    </div>
  )
}

export default EVMiddleColumn
