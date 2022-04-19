import React from 'react'

import { CellIdString } from '../../../types/shared'
import {
  ComputedOutcome,
  ComputedSimpleAchievementStatus,
} from '../../../types'
import { ExpandedViewTab } from '../NavEnum'
import DescendantsAchievementStatus from '../../DescendantsAchievementStatus/DescendantsAchievementStatus'
import Comments from './TabContent/Comments/Comments.connector'
import EvDetails from './TabContent/EvDetails/EvDetails.connector'

import './EVMiddleColumn.scss'

export type EVMiddleColumnProps = {
  projectId: CellIdString
  activeTab: ExpandedViewTab
  setActiveTab: React.Dispatch<React.SetStateAction<ExpandedViewTab>>
  outcome: ComputedOutcome
}

const EVMiddleColumn: React.FC<EVMiddleColumnProps> = ({
  projectId,
  activeTab,
  setActiveTab,
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
        computedAchievedmentStatus={computedAchievementStatus}
      />
      <div className="expanded-view-inner-content">
        {activeTab === ExpandedViewTab.Details && (
          <EvDetails
            projectId={projectId}
            outcome={outcome}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === ExpandedViewTab.Comments && (
          <Comments projectId={projectId} />
        )}
      </div>
    </div>
  )
}

export default EVMiddleColumn
