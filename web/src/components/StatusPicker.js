import React from 'react'
import PropTypes from 'prop-types'

import StatusIcon from './StatusIcon/StatusIcon'
import PickerTemplate from './PickerTemplate/PickerTemplate'

function StatusPicker({ selectedStatus, statusClicked, onClose }) {
  const statuses = [
    'Uncertain',
    'Incomplete',
    'InProcess',
    'InReview',
    'Complete',
  ]

  return (
    <PickerTemplate
      className='status_picker'
      heading='status'
      onClose={onClose}>
      <div className='status_list'>
        {statuses.map((status, index) => (
          <StatusIcon
            key={index}
            size='small'
            status={status}
            selected={selectedStatus === status}
            onClick={statusClicked}
          />
        ))}
      </div>
    </PickerTemplate>
  )
}

StatusPicker.propTypes = {
  selectedStatus: PropTypes.string.isRequired,
  statusClicked: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default StatusPicker
