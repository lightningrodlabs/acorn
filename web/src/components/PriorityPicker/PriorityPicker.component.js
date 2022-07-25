import React from 'react'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import { PriorityModeOptions } from '../../constants'
import PriorityPickerUniversal from './PriorityPickerUniversal/PriorityPickerUniversal.connector'
import PriorityPickerVote from './PriorityPickerVote/PriorityPickerVote.connector'
import './PriorityPicker.scss'

export default function PriorityPicker({
  projectId,
  outcomeActionHash,
  priorityMode,
  onClose,
}) {
  const isUniversal = priorityMode === PriorityModeOptions.Universal
  return (
    <PickerTemplate
      className={`priority-picker-wrapper ${isUniversal ? "universal-priority" : "vote-priority"}`}
      heading='Priority'
      onClose={onClose}>
      {isUniversal
        ? <PriorityPickerUniversal projectId={projectId} outcomeActionHash={outcomeActionHash} />
        : <PriorityPickerVote projectId={projectId} outcomeActionHash={outcomeActionHash} />}
    </PickerTemplate>
  )
}
