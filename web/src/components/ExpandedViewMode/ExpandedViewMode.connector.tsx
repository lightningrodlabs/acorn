import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import ConnectedEVRightColumn from './EVRightColumn/EVRightColumn.connector'
import ConnectedEvComments from './EVMiddleColumn/TabContent/EvComments/EvComments.connector'
import ConnectedEvDetails from './EVMiddleColumn/TabContent/EvDetails/EvDetails.connector'
import ExpandedViewModeComponent, {
  ExpandedViewModeConnectorProps,
  ExpandedViewModeOwnProps,
} from './ExpandedViewMode.component'
import { AgentPubKeyB64, CellIdString, ActionHashB64 } from '../../types/shared'
import {
  ComputedOutcome,
  CreateOutcomeWithConnectionInput,
  RelationInput,
  Outcome,
  SmallScope,
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
  const outcomeActionHash = state.ui.expandedView.outcomeActionHash
  const outcomeComments = state.projects.outcomeComments[projectId] || {}

  let comments = []
  if (outcomeActionHash) {
    comments = Object.values(outcomeComments).filter(
      (outcomeComment) =>
        outcomeComment.outcomeActionHash ===
        state.ui.expandedView.outcomeActionHash
    )
  }

  return {
    outcomeActionHash,
    commentCount: comments.length,
    activeAgentPubKey: state.agentAddress,
  }
}

const ExpandedViewMode = connect(mapStateToProps)(ExpandedViewModeComponent)

/*
  We do this in order to 'connect' in the other 
  redux connected sub-components
*/

export type ConnectedExpandedViewModeProps = {
  projectId: CellIdString
  openExpandedView: (actionHash: ActionHashB64) => void
  activeAgentPubKey: AgentPubKeyB64
  outcome: ComputedOutcome | null
  outcomeAndAncestors: ComputedOutcome[]
  onClose: () => void
  updateOutcome: (outcome: Outcome, actionHash: string) => Promise<void>
  createOutcomeWithConnection: (
    outcomeWithConnection: CreateOutcomeWithConnectionInput
  ) => Promise<void>
}

const ConnectedExpandedViewMode: React.FC<ConnectedExpandedViewModeProps> = ({
  projectId,
  openExpandedView,
  activeAgentPubKey,
  outcome,
  outcomeAndAncestors,
  onClose,
  updateOutcome,
  createOutcomeWithConnection,
}) => {
  // the live editor state
  const [content, setContent] = useState('')
  // the live github link editor state
  const [githubInputLinkText, setGithubInputLinkText] = useState('')
  // the live editor state
  const [description, setDescription] = useState('')

  // close Expanded view after hitting Esc key:
  useEffect(() => {
    const onKeyDown = async (event) => {
      // if we are on Map View
      // we should let Map View handle the Escape key
      if (event.key === 'Escape') {
        const updateTo = localCleanOutcome()
        await updateOutcome(updateTo, outcome.actionHash)

        onClose()
      }
    }
    document.body.addEventListener('keyup', onKeyDown)
    // for teardown, unbind event listeners
    return () => {
      document.body.removeEventListener('keyup', onKeyDown)
    }
  }, [outcome, content, description, githubInputLinkText, activeAgentPubKey])

  const localCleanOutcome = (): Outcome => {
    return {
      ...outcome,
      editorAgentPubKey: activeAgentPubKey,
      timestampUpdated: moment().unix(),
      content,
      description,
      githubLink: githubInputLinkText,
    }
  }
  const updateOutcomeWithLatest = async () => {
    await updateOutcome(localCleanOutcome(), outcome.actionHash)
  }

  const updateOutcomeTaskList = (taskList: Array<SmallTask>) => {
    const cleanedOutcome = cleanOutcome(outcome)
    return updateOutcome(
      {
        ...cleanedOutcome,
        editorAgentPubKey: activeAgentPubKey,
        timestampUpdated: moment().unix(),
        scope: {
          Small: {
            ...(cleanedOutcome.scope as SmallScope).Small,
            taskList,
          },
        },
      },
      outcome.actionHash
    )
  }

  const onCreateChildOutcome = async (newOutcomeStatement: string) => {
    await createOutcomeWithConnection({
      entry: {
        content: newOutcomeStatement,
        creatorAgentPubKey: activeAgentPubKey,
        editorAgentPubKey: null,
        timestampCreated: moment().unix(),
        timestampUpdated: null,
        scope: {
          Uncertain: { timeFrame: null, smallsEstimate: 0, inBreakdown: false },
        },
        tags: [],
        description: '',
        isImported: false,
        githubLink: '',
      },
      // link this new Outcome to its parent, which
      // is the current Expanded View Mode outcome
      maybeLinkedOutcome: {
        outcomeActionHash: outcome.actionHash,
        relation: RelationInput.ExistingOutcomeAsParent,
        siblingOrder: 0,
      },
    })
  }

  const outcomeContent = outcome ? outcome.content : ''
  let childrenList: React.ReactElement
  let taskList: React.ReactElement
  if (outcome && !('Small' in outcome.scope)) {
    childrenList = (
      <EvChildren
        outcomeContent={outcomeContent}
        directChildren={outcome.children}
        openExpandedView={openExpandedView}
        onCreateChildOutcome={onCreateChildOutcome}
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
  const details = (
    <ConnectedEvDetails
      projectId={projectId}
      outcome={outcome}
      {...{
        cleanOutcome: localCleanOutcome,
        updateOutcomeWithLatest,
        updateOutcome,
        content,
        setContent,
        description,
        setDescription,
        githubInputLinkText,
        setGithubInputLinkText,
      }}
    />
  )
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
      updateOutcome={updateOutcome}
    />
  )
}

export default ConnectedExpandedViewMode
