import React, { useState, useEffect, useContext } from 'react'
import { CSSTransition } from 'react-transition-group'
import './ExpandedViewMode.scss'
import { pickColorForString } from '../../styles'
import Icon from '../Icon/Icon'
import EVMiddleColumn from './EVMiddleColumn/EVMiddleColumn'
import EVLeftColumn from './EVLeftColumn/EVLeftColumn'
import EVRightColumn from './EVRightColumn/EVRightColumn'
import { ExpandedViewTab } from './NavEnum'
import ComputedOutcomeContext from '../../context/ComputedOutcomeContext'
import {
  AssigneeWithHeaderHash,
  ComputedOutcome,
  ComputedSimpleAchievementStatus,
  OutcomeComment,
} from '../../types'
import { WithHeaderHash } from '../../types/shared'

// TODO: fix these types
export type ExpandedViewModeProps = {
  projectId: any
  agentAddress: any
  outcomeHeaderHash: any
  updateOutcome: any
  assignees: AssigneeWithHeaderHash[]
  profiles: any
  isEntryPoint: any
  comments: WithHeaderHash<OutcomeComment>[]
  entryPointAddress: any
  onClose: any
  deleteOutcomeMember: any
  createEntryPoint: any
  deleteEntryPoint: any
  onDeleteClick: any
  startTitleEdit: any
  endTitleEdit: any
  startDescriptionEdit: any
  endDescriptionEdit: any
  editingPeers: any
}

const ExpandedViewMode: React.FC<ExpandedViewModeProps> = ({
  projectId,
  agentAddress,
  outcomeHeaderHash,
  updateOutcome,
  onClose,
  assignees,
  profiles,
  comments,
  deleteOutcomeMember,
  createEntryPoint,
  deleteEntryPoint,
  isEntryPoint,
  entryPointAddress,
  onDeleteClick,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
}) => {
  const { computedOutcomesKeyed } = useContext(ComputedOutcomeContext)
  const outcome = computedOutcomesKeyed[outcomeHeaderHash]

  let creator
  if (outcome) {
    Object.keys(profiles).forEach((value) => {
      if (profiles[value].agentPubKey === outcome.creatorAgentPubKey)
        creator = profiles[value]
    })
  }

  const [activeTab, setActiveTab] = useState(ExpandedViewTab.Details)
  const [outcomeState, setOutcomeState] = useState<ComputedOutcome>()
  const [assigneesState, setAssigneesState] = useState<
    AssigneeWithHeaderHash[]
  >()
  const [creatorState, setCreatorState] = useState()
  const [showing, setShowing] = useState(false)
  const [editTimeframe, setEditTimeframe] = useState(false)

  useEffect(() => {
    if (showing && !outcomeHeaderHash) {
      setShowing(false)
    } else if (!showing && outcomeHeaderHash) {
      setShowing(true)
    }
  }, [outcomeHeaderHash])

  useEffect(() => {
    if (outcome) {
      setOutcomeState({ ...outcome })
    }
  }, [outcome])

  useEffect(() => {
    if (assignees) {
      setAssigneesState([...assignees])
    }
  }, [assignees])

  useEffect(() => {
    if (creator) {
      setCreatorState({ ...creator })
    }
  }, [creator])

  const turnIntoEntryPoint = () => {
    createEntryPoint({
      color: pickColorForString(outcomeHeaderHash),
      creatorAgentPubKey: agentAddress,
      createdAt: Date.now(),
      outcomeHeaderHash: outcomeHeaderHash,
      isImported: false,
    })
  }
  const unmakeAsEntryPoint = () => {
    deleteEntryPoint(entryPointAddress)
  }
  const entryPointClickAction = isEntryPoint
    ? unmakeAsEntryPoint
    : turnIntoEntryPoint

  const deleteAndClose = async () => {
    await onDeleteClick(outcomeHeaderHash)
    onClose()
  }

  // const updateTimeframe = (start, end) => {
  //   let timeframe = null

  //   if (start && end) {
  //     timeframe = {
  //       fromDate: start,
  //       toDate: end,
  //     }
  //   }

  //   updateOutcome(
  //     {
  //       ...outcome,
  //       editorAgentPubKey: agentAddress,
  //       timestampUpdated: moment().unix(),
  //       timeFrame: timeframe,
  //     },
  //     outcomeHeaderHash
  //   )
  // }

  // default while loading
  let computedAchievedmentStatus = {
    smallsTotal: 0,
    smallsAchieved: 0,
    uncertains: 0,
    simple: ComputedSimpleAchievementStatus.NotAchieved,
  }
  if (outcome) {
    computedAchievedmentStatus = outcome.computedAchievementStatus
  }

  return (
    <>
      <CSSTransition
        in={showing}
        timeout={100}
        unmountOnExit
        classNames="expanded-view-overlay"
      >
        <div className="expanded-view-overlay" />
      </CSSTransition>
      {outcomeState && (
        <CSSTransition
          in={showing}
          timeout={100}
          unmountOnExit
          classNames="expanded-view-wrapper"
        >
          <div className="expanded-view-wrapper">
            <Icon
              onClick={onClose}
              name="x.svg"
              size="small-close"
              className="light-grey"
            />
            <EVLeftColumn
              activeTab={activeTab}
              onChange={(newTab) => setActiveTab(newTab)}
              commentCount={comments.length}
            />
            <EVMiddleColumn
              agentAddress={agentAddress}
              projectId={projectId}
              editTimeframe={editTimeframe}
              setEditTimeframe={setEditTimeframe}
              assignees={assigneesState}
              comments={comments}
              outcomeHeaderHash={outcomeHeaderHash}
              updateOutcome={updateOutcome}
              outcome={outcomeState}
              outcomeContent={outcomeState.content}
              outcomeDescription={outcomeState.description}
              deleteOutcomeMember={deleteOutcomeMember}
              startTitleEdit={startTitleEdit}
              endTitleEdit={endTitleEdit}
              startDescriptionEdit={startDescriptionEdit}
              endDescriptionEdit={endDescriptionEdit}
              editingPeers={editingPeers}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              computedAchievedmentStatus={computedAchievedmentStatus}
            />
            <EVRightColumn
              projectId={projectId}
              agentAddress={agentAddress}
              outcomeHeaderHash={outcomeHeaderHash}
              outcome={outcomeState}
              updateOutcome={updateOutcome}
              isEntryPoint={isEntryPoint}
              entryPointClickAction={entryPointClickAction}
              deleteAndClose={deleteAndClose}
            />
          </div>
        </CSSTransition>
      )}
    </>
  )
}

export default ExpandedViewMode
