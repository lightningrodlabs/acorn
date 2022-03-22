import React from 'react'
import PropTypes, { bool } from 'prop-types'
import './Button.scss'

function Button({ className, text, size, color, stroke, onClick }) {
  let classNames = 'button'
  if (className) classNames += ' ' + className
  classNames += ' ' + (size ? size : 'large')
  classNames += ' ' + (color ? color : 'purple')
  classNames += ' ' + (stroke ? 'stroke' : '')

  return (
    <button className={classNames} onClick={onClick}>
      {text}
    </button>
  )
}

Button.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  color: PropTypes.string,
  stroke: PropTypes.bool,
  onClick: PropTypes.func,
}

export default Button
