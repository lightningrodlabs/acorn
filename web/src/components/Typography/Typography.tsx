import React from 'react'

export type TypographyProps = {
  style: 'h3' | 'h4' | 'description'
  text: string
}

const Typography: React.FC<TypographyProps> = ({ style, text }) => {
  return <div className={`typography ${style}`}>{text}</div>
}

export default Typography
