import { createCrudActionCreators } from '../../crudRedux'

const [[
  CREATE_PROJECT_META,
  FETCH_PROJECT_METAS,
  UPDATE_PROJECT_META,
  DELETE_PROJECT_META
],[
  createProjectMeta,
  fetchProjectMetas,
  updateProjectMeta,
  deleteProjectMeta,
]] = createCrudActionCreators('PROJECT_META')

// This model has a special "singular fetch"
// since a Project is only supposed to contain ONE
// ProjectMeta record
const FETCH_PROJECT_META = 'FETCH_PROJECT_META'
const fetchProjectMeta = (cellIdString, payload) => {
  return {
    type: FETCH_PROJECT_META,
    payload,
    meta: { cellIdString }
  }
}

// this model has a special "singular create"
// in order to perform proper validation
// that only one project meta exists
const SIMPLE_CREATE_PROJECT_META = 'SIMPLE_CREATE_PROJECT_META'
const simpleCreateProjectMeta = (cellIdString, payload) => {
  return {
    type: SIMPLE_CREATE_PROJECT_META,
    payload,
    meta: { cellIdString }
  }
}

export {
  CREATE_PROJECT_META,
  FETCH_PROJECT_METAS,
  UPDATE_PROJECT_META,
  DELETE_PROJECT_META,
  SIMPLE_CREATE_PROJECT_META,
  FETCH_PROJECT_META,
  createProjectMeta,
  fetchProjectMetas,
  updateProjectMeta,
  deleteProjectMeta,
  simpleCreateProjectMeta,
  fetchProjectMeta,
}
