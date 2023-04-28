import React, { useState, useRef } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { useRouteMatch } from 'react-router-dom'
import Zoom from '../Zoom/Zoom.connector'
import './Footer.scss'
import Icon from '../Icon/Icon'
import Button from '../Button/Button'

import MapViewingOptions from '../MapViewingOptions/MapViewingOptions'
import { CellIdString } from '../../types/shared'

export type FooterProps = {
  hiddenAchievedOutcomes: CellIdString[]
  hiddenSmallOutcomes: CellIdString[]
  selectedLayeringAlgo: string
  showSmallOutcomes: (projectCellId: CellIdString) => void
  hideSmallOutcomes: (projectCellId: CellIdString) => void
  showAchievedOutcomes: (projectCellId: CellIdString) => void
  hideAchievedOutcomes: (projectCellId: CellIdString) => void
  setSelectedLayeringAlgo: (layeringAlgo: string) => void
}

const Footer: React.FC<FooterProps> = ({
  hiddenAchievedOutcomes,
  hiddenSmallOutcomes,
  selectedLayeringAlgo,
  showSmallOutcomes,
  hideSmallOutcomes,
  showAchievedOutcomes,
  hideAchievedOutcomes,
  setSelectedLayeringAlgo,
}) => {
  const projectPage = useRouteMatch<{ projectId: CellIdString }>(
    '/project/:projectId'
  )
  const projectId = projectPage ? projectPage.params.projectId : ''
  const mapPage = useRouteMatch('/project/:projectId/map')

  let bottomRightPanelClassName = 'bottom-right-panel'

  bottomRightPanelClassName =
    bottomRightPanelClassName + (mapPage ? '' : ' bottom-right-panel-not-map')

  const ref = useRef()
  useOnClickOutside(ref, () => setOpenMapViewingOptions(false))

  const [openMapViewingOptions, setOpenMapViewingOptions] = useState(false)

  const showAchievedOutcomesValue = !hiddenAchievedOutcomes.includes(projectId)
  const showSmallOutcomesValue = !hiddenSmallOutcomes.includes(projectId)
  const onChangeShowAchievedOutcomes = (newValue: boolean) => {
    if (newValue) {
      showAchievedOutcomes(projectId)
    } else {
      hideAchievedOutcomes(projectId)
    }
  }
  const onChangeShowSmallOutcomes = (newValue: boolean) => {
    if (newValue) {
      showSmallOutcomes(projectId)
    } else {
      hideSmallOutcomes(projectId)
    }
  }

  return (
    <div className="footer" ref={ref}>
      {/* Report Issue Button */}
      <div className="bottom-panel">
        <a
          href="https://github.com/lightningrodlabs/acorn/issues/new"
          target="_blank"
        >
          <Button text="Report Issue" size="small" className="green" />
        </a>
      </div>
      {/* Zooming and Viewing Options on Map View */}
      {projectPage && (
        <div className={bottomRightPanelClassName}>
          {mapPage && (
            <div className="map-viewing-options-button-wrapper">
              {/* If map viewing options is open */}
              <MapViewingOptions
                isOpen={openMapViewingOptions}
                showAchievedOutcomes={showAchievedOutcomesValue}
                showSmallOutcomes={showSmallOutcomesValue}
                onChangeShowAchievedOutcomes={onChangeShowAchievedOutcomes}
                onChangeShowSmallOutcomes={onChangeShowSmallOutcomes}
                selectedLayeringAlgo={selectedLayeringAlgo}
                onSelectLayeringAlgo={setSelectedLayeringAlgo}
              />
              {/* Map Viewing Options Button */}
              <div
                className={`map-viewing-options-button ${
                  openMapViewingOptions ? 'active' : ''
                }`}
                onClick={() => setOpenMapViewingOptions(!openMapViewingOptions)}
              >
                {(!showAchievedOutcomesValue || !showSmallOutcomesValue) && (
                  <div className="map-viewing-options-with-unchecked" />
                )}
                <Icon
                  name="eye.svg"
                  className="footer-action-icon"
                  withTooltipTop
                  tooltipText="Map Viewing Options"
                />
              </div>
            </div>
          )}
          {/* Map Zooming */}
          {mapPage && <Zoom />}
        </div>
      )}
    </div>
  )
}

export default Footer
