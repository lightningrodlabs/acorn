import React, { useState, useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { NavLink, Route, useRouteMatch } from 'react-router-dom'
import Zoom from '../Zoom/Zoom.connector'
import './Footer.scss'
import Icon from '../Icon/Icon'
import Button from '../Button/Button'

import EntryPointPicker from '../EntryPointPicker/EntryPointPicker.connector'
import MapViewingOptions from '../MapViewingOptions/MapViewingOptions'

function Footer() {
  const projectPage = useRouteMatch('/project/:projectId')
  const projectId = projectPage ? projectPage.params.projectId : null
  const mapPage = useRouteMatch('/project/:projectId/map')

  let bottomRightPanelClassName = 'bottom-right-panel'

  bottomRightPanelClassName =
    bottomRightPanelClassName + (mapPage ? '' : ' bottom-right-panel-not-map')

  const ref = useRef()
  useOnClickOutside(ref, () => setOpenMapViewingOptions(false))

  const [openMapViewingOptions, setOpenMapViewingOptions] = useState(false)

  return (
    <div className='footer' ref={ref}>
      {/* Report Issue Button */}
      <div className='bottom-panel'>
        <a
          href='https://github.com/h-be/acorn/issues/new'
          target='_blank'>
          <Button text='Report Issue' size='small' className='green' />
        </a>
      </div>
      {/* Zooming and Viewing Options on Map View */}
      {projectPage && (
        <div className={bottomRightPanelClassName}>

          {mapPage && <div className="map-viewing-options-button-wrapper">
            {/* If map viewing options is open */}
            <MapViewingOptions isOpen={openMapViewingOptions} />
            {/* Map Viewing Options Button */}
            <div className={`map-viewing-options-button ${openMapViewingOptions ? 'active' : ''}`}
              onClick={() =>
                setOpenMapViewingOptions(!openMapViewingOptions)
              }><Icon name="eye.svg" className='footer-action-icon'
                withTooltipTop
                tooltipText="Map Viewing Options" />
            </div>

          </div>}
          {/* Map Zooming */}
          {mapPage && <Zoom />}

        </div>
      )}
    </div>
  )
}

export default Footer
