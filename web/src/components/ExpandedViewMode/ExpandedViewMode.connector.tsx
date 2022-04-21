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
import { CellIdString } from '../../types/shared'
import { ComputedOutcome } from '../../types'
import EvChildren from './EVMiddleColumn/TabContent/EvChildren/EvChildren'
import EvTaskList from './EVMiddleColumn/TabContent/EvTaskList/EvTaskList'

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
  outcome: ComputedOutcome | null
  onClose: () => void
}

const ConnectedExpandedViewMode: React.FC<ConnectedExpandedViewModeProps> = ({
  projectId,
  outcome,
  onClose,
}) => {
  const outcomeContent = outcome ? outcome.content : ''
  const childrenList =
    outcome && outcome.children && outcome.children.length ? (
      <EvChildren
        outcomeContent={outcomeContent}
        directChildren={outcome.children}
      />
    ) : null
  // TODO: connect tasklist
  const taskList =
    outcome && outcome.children && outcome.children.length ? null : (
      <EvTaskList outcomeContent={outcomeContent} tasks={[]} />
    )
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
      details={details}
      comments={comments}
      childrenList={childrenList}
      taskList={taskList}
      rightColumn={rightColumn}
      onClose={onClose}
      outcome={outcome}
    />
  )
}

export default ConnectedExpandedViewMode
