import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

import Icon from '../../components/Icon/Icon'

import './DashboardListProject.scss'

import { pickColorForString } from '../../styles'

import { ENTRY_POINTS, GO_TO_OUTCOME } from '../../searchParams'
import AvatarsList from '../../components/AvatarsList/AvatarsList'
import { ProjectAggregated } from '../../types'
import Button from '../../components/Button/Button'
import { CellIdString } from '../../types/shared'

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

export type DashboardListProjectProps = {
  project: ProjectAggregated
  setShowInviteMembersModal: (passphrase: string) => void
  openProjectSettingsModal: (projectCellId: CellIdString) => void
  onClickUpdate?: () => void
  updateRequiredMoreInfoLink?: string
}

const DashboardListProject: React.FC<DashboardListProjectProps> = ({
  project,
  setShowInviteMembersModal,
  openProjectSettingsModal,
  onClickUpdate,
  updateRequiredMoreInfoLink,
}) => {
  const [showEntryPoints, setShowEntryPoints] = useState(false)

  const imageStyles = project.image
    ? { backgroundImage: `url(${project.image})` }
    : { backgroundColor: pickColorForString(project.name) }

  const projectInitials = project.name
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() : 'X'))
    .slice(0, 3)

  const openInviteMembersModal = () => {
    setShowInviteMembersModal(project.passphrase)
  }

  return (
    <div className="dashboard-list-project-wrapper">
      {/* when update is required to access the shared project */}
      {project.isMigrated && (
        <>
          <div className="project-access-blocked-layer"></div>
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
          {/* Project name and link + update required button if applicable*/}
          <div className="dashboard-list-project-name-wrapper">
            <NavLink
              to={`/project/${project.cellId}/map`}
              className={`dashboard-list-project-name`}
            >
              {project.name}
            </NavLink>
            {/* Update to Access button */}
            {project.isMigrated && (
              <div className="dashboard-list-project-update-button-wrapper">
                <Button
                  icon="arrow-circle-up.svg"
                  text={'Update to Access'}
                  onClick={onClickUpdate}
                />
                <div className="more-info-wrapper">
                  <div>
                    <a href={updateRequiredMoreInfoLink} target="_blank">
                      <Icon
                        name="info.svg"
                        className="light-grey"
                        size="small"
                      />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project member count */}
          <div className={`dashboard-list-project-member-count`}>
            {project.members.length} member
            {project.members.length > 1 ? 's' : ''}
          </div>
        </div>
        <div className="dashboard-list-project-members-settings">
          <div className="dashboard-list-project-members">
            <AvatarsList
              // showPresence
              // profilesPresent={project.presentMembers}
              size="small-medium"
              profiles={project.members}
              showInviteButton
              onClickButton={openInviteMembersModal}
            />
          </div>

          {/* project item settings */}
          <div
            className="dashboard-list-project-settings-button"
            onClick={() => openProjectSettingsModal(project.cellId)}
          >
            <Icon
              name="dots-horizontal.svg"
              size="medium"
              className="light-grey"
            />
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
                name="door-open.svg"
                size="small"
                className="grey not-clickable"
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
          </>
        )}
        {showEntryPoints && (
          <div className="dashboard-list-project-entry-point-expanded">
            {project.entryPoints.map(({ entryPoint, outcome }) => {
              const dotStyle = {
                backgroundColor: entryPoint.color,
              }
              return (
                <NavLink
                  key={`entry-point-${entryPoint.actionHash}`}
                  to={`/project/${project.cellId}/map?${ENTRY_POINTS}=${entryPoint.actionHash}&${GO_TO_OUTCOME}=${entryPoint.outcomeActionHash}`}
                  className="entry-point-item"
                >
                  <div className="entry-point-color-dot" style={dotStyle} />
                  <div className="entry-point-name">{outcome.content}</div>
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export { DashboardListProjectLoading, DashboardListProject }
