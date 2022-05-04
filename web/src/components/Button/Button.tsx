import React from 'react'
import PropTypes, { bool } from 'prop-types'
import './Button.scss'

// Button.propTypes = {
//   className: PropTypes.string,
//   size: PropTypes.string,
//   color: PropTypes.string,
//   stroke: PropTypes.bool,
//   onClick: PropTypes.func,
// }

export type ButtonProps = {
  size: 'small' | 'medium' | 'large'
  text: string
  onClick: () => void
  icon?: React.ReactElement
  className?: string
  color?: string
  stroke?: boolean
  secondary?: boolean
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({
  size = 'medium',
  className,
  text,
  color,
  stroke,
  onClick,
  secondary,
  disabled,
}) => {
  let classNames = 'button'
  if (className) classNames += ' ' + className
  classNames += ' ' + (size ? size : 'large')
  classNames += ' ' + (color ? color : '')
  classNames += ' ' + (stroke ? 'stroke' : '')
  classNames += ' ' + (secondary ? 'secondary' : '')
  classNames += ' ' + (disabled ? 'disabled' : '')

  return (
    <button disabled={disabled} className={classNames} onClick={onClick}>
      {text}
    </button>
  )
}

// const Button({ className, text, size, color, stroke, onClick })  => {
//   return (
//   let classNames = 'button'
//   if (className) classNames += ' ' + className
//   classNames += ' ' + (size ? size : 'large')
//   classNames += ' ' + (color ? color : 'purple')
//   classNames += ' ' + (stroke ? 'stroke' : '')

//   return (
//     <button className={classNames} onClick={onClick}>
//       {text}
//     </button>
//   )
// }

export default Button
