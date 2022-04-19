import React, { useState } from 'react'

import {
  AgentPubKeyB64,
  CellIdString,
  HeaderHashB64,
} from '../../../types/shared'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  EntryPoint,
} from '../../../types'
import ButtonToggleSwitch from '../../ButtonToggleSwitch/ButtonToggleSwitch'
import Icon from '../../Icon/Icon'
import ButtonAction from '../../ButtonAction/ButtonAction'
import ButtonCheckbox from '../../ButtonCheckbox/ButtonCheckbox'
import { pickColorForString } from '../../../styles'

import './EVRightColumn.scss'

export type EvRightColumnOwnProps = {
  projectId: CellIdString
  onClose: () => void
  outcome: ComputedOutcome
}

export type EvRightColumnConnectorStateProps = {
  activeAgentPubKey: AgentPubKeyB64
  outcomeHeaderHash: HeaderHashB64
  isEntryPoint: boolean
  entryPointHeaderHash: HeaderHashB64
}

export type EvRightColumnConnectorDispatchProps = {
  createEntryPoint: (entryPoint: EntryPoint) => Promise<void>
  deleteEntryPoint: (headerHash: HeaderHashB64) => Promise<void>
  onDeleteClick: (outcomeHeaderHash: HeaderHashB64) => Promise<void>
}

export type EvRightColumnProps = EvRightColumnOwnProps &
  EvRightColumnConnectorStateProps &
  EvRightColumnConnectorDispatchProps

const EVRightColumn: React.FC<EvRightColumnProps> = ({
  // ownProps
  onClose,
  outcome,
  // state props
  activeAgentPubKey,
  outcomeHeaderHash,
  entryPointHeaderHash,
  isEntryPoint,
  // dispatch props
  createEntryPoint,
  deleteEntryPoint,
  onDeleteClick,
}) => {
  const turnIntoEntryPoint = () => {
    createEntryPoint({
      color: pickColorForString(outcomeHeaderHash),
      creatorAgentPubKey: activeAgentPubKey,
      createdAt: Date.now(),
      outcomeHeaderHash: outcomeHeaderHash,
      isImported: false,
    })
  }
  const unmakeAsEntryPoint = () => {
    deleteEntryPoint(entryPointHeaderHash)
  }
  const entryPointClickAction = isEntryPoint
    ? unmakeAsEntryPoint
    : turnIntoEntryPoint

  const deleteAndClose = async () => {
    await onDeleteClick(outcomeHeaderHash)
    onClose()
  }

  // default while loading
  //TODO: convert to string with space
  let computedSimpleAchievedmentStatus = (outcome
    ? outcome.computedAchievementStatus
    : {
        smallsTotal: 0,
        smallsAchieved: 0,
        uncertains: 0,
        simple: ComputedSimpleAchievementStatus.NotAchieved,
      }
  ).simple

  let computedScopeBoolean = outcome
    ? outcome.computedScope === ComputedScope.Uncertain
    : false

  // const setInBreakdown = (inBreakdown: boolean) => {
  //   updateOutcome(
  //     {
  //       ...outcome,
  //       editorAgentPubKey: activeAgentPubKey,
  //       timestampUpdated: moment().unix(),
  //       // scope, update inBreakdown
  //     },
  //     outcomeHeaderHash
  //   )
  // }

  // Small or Uncertain toggle
  const state1 = {
    // @ts-ignore
    icon: <Icon name="x.svg" />,
    text: 'Small',
  }
  const state2 = {
    // @ts-ignore
    icon: <Icon name="x.svg" />,
    text: 'Uncertain',
  }

  return (
    <div className="expanded-view-right-column">
      This outcome is
      <ButtonAction
        size="medium"
        onClick={() => {}}
        // @ts-ignore
        icon={<Icon name="x.svg" />}
        text={computedSimpleAchievedmentStatus}
      />
      Scope
      <ButtonToggleSwitch
        size="medium"
        switchState={computedScopeBoolean}
        onSwitchState={() => {
          // TODO: trigger a switch in 'scope'
          // for this outcome
        }}
        state1={state1}
        state2={state2}
      />
      Mark as
      <ButtonCheckbox
        size="medium"
        isChecked={false}
        onChange={() => {}}
        // @ts-ignore
        icon={<Icon name="x.svg" />}
        text="In Breakdown"
      />
      <ButtonCheckbox
        size="medium"
        isChecked={false}
        onChange={() => {}}
        // @ts-ignore
        icon={<Icon name="x.svg" />}
        text="High Priority"
      />
      <ButtonCheckbox
        size="medium"
        isChecked={isEntryPoint}
        onChange={() => {
          entryPointClickAction()
        }}
        // @ts-ignore
        icon={<Icon name="x.svg" />}
        text="Entry Point"
      />
      Actions
      <ButtonAction
        size="medium"
        onClick={() => {}}
        // @ts-ignore
        icon={<Icon name="x.svg" />}
        text="Share"
      />
      <ButtonAction
        size="medium"
        onClick={() => deleteAndClose()}
        // @ts-ignore
        icon={<Icon name="x.svg" />}
        text="Archive"
      />
    </div>
  )
}

export default EVRightColumn
