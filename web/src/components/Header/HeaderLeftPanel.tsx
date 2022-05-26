import React, { useRef, useState } from 'react'
import { NavLink, Route, useLocation, useRouteMatch } from 'react-router-dom'

import ExportMenuItem from '../ExportMenuItem/ExportMenuItem.connector'
import Icon from '../Icon/Icon'
import {
  ProjectPriorityViewOnly,
  ProjectMapViewOnly,
} from '../ViewFilters/ViewFilters'
import { ENTRY_POINTS } from '../../searchParams'
import MembersIndicator from '../MembersIndicator/MembersIndicator'

// @ts-ignore
import DoorOpen from '../../images/door-open.svg'
import EntryPointPicker from '../EntryPointPicker/EntryPointPicker.connector'
import useOnClickOutside from 'use-onclickoutside'

function ActiveEntryPoint({
  entryPoint,
  activeEntryPointAddresses,
  goToOutcome,
}) {
  const location = useLocation()
  const entryPointsAbsentThisOne = activeEntryPointAddresses
    .filter((headerHash) => headerHash !== entryPoint.headerHash)
    .join(',')
  return (
    <div className="active-entry-point">
      <img src={DoorOpen} />
      {/* add title because text-overflow: ellipsis */}
      <div
        className="active-entry-point-content"
        title={entryPoint.content}
        onClick={() => goToOutcome(entryPoint.outcomeHeaderHash)}
      >
        {entryPoint.content}
      </div>
      {/* @ts-ignore */}
      <NavLink
        to={`${location.pathname}?${ENTRY_POINTS}=${entryPointsAbsentThisOne}`}
        className="active-entry-point-close"
      >
        {/* @ts-ignore */}
        <Icon name="x.svg" size="small" className="grey" />
      </NavLink>
    </div>
  )
}

function HeaderLeftPanel({
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
}) {
  const activeEntryPointAddresses = activeEntryPoints.map(
    (entryPoint) => entryPoint.headerHash
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
  const mapPage = useRouteMatch('/project/:projectId/map')

  // for entry points

  useOnClickOutside(ref, () => setOpenEntryPointPicker(false))
  const [openEntryPointPicker, setOpenEntryPointPicker] = useState(false)

  return (
    <>
      <div className="header-left-panel">
        {/* @ts-ignore */}
        {/* Acorn Logo */}
        <NavLink to="/" className="home-link logo">
          {/* @ts-ignore */}
          {/* <Icon name="acorn-logo-stroked.svg" className="not-hoverable" /> */}
          <p className="logo-name">acorn</p>
          <div className="logo-name-tag">alpha</div>
        </NavLink>

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
                    {/* @ts-ignore */}
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
                    {/* @ts-ignore */}
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
                    {/* @ts-ignore */}
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
                {/* @ts-ignore */}

                {/* Entry points */}
                <div className="header-left-panel-entry-points-button">
                  {/* @ts-ignore */}
                  <Icon
                    name="door-open.svg"
                    size="view-mode"
                    className={`${openEntryPointPicker ? 'active' : ''}`}
                    withTooltip
                    tooltipText="Entry Points"
                    onClick={() =>
                      setOpenEntryPointPicker(!openEntryPointPicker)
                    }
                  />
                  <EntryPointPicker
                    isOpen={openEntryPointPicker}
                    onClose={() => setOpenEntryPointPicker(false)}
                  />
                </div>

                {/* Settings */}
                {/* @ts-ignore */}
                <Icon
                  name="settings.svg"
                  withTooltip
                  tooltipText="Project Settings"
                  size="header"
                  onClick={() => setShowProjectSettingsOpen(true)}
                />

                <div className="export-wrapper">
                  <Icon
                    withTooltip
                    tooltipText="Export"
                    name="export.svg"
                    size="header"
                    className={isExportOpen ? 'purple' : ''}
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
            {activeEntryPoints.map((entryPoint) => (
              <ActiveEntryPoint
                key={entryPoint.headerHash}
                entryPoint={entryPoint}
                activeEntryPointAddresses={activeEntryPointAddresses}
                goToOutcome={goToOutcome}
              />
            ))}
          </div>
        </Route>
      )}
    </>
  )
}

export default HeaderLeftPanel
