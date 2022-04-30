import React, { useEffect, useRef } from 'react'
import render from '../../drawing'
import layoutFormula from '../../drawing/layoutFormula'
import { ProjectConnectionsState } from '../../redux/persistent/projects/connections/reducer'
import { TreeData } from '../../redux/persistent/projects/outcomes/outcomesAsTrees'
import { ProjectOutcomesState } from '../../redux/persistent/projects/outcomes/reducer'
import { RootState } from '../../redux/reducer'
import './MapViewDevMode.scss'

const buildState = (
  outcomes: ProjectOutcomesState,
  connections: ProjectConnectionsState,
  screenWidth: number,
  screenHeight: number
) => {
  const treeData: TreeData = {
    outcomes,
    connections,
    agents: {},
    outcomeMembers: {},
    outcomeVotes: {},
    outcomeComments: {},
  }
  const layout = layoutFormula(treeData)

  const defaultState: RootState = {
    ui: {
      keyboard: {
        shiftKeyDown: null,
      },
      mouse: {
        mousedown: null,
        coordinate: {
          x: 0,
          y: 0,
        },
      },
      realtimeInfo: {},
      selection: {
        selectedConnections: [],
        selectedOutcomes: [],
      },
      hover: {
        hoveredConnection: null,
      },
      layout: layout,
      connectionConnector: {
        fromAddress: null,
      },
      outcomeForm: {},
      activeEntryPoints: [],
      viewport: {
        translate: {
          x: 0,
          y: 0,
        },
        scale: 1,
      },
      screensize: {
        width: screenWidth,
        height: screenHeight,
      },
      activeProject: '123',
    },
    projects: {
      outcomes: {
        ['123']: outcomes,
      },
      connections: {
        ['123']: connections,
      },
      outcomeMembers: {
        ['123']: {},
      },
      entryPoints: {
        ['123']: {},
      },
      projectMeta: {
        ['123']: {
          topPriorityOutcomes: [],
        },
      },
    },
  }
  return defaultState
}

export type MapViewDevModeProps = {
  outcomes: ProjectOutcomesState
  connections: ProjectConnectionsState
}

const MapViewDevMode: React.FC<MapViewDevModeProps> = ({
  outcomes,
  connections,
}) => {
  const refCanvas = useRef()
  useEffect(() => {
    const canvas = refCanvas.current
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight

    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1

    // Get the size of the canvas in CSS pixels.
    const rect = canvas.getBoundingClientRect()
    const screenWidth = rect.width * dpr
    const screenHeight = rect.height * dpr
    // size * the device pixel ratio.
    // Give the canvas pixel dimensions of their CSS

    const state = buildState(outcomes, connections, screenWidth, screenHeight)
    // fake redux store with the only
    // important function for here
    const store = {
      getState: (): RootState => {
        return state
      },
    }
    render(store, canvas)

    // card width is fixed on zoom level 100%
    // card height is dynamic based on the text length,
    // and whether it has tags, assignees and time
  })
  return (
    <div className="map-view-dev-mode">
      <canvas ref={refCanvas} />
    </div>
  )
}

export default MapViewDevMode
