import React, { useContext, useEffect, useRef, useState } from 'react'
import { useStore } from 'react-redux'

import { ActionHashB64, CellIdString } from '../../../types/shared'
import { coordsCanvasToPage } from '../../../drawing/coordinateSystems'
import render from '../../../drawing'
import setupEventListeners from '../../../event-listeners'
import { setScreenDimensions } from '../../../redux/ephemeral/screensize/actions'

import selectRenderProps from './selectRenderProps'
import ComputedOutcomeContext from '../../../context/ComputedOutcomeContext'
import ProjectEmptyState from '../../../components/ProjectEmptyState/ProjectEmptyState'
import MultiEditBar from '../../../components/MultiEditBar/MultiEditBar.connector'
import OutcomeConnectors from '../../../components/OutcomeConnectors/OutcomeConnectors.connector'
import CollapsedChildrenPills from '../../../components/CollapsedChildrenPills/CollapsedChildrenPills.connector'
import MapViewCreateOutcome from '../../../components/MapViewCreateOutcome/MapViewCreateOutcome.connector'
import Tooltip from '../../../components/Tooltip/Tooltip'

import './MapView.scss'
import MapViewContextMenu from '../../../components/MapViewContextMenu/MapViewContextMenu'
import { useSelector } from 'react-redux'
import ModalOutcomeNavigation from '../../../components/ModalOutcomeNavigation/ModalOutcomeNavigation'
import { setNavModalClosed } from '../../../redux/ephemeral/navigation-modal/actions'

export type MapViewDispatchProps = {
  expandOutcome: (
    projectCellId: CellIdString,
    outcomeActionHash: ActionHashB64
  ) => void
  collapseOutcome: (
    projectCellId: CellIdString,
    outcomeActionHash: ActionHashB64
  ) => void
  unsetContextMenu: () => void
}

export type MapViewStateProps = {
  projectId: CellIdString
  hasMultiSelection: boolean
  outcomeFormIsOpen: boolean
  hoveredOutcomeAddress: ActionHashB64 | null
  liveMouseCoordinates: { x: number; y: number }
  contextMenuCoordinate: { x: number; y: number }
  contextMenuOutcomeActionHash: ActionHashB64
  contextMenuOutcomeStatement: string
  contextMenuOutcomeIsCollapsed: boolean
  mouseIsDown: boolean
  translate: {
    x: number
    y: number
  }
  zoomLevel: number
  showEmptyState: boolean
  navigationModalIsOpen: boolean
  nagivateToChildren: boolean
}

export type MapViewProps = MapViewDispatchProps & MapViewStateProps

const MapView: React.FC<MapViewProps> = ({
  projectId,
  showEmptyState,
  zoomLevel,
  translate,
  outcomeFormIsOpen,
  hoveredOutcomeAddress,
  liveMouseCoordinates,
  contextMenuCoordinate,
  contextMenuOutcomeActionHash,
  contextMenuOutcomeStatement,
  contextMenuOutcomeIsCollapsed,
  mouseIsDown,
  hasMultiSelection,
  expandOutcome,
  collapseOutcome,
  unsetContextMenu,
  navigationModalIsOpen,
  nagivateToChildren,
}) => {
  const store = useStore()
  const refCanvas = useRef<HTMLCanvasElement>()

  const { computedOutcomesKeyed, computedOutcomesAsTree } = useContext(
    ComputedOutcomeContext
  )

  // only run this one on initial mount
  useEffect(() => {
    const canvas = refCanvas.current
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight
    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1
    // Get the size of the canvas in CSS pixels.
    const rect = canvas.getBoundingClientRect()
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    store.dispatch(setScreenDimensions(rect.width * dpr, rect.height * dpr))
  }, [])

  // event listeners effect
  // set this up newly, any time the
  // outcomes and connections change
  useEffect(() => {
    // attach keyboard and mouse events
    const canvas = refCanvas.current
    const removeEventListeners = setupEventListeners(
      store,
      canvas,
      computedOutcomesKeyed
    )
    return function cleanup() {
      removeEventListeners()
    }
  }, [computedOutcomesKeyed])

  // using this smart selector is a performance gain
  // because renderProps value will only obtain a new reference
  // when the output changes
  const renderProps = useSelector(selectRenderProps)

  useEffect(() => {
    const canvas = refCanvas.current
    if (projectId && renderProps) {
      render(
        {
          ...renderProps,
          computedOutcomesKeyed,
        },
        canvas
      )
    }
  }, [renderProps, projectId, computedOutcomesKeyed])

  const transform = {
    transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${translate.x}, ${translate.y})`,
  }

  const hoveredOutcome = hoveredOutcomeAddress
    ? computedOutcomesKeyed[hoveredOutcomeAddress]
    : null

  // this strategy for updating the tooltip means that whatever
  // the statement of the last hovered Outcome was, it will remain visible
  // in the delay between leaving hovering that Outcome, and the
  // tooltip disappearing
  const [
    outcomeStatementTooltipText,
    setOutcomeStatementTooltipTextText,
  ] = useState<string>()
  useEffect(() => {
    if (hoveredOutcome) {
      setOutcomeStatementTooltipTextText(hoveredOutcome.content)
    }
  }, [hoveredOutcome])

  const pageMouseCoords = coordsCanvasToPage(
    liveMouseCoordinates,
    translate,
    zoomLevel
  )
  // don't bother with outcome statement tooltips if the zoom level is >= 0.7
  // because it displays the full Outcome statement
  const outcomeStatementTooltipVisible = hoveredOutcome && zoomLevel < 0.5

  // don't display the 'collapse/expand' contextmenu item if
  // the Outcome doesn't have children
  const contextMenuOutcome = computedOutcomesKeyed[contextMenuOutcomeActionHash]
  const contextMenuOutcomeHasChildren = contextMenuOutcome
    ? !!contextMenuOutcome.children?.length
    : false

  return (
    <>
      {showEmptyState && <ProjectEmptyState />}
      <canvas ref={refCanvas} className={mouseIsDown ? 'grabbing' : ''} />
      {/* transform everything in this container according  */}
      {/* to the same scaling and tranlating as the canvas */}
      {/* is being scaled and translated, using css matrix transforms */}
      <div className="transform-container" style={transform}>
        {/* <div className="transform-container" style={transform}></div> */}
        {/* Only present this OutcomeTitleQuickEdit */}

        {/* if the scale is greater than or equal to 60% (or we are creating an Outcome) */}
        {/* because otherwise the font size gets to small and the text is cut off */}
        <CollapsedChildrenPills outcomes={computedOutcomesKeyed} />
      </div>
      
        {outcomeFormIsOpen && <MapViewCreateOutcome projectId={projectId} />}

      {/* below items inside 'mapview-elements-container' maintain their normal scale */}
      {/* while positioning themselves absolutely (position: absolute) on the screen */}
      {/* in coordinates that match with the outcomes being drawn on the canvas */}
      <div className="mapview-elements-container">
        {/* Outcome Statement Tooltip */}
        {!contextMenuCoordinate && (
          <div
            className={
              outcomeStatementTooltipVisible
                ? 'outcome-statement-tooltip-visible'
                : ''
            }
            style={{
              position: 'absolute',
              left: `${pageMouseCoords.x + 2}px`,
              top: `${pageMouseCoords.y + 40}px`,
            }}
          >
            <Tooltip
              noTransition
              noTriangle
              allowWrapping
              text={outcomeStatementTooltipText}
            />
          </div>
        )}
        {/* Outcome Connectors */}
        {/* an undefined value of refCanvas.current was causing a crash, due to canvas prop being undefined */}
        {refCanvas.current && zoomLevel >= 0.12 && !contextMenuCoordinate && (
          <OutcomeConnectors />
        )}
        {/* CollapsedChildrenPills */}
        {/* an undefined value of refCanvas.current was causing a crash, due to canvas prop being undefined */}
        {/* {refCanvas.current && (
          <CollapsedChildrenPills
            canvas={refCanvas.current}
            outcomes={computedOutcomesKeyed}
          />
        )} */}

        {contextMenuCoordinate && (
          <MapViewContextMenu
            projectCellId={projectId}
            isCollapsed={contextMenuOutcomeIsCollapsed}
            hasChildren={contextMenuOutcomeHasChildren}
            outcomeActionHash={contextMenuOutcomeActionHash}
            outcomeStatement={contextMenuOutcomeStatement}
            contextMenuCoordinate={contextMenuCoordinate}
            expandOutcome={expandOutcome}
            collapseOutcome={collapseOutcome}
            unsetContextMenu={unsetContextMenu}
          />
        )}
      </div>

      <MultiEditBar
        projectId={projectId}
        hasMultiSelection={hasMultiSelection}
      />
      <ModalOutcomeNavigation
        navigationModalIsOpen={navigationModalIsOpen}
        onClose={() => {
          store.dispatch(setNavModalClosed())
        }}
        navigateToOutcomeType={nagivateToChildren ? 'child' : 'parent'}
      />
    </>
  )
}

export default MapView
