import React from 'react'
import { NavLink, Route, Switch, useLocation } from 'react-router-dom'

import ExportMenuItem from '../ExportMenuItem/ExportMenuItem'
import Icon from '../Icon/Icon'
import priorityMenuItems from './priorityMenuItems'
import {
  ProjectPriorityViewOnly,
  ProjectMapViewOnly,
} from '../ViewFilters/ViewFilters'

function ActiveEntryPoint({ entryPoint, activeEntryPointAddresses }) {
  const location = useLocation()
  const entryPointsAbsentThisOne = activeEntryPointAddresses
    .filter((address) => address !== entryPoint.address)
    .join(',')
  return (
    <div className="active-entry-point">
      <img src="img/door-open.svg" />
      {/* add title because text-overflow: ellipsis */}
      <div className="active-entry-point-content" title={entryPoint.content}>
        {entryPoint.content}
      </div>
      {/* @ts-ignore */}
      <NavLink
        to={`${location.pathname}?entryPoints=${entryPointsAbsentThisOne}`}
        className="active-entry-point-close"
      >
        {/* @ts-ignore */}
        <Icon name="x.svg" size="very-small-close" className="grey" />
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
}) {
  const activeEntryPointAddresses = activeEntryPoints.map(
    (entryPoint) => entryPoint.address
  )
  return (
    <div className="header-left-panel">
      {/* @ts-ignore */}
      <NavLink to="/" className="home-link logo">
        {/* @ts-ignore */}
        {/* <Icon name="acorn-logo-stroked.svg" className="not-hoverable" /> */}
        <p className="logo-name">acorn</p>
        <div className="logo-name-tag">alpha</div>
      </NavLink>
      {whoami && (
        <Route path="/project">
          <div className="current-project-wrapper">
            <div className="current-project-content">
              <ProjectMapViewOnly>
                {/* @ts-ignore */}
                <Icon name="map.svg" className="view-mode grey not-hoverable" />
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
          {/* Current Entry Points Tab */}
          {activeEntryPoints.map((entryPoint) => (
            <ActiveEntryPoint
              key={entryPoint.address}
              entryPoint={entryPoint}
              activeEntryPointAddresses={activeEntryPointAddresses}
            />
          ))}
        </Route>
      )}
    </div>
  )
}

export default HeaderLeftPanel
