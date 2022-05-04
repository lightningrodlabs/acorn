import React from 'react'
import Icon from '../Icon/Icon'
import Typography from '../Typography/Typography'
import './MetadataWithLabel.scss'

export type MetadataWithLabelProps = {
  label: string
  iconName?: string
}

const MetadataWithLabel: React.FC<MetadataWithLabelProps> = ({
  iconName,
  label,
  children,
}) => {
  return (
    <div className="metadata-with-label-wrapper">
      {/* Optional icon for the label */}
      {iconName && (
        <div className="metadata-with-label-icon">
          <Icon name={iconName} size="small" className="not-hoverable" />
        </div>
      )}
      {/* Content under the label */}
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
