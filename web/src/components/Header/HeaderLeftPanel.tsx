import React, { useRef, useState } from 'react'
import { NavLink, Route, useLocation, useRouteMatch } from 'react-router-dom'
import useOnClickOutside from 'use-onclickoutside'

import { WireRecord } from '../../api/hdkCrud'
import {
  AgentPubKeyB64,
  ActionHashB64,
  WithActionHash,
  CellIdString,
} from '../../types/shared'
import { ProjectMeta, Profile, EntryPoint, Outcome } from '../../types'

import ExportMenuItem from '../ExportMenuItem/ExportMenuItem.connector'
import Icon from '../Icon/Icon'
import { ENTRY_POINTS } from '../../searchParams'
import MembersIndicator from '../MembersIndicator/MembersIndicator'

// @ts-ignore
import DoorOpen from '../../images/door-open.svg'
import EntryPointPicker from '../EntryPointPicker/EntryPointPicker.connector'

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
  isExportOpen: boolean
  activeEntryPoints: {
    entryPoint: WithActionHash<EntryPoint>
    outcome: WithActionHash<Outcome>
  }[]
  openInviteMembersModal: () => void
  setShowProjectSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClickExport: () => void
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
}

const HeaderLeftPanel: React.FC<HeaderLeftPanelProps> = ({
  openInviteMembersModal,
  setShowProjectSettingsOpen,
  whoami,
  projectName,
  isExportOpen,
  onClickExport,
  activeEntryPoints,
  goToOutcome,
  members,
  presentMembers,
}) => {
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

  const ref = useRef()

  // map, table and priority view routes

  const projectPage = useRouteMatch<{ projectId: string }>(
    '/project/:projectId'
  )
  const projectId = projectPage ? projectPage.params.projectId : null

  // for entry points

  useOnClickOutside(ref, () => setOpenEntryPointPicker(false))
  const [openEntryPointPicker, setOpenEntryPointPicker] = useState(false)

  return (
    <div className="header-left-panel-rows">
      <div className="header-left-panel">
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

                  <Icon
                    name="door-open.svg"
                    size="view-mode"
                    className={`header-action-icon ${openEntryPointPicker ? 'active' : ''}`}
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

                  {/* Settings */}
                  <Icon
                    name="settings.svg"
                    withTooltip
                    tooltipText="Project Settings"
                    size="header"
                    onClick={() => setShowProjectSettingsOpen(true)}
                    className="header-action-icon"
                  />
                  {/* Export */}
                  <div className="export-wrapper">
                    <Icon
                      withTooltip
                      tooltipText="Export"
                      name="export.svg"
                      size="header"
                      className={`header-action-icon ${isExportOpen ? 'purple' : ''}`}
                      onClick={onClickExport}
                    />
                    {isExportOpen && (
                      <div className="export-list-wrapper">
                        <div>
                          <ExportMenuItem
                            type="json"
                            title="Export as JSON (Importable)"
                            download="acorn-project.json"
                          />
                        </div>
                        <div>
                          <ExportMenuItem
                            type="csv"
                            title="Export as CSV"
                            download="acorn-project.csv"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Team Members Indicator */}
            <MembersIndicator
              members={membersMinusMe}
              presentMembers={presentMembers}
              onClickInviteMember={openInviteMembersModal}
            />
          </Route>
        )}
      </div>
      {/* Second row of the header */}
      {/* for showing active entry points tabs */}
      {whoami && (
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
