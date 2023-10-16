import React, { useState, useContext } from 'react'
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
import { ActionHashB64, AgentPubKeyB64, CellIdString } from '../../types/shared'
import { ProjectAggregated, ProjectMeta } from '../../types'
import UpdateModalContext from '../../context/UpdateModalContext'
import ProjectMigratedModal from '../../components/ProjectMigratedModal/ProjectMigratedModal'
import usePendingProjects from '../../hooks/usePendingProjects'

export type DashboardStateProps = {
  agentAddress: AgentPubKeyB64
  projectCellIdStrings: CellIdString[]
  projects: ProjectAggregated[]
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
  updateProjectMeta: (
    projectMeta: ProjectMeta,
    actionHash: ActionHashB64,
    cellIdString: CellIdString
  ) => Promise<void>
  fetchEntryPointDetails: (cellIdString: CellIdString) => Promise<void>
  joinProject: (passphrase: string) => Promise<CellIdString>
  uninstallProject: (appId: string, cellId: CellIdString) => Promise<void>
  importProject: (
    cellIdString: CellIdString,
    agentAddress: AgentPubKeyB64,
    projectData: any,
    passphrase: string
  ) => Promise<void>
  setShowInviteMembersModal: (passphrase: string) => void
}

export type DashboardProps = DashboardStateProps & DashboardDispatchProps

const Dashboard: React.FC<DashboardProps> = ({
  uninstallProject,
  agentAddress,
  projectCellIdStrings,
  projects,
  setActiveProject,
  fetchEntryPointDetails,
  fetchMembers,
  fetchProjectMeta,
  updateProjectMeta,
  createProject,
  joinProject,
  importProject,
  setShowInviteMembersModal,
}) => {
  const { setShowUpdateModal } = useContext(UpdateModalContext)

  const [selectedSort, setSelectedSort] = useState('createdAt')
  const [showSortPicker, setShowSortPicker] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  // will be a CellIdString if not empty
  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState('')
  const [showProjectMigratedModal, setShowProjectMigratedModal] = useState('')
  // add new modal state managers here

  // calling this triggers the fetchProjectMeta for each project
  const { pendingProjects, setPendingProjects } = usePendingProjects(
    projectCellIdStrings,
    fetchProjectMeta,
    fetchEntryPointDetails,
    fetchMembers
  )

  const onCreateProject = (
    project: { name: string; image: string },
    passphrase: string
  ) => createProject(agentAddress, project, passphrase)

  const onJoinProject = (passphrase: string) => joinProject(passphrase)

  const onImportProject = (
    cellIdString: CellIdString,
    projectData: any,
    passphrase: string
  ) => importProject(cellIdString, agentAddress, projectData, passphrase)

  const setSortBy = (sortBy) => () => {
    setSelectedSort(sortBy)
    setShowSortPicker(false)
  }

  let sortedProjects: ProjectAggregated[]
  if (selectedSort === 'createdAt') {
    // sort most recent first, oldest last
    sortedProjects = projects.sort(
      (a, b) => b.projectMeta.createdAt - a.projectMeta.createdAt
    )
  } else if (selectedSort === 'name') {
    // sort alphabetically ascending
    sortedProjects = projects.sort((a, b) => {
      return a.projectMeta.name.toLowerCase() > b.projectMeta.name.toLowerCase()
        ? 1
        : -1
    })
  }

  const projectSettingsProject = showProjectSettingsModal
    ? sortedProjects.find((project) => {
        return project.cellId === showProjectSettingsModal
      })
    : undefined
  const projectMigratedProject = showProjectMigratedModal
    ? sortedProjects.find((project) => {
        return project.cellId === showProjectMigratedModal
      })
    : undefined

  const hasFetchedForAllProjects =
    projectCellIdStrings.length === Object.keys(pendingProjects).length

  const joinedProjectsSecrets = Object.values(pendingProjects).map(projectInfo => {
    return projectInfo.passphrase
  })
  console.log('joinedProjectsSecrets', joinedProjectsSecrets)

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
            <PendingProjects
              pendingProjects={pendingProjects}
              setPendingProjects={setPendingProjects}
              uninstallProject={uninstallProject}
            />
            {!hasFetchedForAllProjects &&
              projectCellIdStrings.map((cellId) => (
                <DashboardListProjectLoading key={'dlpl-key' + cellId} />
              ))}
            {hasFetchedForAllProjects &&
              sortedProjects.map((project) => {
                const projectInfo = pendingProjects[project.cellId]
                return (
                  <DashboardListProject
                    key={'dlp-key' + project.cellId}
                    project={project}
                    setShowInviteMembersModal={setShowInviteMembersModal}
                    openProjectSettingsModal={() =>
                      setShowProjectSettingsModal(project.cellId)
                    }
                    onClickProjectMigrated={() => {
                      setShowProjectMigratedModal(project.cellId)
                    }}
                    updateRequiredMoreInfoLink={
                      'https://docs.acorn.software/about-acorn/updating-the-app'
                    }
                    syncingProjectContents={projectInfo.isGossiping}
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
        joinedProjectsSecrets={joinedProjectsSecrets}
      />
      <ImportProjectModal
        onImportProject={onImportProject}
        uninstallProject={uninstallProject}
        showModal={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
      <ProjectSettingsModal
        showModal={showProjectSettingsModal !== ''}
        onClose={() => setShowProjectSettingsModal('')}
        project={projectSettingsProject?.projectMeta}
        cellIdString={showProjectSettingsModal}
        openInviteMembersModal={() => {
          setShowInviteMembersModal(
            projectSettingsProject.projectMeta.passphrase
          )
        }}
      />
      <ProjectMigratedModal
        showModal={showProjectMigratedModal !== ''}
        onClose={() => setShowProjectMigratedModal('')}
        project={projectMigratedProject?.projectMeta}
        cellIdString={showProjectMigratedModal}
        onClickOverride={() => {
          setShowProjectMigratedModal('')
          updateProjectMeta(
            {
              ...projectMigratedProject.projectMeta,
              isMigrated: null,
            },
            projectMigratedProject.projectMeta.actionHash,
            projectMigratedProject.cellId
          )
        }}
        onClickUpdateNow={() => {
          setShowProjectMigratedModal('')
          setShowUpdateModal(true)
        }}
      />
      {/* add new modals here */}
    </>
  )
}

export default Dashboard
