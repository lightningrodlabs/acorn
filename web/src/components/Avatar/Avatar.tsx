import React from 'react'
import './Avatar.scss'
import { pickColorForString } from '../../styles'
import { StatusCssColorClass, Status } from '../Header/Status'
import Tooltip from '../Tooltip/Tooltip'

interface AvatarProps {
  firstName: string
  lastName: string
  avatarUrl: string
  highlighted?: boolean
  small?: boolean
  smallMedium?: boolean
  medium?: boolean
  mediumLarge?: boolean
  large?: boolean
  clickable?: boolean
  onClick?: () => void
  imported: boolean
  withStatus?: boolean
  withWhiteBorder?: boolean
  withStatusBorder?: boolean
  selfAssignedStatus?: string
  withTooltip?: boolean
  tooltipText?: string
}

function Avatar({
  firstName,
  lastName,
  avatarUrl,
  highlighted,
  small,
  smallMedium,
  medium,
  mediumLarge,
  large,
  clickable,
  onClick,
  imported,
  withStatus,
  withWhiteBorder,
  withStatusBorder,
  selfAssignedStatus,
  withTooltip,
  tooltipText,
}: AvatarProps) {
  let classes = []
  if (highlighted) classes.push('highlighted')
  // Avatar Size Options
  if (small) classes.push('small')
  else if (smallMedium) classes.push('small-medium')
  else if (medium) classes.push('medium')
  else if (mediumLarge) classes.push('medium-large')
  else if (large) classes.push('large')
  // Avatar other optional properties
  if (clickable) classes.push('clickable')
  if (imported) classes.push('imported')
  if (withStatus) classes.push('with-status')
  // if (withTooltip) classes.push('with-tooltip')

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
        ${withWhiteBorder ? 'with-border white' : ''} 
        ${withStatusBorder ? `with-border status-color ${StatusCssColorClass[selfAssignedStatus]}` : ''} 
        ${medium ? 'medium' : ''}
        ${smallMedium ? 'small-medium' : ''}`}
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
        {withTooltip && <Tooltip text={`${firstName} ${lastName}`} />}
      </div>
    )
  }

  classes.push('avatar')
  return (
    <div
      className={`avatar-wrapper 
      ${withWhiteBorder ? 'with-border white' : ''} 
      ${withStatusBorder ? `with-border status-color ${StatusCssColorClass[selfAssignedStatus]}` : ''}
      ${medium ? 'medium' : ''}
      ${smallMedium ? 'small-medium' : ''}`}
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
      {withTooltip && <Tooltip text={tooltipText} />}
    </div>
  )
}

export default Avatar
