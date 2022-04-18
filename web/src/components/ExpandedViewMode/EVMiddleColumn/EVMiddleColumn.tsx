import React from 'react'
import { ExpandedViewTab } from '../NavEnum'
import Comments from './TabContent/Comments/Comments.connector'
import Details from './TabContent/Details/Details.component'

import './EVMiddleColumn.scss'
import DescendantsAchievementStatus from '../../DescendantsAchievementStatus/DescendantsAchievementStatus'
import { AssigneeWithHeaderHash, ComputedAchievementStatus } from '../../../types'

// TODO: fix these types
export type EVMiddleColumnProps = {
  projectId: any
  agentAddress: any
  outcomeHeaderHash: any
  outcome: any
  outcomeContent: any
  outcomeDescription: any
  editTimeframe: any
  setEditTimeframe: any
  updateOutcome: any
  assignees: AssigneeWithHeaderHash[]
  comments: any
  deleteOutcomeMember: any
  startTitleEdit: any
  endTitleEdit: any
  startDescriptionEdit: any
  endDescriptionEdit: any
  editingPeers: any
  activeTab: ExpandedViewTab
  setActiveTab: React.Dispatch<React.SetStateAction<ExpandedViewTab>>
  computedAchievedmentStatus: ComputedAchievementStatus
}

const EVMiddleColumn: React.FC<EVMiddleColumnProps> = ({
  projectId,
  agentAddress,
  outcomeHeaderHash,
  outcome,
  outcomeContent,
  outcomeDescription,
  editTimeframe,
  setEditTimeframe,
  updateOutcome,
  assignees,
  comments,
  deleteOutcomeMember,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
  activeTab,
  setActiveTab,
  computedAchievedmentStatus,
}) => {
  return (
    <div className="expanded-view-content">
      <DescendantsAchievementStatus
        computedAchievedmentStatus={computedAchievedmentStatus}
      />
      <div className="expanded-view-inner-content">
        {activeTab === ExpandedViewTab.Details && (
          <Details
            {...{
              projectId,
              agentAddress,
              setActiveTab,
              editTimeframe,
              setEditTimeframe,
              outcomeHeaderHash,
              outcome,
              outcomeContent,
              outcomeDescription,
              updateOutcome,
              assignees,
              deleteOutcomeMember,
              startTitleEdit,
              endTitleEdit,
              startDescriptionEdit,
              endDescriptionEdit,
              editingPeers,
            }}
          />
        )}
        {activeTab === ExpandedViewTab.Comments && (
          <Comments projectId={projectId} comments={comments} />
        )}
      </div>
    </div>
  )
}

export default EVMiddleColumn
