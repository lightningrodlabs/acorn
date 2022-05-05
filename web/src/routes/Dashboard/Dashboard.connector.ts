import { connect } from 'react-redux'

import { PROJECTS_ZOME_NAME, PROJECT_APP_PREFIX } from '../../holochainConfig'
import { passphraseToUid } from '../../secrets'
import { getAdminWs, getAppWs, getAgentPubKey } from '../../hcWebsockets'
import { fetchEntryPointDetails } from '../../redux/persistent/projects/entry-points/actions'
import {
  fetchMembers,
  setMember,
} from '../../redux/persistent/projects/members/actions'
import {
  simpleCreateProjectMeta,
  fetchProjectMeta,
} from '../../redux/persistent/projects/project-meta/actions'
import selectEntryPoints from '../../redux/persistent/projects/entry-points/select'
import { PriorityModeOptions } from '../../constants'

import {
  joinProjectCellId,
  removeProjectCellId,
} from '../../redux/persistent/cells/actions'
import importAllProjectData from '../../import'
import {
  closeInviteMembersModal,
  openInviteMembersModal,
} from '../../redux/ephemeral/invite-members-modal/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { cellIdFromString, cellIdToString } from '../../utils'
import { CellIdString } from '../../types/shared'
import { CellId } from '@holochain/client'
import { RootState } from '../../redux/reducer'
import Dashboard from './Dashboard.component'

async function installProjectApp(
  passphrase
): Promise<[CellIdString, CellId, string]> {
  const uid = passphraseToUid(passphrase)
  // add a bit of randomness so that
  // the same passphrase can be tried multiple different times
  // without conflicting
  // in order to eventually find their peers
  // note that this will leave a graveyard of deactivated apps for attempted
  // joins
  const installed_app_id = `${PROJECT_APP_PREFIX}-${Math.random()
    .toString()
    .slice(-6)}-${uid}`
  const adminWs = await getAdminWs()
  const agent_key = getAgentPubKey()
  if (!agent_key) {
    throw new Error(
      'Cannot install a new project because no AgentPubKey is known locally'
    )
  }
  // the dna hash HAS to act deterministically
  // in order for the 'joining' of Projects to work
  const dnaPath = window.require
    ? await window.require('electron').ipcRenderer.invoke('getProjectsPath')
    : './happ/workdir/projects.dna'
  const hash = await adminWs.registerDna({
    path: dnaPath,
    uid,
  })
  // INSTALL
  const installedApp = await adminWs.installApp({
    agent_key,
    installed_app_id,
    dnas: [
      {
        role_id: uid,
        hash,
      },
    ],
  })
  const cellId = installedApp.cell_data[0].cell_id
  const cellIdString = cellIdToString(cellId)
  // ACTIVATE
  // TODO !!! Update to EnableApp when updating
  // conductor-api version
  await adminWs.activateApp({ installed_app_id })
  return [cellIdString, cellId, installed_app_id]
}

async function createProject(passphrase, projectMeta, agentAddress, dispatch) {
  const [cellIdString] = await installProjectApp(passphrase)
  const cellId = cellIdFromString(cellIdString)
  // because we are acting optimistically,
  // we will directly set ourselves as a member of this cell
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  await dispatch(setMember(cellIdString, { agentPubKey: agentAddress }))
  const b1 = Date.now()
  const simpleCreatedProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
    cellId,
    projectMeta
  )
  await dispatch(
    simpleCreateProjectMeta(cellIdString, simpleCreatedProjectMeta)
  )
  const b2 = Date.now()
  console.log('duration in MS over createProjectMeta ', b2 - b1)
  return cellIdString
}

async function joinProject(passphrase, dispatch): Promise<boolean> {
  // joinProject
  // join a DNA
  // then try to find a peer
  // either way, just push the project into the 'queue'
  const [cellIdString, cellId, installedAppId] = await installProjectApp(
    passphrase
  )
  const appWs = await getAppWs()
  // trigger a side effect...
  // this will let other project members know you're here
  // without 'blocking' the thread or the UX
  appWs
    .callZome(
      {
        cap_secret: null,
        cell_id: cellId,
        zome_name: PROJECTS_ZOME_NAME,
        fn_name: 'init_signal',
        payload: null,
        provenance: getAgentPubKey(), // FIXME: this will need correcting after holochain changes this
      },
      50000
    )
    .then(() => console.log('succesfully triggered init_signal'))
    .catch((e) => console.error('failed while triggering init_signal: ', e))
  // this will trigger the fetching of project meta
  // checks and other things
  dispatch(joinProjectCellId(cellIdString))
  return false
}

async function importProject(
  existingAgents,
  agentAddress,
  projectData,
  passphrase,
  profilesCellIdString,
  dispatch
) {
  // first step is to install the dna
  const [projectsCellIdString] = await installProjectApp(passphrase)
  const cellId = cellIdFromString(projectsCellIdString)
  // next step is to import the rest of the data into that project
  const oldToNewAddressMap = await importAllProjectData(
    existingAgents,
    projectData,
    projectsCellIdString,
    profilesCellIdString,
    dispatch
  )

  // only add the project meta after the rest has been imported
  // so it doesn't list itself early in the process
  // first step is to create new project
  const originalTopPriorityOutcomes =
    projectData.projectMeta.topPriorityOutcomes
  const originalPriorityMode = projectData.projectMeta.priorityMode
  const projectMeta = {
    ...projectData.projectMeta,
    // the question mark operator for backwards compatibility
    topPriorityOutcomes: originalTopPriorityOutcomes
      ? originalTopPriorityOutcomes
          .map((oldAddress) => oldToNewAddressMap[oldAddress])
          .filter((address) => address)
      : [],
    // the question mark operator for backwards compatibility
    priorityMode: originalPriorityMode
      ? originalPriorityMode
      : PriorityModeOptions.Universal,
    createdAt: Date.now(),
    creatorAgentPubKey: agentAddress,
    passphrase: passphrase,
  }
  // these are not actuals field
  // v0.5.4-alpha
  delete projectMeta.headerHash
  // pre v0.5.3-alpha and prior
  delete projectMeta.address

  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  await dispatch(setMember(projectsCellIdString, { agentPubKey: agentAddress }))
  try {
    console.log(projectMeta)
    const simpleCreatedProjectMeta = await projectsZomeApi.projectMeta.simpleCreateProjectMeta(
      cellId,
      projectMeta
    )
    await dispatch(
      simpleCreateProjectMeta(projectsCellIdString, simpleCreatedProjectMeta)
    )
  } catch (e) {
    throw e
  }
}

async function deactivateApp(appId, cellId, dispatch) {
  const adminWs = await getAdminWs()
  await adminWs.deactivateApp({
    installed_app_id: appId,
  })
  await dispatch(removeProjectCellId(cellId))
}

// ACTUAL REDUX FUNCTIONS

function mapStateToProps(state: RootState) {
  return {
    existingAgents: state.agents,
    agentAddress: state.agentAddress,
    profilesCellIdString: state.cells.profiles,
    cells: state.cells.projects,
    projects: Object.keys(state.projects.projectMeta).map((cellId) => {
      const project = state.projects.projectMeta[cellId]
      const members = state.projects.members[cellId] || {}
      const memberProfiles = Object.keys(members).map(
        (agentAddress) => state.agents[agentAddress]
      )
      const entryPoints = selectEntryPoints(state, cellId)
      return {
        ...project,
        cellId,
        members: memberProfiles,
        entryPoints,
      }
    }),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setShowInviteMembersModal: (projectId) => {
      return dispatch(openInviteMembersModal(projectId))
    },
    hideInviteMembersModal: () => {
      return dispatch(closeInviteMembersModal())
    },
    deactivateApp: (appId, cellId) => {
      return deactivateApp(appId, cellId, dispatch)
    },
    fetchEntryPointDetails: async (cellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const entryPointDetails = await projectsZomeApi.entryPoint.fetchEntryPointDetails(
        cellId
      )
      return dispatch(fetchEntryPointDetails(cellIdString, entryPointDetails))
    },
    fetchMembers: async (cellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const members = await projectsZomeApi.member.fetch(cellId)
      return dispatch(fetchMembers(cellIdString, members))
    },
    fetchProjectMeta: async (cellIdString) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const projectMeta = await projectsZomeApi.projectMeta.fetchProjectMeta(
        cellId
      )
      return dispatch(fetchProjectMeta(cellIdString, projectMeta))
    },
    createProject: async (agentAddress, project, passphrase) => {
      // matches the createProjectMeta fn and type signature
      const projectMeta = {
        ...project, // name and image
        passphrase,
        creatorAgentPubKey: agentAddress,
        createdAt: Date.now(),
        isImported: false,
        priorityMode: 'Universal', // default
        topPriorityOutcomes: [],
      }
      await createProject(passphrase, projectMeta, agentAddress, dispatch)
    },
    joinProject: (passphrase) => joinProject(passphrase, dispatch),
    importProject: (
      existingAgents,
      agentAddress,
      projectData,
      passphrase,
      profilesCellIdString
    ) =>
      importProject(
        existingAgents,
        agentAddress,
        projectData,
        passphrase,
        profilesCellIdString,
        dispatch
      ),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
