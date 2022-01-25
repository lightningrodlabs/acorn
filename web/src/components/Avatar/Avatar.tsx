import React from 'react'
import './Avatar.css'
import { pickColorForString } from '../../styles'

interface AvatarProps {
  first_name: string
  last_name: string
  avatar_url: string
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
}

function Avatar({
  first_name,
  last_name,
  avatar_url,
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
}: AvatarProps) {
  let classes = []
  if (highlighted) classes.push('highlighted')
  if (small) classes.push('small')
  else if (smallMedium) classes.push('small-medium')
  else if (medium) classes.push('medium')
  else if (mediumLarge) classes.push('medium-large')
  else if (large) classes.push('large')
  if (clickable) classes.push('clickable')
  if (imported) classes.push('imported')
  if (withStatus) classes.push('with-status')

  if (!avatar_url) {
    const backgroundInitialsAvatar = pickColorForString(first_name)

    //const backgroundInitialsAvatar = initialsAvatarcolors[0]
    const style = {
      backgroundColor: backgroundInitialsAvatar,
    }
    classes.push('initials-avatar')
    return (
      <div
        className={`avatar-wrapper ${
          withWhiteBorder ? 'with-white-border' : ''
        }`}
      >
        <div className={classes.join(' ')} onClick={onClick} style={style}>
          {first_name[0].toUpperCase()}
          {last_name[0].toUpperCase()}
        </div>
        {/* TODO: Current status circle color under avatar*/}
        {withStatus && (
          <div className="status-circle-wrapper">
            <div className={`status-circle status-online`}></div>
          </div>
        )}
      </div>
    )
  }

  classes.push('avatar')
  return (
    <div
      className={`avatar-wrapper ${withWhiteBorder ? 'with-white-border' : ''}`}
    >
      <img src={avatar_url} className={classes.join(' ')} onClick={onClick} />
      {/* TODO: Current status circle color under avatar*/}
      {withStatus && (
          <div className="status-circle-wrapper">
            <div className={`status-circle status-online`}></div>
          </div>
        )}
    </div>
  )
}

export default Avatar
