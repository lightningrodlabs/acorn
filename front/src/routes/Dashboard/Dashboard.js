import React, { useState, useEffect } from 'react'
import { cellIdToString } from 'connoropolous-hc-redux-middleware/build/main/lib/actionCreator'
import { CSSTransition } from 'react-transition-group'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'

import './Dashboard.css'
import Icon from '../../components/Icon/Icon'
import DashboardEmptyState from '../../components/DashboardEmptyState/DashboardEmptyState'

import CreateProjectModal from '../../components/CreateProjectModal/CreateProjectModal'
import JoinProjectModal from '../../components/JoinProjectModal/JoinProjectModal'
import InviteMembersModal from '../../components/InviteMembersModal/InviteMembersModal'
// import new modals here

import { PROJECTS_DNA_PATH, PROJECTS_ZOME_NAME } from '../../holochainConfig'
import { passphraseToUuid } from '../../secrets'
import { getAdminWs, getAppWs, getAgentPubKey } from '../../hcWebsockets'
import { fetchEntryPoints } from '../../projects/entry-points/actions'
import { fetchMembers, setMember } from '../../projects/members/actions'
import {
  createProjectMeta,
  fetchProjectMeta,
} from '../../projects/project-meta/actions'
import selectEntryPoints from '../../projects/entry-points/select'

import {
  DashboardListProject,
  DashboardListProjectLoading,
} from './DashboardListProject'
import { joinProjectCellId } from '../../cells/actions'

function Dashboard ({
  agentAddress,
  cells,
  projects,
  fetchEntryPoints,
  fetchMembers,
  fetchProjectMeta,
  createProject,
  joinProject,
  updateIsAvailable,
  setShowUpdatePromptModal,
}) {
  // cells is an array of cellId strings
  useEffect(() => {
    cells.forEach(cellId => {
      fetchProjectMeta(cellId)
      fetchMembers(cellId)
      fetchEntryPoints(cellId)
    })
  }, [JSON.stringify(cells)])

  // created_at, name
  const [selectedSort, setSelectedSort] = useState('created_at')
  const [showSortPicker, setShowSortPicker] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  // call set for this one with the actual passphrase to render inside
  const [showInviteMembersModal, setShowInviteMembersModal] = useState(null)
  // add new modal state managers here

  const onCreateProject = (project, passphrase) => {
    return createProject(agentAddress, project, passphrase)
  }

  const onJoinProject = passphrase => joinProject(passphrase)

  const hasProjects = cells.length > 0 // write 'false' if want to see Empty State

  const setSortBy = sortBy => () => {
    setSelectedSort(sortBy)
    setShowSortPicker(false)
  }

  let sortedProjects
  if (selectedSort === 'created_at') {
    // sort most recent first, oldest last
    sortedProjects = projects.sort((a, b) => b.created_at - a.created_at)
  } else if (selectedSort === 'name') {
    // sort alphabetically ascending
    sortedProjects = projects.sort((a, b) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    })
  }

  return (
    <>
      <div className='dashboard-background'>
        <div className='dashboard-left-menu'>
          <NavLink to='/dashboard' className='dashboard-left-menu-item'>
            <Icon name='folder.svg' size='very-small' className='grey' />
            My projects
          </NavLink>
          <NavLink
            to='/settings'
            className='dashboard-left-menu-item feature-in-development'>
            <Icon name='setting.svg' size='very-small' className='grey' />
            Settings
          </NavLink>
        </div>
        <div className='dashboard-my-projects'>
          <div className='my-projects-heading'>My projects</div>
          {/* dashboard header */}
          <div className='my-projects-header'>
            <div className='my-projects-header-buttons'>
              <div
                className='my-projects-button create-project-button'
                onClick={() => setShowCreateModal(true)}>
                Create a project
              </div>
              <div
                className='my-projects-button'
                onClick={() => setShowJoinModal(true)}>
                Join a project
              </div>
            </div>
            <div className='my-projects-sorting'>
              <div>Sort by</div>
              <div
                className='my-projects-sorting-selected'
                onClick={() => setShowSortPicker(!showSortPicker)}>
                {selectedSort === 'created_at' && 'Last Created'}
                {selectedSort === 'name' && 'Name'}
                <Icon
                  name='line-angle-down.svg'
                  size='very-small'
                  className={`grey ${showSortPicker ? 'active' : ''}`}
                />
              </div>
              <CSSTransition
                in={showSortPicker}
                timeout={100}
                unmountOnExit
                classNames='my-projects-sorting-select'>
                <ul className='my-projects-sorting-select'>
                  <li onClick={setSortBy('created_at')}>Last Created</li>
                  <li onClick={setSortBy('name')}>Name</li>
                </ul>
              </CSSTransition>
            </div>
          </div>
          <div className='my-projects-content'>
            {/* Only render the sorted projects with their real metadata */}
            {cells.length !== projects.length &&
              cells.map(cellId => (
                <DashboardListProjectLoading key={'dlpl-key' + cellId} />
              ))}
            {/* if they are all loaded */}
            {cells.length === projects.length &&
              sortedProjects.map(project => {
                return (
                  <DashboardListProject
                    updateIsAvailable={updateIsAvailable}
                    setShowUpdatePromptModal={setShowUpdatePromptModal}
                    key={'dlp-key' + project.cellId}
                    project={project}
                    setShowInviteMembersModal={setShowInviteMembersModal}
                  />
                )
              })}
            {!hasProjects && (
              <DashboardEmptyState
                onJoinClick={() => setShowJoinModal(true)}
                onCreateClick={() => setShowCreateModal(true)}
              />
            )}
          </div>
        </div>
      </div>
      <CreateProjectModal
        onCreateProject={onCreateProject}
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinProjectModal
        onJoinProject={onJoinProject}
        showModal={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
      <InviteMembersModal
        passphrase={showInviteMembersModal}
        showModal={showInviteMembersModal}
        onClose={() => setShowInviteMembersModal(false)}
      />
      {/* add new modals here */}
    </>
  )
}

async function installProjectApp (passphrase) {
  const uuid = passphraseToUuid(passphrase)
  // add a bit of randomness so that
  // the same passphrase can be tried multiple different times
  // without conflicting
  // in order to eventually find their peers
  // note that this will leave a graveyard of deactivated apps for attempted
  // joins
  const installed_app_id = `${Math.random()
    .toString()
    .slice(-6)}-${uuid}`
  const adminWs = await getAdminWs()
  const agent_key = getAgentPubKey()
  if (!agent_key) {
    throw new Error(
      'Cannot install a new project because no AgentPubKey is known locally'
    )
  }
  // INSTALL
  const installedApp = await adminWs.installApp({
    agent_key,
    installed_app_id,
    dnas: [
      {
        nick: uuid,
        path: PROJECTS_DNA_PATH,
        properties: { uuid },
      },
    ],
  })
  // ACTIVATE
  await adminWs.activateApp({ installed_app_id })
  return installedApp
}

async function createProject (passphrase, projectMeta, agentAddress, dispatch) {
  const installedApp = await installProjectApp(passphrase)
  const cellIdString = cellIdToString(installedApp.cell_data[0][0])
  // because we are acting optimistically,
  // because holochain is taking 18 s to respond to this first call
  // we will directly set ourselves as a member of this cell
  await dispatch(setMember(cellIdString, { address: agentAddress }))
  const b1 = Date.now()
  await dispatch(
    createProjectMeta.create({ cellIdString, payload: projectMeta })
  )
  const b2 = Date.now()
  console.log('duration in MS over createProjectMeta ', b2 - b1)
}

async function joinProject (passphrase, dispatch) {
  // joinProject
  // join a DNA
  // then try to get the project metadata
  // if that DOESN'T work, the attempt is INVALID
  // remove the instance again immediately
  const installedApp = await installProjectApp(passphrase)
  const cellId = installedApp.cell_data[0][0]
  const cellIdString = cellIdToString(installedApp.cell_data[0][0])
  const appWs = await getAppWs()
  try {
    await appWs.callZome({
      cap: null,
      cell_id: cellId,
      zome_name: PROJECTS_ZOME_NAME,
      fn_name: 'fetch_project_meta',
      payload: null,
      provenance: getAgentPubKey(), // FIXME: this will need correcting after holochain changes this
    })
    await dispatch(joinProjectCellId(cellIdString))
    // trigger a side effect...
    // this will let other project members know you're here
    // without 'blocking' the thread or the UX
    appWs
      .callZome({
        cap: null,
        cell_id: cellId,
        zome_name: PROJECTS_ZOME_NAME,
        fn_name: 'init_signal',
        payload: null,
        provenance: getAgentPubKey(), // FIXME: this will need correcting after holochain changes this
      })
      .then(() => console.log('succesfully triggered init_signal'))
      .catch(e => console.error('failed while triggering init_signal: ', e))
    return true
  } catch (e) {
    // deactivate app
    const adminWs = await getAdminWs()
    await adminWs.deactivateApp({
      installed_app_id: installedApp.installed_app_id,
    })
    if (
      e.type === 'error' &&
      e.data.type === 'ribosome_error' &&
      e.data.data.includes('no project meta exists')
    ) {
      return false
    } else {
      throw e
    }
  }
}

function mapDispatchToProps (dispatch) {
  return {
    fetchEntryPoints: cellIdString => {
      return dispatch(fetchEntryPoints.create({ cellIdString, payload: null }))
    },
    fetchMembers: cellIdString => {
      return dispatch(fetchMembers.create({ cellIdString, payload: null }))
    },
    fetchProjectMeta: cellIdString => {
      return dispatch(fetchProjectMeta.create({ cellIdString, payload: null }))
    },
    createProject: async (agentAddress, project, passphrase) => {
      // matches the createProjectMeta fn and type signature
      const projectMeta = {
        ...project, // name and image
        passphrase,
        creator_address: agentAddress,
        created_at: Date.now(),
      }
      await createProject(passphrase, projectMeta, agentAddress, dispatch)
    },
    joinProject: passphrase => joinProject(passphrase, dispatch),
  }
}

function mapStateToProps (state) {
  return {
    agentAddress: state.agentAddress,
    cells: state.cells.projects,
    projects: Object.keys(state.projects.projectMeta).map(cellId => {
      const project = state.projects.projectMeta[cellId]
      const members = state.projects.members[cellId] || {}
      const memberProfiles = Object.keys(members).map(
        agentAddress => state.agents[agentAddress]
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
