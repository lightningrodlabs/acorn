/*
  There should be an actions.js file in every
  feature folder, and it should start with a list
  of constants defining all the types of actions
  that can be taken within that feature.
*/
import { PROJECTS_ZOME_NAME } from '../../holochainConfig'
import { createCrudActionCreators } from '../../crudRedux'

/* action creator functions */

const PREVIEW_EDGES = 'preview_edges'
const CLEAR_EDGES_PREVIEW = 'clear_edges_preview'

const previewEdges = (cellId, edges) => {
  return {
    type: PREVIEW_EDGES,
    payload: {
      cellId,
      edges,
    },
  }
}

const clearEdgesPreview = cellId => {
  return {
    type: CLEAR_EDGES_PREVIEW,
    payload: {
      cellId,
    },
  }
}

const [
  createEdge,
  fetchEdges,
  updateEdge,
  archiveEdge,
] = createCrudActionCreators(PROJECTS_ZOME_NAME, 'edge')

export {
  PREVIEW_EDGES,
  CLEAR_EDGES_PREVIEW,
  previewEdges,
  clearEdgesPreview,
  createEdge,
  updateEdge,
  fetchEdges,
  archiveEdge,
}
