import React from 'react'
import './PriorityPicker.scss'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import { PriorityModeOptions } from '../../constants'
import PriorityPickerUniversal from './PriorityPickerUniversal/PriorityPickerUniversal.connector'
import PriorityPickerVote from './PriorityPickerVote/PriorityPickerVote.connector'

export default function PriorityPicker({
  projectId,
  outcomeAddress,
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
        ? <PriorityPickerUniversal projectId={projectId} outcomeAddress={outcomeAddress} />
        : <PriorityPickerVote projectId={projectId} outcomeAddress={outcomeAddress} />}
    </PickerTemplate>
  )
}