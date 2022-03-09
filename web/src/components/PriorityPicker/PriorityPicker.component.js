import React from 'react'
import './PriorityPicker.scss'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import { PriorityModeOptions } from '../../constants'
import PriorityPickerUniversal from './PriorityPickerUniversal/PriorityPickerUniversal'
import PriorityPickerVote from './PriorityPickerVote/PriorityPickerVote'

export default function PriorityPicker({
  projectId,
  goalAddress,
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
        ? <PriorityPickerUniversal projectId={projectId} goalAddress={goalAddress} />
        : <PriorityPickerVote projectId={projectId} goalAddress={goalAddress} />}
    </PickerTemplate>
  )
}
