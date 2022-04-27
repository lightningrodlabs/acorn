import React from 'react'
import Typography from '../Typography/Typography'
import './MetadataWithLabel.scss'

export type MetadataWithLabelProps = {
  label: string
  icon?: React.ReactElement
}

const MetadataWithLabel: React.FC<MetadataWithLabelProps> = ({
  icon,
  label,
  children,
}) => {
  return (
    <div className="metadata-with-label-wrapper">
      {icon ? icon : null}
      <div className="metadata-with-label-column">
        <div className="metadata-with-label-label">
          {/* TODO: set typography */}
          <Typography style="h6">{label}</Typography>
        </div>
        {children}
      </div>
    </div>
  )
}

export default MetadataWithLabel
