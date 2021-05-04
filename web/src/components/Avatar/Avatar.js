import React from 'react'
import PropTypes from 'prop-types'
import './Avatar.css'
import { pickColorForString } from '../../styles'

function Avatar({
  first_name,
  last_name,
  avatar_url,
  highlighted,
  small,
  medium,
  mediumLarge,
  large,
  clickable,
  onClick,
  imported,
}) {
  let classes = []
  if (highlighted) classes.push('highlighted')
  if (small) classes.push('small')
  else if (medium) classes.push('medium')
  else if (mediumLarge) classes.push('medium-large')
  else if (large) classes.push('large')
  if (clickable) classes.push('clickable')
  if (imported) classes.push('imported')

  if (!avatar_url) {
    const backgroundInitialsAvatar = pickColorForString(first_name)

    //const backgroundInitialsAvatar = initialsAvatarcolors[0]
    const style = {
      backgroundColor: backgroundInitialsAvatar,
    }
    classes.push('initials-avatar')
    return (
      <div className={classes.join(' ')} onClick={onClick} style={style}>
        {first_name[0].toUpperCase()}
        {last_name[0].toUpperCase()}
      </div>
    )
  }

  classes.push('avatar')
  return (
    <img src={avatar_url} className={classes.join(' ')} onClick={onClick} />
  )
}

Avatar.propTypes = {
  avatar_url: PropTypes.string.isRequired,
  highlighted: PropTypes.bool,
  small: PropTypes.bool,
  medium: PropTypes.bool,
  large: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
}

export default Avatar
