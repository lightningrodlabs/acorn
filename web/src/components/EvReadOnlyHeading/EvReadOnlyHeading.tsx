import React from 'react'
import ReadOnlyInfo from '../ReadOnlyInfo/ReadOnlyInfo'
import Typography from '../Typography/Typography'
import './EvReadOnlyHeading.scss'

export type EvReadOnlyHeadingProps = {
  headingText: string
  overviewText: string
  overviewIcon: React.ReactElement
}

const EvReadOnlyHeading: React.FC<EvReadOnlyHeadingProps> = ({
  headingText,
  overviewIcon,
  overviewText,
}) => {
  return (
    <div className="ev-read-only-heading-wrapper">
      <div className="ev-read-only-heading">{headingText}</div>
      <div>
        <ReadOnlyInfo infos={[{ icon: overviewIcon, text: overviewText }]} />
      </div>
    </div>
  )
}

export default EvReadOnlyHeading
