import React from 'react'
import { ExpandedViewTab } from '../NavEnum'
import Comments from './TabContent/Comments/Comments.connector'
import Details from './TabContent/Details/Details.component'

import './EVMiddleColumn.scss'

export default function ExpandedViewModeContent({
  projectId,
  agentAddress,
  outcomeHeaderHash,
  outcome,
  outcomeContent,
  outcomeDescription,
  editTimeframe,
  setEditTimeframe,
  updateOutcome,
  squirrels,
  comments,
  deleteOutcomeMember,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
  activeTab,
  setActiveTab,
  uncertains,
  smallsAchieved,
  smallsTotal,
}) {
  return (
    <div className="expanded-view-content">
      <div>
        A: {smallsAchieved}
        T: {smallsTotal}
        U: {uncertains}
      </div>
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
              squirrels,
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
