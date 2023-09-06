import React from 'react'
import ButtonCheckbox from '../ButtonCheckbox/ButtonCheckbox'
import Icon from '../Icon/Icon'
import { CSSTransition } from 'react-transition-group'

import './MapViewingOptions.scss'
import Typography from '../Typography/Typography'

// @ts-ignore
import triangleBottomWhite from '../../images/triangle-bottom-white.svg'
import SelectDropdown from '../SelectDropdown/SelectDropdown'
import { LayoutAlgorithm } from '../../types'
import FilterDropdownSelect from '../FilterDropdownSelect/FilterDropdownSelect'

export type MapViewingOptionsProps = {
  // proptypes
  isOpen: boolean
  showAchievedOutcomes: boolean
  showSmallOutcomes: boolean
  selectedLayoutAlgorithm: string
  onChangeShowAchievedOutcomes: (newState: boolean) => void
  onChangeShowSmallOutcomes: (newState: boolean) => void
  onSelectLayoutAlgorithm: (newState: string) => void
}

const MapViewingOptions: React.FC<MapViewingOptionsProps> = ({
  // prop declarations
  isOpen,
  showAchievedOutcomes,
  onChangeShowAchievedOutcomes,
  showSmallOutcomes,
  onChangeShowSmallOutcomes,
  selectedLayoutAlgorithm,
  onSelectLayoutAlgorithm,
}) => {
  return (
    <CSSTransition
      in={isOpen}
      timeout={100}
      unmountOnExit
      classNames="map-viewing-options-wrapper"
    >
      <div className="map-viewing-options-menu">
        <div className="map-viewing-option-heading">
          <Typography style="h8">Layout Algorithm</Typography>
        </div>
        <FilterDropdownSelect
          size={'small'}
          selectedOptionId={selectedLayoutAlgorithm}
          options={[
            {
              id: LayoutAlgorithm.Classic,
              text: 'Classic',
            },
            {
              id: LayoutAlgorithm.LongestPath,
              text: 'Minimum Height',
            },
            {
              id: LayoutAlgorithm.CoffmanGraham,
              text: 'Minimum Width',
            },
          ]}
          onSelect={onSelectLayoutAlgorithm}
        />

        <div className="map-viewing-option-heading">
          <Typography style="h8">By Achievement Status</Typography>
        </div>
        <ButtonCheckbox
          size="tiny"
          isChecked={showAchievedOutcomes}
          onChange={onChangeShowAchievedOutcomes}
          icon={
            <Icon name="circle-check.svg" className="not-hoverable achieved" />
          }
          text="Show All Achieved"
        />

        <div className="map-viewing-option-heading">
          <Typography style="h8">By Scope</Typography>
        </div>
        <ButtonCheckbox
          size="tiny"
          isChecked={showSmallOutcomes}
          onChange={onChangeShowSmallOutcomes}
          icon={<Icon name="leaf.svg" className="not-hoverable" />}
          text="Show All Smalls"
        />

        {/* Bottom Triangle */}
        <img className="triangle-bottom-white" src={triangleBottomWhite} />
      </div>
    </CSSTransition>
  )
}

export default MapViewingOptions
