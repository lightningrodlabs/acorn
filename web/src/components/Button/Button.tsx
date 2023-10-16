import React from 'react'
import Icon from '../Icon/Icon'

import './Button.scss'

export type ButtonProps = {
  size?: 'small' | 'medium' | 'large'
  text: React.ReactNode
  onClick?: () => void
  icon?: string
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
  icon,
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
      {icon && (
        <span className="button-icon">
          <Icon name={icon} className="not-hoverable" />
        </span>
      )}
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
