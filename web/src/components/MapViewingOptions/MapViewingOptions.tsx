import React from 'react'
import ButtonCheckbox from '../ButtonCheckbox/ButtonCheckbox'
import Icon from '../Icon/Icon'
import { CSSTransition } from 'react-transition-group'

import './MapViewingOptions.scss'
import Typography from '../Typography/Typography'

import triangleBottomWhite from '../../images/triangle-bottom-white.svg'

export type MapViewingOptionsProps = {
  // proptypes
  isOpen: boolean
}

const MapViewingOptions: React.FC<MapViewingOptionsProps> = ({
  // prop declarations
  isOpen,
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
          <Typography style="h8">By Achievement Status</Typography>
        </div>
        <ButtonCheckbox
          size="tiny"
          isChecked={true}
          onChange={null}
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
          isChecked={true}
          onChange={null}
          icon={<Icon name="leaf.svg" className="not-hoverable" />}
          text="Show All Small"
        />
        {/* Bottom Triangle */}
        <img className="triangle-bottom-white" src={triangleBottomWhite} />
      </div>
    </CSSTransition>
  )
}

export default MapViewingOptions
