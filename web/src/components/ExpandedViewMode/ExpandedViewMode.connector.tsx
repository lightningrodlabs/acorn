import React from 'react'
import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import ConnectedEVRightColumn from './EVRightColumn/EVRightColumn.connector'
import ConnectedEvComments from './EvMiddleColumn/TabContent/EvComments/EvComments.connector'
import ConnectedEvDetails from './EvMiddleColumn/TabContent/EvDetails/EvDetails.connector'
import ExpandedViewModeComponent, {
  ExpandedViewModeConnectorProps,
  ExpandedViewModeOwnProps,
} from './ExpandedViewMode.component'
import { AgentPubKeyB64, CellIdString, HeaderHashB64 } from '../../types/shared'
import {
  ComputedOutcome,
  Outcome,
  ScopeSmallVariant,
  SmallTask,
} from '../../types'
import EvChildren from './EVMiddleColumn/TabContent/EvChildren/EvChildren'
import EvTaskList from './EVMiddleColumn/TabContent/EvTaskList/EvTaskList'
import cleanOutcome from '../../api/cleanOutcome'
import moment from 'moment'

function mapStateToProps(
  state: RootState,
  ownProps: ExpandedViewModeOwnProps
): ExpandedViewModeConnectorProps {
  const { projectId } = ownProps
  const outcomeHeaderHash = state.ui.expandedView.outcomeHeaderHash
  const outcomeComments = state.projects.outcomeComments[projectId] || {}

  let comments = []
  if (outcomeHeaderHash) {
    comments = Object.values(outcomeComments).filter(
      (outcomeComment) =>
        outcomeComment.outcomeHeaderHash ===
        state.ui.expandedView.outcomeHeaderHash
    )
  }

  return {
    outcomeHeaderHash,
    commentCount: comments.length,
  }
}

const ExpandedViewMode = connect(mapStateToProps)(ExpandedViewModeComponent)

/*
  We do this in order to 'connect' in the other 
  redux connected sub-components
*/

export type ConnectedExpandedViewModeProps = {
  projectId: CellIdString
  openExpandedView: (headerHash: HeaderHashB64) => void
  activeAgentPubKey: AgentPubKeyB64
  outcome: ComputedOutcome | null
  outcomeAndAncestors: ComputedOutcome[]
  onClose: () => void
  updateOutcome: (outcome: Outcome, headerHash: string) => Promise<void>
}

const ConnectedExpandedViewMode: React.FC<ConnectedExpandedViewModeProps> = ({
  projectId,
  openExpandedView,
  activeAgentPubKey,
  outcome,
  outcomeAndAncestors,
  onClose,
  updateOutcome,
}) => {
  const updateOutcomeTaskList = (taskList: Array<SmallTask>) => {
    const cleanedOutcome = cleanOutcome(outcome)
    return updateOutcome(
      {
        ...cleanedOutcome,
        editorAgentPubKey: activeAgentPubKey,
        timestampUpdated: moment().unix(),
        scope: {
          Small: {
            ...(cleanedOutcome.scope as ScopeSmallVariant).Small,
            taskList,
          },
        },
      },
      outcome.headerHash
    )
  }

  const outcomeContent = outcome ? outcome.content : ''
  let childrenList: React.ReactElement
  let taskList: React.ReactElement
  if (outcome && outcome.children && outcome.children.length) {
    childrenList = (
      <EvChildren
        outcomeContent={outcomeContent}
        directChildren={outcome.children}
        openExpandedView={openExpandedView}
      />
    )
  } else if (outcome && 'Small' in outcome.scope) {
    const smallTasks = outcome.scope.Small.taskList
    taskList = (
      <EvTaskList
        outcomeContent={outcomeContent}
        tasks={smallTasks}
        onChange={async (index: number, task: string, complete: boolean) => {
          const newTaskList = smallTasks.map((listItem, liIndex) => {
            if (index === liIndex) {
              return { task, complete }
            } else {
              return listItem
            }
          })
          await updateOutcomeTaskList(newTaskList)
        }}
        onAdd={async (task: string) => {
          const newTaskList = [...smallTasks, { task, complete: false }]
          await updateOutcomeTaskList(newTaskList)
        }}
        onRemove={async (index: number) => {
          // clone the array
          const newTaskList = [...smallTasks]
          // remove the indicated one from the list
          newTaskList.splice(index, 1)
          await updateOutcomeTaskList(newTaskList)
        }}
      />
    )
  }

  // redux connected expanded view components
  const details = <ConnectedEvDetails projectId={projectId} outcome={outcome} />
  const comments = (
    <ConnectedEvComments
      projectId={projectId}
      outcomeContent={outcomeContent}
    />
  )
  const rightColumn = (
    <ConnectedEVRightColumn
      projectId={projectId}
      onClose={onClose}
      outcome={outcome}
    />
  )

  return (
    <ExpandedViewMode
      projectId={projectId}
      openExpandedView={openExpandedView}
      details={details}
      comments={comments}
      childrenList={childrenList}
      taskList={taskList}
      rightColumn={rightColumn}
      onClose={onClose}
      outcome={outcome}
      outcomeAndAncestors={outcomeAndAncestors}
    />
  )
}

export default ConnectedExpandedViewMode
