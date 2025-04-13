import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './DashboardListProject.scss'
import { pickColorForString } from '../../styles'
import { ENTRY_POINTS, GO_TO_OUTCOME } from '../../searchParams'
import Icon from '../../components/Icon/Icon'
import AvatarsList from '../../components/AvatarsList/AvatarsList'
import { ProjectAggregated } from '../../types'
import Button from '../../components/Button/Button'
import { ModalState, OpenModal } from '../../context/ModalContexts'
import { isWeaveContext, WAL } from '@theweave/api'
import { getWeaveClient } from '../../hcWebsockets'
import { CellIdWrapper } from '../../domain/cellId'
import { decodeHashFromBase64, EntryHash } from '@holochain/client'
import { AssetMeta } from '../../hooks/useAttachments'
import { useProjectAttachments } from '../../hooks/useProjectAttachments'

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
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
  updateRequiredMoreInfoLink?: string
  syncingProjectContents?: boolean
}

const DashboardListProject: React.FC<DashboardListProjectProps> = ({
  project,
  updateRequiredMoreInfoLink,
  syncingProjectContents,
  setModalState,
}) => {
  // Use the project attachments hook
  const { attachmentsInfo } = useProjectAttachments({
    projectId: project.cellId,
  })
  
  const weaveClient = getWeaveClient()
  
  // Function to add project attachments
  const addAttachment = async () => {
    if (!weaveClient) return
    
    const cellIdWrapper = CellIdWrapper.fromCellIdString(project.cellId)
    const thisWal: WAL = {
      hrl: [
        cellIdWrapper.getDnaHash(),
        cellIdWrapper.getAgentPubKey(),
      ],
      context: 'project',
    }

    const wal = await weaveClient.assets.userSelectAsset()
    if (wal) {
      await weaveClient.assets.addAssetRelation(thisWal, wal)
    }
  }
  
  // Function to remove project attachments
  const removeAttachment = async (relationHash: EntryHash) => {
    if (!weaveClient) return
    console.log('Removing project attachment with relation hash:', relationHash)
    await weaveClient.assets.removeAssetRelation(relationHash)
  }
  const [showEntryPoints, setShowEntryPoints] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)

  const imageStyles = project.projectMeta.image
    ? { backgroundImage: `url(${project.projectMeta.image})` }
    : { backgroundColor: pickColorForString(project.projectMeta.name) }

  const projectInitials = project.projectMeta.name
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() : 'X'))
    .slice(0, 3)
  const weaveClient = getWeaveClient() // Get weaveClient once

  const copyWALToPocket = async () => {
    if (!weaveClient) {
      return
    }
    const cellIdWrapper = CellIdWrapper.fromCellIdString(project.cellId)
    const attachment: WAL = {
      hrl: [
        cellIdWrapper.getDnaHash(),
        decodeHashFromBase64(project.projectMeta.actionHash),
      ],
    }
    await weaveClient.assets.assetToPocket(attachment)
  }

  return (
    <div className="dashboard-list-project-wrapper">
      {/* when update is required to access the shared project */}
      {/* or when joined project's contents are still syncing */}
      {project.projectMeta.isMigrated && (
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
            {project.projectMeta.image ? '' : projectInitials}
          </div>
        </NavLink>
        <div className="dashboard-list-project-content">
          {/* Project name and link + update required button if applicable*/}
          <div className="dashboard-list-project-name-wrapper">
            <NavLink
              to={`/project/${project.cellId}/map`}
              className={`dashboard-list-project-name`}
            >
              {project.projectMeta.name}
            </NavLink>
            {/* Project Migrated button */}
            {project.projectMeta.isMigrated && (
              <div className="dashboard-list-project-update-button-wrapper">
                <Button
                  icon="arrow-circle-up.svg"
                  text={'Project Migrated'}
                  onClick={() => {
                    setModalState({
                      id: OpenModal.ProjectMigrated,
                      cellId: project.cellId,
                    })
                  }}
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
          {!syncingProjectContents && (
            <div className={`dashboard-list-project-member-count`}>
              {project.members.length} member
              {project.members.length > 1 ? 's' : ''}
            </div>
          )}
          {/* Syncing project contents indicator */}
          {syncingProjectContents && (
            <div className="dashboard-list-project-syncing-contents">
              <Icon name="refresh.svg" className="not-hoverable" size="small" />
              syncing project contents
            </div>
          )}
        </div>
        <div className="dashboard-list-project-members-settings">
          <div className="dashboard-list-project-members">
            <AvatarsList
              // showPresence
              // profilesPresent={project.presentMembers}
              size="small-medium"
              profiles={project.members}
              showInviteButton
              onClickButton={() => {
                setModalState({
                  id: OpenModal.InviteMembers,
                  passphrase: project.projectMeta.passphrase,
                })
              }}
            />
            {isWeaveContext() && (
              <Icon
                name="file-copy.svg"
                withTooltip
                tooltipText="Add Project to Pocket"
                size="header"
                onClick={copyWALToPocket}
                className="header-action-icon"
              />
            )}
          </div>

          {/* project item settings */}
          <div
            className="dashboard-list-project-settings-button"
            onClick={() => {
              setModalState({
                id: OpenModal.ProjectSettings,
                cellId: project.cellId,
              })
            }}
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

      {/* project attachments */}
      {isWeaveContext() && attachmentsInfo.length > 0 && (
        <div className="dashboard-list-project-attachments">
          <div className="dashboard-list-project-attachments-header">
            <div
              className="dashboard-list-project-attachment-button"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <Icon
                name="attachment.svg"
                size="small"
                className="grey not-clickable"
              />
              <div className="dashboard-list-project-attachment-button-text">
                {attachmentsInfo.length} attachment
                {attachmentsInfo.length === 1 ? '' : 's'}
              </div>
              <Icon
                name="chevron-down.svg"
                size="small"
                className={`grey ${showAttachments ? 'active' : ''}`}
              />
            </div>
            {/* Add Attachment Button */}
            <div
              className="dashboard-list-project-add-attachment-button"
              onClick={addAttachment}
            >
              <Icon
                name="plus.svg"
                size="small"
                className="grey"
                withTooltip
                tooltipText="Add Attachment"
              />
            </div>
          </div>
          {showAttachments && (
            <div className="dashboard-list-project-attachment-expanded">
              {attachmentsInfo.map((assetMeta) => {
                return (
                  <div
                    key={`attachment-${assetMeta.relationHash}`}
                    className="attachment-item"
                  >
                    <div
                      className="attachment-item-clickable-area"
                      onClick={async () => {
                        if (weaveClient) {
                          await weaveClient.openAsset(assetMeta.wal)
                        }
                      }}
                      title={`Open ${assetMeta.assetInfo.name} (${assetMeta.appletInfo.appletName})`}
                    >
                      <img
                        src={assetMeta.assetInfo.icon_src}
                        alt={`${assetMeta.assetInfo.name} icon`}
                        className="attachment-icon"
                      />
                      <div className="attachment-name">
                        {assetMeta.assetInfo.name}
                      </div>
                    </div>
                    <div
                      className="attachment-delete-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAttachment(assetMeta.relationHash)
                      }}
                    >
                      <Icon
                        name="delete-bin.svg"
                        size="small"
                        className="light-grey"
                        withTooltip
                        tooltipText="Remove Attachment"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
      {/* Add attachment button when there are no attachments yet */}
      {isWeaveContext() && attachmentsInfo.length === 0 && (
         <div className="dashboard-list-project-attachments">
           <div
              className="dashboard-list-project-add-attachment-button only"
              onClick={addAttachment}
            >
              <Icon
                name="plus.svg"
                size="small"
                className="grey"
                withTooltip
                tooltipText="Add Attachment"
              />
               <div className="dashboard-list-project-attachment-button-text">
                Add Attachment
              </div>
            </div>
         </div>
      )}
    </div>
  )
}

export { DashboardListProjectLoading, DashboardListProject }
