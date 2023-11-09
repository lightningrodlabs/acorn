import React from 'react'
import './Avatar.scss'
import { pickColorForString } from '../../styles'
import { StatusCssColorClass } from '../Header/Status'
import Tooltip from '../Tooltip/Tooltip'

interface AvatarProps {
  size: 'small' | 'small-medium' | 'medium' | 'medium-large' | 'large'
  firstName?: string
  lastName?: string
  avatarUrl: string
  highlighted?: boolean
  disconnected?: boolean
  clickable?: boolean
  onClick?: () => void
  imported?: boolean
  withStatus?: boolean
  withWhiteBorder?: boolean
  withStatusBorder?: boolean
  selfAssignedStatus?: string
  withTooltip?: boolean
}

function Avatar({
  firstName,
  lastName,
  avatarUrl,
  highlighted,
  disconnected,
  size = 'medium',
  clickable,
  onClick,
  imported,
  withStatus,
  withWhiteBorder,
  withStatusBorder,
  selfAssignedStatus,
  withTooltip,
}: AvatarProps) {
  // If it is imported avatar of a ghost member
  // don't show status circle
  if (imported) withStatus = false

  let classes = []
  // Avatar optional properties
  if (highlighted) classes.push('highlighted')
  if (clickable) classes.push('clickable')
  if (imported) classes.push('imported')
  if (withStatus) classes.push('with-status')
  if (withTooltip) classes.push('with-tooltip')
  if (disconnected) classes.push('disconnected')

  // avatar with no image, showing initials
  if (!avatarUrl) {
    const backgroundInitialsAvatar = pickColorForString(firstName)

    //const backgroundInitialsAvatar = initialsAvatarcolors[0]
    const style = {
      backgroundColor: backgroundInitialsAvatar,
    }
    classes.push('initials-avatar')
    return (
      <div
        className={`avatar-wrapper 
        ${imported ? 'imported' : ''} 
        ${withWhiteBorder ? 'with-border white' : ''} 
        ${
          withStatusBorder
            ? `with-border status-color ${StatusCssColorClass[selfAssignedStatus]}`
            : ''
        } 
        ${
          size === 'small'
            ? 'small'
            : size === 'small-medium'
            ? 'small-medium'
            : size === 'medium'
            ? 'medium'
            : size === 'medium-large'
            ? 'medium-large'
            : size === 'large'
            ? 'large'
            : ''
        }`}
      >
        <div className={classes.join(' ')} onClick={onClick} style={style}>
          {firstName[0].toUpperCase()}
          {lastName[0].toUpperCase()}
        </div>
        {/* TODO: Current status circle color under avatar*/}
        {withStatus && (
          <div className="status-circle-wrapper">
            <div
              className={`status-circle ${StatusCssColorClass[selfAssignedStatus]}`}
            ></div>
          </div>
        )}
        {withTooltip && (
          <Tooltip
            text={`${firstName} ${lastName} ${
              imported ? '[ghost member]' : ''
            }`}
          />
        )}
      </div>
    )
  }

  // avatar with image
  classes.push('avatar')
  return (
    <div
      className={`avatar-wrapper 
      ${imported ? 'imported' : ''} 
      ${withWhiteBorder ? 'with-border white' : ''} 
      ${
        withStatusBorder
          ? `with-border status-color ${StatusCssColorClass[selfAssignedStatus]}`
          : ''
      }
      ${
        size === 'small'
          ? 'small'
          : size === 'small-medium'
          ? 'small-medium'
          : size === 'medium'
          ? 'medium'
          : size === 'medium-large'
          ? 'medium-large'
          : size === 'large'
          ? 'large'
          : ''
      }`}
    >
      <img src={avatarUrl} className={classes.join(' ')} onClick={onClick} />
      {/* TODO: Current status circle color under avatar*/}
      {withStatus && (
        <div className="status-circle-wrapper">
          <div
            className={`status-circle ${StatusCssColorClass[selfAssignedStatus]}`}
          ></div>
        </div>
      )}
      {withTooltip && (
        <Tooltip
          text={`${firstName} ${lastName} ${imported ? '[ghost member]' : ''}`}
        />
      )}
    </div>
  )
}

export default Avatar
