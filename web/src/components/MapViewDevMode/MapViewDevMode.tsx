import React, { useEffect, useRef } from 'react'
import render from '../../drawing'
import layoutFormula from '../../drawing/layoutFormula'
import { ProjectConnectionsState } from '../../redux/persistent/projects/connections/reducer'
import { TreeData } from '../../redux/persistent/projects/outcomes/outcomesAsTrees'
import { ProjectOutcomesState } from '../../redux/persistent/projects/outcomes/reducer'
import { RootState } from '../../redux/reducer'
import { Connection, Outcome } from '../../types'
import { WithHeaderHash } from '../../types/shared'
import './MapViewDevMode.scss'

export type MapViewDevModeProps = {
  // proptypes
}

const outcome1: WithHeaderHash<Outcome> = {
  content:
    'Acorn no longer uses a legacy unmaintained library and instead it is replaced with a modern typescript API definitions',
  creatorAgentPubKey: '',
  editorAgentPubKey: '',
  timestampCreated: 0,
  timestampUpdated: 0,
  scope: {
    Small: { achievementStatus: 'Achieved', targetDate: null, taskList: [] },
  },
  tags: [],
  description: '',
  isImported: false,
  githubLink: '',
  headerHash: '412',
}
const outcome2: WithHeaderHash<Outcome> = {
  content: 'Acorn no longer uses a legacy sunmaintained library',
  creatorAgentPubKey: '',
  editorAgentPubKey: '',
  timestampCreated: 0,
  timestampUpdated: 0,
  scope: {
    Small: { achievementStatus: 'Achieved', targetDate: null, taskList: [] },
  },
  tags: [],
  description: '',
  isImported: false,
  githubLink: '',
  headerHash: '413',
}

const connection1: WithHeaderHash<Connection> = {
  parentHeaderHash: '412',
  childHeaderHash: '413',
  randomizer: 1241,
  isImported: false,
  headerHash: '4124131',
}

const outcomesState: ProjectOutcomesState = {
  ['412']: outcome1,
  ['413']: outcome2,
}
const connectionsState: ProjectConnectionsState = {
  ['123']: connection1,
}

const treeData: TreeData = {
  outcomes: outcomesState,
  connections: connectionsState,
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
      scale: 0.5,
    },
    screensize: {
      width: 1000,
      height: 1000,
    },
    activeProject: '123',
  },
  projects: {
    outcomes: {
      ['123']: outcomesState,
    },
    connections: {
      ['123']: connectionsState,
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

const store = {
  getState: (): RootState => {
    return defaultState
  },
}

const MapViewDevMode: React.FC<MapViewDevModeProps> = (
  {
    // prop declarations
  }
) => {
  const refCanvas = useRef()
  useEffect(() => {
    const canvas = refCanvas.current
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight

    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1

    // Get the size of the canvas in CSS pixels.
    const rect = canvas.getBoundingClientRect()

    // card width is fixed on zoom level 100%
    const screenWidth = rect.width * dpr

    // card height is dynamic based on the text length,
    // and whether it has tags, assignees and time
    const screenHeight = rect.height * dpr
    defaultState.ui.screensize.width = screenWidth
    defaultState.ui.screensize.height = screenHeight
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    render(store, canvas)
  })
  return (
    <div className="map-view-dev-mode">
      <canvas ref={refCanvas} />
    </div>
  )
}

export default MapViewDevMode
