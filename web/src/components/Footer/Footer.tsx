import React, { useState, useRef, useEffect } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { useRouteMatch } from 'react-router-dom'
import Zoom from '../Zoom/Zoom.connector'
import './Footer.scss'
import Icon from '../Icon/Icon'
import Button from '../Button/Button'

import MapViewingOptions from '../MapViewingOptions/MapViewingOptions'
import { AgentPubKeyB64, CellIdString } from '../../types/shared'
import { getAdminWs, getAppWs } from '../../hcWebsockets'
import SyncingIndicator from '../SyncingIndicator/SyncingIndicator'
import useTheme from '../../hooks/useTheme'

export type FooterProps = {
  agentAddress: AgentPubKeyB64
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
  agentAddress,
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

  // for syncing a project
  const [dnas, setDnas] = useState([])
  const [numOpsToFetch, setNumOpsToFetch] = useState(0)

  const theme = useTheme()

  useEffect(() => {
    const getDnas = async () => {
      const adminWs = await getAdminWs()
      const dnas = await adminWs.listDnas()
      setDnas(dnas)
    }

    getDnas()
  }, [projectId])

  // display syncing indicator when numOpsToFetch > 0
  useEffect(() => {
    const fetchOpData = async () => {
      if (!projectId) {
        return
      }

      const activeProjectDna = projectId.substring(0, projectId.indexOf('['))
      const appWs = await getAppWs()
      // TODO: check `last_time_queried` parameter to see if its useful
      const networkInfo = await appWs.networkInfo({
        agent_pub_key: agentAddress as any,
        dnas: dnas as any,
      })

      let i: number
      let sum = 0

      for (i = 0; i < dnas.length; i++) {
        const dna = dnas[i].toString()

        if (dna === activeProjectDna)
          sum = networkInfo[i].fetch_pool_info.num_ops_to_fetch
      }

      setNumOpsToFetch(sum)
    }

    const interval = setInterval(() => fetchOpData(), 1000)

    return () => clearInterval(interval)
  }, [projectId, agentAddress, dnas])

  const isSyncing = numOpsToFetch > 0

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
          {isSyncing && <SyncingIndicator />}
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
                } ${theme}`}
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
