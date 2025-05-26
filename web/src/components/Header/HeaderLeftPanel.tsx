import React, { useContext, useEffect, useRef, useState } from 'react'
import { NavLink, Route, useLocation, useRouteMatch } from 'react-router-dom'
import useOnClickOutside from 'use-onclickoutside'

import { WireRecord } from '../../api/hdkCrud'
import {
  AgentPubKeyB64,
  ActionHashB64,
  WithActionHash,
} from '../../types/shared'
import { Profile, EntryPoint, Outcome, ProjectMeta } from '../../types'

import ExportMenuItem from '../ExportMenuItem/ExportMenuItem.connector'
import Icon from '../Icon/Icon'
import { ENTRY_POINTS } from '../../searchParams'
import MembersIndicator from '../MembersIndicator/MembersIndicator'

import EntryPointPicker from '../EntryPointPicker/EntryPointPicker.connector'
import AttachmentListItem from '../ExpandedViewMode/EVMiddleColumn/TabContent/EvAttachments/AttachmentListItem' // Import the list item

//images
// @ts-ignore
import triangleTopWhite from '../../images/triangle-top-white.svg'
// @ts-ignore
import DoorOpen from '../../images/door-open.svg'
import { ModalState, OpenModal } from '../../context/ModalContexts'
import { getCurrentDateFormatted } from '../../utils'
import useFileDownloaded from '../../hooks/useFileDownloaded'
import ToastContext, { ShowToast } from '../../context/ToastContext'
import { getWeaveClient } from '../../hcWebsockets' // Keep for copyWALToPocket
import { decodeHashFromBase64, EntryHash } from '@holochain/client' // Keep EntryHash for removeAttachment prop type
import { isWeaveContext, WAL } from '@theweave/api' // Keep WAL for openAsset prop type
import { ProjectAssetMeta } from '../../hooks/useProjectAttachments' // Import type for props
import { CellIdWrapper } from '../../domain/cellId'

function ActiveEntryPoint({
  entryPoint,
  outcome,
  activeEntryPointAddresses,
  goToOutcome,
}) {
  const location = useLocation()
  const entryPointsAbsentThisOne = activeEntryPointAddresses
    .filter((actionHash) => actionHash !== entryPoint.actionHash)
    .join(',')
  return (
    <div className="active-entry-point">
      <img src={DoorOpen} />
      {/* add title because text-overflow: ellipsis */}
      <div
        className="active-entry-point-content"
        title={outcome.content}
        onClick={() => goToOutcome(entryPoint.outcomeActionHash)}
      >
        {outcome.content}
      </div>
      <NavLink
        to={`${location.pathname}?${ENTRY_POINTS}=${entryPointsAbsentThisOne}`}
        className="active-entry-point-close"
      >
        <Icon name="x.svg" size="small" className="grey" />
      </NavLink>
    </div>
  )
}

export type HeaderLeftPanelProps = {
  whoami: WireRecord<Profile>
  members: Profile[]
  presentMembers: AgentPubKeyB64[]
  projectName: string
  projectPassphrase: string
  activeEntryPoints: {
    entryPoint: WithActionHash<EntryPoint>
    outcome: WithActionHash<Outcome>
  }[]
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
  projectMeta: WithActionHash<ProjectMeta>
  // Add new props for attachments
  attachmentsInfo: ProjectAssetMeta[]
  handleAddAttachment: () => Promise<void>
  handleRemoveAttachment: (relationHash: EntryHash) => Promise<void>
  openAsset: (wal: WAL) => Promise<void>
  // New prop to control rendering
  showOnlyProjectSection?: boolean
}

const HeaderLeftPanel: React.FC<HeaderLeftPanelProps> = ({
  setModalState,
  whoami,
  projectName,
  projectPassphrase,
  activeEntryPoints,
  goToOutcome,
  members,
  presentMembers,
  projectMeta,
  // Destructure new props
  attachmentsInfo,
  handleAddAttachment,
  handleRemoveAttachment,
  openAsset,
  showOnlyProjectSection = false,
}) => {
  const entryPointsRef = useRef<HTMLDivElement>(null)
  const exportProjectRef = useRef<HTMLDivElement>(null)
  const attachmentsRef = useRef<HTMLDivElement>(null) // Ref for attachments dropdown
  const { setToastState } = useContext(ToastContext)
  const { fileDownloaded, setFileDownloaded } = useFileDownloaded()
  const [openEntryPointPicker, setOpenEntryPointPicker] = useState(false)
  const [openAttachmentsPicker, setOpenAttachmentsPicker] = useState(false) // State for attachments dropdown
  const [isExportOpen, setIsExportOpen] = useState(false)
  useOnClickOutside(entryPointsRef, () => setOpenEntryPointPicker(false))
  useOnClickOutside(exportProjectRef, () => setIsExportOpen(false))
  useOnClickOutside(attachmentsRef, () => setOpenAttachmentsPicker(false)) // Close attachments dropdown on click outside
  useEffect(() => {
    if (fileDownloaded) {
      setFileDownloaded(false)
      setToastState({
        id: ShowToast.Yes,
        text: 'Project Exported',
        type: 'confirmation',
      })
    }
  }, [fileDownloaded, setFileDownloaded, setToastState])

  const activeEntryPointAddresses = activeEntryPoints.map(
    ({ entryPoint }) => entryPoint.actionHash
  )
  // in this context, we'd want to display members on the project,
  // except your own self
  // since your own avatar and status is already showing
  // on top right side of the screen all the time!
  const membersMinusMe = whoami
    ? members.filter(
        (member) => member.agentPubKey !== whoami.entry.agentPubKey
      )
    : []

  const projectPage = useRouteMatch<{ projectId: string }>(
    '/project/:projectId'
  )
  const projectId = projectPage ? projectPage.params.projectId : null

  // replace spaces with dashes for project name
  // add in the export date like 2023-12-31 and make it based on the
  // timezone of the user
  const projectNameForExport = `${projectName.replace(
    /\s/g,
    '-'
  )}-${getCurrentDateFormatted()}`

  const copyWALToPocket = async () => {
    const weaveClient = getWeaveClient()
    if (!weaveClient) {
      return
    }
    const cellIdWrapper = CellIdWrapper.fromCellIdString(projectId)
    const attachment: WAL = {
      hrl: [
        cellIdWrapper.getDnaHash(),
        decodeHashFromBase64(projectMeta.actionHash),
      ],
    }
    await weaveClient.assets.assetToPocket(attachment)
    await weaveClient.assets.assetToPocket(attachment)
  }

  return (
    <div className="header-left-panel-rows">
      <div className="header-left-panel">
        {/* Only show logo if not in showOnlyProjectSection mode */}
        {!showOnlyProjectSection && (
          <>
            {/* Acorn Logo - non link */}
            {!whoami && (
              <div className="logo non-link">
                <img src="images/acorn-alpha-logo.png" className="logo-image" />
              </div>
            )}

            {/* Acorn Logo - linked */}
            {whoami && (
              <NavLink to="/" className="logo">
                <img src="images/acorn-alpha-logo.png" className="logo-image" />
              </NavLink>
            )}
          </>
        )}

        {whoami && (
          <Route path="/project">
            <div className="current-project-wrapper">
              {/* Project Name and Settings */}
              <div className="current-project-content">
                <div className="top-left-panel-view-modes">
                  {/* map view button */}
                  <NavLink
                    to={`/project/${projectId}/map`}
                    activeClassName="view-mode-active"
                    className="view-mode-link"
                  >
                    <Icon
                      name="map.svg"
                      size="view-mode"
                      className="light-grey"
                      withTooltip
                      tooltipText="Map View"
                    />
                  </NavLink>

                  {/* table view button */}
                  <NavLink
                    to={`/project/${projectId}/table`}
                    activeClassName="view-mode-active"
                    className="view-mode-link"
                  >
                    <Icon
                      name="table.svg"
                      size="view-mode"
                      className="light-grey"
                      withTooltip
                      tooltipText="Table View"
                    />
                  </NavLink>

                  {/* priority view button */}
                  <NavLink
                    to={`/project/${projectId}/priority`}
                    activeClassName="view-mode-active"
                    className="view-mode-link"
                  >
                    <Icon
                      name="sort-asc.svg"
                      size="view-mode"
                      className="light-grey"
                      withTooltip
                      tooltipText="Priority View"
                    />
                  </NavLink>
                  {/* <Icon name='timeline.svg' className='grey' size='view-mode' /> */}
                </div>
                <div className="current-project-name">{projectName}</div>
                <div className="divider-line"></div>

                <div className="current-project-tools">
                  {/* Entry points */}
                  <div
                    className="entry-points-button-wrapper"
                    ref={entryPointsRef}
                  >
                    <Icon
                      name="door-open.svg"
                      size="view-mode"
                      className={`header-action-icon ${
                        openEntryPointPicker ? 'active' : ''
                      }`}
                      withTooltip
                      tooltipText="Entry Points"
                      onClick={() =>
                        setOpenEntryPointPicker(!openEntryPointPicker)
                      }
                    />
                    {/* If entry point picker is open */}
                    <EntryPointPicker
                      isOpen={openEntryPointPicker}
                      onClose={() => setOpenEntryPointPicker(false)}
                    />
                  </div>

                  {/* Attachments */}
                  {isWeaveContext() && (
                    <div
                      className="attachments-button-wrapper"
                      ref={attachmentsRef}
                    >
                      <Icon
                        name="attachment.svg"
                        size="view-mode" // Match entry points icon size
                        className={`header-action-icon ${
                          openAttachmentsPicker ? 'active' : ''
                        }`}
                        withTooltip
                        tooltipText="Attachments"
                        onClick={() =>
                          setOpenAttachmentsPicker(!openAttachmentsPicker)
                        }
                      />
                      {/* Attachments Picker Dropdown */}
                      {openAttachmentsPicker && (
                        <div className="attachments-picker">
                          <div className="attachments-picker-header">
                            <div className="attachments-picker-title">
                              Attachments ({attachmentsInfo.length})
                            </div>
                            <Icon
                              name="plus.svg"
                              size="small"
                              className="grey"
                              withTooltip
                              tooltipText="Add Attachment"
                              onClick={handleAddAttachment}
                            />
                          </div>
                          <div className="attachments-picker-list">
                            {attachmentsInfo.length === 0 && (
                              <div className="attachments-picker-empty">
                                No attachments yet.
                              </div>
                            )}
                            {attachmentsInfo.map((assetMeta) => (
                              <AttachmentListItem
                                key={`attachment-${assetMeta.relationHash}`}
                                assetMeta={assetMeta}
                                openAsset={openAsset}
                                removeAttachment={handleRemoveAttachment}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Settings */}
                  <Icon
                    name="settings.svg"
                    withTooltip
                    tooltipText="Project Settings"
                    size="header"
                    onClick={() =>
                      setModalState({
                        id: OpenModal.ProjectSettings,
                        cellId: projectId,
                      })
                    }
                    className="header-action-icon"
                  />
                  {/* Export */}
                  <div className="export-wrapper" ref={exportProjectRef}>
                    <Icon
                      withTooltip
                      tooltipText="Export"
                      name="export.svg"
                      size="header"
                      className={`header-action-icon ${
                        isExportOpen ? 'purple' : ''
                      }`}
                      onClick={() => setIsExportOpen(!isExportOpen)}
                    />
                    {isExportOpen && (
                      <div className="export-list-wrapper">
                        {/* Top Triangle */}
                        <img
                          className="triangle-top-white"
                          src={triangleTopWhite}
                        />
                        <ExportMenuItem
                          type="json"
                          title="Export as JSON (Importable)"
                          downloadFilename={`${projectNameForExport}.json`}
                          onClick={() => {
                            setIsExportOpen(false)
                          }}
                        />
                        <ExportMenuItem
                          type="csv"
                          title="Export as CSV"
                          downloadFilename={`${projectNameForExport}.csv`}
                          onClick={() => {
                            setIsExportOpen(false)
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {/* Add to Pocket */}
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
              </div>
            </div>
            {/* Team Members Indicator */}
            <MembersIndicator
              members={membersMinusMe}
              presentMembers={presentMembers}
              onClickInviteMember={() => {
                setModalState({
                  id: OpenModal.InviteMembers,
                  passphrase: projectPassphrase,
                })
              }}
            />
          </Route>
        )}
      </div>
      {/* Second row of the header */}
      {/* for showing active entry points tabs */}
      {whoami && !showOnlyProjectSection && (
        <Route path="/project">
          {/* Current Entry Points Tab */}
          <div className="header-left-panel second-row">
            {activeEntryPoints.map(({ entryPoint, outcome }) => (
              <ActiveEntryPoint
                key={entryPoint.actionHash}
                entryPoint={entryPoint}
                outcome={outcome}
                activeEntryPointAddresses={activeEntryPointAddresses}
                goToOutcome={goToOutcome}
              />
            ))}
          </div>
        </Route>
      )}
    </div>
  )
}

export default HeaderLeftPanel
