import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import { NavLink } from 'react-router-dom'

import Icon from '../../components/Icon/Icon'
import DashboardEmptyState from '../../components/DashboardEmptyState/DashboardEmptyState'

import CreateProjectModal from '../../components/CreateProjectModal/CreateProjectModal'
import ImportProjectModal from '../../components/ImportProjectModal/ImportProjectModal'
import JoinProjectModal from '../../components/JoinProjectModal/JoinProjectModal'
// import new modals here

import {
  DashboardListProject,
  DashboardListProjectLoading,
} from './DashboardListProject'
import PendingProjects from '../../components/PendingProjects/PendingProjects'

import './Dashboard.scss'

export default function Dashboard({
  existingAgents,
  deactivateApp,
  agentAddress,
  profilesCellIdString,
  cells,
  projects,
  fetchEntryPointDetails,
  fetchMembers,
  fetchProjectMeta,
  createProject,
  joinProject,
  importProject,
  updateIsAvailable,
  setShowUpdatePromptModal,
  setShowInviteMembersModal,
  hideInviteMembersModal,
}) {
  // createdAt, name
  const [pendingProjects, setPendingProjects] = useState([])
  const [selectedSort, setSelectedSort] = useState('createdAt')
  const [showSortPicker, setShowSortPicker] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

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

  const onCreateProject = (project, passphrase) =>
    createProject(agentAddress, project, passphrase)

  const onJoinProject = (passphrase) => joinProject(passphrase)

  const onImportProject = (projectData, passphrase) =>
    importProject(
      existingAgents,
      agentAddress,
      projectData,
      passphrase,
      profilesCellIdString
    )

  const setSortBy = (sortBy) => () => {
    setSelectedSort(sortBy)
    setShowSortPicker(false)
  }

  let sortedProjects
  if (selectedSort === 'createdAt') {
    // sort most recent first, oldest last
    sortedProjects = projects.sort((a, b) => b.createdAt - a.createdAt)
  } else if (selectedSort === 'name') {
    // sort alphabetically ascending
    sortedProjects = projects.sort((a, b) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    })
  }

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
          <NavLink to="/dashboard" className="dashboard-left-menu-item">
            <Icon name="folder.svg" size="very-small" className="grey" />
            My Projects
          </NavLink>
          <NavLink
            to="/settings"
            className="dashboard-left-menu-item feature-in-development"
          >
            <Icon name="settings.svg" size="very-small" className="grey" />
            Settings
          </NavLink>
        </div>
        <div className="dashboard-my-projects">
          <div className="my-projects-heading">My Projects</div>
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
                <Icon
                  name="import.svg"
                  size="very-small"
                  className="black not-hoverable"
                />
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
                    updateIsAvailable={updateIsAvailable}
                    setShowUpdatePromptModal={setShowUpdatePromptModal}
                    key={'dlp-key' + project.cellId}
                    project={project}
                    setShowInviteMembersModal={setShowInviteMembersModal}
                    hideInviteMembersModal={hideInviteMembersModal}
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
      {/* add new modals here */}
    </>
  )
}
