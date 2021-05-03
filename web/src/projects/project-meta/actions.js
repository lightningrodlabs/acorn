import { createZomeCallAsyncAction } from 'connoropolous-hc-redux-middleware'

import { createCrudActionCreators } from '../../crudRedux'
import { PROJECTS_ZOME_NAME } from '../../holochainConfig'

const [
  createProjectMeta,
  fetchProjectMetas,
  updateProjectMeta,
  archiveProjectMeta,
] = createCrudActionCreators(PROJECTS_ZOME_NAME, 'project_meta')

// This model has a special "singular fetch"
// since a Project is only supposed to contain ONE
// ProjectMeta record
const FETCH_PROJECT_META = 'fetch_project_meta'
const fetchProjectMeta = createZomeCallAsyncAction(
  PROJECTS_ZOME_NAME,
  FETCH_PROJECT_META
)

// this model has a special "singular create"
// in order to perform proper validation
// that only one project meta exists
const SIMPLE_CREATE_PROJECT_META = 'simple_create_project_meta'
const simpleCreateProjectMeta = createZomeCallAsyncAction(
  PROJECTS_ZOME_NAME,
  SIMPLE_CREATE_PROJECT_META
)

const SIMPLE_CREATE_PROJECT_META_LINK = 'simple_create_project_meta_link'
const simpleCreateProjectMetaLink = createZomeCallAsyncAction(
  PROJECTS_ZOME_NAME,
  SIMPLE_CREATE_PROJECT_META_LINK
)

export {
  simpleCreateProjectMeta,
  simpleCreateProjectMetaLink,
  fetchProjectMetas,
  updateProjectMeta,
  fetchProjectMeta,
  archiveProjectMeta,
}
