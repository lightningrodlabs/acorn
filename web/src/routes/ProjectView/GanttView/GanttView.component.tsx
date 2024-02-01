import React, { useContext } from 'react'
import './GanttView.scss'

import { LayeringAlgorithm, Profile } from '../../../types'
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'
import { Tag } from '../../../types'
import {
  ActionHashB64,
  AgentPubKeyB64,
  WithActionHash,
} from '../../../types/shared'
import IndentedTreeView from '../../../components/IndentedTreeView/IndentedTreeView'
import GanttViewContent from './GanttViewContent'
// import OutcomeGanttWithFilters from '../../../components/OutcomeGanttWithFilters/OutcomeGanttWithFilters'

export type GanttViewConnectorStateProps = {
  whoAmI: Profile
  topPriorityOutcomes: ActionHashB64[]
  presentMembers: AgentPubKeyB64[]
  projectMemberProfiles: Profile[]
  projectTags: WithActionHash<Tag>[]
}

export type GanttViewConnectorDispatchProps = {
  openExpandedView: (actionHash: ActionHashB64) => void
  goToOutcome: (actionHash: ActionHashB64) => void
}

export type GanttViewProps = GanttViewConnectorStateProps &
  GanttViewConnectorDispatchProps

const GanttView: React.FC<GanttViewProps> = ({
  whoAmI,
  topPriorityOutcomes,
  presentMembers,
  projectMemberProfiles,
  projectTags,
  openExpandedView,
  goToOutcome,
}) => {
  const { computedOutcomesAsTree } = useContext(ComputedOutcomeContext)

  return (
    <div className="gantt-view">
      <GanttViewContent />
      {/* <OutcomeGanttWithFilters
        topPriorityOutcomes={topPriorityOutcomes}
        projectTags={projectTags}
        whoAmI={whoAmI}
        presentMembers={presentMembers}
        projectMemberProfiles={projectMemberProfiles}
        computedOutcomesAsTree={computedOutcomesAsTree}
        openExpandedView={openExpandedView}
        goToOutcome={goToOutcome}
      /> */}
    </div>
  )
}

export default GanttView
