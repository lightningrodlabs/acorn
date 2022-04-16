import React, { useState, useEffect } from 'react'
import './EVRightColumn.scss'

import ButtonToggleSwitch from '../../ButtonToggleSwitch/ButtonToggleSwitch'
import Icon from '../../Icon/Icon'
import ButtonAction from '../../ButtonAction/ButtonAction'
import ButtonCheckbox from '../../ButtonCheckbox/ButtonCheckbox'

export default function EVRightColumn({
  projectId,
  agentAddress,
  outcomeHeaderHash,
  outcome,
  updateOutcome,
}) {

  // const setInBreakdown = (inBreakdown: boolean) => {
  //   updateOutcome(
  //     {
  //       ...outcome,
  //       editorAgentPubKey: agentAddress,
  //       timestampUpdated: moment().unix(),
  //       // scope, update inBreakdown
  //     },
  //     outcomeHeaderHash
  //   )
  // }
  const state1 = { icon: <Icon name="x.svg" />, text: "Small" }
  const state2 = { icon: <Icon name="x.svg" />, text: "Uncertain" }

  let [scope, setScope] = useState(true)
  return (
    <div className='expanded-view-right-column'>
      This outcome is
      <ButtonAction
        size="medium"
        onClick={() => {}}
        icon={<Icon name="x.svg" />}
        text={outcome.computedAchievementStatus.simple} //TODO: convert to string with space
      />
      Scope
      <ButtonToggleSwitch
        size="medium"
        switchState={scope}
        onSwitchState={() => {setScope(!scope)}}
        state1={state1}
        state2={state2}
      />
      Mark as
      <ButtonCheckbox
        size="medium"
        isChecked={false}
        onChange={() => {}}
        icon={<Icon name="x.svg"/>}
        text='In Breakdown'
      />
      <ButtonCheckbox
        size="medium"
        isChecked={false}
        onChange={() => {}}
        icon={<Icon name="x.svg"/>}
        text='High Priority'
      />
      <ButtonCheckbox
        size="medium"
        isChecked={false}
        onChange={() => {}}
        icon={<Icon name="x.svg"/>}
        text='Entry Point'
      />
      Actions
      <ButtonAction
        size="medium"
        onClick={() => {}}
        icon={<Icon name="x.svg" />}
        text='Share'
      />
      <ButtonAction
        size="medium"
        onClick={() => {}}
        icon={<Icon name="x.svg" />}
        text='Archive'
      />

    </div>
  )
}
