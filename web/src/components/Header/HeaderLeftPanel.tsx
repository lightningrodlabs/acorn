import React from 'react'
import { NavLink, Route, useLocation } from 'react-router-dom'

import ExportMenuItem from '../ExportMenuItem/ExportMenuItem'
import Icon from '../Icon/Icon'
import {
  ProjectPriorityViewOnly,
  ProjectMapViewOnly,
} from '../ViewFilters/ViewFilters'
import { ENTRY_POINTS } from '../../searchParams'
import MembersIndicator from '../MembersIndicator/MembersIndicator'

function ActiveEntryPoint({ entryPoint, activeEntryPointAddresses, goToGoal }) {
  const location = useLocation()
  const entryPointsAbsentThisOne = activeEntryPointAddresses
    .filter((headerHash) => headerHash !== entryPoint.headerHash)
    .join(',')
  return (
    <div className="active-entry-point">
      <img src="img/door-open.svg" />
      {/* add title because text-overflow: ellipsis */}
      <div
        className="active-entry-point-content"
        title={entryPoint.content}
        onClick={() => goToGoal(entryPoint.goal_address)}
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
  setShowProjectSettingsOpen,
  whoami,
  projectName,
  isExportOpen,
  onClickExport,
  activeEntryPoints,
  goToGoal,
  members,
}) {
  const activeEntryPointAddresses = activeEntryPoints.map(
    (entryPoint) => entryPoint.headerHash
  )
  // in this context, we'd want to display members on the project,
  // except your own self
  // since your own avatar and status is already showing 
  // on top right side of the screen all the time!
  const membersMinusMe = members.filter(
    (member) => member.address !== whoami.entry.address
  )
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
                <ProjectMapViewOnly>
                  {/* @ts-ignore */}
                  <Icon
                    name="map.svg"
                    className="view-mode grey not-hoverable"
                  />
                </ProjectMapViewOnly>
                <ProjectPriorityViewOnly>
                  {/* @ts-ignore */}
                  <Icon
                    name="sort-asc.svg"
                    className="view-mode grey not-hoverable"
                  />
                </ProjectPriorityViewOnly>
                <div className="current-project-name">{projectName}</div>
                <div className="divider-line"></div>
                {/* <div
                className="header-open-project-settings"
                
              > */}
                {/* @ts-ignore */}
                <Icon
                  name="settings.svg"
                  withTooltip
                  tooltipText="Project Settings"
                  size="header"
                  onClick={() => setShowProjectSettingsOpen(true)}
                />
                {/* </div> */}
                <div className="export-wrapper">
                  {/* @ts-ignore */}
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
            {membersMinusMe.length > 0 && <MembersIndicator members={membersMinusMe} />}
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
                goToGoal={goToGoal}
              />
            ))}
          </div>
        </Route>
      )}
    </>
  )
}

export default HeaderLeftPanel
