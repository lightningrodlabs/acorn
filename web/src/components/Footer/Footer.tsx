import React, { useState, useRef, useEffect } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { useRouteMatch } from 'react-router-dom'
import Zoom from '../Zoom/Zoom.connector'
import './Footer.scss'
import Icon from '../Icon/Icon'
import Button from '../Button/Button'

import MapViewingOptions from '../MapViewingOptions/MapViewingOptions'
import { AgentPubKeyB64, CellIdString } from '../../types/shared'
import SyncingIndicator from '../SyncingIndicator/SyncingIndicator'

export type FooterProps = {
  agentAddress: AgentPubKeyB64
  hiddenAchievedOutcomes: CellIdString[]
  hiddenSmallOutcomes: CellIdString[]
  selectedLayeringAlgo: string
  unselectAll: () => void
  showSmallOutcomes: (projectCellId: CellIdString) => void
  hideSmallOutcomes: (projectCellId: CellIdString) => void
  showAchievedOutcomes: (projectCellId: CellIdString) => void
  hideAchievedOutcomes: (projectCellId: CellIdString) => void
  setSelectedLayeringAlgo: (layeringAlgo: string) => void
}

const Footer: React.FC<FooterProps> = ({
  agentAddress,
  hiddenAchievedOutcomes,
  hiddenSmallOutcomes,
  selectedLayeringAlgo,
  unselectAll,
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

  // for syncing a project
  const [numOpsToFetch, setNumOpsToFetch] = useState(0)

  // display syncing indicator when numOpsToFetch > 0
  useEffect(() => {
    const fetchOpData = async () => {
      if (!projectId) {
        return
      }
      // TODOOOOO
      // TODO: check `last_time_queried` parameter to see if its useful
      // try {
      //   const dnaHash = cellIdFromString(projectId)[0]
      //   const networkInfo = await appWs.networkInfo({
      //     agent_pub_key: agentAddress as any,
      //     dnas: [dnaHash],
      //   })
      //   let sum = networkInfo[0].fetch_pool_info.num_ops_to_fetch
      //   setNumOpsToFetch(sum)
      // } catch (e) {
      //   console.log('error during call to networkInfo', e)
      // }
    }

    const interval = setInterval(() => fetchOpData(), 1000)

    return () => clearInterval(interval)
  }, [projectId, agentAddress])

  const isSyncing = numOpsToFetch > 0

  return (
    <div className="footer" ref={ref}>
      {/* Report Issue Button */}
      <div className="bottom-left-panel">
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
          {isSyncing && <SyncingIndicator />}
          {mapPage && (
            <div
              className="map-viewing-options-button-wrapper"
              onClick={() => unselectAll()}
            >
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
