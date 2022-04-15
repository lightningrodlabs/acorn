import React, { useState, useEffect } from 'react'
import './EVRightColumn.scss'

import ButtonToggleSwitch from '../../ButtonToggleSwitch/ButtonToggleSwitch'

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

  return (
    <div className='expanded-view-right-column'>
      {/* This outcome is
      <ButtonToggleSwitch
        size={}
      /> */}
    </div>
  )
}
