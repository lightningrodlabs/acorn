import React from 'react'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import PriorityPickerUniversal from './PriorityPickerUniversal/PriorityPickerUniversal.connector'
import './PriorityPicker.scss'

export default function PriorityPicker({
  projectId,
  outcomeActionHash,
  onClose,
}) {
  return (
    <PickerTemplate
      className={`priority-picker-wrapper universal-priority`}
      heading="Priority"
      onClose={onClose}
    >
      <PriorityPickerUniversal
        projectId={projectId}
        outcomeActionHash={outcomeActionHash}
      />
    </PickerTemplate>
  )
}
