import React from 'react'
import './ButtonWithPendingState.scss'

import Icon from '../Icon/Icon'

export default function ButtonWithPendingState({
  pending,
  pendingText,
  actionText,
}) {
  return pending ? (
    <span className='pending-acorn'>
      <Icon
        name='acorn-logo-stroked.svg'
        className='white not-hoverable very-small'
      />
      <span>{pendingText}</span>
    </span>
  ) : (
    actionText
  )
}
