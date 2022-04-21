import React from 'react'
import './Tag.scss'

export type TagProps = {
  text: string
  backgroundColor: string
}

const Tag: React.FC<TagProps> = ({ text, backgroundColor }) => {
  return (
    <div className="tag-wrapper" style={{ backgroundColor: backgroundColor }}>
      {text}
    </div>
  )
}

export default Tag
