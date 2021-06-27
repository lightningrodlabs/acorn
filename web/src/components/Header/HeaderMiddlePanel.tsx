import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import priorityMenuItems from './priorityMenuItems'
import { ProjectPriorityViewOnly } from '../ViewFilters/ViewFilters'

function PriorityMenuItem({ exact, title, slug, projectId }) {
  const location = useLocation()
  const contextGoalAddress = new URLSearchParams(location.search).get(
    'contextGoal'
  )
  // don't keep a contextGoal if there isn't currently one
  // but do keep if there is
  const keepContextGoalString = contextGoalAddress
    ? `?contextGoal=${contextGoalAddress}`
    : ``
  return (
    // @ts-ignore
    <NavLink
      exact={exact}
      to={`${slug.replace(':projectId', projectId)}${keepContextGoalString}`}
      className="priority-menu-item"
      activeClassName="active"
    >
      {title}
    </NavLink>
  )
}

function HeaderMiddlePanel({ projectId }) {
  return (
    <div className="header-middle-panel">
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
    </div>
  )
}

export default HeaderMiddlePanel
