import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import priorityMenuItems from './priorityMenuItems'
import { ProjectPriorityViewOnly } from '../ViewFilters/ViewFilters'
import { PriorityModeOptions } from '../../constants'

function PriorityMenuItem({ exact, title, slug, projectId }) {
  const location = useLocation()
  const contextOutcomeAddress = new URLSearchParams(location.search).get(
    'contextOutcome'
  )
  // don't keep a contextOutcome if there isn't currently one
  // but do keep if there is
  const keepContextOutcomeString = contextOutcomeAddress
    ? `?contextOutcome=${contextOutcomeAddress}`
    : ``
  return (
    // @ts-ignore
    <NavLink
      exact={exact}
      to={`${slug.replace(':projectId', projectId)}${keepContextOutcomeString}`}
      className="priority-menu-item"
      activeClassName="active"
    >
      {title}
    </NavLink>
  )
}

function HeaderMiddlePanel({ projectId, projectPriorityMode }) {
  return (
    <div className="header-middle-panel">
      {projectPriorityMode === PriorityModeOptions.Vote && (
        <ProjectPriorityViewOnly>
          <div className="priority-menu-wrapper">
            {priorityMenuItems.map(([menuTitle, menuSlugs], index) => {
              return (
                <PriorityMenuItem
                  key={index}
                  exact={index === 0}
                  title={menuTitle}
                  slug={menuSlugs}
                  projectId={projectId}
                />
              )
            })}
          </div>
        </ProjectPriorityViewOnly>
      )}
    </div>
  )
}

export default HeaderMiddlePanel
