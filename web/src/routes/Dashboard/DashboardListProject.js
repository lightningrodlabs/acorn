import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

import Avatar from '../../components/Avatar/Avatar'
import Icon from '../../components/Icon/Icon'

import './DashboardListProject.scss'

import { pickColorForString } from '../../styles'

import ProjectSettingsModal from '../../components/ProjectSettingsModal/ProjectSettingsModal.connector'
import { ENTRY_POINTS, GO_TO_OUTCOME } from '../../searchParams'

function DashboardListProjectLoading() {
  return (
    <>
      <div className="dashboard-list-project-wrapper">
        <div className="dashboard-list-project">
          <NavLink to={'/dashboard'} className="dashboard-list-project-image">
            <div
              className="dashboard-list-project-image-bg"
              style={{ backgroundColor: '#f1f1f1' }}
            ></div>
          </NavLink>
          <div className="dashboard-list-project-content">
            <NavLink
              to={'/dashboard'}
              className={`dashboard-list-project-name placeholder`}
            ></NavLink>
            <div
              className={`dashboard-list-project-member-count placeholder`}
            ></div>
          </div>
          <div className="dashboard-list-project-members-settings"></div>
        </div>
      </div>
    </>
  )
}

function DashboardListProject({
  project,
  setShowInviteMembersModal,
  hideInviteMembersModal,
  updateIsAvailable,
  setShowUpdatePromptModal,
  goToOutcome
}) {
  const [showEntryPoints, setShowEntryPoints] = useState(false)

  const imageStyles = project.image
    ? { backgroundImage: `url(${project.image})` }
    : { backgroundColor: pickColorForString(project.name) }

  const projectInitials = project.name
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() : 'X'))
    .slice(0, 3)

  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState(
    false
  )

  return (
    <div className="dashboard-list-project-wrapper">
      {updateIsAvailable && (
        <>
          <div
            className="update-required-button"
            onClick={() => setShowUpdatePromptModal(true)}
          >
            Update required to access
          </div>
          <div className="unavailable-layer"></div>
        </>
      )}
      <div className="dashboard-list-project">
        <NavLink
          to={`/project/${project.cellId}`}
          className="dashboard-list-project-image"
        >
          <div className="dashboard-list-project-image-bg" style={imageStyles}>
            {project.image ? '' : projectInitials}
          </div>
        </NavLink>
        <div className="dashboard-list-project-content">
          <NavLink
            to={`/project/${project.cellId}`}
            className={`dashboard-list-project-name`}
          >
            {project.name}
          </NavLink>

          <div className={`dashboard-list-project-member-count`}>
            {project.members.length} member
            {project.members.length > 1 ? 's' : ''}
          </div>
        </div>
        <div className="dashboard-list-project-members-settings">
          <div className="dashboard-list-project-members">
            <div className="dashboard-list-project-member-list">
              {project.members.map(
                (member) =>
                  member && (
                    // title={`${member.first_name} ${member.last_name}`}
                    <div key={member.headerHash}  >
                      <Avatar
                        first_name={member.first_name}
                        last_name={member.last_name}
                        avatar_url={member.avatar_url}
                        imported={member.is_imported}
                        medium
                        withStatus
                        withWhiteBorder
                        selfAssignedStatus={member.status}
                        withTooltip
                        tooltipText={`${member.first_name} ${member.last_name}`}
                      />
                    </div>
                  )
              )}
            </div>
            {/* Invite Members */}
            <div className="dashboard-invite-members-button-wrapper">
              <div
                className="dashboard-invite-members-button"
                onClick={() => setShowInviteMembersModal(project.passphrase)}
              >
                <Icon
                  withTooltip
                  tooltipText="Invite Members"
                  name="user-plus.svg"
                  size="small"
                  className="grey"
                />
              </div>
            </div>
          </div>
          {/* project item settings */}
          <div
            className="dashboard-list-project-settings-button"
            onClick={() => setShowProjectSettingsModal(true)}
          >
            <Icon name="dots-horizontal.svg" size="medium" className="light-grey" />
          </div>

        </div>
      </div>

      {/* project entry points */}

      <div className="dashboard-list-project-entry-points">
        {/* only allow expanding entry points list if there are some */}
        {project.entryPoints.length > 0 && (
          <>
            <div
              className="dashboard-list-project-entry-point-button"
              onClick={() => setShowEntryPoints(!showEntryPoints)}
            >
              <Icon
                name='door-open.svg'
                size='small'
                className='grey not-clickable'

              />
              <div className="dashboard-list-project-entry-point-button-text">
                {project.entryPoints.length} entry point
                {project.entryPoints.length === 1 ? '' : 's'}
              </div>
              <Icon
                name="chevron-down.svg"
                size="small"
                className={`grey ${showEntryPoints ? 'active' : ''}`}
              />
            </div>
          </>)}
        {showEntryPoints && (
          <div className="dashboard-list-project-entry-point-expanded">
            {project.entryPoints.map((entryPoint) => {
              const dotStyle = {
                backgroundColor: entryPoint.color,
              }
              return (
                <NavLink
                  key={`entry-point-${entryPoint.headerHash}`}
                  to={`/project/${project.cellId}/map?${ENTRY_POINTS}=${entryPoint.headerHash}&${GO_TO_OUTCOME}=${entryPoint.outcome_address}`}
                  className="entry-point-item"
                >
                  <div className="entry-point-color-dot" style={dotStyle} />
                  <div className="entry-point-name">{entryPoint.content}</div>
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
      <ProjectSettingsModal
        showModal={showProjectSettingsModal}
        onClose={() => setShowProjectSettingsModal(false)}
        project={project}
        cellIdString={project.cellId}
      />
    </div>
  )
}

export { DashboardListProjectLoading, DashboardListProject }
