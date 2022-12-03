import React, { useState, useEffect, useContext } from 'react'
import { CSSTransition } from 'react-transition-group'

import Icon from '../../components/Icon/Icon'
import DashboardEmptyState from '../../components/DashboardEmptyState/DashboardEmptyState'

import CreateProjectModal from '../../components/CreateProjectModal/CreateProjectModal'
import ImportProjectModal from '../../components/ImportProjectModal/ImportProjectModal'
import JoinProjectModal from '../../components/JoinProjectModal/JoinProjectModal'
import ProjectSettingsModal from '../../components/ProjectSettingsModal/ProjectSettingsModal.connector'
// import new modals here

import {
  DashboardListProject,
  DashboardListProjectLoading,
} from './DashboardListProject'
import PendingProjects from '../../components/PendingProjects/PendingProjects'

import './Dashboard.scss'
import Typography from '../../components/Typography/Typography'
import { AgentPubKeyB64, CellIdString } from '../../types/shared'
import { ProjectAggregated } from '../../types'
import UpdateModalContext from '../../context/UpdateModalContext'

export type DashboardStateProps = {
  agentAddress: AgentPubKeyB64
  cells: CellIdString[]
  projects: Array<ProjectAggregated>
}

export type DashboardDispatchProps = {
  setActiveProject: (projectId: CellIdString) => void
  createProject: (
    agentAddress: AgentPubKeyB64,
    project: { name: string; image: string },
    passphrase: string
  ) => Promise<void>
  fetchMembers: (cellIdString: CellIdString) => Promise<void>
  fetchProjectMeta: (cellIdString: CellIdString) => Promise<void>
  fetchEntryPointDetails: (cellIdString: CellIdString) => Promise<void>
  joinProject: (passphrase: string) => Promise<boolean>
  deactivateApp: (appId: string, cellId: CellIdString) => Promise<void>
  importProject: (
    agentAddress: AgentPubKeyB64,
    projectData: any,
    passphrase: string
  ) => Promise<void>
  setShowInviteMembersModal: (passphrase: string) => void
}

export type DashboardProps = DashboardStateProps & DashboardDispatchProps

const Dashboard: React.FC<DashboardProps> = ({
  deactivateApp,
  agentAddress,
  cells,
  projects,
  setActiveProject,
  fetchEntryPointDetails,
  fetchMembers,
  fetchProjectMeta,
  createProject,
  joinProject,
  importProject,
  setShowInviteMembersModal,
}) => {
  const { setShowUpdateModal } = useContext(UpdateModalContext)

  // createdAt, name
  const [pendingProjects, setPendingProjects] = useState([])
  const [selectedSort, setSelectedSort] = useState('createdAt')
  const [showSortPicker, setShowSortPicker] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  // will be a CellIdString if not empty
  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState('')
  // add new modal state managers here

  // cells is an array of cellId strings
  useEffect(() => {
    cells.forEach((cellId) => {
      fetchProjectMeta(cellId).catch((e) => {
        // this means 'no project meta found'
        // so we add it to 'pending projects'
        // because it clearly hasn't synced yet
        setPendingProjects((pending) => {
          // only add it if it wasn't already in the list of pending projects
          if (!pending.includes(cellId)) {
            return pending.concat([cellId])
          } else {
            return pending
          }
        })
      })
      fetchMembers(cellId)
      fetchEntryPointDetails(cellId)
    })
  }, [JSON.stringify(cells)])

  const onCreateProject = (
    project: { name: string; image: string },
    passphrase: string
  ) => createProject(agentAddress, project, passphrase)

  const onJoinProject = (passphrase: string) => joinProject(passphrase)

  const onImportProject = (projectData: any, passphrase: string) =>
    importProject(agentAddress, projectData, passphrase)

  const setSortBy = (sortBy) => () => {
    setSelectedSort(sortBy)
    setShowSortPicker(false)
  }

  let sortedProjects: Array<ProjectAggregated>
  if (selectedSort === 'createdAt') {
    // sort most recent first, oldest last
    sortedProjects = projects.sort((a, b) => b.createdAt - a.createdAt)
  } else if (selectedSort === 'name') {
    // sort alphabetically ascending
    sortedProjects = projects.sort((a, b) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    })
  }

  const projectSettingsProject = showProjectSettingsModal
    ? sortedProjects.find((project) => {
        return project.cellId === showProjectSettingsModal
      })
    : null

  // being in 'projects' means succesful fetchProjectMeta
  // being in 'pendingProjects' means unsuccessful fetchProjectMeta
  // that's why the combination of the two means that all calls to holochain
  // to check have completed
  const hasFetchedForAllProjects =
    cells.length === projects.length + pendingProjects.length

  return (
    <>
      <div className="dashboard-background">
        <div className="dashboard-left-menu">
          {/* TODO: decide if we want to have this menu on Dashboard page */}
          {/* <NavLink to="/dashboard" className="dashboard-left-menu-item">
            <Icon name="folder.svg" size="very-small" className="grey" />
            My Projects
          </NavLink>
          <NavLink
            to="/settings"
            className="dashboard-left-menu-item feature-in-development"
          >
            <Icon name="settings.svg" size="very-small" className="grey" />
            Settings
          </NavLink> */}
        </div>
        <div className="dashboard-my-projects">
          <div className="my-projects-heading">
            <Typography style="h1">My Projects</Typography>{' '}
          </div>
          {/* dashboard header */}
          <div className="my-projects-header">
            <div className="my-projects-header-buttons">
              <div
                className="my-projects-button create-project-button"
                onClick={() => setShowCreateModal(true)}
              >
                Create a Project
              </div>
              <div
                className="my-projects-button"
                onClick={() => setShowJoinModal(true)}
              >
                Join a Project
              </div>
              <div
                className="my-projects-button"
                onClick={() => setShowImportModal(true)}
              >
                <div>Import a Project</div>
              </div>
            </div>
            <div className="my-projects-sorting">
              <div>Sort by</div>
              <div
                className="my-projects-sorting-selected"
                onClick={() => setShowSortPicker(!showSortPicker)}
              >
                {selectedSort === 'createdAt' && 'Last Created'}
                {selectedSort === 'name' && 'Name'}
                <Icon
                  name="chevron-down.svg"
                  size="very-small"
                  className={`grey ${showSortPicker ? 'active' : ''}`}
                />
              </div>
              <CSSTransition
                in={showSortPicker}
                timeout={100}
                unmountOnExit
                classNames="my-projects-sorting-select"
              >
                <ul className="my-projects-sorting-select">
                  <li onClick={setSortBy('createdAt')}>Last Created</li>
                  <li onClick={setSortBy('name')}>Name</li>
                </ul>
              </CSSTransition>
            </div>
          </div>
          <div className="my-projects-content">
            {pendingProjects.length > 0 && (
              <PendingProjects
                pendingProjects={pendingProjects}
                fetchProjectMeta={fetchProjectMeta}
                setPendingProjects={setPendingProjects}
                deactivateApp={deactivateApp}
              />
            )}
            {!hasFetchedForAllProjects &&
              cells.map((cellId) => (
                <DashboardListProjectLoading key={'dlpl-key' + cellId} />
              ))}
            {hasFetchedForAllProjects &&
              sortedProjects.map((project) => {
                return (
                  <DashboardListProject
                    key={'dlp-key' + project.cellId}
                    project={project}
                    setShowInviteMembersModal={setShowInviteMembersModal}
                    openProjectSettingsModal={(projectCellId: CellIdString) =>
                      setShowProjectSettingsModal(projectCellId)
                    }
                    onClickUpdate={() => {
                      setShowUpdateModal(true)
                    }}
                  />
                )
              })}
            {hasFetchedForAllProjects && projects.length === 0 && (
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
      <ImportProjectModal
        onImportProject={onImportProject}
        showModal={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
      <ProjectSettingsModal
        showModal={showProjectSettingsModal !== ''}
        onClose={() => setShowProjectSettingsModal('')}
        project={projectSettingsProject}
        cellIdString={showProjectSettingsModal}
        openInviteMembersModal={() => {
          setShowInviteMembersModal(projectSettingsProject.passphrase)
        }}
      />
      {/* add new modals here */}
    </>
  )
}

export default Dashboard
