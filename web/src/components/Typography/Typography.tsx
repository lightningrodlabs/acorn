import React from 'react'

import './Typography.scss'

export type TypographyProps = {
  style:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'h7'
    | 'h8'
    | 'subtitle1'
    | 'subtitle2'
    | 'description'
    | 'body1'
    | 'body2'
    | 'caption1'
    | 'caption2'
    | 'button-text'
  text: string
}

const Typography: React.FC<TypographyProps> = ({ style, text }) => {
  return <div className={`typography ${style}`}>{text}</div>
}

export default Typography
