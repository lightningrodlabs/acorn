import React, { useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
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
import EvAttachments from './EVMiddleColumn/TabContent/EvAttachments/EvAttachments'
import cleanOutcome from '../../api/cleanOutcome'
import moment from 'moment'
import useAppWebsocket from '../../hooks/useAppWebsocket'
import { useAttachments } from '../../hooks/useAttachments' // Import ProjectAssetMeta
import { getWeaveClient } from '../../hcWebsockets'
import { WAL } from '@theweave/api'
import { decodeHashFromBase64, EntryHash } from '@holochain/client' // Import EntryHash
import { CellIdWrapper } from '../../domain/cellId'
import { useDispatch } from 'react-redux' // Import useDispatch
import { openExpandedView as openExpandedViewAction } from '../../redux/ephemeral/expanded-view/actions' // Import action
import { setActiveProject } from '../../redux/ephemeral/active-project/actions'

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
  // Props for root rendering in asset view
  initialProjectId?: CellIdString
  initialOutcomeActionHash?: ActionHashB64
  renderAsModal?: boolean // Added prop
  // appWebsocket prop is passed by createStoreAndRenderToDom
  appWebsocket?: any
}

const ConnectedExpandedViewMode: React.FC<ConnectedExpandedViewModeProps> = ({
  // Use projectId from props if available (passed by App), otherwise rely on Redux state set by initial props
  projectId: projectIdFromApp,
  openExpandedView,
  activeAgentPubKey,
  outcome,
  outcomeAndAncestors,
  onClose,
  updateOutcome,
  createOutcomeWithConnection,
  // Destructure initial props
  initialProjectId,
  initialOutcomeActionHash,
  renderAsModal, // Added prop
}) => {
  const dispatch = useDispatch()
  const projectIdFromState = useSelector(
    (state: RootState) => state.ui.activeProject
  )
  // Determine the definitive projectId
  const projectId = projectIdFromApp || projectIdFromState || initialProjectId

  // Set initial state if rendered as root in asset view
  useEffect(() => {
    if (initialProjectId && initialOutcomeActionHash) {
      dispatch(setActiveProject(initialProjectId))
      dispatch(openExpandedViewAction(initialOutcomeActionHash))
    }
    // Run only once on mount when initial props are provided
  }, [initialProjectId, initialOutcomeActionHash, dispatch, projectId])

  const { attachmentsInfo } = useAttachments({
    projectId: projectId, // Use the determined projectId
    outcome: outcome,
    useFallback: !outcome || !projectId // if this is true it will return an empty default value
  });

  // Function to add attachments
  const addAttachment = async () => {
    if (outcome) {
      const weaveClient = getWeaveClient()
      const cellIdWrapper = CellIdWrapper.fromCellIdString(projectId)
      const thisWal: WAL = {
        hrl: [
          cellIdWrapper.getDnaHash(),
          decodeHashFromBase64(outcome.actionHash),
        ],
        context: 'outcome',
      }

      const wal = await weaveClient.assets.userSelectAsset()
      if (wal) {
        await weaveClient.assets.addAssetRelation(thisWal, wal)
      }
    }
  }
  // the live editor state
  const [content, setContent] = useState('')
  // the live github link editor state
  const [githubInputLinkText, setGithubInputLinkText] = useState('')
  // the live editor state
  const [description, setDescription] = useState('')
  const appWebsocket = useAppWebsocket() // This might be redundant if appWebsocket prop is passed

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
    if (outcome) {
      document.body.addEventListener('keyup', onKeyDown)
    }
    // for teardown, unbind event listeners
    return () => {
      if (outcome) {
        document.body.removeEventListener('keyup', onKeyDown)
      }
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
  let attachments: React.ReactElement
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
  // Function to remove attachments (needed by EvAttachments)
  const removeAttachment = async (relationHash: EntryHash) => {
    const weaveClient = getWeaveClient()
    if (!weaveClient) return
    console.log(
      'Removing project attachment from EVM with relation hash:',
      relationHash
    )
    await weaveClient.assets.removeAssetRelation(relationHash)
  }

  // Function to open asset (needed by EvAttachments)
  const openAsset = async (wal: WAL) => {
    const weaveClient = getWeaveClient()
    if (weaveClient) {
      await weaveClient.openAsset(wal)
    }
  }

  attachments = outcome ? (
    <EvAttachments
      outcome={outcome}
      projectId={projectId}
      attachmentsInfo={attachmentsInfo}
      addAttachment={addAttachment}
    />
  ) : null

  const rightColumn = outcome ? ( // Only render if outcome exists
    <ConnectedEVRightColumn
      projectId={projectId}
      onClose={onClose}
      outcome={outcome}
    />
  ) : null
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
        rightColumn,
      }}
    />
  )
  const comments = (
    <ConnectedEvComments
      projectId={projectId}
      outcomeContent={outcomeContent}
      appWebsocket={appWebsocket}
    />
  )

  // Ensure all necessary props are passed to the component,
  // which will then distribute them to the wrapper or inner component.
  return (
    <ExpandedViewMode
      // Props needed by Inner component (passed through)
      projectId={projectId}
      outcome={outcome}
      // outcomeActionHash is derived from redux state within ExpandedViewModeComponent
      // activeTab/setActiveTab are managed by state within ExpandedViewModeComponent
      // commentCount is derived from redux state within ExpandedViewModeComponent
      details={details} // React Element
      comments={comments} // React Element
      childrenList={childrenList} // React Element
      taskList={taskList} // React Element
      rightColumn={rightColumn} // React Element
      attachments={attachments} // React Element
      // Props needed by Modal Wrapper (passed through)
      onClose={onClose}
      outcomeAndAncestors={outcomeAndAncestors}
      openExpandedView={openExpandedView}
      // showing state is managed within ExpandedViewModeComponent

      // Prop to control rendering mode
      renderAsModal={renderAsModal}
      // Other props (may not be directly used by component but needed by connector logic/passed down)
      updateOutcome={updateOutcome} // Passed down
    />
  )
}

export default ConnectedExpandedViewMode
